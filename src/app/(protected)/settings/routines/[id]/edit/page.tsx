import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { routines, routine_exercises, exercises } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { RoutineForm } from '@/components/routines/routine-form';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: '루틴 편집',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRoutinePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch routine
  const [routine] = await db
    .select()
    .from(routines)
    .where(and(eq(routines.id, id), eq(routines.user_id, user.id)));

  if (!routine) {
    notFound();
  }

  // Fetch routine exercises
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

  const routineData = {
    id: routine.id,
    name: routine.name,
    description: routine.description,
    exercises: routineExercisesList,
  };

  return (
    <div className="container max-w-md mx-auto p-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings/routines">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">루틴 편집</h1>
      </div>

      <RoutineForm mode="edit" initialData={routineData} />
    </div>
  );
}
