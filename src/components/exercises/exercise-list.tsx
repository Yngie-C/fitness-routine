'use client';

import { ExerciseCard } from './exercise-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';
import type { Exercise } from '@/lib/db/types';

interface ExerciseListProps {
  exercises: Exercise[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onExerciseClick?: (exercise: Exercise) => void;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
}

export function ExerciseList({
  exercises,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onExerciseClick,
  emptyMessage = '운동이 없습니다',
  emptyAction,
}: ExerciseListProps) {
  // 로딩 스켈레톤
  if (isLoading && exercises.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (!isLoading && exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Dumbbell className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
        {emptyAction && (
          <Button onClick={emptyAction.onClick} variant="outline" className="mt-4">
            {emptyAction.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onClick={onExerciseClick}
          selectable={!!onExerciseClick}
        />
      ))}

      {/* 더보기 버튼 */}
      {hasMore && onLoadMore && (
        <div className="pt-4">
          <Button
            onClick={onLoadMore}
            variant="outline"
            className="w-full"
            disabled={isLoading}
            aria-label="더 많은 운동 불러오기"
          >
            {isLoading ? '로딩 중...' : '더보기'}
          </Button>
        </div>
      )}

      {/* 로딩 추가 스켈레톤 */}
      {isLoading && exercises.length > 0 && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
