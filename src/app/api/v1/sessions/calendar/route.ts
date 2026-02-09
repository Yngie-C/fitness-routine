import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { workout_sessions } from '@/lib/db/schema';
import { eq, and, gte, lte, isNotNull, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '');
    const month = parseInt(searchParams.get('month') || '');

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: { code: 'INVALID_PARAMS', message: 'year와 month가 필요합니다' } }, { status: 400 });
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const results = await db
      .select({
        workout_date: workout_sessions.workout_date,
        count: sql<number>`count(*)::int`,
      })
      .from(workout_sessions)
      .where(
        and(
          eq(workout_sessions.user_id, user.id),
          gte(workout_sessions.workout_date, startDate),
          lte(workout_sessions.workout_date, endDate),
          isNotNull(workout_sessions.completed_at)
        )
      )
      .groupBy(workout_sessions.workout_date);

    const dates: string[] = [];
    const session_counts: Record<string, number> = {};

    for (const row of results) {
      if (row.workout_date) {
        dates.push(row.workout_date);
        session_counts[row.workout_date] = row.count;
      }
    }

    return NextResponse.json({ data: { dates, session_counts } });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } }, { status: 500 });
  }
}
