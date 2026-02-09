import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { workout_sessions, routines } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { RecordDateClient } from './record-date-client';

interface Props {
  params: Promise<{ date: string }>;
}

export default async function RecordDatePage({ params }: Props) {
  const { date } = await params;

  // 날짜 형식 검증
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date) || isNaN(Date.parse(date))) {
    notFound();
  }

  // 미래 날짜 차단
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (new Date(date) > today) {
    redirect('/record');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // 해당 날짜의 기존 세션 조회
  const existingSessions = await db.query.workout_sessions.findMany({
    where: and(
      eq(workout_sessions.user_id, user.id),
      eq(workout_sessions.workout_date, date)
    ),
    with: {
      workout_sets: {
        with: {
          exercise: true,
        },
      },
      routine: true,
    },
  });

  // 사용자 루틴 목록 (프리셋용)
  const userRoutines = await db.query.routines.findMany({
    where: eq(routines.user_id, user.id),
    with: {
      routine_exercises: {
        with: {
          exercise: true,
        },
      },
    },
  });

  const formattedDate = format(parseISO(date), 'yyyy년 M월 d일 (EEEE)', { locale: ko });

  return (
    <RecordDateClient
      date={date}
      formattedDate={formattedDate}
      existingSessions={existingSessions}
      userRoutines={userRoutines}
    />
  );
}
