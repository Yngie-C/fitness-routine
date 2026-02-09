import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkoutSet {
  client_id: string;
  exercise_id: string;
  set_number: number;
  weight?: number;
  reps: number;
  is_warmup: boolean;
  rpe?: number;
  completed_at?: string;
}

interface ActiveWorkout {
  session_client_id: string;
  routine_id?: string;
  routine_name?: string;
  started_at: string;
  current_exercise_index: number;
  exercises: Array<{
    exercise_id: string;
    name: string;
    target_sets: number;
    target_reps: number;
    target_weight?: number;
    rest_seconds: number;
  }>;
  completed_sets: WorkoutSet[];
}

interface WorkoutState {
  activeWorkout: ActiveWorkout | null;
  restTimer: {
    isRunning: boolean;
    remaining: number;
    total: number;
  };

  // Actions
  startWorkout: (workout: ActiveWorkout) => void;
  addSet: (set: WorkoutSet) => void;
  nextExercise: () => void;
  previousExercise: () => void;
  setCurrentExerciseIndex: (index: number) => void;
  startRestTimer: (seconds: number) => void;
  tickRestTimer: () => void;
  stopRestTimer: () => void;
  completeWorkout: () => void;
  cancelWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      activeWorkout: null,
      restTimer: { isRunning: false, remaining: 0, total: 0 },

      startWorkout: (workout) => set({ activeWorkout: workout }),

      addSet: (newSet) =>
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              completed_sets: [...state.activeWorkout.completed_sets, newSet],
            },
          };
        }),

      nextExercise: () =>
        set((state) => {
          if (!state.activeWorkout) return state;
          const next = Math.min(
            state.activeWorkout.current_exercise_index + 1,
            state.activeWorkout.exercises.length - 1
          );
          return {
            activeWorkout: {
              ...state.activeWorkout,
              current_exercise_index: next,
            },
          };
        }),

      previousExercise: () =>
        set((state) => {
          if (!state.activeWorkout) return state;
          const prev = Math.max(state.activeWorkout.current_exercise_index - 1, 0);
          return {
            activeWorkout: {
              ...state.activeWorkout,
              current_exercise_index: prev,
            },
          };
        }),

      setCurrentExerciseIndex: (index) =>
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: { ...state.activeWorkout, current_exercise_index: index },
          };
        }),

      startRestTimer: (seconds) =>
        set({ restTimer: { isRunning: true, remaining: seconds, total: seconds } }),

      tickRestTimer: () =>
        set((state) => {
          if (state.restTimer.remaining <= 0) {
            return { restTimer: { ...state.restTimer, isRunning: false, remaining: 0 } };
          }
          return {
            restTimer: { ...state.restTimer, remaining: state.restTimer.remaining - 1 },
          };
        }),

      stopRestTimer: () =>
        set({ restTimer: { isRunning: false, remaining: 0, total: 0 } }),

      completeWorkout: () => set({ activeWorkout: null, restTimer: { isRunning: false, remaining: 0, total: 0 } }),

      cancelWorkout: () => set({ activeWorkout: null, restTimer: { isRunning: false, remaining: 0, total: 0 } }),
    }),
    {
      name: 'active-workout',
      partialize: (state) => ({ activeWorkout: state.activeWorkout }),
    }
  )
);
