import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, pool } from '../db/src/index.js';
import { envConfig } from '@sih26019/config';
import { seedDatabase } from '../db/seeds/index.js';

async function resetDevelopmentDatabase(): Promise<void> {
  // Safety guard: Reject execution in production environment
  if (envConfig.NODE_ENV === 'production') {
    console.error(
      '[DB Reset Safety Error] Database reset is strictly forbidden in production environments!',
    );
    process.exit(1);
  }

  console.log(
    `[DB Reset] Starting development database reset on: ${envConfig.NODE_ENV} environment...`,
  );

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(currentDir, '..');
  const migrationsFolder = path.resolve(rootDir, 'db/migrations');

  try {
    console.log('[DB Reset] Dropping all public schema tables and triggers...');
    await db.execute(sql`DROP SCHEMA public CASCADE;`);
    await db.execute(sql`CREATE SCHEMA public;`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);
    console.log('[DB Reset] Public schema dropped and recreated successfully.');

    console.log(`[DB Reset] Applying migrations from: ${migrationsFolder}`);
    await migrate(db, { migrationsFolder });
    console.log('[DB Reset] Migrations applied successfully.');

    console.log('[DB Reset] Executing deterministic development seeds...');
    await seedDatabase(db);
    console.log('[DB Reset] Database reset, migration, and seed completed successfully!');
  } finally {
    await pool.end();
  }
}

resetDevelopmentDatabase().catch((err) => {
  console.error('[DB Reset Fatal Error]', err);
  process.exit(1);
});
