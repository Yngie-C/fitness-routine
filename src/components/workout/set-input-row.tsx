'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SetInputRowProps {
  setNumber: number;
  previousWeight?: number;
  previousReps?: number;
  isCompleted?: boolean;
  onComplete: (data: {
    weight_kg: number;
    reps: number;
    is_warmup: boolean;
  }) => void;
}

export function SetInputRow({
  setNumber,
  previousWeight,
  previousReps,
  isCompleted = false,
  onComplete,
}: SetInputRowProps) {
  const [weight, setWeight] = useState(previousWeight?.toString() || '');
  const [reps, setReps] = useState(previousReps?.toString() || '');
  const [isWarmup, setIsWarmup] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);

  useEffect(() => {
    if (previousWeight && !weight) {
      setWeight(previousWeight.toString());
    }
    if (previousReps && !reps) {
      setReps(previousReps.toString());
    }
  }, [previousWeight, previousReps, weight, reps]);

  const handleComplete = () => {
    const weightValue = parseFloat(weight);
    const repsValue = parseInt(reps, 10);

    if (isNaN(weightValue) || isNaN(repsValue) || weightValue <= 0 || repsValue <= 0) {
      alert('무게와 횟수를 올바르게 입력해주세요');
      return;
    }

    setCompleted(true);
    onComplete({
      weight_kg: weightValue,
      reps: repsValue,
      is_warmup: isWarmup,
    });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg border transition-colors',
        completed ? 'bg-primary/5 border-primary/20' : 'bg-background border-border'
      )}
    >
      {/* Set number */}
      <div className="flex-shrink-0 w-8 text-center font-medium text-sm">
        {setNumber}
      </div>

      {/* Weight input */}
      <div className="flex-1 min-w-0">
        <Input
          type="number"
          inputMode="decimal"
          step="2.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="60"
          disabled={completed}
          className="text-center h-12 text-base font-medium"
        />
        <div className="text-xs text-muted-foreground text-center mt-1">kg</div>
      </div>

      {/* Reps input */}
      <div className="flex-1 min-w-0">
        <Input
          type="number"
          inputMode="numeric"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="10"
          disabled={completed}
          className="text-center h-12 text-base font-medium"
        />
        <div className="text-xs text-muted-foreground text-center mt-1">회</div>
      </div>

      {/* Warmup checkbox */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <Checkbox
          checked={isWarmup}
          onCheckedChange={(checked) => setIsWarmup(checked === true)}
          disabled={completed}
          className="h-5 w-5"
        />
        <div className="text-xs text-muted-foreground">웜업</div>
      </div>

      {/* Complete button */}
      <Button
        onClick={handleComplete}
        disabled={completed || !weight || !reps}
        size="lg"
        className={cn(
          'flex-shrink-0 h-12 w-12 p-0',
          completed && 'bg-primary/20 hover:bg-primary/20'
        )}
      >
        <Check
          className={cn(
            'h-5 w-5',
            completed && 'text-primary'
          )}
        />
      </Button>
    </div>
  );
}
