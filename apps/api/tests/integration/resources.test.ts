import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { defaultResourceRepository } from '../../src/repositories/resourceRepository.js';

describe('API Integration - /api/v1/resources', () => {
  const app = createApp();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/v1/resources/counts', () => {
    it('returns aggregate counts and total entities wrapped in standard response envelope', async () => {
      vi.spyOn(defaultResourceRepository, 'getCounts').mockResolvedValue({
        sources: 2,
        regions: 1,
        workspaces: 1,
        policies: 1,
        indicators: 1,
        gisLayers: 1,
        projects: 1,
        innovationOpportunities: 1,
        blueCarbonProjects: 1,
        mrvRecords: 1,
        verificationRecords: 1,
        integrityRecords: 1,
        disputes: 1,
        evidenceItems: 2,
        evidenceRelationships: 1,
      });

      const response = await request(app).get('/api/v1/resources/counts');

      expect(response.status).toBe(200);
      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalEntities).toBe(17);
      expect(response.body.data.categories.regions).toBe(1);
      expect(response.body.data.categories.sources).toBe(2);
      expect(response.body.meta?.requestId).toBe(response.headers['x-request-id']);
    });
  });
});
