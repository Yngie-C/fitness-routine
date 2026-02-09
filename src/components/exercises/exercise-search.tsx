'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import type { ExerciseCategory } from '@/types';
import { CATEGORY_LABELS } from '@/types';

interface ExerciseSearchProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: ExerciseCategory | 'all') => void;
  defaultCategory?: ExerciseCategory | 'all';
}

const categories: Array<ExerciseCategory | 'all'> = [
  'all',
  'chest',
  'back',
  'shoulders',
  'arms',
  'legs',
  'core',
  'cardio',
];

const categoryLabels: Record<ExerciseCategory | 'all', string> = {
  all: '전체',
  ...CATEGORY_LABELS,
};

export function ExerciseSearch({
  onSearchChange,
  onCategoryChange,
  defaultCategory = 'all',
}: ExerciseSearchProps) {
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>(defaultCategory);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, onSearchChange]);

  const handleCategoryChange = (value: string) => {
    const category = value as ExerciseCategory | 'all';
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  return (
    <div className="space-y-4">
      {/* 검색 입력 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="운동 이름으로 검색..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
          aria-label="운동 검색"
        />
      </div>

      {/* 카테고리 탭 */}
      <ScrollArea className="w-full">
        <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full">
          <TabsList className="inline-flex w-max">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="whitespace-nowrap">
                {categoryLabels[category]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </ScrollArea>
    </div>
  );
}
