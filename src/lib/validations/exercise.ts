import { z } from 'zod/v4';

export const exerciseSchema = z.object({
  name_ko: z.string().min(1, '운동 이름을 입력해주세요').max(100),
  name_en: z.string().max(100).optional(),
  category: z.enum(['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio']),
  equipment: z.enum(['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'other']),
  description: z.string().max(500).optional(),
  primary_muscles: z.array(z.string()).min(1, '주요 근육을 하나 이상 선택해주세요'),
  secondary_muscles: z.array(z.string()).optional(),
  icon_name: z.string().optional(),
});

export const exerciseFilterSchema = z.object({
  category: z.enum(['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio']).optional(),
  equipment: z.enum(['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'other']).optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
});

export type ExerciseFormData = z.infer<typeof exerciseSchema>;
export type ExerciseFilterData = z.infer<typeof exerciseFilterSchema>;
