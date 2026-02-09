import { describe, it, expect } from 'vitest';
import { exerciseSchema, exerciseFilterSchema } from '../exercise';

describe('exerciseSchema', () => {
  it('유효한 운동 데이터를 통과시킨다', () => {
    const validData = {
      name_ko: '바벨 벤치 프레스',
      category: 'chest',
      equipment: 'barbell',
      primary_muscles: ['대흉근'],
    };
    const result = exerciseSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('운동 이름이 없으면 실패한다', () => {
    const invalidData = {
      name_ko: '',
      category: 'chest',
      equipment: 'barbell',
      primary_muscles: ['대흉근'],
    };
    const result = exerciseSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('유효하지 않은 카테고리를 거부한다', () => {
    const invalidData = {
      name_ko: '테스트 운동',
      category: 'invalid_category',
      equipment: 'barbell',
      primary_muscles: ['근육'],
    };
    const result = exerciseSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('주요 근육이 비어있으면 실패한다', () => {
    const invalidData = {
      name_ko: '테스트 운동',
      category: 'chest',
      equipment: 'barbell',
      primary_muscles: [],
    };
    const result = exerciseSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('exerciseFilterSchema', () => {
  it('유효한 필터를 통과시킨다', () => {
    const result = exerciseFilterSchema.safeParse({
      category: 'chest',
      search: '벤치',
      limit: 10,
    });
    expect(result.success).toBe(true);
  });

  it('빈 필터를 허용한다', () => {
    const result = exerciseFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
