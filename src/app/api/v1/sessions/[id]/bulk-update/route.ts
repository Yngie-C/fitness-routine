import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { workout_sessions, workout_sets } from '@/lib/db/schema';
import { z } from 'zod/v4';
import { eq, and } from 'drizzle-orm';
import { sessionBulkUpdateSchema } from '@/lib/validations/workout';

// PUT /api/v1/sessions/[id]/bulk-update - Bulk update session sets
export async function PUT(
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
    const validation = z.safeParse(sessionBulkUpdateSchema, body);

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

    const { exercises, total_volume, notes } = validation.data;

    // Transaction: delete all existing sets, insert new sets, update session metadata
    const updatedSession = await db.transaction(async (tx: any) => {
      // 1. Delete all existing sets
      await tx.delete(workout_sets).where(eq(workout_sets.session_id, sessionId));

      // 2. Insert new sets
      const setsToInsert = exercises.flatMap((exercise) =>
        exercise.sets.map((s) => ({
          session_id: sessionId,
          exercise_id: exercise.exercise_id,
          set_number: s.set_number,
          weight: s.weight != null ? String(s.weight) : null,
          reps: s.reps,
          is_warmup: s.is_warmup ?? false,
          rpe: s.rpe ?? null,
          completed_at: new Date().toISOString(),
          equipment_used: exercise.equipment_used ?? null,
          is_unilateral: exercise.is_unilateral ?? false,
        }))
      );

      if (setsToInsert.length > 0) {
        await tx.insert(workout_sets).values(setsToInsert);
      }

      // 3. Update session metadata (preserve completed_at, started_at)
      const [updated] = await tx
        .update(workout_sessions)
        .set({
          total_volume: String(total_volume),
          notes: notes ?? null,
          updated_at: new Date().toISOString(),
        })
        .where(eq(workout_sessions.id, sessionId))
        .returning();

      return updated;
    });

    return NextResponse.json({ data: updatedSession });
  } catch (error) {
    console.error('Failed to bulk update session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
