import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file if available
loadDotenv();

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z
    .string()
    .default('3001')
    .transform((val) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed <= 0 || parsed > 65535) {
        throw new Error(`Invalid API_PORT: ${val}. Must be a valid port number (1-65535).`);
      }
      return parsed;
    }),
  WEB_PORT: z
    .string()
    .default('5173')
    .transform((val) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed <= 0 || parsed > 65535) {
        throw new Error(`Invalid WEB_PORT: ${val}. Must be a valid port number (1-65535).`);
      }
      return parsed;
    }),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/sih26019_dev'),
});

export type Environment = z.infer<typeof environmentSchema>;

/**
 * Parses and validates environment variables.
 * @param env - Source environment dictionary (defaults to process.env)
 * @returns Validated environment object
 */
export function parseConfig(env: Record<string, string | undefined> = process.env): Environment {
  const result = environmentSchema.safeParse(env);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Configuration Error: Invalid environment variables:\n${errorDetails}`);
  }
  return result.data;
}

export const envConfig = parseConfig();

export const apiConfig = {
  port: envConfig.API_PORT,
  nodeEnv: envConfig.NODE_ENV,
  isProduction: envConfig.NODE_ENV === 'production',
  isTest: envConfig.NODE_ENV === 'test',
  isDevelopment: envConfig.NODE_ENV === 'development',
};

export const webConfig = {
  port: envConfig.WEB_PORT,
  nodeEnv: envConfig.NODE_ENV,
};

export const dbConfig = {
  url: envConfig.DATABASE_URL,
};
