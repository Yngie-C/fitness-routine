'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutStore } from '@/stores/workout-store';
import { WorkoutSession } from '@/components/workout/workout-session';
import { WorkoutSummary } from '@/components/workout/workout-summary';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function WorkoutSessionPage() {
  const router = useRouter();
  const { activeWorkout, completeWorkout } = useWorkoutStore();
  const [showSummary, setShowSummary] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeWorkout) {
      router.push('/record');
      return;
    }

    setSessionId(activeWorkout.session_client_id);
  }, [activeWorkout, router]);

  if (!activeWorkout || !sessionId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">운동 세션 로딩 중...</p>
        </Card>
      </div>
    );
  }

  const handleComplete = () => {
    setShowSummary(true);
  };

  const handleSaveSummary = async (notes: string) => {
    try {
      const startedAt = new Date(activeWorkout.started_at);
      const completedAt = new Date();
      const durationSeconds = Math.floor(
        (completedAt.getTime() - startedAt.getTime()) / 1000
      );

      // Calculate total volume
      const totalVolume = activeWorkout.completed_sets
        .filter((set) => !set.is_warmup)
        .reduce((sum, set) => sum + (set.weight ?? 0) * set.reps, 0);

      // Complete session via API
      const response = await fetch(`/api/v1/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration_seconds: durationSeconds,
          total_volume: totalVolume,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }

      // Clear workout from store
      completeWorkout();
    } catch (error) {
      console.error('Failed to save workout:', error);
      throw error;
    }
  };

  const getSummaryData = () => {
    const exercisesMap = new Map<
      string,
      {
        name: string;
        sets: Array<{
          weight_kg: number;
          reps: number;
          is_warmup: boolean;
        }>;
      }
    >();

    activeWorkout.completed_sets.forEach((set) => {
      const exercise = activeWorkout.exercises.find(
        (e) => e.exercise_id === set.exercise_id
      );

      if (!exercise) return;

      if (!exercisesMap.has(set.exercise_id)) {
        exercisesMap.set(set.exercise_id, {
          name: exercise.name,
          sets: [],
        });
      }

      exercisesMap.get(set.exercise_id)!.sets.push({
        weight_kg: set.weight ?? 0,
        reps: set.reps,
        is_warmup: set.is_warmup,
      });
    });

    return Array.from(exercisesMap.values());
  };

  const durationSeconds = Math.floor(
    (Date.now() - new Date(activeWorkout.started_at).getTime()) / 1000
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {showSummary ? (
        <WorkoutSummary
          sessionId={sessionId}
          routineName={activeWorkout.routine_name || '운동 세션'}
          durationSeconds={durationSeconds}
          exercises={getSummaryData()}
          onSave={handleSaveSummary}
        />
      ) : (
        <WorkoutSession sessionId={sessionId} onComplete={handleComplete} />
      )}
    </div>
  );
}
