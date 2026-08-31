import { z } from 'zod';
import type {
  IsoTimestamp,
  LifecycleStatus,
  IntegrityStatus,
  Visibility,
  OwnerType,
  OwnerReference,
  SourceType,
  SourceReference,
  ProvenanceMetadata,
  RegionLevel,
  RegionReference,
  PeriodType,
  EvidencePeriod,
  EvidenceRelationshipType,
  EvidenceRelationship,
  Role,
} from '@sih26019/shared-types';

/**
 * ISO 8601 UTC timestamp validator.
 */
export const isoTimestampSchema = z.string().datetime({
  offset: true,
  message: 'Must be a valid ISO 8601 UTC timestamp.',
}) satisfies z.ZodType<IsoTimestamp>;

/**
 * Sample flag validator schema.
 */
export const sampleFlagSchema = z.boolean();

/**
 * Lifecycle status validator schema.
 */
export const lifecycleStatusSchema = z.enum([
  'DRAFT',
  'IN_REVIEW',
  'PUBLISHED',
  'ARCHIVED',
  'DEPRECATED',
]) satisfies z.ZodType<LifecycleStatus>;

/**
 * Integrity status validator schema.
 */
export const integrityStatusSchema = z.enum([
  'UNVERIFIED',
  'VERIFIED',
  'FLAGGED',
  'INVALID',
]) satisfies z.ZodType<IntegrityStatus>;

/**
 * Combined entity status schema.
 */
export const entityStatusSchema = z.object({
  lifecycle: lifecycleStatusSchema,
  integrity: integrityStatusSchema,
});

/**
 * Visibility validator schema.
 */
export const visibilitySchema = z.enum([
  'PUBLIC',
  'RESTRICTED',
  'INTERNAL',
]) satisfies z.ZodType<Visibility>;

/**
 * Owner type validator schema.
 */
export const ownerTypeSchema = z.enum([
  'INDIVIDUAL',
  'ORGANIZATION',
  'INSTITUTION',
  'SYSTEM',
]) satisfies z.ZodType<OwnerType>;

/**
 * Owner reference validator schema.
 */
export const ownerReferenceSchema = z.object({
  ownerId: z.string().min(1, 'ownerId is required'),
  ownerType: ownerTypeSchema,
  displayName: z.string().optional(),
}) satisfies z.ZodType<OwnerReference>;

/**
 * Source type validator schema.
 */
export const sourceTypeSchema = z.enum([
  'GOVERNMENT_RECORD',
  'SATELLITE_OBSERVATION',
  'RESEARCH_PUBLICATION',
  'OFFICIAL_SURVEY',
  'COMMUNITY_REPORT',
  'OTHER',
]) satisfies z.ZodType<SourceType>;

/**
 * Source reference validator schema.
 */
export const sourceReferenceSchema = z.object({
  sourceId: z.string().min(1, 'sourceId is required'),
  title: z.string().min(1, 'title is required'),
  sourceType: sourceTypeSchema,
  publisher: z.string().optional(),
  uri: z.string().url().optional(),
  attribution: z.string().optional(),
  obtainedAt: isoTimestampSchema.optional(),
}) satisfies z.ZodType<SourceReference>;

/**
 * Provenance metadata validator schema.
 */
export const provenanceMetadataSchema = z.object({
  originSource: sourceReferenceSchema,
  producedBy: ownerReferenceSchema.optional(),
  capturedAt: isoTimestampSchema,
  transformationContext: z.string().optional(),
  checksum: z.string().optional(),
}) satisfies z.ZodType<ProvenanceMetadata>;

/**
 * Region level validator schema.
 */
export const regionLevelSchema = z.enum([
  'COUNTRY',
  'STATE',
  'DISTRICT',
  'SUB_DISTRICT',
  'LOCAL',
]) satisfies z.ZodType<RegionLevel>;

/**
 * Region reference validator schema.
 */
export const regionReferenceSchema = z.object({
  code: z.string().min(1, 'code is required'),
  name: z.string().min(1, 'name is required'),
  level: regionLevelSchema,
  parentCode: z.string().optional(),
}) satisfies z.ZodType<RegionReference>;

/**
 * Period type validator schema.
 */
export const periodTypeSchema = z.enum([
  'POINT_IN_TIME',
  'DATE_RANGE',
  'ANNUAL',
  'QUARTERLY',
  'MONTHLY',
]) satisfies z.ZodType<PeriodType>;

/**
 * Evidence period validator schema.
 */
export const evidencePeriodSchema = z.object({
  type: periodTypeSchema,
  startDate: isoTimestampSchema,
  endDate: isoTimestampSchema.optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  month: z.number().int().min(1).max(12).optional(),
}) satisfies z.ZodType<EvidencePeriod>;

/**
 * Evidence relationship type validator schema.
 */
export const evidenceRelationshipTypeSchema = z.enum([
  'SUPPORTS',
  'DERIVED_FROM',
  'REFERENCES',
  'SUPERSEDES',
  'CORROBORATES',
  'CONTRADICTS',
]) satisfies z.ZodType<EvidenceRelationshipType>;

/**
 * Evidence relationship validator schema.
 */
export const evidenceRelationshipSchema = z.object({
  relationshipId: z.string().min(1, 'relationshipId is required'),
  sourceId: z.string().min(1, 'sourceId is required'),
  targetId: z.string().min(1, 'targetId is required'),
  type: evidenceRelationshipTypeSchema,
  createdAt: isoTimestampSchema,
  metadata: z.record(z.unknown()).optional(),
}) satisfies z.ZodType<EvidenceRelationship>;

/**
 * Role vocabulary validator schema.
 */
export const roleSchema = z.enum([
  'ADMIN',
  'RESEARCHER',
  'ANALYST',
  'REVIEWER',
  'PUBLISHER',
  'VIEWER',
]) satisfies z.ZodType<Role>;
