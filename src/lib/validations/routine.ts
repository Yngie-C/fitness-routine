import { z } from 'zod/v4';

export const routineExerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  sort_order: z.number().int().min(0),
  target_sets: z.number().int().min(1).max(20),
  target_reps: z.number().int().min(1).max(100),
  target_weight: z.number().min(0).optional(),
  rest_seconds: z.number().int().min(0).max(600).optional().default(90),
  notes: z.string().max(200).optional(),
});

export const routineSchema = z.object({
  name: z.string().min(1, '루틴 이름을 입력해주세요').max(100),
  description: z.string().max(500).optional(),
  exercises: z.array(routineExerciseSchema).min(1, '운동을 하나 이상 추가해주세요'),
});

export const routineUpdateSchema = routineSchema.partial();

export type RoutineFormData = z.infer<typeof routineSchema>;
export type RoutineExerciseFormData = z.infer<typeof routineExerciseSchema>;
