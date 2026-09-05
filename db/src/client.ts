import { drizzle as pgliteDrizzle, type PgliteDatabase } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as schema from './schema.js';
import { coastalMangroveSeedData } from '../seeds/coastal-mangrove.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type AppDatabase = PgliteDatabase<typeof schema>;

// Initialize embedded PostgreSQL engine (PGlite)
export const pglite = new PGlite();
export const db: AppDatabase = pgliteDrizzle(pglite, { schema });

// Load and execute SQL migrations on startup
const migrationsFolder = path.resolve(__dirname, '../migrations');
if (fs.existsSync(migrationsFolder)) {
  const migrationFiles = fs
    .readdirSync(migrationsFolder)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const sqlContent = fs.readFileSync(path.join(migrationsFolder, file), 'utf8');
    const statements = sqlContent
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await pglite.exec(statement);
    }
  }
}

// Seed the embedded instance deterministically with sample records
for (const item of coastalMangroveSeedData.sources) {
  await db.insert(schema.sources).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.regions) {
  await db.insert(schema.regions).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.workspaces) {
  await db.insert(schema.workspaces).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.policies) {
  await db.insert(schema.policies).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.indicators) {
  await db.insert(schema.indicators).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.gisLayers) {
  await db.insert(schema.gisLayers).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.projects) {
  await db.insert(schema.projects).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.innovationOpportunities) {
  await db.insert(schema.innovationOpportunities).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.blueCarbonProjects) {
  await db.insert(schema.blueCarbonProjects).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.mrvRecords) {
  await db.insert(schema.mrvRecords).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.verificationRecords) {
  await db.insert(schema.verificationRecords).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.integrityRecords) {
  await db.insert(schema.integrityRecords).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.disputes) {
  await db.insert(schema.disputes).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.evidenceItems) {
  await db.insert(schema.evidenceItems).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.evidenceRelationships) {
  await db.insert(schema.evidenceRelationships).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.users) {
  await db.insert(schema.users).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.workspaceMemberships) {
  await db.insert(schema.workspaceMemberships).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.evidenceAttachments) {
  await db.insert(schema.evidenceAttachments).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.datasetMetadata) {
  await db.insert(schema.datasetMetadata).values(item).onConflictDoNothing();
}
for (const item of coastalMangroveSeedData.gisFeatures) {
  await db.insert(schema.gisFeatures).values(item).onConflictDoNothing();
}

// Backward-compatible pool lifecycle interface
export const pool = {
  end: async (): Promise<void> => {
    if (pglite) {
      await pglite.close();
    }
  },
};

/**
 * Creates a Drizzle database instance from an arbitrary PGlite client.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDatabaseClient(clientInstance?: any): AppDatabase {
  if (clientInstance) {
    return pgliteDrizzle(clientInstance, { schema });
  }
  return db;
}
