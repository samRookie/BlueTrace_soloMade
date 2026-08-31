import { describe, it, expect, vi } from 'vitest';
import { RegionService } from '../../src/services/regionService.js';
import { RegionRepository } from '../../src/repositories/regionRepository.js';
import { NotFoundError } from '../../src/errors/index.js';
import type { RegionRow } from '@sih26019/db';

describe('RegionService', () => {
  const mockRegionRow: RegionRow = {
    id: 'SAMPLE-REG-001',
    code: 'IN-AP-CORINGA',
    name: 'Coringa Mangrove Estuarine Zone',
    level: 'DISTRICT',
    parentCode: null,
    sampleFlag: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  it('calculates totalPages and maps items to DTOs in listRegions', async () => {
    const mockRepo = {
      findMany: vi.fn().mockResolvedValue({
        items: [mockRegionRow],
        total: 1,
      }),
      findById: vi.fn(),
      findByCode: vi.fn(),
    } as unknown as RegionRepository;

    const service = new RegionService(mockRepo);
    const result = await service.listRegions({ level: 'DISTRICT' }, { page: 1, pageSize: 20 });

    expect(result.items.length).toBe(1);
    expect(result.items[0]?.id).toBe('SAMPLE-REG-001');
    expect(result.items[0]?.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it('throws NotFoundError when region is not found by ID', async () => {
    const mockRepo = {
      findMany: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findByCode: vi.fn(),
    } as unknown as RegionRepository;

    const service = new RegionService(mockRepo);

    await expect(service.getRegionById('NONEXISTENT')).rejects.toThrow(NotFoundError);
  });
});
