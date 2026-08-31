import { describe, it, expect, vi } from 'vitest';
import { ResourceService } from '../../src/services/resourceService.js';
import { ResourceRepository } from '../../src/repositories/resourceRepository.js';

describe('ResourceService', () => {
  const mockCounts = {
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
  };

  it('calculates total entities sum across all categories in getResourceCounts', async () => {
    const mockRepo = {
      getCounts: vi.fn().mockResolvedValue(mockCounts),
      checkHealth: vi.fn(),
    } as unknown as ResourceRepository;

    const service = new ResourceService(mockRepo);
    const result = await service.getResourceCounts();

    expect(result.categories).toEqual(mockCounts);
    expect(result.totalEntities).toBe(17);
  });

  it('evaluates sampleDataSeeded to true when core entities exist in getDataStatus', async () => {
    const mockRepo = {
      getCounts: vi.fn().mockResolvedValue(mockCounts),
      checkHealth: vi
        .fn()
        .mockResolvedValue({ connected: true, timestamp: '2026-08-31T00:00:00.000Z' }),
    } as unknown as ResourceRepository;

    const service = new ResourceService(mockRepo);
    const result = await service.getDataStatus();

    expect(result.database.connected).toBe(true);
    expect(result.database.status).toBe('connected');
    expect(result.sampleDataSeeded).toBe(true);
    expect(result.architectureVersion).toBe('1.0');
  });
});
