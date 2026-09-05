import { eq, and, inArray, sql, type SQL } from 'drizzle-orm';
import { db, type AppDatabase, schema } from '@sih26019/db';
import type {
  AuthenticatedUser,
  GisLayerDto,
  GisLayerDetailDto,
  GisFeatureDto,
  GisFeatureDetailDto,
  RegionalContextDto,
  GisLayerFilterQuery,
  GisFeatureFilterQuery,
  PaginatedData,
  GisLayerType,
  GisGeometryType,
  GeoJsonGeometry,
  GisLegendMetadata,
} from '@sih26019/shared-types';

export class GisRepository {
  constructor(private readonly database: AppDatabase = db) {}

  /**
   * Evaluates visibility condition based on requester persona.
   */
  private getLayerVisibility(user?: AuthenticatedUser | null): SQL | undefined {
    if (!user || user.role === 'VIEWER') {
      return eq(schema.gisLayers.visibility, 'PUBLIC');
    }
    if (user.role === 'ADMIN') {
      return undefined; // Admins see PUBLIC, INTERNAL, RESTRICTED
    }
    return inArray(schema.gisLayers.visibility, ['PUBLIC', 'INTERNAL']);
  }

  private getFeatureVisibility(user?: AuthenticatedUser | null): SQL | undefined {
    if (!user || user.role === 'VIEWER') {
      return eq(schema.gisFeatures.visibility, 'PUBLIC');
    }
    if (user.role === 'ADMIN') {
      return undefined;
    }
    return inArray(schema.gisFeatures.visibility, ['PUBLIC', 'INTERNAL']);
  }

