import { z } from 'zod/v4';

export const workoutSetSchema = z.object({
  exercise_id: z.string().uuid(),
  set_number: z.number().int().min(1),
  weight: z.number().min(0).optional(),
  reps: z.number().int().min(0).max(999),
  is_warmup: z.boolean().optional().default(false),
  rpe: z.number().int().min(1).max(10).optional(),
  client_id: z.string().uuid(),
});

export const sessionStartSchema = z.object({
  routine_id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
});

export const sessionCompleteSchema = z.object({
  completed_at: z.string().datetime(),
  duration_seconds: z.number().int().min(0),
  total_volume: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export type WorkoutSetFormData = z.infer<typeof workoutSetSchema>;
export type SessionStartData = z.infer<typeof sessionStartSchema>;
export type SessionCompleteData = z.infer<typeof sessionCompleteSchema>;
