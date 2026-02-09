import { db } from './index';
import { exercises, profiles, routines, routine_exercises } from './schema';
import { seedExercises } from './seed-exercises';
import { seedRoutineTemplates } from './seed-routines';
import { eq } from 'drizzle-orm';

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

async function ensureSystemUser() {
  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, SYSTEM_USER_ID));

  if (existing.length === 0) {
    await db.insert(profiles).values({
      id: SYSTEM_USER_ID,
      name: 'System',
      onboarding_completed: true,
    });
    console.log('👤 Created system user');
  } else {
    console.log('👤 System user already exists');
  }
}

async function seedRoutines() {
  console.log('🏋️ Seeding routine templates...');

  // 멱등성: 기존 템플릿 삭제 (cascade로 routine_exercises도 삭제)
  await db.delete(routines).where(eq(routines.is_template, true));
  console.log('🗑️ Cleared existing templates');

  // Exercise name_ko → id 매핑
  const exerciseRows = await db.select().from(exercises);
  const exerciseMap = new Map(exerciseRows.map((e: typeof exerciseRows[number]) => [e.name_ko, e.id]));

  let templateCount = 0;
  let exerciseCount = 0;

  for (const template of seedRoutineTemplates) {
    const [routine] = await db
      .insert(routines)
      .values({
        user_id: SYSTEM_USER_ID,
        name: template.name,
        description: template.description,
        is_template: true,
        experience_level: template.experience_level,
        sort_order: template.sort_order,
      })
      .returning();

    const exerciseValues = template.exercises.map((ex) => {
      const exerciseId = exerciseMap.get(ex.exercise_name_ko);
      if (!exerciseId) {
        throw new Error(
          `Exercise not found: "${ex.exercise_name_ko}" in template "${template.name}"`
        );
      }
      return {
        routine_id: routine.id,
        exercise_id: exerciseId,
        sort_order: ex.sort_order,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        rest_seconds: ex.rest_seconds,
        notes: ex.notes || null,
      };
    });

    await db.insert(routine_exercises).values(exerciseValues);
    templateCount++;
    exerciseCount += exerciseValues.length;
  }

  console.log(
    `✅ Inserted ${templateCount} routine templates with ${exerciseCount} exercises`
  );
}

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Insert seed exercises
    console.log('📝 Inserting exercises...');
    await db.insert(exercises).values(seedExercises);
    console.log(`✅ Inserted ${seedExercises.length} exercises`);

    // 2. Ensure system user exists
    await ensureSystemUser();

    // 3. Seed routine templates
    await seedRoutines();

    console.log('✨ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };
