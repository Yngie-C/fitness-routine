import { describe, it, expect } from 'vitest';
import { CATEGORY_LABELS, EQUIPMENT_LABELS } from '../index';

describe('CATEGORY_LABELS', () => {
  it('모든 카테고리에 한국어 라벨이 있다', () => {
    expect(CATEGORY_LABELS.chest).toBe('가슴');
    expect(CATEGORY_LABELS.back).toBe('등');
    expect(CATEGORY_LABELS.shoulders).toBe('어깨');
    expect(CATEGORY_LABELS.arms).toBe('팔');
    expect(CATEGORY_LABELS.legs).toBe('하체');
    expect(CATEGORY_LABELS.core).toBe('코어');
    expect(CATEGORY_LABELS.cardio).toBe('유산소');
  });
});

describe('EQUIPMENT_LABELS', () => {
  it('모든 장비에 한국어 라벨이 있다', () => {
    expect(EQUIPMENT_LABELS.barbell).toBe('바벨');
    expect(EQUIPMENT_LABELS.dumbbell).toBe('덤벨');
    expect(EQUIPMENT_LABELS.machine).toBe('머신');
    expect(EQUIPMENT_LABELS.cable).toBe('케이블');
    expect(EQUIPMENT_LABELS.bodyweight).toBe('맨몸');
    expect(EQUIPMENT_LABELS.other).toBe('기타');
  });
});
