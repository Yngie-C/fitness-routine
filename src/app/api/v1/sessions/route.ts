import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { workout_sessions, routines } from '@/lib/db/schema';
import { z } from 'zod/v4';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { sessionStartSchema } from '@/lib/validations/workout';

// GET /api/v1/sessions - List workout sessions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const cursor = searchParams.get('cursor');

    // Date range filtering
    const conditions = [eq(workout_sessions.user_id, user.id)];
    if (from) {
      conditions.push(gte(workout_sessions.started_at, from));
    }
    if (to) {
      conditions.push(lte(workout_sessions.started_at, to));
    }
    if (cursor) {
      conditions.push(lte(workout_sessions.started_at, cursor));
    }

    const sessions = await db
      .select({
        id: workout_sessions.id,
        routine_id: workout_sessions.routine_id,
        started_at: workout_sessions.started_at,
        completed_at: workout_sessions.completed_at,
        duration_seconds: workout_sessions.duration_seconds,
        total_volume: workout_sessions.total_volume,
        notes: workout_sessions.notes,
        routine: {
          name: routines.name,
        },
      })
      .from(workout_sessions)
      .leftJoin(routines, eq(workout_sessions.routine_id, routines.id))
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(workout_sessions.started_at))
      .limit(limit + 1);

    const hasMore = sessions.length > limit;
    const items = hasMore ? sessions.slice(0, limit) : sessions;
    const nextCursor = hasMore
      ? items[items.length - 1].started_at
      : null;

    // Support both response formats for backward compatibility
    return NextResponse.json({
      sessions: items,
      data: items,
      pagination: {
        hasMore,
        nextCursor,
      },
    });
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/v1/sessions - Create new session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = z.safeParse(sessionStartSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { routine_id } = validation.data;

    // Verify routine ownership
    const routine = await db.query.routines.findFirst({
      where: and(
        eq(routines.id, routine_id),
        eq(routines.user_id, user.id)
      ),
    });

    if (!routine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    // Create session
    const [session] = await db
      .insert(workout_sessions)
      .values({
        user_id: user.id,
        routine_id,
        started_at: new Date(),
      })
      .returning();

    return NextResponse.json({ data: session }, { status: 201 });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
