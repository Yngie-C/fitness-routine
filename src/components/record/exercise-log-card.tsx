'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { SetLogRow } from './set-log-row';
import type { RecordExercise, RecordSet } from '@/stores/record-store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ExerciseLogCardProps {
  id: string;
  exercise: RecordExercise;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (setId: string, data: Partial<RecordSet>) => void;
  onRemoveExercise: () => void;
}

export function ExerciseLogCard({
  id,
  exercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onRemoveExercise,
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
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <button
          type="button"
          className="touch-none cursor-grab active:cursor-grabbing flex-shrink-0"
          {...attributes}
          {...listeners}
          aria-label="운동 순서 변경"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="font-semibold">{exercise.name}</div>
          <div className="text-xs text-muted-foreground">{exercise.sets.length}세트</div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onRemoveExercise}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {/* 헤더 */}
        <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground border-b mb-1">
          <div className="w-8 text-center">세트</div>
          <div className="w-20 text-center">무게</div>
          <div className="w-4" />
          <div className="w-16 text-center">횟수</div>
          <div className="w-4" />
          <div className="w-10 text-center">웜업</div>
          <div className="w-7" />
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
