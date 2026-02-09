import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { routines, routine_exercises, exercises } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, asc } from 'drizzle-orm';

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
    const experienceLevel = searchParams.get('experience_level');

    // Build conditions
    const conditions = [eq(routines.is_template, true)];

    // Filter by experience level if provided
    if (experienceLevel && ['beginner', 'intermediate', 'advanced'].includes(experienceLevel)) {
      // For templates, we could store experience_level in a future schema update
      // For now, just return all templates
    }

    // Fetch template routines
    const templateRoutines = await db
      .select()
      .from(routines)
      .where(and(...conditions))
      .orderBy(asc(routines.sort_order));

    // Fetch with exercises
    const routinesWithExercises = await Promise.all(
      templateRoutines.map(async (routine: any) => {
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
    console.error('Failed to fetch template routines:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
