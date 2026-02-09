import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { WeeklySummary } from '@/components/dashboard/weekly-summary';
import { TodayRoutine } from '@/components/dashboard/today-routine';
import { RecentWorkouts } from '@/components/dashboard/recent-workouts';
import { Button } from '@/components/ui/button';
import { Dumbbell, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userName = '사용자';
  if (user) {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (profile?.name) {
      userName = profile.name;
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">안녕하세요, {userName}님! 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">
          오늘도 힘차게 운동해볼까요?
        </p>
      </div>

      {/* Weekly Summary */}
      <WeeklySummary />

      {/* Today's Routine */}
      <TodayRoutine />

      {/* Recent Workouts */}
      <RecentWorkouts />

      {/* Empty State - shown via client components when no data */}
    </div>
  );
}
