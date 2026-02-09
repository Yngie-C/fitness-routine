'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exerciseSchema } from '@/lib/validations/exercise';
import { CATEGORY_LABELS, EQUIPMENT_LABELS } from '@/types';
import type { ExerciseCategory, EquipmentType } from '@/types';
import { toast } from 'sonner';

type ExerciseFormData = z.infer<typeof exerciseSchema>;

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddExerciseDialog({ open, onOpenChange, onSuccess }: AddExerciseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExerciseFormData>({
    defaultValues: {
      name_ko: '',
      name_en: '',
      category: 'chest',
      equipment: 'barbell',
      description: '',
      primary_muscles: [],
      secondary_muscles: [],
      icon_name: 'dumbbell',
    },
  });

  const category = watch('category');
  const equipment = watch('equipment');
  const primaryMuscles = watch('primary_muscles') || [];
  const secondaryMuscles = watch('secondary_muscles') || [];

  const [primaryMuscleInput, setPrimaryMuscleInput] = useState('');
  const [secondaryMuscleInput, setSecondaryMuscleInput] = useState('');

  const onSubmit = async (data: ExerciseFormData) => {
    setIsLoading(true);
    try {
      // Zod v4 safeParse 함수 호출 방식
      const parseResult = z.safeParse(exerciseSchema, data);
      if (!parseResult.success) {
        toast.error('입력값을 확인해주세요');
        console.error(parseResult.error);
        return;
      }

      const response = await fetch('/api/v1/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parseResult.data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '운동 추가에 실패했습니다');
      }

      toast.success('커스텀 운동이 추가되었습니다');
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Add exercise error:', error);
      toast.error(error instanceof Error ? error.message : '운동 추가에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const addPrimaryMuscle = () => {
    if (primaryMuscleInput.trim()) {
      setValue('primary_muscles', [...primaryMuscles, primaryMuscleInput.trim()]);
      setPrimaryMuscleInput('');
    }
  };

  const removePrimaryMuscle = (index: number) => {
    setValue(
      'primary_muscles',
      primaryMuscles.filter((_, i) => i !== index)
    );
  };

  const addSecondaryMuscle = () => {
    if (secondaryMuscleInput.trim()) {
      setValue('secondary_muscles', [...secondaryMuscles, secondaryMuscleInput.trim()]);
      setSecondaryMuscleInput('');
    }
  };

  const removeSecondaryMuscle = (index: number) => {
    setValue(
      'secondary_muscles',
      secondaryMuscles.filter((_, i) => i !== index)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>커스텀 운동 추가</DialogTitle>
          <DialogDescription>나만의 운동을 추가해보세요</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 운동 이름 (한글) */}
          <div className="space-y-2">
            <Label htmlFor="name_ko">
              운동 이름 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name_ko"
              {...register('name_ko')}
              placeholder="예: 바벨 벤치 프레스"
              aria-invalid={!!errors.name_ko}
              aria-describedby={errors.name_ko ? 'name_ko-error' : undefined}
            />
            {errors.name_ko && (
              <p id="name_ko-error" className="text-sm text-red-500">
                {errors.name_ko.message}
              </p>
            )}
          </div>

          {/* 운동 이름 (영문) */}
          <div className="space-y-2">
            <Label htmlFor="name_en">운동 이름 (영문)</Label>
            <Input
              id="name_en"
              {...register('name_en')}
              placeholder="예: Barbell Bench Press"
            />
          </div>

          {/* 카테고리 */}
          <div className="space-y-2">
            <Label htmlFor="category">
              카테고리 <span className="text-red-500">*</span>
            </Label>
            <Select value={category} onValueChange={(value) => setValue('category', value as ExerciseCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 장비 */}
          <div className="space-y-2">
            <Label htmlFor="equipment">
              장비 <span className="text-red-500">*</span>
            </Label>
            <Select value={equipment} onValueChange={(value) => setValue('equipment', value as EquipmentType)}>
              <SelectTrigger id="equipment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EQUIPMENT_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="운동에 대한 간단한 설명"
            />
          </div>

          {/* 주요 근육 */}
          <div className="space-y-2">
            <Label htmlFor="primary_muscle_input">
              주요 근육 <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="primary_muscle_input"
                value={primaryMuscleInput}
                onChange={(e) => setPrimaryMuscleInput(e.target.value)}
                placeholder="예: 대흉근"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPrimaryMuscle();
                  }
                }}
              />
              <Button type="button" onClick={addPrimaryMuscle} variant="outline" size="sm">
                추가
              </Button>
            </div>
            {primaryMuscles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {primaryMuscles.map((muscle, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded"
                  >
                    {muscle}
                    <button
                      type="button"
                      onClick={() => removePrimaryMuscle(index)}
                      className="hover:text-destructive"
                      aria-label={`${muscle} 제거`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.primary_muscles && (
              <p className="text-sm text-red-500">{errors.primary_muscles.message}</p>
            )}
          </div>

          {/* 보조 근육 */}
          <div className="space-y-2">
            <Label htmlFor="secondary_muscle_input">보조 근육</Label>
            <div className="flex gap-2">
              <Input
                id="secondary_muscle_input"
                value={secondaryMuscleInput}
                onChange={(e) => setSecondaryMuscleInput(e.target.value)}
                placeholder="예: 삼두근"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSecondaryMuscle();
                  }
                }}
              />
              <Button type="button" onClick={addSecondaryMuscle} variant="outline" size="sm">
                추가
              </Button>
            </div>
            {secondaryMuscles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {secondaryMuscles.map((muscle, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground text-sm rounded"
                  >
                    {muscle}
                    <button
                      type="button"
                      onClick={() => removeSecondaryMuscle(index)}
                      className="hover:text-destructive"
                      aria-label={`${muscle} 제거`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '추가 중...' : '추가하기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
