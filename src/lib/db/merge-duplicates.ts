import { db } from './index';
import { exercises, routine_exercises, workout_sets } from './schema';
import { eq, sql, count } from 'drizzle-orm';

interface DuplicateGroup {
  name_ko: string;
  category: string;
  equipment: string | null;
  ids: string[];
  created_ats: string[];
}

async function findDuplicateGroups(): Promise<DuplicateGroup[]> {
  console.log('🔍 Searching for duplicate exercises...\n');

  // Use raw SQL to find duplicates efficiently
  const rows = await db.execute(sql`
    SELECT
      name_ko,
      category,
      equipment,
      array_agg(id ORDER BY created_at ASC) as ids,
      array_agg(created_at ORDER BY created_at ASC) as created_ats,
      COUNT(*) as cnt
    FROM exercises
    GROUP BY name_ko, category, equipment
    HAVING COUNT(*) > 1
    ORDER BY name_ko, category, equipment
  `) as Array<{
    name_ko: string;
    category: string;
    equipment: string | null;
    ids: string[];
    created_ats: string[];
    cnt: number;
  }>;

  return rows.map((row) => ({
    name_ko: row.name_ko,
    category: row.category,
    equipment: row.equipment,
    ids: row.ids,
    created_ats: row.created_ats,
  }));
}

async function countReferences(exerciseId: string): Promise<{
  routine_exercises: number;
  workout_sets: number;
}> {
  const [routineCount] = await db
    .select({ count: count() })
    .from(routine_exercises)
    .where(eq(routine_exercises.exercise_id, exerciseId));

  const [workoutSetCount] = await db
    .select({ count: count() })
    .from(workout_sets)
    .where(eq(workout_sets.exercise_id, exerciseId));

  return {
    routine_exercises: routineCount?.count || 0,
    workout_sets: workoutSetCount?.count || 0,
  };
}

async function mergeDuplicates(
  duplicateGroups: DuplicateGroup[],
  execute: boolean
): Promise<void> {
  let groupNumber = 0;

  for (const group of duplicateGroups) {
    groupNumber++;
    const keeperId = group.ids[0];
    const keeperCreatedAt = group.created_ats[0];
    const duplicates = group.ids.slice(1);

    console.log(
      `Group ${groupNumber}: "${group.name_ko}" (${group.category}, ${group.equipment || 'none'})`
    );
    console.log(`  ✅ Keep: ${keeperId} (created: ${keeperCreatedAt})`);

    for (let i = 0; i < duplicates.length; i++) {
      const duplicateId = duplicates[i];
      const duplicateCreatedAt = group.created_ats[i + 1];

      const refs = await countReferences(duplicateId);
      console.log(`  🔄 Merge: ${duplicateId} (created: ${duplicateCreatedAt}) → ${keeperId}`);
      console.log(`      - routine_exercises: ${refs.routine_exercises} references`);
      console.log(`      - workout_sets: ${refs.workout_sets} references`);

      if (execute) {
        await db.transaction(async (tx: typeof db) => {
          // Update routine_exercises references
          if (refs.routine_exercises > 0) {
            await tx
              .update(routine_exercises)
              .set({ exercise_id: keeperId })
              .where(eq(routine_exercises.exercise_id, duplicateId));
          }

          // Update workout_sets references
          if (refs.workout_sets > 0) {
            await tx
              .update(workout_sets)
              .set({ exercise_id: keeperId })
              .where(eq(workout_sets.exercise_id, duplicateId));
          }

          // Delete the duplicate
          await tx.delete(exercises).where(eq(exercises.id, duplicateId));
        });
        console.log(`      ✅ Merged successfully`);
      }
    }
    console.log('');
  }
}

async function main() {
  const isExecute = process.argv.includes('--execute');

  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         Fitness Routine - Merge Duplicate Exercises       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  if (isExecute) {
    console.log('⚠️  EXECUTION MODE: Changes will be applied to the database!\n');
  } else {
    console.log('📋 DRY RUN MODE: No changes will be made. Use --execute to apply.\n');
  }

  try {
    const duplicateGroups = await findDuplicateGroups();

    if (duplicateGroups.length === 0) {
      console.log('✨ No duplicates found! Database is clean.\n');
      process.exit(0);
    }

    console.log(`🔍 Found ${duplicateGroups.length} duplicate group(s)\n`);

    await mergeDuplicates(duplicateGroups, isExecute);

    if (isExecute) {
      console.log('✨ Merge complete! All duplicates have been merged.\n');
    } else {
      console.log('✨ Dry run complete. Run with --execute to apply changes.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { findDuplicateGroups, mergeDuplicates };
