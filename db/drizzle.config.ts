import { defineConfig } from 'drizzle-kit';
import { dbConfig } from '@sih26019/config';

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbConfig.url,
  },
});
