'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ListChecks, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

interface RoutineCardProps {
  routine: {
    id: string;
    name: string;
    description?: string | null;
    exercises?: Array<{
      id: string;
      exercise: {
        name_ko: string;
      } | null;
    }>;
  };
  onDelete?: () => void;
}

export function RoutineCard({ routine, onDelete }: RoutineCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const exerciseCount = routine.exercises?.length || 0;
  const previewExercises = routine.exercises?.slice(0, 3) || [];

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`"${routine.name}" 루틴을 삭제하시겠습니까?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/v1/routines/${routine.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('루틴 삭제에 실패했습니다');
      }

      toast.success('루틴이 삭제되었습니다');
      onDelete?.();
    } catch (error) {
      console.error('Delete routine error:', error);
      toast.error(error instanceof Error ? error.message : '루틴 삭제에 실패했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/settings/routines/${routine.id}/edit`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/settings/routines/${routine.id}/edit`} className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="h-5 w-5 text-primary flex-shrink-0" />
              <h3 className="font-semibold text-lg truncate">{routine.name}</h3>
            </div>

            {routine.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {routine.description}
              </p>
            )}

            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {exerciseCount}개 운동
              </Badge>
            </div>

            {previewExercises.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {previewExercises
                  .map((ex) => ex.exercise?.name_ko)
                  .filter(Boolean)
                  .join(' · ')}
                {exerciseCount > 3 && ` 외 ${exerciseCount - 3}개`}
              </div>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                aria-label="루틴 메뉴"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? '삭제 중...' : '삭제'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
