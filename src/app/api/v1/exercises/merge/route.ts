import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { exercises, routine_exercises, workout_sets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { ApiError } from '@/types';

const mergeSchema = z.object({
  sourceId: z.uuid(),
  targetId: z.uuid(),
});

// POST /api/v1/exercises/merge - 운동 병합
export async function POST(request: NextRequest) {
  try {
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

    // 요청 바디 파싱
    const body = await request.json();

    // 검증
    const parseResult = z.safeParse(mergeSchema, body);
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

    const { sourceId, targetId } = parseResult.data;

    // sourceId와 targetId가 같은지 확인
    if (sourceId === targetId) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '동일한 운동을 병합할 수 없습니다',
          },
        },
        { status: 400 }
      );
    }

    // 두 운동이 모두 존재하는지 확인
    const [sourceExercise] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, sourceId))
      .limit(1);

    const [targetExercise] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, targetId))
      .limit(1);

    if (!sourceExercise) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'NOT_FOUND',
            message: '원본 운동을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    if (!targetExercise) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'NOT_FOUND',
            message: '대상 운동을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // 권한 확인 - 커스텀 운동인 경우에만 병합 가능
    if (sourceExercise.is_custom && sourceExercise.created_by !== user.id) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'FORBIDDEN',
            message: '원본 운동에 대한 권한이 없습니다',
          },
        },
        { status: 403 }
      );
    }

    // 트랜잭션으로 병합 처리
    await db.transaction(async (tx: any) => {
      // 1. routine_exercises 업데이트
      await tx
        .update(routine_exercises)
        .set({ exercise_id: targetId })
        .where(eq(routine_exercises.exercise_id, sourceId));

      // 2. workout_sets 업데이트
      await tx
        .update(workout_sets)
        .set({ exercise_id: targetId })
        .where(eq(workout_sets.exercise_id, sourceId));

      // 3. 원본 운동 삭제
      await tx.delete(exercises).where(eq(exercises.id, sourceId));
    });

    return NextResponse.json({
      merged: true,
      sourceId,
      targetId,
    });
  } catch (error) {
    console.error('Exercise merge error:', error);
    return NextResponse.json<ApiError>(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '운동 병합에 실패했습니다',
        },
      },
      { status: 500 }
    );
  }
}
