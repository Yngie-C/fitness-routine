'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dumbbell } from 'lucide-react';

interface RoutineExercise {
  id: string;
  exercise_id: string;
  sort_order: number;
  target_sets: number;
  target_reps: number;
  target_weight: string | null;
  rest_seconds: number | null;
  exercise: {
    id: string;
    name_ko: string;
    name_en: string | null;
    category: string;
  };
}

interface RoutineData {
  id: string;
  name: string;
  description: string | null;
  routine_exercises: RoutineExercise[];
}

interface RoutinePresetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routines: RoutineData[];
  onSelectRoutine: (routine: RoutineData) => void;
}

export function RoutinePresetSheet({
  open,
  onOpenChange,
  routines,
  onSelectRoutine,
}: RoutinePresetSheetProps) {
  const handleSelect = (routine: RoutineData) => {
    onSelectRoutine(routine);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>루틴에서 불러오기</SheetTitle>
          <SheetDescription>기본 템플릿으로 사용할 루틴을 선택하세요</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3 pb-4">
            {routines.map((routine) => (
              <Card
                key={routine.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelect(routine)}
              >
                <CardContent className="p-4">
                  <div className="font-semibold mb-1">{routine.name}</div>
                  {routine.description && (
                    <div className="text-sm text-muted-foreground mb-2">{routine.description}</div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Dumbbell className="h-3 w-3" />
                    <span>{routine.routine_exercises.length}개 운동</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {routine.routine_exercises.slice(0, 4).map((re) => (
                      <Badge key={re.id} variant="secondary" className="text-xs">
                        {re.exercise.name_ko}
                      </Badge>
                    ))}
                    {routine.routine_exercises.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{routine.routine_exercises.length - 4}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
