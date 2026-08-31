import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { defaultRegionRepository } from '../../src/repositories/regionRepository.js';
import type { RegionRow } from '@sih26019/db';

describe('API Integration - /api/v1/regions', () => {
  const app = createApp();

  const mockRegionRow: RegionRow = {
    id: 'SAMPLE-REG-KR-001',
    code: 'IN-AP-CORINGA',
    name: 'Coringa Mangrove Estuarine Zone',
    level: 'DISTRICT',
    parentCode: null,
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/v1/regions', () => {
    it('returns a paginated list of regions with response metadata and x-request-id header', async () => {
      vi.spyOn(defaultRegionRepository, 'findMany').mockResolvedValue({
        items: [mockRegionRow],
        total: 1,
      });

      const response = await request(app).get('/api/v1/regions?page=1&pageSize=10');

      expect(response.status).toBe(200);
      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toEqual([
        {
          id: 'SAMPLE-REG-KR-001',
          code: 'IN-AP-CORINGA',
          name: 'Coringa Mangrove Estuarine Zone',
          level: 'DISTRICT',
          parentCode: null,
          sampleFlag: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ]);
      expect(response.body.data.pagination).toEqual({
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      });
      expect(response.body.meta).toHaveProperty('requestId');
    });

    it('rejects pageSize exceeding maximum 100 with 400 VALIDATION_ERROR', async () => {
      const response = await request(app).get('/api/v1/regions?pageSize=250');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Request validation failed.');
    });

    it('rejects invalid level enum query parameter with 400 VALIDATION_ERROR', async () => {
      const response = await request(app).get('/api/v1/regions?level=INVALID_LEVEL');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/regions/:id', () => {
    it('returns single region DTO when valid ID is found', async () => {
      vi.spyOn(defaultRegionRepository, 'findById').mockResolvedValue(mockRegionRow);

      const response = await request(app).get('/api/v1/regions/SAMPLE-REG-KR-001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('SAMPLE-REG-KR-001');
      expect(response.body.data.name).toBe('Coringa Mangrove Estuarine Zone');
    });

    it('returns 404 NOT_FOUND when region ID does not exist', async () => {
      vi.spyOn(defaultRegionRepository, 'findById').mockResolvedValue(null);

      const response = await request(app).get('/api/v1/regions/NONEXISTENT-ID');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toContain(
        "Region with ID 'NONEXISTENT-ID' does not exist.",
      );
    });
  });
});
