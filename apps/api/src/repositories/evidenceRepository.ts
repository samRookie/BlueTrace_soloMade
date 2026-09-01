import { eq, and, or, ilike, inArray, desc, sql, type SQL } from 'drizzle-orm';
import {
  db,
  type AppDatabase,
  schema,
  type EvidenceItemRow,
  type InsertEvidenceItemRow,
  type EvidenceRelationshipRow,
  type InsertEvidenceRelationshipRow,
  type EvidenceAttachmentRow,
  type InsertEvidenceAttachmentRow,
} from '@sih26019/db';
import type {
  EvidenceFilterQuery,
  AuthenticatedUser,
  EvidenceItemDto,
  EvidenceDetailDto,
  EvidenceRelationshipDto,
  ResourceAttachmentDto,
} from '@sih26019/shared-types';

export class EvidenceRepository {
  constructor(private readonly database: AppDatabase = db) {}

  /**
   * Builds the visibility WHERE clause based on authenticated user persona.
   */
  private getVisibilityConditions(user?: AuthenticatedUser | null): SQL | undefined {
    if (!user || user.role === 'VIEWER') {
      return eq(schema.evidenceItems.visibility, 'PUBLIC');
    }
    if (user.role === 'ADMIN') {
      return undefined; // Admins can access PUBLIC, INTERNAL, and RESTRICTED
    }
    // Institutional roles access PUBLIC and INTERNAL
    return inArray(schema.evidenceItems.visibility, ['PUBLIC', 'INTERNAL']);
  }

