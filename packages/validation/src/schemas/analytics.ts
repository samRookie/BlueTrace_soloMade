import { z } from 'zod';

export const metricUnitSchema = z.enum([
  'count',
  'percent',
  'hectares',
  'records',
  'projects',
  'datasets',
  'tonnes_co2e',
]);

export const metricStatusSchema = z.enum(['AVAILABLE', 'PARTIAL', 'SAMPLE', 'UNAVAILABLE']);

export const metricScopeSchema = z.enum(['NATIONAL', 'REGIONAL']);

export const analyticsQuerySchema = z.object({
  regionId: z.string().trim().min(1).max(64).optional(),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
  sampleFlag: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => (typeof val === 'boolean' ? val : val === 'true'))
    .optional(),
});
