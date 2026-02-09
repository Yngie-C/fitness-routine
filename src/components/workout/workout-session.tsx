'use client';

import { useState, useEffect } from 'react';
import { useWorkoutStore } from '@/stores/workout-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Timer,
} from 'lucide-react';
import { SetInputRow } from './set-input-row';
import { RestTimer } from './rest-timer';
import { PreviousRecord } from './previous-record';
import { useElapsedTime, formatElapsedTime } from '@/hooks/use-elapsed-time';
import { cn } from '@/lib/utils';

interface WorkoutSessionProps {
  sessionId: string;
  onComplete: () => void;
}

export function WorkoutSession({
  sessionId,
  onComplete,
}: WorkoutSessionProps) {
  const {
    activeWorkout,
    addSet,
    nextExercise,
    previousExercise,
    startRestTimer,
  } = useWorkoutStore();

  const [completedSetsCount, setCompletedSetsCount] = useState<Record<number, number>>({});

  const elapsedSeconds = useElapsedTime(
    activeWorkout?.started_at || new Date().toISOString()
  );

  if (!activeWorkout) {
    return null;
  }

  const currentExercise = activeWorkout.exercises[activeWorkout.current_exercise_index];
  const progress = ((activeWorkout.current_exercise_index + 1) / activeWorkout.exercises.length) * 100;

  const exerciseCompletedSets = activeWorkout.completed_sets.filter(
    (set) => set.exercise_id === currentExercise.exercise_id
  ).length;
  const targetSets = currentExercise.target_sets;
  const isExerciseComplete = exerciseCompletedSets >= targetSets;

  const allExercisesComplete = activeWorkout.exercises.every((exercise) => {
    const count = activeWorkout.completed_sets.filter(
      (set) => set.exercise_id === exercise.exercise_id
    ).length;
    return count >= exercise.target_sets;
  });

  const handleSetComplete = async (data: {
    weight_kg: number;
    reps: number;
    is_warmup: boolean;
  }) => {
    const setNumber = exerciseCompletedSets + 1;

    // Add to store
    addSet({
      client_id: crypto.randomUUID(),
      exercise_id: currentExercise.exercise_id,
      set_number: setNumber,
      weight: data.weight_kg,
      reps: data.reps,
      is_warmup: data.is_warmup,
    });

    // Save to API
    try {
      await fetch(`/api/v1/sessions/${sessionId}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_id: currentExercise.exercise_id,
          set_number: setNumber,
          weight_kg: data.weight_kg,
          reps: data.reps,
          is_warmup: data.is_warmup,
        }),
      });
    } catch (error) {
      console.error('Failed to save set:', error);
    }

    // Start rest timer after non-warmup sets
    if (!data.is_warmup) {
      startRestTimer(currentExercise.rest_seconds || 90);
    }
  };

  const handleNextExercise = () => {
    if (activeWorkout.current_exercise_index < activeWorkout.exercises.length - 1) {
      nextExercise();
    }
  };

  const handlePreviousExercise = () => {
    if (activeWorkout.current_exercise_index > 0) {
      previousExercise();
    }
  };

  const getPreviousSetData = (setNumber: number) => {
    const completedSets = activeWorkout.completed_sets.filter(
      (set) => set.exercise_id === currentExercise.exercise_id
    );

    if (setNumber === 1 && completedSets.length === 0) {
      // Use target from routine
      return {
        weight: currentExercise.target_weight,
        reps: currentExercise.target_reps,
      };
    }

    // Use previous set data
    const previousSet = completedSets[setNumber - 2];
    if (previousSet) {
      return {
        weight: previousSet.weight,
        reps: previousSet.reps,
      };
    }

    return {
      weight: currentExercise.target_weight,
      reps: currentExercise.target_reps,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{activeWorkout.routine_name}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>{formatElapsedTime(elapsedSeconds)}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {activeWorkout.current_exercise_index + 1} / {activeWorkout.exercises.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      {/* Current Exercise */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Dumbbell className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">{currentExercise.name}</h2>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          목표: {currentExercise.target_sets}세트 × {currentExercise.target_weight}kg × {currentExercise.target_reps}회
        </div>

        <PreviousRecord
          exerciseId={currentExercise.exercise_id}
          currentSessionId={sessionId}
        />
      </Card>

      {/* Rest Timer */}
      <RestTimer />

      {/* Sets */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          세트 기록 ({exerciseCompletedSets} / {targetSets})
        </h3>

        <div className="space-y-3">
          {Array.from({ length: targetSets }).map((_, index) => {
            const setNumber = index + 1;
            const isCompleted = setNumber <= exerciseCompletedSets;
            const previousData = getPreviousSetData(setNumber);

            return (
              <SetInputRow
                key={setNumber}
                setNumber={setNumber}
                previousWeight={previousData.weight ?? undefined}
                previousReps={previousData.reps ?? undefined}
                isCompleted={isCompleted}
                onComplete={handleSetComplete}
              />
            );
          })}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePreviousExercise}
          disabled={activeWorkout.current_exercise_index === 0}
          className="flex-1 h-14"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          이전 운동
        </Button>

        {allExercisesComplete ? (
          <Button
            size="lg"
            onClick={onComplete}
            className="flex-1 h-14 bg-primary hover:bg-primary/90"
          >
            운동 완료
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            onClick={handleNextExercise}
            disabled={
              !isExerciseComplete ||
              activeWorkout.current_exercise_index >= activeWorkout.exercises.length - 1
            }
            className={cn(
              'flex-1 h-14',
              isExerciseComplete && 'border-primary text-primary'
            )}
          >
            다음 운동
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
