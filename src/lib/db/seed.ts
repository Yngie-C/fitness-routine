import { db } from './index';
import { exercises } from './schema';
import { seedExercises } from './seed-exercises';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Insert seed exercises
    console.log('📝 Inserting exercises...');
    await db.insert(exercises).values(seedExercises);
    console.log(`✅ Inserted ${seedExercises.length} exercises`);

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
