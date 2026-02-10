import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { exercises, routine_exercises, workout_sets } from '@/lib/db/schema';
import { exerciseSchema } from '@/lib/validations/exercise';
import { eq, and } from 'drizzle-orm';
import type { ApiError } from '@/types';
import type { Exercise } from '@/lib/db/types';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// GET /api/v1/exercises/[id] - 단일 운동 조회
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다',
          },
        },
        { status: 401 }
      );
    }

    // 운동 조회
    const [exercise] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, id))
      .limit(1);

    if (!exercise) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'NOT_FOUND',
            message: '운동을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // 커스텀 운동인 경우 권한 확인
    if (exercise.is_custom && exercise.created_by !== user.id) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'FORBIDDEN',
            message: '접근 권한이 없습니다',
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json<Exercise>(exercise);
  } catch (error) {
    console.error('Exercise get error:', error);
    return NextResponse.json<ApiError>(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/exercises/[id] - 운동 수정
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다',
          },
        },
        { status: 401 }
      );
    }

    // 기존 운동 조회
    const [existingExercise] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, id))
      .limit(1);

    if (!existingExercise) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'NOT_FOUND',
            message: '운동을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // 권한 확인 - 커스텀 운동만 수정 가능
    if (!existingExercise.is_custom || existingExercise.created_by !== user.id) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'FORBIDDEN',
            message: '커스텀 운동만 수정할 수 있습니다',
          },
        },
        { status: 403 }
      );
    }

    // 요청 바디 파싱
    const body = await request.json();

    // 검증
    const parseResult = z.safeParse(exerciseSchema.partial(), body);
    if (!parseResult.success) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력값을 확인해주세요',
            details: parseResult.error.issues.map((err: any) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const validatedData = parseResult.data;

    // 운동 수정
    const [updatedExercise] = await db
      .update(exercises)
      .set(validatedData)
      .where(eq(exercises.id, id))
      .returning();

    return NextResponse.json<Exercise>(updatedExercise);
  } catch (error) {
    console.error('Exercise update error:', error);
    return NextResponse.json<ApiError>(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '운동 수정에 실패했습니다',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/exercises/[id] - 운동 삭제
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다',
          },
        },
        { status: 401 }
      );
    }

    // 기존 운동 조회
    const [existingExercise] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, id))
      .limit(1);

    if (!existingExercise) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'NOT_FOUND',
            message: '운동을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // 권한 확인 - 커스텀 운동만 삭제 가능
    if (!existingExercise.is_custom || existingExercise.created_by !== user.id) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'FORBIDDEN',
            message: '커스텀 운동만 삭제할 수 있습니다',
          },
        },
        { status: 403 }
      );
    }

    // workout_sets에서 이 운동을 참조하는지 확인
    const [hasWorkoutSets] = await db
      .select()
      .from(workout_sets)
      .where(eq(workout_sets.exercise_id, id))
      .limit(1);

    if (hasWorkoutSets) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'CONFLICT',
            message: '이 운동에 대한 기록이 있어 삭제할 수 없습니다. 다른 운동으로 병합(merge)해주세요.',
          },
        },
        { status: 409 }
      );
    }

    // routine_exercises 삭제 (이것은 단순 설정이므로 삭제 가능)
    await db.delete(routine_exercises).where(eq(routine_exercises.exercise_id, id));

    // 운동 삭제
    await db.delete(exercises).where(eq(exercises.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Exercise delete error:', error);
    return NextResponse.json<ApiError>(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '운동 삭제에 실패했습니다',
        },
      },
      { status: 500 }
    );
  }
}
