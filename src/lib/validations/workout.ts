import { z } from 'zod/v4';

export const workoutSetSchema = z.object({
  exercise_id: z.string().uuid(),
  set_number: z.number().int().min(1),
  weight: z.number().min(0).optional().nullable(),
  reps: z.number().int().min(0).max(999),
  is_warmup: z.boolean().optional().default(false),
  rpe: z.number().int().min(1).max(10).optional().nullable(),
  equipment_used: z.enum(['barbell','dumbbell','machine','cable','bodyweight','other']).optional().nullable(),
  is_unilateral: z.boolean().optional().default(false),
});

export const sessionStartSchema = z.object({
  routine_id: z.string().uuid().optional(),
  workout_date: z.string().optional(),
  session_type: z.enum(['realtime', 'manual']).default('realtime'),
});

export const sessionCompleteSchema = z.object({
  duration_seconds: z.number().int().min(0).optional(),
  total_volume: z.number().min(0).optional(),
  notes: z.string().max(500).optional().nullable(),
  completed_at: z.string().optional(),
});

export const sessionBulkUpdateSchema = z.object({
  exercises: z.array(z.object({
    exercise_id: z.string().uuid(),
    equipment_used: z.enum(['barbell','dumbbell','machine','cable','bodyweight','other']).optional().nullable(),
    is_unilateral: z.boolean().optional().default(false),
    sets: z.array(z.object({
      set_number: z.number().int().min(1),
      weight: z.number().min(0).optional().nullable(),
      reps: z.number().int().min(0).max(999),
      is_warmup: z.boolean().optional().default(false),
      rpe: z.number().int().min(1).max(10).optional().nullable(),
    })),
  })),
  total_volume: z.number().min(0),
  notes: z.string().max(500).optional().nullable(),
});

export type WorkoutSetFormData = z.infer<typeof workoutSetSchema>;
export type SessionStartData = z.infer<typeof sessionStartSchema>;
export type SessionCompleteData = z.infer<typeof sessionCompleteSchema>;
export type SessionBulkUpdateData = z.infer<typeof sessionBulkUpdateSchema>;
