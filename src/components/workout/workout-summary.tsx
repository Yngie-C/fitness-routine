'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Dumbbell } from 'lucide-react';
import { formatElapsedTime } from '@/hooks/use-elapsed-time';

interface WorkoutSummaryProps {
  sessionId: string;
  routineName: string;
  durationSeconds: number;
  exercises: Array<{
    name: string;
    sets: Array<{
      weight_kg: number;
      reps: number;
      is_warmup: boolean;
    }>;
  }>;
  onSave: (notes: string) => Promise<void>;
}

export function WorkoutSummary({
  sessionId,
  routineName,
  durationSeconds,
  exercises,
  onSave,
}: WorkoutSummaryProps) {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const totalVolume = Math.round(
    exercises.reduce(
      (total, exercise) =>
        total +
        exercise.sets
          .filter((set) => !set.is_warmup)
          .reduce((sum, set) => sum + set.weight_kg * set.reps, 0),
      0
    )
  );

  const totalSets = exercises.reduce(
    (total, exercise) =>
      total + exercise.sets.filter((set) => !set.is_warmup).length,
    0
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(notes);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save workout:', error);
      alert('운동 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success message */}
      <Card className="p-8 text-center bg-primary/5 border-primary/20">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">운동 완료!</h2>
        <p className="text-muted-foreground">
          {routineName} 루틴을 완료했습니다
        </p>
      </Card>

      {/* Summary stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          운동 요약
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {formatElapsedTime(durationSeconds)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">총 시간</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {totalVolume.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">총 볼륨 (kg)</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalSets}</div>
            <div className="text-sm text-muted-foreground mt-1">총 세트</div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Exercise breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            운동별 기록
          </h4>
          {exercises.map((exercise, index) => {
            const workingSets = exercise.sets.filter((set) => !set.is_warmup);
            const avgWeight =
              workingSets.length > 0
                ? (
                    workingSets.reduce((sum, set) => sum + set.weight_kg, 0) /
                    workingSets.length
                  ).toFixed(1)
                : 0;
            const avgReps =
              workingSets.length > 0
                ? Math.round(
                    workingSets.reduce((sum, set) => sum + set.reps, 0) /
                      workingSets.length
                  )
                : 0;
            const volume = workingSets.reduce(
              (sum, set) => sum + set.weight_kg * set.reps,
              0
            );

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <div className="font-medium">{exercise.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {workingSets.length}세트 · {avgWeight}kg × {avgReps}회
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {volume.toLocaleString()} kg
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">운동 메모 (선택)</h3>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="오늘 운동은 어땠나요? 특별한 사항을 기록해보세요."
          rows={4}
          className="resize-none"
        />
      </Card>

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        size="lg"
        className="w-full h-14 text-lg"
      >
        {saving ? '저장 중...' : '저장하고 대시보드로'}
      </Button>
    </div>
  );
}
