import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { RoutineList } from '@/components/routines/routine-list';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: '내 루틴',
};

async function RoutinesContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="container max-w-md mx-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">내 루틴</h1>
        <Button asChild size="sm">
          <Link href="/settings/routines/new">
            <Plus className="h-4 w-4 mr-2" />
            새 루틴
          </Link>
        </Button>
      </div>

      <RoutineList />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container max-w-md mx-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function RoutinesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <RoutinesContent />
    </Suspense>
  );
}
