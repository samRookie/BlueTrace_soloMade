import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dbConfig } from '@sih26019/config';

function checkMigrationStatus(): void {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(currentDir, '..');
  const migrationsFolder = path.resolve(rootDir, 'db/migrations');

  console.log('[Migration Status] Checking database migration status...');
  console.log(
    `[Migration Status] Target database URL: ${dbConfig.url.replace(/:[^:@]+@/, ':****@')}`,
  );
  console.log(`[Migration Status] Migrations directory: ${migrationsFolder}`);

  if (!fs.existsSync(migrationsFolder)) {
    console.log('[Migration Status] Migrations directory does not exist.');
    return;
  }

  const migrationFiles = fs.readdirSync(migrationsFolder).filter((f) => f.endsWith('.sql'));

  console.log(`[Migration Status] Local migration files detected: ${migrationFiles.length}`);
  if (migrationFiles.length === 0) {
    console.log('[Migration Status] No migration files found.');
  } else {
    migrationFiles.forEach((file, idx) => {
      console.log(`  ${idx + 1}. ${file}`);
    });
  }
}

checkMigrationStatus();
