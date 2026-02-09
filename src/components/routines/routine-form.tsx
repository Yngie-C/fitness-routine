'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { ExerciseSelector } from './exercise-selector';
import { RoutineExerciseItem } from './routine-exercise-item';
import { routineSchema } from '@/lib/validations/routine';
import type { RoutineFormData, RoutineExerciseFormData } from '@/lib/validations/routine';
import type { Exercise } from '@/lib/db/types';
import { toast } from 'sonner';

interface RoutineFormProps {
  initialData?: {
    id?: string;
    name: string;
    description?: string | null;
    exercises: Array<{
      exercise_id: string;
      sort_order: number;
      target_sets: number;
      target_reps: number;
      target_weight?: number | null;
      rest_seconds: number;
      exercise: {
        id: string;
        name_ko: string;
      } | null;
    }>;
  };
  mode: 'create' | 'edit';
}

type ExerciseWithMeta = RoutineExerciseFormData & {
  id: string;
  name_ko: string;
};

export function RoutineForm({ initialData, mode }: RoutineFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ name: string; description?: string }>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  const [exercises, setExercises] = useState<ExerciseWithMeta[]>(() => {
    if (!initialData?.exercises) return [];
    return initialData.exercises
      .filter((ex) => ex.exercise)
      .map((ex, index) => ({
        id: `${ex.exercise_id}-${index}`,
        exercise_id: ex.exercise_id,
        name_ko: ex.exercise!.name_ko,
        sort_order: ex.sort_order,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        target_weight: ex.target_weight || undefined,
        rest_seconds: ex.rest_seconds || 90,
      }));
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setExercises((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddExercises = (selectedExercises: Exercise[]) => {
    const newExercises: ExerciseWithMeta[] = selectedExercises
      .filter((ex) => !exercises.some((e) => e.exercise_id === ex.id))
      .map((ex, index) => ({
        id: `${ex.id}-${Date.now()}-${index}`,
        exercise_id: ex.id,
        name_ko: ex.name_ko,
        sort_order: exercises.length + index,
        target_sets: 3,
        target_reps: 10,
        target_weight: undefined,
        rest_seconds: 90,
      }));

    setExercises([...exercises, ...newExercises]);
    toast.success(`${newExercises.length}개 운동이 추가되었습니다`);
  };

  const handleUpdateExercise = (
    index: number,
    field: keyof RoutineExerciseFormData,
    value: any
  ) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (formData: { name: string; description?: string }) => {
    if (exercises.length === 0) {
      toast.error('운동을 하나 이상 추가해주세요');
      return;
    }

    const routineData: RoutineFormData = {
      name: formData.name,
      description: formData.description,
      exercises: exercises.map((ex, index) => ({
        exercise_id: ex.exercise_id,
        sort_order: index,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        target_weight: ex.target_weight,
        rest_seconds: ex.rest_seconds,
      })),
    };

    const validation = z.safeParse(routineSchema, routineData);
    if (!validation.success) {
      toast.error('입력값을 확인해주세요');
      console.error(validation.error);
      return;
    }

    setIsLoading(true);
    try {
      const url =
        mode === 'create'
          ? '/api/v1/routines'
          : `/api/v1/routines/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '루틴 저장에 실패했습니다');
      }

      toast.success(mode === 'create' ? '루틴이 생성되었습니다' : '루틴이 수정되었습니다');
      router.push('/routines');
      router.refresh();
    } catch (error) {
      console.error('Save routine error:', error);
      toast.error(error instanceof Error ? error.message : '루틴 저장에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Routine Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            루틴 이름 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register('name', { required: '루틴 이름을 입력해주세요' })}
            placeholder="예: 상체 루틴"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Routine Description */}
        <div className="space-y-2">
          <Label htmlFor="description">루틴 설명</Label>
          <Input
            id="description"
            {...register('description')}
            placeholder="루틴에 대한 간단한 설명 (선택사항)"
          />
        </div>

        {/* Exercises Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>
              운동 목록 <span className="text-red-500">*</span>
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowExerciseSelector(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              운동 추가
            </Button>
          </div>

          {exercises.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-3">
                  추가된 운동이 없습니다
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowExerciseSelector(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  운동 추가하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={exercises.map((ex) => ex.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {exercises.map((exercise, index) => (
                    <RoutineExerciseItem
                      key={exercise.id}
                      exercise={exercise}
                      index={index}
                      onUpdate={handleUpdateExercise}
                      onRemove={handleRemoveExercise}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
            className="flex-1"
          >
            취소
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? '저장 중...' : mode === 'create' ? '루틴 생성' : '수정 완료'}
          </Button>
        </div>
      </form>

      {/* Exercise Selector Sheet */}
      <ExerciseSelector
        open={showExerciseSelector}
        onOpenChange={setShowExerciseSelector}
        onSelect={handleAddExercises}
        selectedExerciseIds={exercises.map((ex) => ex.exercise_id)}
      />
    </>
  );
}
