'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, ChevronRight } from 'lucide-react';
import type { Exercise } from '@/lib/db/types';
import { CATEGORY_LABELS, EQUIPMENT_LABELS } from '@/types';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: (exercise: Exercise) => void;
  selectable?: boolean;
}

const CATEGORY_COLORS = {
  chest: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  back: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  shoulders: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  arms: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  legs: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  core: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  cardio: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
};

export function ExerciseCard({ exercise, onClick, selectable = false }: ExerciseCardProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h3 className="font-semibold text-base truncate">{exercise.name_ko}</h3>
            </div>

            {exercise.name_en && (
              <p className="text-xs text-muted-foreground mb-2 truncate">{exercise.name_en}</p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-2">
              <Badge variant="secondary" className={CATEGORY_COLORS[exercise.category]}>
                {CATEGORY_LABELS[exercise.category]}
              </Badge>
              {exercise.equipment && (
                <Badge variant="outline" className="text-xs">
                  {EQUIPMENT_LABELS[exercise.equipment]}
                </Badge>
              )}
              {exercise.is_custom && (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                  커스텀
                </Badge>
              )}
            </div>

            {exercise.primary_muscles && Array.isArray(exercise.primary_muscles) && exercise.primary_muscles.length > 0 ? (
              <p className="text-xs text-muted-foreground line-clamp-1">
                주요: {(exercise.primary_muscles as string[]).join(', ')}
              </p>
            ) : null}
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
        </div>
      </CardContent>
    </Card>
  );

  if (onClick) {
    return (
      <div
        onClick={() => onClick(exercise)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(exercise);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${exercise.name_ko} 선택`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link href={`/exercises/${exercise.id}`} aria-label={`${exercise.name_ko} 상세보기`}>
      {content}
    </Link>
  );
}
