import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkoutStore } from '../workout-store';

describe('useWorkoutStore', () => {
  beforeEach(() => {
    useWorkoutStore.setState({
      activeWorkout: null,
      restTimer: { isRunning: false, remaining: 0, total: 0 },
    });
  });

  it('운동을 시작할 수 있다', () => {
    const workout = {
      session_client_id: 'test-session-id',
      routine_id: 'test-routine-id',
      routine_name: '테스트 루틴',
      started_at: new Date().toISOString(),
      current_exercise_index: 0,
      exercises: [
        {
          exercise_id: 'ex1',
          name: '벤치 프레스',
          target_sets: 3,
          target_reps: 10,
          target_weight: 60,
          rest_seconds: 90,
        },
      ],
      completed_sets: [],
    };

    useWorkoutStore.getState().startWorkout(workout);
    expect(useWorkoutStore.getState().activeWorkout).not.toBeNull();
    expect(useWorkoutStore.getState().activeWorkout?.routine_name).toBe('테스트 루틴');
  });

  it('세트를 추가할 수 있다', () => {
    // 먼저 운동 시작
    useWorkoutStore.getState().startWorkout({
      session_client_id: 'test',
      started_at: new Date().toISOString(),
      current_exercise_index: 0,
      exercises: [{ exercise_id: 'ex1', name: '스쿼트', target_sets: 3, target_reps: 10, rest_seconds: 90 }],
      completed_sets: [],
    });

    // 세트 추가
    useWorkoutStore.getState().addSet({
      client_id: 'set1',
      exercise_id: 'ex1',
      set_number: 1,
      weight: 100,
      reps: 10,
      is_warmup: false,
    });

    expect(useWorkoutStore.getState().activeWorkout?.completed_sets).toHaveLength(1);
  });

  it('다음/이전 운동으로 이동할 수 있다', () => {
    useWorkoutStore.getState().startWorkout({
      session_client_id: 'test',
      started_at: new Date().toISOString(),
      current_exercise_index: 0,
      exercises: [
        { exercise_id: 'ex1', name: '운동1', target_sets: 3, target_reps: 10, rest_seconds: 90 },
        { exercise_id: 'ex2', name: '운동2', target_sets: 3, target_reps: 10, rest_seconds: 90 },
      ],
      completed_sets: [],
    });

    useWorkoutStore.getState().nextExercise();
    expect(useWorkoutStore.getState().activeWorkout?.current_exercise_index).toBe(1);

    useWorkoutStore.getState().previousExercise();
    expect(useWorkoutStore.getState().activeWorkout?.current_exercise_index).toBe(0);
  });

  it('휴식 타이머를 시작할 수 있다', () => {
    useWorkoutStore.getState().startRestTimer(90);
    expect(useWorkoutStore.getState().restTimer.isRunning).toBe(true);
    expect(useWorkoutStore.getState().restTimer.remaining).toBe(90);
  });

  it('운동을 완료하면 상태가 초기화된다', () => {
    useWorkoutStore.getState().startWorkout({
      session_client_id: 'test',
      started_at: new Date().toISOString(),
      current_exercise_index: 0,
      exercises: [],
      completed_sets: [],
    });
    useWorkoutStore.getState().completeWorkout();
    expect(useWorkoutStore.getState().activeWorkout).toBeNull();
  });
});
