import { eq, or, and, inArray, sql } from 'drizzle-orm';
import { db, schema, type AppDatabase, type WorkspaceRow } from '@sih26019/db';

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export class WorkspaceRepository {
  constructor(private readonly database: AppDatabase = db) {}

  async findManyForUser(
    userId: string,
    isGlobalAdmin = false,
    pagination: PaginationOptions = { page: 1, pageSize: 20 },
  ): Promise<{ items: WorkspaceRow[]; total: number }> {
    let whereClause = undefined;

    if (!isGlobalAdmin) {
      const memberships = await this.database
        .select({ workspaceId: schema.workspaceMemberships.workspaceId })
        .from(schema.workspaceMemberships)
        .where(eq(schema.workspaceMemberships.userId, userId));

      const memberWorkspaceIds = memberships.map((m) => m.workspaceId);

      const conditions = [
        eq(schema.workspaces.ownerId, userId),
        eq(schema.workspaces.visibility, 'PUBLIC'),
      ];

      if (memberWorkspaceIds.length > 0) {
        conditions.push(inArray(schema.workspaces.id, memberWorkspaceIds));
      }

      whereClause = or(...conditions);
    }

    const countResult = await this.database
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(schema.workspaces)
      .where(whereClause);

    const total = countResult[0]?.count ?? 0;

    const offset = (pagination.page - 1) * pagination.pageSize;
    const items = await this.database
      .select()
      .from(schema.workspaces)
      .where(whereClause)
      .orderBy(schema.workspaces.name)
      .limit(pagination.pageSize)
      .offset(offset);

    return {
      items,
      total,
    };
  }

  async findById(id: string): Promise<WorkspaceRow | null> {
    const rows = await this.database
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, id))
      .limit(1);

    return rows[0] || null;
  }

  async isMember(workspaceId: string, userId: string): Promise<boolean> {
    const rows = await this.database
      .select()
      .from(schema.workspaceMemberships)
      .where(
        and(
          eq(schema.workspaceMemberships.workspaceId, workspaceId),
          eq(schema.workspaceMemberships.userId, userId),
        ),
      )
      .limit(1);

    return rows.length > 0;
  }
}

export const defaultWorkspaceRepository = new WorkspaceRepository();
