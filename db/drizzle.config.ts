import { defineConfig } from 'drizzle-kit';
import { config as loadDotenv } from 'dotenv';

loadDotenv();

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sih26019_dev',
  },
});
