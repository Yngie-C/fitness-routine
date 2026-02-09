'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_LABELS } from '@/types';
import type { Exercise } from '@/lib/db/types';
import type { ExerciseCategory } from '@/types';
import { toast } from 'sonner';

interface ExerciseSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exercises: Exercise[]) => void;
  selectedExerciseIds?: string[];
}

export function ExerciseSelector({
  open,
  onOpenChange,
  onSelect,
  selectedExerciseIds = [],
}: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedExerciseIds));
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchExercises();
      setSelectedIds(new Set(selectedExerciseIds));
    }
  }, [open]);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchQuery, categoryFilter]);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/exercises?limit=100');
      if (!response.ok) {
        throw new Error('운동 목록을 불러오는데 실패했습니다');
      }
      const data = await response.json();
      setExercises(data.data || []);
    } catch (error) {
      console.error('Fetch exercises error:', error);
      toast.error(error instanceof Error ? error.message : '운동 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((ex) => ex.category === categoryFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name_ko.toLowerCase().includes(query) ||
          ex.name_en?.toLowerCase().includes(query)
      );
    }

    setFilteredExercises(filtered);
  };

  const toggleExercise = (exerciseId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(exerciseId)) {
      newSelectedIds.delete(exerciseId);
    } else {
      newSelectedIds.add(exerciseId);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleConfirm = () => {
    const selected = exercises.filter((ex) => selectedIds.has(ex.id));
    onSelect(selected);
    onOpenChange(false);
  };

  const categories: Array<{ value: ExerciseCategory | 'all'; label: string }> = [
    { value: 'all', label: '전체' },
    ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
      value: value as ExerciseCategory,
      label,
    })),
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>운동 선택</SheetTitle>
          <SheetDescription>루틴에 추가할 운동을 선택하세요</SheetDescription>
        </SheetHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="운동 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as ExerciseCategory | 'all')}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Exercise List */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? '검색 결과가 없습니다' : '운동이 없습니다'}
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {filteredExercises.map((exercise) => {
                const isSelected = selectedIds.has(exercise.id);
                return (
                  <div
                    key={exercise.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => toggleExercise(exercise.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleExercise(exercise.id)}
                      aria-label={`${exercise.name_ko} 선택`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{exercise.name_ko}</div>
                      {exercise.name_en && (
                        <div className="text-xs text-muted-foreground">{exercise.name_en}</div>
                      )}
                      <div className="flex gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {CATEGORY_LABELS[exercise.category]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
            {selectedIds.size > 0 ? `${selectedIds.size}개 추가` : '선택'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
