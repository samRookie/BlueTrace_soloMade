import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { dbConfig } from '@sih26019/config';
import * as schema from './schema.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: dbConfig.url,
});

export const db = drizzle(pool, { schema });
