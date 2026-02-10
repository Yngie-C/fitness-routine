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
      <div className="w-8 text-center text-sm font-medium text-muted-foreground shrink-0">
        {setIndex + 1}
      </div>

      <div className="flex-1 flex items-center gap-1">
        <Input
          type="number"
          inputMode="decimal"
          step="2.5"
          value={set.weight ?? ''}
          onChange={(e) => onUpdate({ weight: e.target.value ? parseFloat(e.target.value) : null })}
          placeholder="0"
          className="flex-1 min-w-0 text-center h-9"
        />
        <span className="text-xs text-muted-foreground shrink-0">kg</span>
      </div>

      <div className="flex-1 flex items-center gap-1">
        <Input
          type="number"
          inputMode="numeric"
          value={set.reps || ''}
          onChange={(e) => onUpdate({ reps: parseInt(e.target.value) || 0 })}
          placeholder="0"
          className="flex-1 min-w-0 text-center h-9"
        />
        <span className="text-xs text-muted-foreground shrink-0">회</span>
      </div>

      <div className="w-14 flex items-center justify-center gap-1 shrink-0">
        <Checkbox
          checked={set.is_warmup}
          onCheckedChange={(checked) => onUpdate({ is_warmup: checked === true })}
          className="h-4 w-4"
        />
        <span className="text-xs text-muted-foreground">W</span>
      </div>

      <div className="w-8 shrink-0 flex justify-center">
        {canRemove && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRemove}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
