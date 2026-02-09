import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { workout_sessions, workout_sets, exercises } from '@/lib/db/schema';
import { z } from 'zod/v4';
import { eq, and } from 'drizzle-orm';
import { sessionCompleteSchema } from '@/lib/validations/workout';

// GET /api/v1/sessions/[id] - Get session details with sets
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

    const { id: sessionId } = await params;

    // Fetch session
    const session = await db.query.workout_sessions.findFirst({
      where: and(
        eq(workout_sessions.id, sessionId),
        eq(workout_sessions.user_id, user.id)
      ),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Fetch sets with exercise info
    const sets = await db
      .select({
        id: workout_sets.id,
        session_id: workout_sets.session_id,
        exercise_id: workout_sets.exercise_id,
        exercise_name: exercises.name_ko,
        set_number: workout_sets.set_number,
        weight: workout_sets.weight,
        reps: workout_sets.reps,
        is_warmup: workout_sets.is_warmup,
        completed_at: workout_sets.completed_at,
      })
      .from(workout_sets)
      .leftJoin(exercises, eq(workout_sets.exercise_id, exercises.id))
      .where(eq(workout_sets.session_id, sessionId))
      .orderBy(workout_sets.set_number);

    return NextResponse.json({
      data: {
        session,
        sets,
      },
    });
  } catch (error) {
    console.error('Failed to fetch session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/sessions/[id] - Update/complete session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = z.safeParse(sessionCompleteSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Verify session ownership
    const session = await db.query.workout_sessions.findFirst({
      where: and(
        eq(workout_sessions.id, sessionId),
        eq(workout_sessions.user_id, user.id)
      ),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const { duration_seconds, total_volume, notes } = validation.data;

    // Update session
    const [updatedSession] = await db
      .update(workout_sessions)
      .set({
        completed_at: new Date(),
        duration_seconds,
        total_volume,
        notes,
        updated_at: new Date(),
      })
      .where(eq(workout_sessions.id, sessionId))
      .returning();

    return NextResponse.json({ data: updatedSession });
  } catch (error) {
    console.error('Failed to update session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/sessions/[id] - Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify session ownership
    const session = await db.query.workout_sessions.findFirst({
      where: and(
        eq(workout_sessions.id, sessionId),
        eq(workout_sessions.user_id, user.id)
      ),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Delete sets first (cascade)
    await db.delete(workout_sets).where(eq(workout_sets.session_id, sessionId));

    // Delete session
    await db.delete(workout_sessions).where(eq(workout_sessions.id, sessionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
