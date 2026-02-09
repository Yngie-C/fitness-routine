import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { routines, routine_exercises } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, asc } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: templateId } = await params;

    // 1. 원본 템플릿 조회
    const [template] = await db
      .select()
      .from(routines)
      .where(eq(routines.id, templateId));

    if (!template || !template.is_template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // 2. 템플릿의 운동 목록 조회
    const templateExercises = await db
      .select()
      .from(routine_exercises)
      .where(eq(routine_exercises.routine_id, templateId))
      .orderBy(asc(routine_exercises.sort_order));

    // 3. 사용자의 현재 루틴 수 (sort_order 계산용)
    const userRoutines = await db
      .select()
      .from(routines)
      .where(eq(routines.user_id, user.id));

    const nextSortOrder = userRoutines.length;

    // 4. 새 루틴 생성 (사용자 소유, is_template=false)
    const [newRoutine] = await db
      .insert(routines)
      .values({
        user_id: user.id,
        name: template.name,
        description: template.description,
        is_template: false,
        sort_order: nextSortOrder,
      })
      .returning();

    // 5. 운동 목록 복사
    if (templateExercises.length > 0) {
      const newExercises = templateExercises.map((ex: typeof templateExercises[number]) => ({
        routine_id: newRoutine.id,
        exercise_id: ex.exercise_id,
        sort_order: ex.sort_order,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        target_weight: ex.target_weight,
        rest_seconds: ex.rest_seconds,
        notes: ex.notes,
      }));

      await db.insert(routine_exercises).values(newExercises);
    }

    return NextResponse.json({ routine: newRoutine }, { status: 201 });
  } catch (error) {
    console.error('Failed to copy template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
