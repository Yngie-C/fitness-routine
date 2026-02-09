import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { workout_sessions, workout_sets } from '@/lib/db/schema';
import { z } from 'zod/v4';
import { eq, and } from 'drizzle-orm';
import { workoutSetSchema } from '@/lib/validations/workout';

// PATCH /api/v1/sessions/[id]/sets/[setId] - Update set
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; setId: string }> }
) {
  try {
    const { id: sessionId, setId } = await params;
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

    // Verify set belongs to session
    const set = await db.query.workout_sets.findFirst({
      where: and(
        eq(workout_sets.id, setId),
        eq(workout_sets.session_id, sessionId)
      ),
    });

    if (!set) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 });
    }

    const body = await request.json();
    const validation = z.safeParse(
      workoutSetSchema.partial().omit({ exercise_id: true, set_number: true }),
      body
    );

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Update set
    const [updatedSet] = await db
      .update(workout_sets)
      .set({
        ...validation.data,
        updated_at: new Date(),
      })
      .where(eq(workout_sets.id, setId))
      .returning();

    return NextResponse.json({ data: updatedSet });
  } catch (error) {
    console.error('Failed to update set:', error);
    return NextResponse.json(
      { error: 'Failed to update set' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/sessions/[id]/sets/[setId] - Delete set
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; setId: string }> }
) {
  try {
    const { id: sessionId, setId } = await params;
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

    // Verify set belongs to session
    const set = await db.query.workout_sets.findFirst({
      where: and(
        eq(workout_sets.id, setId),
        eq(workout_sets.session_id, sessionId)
      ),
    });

    if (!set) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 });
    }

    // Delete set
    await db.delete(workout_sets).where(eq(workout_sets.id, setId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete set:', error);
    return NextResponse.json(
      { error: 'Failed to delete set' },
      { status: 500 }
    );
  }
}
