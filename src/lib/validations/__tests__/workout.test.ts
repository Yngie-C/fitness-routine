import { describe, it, expect } from 'vitest';
import { workoutSetSchema, sessionStartSchema, sessionCompleteSchema } from '../workout';

describe('workoutSetSchema', () => {
  it('유효한 세트 데이터를 통과시킨다', () => {
    const result = workoutSetSchema.safeParse({
      exercise_id: '550e8400-e29b-41d4-a716-446655440000',
      set_number: 1,
      weight: 60,
      reps: 10,
    });
    expect(result.success).toBe(true);
  });

  it('무게 없이도 유효하다 (맨몸 운동)', () => {
    const result = workoutSetSchema.safeParse({
      exercise_id: '550e8400-e29b-41d4-a716-446655440000',
      set_number: 1,
      reps: 15,
    });
    expect(result.success).toBe(true);
  });
});

describe('sessionStartSchema', () => {
  it('루틴 ID와 함께 세션 시작을 허용한다', () => {
    const result = sessionStartSchema.safeParse({
      routine_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('유효하지 않은 UUID를 거부한다', () => {
    const result = sessionStartSchema.safeParse({
      routine_id: 'invalid-uuid',
    });
    expect(result.success).toBe(false);
  });
});

describe('sessionCompleteSchema', () => {
  it('세션 완료 데이터를 검증한다', () => {
    const result = sessionCompleteSchema.safeParse({
      duration_seconds: 3600,
      total_volume: 15000,
    });
    expect(result.success).toBe(true);
  });

  it('음수 duration을 거부한다', () => {
    const result = sessionCompleteSchema.safeParse({
      duration_seconds: -100,
    });
    expect(result.success).toBe(false);
  });
});
