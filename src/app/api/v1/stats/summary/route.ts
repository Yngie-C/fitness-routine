import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { workout_sessions, workout_sets } from '@/lib/db/schema';
import { eq, and, gte, lte, isNotNull, desc, sql } from 'drizzle-orm';
import { startOfWeek, endOfWeek, parseISO, format, startOfDay, endOfDay } from 'date-fns';
import type { ApiError } from '@/types';

interface WeeklySummary {
  total_sessions: number;
  total_volume: number;
  workout_days: number;
  streak: number;
}

export async function GET(request: NextRequest) {
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

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const weekParam = searchParams.get('week'); // Format: 2025-W03

    let weekStart: Date;
    let weekEnd: Date;

    if (weekParam) {
      // Parse ISO week format (2025-W03)
      const [year, week] = weekParam.split('-W');
      const firstDayOfYear = new Date(parseInt(year), 0, 1);
      const days = (parseInt(week) - 1) * 7;
      const targetDate = new Date(firstDayOfYear.getTime() + days * 24 * 60 * 60 * 1000);
      weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }); // Monday
      weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });
    } else {
      // Current week
      const now = new Date();
      weekStart = startOfWeek(now, { weekStartsOn: 1 });
      weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    }

    // Get this week's sessions
    const thisWeekSessions = await db
      .select({
        id: workout_sessions.id,
        user_id: workout_sessions.user_id,
        routine_id: workout_sessions.routine_id,
        started_at: workout_sessions.started_at,
        completed_at: workout_sessions.completed_at,
        workout_date: workout_sessions.workout_date,
      })
      .from(workout_sessions)
      .where(
        and(
          eq(workout_sessions.user_id, user.id),
          isNotNull(workout_sessions.completed_at),
          gte(workout_sessions.workout_date, format(weekStart, 'yyyy-MM-dd')),
          lte(workout_sessions.workout_date, format(weekEnd, 'yyyy-MM-dd'))
        )
      );

    // Calculate total volume for this week
    const volumeResult = await db
      .select({
        totalVolume: sql<string>`COALESCE(SUM(CAST(${workout_sets.weight} AS NUMERIC) * ${workout_sets.reps}), 0)`,
      })
      .from(workout_sets)
      .innerJoin(workout_sessions, eq(workout_sets.session_id, workout_sessions.id))
      .where(
        and(
          eq(workout_sessions.user_id, user.id),
          isNotNull(workout_sessions.completed_at),
          gte(workout_sessions.workout_date, format(weekStart, 'yyyy-MM-dd')),
          lte(workout_sessions.workout_date, format(weekEnd, 'yyyy-MM-dd'))
        )
      );

    const totalVolume = parseFloat(volumeResult[0]?.totalVolume || '0');

    // Calculate unique workout days this week
    const uniqueDays = new Set(
      thisWeekSessions.map((session: any) =>
        session.workout_date || format(parseISO(session.completed_at!), 'yyyy-MM-dd')
      )
    );
    const workoutDays = uniqueDays.size;

    // Calculate streak (consecutive workout days from today backwards)
    const allCompletedSessions = await db
      .select({
        completed_at: workout_sessions.completed_at,
        workout_date: workout_sessions.workout_date,
      })
      .from(workout_sessions)
      .where(
        and(
          eq(workout_sessions.user_id, user.id),
          isNotNull(workout_sessions.completed_at)
        )
      )
      .orderBy(desc(workout_sessions.completed_at));

    // Get unique workout dates
    const workoutDates = new Set(
      allCompletedSessions
        .map((s: any) => s.workout_date || format(parseISO(s.completed_at!), 'yyyy-MM-dd'))
    );

    // Calculate streak from today
    let streak = 0;
    const today = new Date();
    let currentDate = startOfDay(today);

    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (workoutDates.has(dateStr)) {
        streak++;
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000); // Go back 1 day
      } else {
        break;
      }
    }

    const summary: WeeklySummary = {
      total_sessions: thisWeekSessions.length,
      total_volume: Math.round(totalVolume),
      workout_days: workoutDays,
      streak,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Stats summary error:', error);
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
