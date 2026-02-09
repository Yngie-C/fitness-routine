import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { routines, routine_exercises, exercises } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { WorkoutStartClient } from './workout-start-client';

export default async function WorkoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Fetch user's routines with exercises
  const userRoutines = await db.query.routines.findMany({
    where: eq(routines.user_id, user.id),
    orderBy: [desc(routines.updated_at)],
    with: {
      routine_exercises: {
        orderBy: [routine_exercises.sort_order],
        with: {
          exercise: true,
        },
      },
    },
  });

  return <WorkoutStartClient routines={userRoutines} />;
}
