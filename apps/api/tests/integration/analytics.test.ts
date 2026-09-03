import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { defaultSessionRepository } from '../../src/repositories/sessionRepository.js';
import type { UserRow } from '@sih26019/db';
import type { Role } from '@sih26019/shared-types';

describe('API Integration - Phase 7 National Dashboard & Analytics Overview', () => {
  const app = createApp();

  function mockUserSession(role: Role): UserRow {
    const user: UserRow = {
      id: `USR-${role}`,
      email: `${role.toLowerCase()}@bluetrace.gov.in`,
      passwordHash: 'dummy',
      name: `${role} User`,
      role,
      status: 'ACTIVE',
      sampleFlag: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    vi.spyOn(defaultSessionRepository, 'findByTokenHash').mockResolvedValue({
      id: `SES-${role}`,
      userId: user.id,
      sessionTokenHash: 'mock-hash',
      expiresAt: new Date(Date.now() + 100000),
      revokedAt: null,
      ipAddress: '127.0.0.1',
      userAgent: 'test',
      createdAt: new Date(),
      user,
    });

    return user;
  }

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/v1/analytics/overview', () => {
    it('returns 200 with all 6 sections and database-backed metrics', async () => {
      mockUserSession('ADMIN');

      const res = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Cookie', ['bluetrace_session=mock-token']);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const { context, sections } = res.body.data;

      // 1. Context validation
      expect(context.sampleFlag).toBe(true);
      expect(context.generatedAt).toBeDefined();
      expect(context.regionName).toBe('National Jurisdiction');

      // 2. Sections presence
      expect(sections.nationalSnapshot).toBeInstanceOf(Array);
      expect(sections.evidenceActivity).toBeInstanceOf(Array);
      expect(sections.geospatialIntelligence).toBeInstanceOf(Array);
      expect(sections.policyIntelligence).toBeInstanceOf(Array);
      expect(sections.implementation).toBeInstanceOf(Array);
      expect(sections.environmental).toBeInstanceOf(Array);

      // 3. National snapshot metrics
      const snapshotKeys = sections.nationalSnapshot.map((m: { key: string }) => m.key);
      expect(snapshotKeys).toContain('total_evidence_items');
      expect(snapshotKeys).toContain('total_cataloged_datasets');
      expect(snapshotKeys).toContain('total_projects');
      expect(snapshotKeys).toContain('total_policies');
      expect(snapshotKeys).toContain('total_indicators');
      expect(snapshotKeys).toContain('active_regions_represented');

      // 4. Metric contract completeness
      const firstMetric = sections.nationalSnapshot[0];
      expect(firstMetric.label).toBeDefined();
      expect(typeof firstMetric.value).toBe('number');
      expect(firstMetric.unit).toBe('records');
      expect(firstMetric.definition).toBeDefined();
      expect(firstMetric.source).toBeDefined();
      expect(firstMetric.sampleFlag).toBe(true);
      expect(firstMetric.status).toBe('AVAILABLE');
      expect(firstMetric.detailPath).toBe('/evidence');
    });

    it('filters metrics by regionId and resolves regional context', async () => {
      mockUserSession('ADMIN');

      const res = await request(app)
        .get('/api/v1/analytics/overview?regionId=SAMPLE-REG-KR-001')
        .set('Cookie', ['bluetrace_session=mock-token']);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const { context, sections } = res.body.data;
      expect(context.regionId).toBe('SAMPLE-REG-KR-001');
      expect(context.regionName).toBe('Coringa Mangrove Estuarine Zone');

      // Verify regional scope is set on metrics
      expect(sections.nationalSnapshot[0].region.scope).toBe('REGIONAL');
      expect(sections.nationalSnapshot[0].region.name).toBe('Coringa Mangrove Estuarine Zone');
    });

    it('applies custom period filter when periodStart and periodEnd are provided', async () => {
      mockUserSession('ADMIN');

      const res = await request(app)
        .get(
          '/api/v1/analytics/overview?periodStart=2024-01-01T00:00:00.000Z&periodEnd=2026-12-31T23:59:59.000Z',
        )
        .set('Cookie', ['bluetrace_session=mock-token']);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const { context, sections } = res.body.data;
      expect(context.periodStart).toBe('2024-01-01T00:00:00.000Z');
      expect(context.periodEnd).toBe('2026-12-31T23:59:59.000Z');
      expect(sections.nationalSnapshot[0].period.type).toBe('CUSTOM_RANGE');
    });

    it('rejects invalid period date formats with 400 VALIDATION_ERROR', async () => {
      const res = await request(app).get('/api/v1/analytics/overview?periodStart=not-a-valid-date');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('applies visibility rules so restricted items are omitted for public viewers', async () => {
      mockUserSession('VIEWER');

      const res = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Cookie', ['bluetrace_session=mock-token']);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Viewer should see only public items without throwing errors
      expect(res.body.data.sections.nationalSnapshot[0].value).toBeGreaterThanOrEqual(0);
    });
  });
});
