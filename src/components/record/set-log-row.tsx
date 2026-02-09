'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecordSet } from '@/stores/record-store';

interface SetLogRowProps {
  setIndex: number;
  set: RecordSet;
  onUpdate: (data: Partial<RecordSet>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function SetLogRow({ setIndex, set, onUpdate, onRemove, canRemove }: SetLogRowProps) {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="w-8 text-center text-sm font-medium text-muted-foreground">
        {setIndex + 1}
      </div>

      <Input
        type="number"
        inputMode="decimal"
        step="2.5"
        value={set.weight ?? ''}
        onChange={(e) => onUpdate({ weight: e.target.value ? parseFloat(e.target.value) : null })}
        placeholder="0"
        className="w-20 text-center h-9"
      />
      <span className="text-xs text-muted-foreground">kg</span>

      <Input
        type="number"
        inputMode="numeric"
        value={set.reps || ''}
        onChange={(e) => onUpdate({ reps: parseInt(e.target.value) || 0 })}
        placeholder="0"
        className="w-16 text-center h-9"
      />
      <span className="text-xs text-muted-foreground">회</span>

      <div className="flex items-center gap-1">
        <Checkbox
          checked={set.is_warmup}
          onCheckedChange={(checked) => onUpdate({ is_warmup: checked === true })}
          className="h-4 w-4"
        />
        <span className="text-xs text-muted-foreground">W</span>
      </div>

      {canRemove && (
        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={onRemove}>
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
