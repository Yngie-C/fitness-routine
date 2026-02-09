import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { workout_sessions, workout_sets } from '@/lib/db/schema';
import { eq, and, desc, isNotNull } from 'drizzle-orm';
import type { ApiError } from '@/types';

interface ExerciseHistorySet {
  set_number: number;
  weight: string | null;
  reps: number;
  is_pr: boolean | null;
}

interface ExerciseHistorySession {
  session_id: string;
  completed_at: string;
  sets: ExerciseHistorySet[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication
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

    const { id: exerciseId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    // Get recent sessions for this exercise
    const recentSets = await db
      .select({
        session_id: workout_sets.session_id,
        completed_at: workout_sessions.completed_at,
        set_number: workout_sets.set_number,
        weight: workout_sets.weight,
        reps: workout_sets.reps,
        is_pr: workout_sets.is_pr,
      })
      .from(workout_sets)
      .innerJoin(workout_sessions, eq(workout_sets.session_id, workout_sessions.id))
      .where(
        and(
          eq(workout_sets.exercise_id, exerciseId),
          eq(workout_sessions.user_id, user.id),
          isNotNull(workout_sessions.completed_at)
        )
      )
      .orderBy(desc(workout_sessions.completed_at))
      .limit(limit * 10); // Get more sets to ensure we have enough sessions

    // Group by session
    const sessionMap: Map<string, ExerciseHistorySession> = new Map();

    recentSets.forEach((set: any) => {
      if (!sessionMap.has(set.session_id)) {
        sessionMap.set(set.session_id, {
          session_id: set.session_id,
          completed_at: set.completed_at!,
          sets: [],
        });
      }
      sessionMap.get(set.session_id)!.sets.push({
        set_number: set.set_number,
        weight: set.weight,
        reps: set.reps,
        is_pr: set.is_pr,
      });
    });

    // Convert to array and take only the requested number of sessions
    const history: ExerciseHistorySession[] = Array.from(sessionMap.values())
      .slice(0, limit)
      .map((session) => ({
        ...session,
        sets: session.sets.sort((a, b) => a.set_number - b.set_number),
      }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Exercise history error:', error);
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
