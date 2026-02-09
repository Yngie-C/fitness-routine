'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface PreviousRecordProps {
  exerciseId: string;
  currentSessionId?: string;
}

interface PreviousSet {
  weight_kg: number;
  reps: number;
  is_warmup: boolean;
}

export function PreviousRecord({
  exerciseId,
  currentSessionId,
}: PreviousRecordProps) {
  const [loading, setLoading] = useState(true);
  const [previousSets, setPreviousSets] = useState<PreviousSet[]>([]);

  useEffect(() => {
    async function fetchPreviousRecord() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/v1/exercises/${exerciseId}/history?limit=1&exclude_session=${currentSessionId || ''}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch previous record');
        }

        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setPreviousSets(data.data[0].sets || []);
        }
      } catch (error) {
        console.error('Failed to fetch previous record:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPreviousRecord();
  }, [exerciseId, currentSessionId]);

  if (loading) {
    return (
      <Card className="p-3 bg-muted/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>이전 기록 불러오는 중...</span>
        </div>
      </Card>
    );
  }

  if (previousSets.length === 0) {
    return (
      <Card className="p-3 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          이전 기록이 없습니다 (첫 운동)
        </p>
      </Card>
    );
  }

  const workingSets = previousSets.filter((set) => !set.is_warmup);

  if (workingSets.length === 0) {
    return (
      <Card className="p-3 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          이전 기록이 없습니다
        </p>
      </Card>
    );
  }

  const avgWeight = (
    workingSets.reduce((sum, set) => sum + set.weight_kg, 0) / workingSets.length
  ).toFixed(1);
  const avgReps = Math.round(
    workingSets.reduce((sum, set) => sum + set.reps, 0) / workingSets.length
  );

  return (
    <Card className="p-3 bg-muted/50 border-primary/20">
      <p className="text-sm font-medium text-foreground mb-1">
        지난번 기록
      </p>
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{avgWeight}kg</span> ×{' '}
        <span className="font-semibold text-foreground">{avgReps}회</span>
        {' '}({workingSets.length}세트)
      </p>
    </Card>
  );
}
