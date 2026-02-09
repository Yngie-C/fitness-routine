'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Dumbbell, Edit, Trash2 } from 'lucide-react';
import type { Exercise } from '@/lib/db/types';
import { CATEGORY_LABELS, EQUIPMENT_LABELS } from '@/types';
import { toast } from 'sonner';

const CATEGORY_COLORS = {
  chest: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  back: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  shoulders: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  arms: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  legs: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  core: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  cardio: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
};

export default function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/v1/exercises/${id}`);

        if (!response.ok) {
          throw new Error('운동을 불러오는데 실패했습니다');
        }

        const data: Exercise = await response.json();
        setExercise(data);
      } catch (error) {
        console.error('Fetch exercise error:', error);
        toast.error(error instanceof Error ? error.message : '운동을 불러오는데 실패했습니다');
        router.push('/settings/exercises');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [id, router]);

  const handleDelete = async () => {
    if (!exercise) return;

    const confirmed = window.confirm('정말 이 운동을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/v1/exercises/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '운동 삭제에 실패했습니다');
      }

      toast.success('운동이 삭제되었습니다');
      router.push('/settings/exercises');
    } catch (error) {
      console.error('Delete exercise error:', error);
      toast.error(error instanceof Error ? error.message : '운동 삭제에 실패했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto p-4">
        <Button variant="ghost" size="sm" className="mb-4" disabled>
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로
        </Button>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exercise) {
    return null;
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      {/* 헤더 */}
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        뒤로
      </Button>

      {/* 운동 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-xl">{exercise.name_ko}</CardTitle>
              </div>
              {exercise.name_en && (
                <p className="text-sm text-muted-foreground">{exercise.name_en}</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 배지 */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={CATEGORY_COLORS[exercise.category]}>
              {CATEGORY_LABELS[exercise.category]}
            </Badge>
            {exercise.equipment && (
              <Badge variant="outline">{EQUIPMENT_LABELS[exercise.equipment]}</Badge>
            )}
            {exercise.is_custom && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                커스텀
              </Badge>
            )}
          </div>

          {/* 설명 */}
          {exercise.description && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">설명</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {exercise.description}
                </p>
              </div>
            </>
          )}

          {/* 주요 근육 */}
          {exercise.primary_muscles && Array.isArray(exercise.primary_muscles) && exercise.primary_muscles.length > 0 ? (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">주요 근육</h3>
                <div className="flex flex-wrap gap-2">
                  {(exercise.primary_muscles as string[]).map((muscle, index) => (
                    <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {/* 보조 근육 */}
          {exercise.secondary_muscles && Array.isArray(exercise.secondary_muscles) && exercise.secondary_muscles.length > 0 ? (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">보조 근육</h3>
                <div className="flex flex-wrap gap-2">
                  {(exercise.secondary_muscles as string[]).map((muscle, index) => (
                    <Badge key={index} variant="outline">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {/* 커스텀 운동 액션 버튼 */}
          {exercise.is_custom && (
            <>
              <Separator />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" disabled>
                  <Edit className="h-4 w-4 mr-2" />
                  수정
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? '삭제 중...' : '삭제'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
