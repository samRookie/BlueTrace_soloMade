import { z } from 'zod';
import {
  lifecycleStatusSchema,
  integrityStatusSchema,
  visibilitySchema,
  sourceTypeSchema,
  evidenceRelationshipTypeSchema,
} from './domain.js';

export const evidenceCategorySchema = z.enum([
  'RESEARCH_PAPER',
  'POLICY_DOCUMENT',
  'LEGAL_FRAMEWORK',
  'DATASET',
  'CASE_STUDY',
  'GOVERNMENT_REPORT',
  'PROJECT_REPORT',
  'ACADEMIC_PUBLICATION',
]);

/**
 * Validator schema for querying and filtering evidence resources.
 */
export const evidenceQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  sourceType: sourceTypeSchema.optional(),
  lifecycleStatus: lifecycleStatusSchema.optional(),
  integrityStatus: integrityStatusSchema.optional(),
  visibility: visibilitySchema.optional(),
  projectId: z.string().trim().optional(),
  policyId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Validator schema for registering new evidence items.
 */
export const createEvidenceSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(500),
  category: z.string().trim().min(2, 'Category is required').max(64),
  sourceId: z.string().trim().min(1, 'sourceId is required').max(64),
  projectId: z.string().trim().max(64).optional().nullable(),
  policyId: z.string().trim().max(64).optional().nullable(),
  lifecycleStatus: lifecycleStatusSchema.default('PUBLISHED'),
  integrityStatus: integrityStatusSchema.default('VERIFIED'),
  visibility: visibilitySchema.default('PUBLIC'),
});

/**
 * Validator schema for linking evidence items with a directed relationship.
 */
export const createRelationshipSchema = z.object({
  targetEvidenceId: z.string().trim().min(1, 'targetEvidenceId is required').max(64),
  relationshipType: evidenceRelationshipTypeSchema,
});

/**
 * Validator schema for file upload metadata and constraints.
 */
export const attachmentUploadMetadataSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(3).max(128),
  fileSize: z.number().int().min(1).max(10485760, 'File size exceeds maximum limit of 10MB'),
});
