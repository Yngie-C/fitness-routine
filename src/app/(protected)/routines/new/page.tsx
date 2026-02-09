import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RoutineForm } from '@/components/routines/routine-form';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: '새 루틴 만들기',
};

export default async function NewRoutinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="container max-w-md mx-auto p-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/routines">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">새 루틴 만들기</h1>
      </div>

      <RoutineForm mode="create" />
    </div>
  );
}
