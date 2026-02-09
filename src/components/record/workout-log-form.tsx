'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ExerciseLogCard } from './exercise-log-card';
import { ExerciseSelector } from '@/components/routines/exercise-selector';
import { useRecordStore } from '@/stores/record-store';
import { useWorkoutStore } from '@/stores/workout-store';
import { Plus, Save, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { Exercise } from '@/lib/db/types';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

interface WorkoutLogFormProps {
  date: string;
}

export function WorkoutLogForm({ date }: WorkoutLogFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  const { activeWorkout } = useWorkoutStore();
  const {
    exercises,
    notes,
    isEditing,
    editingSessionId,
    setNotes,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    reorderExercises,
  } = useRecordStore();

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
      const oldIndex = exercises.findIndex((e) => e.id === active.id);
      const newIndex = exercises.findIndex((e) => e.id === over.id);
      reorderExercises(oldIndex, newIndex);
    }
  };

  const handleAddExercises = (selected: Exercise[]) => {
    selected.forEach((ex) => {
      addExercise({ exercise_id: ex.id, name: ex.name_ko });
    });
  };

  const handleSave = async () => {
    if (exercises.length === 0) {
      toast.error('최소 1개 이상의 운동을 추가하세요');
      return;
    }

    const hasEmptySets = exercises.some((ex) =>
      ex.sets.some((s) => s.reps === 0)
    );
    if (hasEmptySets) {
      toast.error('모든 세트의 횟수를 입력하세요');
      return;
    }

    setIsSaving(true);
    try {
      // Create session
      const sessionRes = await fetch('/api/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workout_date: date,
          session_type: 'manual',
        }),
      });

      if (!sessionRes.ok) {
        throw new Error('세션 생성 실패');
      }

      const { data: session } = await sessionRes.json();

      // Add sets for each exercise
      for (const exercise of exercises) {
        for (let i = 0; i < exercise.sets.length; i++) {
          const s = exercise.sets[i];
          await fetch(`/api/v1/sessions/${session.id}/sets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              exercise_id: exercise.exercise_id,
              set_number: i + 1,
              weight: s.weight,
              reps: s.reps,
              is_warmup: s.is_warmup,
              rpe: s.rpe,
            }),
          });
        }
      }

      // Complete session
      const totalVolume = exercises.reduce((total, ex) => {
        return total + ex.sets.reduce((exTotal, s) => {
          return exTotal + (s.weight || 0) * s.reps;
        }, 0);
      }, 0);

      await fetch(`/api/v1/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed_at: new Date().toISOString(),
          total_volume: totalVolume,
          notes: notes || null,
        }),
      });

      toast.success('운동 기록이 저장되었습니다');
      router.push('/record');
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 실시간 세션 경고 */}
      {activeWorkout && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800 dark:text-yellow-200 flex-1">
            진행 중인 실시간 운동이 있습니다.
          </span>
          <Link href="/workout/session" className="text-sm font-medium text-yellow-700 dark:text-yellow-300 underline">
            이어하기
          </Link>
        </div>
      )}

      {/* 운동 목록 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exercises.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          {exercises.map((exercise) => (
            <ExerciseLogCard
              key={exercise.id}
              id={exercise.id}
              exercise={exercise}
              onAddSet={() => addSet(exercise.id)}
              onRemoveSet={(setId) => removeSet(exercise.id, setId)}
              onUpdateSet={(setId, data) => updateSet(exercise.id, setId, data)}
              onRemoveExercise={() => removeExercise(exercise.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* 운동 추가 */}
      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={() => setShowExerciseSelector(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        운동 추가
      </Button>

      {/* 메모 */}
      {exercises.length > 0 && (
        <div>
          <Textarea
            placeholder="메모 (선택사항)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none"
            rows={2}
          />
        </div>
      )}

      {/* 저장 */}
      {exercises.length > 0 && (
        <Button className="w-full" size="lg" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              운동 기록 저장
            </>
          )}
        </Button>
      )}

      {/* 운동 선택 Sheet */}
      <ExerciseSelector
        open={showExerciseSelector}
        onOpenChange={setShowExerciseSelector}
        onSelect={handleAddExercises}
        selectedExerciseIds={exercises.map((e) => e.exercise_id)}
      />
    </div>
  );
}
