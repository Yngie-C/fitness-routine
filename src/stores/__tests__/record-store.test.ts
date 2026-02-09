import { describe, it, expect, beforeEach } from 'vitest';
import { useRecordStore } from '../record-store';

describe('record-store', () => {
  beforeEach(() => {
    // Reset store before each test
    useRecordStore.getState().reset();
  });

  it('초기 상태가 올바르다', () => {
    const state = useRecordStore.getState();
    expect(state.exercises).toEqual([]);
    expect(state.selectedDate).toBeNull();
    expect(state.notes).toBe('');
    expect(state.isEditing).toBe(false);
    expect(state.editingSessionId).toBeNull();
  });

  it('날짜를 설정할 수 있다', () => {
    useRecordStore.getState().setDate('2026-02-10');
    expect(useRecordStore.getState().selectedDate).toBe('2026-02-10');
  });

  it('메모를 설정할 수 있다', () => {
    useRecordStore.getState().setNotes('좋은 운동이었다');
    expect(useRecordStore.getState().notes).toBe('좋은 운동이었다');
  });

  it('운동을 추가할 수 있다', () => {
    useRecordStore.getState().addExercise({
      exercise_id: 'ex-1',
      name: '벤치프레스',
    });

    const exercises = useRecordStore.getState().exercises;
    expect(exercises).toHaveLength(1);
    expect(exercises[0].exercise_id).toBe('ex-1');
    expect(exercises[0].name).toBe('벤치프레스');
    expect(exercises[0].sets).toHaveLength(1);
    expect(exercises[0].sets[0].reps).toBe(10); // default
    expect(exercises[0].rest_seconds).toBe(90); // default
  });

  it('운동을 삭제할 수 있다', () => {
    useRecordStore.getState().addExercise({
      exercise_id: 'ex-1',
      name: '벤치프레스',
    });
    const exerciseId = useRecordStore.getState().exercises[0].id;

    useRecordStore.getState().removeExercise(exerciseId);
    expect(useRecordStore.getState().exercises).toHaveLength(0);
  });

  it('세트를 추가할 수 있다', () => {
    useRecordStore.getState().addExercise({
      exercise_id: 'ex-1',
      name: '벤치프레스',
    });
    const exerciseId = useRecordStore.getState().exercises[0].id;

    useRecordStore.getState().addSet(exerciseId);
    expect(useRecordStore.getState().exercises[0].sets).toHaveLength(2);
  });

  it('세트를 삭제할 수 있다', () => {
    useRecordStore.getState().addExercise({
      exercise_id: 'ex-1',
      name: '벤치프레스',
    });
    const exerciseId = useRecordStore.getState().exercises[0].id;

    useRecordStore.getState().addSet(exerciseId);
    const setId = useRecordStore.getState().exercises[0].sets[1].id;

    useRecordStore.getState().removeSet(exerciseId, setId);
    expect(useRecordStore.getState().exercises[0].sets).toHaveLength(1);
  });

  it('세트를 업데이트할 수 있다', () => {
    useRecordStore.getState().addExercise({
      exercise_id: 'ex-1',
      name: '벤치프레스',
    });
    const exerciseId = useRecordStore.getState().exercises[0].id;
    const setId = useRecordStore.getState().exercises[0].sets[0].id;

    useRecordStore.getState().updateSet(exerciseId, setId, {
      weight: 80,
      reps: 5,
      rpe: 8,
    });

    const updatedSet = useRecordStore.getState().exercises[0].sets[0];
    expect(updatedSet.weight).toBe(80);
    expect(updatedSet.reps).toBe(5);
    expect(updatedSet.rpe).toBe(8);
  });

  it('루틴에서 프리셋을 로드할 수 있다', () => {
    useRecordStore.getState().loadFromRoutine([
      {
        exercise_id: 'ex-1',
        name: '벤치프레스',
        target_sets: 3,
        target_reps: 10,
        target_weight: '60',
        rest_seconds: 90,
      },
      {
        exercise_id: 'ex-2',
        name: '스쿼트',
        target_sets: 4,
        target_reps: 8,
        target_weight: null,
        rest_seconds: 120,
      },
    ]);

    const exercises = useRecordStore.getState().exercises;
    expect(exercises).toHaveLength(2);

    // First exercise
    expect(exercises[0].exercise_id).toBe('ex-1');
    expect(exercises[0].sets).toHaveLength(3);
    expect(exercises[0].sets[0].weight).toBe(60);
    expect(exercises[0].sets[0].reps).toBe(10);

    // Second exercise
    expect(exercises[1].exercise_id).toBe('ex-2');
    expect(exercises[1].sets).toHaveLength(4);
    expect(exercises[1].sets[0].weight).toBeNull();
    expect(exercises[1].sets[0].reps).toBe(8);
  });

  it('세트 추가 시 마지막 세트의 값을 복사한다', () => {
    useRecordStore.getState().addExercise({
      exercise_id: 'ex-1',
      name: '벤치프레스',
    });
    const exerciseId = useRecordStore.getState().exercises[0].id;
    const setId = useRecordStore.getState().exercises[0].sets[0].id;

    // Update first set
    useRecordStore.getState().updateSet(exerciseId, setId, {
      weight: 100,
      reps: 3,
    });

    // Add new set - should copy last set values
    useRecordStore.getState().addSet(exerciseId);
    const newSet = useRecordStore.getState().exercises[0].sets[1];
    expect(newSet.weight).toBe(100);
    expect(newSet.reps).toBe(3);
  });

  it('reset이 모든 상태를 초기화한다', () => {
    useRecordStore.getState().setDate('2026-02-10');
    useRecordStore.getState().setNotes('test');
    useRecordStore.getState().addExercise({
      exercise_id: 'ex-1',
      name: '벤치프레스',
    });

    useRecordStore.getState().reset();

    const state = useRecordStore.getState();
    expect(state.exercises).toEqual([]);
    expect(state.selectedDate).toBeNull();
    expect(state.notes).toBe('');
  });
});
