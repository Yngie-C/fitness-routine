'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { RoutineExerciseFormData } from '@/lib/validations/routine';

interface RoutineExerciseItemProps {
  exercise: RoutineExerciseFormData & {
    id: string;
    name_ko: string;
  };
  index: number;
  onUpdate: (index: number, field: keyof RoutineExerciseFormData, value: any) => void;
  onRemove: (index: number) => void;
}

export function RoutineExerciseItem({
  exercise,
  index,
  onUpdate,
  onRemove,
}: RoutineExerciseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Drag Handle */}
          <button
            type="button"
            className="touch-none cursor-grab active:cursor-grabbing flex-shrink-0 mt-1"
            {...attributes}
            {...listeners}
            aria-label="운동 순서 변경"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Exercise Content */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{exercise.name_ko}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(index)}
                aria-label={`${exercise.name_ko} 제거`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Target Sets */}
              <div className="space-y-1">
                <Label htmlFor={`exercise-${exercise.id}-sets`} className="text-xs">
                  세트 수
                </Label>
                <Input
                  id={`exercise-${exercise.id}-sets`}
                  type="number"
                  min="1"
                  max="20"
                  value={exercise.target_sets}
                  onChange={(e) => onUpdate(index, 'target_sets', parseInt(e.target.value, 10))}
                  className="h-9"
                />
              </div>

              {/* Target Reps */}
              <div className="space-y-1">
                <Label htmlFor={`exercise-${exercise.id}-reps`} className="text-xs">
                  목표 횟수
                </Label>
                <Input
                  id={`exercise-${exercise.id}-reps`}
                  type="number"
                  min="1"
                  max="100"
                  value={exercise.target_reps}
                  onChange={(e) => onUpdate(index, 'target_reps', parseInt(e.target.value, 10))}
                  className="h-9"
                />
              </div>

              {/* Target Weight */}
              <div className="space-y-1">
                <Label htmlFor={`exercise-${exercise.id}-weight`} className="text-xs">
                  목표 무게 (kg)
                </Label>
                <Input
                  id={`exercise-${exercise.id}-weight`}
                  type="number"
                  min="0"
                  step="0.5"
                  value={exercise.target_weight || ''}
                  onChange={(e) => onUpdate(index, 'target_weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="선택사항"
                  className="h-9"
                />
              </div>

              {/* Rest Seconds */}
              <div className="space-y-1">
                <Label htmlFor={`exercise-${exercise.id}-rest`} className="text-xs">
                  휴식 시간 (초)
                </Label>
                <Input
                  id={`exercise-${exercise.id}-rest`}
                  type="number"
                  min="0"
                  max="600"
                  value={exercise.rest_seconds}
                  onChange={(e) => onUpdate(index, 'rest_seconds', parseInt(e.target.value, 10))}
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
