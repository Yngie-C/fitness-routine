'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, GripVertical, Copy } from 'lucide-react';
import { SetLogRow } from './set-log-row';
import type { RecordExercise, RecordSet } from '@/stores/record-store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { EQUIPMENT_LABELS, UNILATERAL_LABELS } from '@/types';

interface ExerciseLogCardProps {
  id: string;
  exercise: RecordExercise;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (setId: string, data: Partial<RecordSet>) => void;
  onRemoveExercise: () => void;
  onDuplicateExercise: () => void;
  onEquipmentChange: (equipment: string) => void;
  onUnilateralToggle: () => void;
}

export function ExerciseLogCard({
  id,
  exercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onRemoveExercise,
  onDuplicateExercise,
  onEquipmentChange,
  onUnilateralToggle,
}: ExerciseLogCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <button
          type="button"
          className="touch-none cursor-grab active:cursor-grabbing shrink-0"
          {...attributes}
          {...listeners}
          aria-label="운동 순서 변경"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="font-semibold truncate">{exercise.name}</span>
          <span className="text-xs text-muted-foreground shrink-0">{exercise.sets.length}세트</span>
        </div>
        <div className="flex items-center gap-0 ml-auto shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onDuplicateExercise} title="운동 복제">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onRemoveExercise} title="운동 삭제">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Equipment & Unilateral options */}
      {((exercise.available_equipment && exercise.available_equipment.length > 1) || exercise.supports_unilateral) && (
        <div className="flex items-center gap-3 px-4 pb-2 flex-wrap">
          {exercise.available_equipment && exercise.available_equipment.length > 1 && (
            <div className="flex items-center gap-1">
              {exercise.available_equipment.map((eq) => (
                <button
                  key={eq}
                  type="button"
                  className={cn(
                    'px-2 py-0.5 text-xs rounded-full border transition-colors',
                    exercise.equipment_used === eq
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                  )}
                  onClick={() => onEquipmentChange(eq)}
                >
                  {EQUIPMENT_LABELS[eq as keyof typeof EQUIPMENT_LABELS] || eq}
                </button>
              ))}
            </div>
          )}
          {exercise.supports_unilateral && (
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={exercise.is_unilateral}
                onCheckedChange={() => onUnilateralToggle()}
                className="h-3.5 w-3.5"
              />
              <span className="text-xs text-muted-foreground">
                {UNILATERAL_LABELS[exercise.category] || '편측'}
              </span>
            </label>
          )}
        </div>
      )}
      <CardContent className="pt-0">
        {/* 헤더 */}
        <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground border-b mb-1">
          <div className="w-8 text-center shrink-0">세트</div>
          <div className="flex-1 text-center">무게(kg)</div>
          <div className="flex-1 text-center">횟수(회)</div>
          <div className="w-14 text-center shrink-0">웜업</div>
          <div className="w-8 shrink-0" />
        </div>

        {/* 세트 목록 */}
        {exercise.sets.map((set, index) => (
          <SetLogRow
            key={set.id}
            setIndex={index}
            set={set}
            onUpdate={(data) => onUpdateSet(set.id, data)}
            onRemove={() => onRemoveSet(set.id)}
            canRemove={exercise.sets.length > 1}
          />
        ))}

        {/* 세트 추가 버튼 */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-muted-foreground"
          onClick={onAddSet}
        >
          <Plus className="h-4 w-4 mr-1" />
          세트 추가
        </Button>
      </CardContent>
    </Card>
  );
}
