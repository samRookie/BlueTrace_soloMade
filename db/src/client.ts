import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { dbConfig } from '@sih26019/config';
import * as schema from './schema.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: dbConfig.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });
export type AppDatabase = NodePgDatabase<typeof schema>;

/**
 * Creates a Drizzle database instance from an arbitrary pg Client or Pool.
 */
export function createDatabaseClient(pgClient: pg.Pool | pg.Client): AppDatabase {
  return drizzle(pgClient, { schema });
}
