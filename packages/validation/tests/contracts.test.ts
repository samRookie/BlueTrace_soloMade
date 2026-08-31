import { describe, it, expect } from 'vitest';
import {
  isoTimestampSchema,
  sourceReferenceSchema,
  sourceTypeSchema,
  lifecycleStatusSchema,
  integrityStatusSchema,
  visibilitySchema,
  ownerReferenceSchema,
  ownerTypeSchema,
  provenanceMetadataSchema,
  regionReferenceSchema,
  regionLevelSchema,
  evidencePeriodSchema,
  periodTypeSchema,
  evidenceRelationshipSchema,
  evidenceRelationshipTypeSchema,
  roleSchema,
  createApiSuccessResponseSchema,
  apiErrorResponseSchema,
  apiErrorCodeSchema,
  z,
} from '../src/index.js';

describe('Phase 1 Domain & API Validation Contracts', () => {
  describe('Timestamp Validation', () => {
    it('accepts valid ISO 8601 UTC timestamp', () => {
      const valid = '2026-08-31T12:00:00.000Z';
      expect(isoTimestampSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects invalid timestamp string', () => {
      const invalid = 'not-a-timestamp';
      expect(isoTimestampSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('Status & Visibility Vocabulary', () => {
    it('validates standard LifecycleStatus values', () => {
      const validStatuses = ['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED', 'DEPRECATED'];
      for (const status of validStatuses) {
        expect(lifecycleStatusSchema.safeParse(status).success).toBe(true);
      }
      expect(lifecycleStatusSchema.safeParse('PENDING').success).toBe(false);
    });

    it('validates standard IntegrityStatus values', () => {
      const validIntegrity = ['UNVERIFIED', 'VERIFIED', 'FLAGGED', 'INVALID'];
      for (const status of validIntegrity) {
        expect(integrityStatusSchema.safeParse(status).success).toBe(true);
      }
      expect(integrityStatusSchema.safeParse('UNKNOWN').success).toBe(false);
    });

    it('validates standard Visibility values', () => {
      const validVisibility = ['PUBLIC', 'RESTRICTED', 'INTERNAL'];
      for (const vis of validVisibility) {
        expect(visibilitySchema.safeParse(vis).success).toBe(true);
      }
      expect(visibilitySchema.safeParse('PRIVATE').success).toBe(false);
    });
  });

  describe('Owner & Source Contracts', () => {
    it('validates valid OwnerReference', () => {
      const owner = {
        ownerId: 'inst-101',
        ownerType: 'INSTITUTION',
        displayName: 'National Land Survey Office',
      };
      const result = ownerReferenceSchema.safeParse(owner);
      expect(result.success).toBe(true);
    });

    it('rejects invalid OwnerType', () => {
      expect(ownerTypeSchema.safeParse('BOT').success).toBe(false);
    });

    it('validates valid SourceReference', () => {
      const source = {
        sourceId: 'src-satellite-2026',
        title: 'High Resolution Coastal Land Scan 2026',
        sourceType: 'SATELLITE_OBSERVATION',
        publisher: 'Space Agency',
        obtainedAt: '2026-08-31T06:00:00.000Z',
      };
      const result = sourceReferenceSchema.safeParse(source);
      expect(result.success).toBe(true);
    });

    it('rejects invalid SourceType', () => {
      expect(sourceTypeSchema.safeParse('WIKIPEDIA').success).toBe(false);
    });
  });

  describe('Provenance Metadata Contract', () => {
    it('validates complete ProvenanceMetadata', () => {
      const provenance = {
        originSource: {
          sourceId: 'src-001',
          title: 'Official Cadastral Survey 2025',
          sourceType: 'OFFICIAL_SURVEY',
        },
        producedBy: {
          ownerId: 'dept-survey-gov',
          ownerType: 'INSTITUTION',
        },
        capturedAt: '2026-08-31T08:00:00.000Z',
        transformationContext: 'Normalized coordinate projection',
        checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      };
      const result = provenanceMetadataSchema.safeParse(provenance);
      expect(result.success).toBe(true);
    });
  });

  describe('Regional & Period Contracts', () => {
    it('validates RegionReference across hierarchy levels', () => {
      const levels = ['COUNTRY', 'STATE', 'DISTRICT', 'SUB_DISTRICT', 'LOCAL'];
      for (const level of levels) {
        expect(regionLevelSchema.safeParse(level).success).toBe(true);
      }

      const region = {
        code: 'IN-AP-01',
        name: 'Visakhapatnam',
        level: 'DISTRICT',
        parentCode: 'IN-AP',
      };
      expect(regionReferenceSchema.safeParse(region).success).toBe(true);
    });

    it('validates EvidencePeriod models', () => {
      const periodTypes = ['POINT_IN_TIME', 'DATE_RANGE', 'ANNUAL', 'QUARTERLY', 'MONTHLY'];
      for (const pt of periodTypes) {
        expect(periodTypeSchema.safeParse(pt).success).toBe(true);
      }

      const period = {
        type: 'ANNUAL',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.999Z',
        year: 2026,
      };
      expect(evidencePeriodSchema.safeParse(period).success).toBe(true);
    });
  });

  describe('Evidence Relationship Contract', () => {
    it('validates all supported EvidenceRelationship types', () => {
      const types = [
        'SUPPORTS',
        'DERIVED_FROM',
        'REFERENCES',
        'SUPERSEDES',
        'CORROBORATES',
        'CONTRADICTS',
      ];
      for (const t of types) {
        expect(evidenceRelationshipTypeSchema.safeParse(t).success).toBe(true);
      }
      expect(evidenceRelationshipTypeSchema.safeParse('LIKES').success).toBe(false);
    });

    it('validates valid EvidenceRelationship record', () => {
      const rel = {
        relationshipId: 'rel-5001',
        sourceId: 'ev-item-A',
        targetId: 'ev-item-B',
        type: 'CORROBORATES',
        createdAt: '2026-08-31T09:00:00.000Z',
        metadata: { confidenceScore: 0.98 },
      };
      const result = evidenceRelationshipSchema.safeParse(rel);
      expect(result.success).toBe(true);
    });
  });

  describe('Role Vocabulary', () => {
    it('validates standard platform roles', () => {
      const roles = [
        'ADMIN',
        'POLICY_OFFICER',
        'RESEARCHER',
        'ANALYST',
        'VERIFIER',
        'COMMUNITY_LEAD',
        'DISPUTE_MEDIATOR',
        'VIEWER',
      ];
      for (const role of roles) {
        expect(roleSchema.safeParse(role).success).toBe(true);
      }
      expect(roleSchema.safeParse('SUPERUSER').success).toBe(false);
    });
  });

  describe('API Response Envelope & Error Models', () => {
    it('validates standard ApiSuccessResponse', () => {
      const successSchema = createApiSuccessResponseSchema(z.object({ sampleName: z.string() }));
      const validPayload = {
        success: true,
        data: { sampleName: 'Contract Verification Sample' },
        meta: { page: 1, limit: 10, total: 1, timestamp: '2026-08-31T10:00:00.000Z' },
      };
      const result = successSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('validates standard ApiErrorResponse with valid ApiErrorCode', () => {
      const errorCodes = [
        'VALIDATION_ERROR',
        'UNAUTHORIZED',
        'FORBIDDEN',
        'NOT_FOUND',
        'CONFLICT',
        'BAD_REQUEST',
        'INTERNAL_ERROR',
        'SERVICE_UNAVAILABLE',
      ];
      for (const code of errorCodes) {
        expect(apiErrorCodeSchema.safeParse(code).success).toBe(true);
      }

      const errorPayload = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Required field is missing.',
          details: [{ field: 'sourceId', issue: 'Required' }],
        },
      };
      const result = apiErrorResponseSchema.safeParse(errorPayload);
      expect(result.success).toBe(true);
    });

    it('rejects invalid error code in ApiErrorResponse', () => {
      const invalidErrorPayload = {
        success: false,
        error: {
          code: 'UNKNOWN_CODE',
          message: 'Something failed.',
        },
      };
      const result = apiErrorResponseSchema.safeParse(invalidErrorPayload);
      expect(result.success).toBe(false);
    });
  });
});
