import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { exercises } from '@/lib/db/schema';
import { exerciseSchema, exerciseFilterSchema } from '@/lib/validations/exercise';
import { eq, and, or, ilike, desc, gt } from 'drizzle-orm';
import type { ApiError, PaginatedResponse } from '@/types';
import type { Exercise } from '@/lib/db/types';

// GET /api/v1/exercises - 운동 목록 조회
export async function GET(request: NextRequest) {
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

    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const filterData = {
      category: searchParams.get('category') || undefined,
      equipment: searchParams.get('equipment') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
      cursor: searchParams.get('cursor') || undefined,
    };

    // 검증
    const parseResult = z.safeParse(exerciseFilterSchema, filterData);
    if (!parseResult.success) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '잘못된 요청입니다',
            details: parseResult.error.issues.map((err: any) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const filters = parseResult.data;

    // 쿼리 조건 구성
    const conditions = [];

    // 카테고리 필터
    if (filters.category) {
      conditions.push(eq(exercises.category, filters.category));
    }

    // 장비 필터
    if (filters.equipment) {
      conditions.push(eq(exercises.equipment, filters.equipment));
    }

    // 검색 필터 (name_ko 또는 name_en)
    if (filters.search) {
      conditions.push(
        or(
          ilike(exercises.name_ko, `%${filters.search}%`),
          ilike(exercises.name_en, `%${filters.search}%`)
        )
      );
    }

    // 커서 기반 페이지네이션
    if (filters.cursor) {
      conditions.push(gt(exercises.created_at, filters.cursor));
    }

    // 사용자 커스텀 운동 포함 (is_custom = false OR created_by = user.id)
    conditions.push(
      or(eq(exercises.is_custom, false), eq(exercises.created_by, user.id))
    );

    // 데이터 조회
    const result = await db
      .select()
      .from(exercises)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(exercises.created_at))
      .limit(filters.limit + 1);

    // 다음 커서 확인
    const hasMore = result.length > filters.limit;
    const data = hasMore ? result.slice(0, filters.limit) : result;
    const lastItem = data[data.length - 1];
    const nextCursor: string | undefined = hasMore && lastItem?.created_at ? lastItem.created_at : undefined;

    return NextResponse.json<PaginatedResponse<Exercise>>({
      data,
      next_cursor: nextCursor,
    });
  } catch (error) {
    console.error('Exercise list error:', error);
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

// POST /api/v1/exercises - 커스텀 운동 생성
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
    const parseResult = z.safeParse(exerciseSchema, body);
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

    // 커스텀 운동 생성
    const [newExercise] = await db
      .insert(exercises)
      .values({
        ...validatedData,
        is_custom: true,
        created_by: user.id,
      })
      .returning();

    return NextResponse.json<Exercise>(newExercise, { status: 201 });
  } catch (error) {
    console.error('Exercise creation error:', error);
    return NextResponse.json<ApiError>(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '운동 생성에 실패했습니다',
        },
      },
      { status: 500 }
    );
  }
}
