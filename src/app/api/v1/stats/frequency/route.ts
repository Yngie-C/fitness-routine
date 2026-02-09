import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { workout_sessions } from '@/lib/db/schema';
import { eq, and, gte, lte, isNotNull } from 'drizzle-orm';
import { parseISO, format, startOfWeek, startOfMonth } from 'date-fns';
import type { ApiError } from '@/types';

interface FrequencyDataPoint {
  period: string;
  count: number;
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
    const period = searchParams.get('period') || 'weekly';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'from과 to 파라미터가 필요합니다',
          },
        },
        { status: 400 }
      );
    }

    const fromDate = parseISO(from);
    const toDate = parseISO(to);

    // Get all completed sessions within the date range
    const sessions = await db
      .select({
        completed_at: workout_sessions.completed_at,
      })
      .from(workout_sessions)
      .where(
        and(
          eq(workout_sessions.user_id, user.id),
          isNotNull(workout_sessions.completed_at),
          gte(workout_sessions.completed_at, fromDate.toISOString()),
          lte(workout_sessions.completed_at, toDate.toISOString())
        )
      );

    // Group by period
    const frequencyByPeriod: Map<string, number> = new Map();

    sessions.forEach((session: any) => {
      const date = parseISO(session.completed_at!);
      let periodKey: string;

      if (period === 'weekly') {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        periodKey = format(weekStart, 'yyyy-MM-dd');
      } else {
        // monthly
        const monthStart = startOfMonth(date);
        periodKey = format(monthStart, 'yyyy-MM');
      }

      frequencyByPeriod.set(periodKey, (frequencyByPeriod.get(periodKey) || 0) + 1);
    });

    // Convert to array and sort
    const data: FrequencyDataPoint[] = Array.from(frequencyByPeriod.entries())
      .map(([period, count]) => ({
        period,
        count,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Stats frequency error:', error);
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
