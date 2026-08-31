import type { RegionLevel, PaginatedData } from '@sih26019/shared-types';
import type { RegionRow } from '@sih26019/db';
import {
  RegionRepository,
  defaultRegionRepository,
  type RegionFilterOptions,
  type PaginationOptions,
} from '../repositories/regionRepository.js';
import { NotFoundError } from '../errors/index.js';

export interface RegionDto {
  id: string;
  code: string;
  name: string;
  level: RegionLevel;
  parentCode: string | null;
  sampleFlag: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapRegionRowToDto(row: RegionRow): RegionDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    level: row.level as RegionLevel,
    parentCode: row.parentCode ?? null,
    sampleFlag: row.sampleFlag,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class RegionService {
  constructor(private readonly regionRepository: RegionRepository = defaultRegionRepository) {}

  /**
   * Retrieves a paginated list of regions matching the provided filters.
   */
  async listRegions(
    filters: RegionFilterOptions,
    pagination: PaginationOptions,
  ): Promise<PaginatedData<RegionDto>> {
    const { items, total } = await this.regionRepository.findMany(filters, pagination);

    const totalPages = total === 0 ? 0 : Math.ceil(total / pagination.pageSize);

    return {
      items: items.map(mapRegionRowToDto),
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages,
      },
    };
  }

  /**
   * Retrieves a single region by ID or throws NotFoundError if not found.
   */
  async getRegionById(id: string): Promise<RegionDto> {
    const row = await this.regionRepository.findById(id);

    if (!row) {
      throw new NotFoundError(`Region with ID '${id}' does not exist.`);
    }

    return mapRegionRowToDto(row);
  }
}

export const defaultRegionService = new RegionService();
