import { z } from 'zod';
import type { HealthCheckResponse } from '@sih26019/shared-types';

/**
 * Health check response validation schema.
 */
export const healthCheckResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('api'),
  version: z.string().min(1),
}) satisfies z.ZodType<HealthCheckResponse>;

export type ValidatedHealthCheckResponse = z.infer<typeof healthCheckResponseSchema>;
