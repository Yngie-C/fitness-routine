'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, ListChecks } from 'lucide-react';
import { WorkoutLogForm } from '@/components/record/workout-log-form';
import { RoutinePresetSheet } from '@/components/record/routine-preset-sheet';
import { ExerciseSelector } from '@/components/routines/exercise-selector';
import { useRecordStore } from '@/stores/record-store';
import type { Exercise } from '@/lib/db/types';

interface ExerciseData {
  id: string;
  name_ko: string;
  name_en: string | null;
  category: string;
}

interface WorkoutSetData {
  id: string;
  exercise_id: string;
  set_number: number;
  weight: string | null;
  reps: number;
  is_warmup: boolean;
  is_pr: boolean;
  rpe: number | null;
  exercise: ExerciseData;
}

interface SessionData {
  id: string;
  routine_id: string | null;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  total_volume: string | null;
  notes: string | null;
  workout_date: string | null;
  session_type: string | null;
  workout_sets: WorkoutSetData[];
  routine: { name: string } | null;
}

interface RoutineExercise {
  id: string;
  exercise_id: string;
  sort_order: number;
  target_sets: number;
  target_reps: number;
  target_weight: string | null;
  rest_seconds: number | null;
  exercise: ExerciseData;
}

interface RoutineData {
  id: string;
  name: string;
  description: string | null;
  routine_exercises: RoutineExercise[];
}

interface RecordDateClientProps {
  date: string;
  formattedDate: string;
  existingSessions: SessionData[];
  userRoutines: RoutineData[];
}

export function RecordDateClient({ date, formattedDate, existingSessions, userRoutines }: RecordDateClientProps) {
  const router = useRouter();
  const [showRoutineSheet, setShowRoutineSheet] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [isFormActive, setIsFormActive] = useState(false);

  const { exercises, setDate, loadFromRoutine, addExercise, reset } = useRecordStore();

  useEffect(() => {
    // Reset store and set date on mount
    reset();
    setDate(date);
  }, [date, reset, setDate]);

  // Track if form has exercises
  useEffect(() => {
    setIsFormActive(exercises.length > 0);
  }, [exercises]);

  const handleSelectRoutine = (routine: RoutineData) => {
    loadFromRoutine(
      routine.routine_exercises.map((re) => ({
        exercise_id: re.exercise_id,
        name: re.exercise.name_ko,
        target_sets: re.target_sets,
        target_reps: re.target_reps,
        target_weight: re.target_weight,
        rest_seconds: re.rest_seconds,
      }))
    );
  };

  const handleAddExercises = (selected: Exercise[]) => {
    selected.forEach((ex) => {
      addExercise({ exercise_id: ex.id, name: ex.name_ko });
    });
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-6 pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/record')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{formattedDate}</h1>
          <p className="text-sm text-muted-foreground">운동 기록</p>
        </div>
      </div>

      {/* 기존 기록 표시 */}
      {existingSessions.length > 0 && (
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold">기존 기록</h2>
          {existingSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {session.routine?.name || '자유 운동'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {session.workout_sets.length}개 세트 완료
                  {session.total_volume && ` · 총 ${Number(session.total_volume).toLocaleString()}kg`}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 폼이 비활성 상태일 때: 시작 버튼들 */}
      {!isFormActive && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            {existingSessions.length > 0 ? '기록 추가' : '운동 기록하기'}
          </h2>

          {userRoutines.length > 0 && (
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={() => setShowRoutineSheet(true)}
            >
              <ListChecks className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">루틴에서 불러오기</div>
                <div className="text-sm text-muted-foreground">기존 루틴을 기본 템플릿으로 사용</div>
              </div>
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={() => setShowExerciseSelector(true)}
          >
            <Plus className="h-5 w-5 mr-3 text-muted-foreground" />
            <div className="text-left">
              <div className="font-medium">빈 운동 추가</div>
              <div className="text-sm text-muted-foreground">운동을 직접 선택하여 기록</div>
            </div>
          </Button>
        </div>
      )}

      {/* 폼이 활성 상태일 때: WorkoutLogForm */}
      {isFormActive && (
        <WorkoutLogForm date={date} />
      )}

      {/* 루틴 프리셋 Sheet */}
      <RoutinePresetSheet
        open={showRoutineSheet}
        onOpenChange={setShowRoutineSheet}
        routines={userRoutines}
        onSelectRoutine={handleSelectRoutine}
      />

      {/* 운동 선택 Sheet (빈 운동 추가용) */}
      <ExerciseSelector
        open={showExerciseSelector}
        onOpenChange={setShowExerciseSelector}
        onSelect={handleAddExercises}
        selectedExerciseIds={exercises.map((e) => e.exercise_id)}
      />
    </div>
  );
}
