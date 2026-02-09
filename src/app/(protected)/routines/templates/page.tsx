import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { routines, routine_exercises, exercises } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Copy } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export const metadata = {
  title: '루틴 템플릿',
};

async function TemplatesContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch template routines
  const templateRoutines = await db
    .select()
    .from(routines)
    .where(eq(routines.is_template, true))
    .orderBy(asc(routines.sort_order));

  // Fetch exercises for each template
  const templatesWithExercises = await Promise.all(
    templateRoutines.map(async (routine: any) => {
      const routineExercisesList = await db
        .select({
          id: routine_exercises.id,
          exercise: exercises,
        })
        .from(routine_exercises)
        .leftJoin(exercises, eq(routine_exercises.exercise_id, exercises.id))
        .where(eq(routine_exercises.routine_id, routine.id))
        .orderBy(asc(routine_exercises.sort_order));

      return {
        ...routine,
        exercises: routineExercisesList,
      };
    })
  );

  return (
    <div className="container max-w-md mx-auto p-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/routines">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">루틴 템플릿</h1>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">전체</TabsTrigger>
          <TabsTrigger value="beginner" className="flex-1">초보</TabsTrigger>
          <TabsTrigger value="intermediate" className="flex-1">중급</TabsTrigger>
          <TabsTrigger value="advanced" className="flex-1">고급</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {templatesWithExercises.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  사용 가능한 템플릿이 없습니다
                </p>
              </CardContent>
            </Card>
          ) : (
            templatesWithExercises.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))
          )}
        </TabsContent>

        <TabsContent value="beginner">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                초보자용 템플릿은 준비 중입니다
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intermediate">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                중급자용 템플릿은 준비 중입니다
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                고급자용 템플릿은 준비 중입니다
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TemplateCard({
  template,
}: {
  template: {
    id: string;
    name: string;
    description: string | null;
    exercises: Array<{
      id: string;
      exercise: {
        name_ko: string;
      } | null;
    }>;
  };
}) {
  const exerciseCount = template.exercises.length;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
        {template.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {template.description}
          </p>
        )}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">{exerciseCount}개 운동</Badge>
        </div>
        <div className="text-xs text-muted-foreground mb-3">
          {template.exercises
            .slice(0, 3)
            .map((ex) => ex.exercise?.name_ko)
            .filter(Boolean)
            .join(' · ')}
          {exerciseCount > 3 && ` 외 ${exerciseCount - 3}개`}
        </div>
        <Button className="w-full" variant="outline">
          <Copy className="h-4 w-4 mr-2" />
          이 루틴 사용하기
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container max-w-md mx-auto p-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function RoutineTemplatesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TemplatesContent />
    </Suspense>
  );
}
