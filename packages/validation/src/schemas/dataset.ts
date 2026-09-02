import { z } from 'zod';
import {
  lifecycleStatusSchema,
  integrityStatusSchema,
  visibilitySchema,
  periodTypeSchema,
} from './domain.js';

export const datasetTypeSchema = z.enum([
  'LAND',
  'CLIMATE',
  'REMOTE_SENSING',
  'SOCIOECONOMIC',
  'BLUE_CARBON',
]);

export const datasetTechnicalFormatSchema = z.enum([
  'CSV',
  'GEOJSON',
  'JSON',
  'GEOTIFF',
  'PARQUET',
  'PDF',
]);

export const datasetUpdateFrequencySchema = z.enum([
  'STATIC',
  'ANNUAL',
  'QUARTERLY',
  'MONTHLY',
  'WEEKLY',
  'DAILY',
  'IRREGULAR',
]);

export const datasetAccessLevelSchema = z.enum([
  'OPEN',
  'CONTROLLED',
  'REQUEST_REQUIRED',
  'RESTRICTED',
]);

/**
 * Validator schema for querying and filtering datasets.
 */
export const datasetQuerySchema = z.object({
  q: z.string().trim().optional(),
  type: datasetTypeSchema.optional(),
  format: datasetTechnicalFormatSchema.optional(),
  accessLevel: datasetAccessLevelSchema.optional(),
  updateFrequency: datasetUpdateFrequencySchema.optional(),
  regionId: z.string().trim().optional(),
  sourceId: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  lifecycleStatus: lifecycleStatusSchema.optional(),
  integrityStatus: integrityStatusSchema.optional(),
  visibility: visibilitySchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Validator schema for creating a new dataset catalog entry.
 */
export const createDatasetSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(500),
  sourceId: z.string().trim().min(1, 'sourceId is required').max(64),
  datasetType: datasetTypeSchema,
  technicalFormat: datasetTechnicalFormatSchema,
  updateFrequency: datasetUpdateFrequencySchema,
  accessLevel: datasetAccessLevelSchema.default('OPEN'),
  spatialCoverageSummary: z.string().trim().max(1000).optional().nullable(),
  temporalCoverageStart: z.string().trim().optional().nullable(),
  temporalCoverageEnd: z.string().trim().optional().nullable(),
  periodType: periodTypeSchema.optional().nullable(),
  regionId: z.string().trim().max(64).optional().nullable(),
  gisLayerId: z.string().trim().max(64).optional().nullable(),
  projectId: z.string().trim().max(64).optional().nullable(),
  policyId: z.string().trim().max(64).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(64)).default([]),
  lifecycleStatus: lifecycleStatusSchema.default('PUBLISHED'),
  integrityStatus: integrityStatusSchema.default('VERIFIED'),
  visibility: visibilitySchema.default('PUBLIC'),
});

/**
 * Validator schema for updating dataset metadata.
 */
export const updateDatasetSchema = z.object({
  title: z.string().trim().min(3).max(500).optional(),
  datasetType: datasetTypeSchema.optional(),
  technicalFormat: datasetTechnicalFormatSchema.optional(),
  updateFrequency: datasetUpdateFrequencySchema.optional(),
  accessLevel: datasetAccessLevelSchema.optional(),
  spatialCoverageSummary: z.string().trim().max(1000).optional().nullable(),
  temporalCoverageStart: z.string().trim().optional().nullable(),
  temporalCoverageEnd: z.string().trim().optional().nullable(),
  periodType: periodTypeSchema.optional().nullable(),
  regionId: z.string().trim().max(64).optional().nullable(),
  gisLayerId: z.string().trim().max(64).optional().nullable(),
  projectId: z.string().trim().max(64).optional().nullable(),
  policyId: z.string().trim().max(64).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(64)).optional(),
  lifecycleStatus: lifecycleStatusSchema.optional(),
  integrityStatus: integrityStatusSchema.optional(),
  visibility: visibilitySchema.optional(),
});
