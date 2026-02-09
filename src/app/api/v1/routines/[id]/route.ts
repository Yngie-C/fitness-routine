import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { db } from '@/lib/db';
import { routines, routine_exercises, exercises } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { routineUpdateSchema } from '@/lib/validations/routine';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch routine
    const [routine] = await db
      .select()
      .from(routines)
      .where(
        and(
          eq(routines.id, id),
          eq(routines.user_id, user.id)
        )
      );

    if (!routine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    // Fetch routine exercises with exercise details
    const routineExercisesList = await db
      .select({
        id: routine_exercises.id,
        routine_id: routine_exercises.routine_id,
        exercise_id: routine_exercises.exercise_id,
        sort_order: routine_exercises.sort_order,
        target_sets: routine_exercises.target_sets,
        target_reps: routine_exercises.target_reps,
        target_weight: routine_exercises.target_weight,
        rest_seconds: routine_exercises.rest_seconds,
        notes: routine_exercises.notes,
        exercise: exercises,
      })
      .from(routine_exercises)
      .leftJoin(exercises, eq(routine_exercises.exercise_id, exercises.id))
      .where(eq(routine_exercises.routine_id, id))
      .orderBy(asc(routine_exercises.sort_order));

    return NextResponse.json({
      routine: {
        ...routine,
        exercises: routineExercisesList,
      },
    });
  } catch (error) {
    console.error('Failed to fetch routine:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check routine exists and belongs to user
    const [existingRoutine] = await db
      .select()
      .from(routines)
      .where(
        and(
          eq(routines.id, id),
          eq(routines.user_id, user.id)
        )
      );

    if (!existingRoutine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = z.safeParse(routineUpdateSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, description, exercises: exercisesList } = validation.data;

    // Use transaction for atomic operation
    const result = await db.transaction(async (tx: any) => {
      // Update routine basic info
      const updateData: any = { updated_at: new Date().toISOString() };
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      const [updatedRoutine] = await tx
        .update(routines)
        .set(updateData)
        .where(eq(routines.id, id))
        .returning();

      // Update exercises if provided
      if (exercisesList && exercisesList.length > 0) {
        // Delete existing routine exercises
        await tx
          .delete(routine_exercises)
          .where(eq(routine_exercises.routine_id, id));

        // Insert new routine exercises
        await tx.insert(routine_exercises).values(
          exercisesList.map((ex, index) => ({
            routine_id: id,
            exercise_id: ex.exercise_id,
            sort_order: ex.sort_order ?? index,
            target_sets: ex.target_sets,
            target_reps: ex.target_reps,
            target_weight: ex.target_weight ?? null,
            rest_seconds: ex.rest_seconds ?? 90,
            notes: ex.notes ?? null,
          }))
        );
      }

      return updatedRoutine;
    });

    return NextResponse.json({ routine: result });
  } catch (error) {
    console.error('Failed to update routine:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check routine exists and belongs to user
    const [existingRoutine] = await db
      .select()
      .from(routines)
      .where(
        and(
          eq(routines.id, id),
          eq(routines.user_id, user.id)
        )
      );

    if (!existingRoutine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    // Delete routine (cascade will delete routine_exercises)
    await db.delete(routines).where(eq(routines.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete routine:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
