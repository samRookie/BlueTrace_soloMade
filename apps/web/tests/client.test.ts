import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchApi } from '../src/api/client.js';
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
