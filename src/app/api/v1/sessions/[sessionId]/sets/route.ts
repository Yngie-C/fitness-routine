import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { workout_sessions, workout_sets } from '@/lib/db/schema';
import { z } from 'zod/v4';
import { eq, and } from 'drizzle-orm';
import { workoutSetSchema } from '@/lib/validations/workout';

// POST /api/v1/sessions/[sessionId]/sets - Add set to session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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

    const body = await request.json();
    const validation = z.safeParse(workoutSetSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { exercise_id, set_number, weight, reps, is_warmup } =
      validation.data;

    // Create set
    const [set] = await db
      .insert(workout_sets)
      .values({
        session_id: sessionId,
        exercise_id,
        set_number,
        weight,
        reps,
        is_warmup,
      })
      .returning();

    return NextResponse.json({ data: set }, { status: 201 });
  } catch (error) {
    console.error('Failed to create set:', error);
    return NextResponse.json(
      { error: 'Failed to create set' },
      { status: 500 }
    );
  }
}
