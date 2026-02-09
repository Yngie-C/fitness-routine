import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  jsonb,
} from 'drizzle-orm/pg-core';

// Profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(),
  name: text('name'),
  avatar_url: text('avatar_url'),
  weight_unit: text('weight_unit', { enum: ['kg', 'lb'] }).default('kg'),
  language: text('language', { enum: ['ko', 'en'] }).default('ko'),
  experience_level: text('experience_level', {
    enum: ['beginner', 'intermediate', 'advanced'],
  }),
  onboarding_completed: boolean('onboarding_completed').default(false),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

// Exercises table
export const exercises = pgTable('exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  name_ko: text('name_ko').notNull(),
  name_en: text('name_en'),
  category: text('category', {
    enum: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'],
  }).notNull(),
  equipment: text('equipment', {
    enum: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'other'],
  }),
  description: text('description'),
  primary_muscles: jsonb('primary_muscles'),
  secondary_muscles: jsonb('secondary_muscles'),
  icon_name: text('icon_name'),
  is_custom: boolean('is_custom').default(false),
  created_by: uuid('created_by').references(() => profiles.id),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

// Routines table
export const routines = pgTable('routines', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .references(() => profiles.id)
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  is_template: boolean('is_template').default(false),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

// Routine exercises table
export const routine_exercises = pgTable('routine_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  routine_id: uuid('routine_id')
    .references(() => routines.id, { onDelete: 'cascade' })
    .notNull(),
  exercise_id: uuid('exercise_id')
    .references(() => exercises.id)
    .notNull(),
  sort_order: integer('sort_order').notNull(),
  target_sets: integer('target_sets').notNull(),
  target_reps: integer('target_reps').notNull(),
  target_weight: numeric('target_weight'),
  rest_seconds: integer('rest_seconds').default(90),
  notes: text('notes'),
});

// Workout sessions table
export const workout_sessions = pgTable('workout_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .references(() => profiles.id)
    .notNull(),
  routine_id: uuid('routine_id').references(() => routines.id),
  started_at: timestamp('started_at', { withTimezone: true, mode: 'string' }).notNull(),
  completed_at: timestamp('completed_at', { withTimezone: true, mode: 'string' }),
  duration_seconds: integer('duration_seconds'),
  total_volume: numeric('total_volume'),
  notes: text('notes'),
  sync_status: text('sync_status').default('synced'),
  client_id: uuid('client_id').unique(),
  client_updated_at: timestamp('client_updated_at', { withTimezone: true, mode: 'string' }),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

// Workout sets table
export const workout_sets = pgTable('workout_sets', {
  id: uuid('id').primaryKey().defaultRandom(),
  session_id: uuid('session_id')
    .references(() => workout_sessions.id, { onDelete: 'cascade' })
    .notNull(),
  exercise_id: uuid('exercise_id')
    .references(() => exercises.id)
    .notNull(),
  set_number: integer('set_number').notNull(),
  weight: numeric('weight'),
  reps: integer('reps').notNull(),
  is_warmup: boolean('is_warmup').default(false),
  is_pr: boolean('is_pr').default(false),
  rpe: integer('rpe'),
  sync_status: text('sync_status').default('synced'),
  client_id: uuid('client_id').unique(),
  client_updated_at: timestamp('client_updated_at', { withTimezone: true, mode: 'string' }),
  completed_at: timestamp('completed_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  routines: many(routines),
  workout_sessions: many(workout_sessions),
  custom_exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  created_by_profile: one(profiles, {
    fields: [exercises.created_by],
    references: [profiles.id],
  }),
  routine_exercises: many(routine_exercises),
  workout_sets: many(workout_sets),
}));

export const routinesRelations = relations(routines, ({ one, many }) => ({
  user: one(profiles, {
    fields: [routines.user_id],
    references: [profiles.id],
  }),
  routine_exercises: many(routine_exercises),
  workout_sessions: many(workout_sessions),
}));

export const routine_exercisesRelations = relations(routine_exercises, ({ one }) => ({
  routine: one(routines, {
    fields: [routine_exercises.routine_id],
    references: [routines.id],
  }),
  exercise: one(exercises, {
    fields: [routine_exercises.exercise_id],
    references: [exercises.id],
  }),
}));

export const workout_sessionsRelations = relations(workout_sessions, ({ one, many }) => ({
  user: one(profiles, {
    fields: [workout_sessions.user_id],
    references: [profiles.id],
  }),
  routine: one(routines, {
    fields: [workout_sessions.routine_id],
    references: [routines.id],
  }),
  workout_sets: many(workout_sets),
}));

export const workout_setsRelations = relations(workout_sets, ({ one }) => ({
  session: one(workout_sessions, {
    fields: [workout_sets.session_id],
    references: [workout_sessions.id],
  }),
  exercise: one(exercises, {
    fields: [workout_sets.exercise_id],
    references: [exercises.id],
  }),
}));
