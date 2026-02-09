'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutStore } from '@/stores/workout-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Dumbbell, Play, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Routine {
  id: string;
  name: string;
  description: string | null;
  routine_exercises: Array<{
    exercise: {
      id: string;
      name: string;
    };
    sets: number;
    reps: number | null;
    weight_kg: number | null;
    rest_seconds: number | null;
    order: number;
  }>;
}

interface WorkoutStartClientProps {
  routines: Routine[];
}

export function WorkoutStartClient({ routines }: WorkoutStartClientProps) {
  const router = useRouter();
  const { activeWorkout, startWorkout } = useWorkoutStore();
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [startingRoutineId, setStartingRoutineId] = useState<string | null>(null);

  useEffect(() => {
    // Show resume dialog if there's an incomplete workout
    if (activeWorkout && !(activeWorkout as any).completed_at) {
      setShowResumeDialog(true);
    }
  }, [activeWorkout]);

  const handleStartWorkout = async (routine: Routine) => {
    try {
      setStartingRoutineId(routine.id);

      // Create session via API
      const response = await fetch('/api/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routine_id: routine.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const { data: session } = await response.json();

      // Start workout in store
      startWorkout({
        session_client_id: session.id,
        routine_id: routine.id,
        routine_name: routine.name,
        started_at: new Date().toISOString(),
        current_exercise_index: 0,
        exercises: routine.routine_exercises.map((re) => ({
          exercise_id: re.exercise.id,
          name: re.exercise.name,
          target_sets: re.sets,
          target_reps: re.reps ?? 10,
          target_weight: re.weight_kg ?? undefined,
          rest_seconds: re.rest_seconds ?? 90,
        })),
        completed_sets: [],
      });

      // Navigate to session page
      router.push('/workout/session');
    } catch (error) {
      console.error('Failed to start workout:', error);
      alert('운동을 시작할 수 없습니다. 다시 시도해주세요.');
    } finally {
      setStartingRoutineId(null);
    }
  };

  const handleResumeWorkout = () => {
    router.push('/workout/session');
  };

  const handleCancelResume = () => {
    setShowResumeDialog(false);
  };

  if (routines.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-6">
            <Dumbbell className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-4">아직 루틴이 없어요</h2>
          <p className="text-muted-foreground mb-6">
            운동을 시작하려면 먼저 루틴을 만들어야 합니다.
          </p>
          <Button asChild size="lg">
            <Link href="/routines/new">
              <Dumbbell className="h-5 w-5 mr-2" />
              루틴 만들기
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">운동 시작</h1>
          <p className="text-muted-foreground">
            오늘 진행할 루틴을 선택하세요
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {routines.map((routine) => (
            <Card key={routine.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">{routine.name}</h3>
                {routine.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {routine.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Dumbbell className="h-4 w-4" />
                  <span>{routine.routine_exercises.length}개 운동</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    ~
                    {Math.round(
                      routine.routine_exercises.reduce(
                        (total, re) =>
                          total +
                          re.sets * ((re.rest_seconds || 90) / 60) +
                          re.sets * 0.5,
                        0
                      )
                    )}
                    분
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {routine.routine_exercises.slice(0, 3).map((re) => (
                    <Badge key={re.exercise.id} variant="secondary">
                      {re.exercise.name}
                    </Badge>
                  ))}
                  {routine.routine_exercises.length > 3 && (
                    <Badge variant="outline">
                      +{routine.routine_exercises.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleStartWorkout(routine)}
                disabled={startingRoutineId === routine.id}
                className="w-full"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                {startingRoutineId === routine.id ? '시작 중...' : '운동 시작'}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Resume dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              진행 중인 운동이 있습니다
            </DialogTitle>
            <DialogDescription>
              이전에 완료하지 못한 운동이 있습니다. 이어서 진행하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          {activeWorkout && (
            <div className="py-4">
              <Card className="p-4 bg-muted/50">
                <div className="font-semibold">{activeWorkout.routine_name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {activeWorkout.current_exercise_index + 1} /{' '}
                  {activeWorkout.exercises.length} 운동 진행 중
                </div>
              </Card>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCancelResume} className="w-full sm:w-auto">
              새로 시작
            </Button>
            <Button onClick={handleResumeWorkout} className="w-full sm:w-auto">
              이어하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
