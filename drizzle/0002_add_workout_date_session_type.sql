-- 1. 새 컬럼 추가
ALTER TABLE "workout_sessions" ADD COLUMN "workout_date" text;
ALTER TABLE "workout_sessions" ADD COLUMN "session_type" text DEFAULT 'realtime';
ALTER TABLE "workout_sessions" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();

-- 2. 기존 데이터 역채움 (KST 타임존 적용)
UPDATE "workout_sessions"
SET "workout_date" = to_char(("started_at" AT TIME ZONE 'Asia/Seoul'), 'YYYY-MM-DD'),
    "updated_at" = COALESCE("completed_at", "started_at")
WHERE "workout_date" IS NULL;

-- 3. 인덱스 추가 (캘린더 조회 최적화)
CREATE INDEX "idx_workout_sessions_workout_date" ON "workout_sessions" ("user_id", "workout_date");
