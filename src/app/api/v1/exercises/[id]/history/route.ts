import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { workout_sessions, workout_sets } from '@/lib/db/schema';
import { eq, and, desc, ne } from 'drizzle-orm';

// GET /api/v1/exercises/[id]/history - Get exercise workout history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: exerciseId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    const excludeSession = searchParams.get('exclude_session');

    // Build query conditions
    const conditions = [
      eq(workout_sessions.user_id, user.id),
      eq(workout_sets.exercise_id, exerciseId),
    ];

    if (excludeSession) {
      conditions.push(ne(workout_sessions.id, excludeSession));
    }

    // Fetch workout history with sets
    const history = await db
      .select({
        session_id: workout_sessions.id,
        session_date: workout_sessions.started_at,
        set_number: workout_sets.set_number,
        weight: workout_sets.weight,
        reps: workout_sets.reps,
        is_warmup: workout_sets.is_warmup,
      })
      .from(workout_sets)
      .innerJoin(
        workout_sessions,
        eq(workout_sets.session_id, workout_sessions.id)
      )
      .where(and(...conditions))
      .orderBy(desc(workout_sessions.started_at), workout_sets.set_number)
      .limit(limit * 10); // Fetch more to group by session

    // Group by session
    const sessionMap = new Map<
      string,
      {
        session_id: string;
        session_date: string;
        sets: Array<{
          set_number: number;
          weight_kg: number;
          reps: number;
          is_warmup: boolean;
        }>;
      }
    >();

    history.forEach((row: typeof history[0]) => {
      if (!sessionMap.has(row.session_id)) {
        sessionMap.set(row.session_id, {
          session_id: row.session_id,
          session_date: row.session_date,
          sets: [],
        });
      }

      sessionMap.get(row.session_id)!.sets.push({
        set_number: row.set_number,
        weight_kg: row.weight_kg,
        reps: row.reps,
        is_warmup: row.is_warmup,
      });
    });

    const sessions = Array.from(sessionMap.values())
      .slice(0, limit);

    return NextResponse.json({ data: sessions });
  } catch (error) {
    console.error('Failed to fetch exercise history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise history' },
      { status: 500 }
    );
  }
}
