import { describe, it, expect } from 'vitest';
import { routineSchema, routineExerciseSchema } from '../routine';

describe('routineSchema', () => {
  it('유효한 루틴 데이터를 통과시킨다', () => {
    const validData = {
      name: '상체 운동',
      exercises: [
        {
          exercise_id: '550e8400-e29b-41d4-a716-446655440000',
          sort_order: 0,
          target_sets: 3,
          target_reps: 10,
          target_weight: 60,
          rest_seconds: 90,
        },
      ],
    };
    const result = routineSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('루틴 이름이 없으면 실패한다', () => {
    const result = routineSchema.safeParse({
      name: '',
      exercises: [{ exercise_id: '550e8400-e29b-41d4-a716-446655440000', sort_order: 0, target_sets: 3, target_reps: 10 }],
    });
    expect(result.success).toBe(false);
  });

  it('운동이 없으면 실패한다', () => {
    const result = routineSchema.safeParse({
      name: '빈 루틴',
      exercises: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('routineExerciseSchema', () => {
  it('유효한 운동 항목을 통과시킨다', () => {
    const result = routineExerciseSchema.safeParse({
      exercise_id: '550e8400-e29b-41d4-a716-446655440000',
      sort_order: 0,
      target_sets: 4,
      target_reps: 8,
      target_weight: 80.5,
      rest_seconds: 120,
    });
    expect(result.success).toBe(true);
  });

  it('세트 수가 0이면 실패한다', () => {
    const result = routineExerciseSchema.safeParse({
      exercise_id: '550e8400-e29b-41d4-a716-446655440000',
      sort_order: 0,
      target_sets: 0,
      target_reps: 10,
    });
    expect(result.success).toBe(false);
  });
});