  /**
   * Discovers and lists evidence items with search, faceted filters, and pagination.
   */
  async findMany(
    query: EvidenceFilterQuery,
    user?: AuthenticatedUser | null,
  ): Promise<{
    items: EvidenceItemDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    const visibilityCond = this.getVisibilityConditions(user);
    if (visibilityCond) {
      conditions.push(visibilityCond);
    }

    if (query.category) {
      conditions.push(eq(schema.evidenceItems.category, query.category));
    }

    if (query.lifecycleStatus) {
      conditions.push(eq(schema.evidenceItems.lifecycleStatus, query.lifecycleStatus));
    }

    if (query.integrityStatus) {
      conditions.push(eq(schema.evidenceItems.integrityStatus, query.integrityStatus));
    }

    if (query.visibility) {
      conditions.push(eq(schema.evidenceItems.visibility, query.visibility));
    }

    if (query.projectId) {
      conditions.push(eq(schema.evidenceItems.projectId, query.projectId));
    }

    if (query.policyId) {
      conditions.push(eq(schema.evidenceItems.policyId, query.policyId));
    }

    if (query.search && query.search.trim().length > 0) {
      const searchTerm = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(schema.evidenceItems.title, searchTerm),
          ilike(schema.evidenceItems.category, searchTerm),
        )!,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count total matching items
    const countResult = await this.database
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(schema.evidenceItems)
      .where(whereClause);

    const total = countResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Retrieve page items with relations
    const rows = await this.database.query.evidenceItems.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [desc(schema.evidenceItems.createdAt)],
      with: {
        source: true,
        outgoingRelationships: true,
        incomingRelationships: true,
        attachments: true,
      },
    });

    // If sourceType filter was specified in query, filter post-join if not done at SQL level
    let filteredRows = rows;
    if (query.sourceType) {
      filteredRows = rows.filter((r) => r.source?.sourceType === query.sourceType);
    }

    const items: EvidenceItemDto[] = filteredRows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      sourceId: row.sourceId,
      source: row.source
        ? {
            sourceId: row.source.id,
            title: row.source.title,
            sourceType: row.source.sourceType,
            publisher: row.source.publisher ?? undefined,
            uri: row.source.uri ?? undefined,
            attribution: row.source.attribution ?? undefined,
            obtainedAt: row.source.obtainedAt ? row.source.obtainedAt.toISOString() : undefined,
          }
        : undefined,
      projectId: row.projectId,
      policyId: row.policyId,
      lifecycleStatus: row.lifecycleStatus,
      integrityStatus: row.integrityStatus,
      visibility: row.visibility,
      sampleFlag: row.sampleFlag,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      outgoingRelationshipsCount: row.outgoingRelationships?.length ?? 0,
      incomingRelationshipsCount: row.incomingRelationships?.length ?? 0,
      attachmentsCount: row.attachments?.length ?? 0,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Retrieves an evidence item by ID with full relational graph edges and attachments.
   */
  async findById(id: string, user?: AuthenticatedUser | null): Promise<EvidenceDetailDto | null> {
    const row = await this.database.query.evidenceItems.findFirst({
      where: eq(schema.evidenceItems.id, id),
      with: {
        source: true,
        project: true,
        policy: true,
        attachments: true,
        outgoingRelationships: {
          with: {
            targetEvidence: true,
          },
        },
        incomingRelationships: {
          with: {
            sourceEvidence: true,
          },
        },
      },
    });

    if (!row) {
      return null;
    }

    // Evaluate visibility access
    const isPublic = row.visibility === 'PUBLIC';
    const isInternal = row.visibility === 'INTERNAL';
    const isAdmin = user?.role === 'ADMIN';
    const isInstitutional =
      user &&
      [
        'POLICY_OFFICER',
        'RESEARCHER',
        'ANALYST',
        'VERIFIER',
        'COMMUNITY_LEAD',
        'DISPUTE_MEDIATOR',
      ].includes(user.role);

    if (!isPublic && !isAdmin && (!isInternal || !isInstitutional)) {
      return null; // Hidden due to insufficient visibility clearance
    }

    const outgoingRelationships: EvidenceRelationshipDto[] = (row.outgoingRelationships ?? []).map(
      (rel) => ({
        id: rel.id,
        sourceEvidenceId: rel.sourceEvidenceId,
        targetEvidenceId: rel.targetEvidenceId,
        relationshipType: rel.relationshipType,
        createdAt: rel.createdAt.toISOString(),
        targetEvidence: rel.targetEvidence
          ? {
              id: rel.targetEvidence.id,
              title: rel.targetEvidence.title,
              category: rel.targetEvidence.category,
              integrityStatus: rel.targetEvidence.integrityStatus,
            }
          : undefined,
      }),
    );

    const incomingRelationships: EvidenceRelationshipDto[] = (row.incomingRelationships ?? []).map(
      (rel) => ({
        id: rel.id,
        sourceEvidenceId: rel.sourceEvidenceId,
        targetEvidenceId: rel.targetEvidenceId,
        relationshipType: rel.relationshipType,
        createdAt: rel.createdAt.toISOString(),
        sourceEvidence: rel.sourceEvidence
          ? {
              id: rel.sourceEvidence.id,
              title: rel.sourceEvidence.title,
              category: rel.sourceEvidence.category,
              integrityStatus: rel.sourceEvidence.integrityStatus,
            }
          : undefined,
      }),
    );

    const attachments: ResourceAttachmentDto[] = (row.attachments ?? []).map((att) => ({
      id: att.id,
      evidenceId: att.evidenceId,
      fileName: att.fileName,
      fileSize: att.fileSize,
      mimeType: att.mimeType,
      storageKey: att.storageKey,
      checksumSha256: att.checksumSha256,
      sampleFlag: att.sampleFlag,
      createdAt: att.createdAt.toISOString(),
    }));

    return {
      id: row.id,
      title: row.title,
      category: row.category,
      sourceId: row.sourceId,
      source: row.source
        ? {
            sourceId: row.source.id,
            title: row.source.title,
            sourceType: row.source.sourceType,
            publisher: row.source.publisher ?? undefined,
            uri: row.source.uri ?? undefined,
            attribution: row.source.attribution ?? undefined,
            obtainedAt: row.source.obtainedAt ? row.source.obtainedAt.toISOString() : undefined,
          }
        : undefined,
      projectId: row.projectId,
      policyId: row.policyId,
      project: row.project
        ? {
            id: row.project.id,
            code: row.project.code,
            name: row.project.name,
          }
        : null,
      policy: row.policy
        ? {
            id: row.policy.id,
            code: row.policy.code,
            title: row.policy.title,
          }
        : null,
      lifecycleStatus: row.lifecycleStatus,
      integrityStatus: row.integrityStatus,
      visibility: row.visibility,
      sampleFlag: row.sampleFlag,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      outgoingRelationships,
      incomingRelationships,
      attachments,
    };
  }

  /**
   * Persists a new evidence item record.
   */
  async create(data: InsertEvidenceItemRow): Promise<EvidenceItemRow> {
    const rows = await this.database.insert(schema.evidenceItems).values(data).returning();
    return rows[0]!;
  }

  /**
   * Persists a new directed relationship between two evidence items.
   */
  async createRelationship(data: InsertEvidenceRelationshipRow): Promise<EvidenceRelationshipRow> {
    const rows = await this.database.insert(schema.evidenceRelationships).values(data).returning();
    return rows[0]!;
  }

  /**
   * Persists metadata for a safely stored file attachment.
   */
  async createAttachment(data: InsertEvidenceAttachmentRow): Promise<EvidenceAttachmentRow> {
    const rows = await this.database.insert(schema.evidenceAttachments).values(data).returning();
    return rows[0]!;
  }

  /**
   * Retrieves an attachment record by ID.
   */
  async findAttachmentById(attachmentId: string): Promise<EvidenceAttachmentRow | null> {
    const row = await this.database.query.evidenceAttachments.findFirst({
      where: eq(schema.evidenceAttachments.id, attachmentId),
    });
    return row ?? null;
  }
}

export const defaultEvidenceRepository = new EvidenceRepository();
