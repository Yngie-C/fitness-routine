import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RoutineForm } from '@/components/routines/routine-form';
import { TemplatePicker } from '@/components/routines/template-picker';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { routines, routine_exercises, exercises } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export const metadata = {
  title: '새 루틴 만들기',
};

export default async function NewRoutinePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { template: templateId } = await searchParams;

  let templateData = undefined;

  if (templateId) {
    const [template] = await db
      .select()
      .from(routines)
      .where(eq(routines.id, templateId));

    if (template && template.is_template) {
      const templateExercises = await db
        .select({
          exercise_id: routine_exercises.exercise_id,
          sort_order: routine_exercises.sort_order,
          target_sets: routine_exercises.target_sets,
          target_reps: routine_exercises.target_reps,
          target_weight: routine_exercises.target_weight,
          rest_seconds: routine_exercises.rest_seconds,
          exercise: {
            id: exercises.id,
            name_ko: exercises.name_ko,
          },
        })
        .from(routine_exercises)
        .leftJoin(exercises, eq(routine_exercises.exercise_id, exercises.id))
        .where(eq(routine_exercises.routine_id, templateId))
        .orderBy(asc(routine_exercises.sort_order));

      templateData = {
        name: template.name,
        description: template.description,
        exercises: templateExercises,
      };
    }
  }

  return (
    <div className="container max-w-md mx-auto p-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings/routines">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">새 루틴 만들기</h1>
      </div>

      {!templateData && (
        <div className="mb-6">
          <TemplatePicker />
        </div>
      )}
      {templateData && (
        <p className="text-sm text-muted-foreground mb-4">
          📋 템플릿 「{templateData.name}」에서 시작합니다. 자유롭게 수정하세요.
        </p>
      )}

      <RoutineForm mode="create" initialData={templateData} />
    </div>
  );
}
