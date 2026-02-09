import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { db } from '@/lib/db';
import { routines, routine_exercises, exercises } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { routineSchema } from '@/lib/validations/routine';
import { eq, and, asc, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const includeExercises = searchParams.get('include_exercises') === 'true';

    // Fetch user's routines
    const userRoutines = await db
      .select()
      .from(routines)
      .where(
        and(
          eq(routines.user_id, user.id),
          eq(routines.is_template, false)
        )
      )
      .orderBy(asc(routines.sort_order));

    if (!includeExercises) {
      return NextResponse.json({ routines: userRoutines });
    }

    // Fetch with exercises
    const routinesWithExercises = await Promise.all(
      userRoutines.map(async (routine: any) => {
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
            exercise: exercises,
          })
          .from(routine_exercises)
          .leftJoin(exercises, eq(routine_exercises.exercise_id, exercises.id))
          .where(eq(routine_exercises.routine_id, routine.id))
          .orderBy(asc(routine_exercises.sort_order));

        return {
          ...routine,
          exercises: routineExercisesList,
        };
      })
    );

    return NextResponse.json({ routines: routinesWithExercises });
  } catch (error) {
    console.error('Failed to fetch routines:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = z.safeParse(routineSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, description, exercises: exercisesList } = validation.data;

    // Use transaction for atomic operation
    const result = await db.transaction(async (tx: any) => {
      // Get max sort_order for user's routines
      const maxSortResult = await tx
        .select({ maxSort: routines.sort_order })
        .from(routines)
        .where(
          and(
            eq(routines.user_id, user.id),
            eq(routines.is_template, false)
          )
        )
        .orderBy(desc(routines.sort_order))
        .limit(1);

      const nextSortOrder = maxSortResult[0]?.maxSort != null
        ? maxSortResult[0].maxSort + 1
        : 0;

      // Create routine
      const [newRoutine] = await tx
        .insert(routines)
        .values({
          user_id: user.id,
          name,
          description: description || null,
          is_template: false,
          sort_order: nextSortOrder,
        })
        .returning();

      // Create routine exercises
      if (exercisesList && exercisesList.length > 0) {
        await tx.insert(routine_exercises).values(
          exercisesList.map((ex, index) => ({
            routine_id: newRoutine.id,
            exercise_id: ex.exercise_id,
            sort_order: ex.sort_order ?? index,
            target_sets: ex.target_sets,
            target_reps: ex.target_reps,
            target_weight: ex.target_weight ?? null,
            rest_seconds: ex.rest_seconds,
          }))
        );
      }

      return newRoutine;
    });

    return NextResponse.json({ routine: result }, { status: 201 });
  } catch (error) {
    console.error('Failed to create routine:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
