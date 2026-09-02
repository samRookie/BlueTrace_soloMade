import { eq, and, or, ilike, inArray, desc, sql, type SQL } from 'drizzle-orm';
import {
  db,
  type AppDatabase,
  schema,
  type InsertEvidenceItemRow,
  type InsertDatasetMetadataRow,
  type EvidenceAttachmentRow,
} from '@sih26019/db';
import type {
  DatasetFilterQuery,
  AuthenticatedUser,
  DatasetItemDto,
  DatasetDetailDto,
  CreateDatasetRequest,
  UpdateDatasetRequest,
  DatasetAccessLevel,
  SourceType,
} from '@sih26019/shared-types';
import { NotFoundError } from '../errors/index.js';

export class DatasetRepository {
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
   * Evaluates if a user can download the dataset based on accessLevel and role.
   */
  private evaluateDownloadAccess(
    accessLevel: DatasetAccessLevel,
    visibility: string,
    user?: AuthenticatedUser | null,
  ): { canDownload: boolean; reason?: string } {
    if (accessLevel === 'OPEN' && visibility === 'PUBLIC') {
      return { canDownload: true };
    }

    if (!user) {
      return {
        canDownload: false,
        reason: 'Authentication is required to access controlled or restricted datasets.',
      };
    }

    if (user.role === 'ADMIN') {
      return { canDownload: true };
    }

    if (accessLevel === 'RESTRICTED') {
      if (['RESEARCHER', 'POLICY_OFFICER'].includes(user.role)) {
        return { canDownload: true };
      }
      return {
        canDownload: false,
        reason: 'Restricted dataset requires verified researcher or policy officer clearance.',
      };
    }

    if (accessLevel === 'REQUEST_REQUIRED') {
      return {
        canDownload: false,
        reason: 'Access request approval required before downloading this dataset.',
      };
    }

    if (accessLevel === 'CONTROLLED') {
      // Institutional accounts can download
      if (
        [
          'POLICY_OFFICER',
          'RESEARCHER',
          'ANALYST',
          'VERIFIER',
          'COMMUNITY_LEAD',
          'DISPUTE_MEDIATOR',
        ].includes(user.role)
      ) {
        return { canDownload: true };
      }
      return {
        canDownload: false,
        reason: 'Institutional authentication required to access controlled datasets.',
      };
    }

    return { canDownload: true };
  }

  /**
   * Discovers and lists datasets with search, faceted filters, and pagination.
   */
  async findMany(
    query: DatasetFilterQuery,
    user?: AuthenticatedUser | null,
  ): Promise<{
    items: DatasetItemDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(schema.evidenceItems.category, 'DATASET')];

    const visibilityCond = this.getVisibilityConditions(user);
    if (visibilityCond) {
      conditions.push(visibilityCond);
    }

    if (query.type) {
      conditions.push(eq(schema.datasetMetadata.datasetType, query.type));
    }

    if (query.format) {
      conditions.push(eq(schema.datasetMetadata.technicalFormat, query.format));
    }

    if (query.accessLevel) {
      conditions.push(eq(schema.datasetMetadata.accessLevel, query.accessLevel));
    }

    if (query.updateFrequency) {
      conditions.push(eq(schema.datasetMetadata.updateFrequency, query.updateFrequency));
    }

    if (query.regionId) {
      conditions.push(eq(schema.datasetMetadata.regionId, query.regionId));
    }

