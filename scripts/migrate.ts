import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../db/src/index.js';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

async function runMigrations(): Promise<void> {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(currentDir, '..');
  const migrationsFolder = path.resolve(rootDir, 'db/migrations');

  console.log(`[Migration] Running migrations from: ${migrationsFolder}`);

  if (!fs.existsSync(migrationsFolder)) {
    console.log('[Migration] Migration folder does not exist. Nothing to migrate.');
    return;
  }

  const migrationFiles = fs.readdirSync(migrationsFolder).filter((f) => f.endsWith('.sql'));

  if (migrationFiles.length === 0) {
    console.log('[Migration] No SQL migration files found (0 migrations). Schema is up to date.');
    return;
  }

  try {
    await migrate(db, { migrationsFolder });
    console.log('[Migration] All migrations executed successfully.');
  } finally {
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('[Migration Error]', err);
  process.exit(1);
});