  /**
   * Discovers and lists accessible GIS layers with feature counts.
   */
  async findLayers(
    query: GisLayerFilterQuery = {},
    user?: AuthenticatedUser | null,
  ): Promise<GisLayerDto[]> {
    const conditions: SQL[] = [];

    const visibilityCond = this.getLayerVisibility(user);
    if (visibilityCond) conditions.push(visibilityCond);

    if (query.regionId) {
      conditions.push(eq(schema.gisLayers.regionId, query.regionId));
    }
    if (query.layerType) {
      conditions.push(eq(schema.gisLayers.layerType, query.layerType));
    }
    if (query.sampleFlag !== undefined) {
      conditions.push(eq(schema.gisLayers.sampleFlag, query.sampleFlag));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.database
      .select({
        layer: schema.gisLayers,
        regionName: schema.regions.name,
        sourceTitle: schema.sources.title,
        featureCount: sql<number>`count(${schema.gisFeatures.id})::int`,
      })
      .from(schema.gisLayers)
      .leftJoin(schema.regions, eq(schema.gisLayers.regionId, schema.regions.id))
      .leftJoin(schema.sources, eq(schema.gisLayers.sourceId, schema.sources.id))
      .leftJoin(schema.gisFeatures, eq(schema.gisLayers.id, schema.gisFeatures.layerId))
      .where(whereClause)
      .groupBy(schema.gisLayers.id, schema.regions.name, schema.sources.title)
      .orderBy(schema.gisLayers.id);

    return rows.map((r) => ({
      id: r.layer.id,
      name: r.layer.name,
      description: r.layer.description,
      layerType: r.layer.layerType as GisLayerType,
      geometryType: r.layer.geometryType as GisGeometryType,
      regionId: r.layer.regionId,
      regionName: r.regionName,
      sourceId: r.layer.sourceId,
      sourceTitle: r.sourceTitle,
      period: r.layer.period,
      coverage: r.layer.coverage,
      visibility: r.layer.visibility,
      status: r.layer.status,
      sampleFlag: r.layer.sampleFlag,
      legend: (r.layer.legend as unknown as GisLegendMetadata) ?? null,
      featureCount: r.featureCount,
      createdAt: r.layer.createdAt.toISOString(),
      updatedAt: r.layer.updatedAt.toISOString(),
    }));
  }

  /**
   * Retrieves single layer metadata by ID.
   */
  async findLayerById(
    id: string,
    user?: AuthenticatedUser | null,
  ): Promise<GisLayerDetailDto | null> {
    const conditions: SQL[] = [eq(schema.gisLayers.id, id)];
    const visibilityCond = this.getLayerVisibility(user);
    if (visibilityCond) conditions.push(visibilityCond);

    const rows = await this.database
      .select({
        layer: schema.gisLayers,
        regionName: schema.regions.name,
        sourceTitle: schema.sources.title,
        featureCount: sql<number>`count(${schema.gisFeatures.id})::int`,
      })
      .from(schema.gisLayers)
      .leftJoin(schema.regions, eq(schema.gisLayers.regionId, schema.regions.id))
      .leftJoin(schema.sources, eq(schema.gisLayers.sourceId, schema.sources.id))
      .leftJoin(schema.gisFeatures, eq(schema.gisLayers.id, schema.gisFeatures.layerId))
      .where(and(...conditions))
      .groupBy(schema.gisLayers.id, schema.regions.name, schema.sources.title)
      .limit(1);

    if (!rows.length || !rows[0]) return null;
    const r = rows[0];

    return {
      id: r.layer.id,
      name: r.layer.name,
      description: r.layer.description,
      layerType: r.layer.layerType as GisLayerType,
      geometryType: r.layer.geometryType as GisGeometryType,
      regionId: r.layer.regionId,
      regionName: r.regionName,
      sourceId: r.layer.sourceId,
      sourceTitle: r.sourceTitle,
      period: r.layer.period,
      coverage: r.layer.coverage,
      visibility: r.layer.visibility,
      status: r.layer.status,
      sampleFlag: r.layer.sampleFlag,
      legend: (r.layer.legend as unknown as GisLegendMetadata) ?? null,
      featureCount: r.featureCount,
      createdAt: r.layer.createdAt.toISOString(),
      updatedAt: r.layer.updatedAt.toISOString(),
    };
  }

  /**
   * Retrieves features for a layer with region and optional bounding box filtering.
   */
  async findFeatures(
    layerId: string,
    query: GisFeatureFilterQuery = {},
    user?: AuthenticatedUser | null,
  ): Promise<PaginatedData<GisFeatureDto>> {
    // 1. Authorize layer access
    const layer = await this.findLayerById(layerId, user);
    if (!layer) {
      return {
        items: [],
        pagination: {
          page: query.page ?? 1,
          pageSize: query.limit ?? 50,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // 2. Build feature query conditions
    const conditions: SQL[] = [eq(schema.gisFeatures.layerId, layerId)];
    const featVis = this.getFeatureVisibility(user);
    if (featVis) conditions.push(featVis);

    if (query.regionId) {
      conditions.push(eq(schema.gisFeatures.regionId, query.regionId));
    }

    const whereClause = and(...conditions);
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 50));
    const offset = (page - 1) * limit;

    const [totalCountRow] = await this.database
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.gisFeatures)
      .where(whereClause);

    const total = totalCountRow?.count ?? 0;

    const rows = await this.database
      .select({
        feature: schema.gisFeatures,
        evidenceTitle: schema.evidenceItems.title,
        datasetTitle: schema.datasetMetadata.id,
        projectName: schema.projects.name,
        policyTitle: schema.policies.title,
        indicatorName: schema.indicators.name,
        disputeTitle: schema.disputes.title,
      })
      .from(schema.gisFeatures)
      .leftJoin(schema.evidenceItems, eq(schema.gisFeatures.evidenceId, schema.evidenceItems.id))
      .leftJoin(schema.datasetMetadata, eq(schema.gisFeatures.datasetId, schema.datasetMetadata.id))
      .leftJoin(schema.projects, eq(schema.gisFeatures.projectId, schema.projects.id))
      .leftJoin(schema.policies, eq(schema.gisFeatures.policyId, schema.policies.id))
      .leftJoin(schema.indicators, eq(schema.gisFeatures.indicatorId, schema.indicators.id))
      .leftJoin(schema.disputes, eq(schema.gisFeatures.disputeId, schema.disputes.id))
      .where(whereClause)
      .orderBy(schema.gisFeatures.id)
      .limit(limit)
      .offset(offset);

    const items: GisFeatureDto[] = rows.map((r) => ({
      id: r.feature.id,
      layerId: r.feature.layerId,
      layerName: layer.name,
      layerType: layer.layerType,
      regionId: r.feature.regionId,
      type: 'Feature',
      geometry: r.feature.geometry as GeoJsonGeometry,
      properties: (r.feature.properties as Record<string, unknown>) || {},
      visibility: r.feature.visibility,
      sampleFlag: r.feature.sampleFlag,
      relationships: {
        evidenceId: r.feature.evidenceId,
        evidenceTitle: r.evidenceTitle,
        datasetId: r.feature.datasetId,
        datasetTitle: r.datasetTitle,
        projectId: r.feature.projectId,
        projectName: r.projectName,
        policyId: r.feature.policyId,
        policyTitle: r.policyTitle,
        indicatorId: r.feature.indicatorId,
        indicatorName: r.indicatorName,
        disputeId: r.feature.disputeId,
        disputeTitle: r.disputeTitle,
      },
    }));

    return {
      items,
      pagination: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves single feature details with linked entities.
   */
  async findFeatureById(
    id: string,
    user?: AuthenticatedUser | null,
  ): Promise<GisFeatureDetailDto | null> {
    const conditions: SQL[] = [eq(schema.gisFeatures.id, id)];
    const featVis = this.getFeatureVisibility(user);
    if (featVis) conditions.push(featVis);

    const rows = await this.database
      .select({
        feature: schema.gisFeatures,
        layer: schema.gisLayers,
        evidence: schema.evidenceItems,
        dataset: schema.datasetMetadata,
        project: schema.projects,
        policy: schema.policies,
        indicator: schema.indicators,
        dispute: schema.disputes,
        blueCarbon: schema.blueCarbonProjects,
      })
      .from(schema.gisFeatures)
      .innerJoin(schema.gisLayers, eq(schema.gisFeatures.layerId, schema.gisLayers.id))
      .leftJoin(schema.evidenceItems, eq(schema.gisFeatures.evidenceId, schema.evidenceItems.id))
      .leftJoin(schema.datasetMetadata, eq(schema.gisFeatures.datasetId, schema.datasetMetadata.id))
      .leftJoin(schema.projects, eq(schema.gisFeatures.projectId, schema.projects.id))
      .leftJoin(schema.policies, eq(schema.gisFeatures.policyId, schema.policies.id))
      .leftJoin(schema.indicators, eq(schema.gisFeatures.indicatorId, schema.indicators.id))
      .leftJoin(schema.disputes, eq(schema.gisFeatures.disputeId, schema.disputes.id))
      .leftJoin(
        schema.blueCarbonProjects,
        eq(schema.gisFeatures.projectId, schema.blueCarbonProjects.projectId),
      )
      .where(and(...conditions))
      .limit(1);

    if (!rows.length || !rows[0]) return null;
    const r = rows[0];

    return {
      id: r.feature.id,
      layerId: r.feature.layerId,
      layerName: r.layer.name,
      layerType: r.layer.layerType as GisLayerType,
      regionId: r.feature.regionId,
      type: 'Feature',
      geometry: r.feature.geometry as GeoJsonGeometry,
      properties: (r.feature.properties as Record<string, unknown>) || {},
      visibility: r.feature.visibility,
      sampleFlag: r.feature.sampleFlag,
      relationships: {
        evidenceId: r.feature.evidenceId,
        evidenceTitle: r.evidence?.title,
        datasetId: r.feature.datasetId,
        datasetTitle: r.dataset?.id,
        projectId: r.feature.projectId,
        projectName: r.project?.name,
        policyId: r.feature.policyId,
        policyTitle: r.policy?.title,
        indicatorId: r.feature.indicatorId,
        indicatorName: r.indicator?.name,
        disputeId: r.feature.disputeId,
        disputeTitle: r.dispute?.title,
      },
      linkedEntities: {
        evidence: r.evidence
          ? { id: r.evidence.id, title: r.evidence.title, category: r.evidence.category }
          : null,
        dataset: r.dataset
          ? {
              id: r.dataset.id,
              title: r.evidence?.title || r.dataset.id,
              technicalFormat: r.dataset.technicalFormat,
            }
          : null,
        project: r.project
          ? { id: r.project.id, name: r.project.name, code: r.project.code }
          : null,
        policy: r.policy ? { id: r.policy.id, title: r.policy.title, code: r.policy.code } : null,
        indicator: r.indicator
          ? { id: r.indicator.id, name: r.indicator.name, unit: r.indicator.unit }
          : null,
        dispute: r.dispute
          ? { id: r.dispute.id, title: r.dispute.title, lifecycleStatus: r.dispute.lifecycleStatus }
          : null,
        blueCarbon: r.blueCarbon
          ? {
              id: r.blueCarbon.id,
              ecosystemType: r.blueCarbon.ecosystemType,
              estimatedHectares: r.blueCarbon.estimatedHectares,
            }
          : null,
      },
    };
  }

  /**
   * Aggregates the unified Regional Context connecting region to GIS, evidence, datasets,
   * policies, projects, indicators, disputes, and blue carbon.
   */
  async getRegionalContext(
    regionId: string,
    user?: AuthenticatedUser | null,
  ): Promise<RegionalContextDto | null> {
    const [region] = await this.database
      .select()
      .from(schema.regions)
      .where(eq(schema.regions.id, regionId))
      .limit(1);

    if (!region) return null;

    // Accessible GIS layers in region
    const gisLayers = await this.findLayers({ regionId }, user);

    // Total features count in region
    const [featureCountRow] = await this.database
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.gisFeatures)
      .where(eq(schema.gisFeatures.regionId, regionId));

    // Connected evidence items
    const evidenceRows = await this.database
      .select({
        id: schema.evidenceItems.id,
        title: schema.evidenceItems.title,
        category: schema.evidenceItems.category,
      })
      .from(schema.evidenceItems)
      .where(
        sql`(
          ${schema.evidenceItems.projectId} IN (SELECT id FROM ${schema.projects} WHERE ${schema.projects.regionId} = ${regionId})
          OR ${schema.evidenceItems.policyId} IN (SELECT id FROM ${schema.policies} WHERE ${schema.policies.regionId} = ${regionId})
          OR ${schema.evidenceItems.id} IN (SELECT evidence_id FROM ${schema.datasetMetadata} WHERE ${schema.datasetMetadata.regionId} = ${regionId})
        )`,
      )
      .limit(20);

    // Connected datasets
    const datasetRows = await this.database
      .select({
        id: schema.datasetMetadata.id,
        title: schema.evidenceItems.title,
        datasetType: schema.datasetMetadata.datasetType,
        format: schema.datasetMetadata.technicalFormat,
      })
      .from(schema.datasetMetadata)
      .innerJoin(
        schema.evidenceItems,
        eq(schema.datasetMetadata.evidenceId, schema.evidenceItems.id),
      )
      .where(eq(schema.datasetMetadata.regionId, regionId))
      .limit(20);

    // Connected policies
    const policyRows = await this.database
      .select({
        id: schema.policies.id,
        code: schema.policies.code,
        title: schema.policies.title,
      })
      .from(schema.policies)
      .where(eq(schema.policies.regionId, regionId))
      .limit(20);

    // Connected projects
    const projectRows = await this.database
      .select({
        id: schema.projects.id,
        code: schema.projects.code,
        name: schema.projects.name,
      })
      .from(schema.projects)
      .where(eq(schema.projects.regionId, regionId))
      .limit(20);

    // Connected indicators
    const indicatorRows = await this.database
      .select({
        id: schema.indicators.id,
        code: schema.indicators.code,
        name: schema.indicators.name,
        unit: schema.indicators.unit,
      })
      .from(schema.indicators)
      .innerJoin(schema.policies, eq(schema.indicators.policyId, schema.policies.id))
      .where(eq(schema.policies.regionId, regionId))
      .limit(20);

    // Connected disputes (filtered by visibility)
    const disputeConditions: SQL[] = [
      eq(schema.projects.regionId, regionId),
      eq(schema.disputes.projectId, schema.projects.id),
    ];
    if (!user || user.role === 'VIEWER') {
      disputeConditions.push(eq(schema.disputes.visibility, 'PUBLIC'));
    }

    const disputeRows = await this.database
      .select({
        id: schema.disputes.id,
        title: schema.disputes.title,
        status: schema.disputes.lifecycleStatus,
      })
      .from(schema.disputes)
      .innerJoin(schema.projects, eq(schema.disputes.projectId, schema.projects.id))
      .where(and(...disputeConditions))
      .limit(20);

    // Connected Blue Carbon Project
    const [blueCarbonRow] = await this.database
      .select({
        id: schema.blueCarbonProjects.id,
        ecosystemType: schema.blueCarbonProjects.ecosystemType,
        estimatedHectares: schema.blueCarbonProjects.estimatedHectares,
        targetCo2SequesterTpy: schema.blueCarbonProjects.targetCo2SequesterTpy,
      })
      .from(schema.blueCarbonProjects)
      .innerJoin(schema.projects, eq(schema.blueCarbonProjects.projectId, schema.projects.id))
      .where(eq(schema.projects.regionId, regionId))
      .limit(1);

    return {
      region: {
        id: region.id,
        code: region.code,
        name: region.name,
        level: region.level,
        parentCode: region.parentCode ?? undefined,
        sampleFlag: region.sampleFlag,
        hasGisCoverage: gisLayers.length > 0,
      },
      gisLayers,
      featureCount: featureCountRow?.count ?? 0,
      counts: {
        evidence: evidenceRows.length,
        datasets: datasetRows.length,
        policies: policyRows.length,
        projects: projectRows.length,
        indicators: indicatorRows.length,
        disputes: disputeRows.length,
      },
      connectedEntities: {
        evidence: evidenceRows,
        datasets: datasetRows,
        policies: policyRows,
        projects: projectRows,
        indicators: indicatorRows,
        disputes: disputeRows,
        blueCarbon: blueCarbonRow
          ? {
              id: blueCarbonRow.id,
              ecosystemType: blueCarbonRow.ecosystemType,
              estimatedHectares: blueCarbonRow.estimatedHectares,
              targetCo2SequesterTpy: blueCarbonRow.targetCo2SequesterTpy ?? '0',
            }
          : null,
      },
    };
  }
}

export const defaultGisRepository = new GisRepository();
