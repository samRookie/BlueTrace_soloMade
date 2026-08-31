import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchApi,
  getRegions,
  getRegionById,
  getResourceCounts,
  getDataStatus,
  getHealth,
  ApiClientError,
  NetworkError,
} from '../src/api/client.js';
import {
  getLifecycleStatusLabel,
  getIntegrityStatusLabel,
  getVisibilityLabel,
  getSourceTypeLabel,
  getRoleLabel,
} from '../src/utils/presenters.js';

describe('Web Application - Typed API Client & Presenters', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchApi', () => {
    it('successfully processes standard ApiSuccessResponse', async () => {
      const mockPayload = {
        success: true,
        data: { id: 'test-1', name: 'Example' },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPayload,
      } as unknown as Response);

      const result = await fetchApi<{ id: string; name: string }>('/api/v1/test');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: 'test-1', name: 'Example' });
      }
    });

    it('handles network failures gracefully with standard error envelope', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network disconnected'));

      const result = await fetchApi('/api/v1/test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INTERNAL_ERROR');
        expect(result.error.message).toBe('Network disconnected');
      }
    });
  });

  describe('Typed Client Helpers', () => {
    it('constructs correct query string in getRegions', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { items: [], pagination: { page: 2, pageSize: 10, total: 0, totalPages: 0 } },
        }),
      } as unknown as Response);

      await getRegions({ page: 2, pageSize: 10, level: 'DISTRICT', search: 'Coringa' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/regions?page=2&pageSize=10&level=DISTRICT&search=Coringa',
        expect.any(Object),
      );
    });

    it('encodes region ID correctly in getRegionById', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: 'SAMPLE-REG-KR-001' },
        }),
      } as unknown as Response);

      await getRegionById('SAMPLE-REG-KR-001');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/regions/SAMPLE-REG-KR-001',
        expect.any(Object),
      );
    });

    it('calls /api/v1/resources/counts in getResourceCounts', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { categories: {}, totalEntities: 16 },
        }),
      } as unknown as Response);

      await getResourceCounts();

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/resources/counts', expect.any(Object));
    });

    it('calls /api/v1/dev/data-status in getDataStatus', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { database: { connected: true, status: 'connected' } },
        }),
      } as unknown as Response);

      await getDataStatus();

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/dev/data-status', expect.any(Object));
    });

    it('returns health payload in getHealth', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'ok',
          service: 'api',
          version: '0.1.0',
          architectureVersion: '1.0',
        }),
      } as unknown as Response);

      const health = await getHealth();
      expect(health.status).toBe('ok');
    });

    it('instantiates ApiClientError and NetworkError correctly', () => {
      const err = new ApiClientError(
        { code: 'VALIDATION_ERROR', message: 'Field missing', details: { f: 1 } },
        'req-123',
      );
      expect(err.name).toBe('ApiClientError');
      expect(err.code).toBe('VALIDATION_ERROR');
      expect(err.requestId).toBe('req-123');

      const netErr = new NetworkError('Connection timeout');
      expect(netErr.name).toBe('NetworkError');
    });
  });

  describe('UI Presenters', () => {
    it('formats LifecycleStatus labels correctly', () => {
      expect(getLifecycleStatusLabel('DRAFT')).toBe('Draft');
      expect(getLifecycleStatusLabel('PUBLISHED')).toBe('Published');
    });

    it('formats IntegrityStatus labels correctly', () => {
      expect(getIntegrityStatusLabel('VERIFIED')).toBe('Verified');
      expect(getIntegrityStatusLabel('FLAGGED')).toBe('Flagged for Review');
    });

    it('formats Visibility labels correctly', () => {
      expect(getVisibilityLabel('PUBLIC')).toBe('Public Access');
      expect(getVisibilityLabel('RESTRICTED')).toBe('Restricted Access');
    });

    it('formats SourceType labels correctly', () => {
      expect(getSourceTypeLabel('GOVERNMENT_RECORD')).toBe('Government Record');
      expect(getSourceTypeLabel('SATELLITE_OBSERVATION')).toBe('Satellite Observation');
    });

    it('formats Role labels correctly', () => {
      expect(getRoleLabel('RESEARCHER')).toBe('Researcher');
      expect(getRoleLabel('ADMIN')).toBe('Administrator');
    });
  });
});