    if (query.sourceId) {
      conditions.push(eq(schema.evidenceItems.sourceId, query.sourceId));
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

    if (query.tag && query.tag.trim().length > 0) {
      const tagQuery = query.tag.trim().toLowerCase();
      conditions.push(sql`${schema.datasetMetadata.tags}::text ILIKE ${`%${tagQuery}%`}`);
    }

    if (query.q && query.q.trim().length > 0) {
      const searchTerm = `%${query.q.trim()}%`;
      conditions.push(
        or(
          ilike(schema.evidenceItems.title, searchTerm),
          ilike(schema.datasetMetadata.spatialCoverageSummary, searchTerm),
          sql`${schema.datasetMetadata.tags}::text ILIKE ${searchTerm}`,
        )!,
      );
    }

    const whereClause = and(...conditions);

    // Count total matching items
    const countResult = await this.database
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(schema.evidenceItems)
      .innerJoin(
        schema.datasetMetadata,
        eq(schema.evidenceItems.id, schema.datasetMetadata.evidenceId),
      )
      .where(whereClause);

    const total = countResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Fetch paginated dataset rows with joined sources and regions
    const rows = await this.database
      .select({
        evidence: schema.evidenceItems,
        metadata: schema.datasetMetadata,
        source: schema.sources,
        region: schema.regions,
        gisLayer: schema.gisLayers,
      })
      .from(schema.evidenceItems)
      .innerJoin(
        schema.datasetMetadata,
        eq(schema.evidenceItems.id, schema.datasetMetadata.evidenceId),
      )
      .leftJoin(schema.sources, eq(schema.evidenceItems.sourceId, schema.sources.id))
      .leftJoin(schema.regions, eq(schema.datasetMetadata.regionId, schema.regions.id))
      .leftJoin(schema.gisLayers, eq(schema.datasetMetadata.gisLayerId, schema.gisLayers.id))
      .where(whereClause)
      .orderBy(desc(schema.evidenceItems.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch counts of attachments and relationships for each item
    const items: DatasetItemDto[] = await Promise.all(
      rows.map(async (row) => {
        const [attachmentsCount, outgoingCount, incomingCount] = await Promise.all([
          this.database
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(schema.evidenceAttachments)
            .where(eq(schema.evidenceAttachments.evidenceId, row.evidence.id)),
          this.database
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(schema.evidenceRelationships)
            .where(eq(schema.evidenceRelationships.sourceEvidenceId, row.evidence.id)),
          this.database
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(schema.evidenceRelationships)
            .where(eq(schema.evidenceRelationships.targetEvidenceId, row.evidence.id)),
        ]);

        return {
          id: row.evidence.id,
          title: row.evidence.title,
          category: 'DATASET',
          source: {
            sourceId: row.source?.id ?? row.evidence.sourceId,
            title: row.source?.title ?? 'Unknown Source',
            sourceType: (row.source?.sourceType as SourceType) ?? 'GOVERNMENT_RECORD',
            publisher: row.source?.publisher ?? undefined,
            uri: row.source?.uri ?? undefined,
          },
          datasetType: row.metadata.datasetType,
          technicalFormat: row.metadata.technicalFormat,
          updateFrequency: row.metadata.updateFrequency,
          accessLevel: row.metadata.accessLevel,
          spatialCoverageSummary: row.metadata.spatialCoverageSummary,
          temporalCoverageStart: row.metadata.temporalCoverageStart?.toISOString() ?? null,
          temporalCoverageEnd: row.metadata.temporalCoverageEnd?.toISOString() ?? null,
          regionId: row.metadata.regionId,
          regionName: row.region?.name ?? null,
          gisLayerId: row.metadata.gisLayerId,
          gisLayerName: row.gisLayer?.name ?? null,
          tags: row.metadata.tags || [],
          lifecycleStatus: row.evidence.lifecycleStatus,
          integrityStatus: row.evidence.integrityStatus,
          visibility: row.evidence.visibility,
          sampleFlag: row.evidence.sampleFlag,
          attachmentsCount: attachmentsCount[0]?.count ?? 0,
          relationshipsCount: (outgoingCount[0]?.count ?? 0) + (incomingCount[0]?.count ?? 0),
          createdAt: row.evidence.createdAt.toISOString(),
          updatedAt: row.evidence.updatedAt.toISOString(),
        };
      }),
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Retrieves full dataset detail with metadata, relationships, attachments, and download authorization.
   */
  async findById(
    evidenceId: string,
    user?: AuthenticatedUser | null,
  ): Promise<DatasetDetailDto | null> {
    const visibilityCond = this.getVisibilityConditions(user);

    const conditions: SQL[] = [
      eq(schema.evidenceItems.id, evidenceId),
      eq(schema.evidenceItems.category, 'DATASET'),
    ];

    if (visibilityCond) {
      conditions.push(visibilityCond);
    }

    const rows = await this.database
      .select({
        evidence: schema.evidenceItems,
        metadata: schema.datasetMetadata,
        source: schema.sources,
        project: schema.projects,
        policy: schema.policies,
        region: schema.regions,
        gisLayer: schema.gisLayers,
      })
      .from(schema.evidenceItems)
      .innerJoin(
        schema.datasetMetadata,
        eq(schema.evidenceItems.id, schema.datasetMetadata.evidenceId),
      )
      .leftJoin(schema.sources, eq(schema.evidenceItems.sourceId, schema.sources.id))
      .leftJoin(schema.projects, eq(schema.evidenceItems.projectId, schema.projects.id))
      .leftJoin(schema.policies, eq(schema.evidenceItems.policyId, schema.policies.id))
      .leftJoin(schema.regions, eq(schema.datasetMetadata.regionId, schema.regions.id))
      .leftJoin(schema.gisLayers, eq(schema.datasetMetadata.gisLayerId, schema.gisLayers.id))
      .where(and(...conditions))
      .limit(1);

    if (rows.length === 0 || !rows[0]) {
      return null;
    }

    const row = rows[0];

    // Fetch outgoing relationships
    const outgoingRelRows = await this.database
      .select({
        relationship: schema.evidenceRelationships,
        target: schema.evidenceItems,
      })
      .from(schema.evidenceRelationships)
      .innerJoin(
        schema.evidenceItems,
        eq(schema.evidenceRelationships.targetEvidenceId, schema.evidenceItems.id),
      )
      .where(eq(schema.evidenceRelationships.sourceEvidenceId, evidenceId));

    // Fetch incoming relationships
    const incomingRelRows = await this.database
      .select({
        relationship: schema.evidenceRelationships,
        source: schema.evidenceItems,
      })
      .from(schema.evidenceRelationships)
      .innerJoin(
        schema.evidenceItems,
        eq(schema.evidenceRelationships.sourceEvidenceId, schema.evidenceItems.id),
      )
      .where(eq(schema.evidenceRelationships.targetEvidenceId, evidenceId));

    // Fetch file attachments
    const attachmentRows = await this.database
      .select()
      .from(schema.evidenceAttachments)
      .where(eq(schema.evidenceAttachments.evidenceId, evidenceId));

    const userAccess = this.evaluateDownloadAccess(
      row.metadata.accessLevel,
      row.evidence.visibility,
      user,
    );

    return {
      id: row.evidence.id,
      title: row.evidence.title,
      category: 'DATASET',
      source: {
        sourceId: row.source?.id ?? row.evidence.sourceId,
        title: row.source?.title ?? 'Unknown Source',
        sourceType: (row.source?.sourceType as SourceType) ?? 'GOVERNMENT_RECORD',
        publisher: row.source?.publisher ?? undefined,
        uri: row.source?.uri ?? undefined,
      },
      projectId: row.evidence.projectId,
      projectName: row.project?.name ?? null,
      policyId: row.evidence.policyId,
      policyTitle: row.policy?.title ?? null,
      lifecycleStatus: row.evidence.lifecycleStatus,
      integrityStatus: row.evidence.integrityStatus,
      visibility: row.evidence.visibility,
      sampleFlag: row.evidence.sampleFlag,
      metadata: {
        id: row.metadata.id,
        evidenceId: row.metadata.evidenceId,
        datasetType: row.metadata.datasetType,
        technicalFormat: row.metadata.technicalFormat,
        updateFrequency: row.metadata.updateFrequency,
        accessLevel: row.metadata.accessLevel,
        spatialCoverageSummary: row.metadata.spatialCoverageSummary,
        temporalCoverageStart: row.metadata.temporalCoverageStart?.toISOString() ?? null,
        temporalCoverageEnd: row.metadata.temporalCoverageEnd?.toISOString() ?? null,
        periodType: row.metadata.periodType ?? null,
        regionId: row.metadata.regionId,
        regionName: row.region?.name ?? null,
        gisLayerId: row.metadata.gisLayerId,
        gisLayerName: row.gisLayer?.name ?? null,
        tags: row.metadata.tags || [],
        sampleFlag: row.metadata.sampleFlag,
        createdAt: row.metadata.createdAt.toISOString(),
        updatedAt: row.metadata.updatedAt.toISOString(),
      },
      region: row.region
        ? {
            code: row.region.code,
            name: row.region.name,
            level: row.region.level,
            parentCode: row.region.parentCode ?? undefined,
          }
        : null,
      gisLayer: row.gisLayer
        ? {
            id: row.gisLayer.id,
            name: row.gisLayer.name,
            layerType: row.gisLayer.layerType,
            status: row.gisLayer.status,
          }
        : null,
      outgoingRelationships: outgoingRelRows.map((r) => ({
        id: r.relationship.id,
        sourceEvidenceId: r.relationship.sourceEvidenceId,
        targetEvidenceId: r.relationship.targetEvidenceId,
        relationshipType: r.relationship.relationshipType,
        targetEvidence: {
          id: r.target.id,
          title: r.target.title,
          category: r.target.category,
          integrityStatus: r.target.integrityStatus,
        },
        createdAt: r.relationship.createdAt.toISOString(),
      })),
      incomingRelationships: incomingRelRows.map((r) => ({
        id: r.relationship.id,
        sourceEvidenceId: r.relationship.sourceEvidenceId,
        targetEvidenceId: r.relationship.targetEvidenceId,
        relationshipType: r.relationship.relationshipType,
        sourceEvidence: {
          id: r.source.id,
          title: r.source.title,
          category: r.source.category,
          integrityStatus: r.source.integrityStatus,
        },
        createdAt: r.relationship.createdAt.toISOString(),
      })),
      attachments: attachmentRows.map((a) => ({
        id: a.id,
        evidenceId: a.evidenceId,
        fileName: a.fileName,
        fileSize: a.fileSize,
        mimeType: a.mimeType,
        storageKey: a.storageKey,
        checksumSha256: a.checksumSha256,
        sampleFlag: a.sampleFlag,
        createdAt: a.createdAt.toISOString(),
      })),
      userAccess,
      createdAt: row.evidence.createdAt.toISOString(),
      updatedAt: row.evidence.updatedAt.toISOString(),
    };
  }

  /**
   * Registers a new dataset entry (evidence_items + dataset_metadata).
   */
  async create(payload: CreateDatasetRequest, actorId: string): Promise<DatasetDetailDto> {
    const evidenceId = `DS-${crypto.randomUUID()}`;
    const metadataId = `META-${crypto.randomUUID()}`;

    // Verify source exists
    const sourceExists = await this.database
      .select({ id: schema.sources.id })
      .from(schema.sources)
      .where(eq(schema.sources.id, payload.sourceId))
      .limit(1);

    if (sourceExists.length === 0) {
      throw new NotFoundError(`Source with ID "${payload.sourceId}" does not exist.`);
    }

    // Insert evidence item
    await this.database.insert(schema.evidenceItems).values({
      id: evidenceId,
      title: payload.title,
      category: 'DATASET',
      sourceId: payload.sourceId,
      projectId: payload.projectId || null,
      policyId: payload.policyId || null,
      lifecycleStatus: payload.lifecycleStatus || 'PUBLISHED',
      integrityStatus: payload.integrityStatus || 'VERIFIED',
      visibility: payload.visibility || 'PUBLIC',
      sampleFlag: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Insert dataset metadata
    await this.database.insert(schema.datasetMetadata).values({
      id: metadataId,
      evidenceId,
      datasetType: payload.datasetType,
      technicalFormat: payload.technicalFormat,
      updateFrequency: payload.updateFrequency,
      accessLevel: payload.accessLevel || 'OPEN',
      spatialCoverageSummary: payload.spatialCoverageSummary || null,
      temporalCoverageStart: payload.temporalCoverageStart
        ? new Date(payload.temporalCoverageStart)
        : null,
      temporalCoverageEnd: payload.temporalCoverageEnd
        ? new Date(payload.temporalCoverageEnd)
        : null,
      periodType: payload.periodType || null,
      regionId: payload.regionId || null,
      gisLayerId: payload.gisLayerId || null,
      tags: payload.tags || [],
      sampleFlag: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const detail = await this.findById(evidenceId, {
      id: actorId,
      role: 'ADMIN',
      status: 'ACTIVE',
      email: '',
      name: '',
      sampleFlag: true,
      createdAt: '',
    });
    if (!detail) {
      throw new Error('Failed to retrieve newly created dataset record.');
    }

    return detail;
  }

  /**
   * Updates an existing dataset and its metadata.
   */
  async update(
    evidenceId: string,
    payload: UpdateDatasetRequest,
    actorId: string,
  ): Promise<DatasetDetailDto> {
    const existing = await this.findById(evidenceId, {
      id: actorId,
      role: 'ADMIN',
      status: 'ACTIVE',
      email: '',
      name: '',
      sampleFlag: true,
      createdAt: '',
    });
    if (!existing) {
      throw new NotFoundError(`Dataset with ID "${evidenceId}" was not found.`);
    }

    // Update evidence item fields if provided
    const evidenceUpdates: Partial<InsertEvidenceItemRow> = {
      updatedAt: new Date(),
    };
    if (payload.title) evidenceUpdates.title = payload.title;
    if (payload.projectId !== undefined) evidenceUpdates.projectId = payload.projectId;
    if (payload.policyId !== undefined) evidenceUpdates.policyId = payload.policyId;
    if (payload.lifecycleStatus) evidenceUpdates.lifecycleStatus = payload.lifecycleStatus;
    if (payload.integrityStatus) evidenceUpdates.integrityStatus = payload.integrityStatus;
    if (payload.visibility) evidenceUpdates.visibility = payload.visibility;

    await this.database
      .update(schema.evidenceItems)
      .set(evidenceUpdates)
      .where(eq(schema.evidenceItems.id, evidenceId));

    // Update dataset metadata fields if provided
    const metadataUpdates: Partial<InsertDatasetMetadataRow> = {
      updatedAt: new Date(),
    };
    if (payload.datasetType) metadataUpdates.datasetType = payload.datasetType;
    if (payload.technicalFormat) metadataUpdates.technicalFormat = payload.technicalFormat;
    if (payload.updateFrequency) metadataUpdates.updateFrequency = payload.updateFrequency;
    if (payload.accessLevel) metadataUpdates.accessLevel = payload.accessLevel;
    if (payload.spatialCoverageSummary !== undefined)
      metadataUpdates.spatialCoverageSummary = payload.spatialCoverageSummary;
    if (payload.temporalCoverageStart !== undefined)
      metadataUpdates.temporalCoverageStart = payload.temporalCoverageStart
        ? new Date(payload.temporalCoverageStart)
        : null;
    if (payload.temporalCoverageEnd !== undefined)
      metadataUpdates.temporalCoverageEnd = payload.temporalCoverageEnd
        ? new Date(payload.temporalCoverageEnd)
        : null;
    if (payload.periodType !== undefined) metadataUpdates.periodType = payload.periodType;
    if (payload.regionId !== undefined) metadataUpdates.regionId = payload.regionId;
    if (payload.gisLayerId !== undefined) metadataUpdates.gisLayerId = payload.gisLayerId;
    if (payload.tags !== undefined) metadataUpdates.tags = payload.tags;

    await this.database
      .update(schema.datasetMetadata)
      .set(metadataUpdates)
      .where(eq(schema.datasetMetadata.evidenceId, evidenceId));

    const updated = await this.findById(evidenceId, {
      id: actorId,
      role: 'ADMIN',
      status: 'ACTIVE',
      email: '',
      name: '',
      sampleFlag: true,
      createdAt: '',
    });
    if (!updated) {
      throw new Error('Failed to retrieve updated dataset record.');
    }

    return updated;
  }

  /**
   * Retrieves an attachment by ID.
   */
  async findAttachmentById(
    evidenceId: string,
    attachmentId: string,
  ): Promise<EvidenceAttachmentRow | null> {
    const rows = await this.database
      .select()
      .from(schema.evidenceAttachments)
      .where(
        and(
          eq(schema.evidenceAttachments.id, attachmentId),
          eq(schema.evidenceAttachments.evidenceId, evidenceId),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  /**
   * Inserts an attachment row linked to a dataset.
   */
  async createAttachment(
    payload: schema.InsertEvidenceAttachmentRow,
  ): Promise<EvidenceAttachmentRow> {
    const rows = await this.database.insert(schema.evidenceAttachments).values(payload).returning();
    if (rows[0]) {
      return rows[0];
    }
    return {
      ...payload,
      createdAt: new Date(),
    } as EvidenceAttachmentRow;
  }
}

export const defaultDatasetRepository = new DatasetRepository();
