'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExerciseSearch } from '@/components/exercises/exercise-search';
import { ExerciseList } from '@/components/exercises/exercise-list';
import { AddExerciseDialog } from '@/components/exercises/add-exercise-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Exercise } from '@/lib/db/types';
import type { ExerciseCategory, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all');
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchExercises = useCallback(
    async (loadMore = false) => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams();
        if (category !== 'all') {
          params.set('category', category);
        }
        if (search) {
          params.set('search', search);
        }
        if (loadMore && nextCursor) {
          params.set('cursor', nextCursor);
        }

        const response = await fetch(`/api/v1/exercises?${params.toString()}`);

        if (!response.ok) {
          throw new Error('운동 목록을 불러오는데 실패했습니다');
        }

        const data: PaginatedResponse<Exercise> = await response.json();

        if (loadMore) {
          setExercises((prev) => [...prev, ...data.data]);
        } else {
          setExercises(data.data);
        }

        setNextCursor(data.next_cursor);
      } catch (error) {
        console.error('Fetch exercises error:', error);
        toast.error(error instanceof Error ? error.message : '운동 목록을 불러오는데 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    },
    [search, category, nextCursor]
  );

  useEffect(() => {
    fetchExercises();
  }, [search, category]);

  const handleLoadMore = () => {
    if (nextCursor && !isLoading) {
      fetchExercises(true);
    }
  };

  const handleDialogSuccess = () => {
    fetchExercises();
  };

  return (
    <div className="container max-w-md mx-auto p-4 pb-20">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">운동 라이브러리</h1>
        <p className="text-sm text-muted-foreground">운동을 검색하고 나만의 운동을 추가하세요</p>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6">
        <ExerciseSearch
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          defaultCategory={category}
        />
      </div>

      {/* 운동 목록 */}
      <ExerciseList
        exercises={exercises}
        isLoading={isLoading}
        hasMore={!!nextCursor}
        onLoadMore={handleLoadMore}
        emptyMessage={
          search
            ? '검색 결과가 없어요. 직접 운동을 추가해보세요!'
            : '운동이 없습니다. 운동을 추가해주세요.'
        }
        emptyAction={{
          label: '커스텀 운동 추가',
          onClick: () => setIsDialogOpen(true),
        }}
      />

      {/* FAB (Floating Action Button) */}
      <Button
        size="lg"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsDialogOpen(true)}
        aria-label="커스텀 운동 추가"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* 커스텀 운동 추가 다이얼로그 */}
      <AddExerciseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
