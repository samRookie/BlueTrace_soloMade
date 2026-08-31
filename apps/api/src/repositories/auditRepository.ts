import { eq, and, sql, desc } from 'drizzle-orm';
import {
  db,
  schema,
  type AppDatabase,
  type AuditEventRow,
  type InsertAuditEventRow,
} from '@sih26019/db';
import type { AuditStatus } from '@sih26019/shared-types';

export interface AuditFilterOptions {
  actorId?: string;
  action?: string;
  status?: AuditStatus;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export class AuditRepository {
  constructor(private readonly database: AppDatabase = db) {}

  async create(eventData: InsertAuditEventRow): Promise<AuditEventRow> {
    const rows = await this.database.insert(schema.auditEvents).values(eventData).returning();

    const created = rows[0];
    if (!created) {
      throw new Error('Failed to record audit event.');
    }
    return created;
  }

  async findMany(
    filters: AuditFilterOptions,
    pagination: PaginationOptions,
  ): Promise<{ items: AuditEventRow[]; total: number }> {
    const conditions = [];

    if (filters.actorId) {
      conditions.push(eq(schema.auditEvents.actorId, filters.actorId));
    }
    if (filters.action) {
      conditions.push(eq(schema.auditEvents.action, filters.action));
    }
    if (filters.status) {
      conditions.push(eq(schema.auditEvents.status, filters.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countResult = await this.database
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(schema.auditEvents)
      .where(whereClause);

    const total = countResult[0]?.count ?? 0;

    const offset = (pagination.page - 1) * pagination.pageSize;
    const items = await this.database
      .select()
      .from(schema.auditEvents)
      .where(whereClause)
      .orderBy(desc(schema.auditEvents.createdAt))
      .limit(pagination.pageSize)
      .offset(offset);

    return {
      items,
      total,
    };
  }
}

export const defaultAuditRepository = new AuditRepository();
