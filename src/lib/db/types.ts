import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
  profiles,
  exercises,
  routines,
  routine_exercises,
  workout_sessions,
  workout_sets,
} from './schema';

// Profile types
export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;

// Exercise types
export type Exercise = InferSelectModel<typeof exercises>;
export type NewExercise = InferInsertModel<typeof exercises>;

// Routine types
export type Routine = InferSelectModel<typeof routines>;
export type NewRoutine = InferInsertModel<typeof routines>;

// Routine exercise types
export type RoutineExercise = InferSelectModel<typeof routine_exercises>;
export type NewRoutineExercise = InferInsertModel<typeof routine_exercises>;

// Workout session types
export type WorkoutSession = InferSelectModel<typeof workout_sessions>;
export type NewWorkoutSession = InferInsertModel<typeof workout_sessions>;

// Workout set types
export type WorkoutSet = InferSelectModel<typeof workout_sets>;
export type NewWorkoutSet = InferInsertModel<typeof workout_sets>;
