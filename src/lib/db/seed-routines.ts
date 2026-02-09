export interface RoutineTemplate {
  name: string;
  description: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  sort_order: number;
  exercises: {
    exercise_name_ko: string;
    sort_order: number;
    target_sets: number;
    target_reps: number;
    rest_seconds: number;
    notes?: string;
  }[];
}

export const seedRoutineTemplates: RoutineTemplate[] = [
  // ============================================================
  // 초급 (Beginner) — 7개
  // ============================================================

  // B01
  {
    name: '초보자 전신 운동 A',
    description: '운동을 처음 시작하는 분을 위한 기본 전신 루틴 (A/B 교대 중 A일)',
    experience_level: 'beginner',
    sort_order: 1,
    exercises: [
      { exercise_name_ko: '레그 프레스', sort_order: 0, target_sets: 3, target_reps: 12, rest_seconds: 120, notes: '하체 기본' },
      { exercise_name_ko: '머신 체스트 프레스', sort_order: 1, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '가슴 기본' },
      { exercise_name_ko: '랫풀다운', sort_order: 2, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '등 기본' },
      { exercise_name_ko: '덤벨 숄더 프레스', sort_order: 3, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '어깨 기본' },
      { exercise_name_ko: '플랭크', sort_order: 4, target_sets: 3, target_reps: 30, rest_seconds: 60, notes: '30초 유지' },
    ],
  },

  // B02
  {
    name: '초보자 전신 운동 B',
    description: '운동을 처음 시작하는 분을 위한 기본 전신 루틴 (A/B 교대 중 B일)',
    experience_level: 'beginner',
    sort_order: 2,
    exercises: [
      { exercise_name_ko: '레그 익스텐션', sort_order: 0, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '대퇴사두' },
      { exercise_name_ko: '레그 컬', sort_order: 1, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '햄스트링' },
      { exercise_name_ko: '푸시업', sort_order: 2, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '가슴/삼두' },
      { exercise_name_ko: '시티드 케이블 로우', sort_order: 3, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '등' },
      { exercise_name_ko: '크런치', sort_order: 4, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '코어' },
    ],
  },

  // B03
  {
    name: '초보자 상체',
    description: '상/하체 2분할의 상체 날. 기본 머신과 케이블 중심',
    experience_level: 'beginner',
    sort_order: 3,
    exercises: [
      { exercise_name_ko: '머신 체스트 프레스', sort_order: 0, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '가슴' },
      { exercise_name_ko: '랫풀다운', sort_order: 1, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '등' },
      { exercise_name_ko: '덤벨 숄더 프레스', sort_order: 2, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '어깨' },
      { exercise_name_ko: '케이블 푸시다운', sort_order: 3, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '삼두' },
      { exercise_name_ko: '덤벨 컬', sort_order: 4, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '이두' },
      { exercise_name_ko: '사이드 레터럴 레이즈', sort_order: 5, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '측면 어깨' },
    ],
  },

  // B04
  {
    name: '초보자 하체',
    description: '상/하체 2분할의 하체 날. 안전한 머신 중심',
    experience_level: 'beginner',
    sort_order: 4,
    exercises: [
      { exercise_name_ko: '레그 프레스', sort_order: 0, target_sets: 3, target_reps: 12, rest_seconds: 120, notes: '전체 하체' },
      { exercise_name_ko: '레그 익스텐션', sort_order: 1, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '대퇴사두' },
      { exercise_name_ko: '레그 컬', sort_order: 2, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '햄스트링' },
      { exercise_name_ko: '힙 쓰러스트', sort_order: 3, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '둔근' },
      { exercise_name_ko: '카프 레이즈', sort_order: 4, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '종아리' },
      { exercise_name_ko: '크런치', sort_order: 5, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '코어' },
    ],
  },

  // B05
  {
    name: '초보자 전면 (축분할 A)',
    description: '전면/후면 축분할의 전면 날. 가슴, 어깨 전면, 삼두, 대퇴사두 중심',
    experience_level: 'beginner',
    sort_order: 5,
    exercises: [
      { exercise_name_ko: '머신 체스트 프레스', sort_order: 0, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '가슴' },
      { exercise_name_ko: '푸시업', sort_order: 1, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '가슴/삼두' },
      { exercise_name_ko: '덤벨 숄더 프레스', sort_order: 2, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '전면 어깨' },
      { exercise_name_ko: '사이드 레터럴 레이즈', sort_order: 3, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '측면 어깨' },
      { exercise_name_ko: '케이블 푸시다운', sort_order: 4, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '삼두' },
      { exercise_name_ko: '레그 프레스', sort_order: 5, target_sets: 3, target_reps: 12, rest_seconds: 120, notes: '대퇴사두' },
      { exercise_name_ko: '레그 익스텐션', sort_order: 6, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '대퇴사두 고립' },
    ],
  },

  // B06
  {
    name: '초보자 후면 (축분할 B)',
    description: '전면/후면 축분할의 후면 날. 등, 어깨 후면, 이두, 햄스트링/둔근 중심',
    experience_level: 'beginner',
    sort_order: 6,
    exercises: [
      { exercise_name_ko: '랫풀다운', sort_order: 0, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '등' },
      { exercise_name_ko: '시티드 케이블 로우', sort_order: 1, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '등 두께' },
      { exercise_name_ko: '페이스풀', sort_order: 2, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '후면 삼각근' },
      { exercise_name_ko: '덤벨 컬', sort_order: 3, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '이두' },
      { exercise_name_ko: '해머 컬', sort_order: 4, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '상완근' },
      { exercise_name_ko: '레그 컬', sort_order: 5, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '햄스트링' },
      { exercise_name_ko: '힙 쓰러스트', sort_order: 6, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '둔근' },
    ],
  },

  // B07
  {
    name: '초보자 유산소 + 코어',
    description: '유산소와 코어를 결합한 컨디셔닝 루틴',
    experience_level: 'beginner',
    sort_order: 7,
    exercises: [
      { exercise_name_ko: '사이클링', sort_order: 0, target_sets: 1, target_reps: 20, rest_seconds: 120, notes: '20분 워밍업' },
      { exercise_name_ko: '플랭크', sort_order: 1, target_sets: 3, target_reps: 30, rest_seconds: 60, notes: '30초 유지' },
      { exercise_name_ko: '크런치', sort_order: 2, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '복직근' },
      { exercise_name_ko: '러시안 트위스트', sort_order: 3, target_sets: 3, target_reps: 20, rest_seconds: 60, notes: '복사근' },
      { exercise_name_ko: '줄넘기', sort_order: 4, target_sets: 3, target_reps: 3, rest_seconds: 60, notes: '3분씩' },
    ],
  },

  // ============================================================
  // 중급 (Intermediate) — 10개
  // ============================================================

  // I01
  {
    name: '중급 Push (밀기)',
    description: 'Push/Pull/Legs 3분할의 밀기 날. 가슴, 어깨, 삼두',
    experience_level: 'intermediate',
    sort_order: 10,
    exercises: [
      { exercise_name_ko: '바벨 벤치 프레스', sort_order: 0, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '메인 가슴' },
      { exercise_name_ko: '인클라인 덤벨 프레스', sort_order: 1, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '윗가슴' },
      { exercise_name_ko: '케이블 크로스오버', sort_order: 2, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '가슴 수축' },
      { exercise_name_ko: '바벨 오버헤드 프레스', sort_order: 3, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '어깨' },
      { exercise_name_ko: '사이드 레터럴 레이즈', sort_order: 4, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '측면 삼각근' },
      { exercise_name_ko: '케이블 푸시다운', sort_order: 5, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '삼두' },
      { exercise_name_ko: '오버헤드 트라이셉 익스텐션', sort_order: 6, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '삼두 장두' },
    ],
  },

  // I02
  {
    name: '중급 Pull (당기기)',
    description: 'Push/Pull/Legs 3분할의 당기기 날. 등, 후면 삼각근, 이두',
    experience_level: 'intermediate',
    sort_order: 11,
    exercises: [
      { exercise_name_ko: '바벨 로우', sort_order: 0, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '메인 등' },
      { exercise_name_ko: '풀업', sort_order: 1, target_sets: 3, target_reps: 8, rest_seconds: 90, notes: '등 너비' },
      { exercise_name_ko: '시티드 케이블 로우', sort_order: 2, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '등 두께' },
      { exercise_name_ko: '페이스풀', sort_order: 3, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '후면 삼각근' },
      { exercise_name_ko: '바벨 컬', sort_order: 4, target_sets: 3, target_reps: 10, rest_seconds: 60, notes: '이두' },
      { exercise_name_ko: '해머 컬', sort_order: 5, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '상완근' },
    ],
  },

  // I03
  {
    name: '중급 Legs (하체)',
    description: 'Push/Pull/Legs 3분할의 하체 날',
    experience_level: 'intermediate',
    sort_order: 12,
    exercises: [
      { exercise_name_ko: '바벨 백 스쿼트', sort_order: 0, target_sets: 4, target_reps: 10, rest_seconds: 120, notes: '메인 하체' },
      { exercise_name_ko: '루마니안 데드리프트', sort_order: 1, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '햄스트링' },
      { exercise_name_ko: '레그 프레스', sort_order: 2, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '보조 대퇴사두' },
      { exercise_name_ko: '레그 컬', sort_order: 3, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '햄스트링 고립' },
      { exercise_name_ko: '불가리안 스플릿 스쿼트', sort_order: 4, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '편측 훈련' },
      { exercise_name_ko: '카프 레이즈', sort_order: 5, target_sets: 4, target_reps: 15, rest_seconds: 60, notes: '종아리' },
    ],
  },

  // I04
  {
    name: '중급 전면 (축분할 A)',
    description: '전면/후면 축분할의 전면 날. 프리웨이트 중심',
    experience_level: 'intermediate',
    sort_order: 13,
    exercises: [
      { exercise_name_ko: '바벨 벤치 프레스', sort_order: 0, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '가슴 메인' },
      { exercise_name_ko: '인클라인 덤벨 프레스', sort_order: 1, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '윗가슴' },
      { exercise_name_ko: '딥스', sort_order: 2, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '가슴/삼두' },
      { exercise_name_ko: '바벨 오버헤드 프레스', sort_order: 3, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '전면 어깨' },
      { exercise_name_ko: '사이드 레터럴 레이즈', sort_order: 4, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '측면 어깨' },
      { exercise_name_ko: '케이블 푸시다운', sort_order: 5, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '삼두' },
      { exercise_name_ko: '프론트 스쿼트', sort_order: 6, target_sets: 4, target_reps: 10, rest_seconds: 120, notes: '대퇴사두' },
      { exercise_name_ko: '레그 익스텐션', sort_order: 7, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '대퇴사두 고립' },
    ],
  },

  // I05
  {
    name: '중급 후면 (축분할 B)',
    description: '전면/후면 축분할의 후면 날. 프리웨이트 중심',
    experience_level: 'intermediate',
    sort_order: 14,
    exercises: [
      { exercise_name_ko: '바벨 로우', sort_order: 0, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '등 메인' },
      { exercise_name_ko: '풀업', sort_order: 1, target_sets: 3, target_reps: 8, rest_seconds: 90, notes: '등 너비' },
      { exercise_name_ko: '덤벨 원암 로우', sort_order: 2, target_sets: 3, target_reps: 10, rest_seconds: 60, notes: '등 편측' },
      { exercise_name_ko: '페이스풀', sort_order: 3, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '후면 삼각근' },
      { exercise_name_ko: '바벨 컬', sort_order: 4, target_sets: 3, target_reps: 10, rest_seconds: 60, notes: '이두' },
      { exercise_name_ko: '해머 컬', sort_order: 5, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '상완근' },
      { exercise_name_ko: '루마니안 데드리프트', sort_order: 6, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '햄스트링' },
      { exercise_name_ko: '레그 컬', sort_order: 7, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '햄스트링 고립' },
    ],
  },

  // I06
  {
    name: '중급 상체 A (상/하체 분할)',
    description: '상/하체 분할 중 상체 A. 가슴/등 중심',
    experience_level: 'intermediate',
    sort_order: 15,
    exercises: [
      { exercise_name_ko: '바벨 벤치 프레스', sort_order: 0, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '가슴 메인' },
      { exercise_name_ko: '바벨 로우', sort_order: 1, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '등 메인' },
      { exercise_name_ko: '인클라인 덤벨 프레스', sort_order: 2, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '윗가슴' },
      { exercise_name_ko: '랫풀다운', sort_order: 3, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '등 너비' },
      { exercise_name_ko: '사이드 레터럴 레이즈', sort_order: 4, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '어깨' },
      { exercise_name_ko: '바벨 컬', sort_order: 5, target_sets: 3, target_reps: 10, rest_seconds: 60, notes: '이두' },
      { exercise_name_ko: '케이블 푸시다운', sort_order: 6, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '삼두' },
    ],
  },

  // I07
  {
    name: '중급 하체 A (상/하체 분할)',
    description: '상/하체 분할 중 하체 A. 대퇴사두 중심',
    experience_level: 'intermediate',
    sort_order: 16,
    exercises: [
      { exercise_name_ko: '바벨 백 스쿼트', sort_order: 0, target_sets: 4, target_reps: 10, rest_seconds: 120, notes: '메인' },
      { exercise_name_ko: '레그 프레스', sort_order: 1, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '보조' },
      { exercise_name_ko: '불가리안 스플릿 스쿼트', sort_order: 2, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '편측' },
      { exercise_name_ko: '레그 컬', sort_order: 3, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '햄스트링' },
      { exercise_name_ko: '힙 쓰러스트', sort_order: 4, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '둔근' },
      { exercise_name_ko: '카프 레이즈', sort_order: 5, target_sets: 4, target_reps: 15, rest_seconds: 60, notes: '종아리' },
      { exercise_name_ko: '행잉 레그 레이즈', sort_order: 6, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '코어' },
    ],
  },

  // I08
  {
    name: '중급 가슴/삼두 전문',
    description: '가슴과 삼두에 집중하는 특화 루틴',
    experience_level: 'intermediate',
    sort_order: 17,
    exercises: [
      { exercise_name_ko: '바벨 벤치 프레스', sort_order: 0, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '플랫' },
      { exercise_name_ko: '인클라인 덤벨 프레스', sort_order: 1, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '인클라인' },
      { exercise_name_ko: '덤벨 플라이', sort_order: 2, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '스트레칭' },
      { exercise_name_ko: '딥스', sort_order: 3, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '가슴/삼두' },
      { exercise_name_ko: '클로즈그립 벤치 프레스', sort_order: 4, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '삼두 복합' },
      { exercise_name_ko: '케이블 푸시다운', sort_order: 5, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '삼두 고립' },
      { exercise_name_ko: '오버헤드 트라이셉 익스텐션', sort_order: 6, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '삼두 장두' },
    ],
  },

  // I09
  {
    name: '중급 등/이두 전문',
    description: '등과 이두에 집중하는 특화 루틴',
    experience_level: 'intermediate',
    sort_order: 18,
    exercises: [
      { exercise_name_ko: '바벨 로우', sort_order: 0, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '등 두께' },
      { exercise_name_ko: '풀업', sort_order: 1, target_sets: 3, target_reps: 8, rest_seconds: 90, notes: '등 너비' },
      { exercise_name_ko: '덤벨 원암 로우', sort_order: 2, target_sets: 3, target_reps: 10, rest_seconds: 60, notes: '편측' },
      { exercise_name_ko: '시티드 케이블 로우', sort_order: 3, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '중앙부' },
      { exercise_name_ko: '바벨 컬', sort_order: 4, target_sets: 3, target_reps: 10, rest_seconds: 60, notes: '이두 메인' },
      { exercise_name_ko: '프리처 컬', sort_order: 5, target_sets: 3, target_reps: 10, rest_seconds: 60, notes: '이두 고립' },
      { exercise_name_ko: '해머 컬', sort_order: 6, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '상완근' },
    ],
  },

  // I10
  {
    name: '중급 어깨 전문',
    description: '어깨 3두(전면/측면/후면)를 균형 있게 발달시키는 루틴',
    experience_level: 'intermediate',
    sort_order: 19,
    exercises: [
      { exercise_name_ko: '바벨 오버헤드 프레스', sort_order: 0, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '전면 메인' },
      { exercise_name_ko: '아놀드 프레스', sort_order: 1, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '전면+측면' },
      { exercise_name_ko: '사이드 레터럴 레이즈', sort_order: 2, target_sets: 4, target_reps: 15, rest_seconds: 60, notes: '측면' },
      { exercise_name_ko: '프론트 레이즈', sort_order: 3, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '전면 고립' },
      { exercise_name_ko: '리어 델트 플라이', sort_order: 4, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '후면' },
      { exercise_name_ko: '페이스풀', sort_order: 5, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '후면+승모' },
      { exercise_name_ko: '업라이트 로우', sort_order: 6, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '측면+승모' },
    ],
  },

  // ============================================================
  // 고급 (Advanced) — 7개
  // ============================================================

  // A01
  {
    name: '고급 Push (밀기) — 고볼륨',
    description: '고급자를 위한 고볼륨 밀기 루틴. 복합+고립 조합',
    experience_level: 'advanced',
    sort_order: 20,
    exercises: [
      { exercise_name_ko: '바벨 벤치 프레스', sort_order: 0, target_sets: 5, target_reps: 8, rest_seconds: 120, notes: '고중량' },
      { exercise_name_ko: '인클라인 덤벨 프레스', sort_order: 1, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '윗가슴' },
      { exercise_name_ko: '디클라인 벤치 프레스', sort_order: 2, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '하부 가슴' },
      { exercise_name_ko: '케이블 크로스오버', sort_order: 3, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '수축' },
      { exercise_name_ko: '바벨 오버헤드 프레스', sort_order: 4, target_sets: 4, target_reps: 8, rest_seconds: 90, notes: '어깨 고중량' },
      { exercise_name_ko: '사이드 레터럴 레이즈', sort_order: 5, target_sets: 4, target_reps: 15, rest_seconds: 60, notes: '측면' },
      { exercise_name_ko: '클로즈그립 벤치 프레스', sort_order: 6, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '삼두 복합' },
      { exercise_name_ko: '오버헤드 트라이셉 익스텐션', sort_order: 7, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '삼두 장두' },
    ],
  },

  // A02
  {
    name: '고급 Pull (당기기) — 고볼륨',
    description: '고급자를 위한 고볼륨 당기기 루틴',
    experience_level: 'advanced',
    sort_order: 21,
    exercises: [
      { exercise_name_ko: '바벨 데드리프트', sort_order: 0, target_sets: 5, target_reps: 6, rest_seconds: 180, notes: '메인 리프트' },
      { exercise_name_ko: '풀업', sort_order: 1, target_sets: 4, target_reps: 8, rest_seconds: 90, notes: '등 너비' },
      { exercise_name_ko: '바벨 로우', sort_order: 2, target_sets: 4, target_reps: 8, rest_seconds: 90, notes: '등 두께' },
      { exercise_name_ko: '티바 로우', sort_order: 3, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '등 두께 보조' },
      { exercise_name_ko: '페이스풀', sort_order: 4, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '후면 삼각근' },
      { exercise_name_ko: '바벨 컬', sort_order: 5, target_sets: 4, target_reps: 10, rest_seconds: 60, notes: '이두' },
      { exercise_name_ko: '프리처 컬', sort_order: 6, target_sets: 3, target_reps: 10, rest_seconds: 60, notes: '이두 고립' },
      { exercise_name_ko: '해머 컬', sort_order: 7, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '상완근' },
    ],
  },

  // A03
  {
    name: '고급 Legs (하체) — 고볼륨',
    description: '고급자를 위한 고볼륨 하체 루틴',
    experience_level: 'advanced',
    sort_order: 22,
    exercises: [
      { exercise_name_ko: '바벨 백 스쿼트', sort_order: 0, target_sets: 5, target_reps: 8, rest_seconds: 180, notes: '메인 리프트' },
      { exercise_name_ko: '프론트 스쿼트', sort_order: 1, target_sets: 4, target_reps: 8, rest_seconds: 120, notes: '대퇴사두 집중' },
      { exercise_name_ko: '루마니안 데드리프트', sort_order: 2, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '후면 사슬' },
      { exercise_name_ko: '불가리안 스플릿 스쿼트', sort_order: 3, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '편측' },
      { exercise_name_ko: '레그 프레스', sort_order: 4, target_sets: 3, target_reps: 12, rest_seconds: 90, notes: '볼륨 추가' },
      { exercise_name_ko: '레그 컬', sort_order: 5, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '햄스트링' },
      { exercise_name_ko: '카프 레이즈', sort_order: 6, target_sets: 5, target_reps: 15, rest_seconds: 60, notes: '종아리' },
      { exercise_name_ko: '행잉 레그 레이즈', sort_order: 7, target_sets: 4, target_reps: 15, rest_seconds: 60, notes: '코어' },
    ],
  },

  // A04
  {
    name: '고급 전면 (축분할 A) — 고강도',
    description: '전면/후면 축분할의 전면 날. 고급자용 고강도 프리웨이트',
    experience_level: 'advanced',
    sort_order: 23,
    exercises: [
      { exercise_name_ko: '바벨 벤치 프레스', sort_order: 0, target_sets: 5, target_reps: 8, rest_seconds: 120, notes: '가슴 고중량' },
      { exercise_name_ko: '인클라인 덤벨 프레스', sort_order: 1, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '윗가슴' },
      { exercise_name_ko: '딥스', sort_order: 2, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '가슴 하부' },
      { exercise_name_ko: '바벨 오버헤드 프레스', sort_order: 3, target_sets: 4, target_reps: 8, rest_seconds: 90, notes: '어깨 고중량' },
      { exercise_name_ko: '아놀드 프레스', sort_order: 4, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '어깨 전체' },
      { exercise_name_ko: '사이드 레터럴 레이즈', sort_order: 5, target_sets: 4, target_reps: 15, rest_seconds: 60, notes: '측면 삼각근' },
      { exercise_name_ko: '클로즈그립 벤치 프레스', sort_order: 6, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '삼두' },
      { exercise_name_ko: '바벨 백 스쿼트', sort_order: 7, target_sets: 5, target_reps: 8, rest_seconds: 180, notes: '대퇴사두' },
      { exercise_name_ko: '레그 익스텐션', sort_order: 8, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '대퇴사두 고립' },
    ],
  },

  // A05
  {
    name: '고급 후면 (축분할 B) — 고강도',
    description: '전면/후면 축분할의 후면 날. 고급자용 고강도 프리웨이트',
    experience_level: 'advanced',
    sort_order: 24,
    exercises: [
      { exercise_name_ko: '바벨 데드리프트', sort_order: 0, target_sets: 5, target_reps: 6, rest_seconds: 180, notes: '후면 사슬' },
      { exercise_name_ko: '바벨 로우', sort_order: 1, target_sets: 4, target_reps: 8, rest_seconds: 90, notes: '등 두께' },
      { exercise_name_ko: '풀업', sort_order: 2, target_sets: 4, target_reps: 8, rest_seconds: 90, notes: '등 너비' },
      { exercise_name_ko: '티바 로우', sort_order: 3, target_sets: 3, target_reps: 10, rest_seconds: 90, notes: '등 보조' },
      { exercise_name_ko: '리어 델트 플라이', sort_order: 4, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '후면 삼각근' },
      { exercise_name_ko: '바벨 컬', sort_order: 5, target_sets: 4, target_reps: 10, rest_seconds: 60, notes: '이두' },
      { exercise_name_ko: '프리처 컬', sort_order: 6, target_sets: 3, target_reps: 10, rest_seconds: 60, notes: '이두 고립' },
      { exercise_name_ko: '루마니안 데드리프트', sort_order: 7, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '햄스트링' },
      { exercise_name_ko: '레그 컬', sort_order: 8, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '햄스트링 고립' },
    ],
  },

  // A06
  {
    name: '고급 5분할 — 가슴',
    description: '5분할(가슴/등/어깨/팔/하체) 중 가슴의 날. 다각도 집중 공략',
    experience_level: 'advanced',
    sort_order: 25,
    exercises: [
      { exercise_name_ko: '바벨 벤치 프레스', sort_order: 0, target_sets: 5, target_reps: 8, rest_seconds: 120, notes: '플랫 고중량' },
      { exercise_name_ko: '인클라인 덤벨 프레스', sort_order: 1, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '상부' },
      { exercise_name_ko: '디클라인 벤치 프레스', sort_order: 2, target_sets: 4, target_reps: 10, rest_seconds: 90, notes: '하부' },
      { exercise_name_ko: '덤벨 플라이', sort_order: 3, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '스트레칭' },
      { exercise_name_ko: '케이블 크로스오버', sort_order: 4, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '수축 피니셔' },
      { exercise_name_ko: '푸시업', sort_order: 5, target_sets: 3, target_reps: 20, rest_seconds: 60, notes: '번아웃' },
    ],
  },

  // A07
  {
    name: '고급 5분할 — 팔',
    description: '5분할 중 팔의 날. 이두/삼두 슈퍼셋 구성',
    experience_level: 'advanced',
    sort_order: 26,
    exercises: [
      { exercise_name_ko: '바벨 컬', sort_order: 0, target_sets: 4, target_reps: 10, rest_seconds: 60, notes: '이두 메인' },
      { exercise_name_ko: '클로즈그립 벤치 프레스', sort_order: 1, target_sets: 4, target_reps: 10, rest_seconds: 60, notes: '삼두 메인' },
      { exercise_name_ko: '프리처 컬', sort_order: 2, target_sets: 3, target_reps: 10, rest_seconds: 60, notes: '이두 고립' },
      { exercise_name_ko: '오버헤드 트라이셉 익스텐션', sort_order: 3, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '삼두 장두' },
      { exercise_name_ko: '해머 컬', sort_order: 4, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '상완근' },
      { exercise_name_ko: '케이블 푸시다운', sort_order: 5, target_sets: 3, target_reps: 15, rest_seconds: 60, notes: '삼두 피니셔' },
      { exercise_name_ko: '덤벨 컬', sort_order: 6, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '이두 피니셔' },
      { exercise_name_ko: '트라이셉 딥스', sort_order: 7, target_sets: 3, target_reps: 12, rest_seconds: 60, notes: '삼두 체중' },
    ],
  },
];
