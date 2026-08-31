import { eq, sql, and, or, ilike } from 'drizzle-orm';
import { db, schema, type AppDatabase, type RegionRow } from '@sih26019/db';
import type { RegionLevel } from '@sih26019/shared-types';

export interface RegionFilterOptions {
  level?: RegionLevel;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedRegions {
  items: RegionRow[];
  total: number;
}

export class RegionRepository {
  constructor(private readonly database: AppDatabase = db) {}

  /**
   * Retrieves paginated regions with optional level and search filtering.
   */
  async findMany(
    filters: RegionFilterOptions,
    pagination: PaginationOptions,
  ): Promise<PaginatedRegions> {
    const conditions = [];

    if (filters.level) {
      conditions.push(eq(schema.regions.level, filters.level));
    }

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(ilike(schema.regions.name, searchPattern), ilike(schema.regions.code, searchPattern)),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 1. Total count query
    const countResult = await this.database
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(schema.regions)
      .where(whereClause);

    const total = countResult[0]?.count ?? 0;

    // 2. Paginated rows query
    const offset = (pagination.page - 1) * pagination.pageSize;
    const items = await this.database
      .select()
      .from(schema.regions)
      .where(whereClause)
      .orderBy(schema.regions.name)
      .limit(pagination.pageSize)
      .offset(offset);

    return {
      items,
      total,
    };
  }

  /**
   * Retrieves a single region by primary key ID.
   */
  async findById(id: string): Promise<RegionRow | null> {
    const rows = await this.database
      .select()
      .from(schema.regions)
      .where(eq(schema.regions.id, id))
      .limit(1);

    return rows[0] || null;
  }

  /**
   * Retrieves a single region by unique administrative code.
   */
  async findByCode(code: string): Promise<RegionRow | null> {
    const rows = await this.database
      .select()
      .from(schema.regions)
      .where(eq(schema.regions.code, code))
      .limit(1);

    return rows[0] || null;
  }
}

export const defaultRegionRepository = new RegionRepository();
