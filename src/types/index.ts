// 운동 카테고리
export type ExerciseCategory = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio';

// 장비 유형
export type EquipmentType = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'other';

// 무게 단위
export type WeightUnit = 'kg' | 'lb';

// 언어
export type Language = 'ko' | 'en';

// 경험 수준
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

// 동기화 상태
export type SyncStatus = 'synced' | 'pending' | 'conflict';

// API 에러 응답
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  data: T[];
  next_cursor?: string;
}

// 카테고리 한국어 매핑
export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  chest: '가슴',
  back: '등',
  shoulders: '어깨',
  arms: '팔',
  legs: '하체',
  core: '코어',
  cardio: '유산소',
};

// 장비 한국어 매핑
export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  barbell: '바벨',
  dumbbell: '덤벨',
  machine: '머신',
  cable: '케이블',
  bodyweight: '맨몸',
  other: '기타',
};

// 원암/원레그 라벨 매핑 (운동 category 기반)
export const UNILATERAL_LABELS: Record<string, string> = {
  arms: '원암',
  back: '원암',
  shoulders: '원암',
  chest: '원암',
  legs: '원레그',
  core: '원사이드',
};
