import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface RecordSet {
  id: string;
  weight: number | null;
  reps: number;
  is_warmup: boolean;
  rpe: number | null;
}

export interface RecordExercise {
  id: string; // client-side ID
  exercise_id: string;
  name: string;
  sets: RecordSet[];
  rest_seconds: number;
  // Equipment & Unilateral (persisted to DB per set)
  equipment_used: string | null;
  is_unilateral: boolean;
  // UI-only metadata (from exercises table, not persisted)
  available_equipment: string[] | null;
  supports_unilateral: boolean;
  category: string;
}

interface RecordState {
  exercises: RecordExercise[];
  selectedDate: string | null;
  notes: string;
  isEditing: boolean;
  editingSessionId: string | null;

  // Actions
  setDate: (date: string) => void;
  setNotes: (notes: string) => void;

  // Load from routine preset
  loadFromRoutine: (routineExercises: Array<{
    exercise_id: string;
    name: string;
    target_sets: number;
    target_reps: number;
    target_weight: string | null;
    rest_seconds: number | null;
    available_equipment?: string[] | null;
    default_equipment?: string | null;
    supports_unilateral?: boolean;
    default_unilateral?: boolean;
    category?: string;
  }>) => void;

  // Exercise management
  addExercise: (exercise: {
    exercise_id: string;
    name: string;
    available_equipment?: string[] | null;
    default_equipment?: string | null;
    supports_unilateral?: boolean;
    default_unilateral?: boolean;
    category?: string;
  }) => void;
  removeExercise: (exerciseClientId: string) => void;
  reorderExercises: (oldIndex: number, newIndex: number) => void;

  // Set management
  addSet: (exerciseClientId: string) => void;
  removeSet: (exerciseClientId: string, setId: string) => void;
  updateSet: (exerciseClientId: string, setId: string, data: Partial<RecordSet>) => void;
  updateExerciseEquipment: (exerciseClientId: string, equipment: string) => void;
  toggleExerciseUnilateral: (exerciseClientId: string) => void;

  // Edit existing session
  loadFromSession: (session: {
    id: string;
    notes: string | null;
    exercises: Array<{
      exercise_id: string;
      name: string;
      equipment_used?: string | null;
      is_unilateral?: boolean;
      available_equipment?: string[] | null;
      supports_unilateral?: boolean;
      category?: string;
      sets: Array<{
        weight: number | null;
        reps: number;
        is_warmup: boolean;
        rpe: number | null;
      }>;
    }>;
  }) => void;

  // Reset
  reset: () => void;
}

export const useRecordStore = create<RecordState>()((set) => ({
  exercises: [],
  selectedDate: null,
  notes: '',
  isEditing: false,
  editingSessionId: null,

  setDate: (date) => set({ selectedDate: date }),
  setNotes: (notes) => set({ notes }),

  loadFromRoutine: (routineExercises) =>
    set({
      exercises: routineExercises.map((re) => ({
        id: uuidv4(),
        exercise_id: re.exercise_id,
        name: re.name,
        rest_seconds: re.rest_seconds ?? 90,
        equipment_used: re.default_equipment ?? null,
        is_unilateral: re.default_unilateral ?? false,
        available_equipment: re.available_equipment ?? null,
        supports_unilateral: re.supports_unilateral ?? false,
        category: re.category ?? '',
        sets: Array.from({ length: re.target_sets }, (_, i) => ({
          id: uuidv4(),
          weight: re.target_weight ? parseFloat(re.target_weight) : null,
          reps: re.target_reps,
          is_warmup: false,
          rpe: null,
        })),
      })),
      isEditing: false,
      editingSessionId: null,
    }),

  addExercise: (exercise) =>
    set((state) => ({
      exercises: [
        ...state.exercises,
        {
          id: uuidv4(),
          exercise_id: exercise.exercise_id,
          name: exercise.name,
          rest_seconds: 90,
          equipment_used: exercise.default_equipment ?? null,
          is_unilateral: exercise.default_unilateral ?? false,
          available_equipment: exercise.available_equipment ?? null,
          supports_unilateral: exercise.supports_unilateral ?? false,
          category: exercise.category ?? '',
          sets: [
            {
              id: uuidv4(),
              weight: null,
              reps: 10,
              is_warmup: false,
              rpe: null,
            },
          ],
        },
      ],
    })),

  removeExercise: (exerciseClientId) =>
    set((state) => ({
      exercises: state.exercises.filter((e) => e.id !== exerciseClientId),
    })),

  reorderExercises: (oldIndex, newIndex) =>
    set((state) => {
      const exercises = [...state.exercises];
      const [removed] = exercises.splice(oldIndex, 1);
      exercises.splice(newIndex, 0, removed);
      return { exercises };
    }),

  addSet: (exerciseClientId) =>
    set((state) => ({
      exercises: state.exercises.map((e) => {
        if (e.id !== exerciseClientId) return e;
        const lastSet = e.sets[e.sets.length - 1];
        return {
          ...e,
          sets: [
            ...e.sets,
            {
              id: uuidv4(),
              weight: lastSet?.weight ?? null,
              reps: lastSet?.reps ?? 10,
              is_warmup: false,
              rpe: null,
            },
          ],
        };
      }),
    })),

  removeSet: (exerciseClientId, setId) =>
    set((state) => ({
      exercises: state.exercises.map((e) => {
        if (e.id !== exerciseClientId) return e;
        return {
          ...e,
          sets: e.sets.filter((s) => s.id !== setId),
        };
      }),
    })),

  updateSet: (exerciseClientId, setId, data) =>
    set((state) => ({
      exercises: state.exercises.map((e) => {
        if (e.id !== exerciseClientId) return e;
        return {
          ...e,
          sets: e.sets.map((s) => {
            if (s.id !== setId) return s;
            return { ...s, ...data };
          }),
        };
      }),
    })),

  updateExerciseEquipment: (exerciseClientId, equipment) =>
    set((state) => ({
      exercises: state.exercises.map((e) =>
        e.id === exerciseClientId ? { ...e, equipment_used: equipment } : e
      ),
    })),

  toggleExerciseUnilateral: (exerciseClientId) =>
    set((state) => ({
      exercises: state.exercises.map((e) =>
        e.id === exerciseClientId ? { ...e, is_unilateral: !e.is_unilateral } : e
      ),
    })),

  loadFromSession: (session) =>
    set({
      isEditing: true,
      editingSessionId: session.id,
      notes: session.notes || '',
      exercises: session.exercises.map((ex) => ({
        id: uuidv4(),
        exercise_id: ex.exercise_id,
        name: ex.name,
        rest_seconds: 90,
        equipment_used: ex.equipment_used ?? null,
        is_unilateral: ex.is_unilateral ?? false,
        available_equipment: ex.available_equipment ?? null,
        supports_unilateral: ex.supports_unilateral ?? false,
        category: ex.category ?? '',
        sets: ex.sets.map((s) => ({
          id: uuidv4(),
          weight: s.weight,
          reps: s.reps,
          is_warmup: s.is_warmup,
          rpe: s.rpe,
        })),
      })),
    }),

  reset: () =>
    set({
      exercises: [],
      selectedDate: null,
      notes: '',
      isEditing: false,
      editingSessionId: null,
    }),
}));
