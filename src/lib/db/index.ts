import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

// Only create client if we have a valid connection string and not during build
const isValidConnection = connectionString && connectionString !== 'your_database_url_here';

let client: any = null;
let db: any = null;

if (isValidConnection) {
  try {
    client = postgres(connectionString);
    db = drizzle(client, { schema });
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    throw error;
  }
} else {
  // Placeholder for build time - will throw error at runtime if actually used
  db = new Proxy({} as any, {
    get() {
      throw new Error('Database connection not initialized. Please set DATABASE_URL environment variable.');
    }
  });
}

export { db };
