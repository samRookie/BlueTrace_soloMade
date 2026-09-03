import { eq, and, inArray, sql, type SQL } from 'drizzle-orm';
import { db, type AppDatabase, schema } from '@sih26019/db';
import type { AnalyticsQuery, AuthenticatedUser } from '@sih26019/shared-types';

export interface RawAnalyticsAggregates {
  totalEvidenceItems: number;
  publishedEvidenceItems: number;
  verifiedEvidenceItems: number;
  policyLinkedEvidence: number;
  projectLinkedEvidence: number;
  evidenceRelationshipsCount: number;
  evidenceAttachmentsCount: number;

  totalDatasets: number;
  gisLinkedDatasets: number;
  spatialCoverageDatasets: number;

  totalProjects: number;
  publishedProjects: number;
  openDisputesCount: number;

  totalPolicies: number;
  publishedPolicies: number;
  totalIndicators: number;

  regionsRepresentedCount: number;
  gisLayersCount: number;

  blueCarbonProjectsCount: number;
  totalRestorationHectares: number;
  targetCo2SequesterTpy: number;
  mrvRecordsCount: number;
  verifiedMrvRecordsCount: number;

  resolvedRegionName?: string;
  isSampleData: boolean;
}

export class AnalyticsRepository {
  constructor(private readonly database: AppDatabase = db) {}

  /**
   * Builds the visibility WHERE clause based on authenticated user persona.
   */
  private getEvidenceVisibility(user?: AuthenticatedUser | null): SQL | undefined {
    if (!user || user.role === 'VIEWER') {
      return eq(schema.evidenceItems.visibility, 'PUBLIC');
    }
    if (user.role === 'ADMIN') {
      return undefined;
    }
    return inArray(schema.evidenceItems.visibility, ['PUBLIC', 'INTERNAL']);
  }

  private getProjectVisibility(user?: AuthenticatedUser | null): SQL | undefined {
    if (!user || user.role === 'VIEWER') {
      return eq(schema.projects.visibility, 'PUBLIC');
    }
    if (user.role === 'ADMIN') {
      return undefined;
    }
    return inArray(schema.projects.visibility, ['PUBLIC', 'INTERNAL']);
  }

  private getPolicyVisibility(user?: AuthenticatedUser | null): SQL | undefined {
    if (!user || user.role === 'VIEWER') {
      return eq(schema.policies.visibility, 'PUBLIC');
    }
    if (user.role === 'ADMIN') {
      return undefined;
    }
    return inArray(schema.policies.visibility, ['PUBLIC', 'INTERNAL']);
  }

  /**
   * Aggregates authoritative, database-backed metrics across all platform pillars.
   */
  async getOverviewAggregates(
    query: AnalyticsQuery = {},
    user?: AuthenticatedUser | null,
  ): Promise<RawAnalyticsAggregates> {
    const { regionId, periodStart, periodEnd, sampleFlag } = query;

    // 1. Resolve region name if regionId is provided
    let resolvedRegionName: string | undefined = undefined;
    if (regionId) {
      const [reg] = await this.database
        .select({ name: schema.regions.name })
        .from(schema.regions)
        .where(eq(schema.regions.id, regionId))
        .limit(1);
      if (reg) {
        resolvedRegionName = reg.name;
      }
    }

    // 2. Evidence Items Queries
    const evidenceConds: SQL[] = [];
    const evVis = this.getEvidenceVisibility(user);
    if (evVis) evidenceConds.push(evVis);
    if (sampleFlag !== undefined) {
      evidenceConds.push(eq(schema.evidenceItems.sampleFlag, sampleFlag));
    }
    if (periodStart) {
      evidenceConds.push(sql`${schema.evidenceItems.createdAt} >= ${new Date(periodStart)}`);
    }
    if (periodEnd) {
      evidenceConds.push(sql`${schema.evidenceItems.createdAt} <= ${new Date(periodEnd)}`);
    }
    if (regionId) {
      evidenceConds.push(sql`(
        ${schema.evidenceItems.projectId} IN (SELECT id FROM ${schema.projects} WHERE ${schema.projects.regionId} = ${regionId})
        OR ${schema.evidenceItems.policyId} IN (SELECT id FROM ${schema.policies} WHERE ${schema.policies.regionId} = ${regionId})
        OR ${schema.evidenceItems.id} IN (SELECT evidence_id FROM ${schema.datasetMetadata} WHERE ${schema.datasetMetadata.regionId} = ${regionId})
      )`);
    }

    const whereEvidence = evidenceConds.length > 0 ? and(...evidenceConds) : undefined;

    const [evidenceAgg] = await this.database
      .select({
        total: sql<number>`count(*)::int`,
        published: sql<number>`count(*) filter (where ${schema.evidenceItems.lifecycleStatus} = 'PUBLISHED')::int`,
        verified: sql<number>`count(*) filter (where ${schema.evidenceItems.integrityStatus} = 'VERIFIED')::int`,
        policyLinked: sql<number>`count(*) filter (where ${schema.evidenceItems.policyId} is not null)::int`,
        projectLinked: sql<number>`count(*) filter (where ${schema.evidenceItems.projectId} is not null)::int`,
      })
      .from(schema.evidenceItems)
      .where(whereEvidence);

    // 3. Datasets Queries
    const datasetConds: SQL[] = [];
    if (evVis) datasetConds.push(evVis);
    if (sampleFlag !== undefined) {
      datasetConds.push(eq(schema.datasetMetadata.sampleFlag, sampleFlag));
    }
    if (regionId) {
      datasetConds.push(eq(schema.datasetMetadata.regionId, regionId));
    }
    if (periodStart) {
      datasetConds.push(sql`${schema.datasetMetadata.createdAt} >= ${new Date(periodStart)}`);
    }
    if (periodEnd) {
      datasetConds.push(sql`${schema.datasetMetadata.createdAt} <= ${new Date(periodEnd)}`);
    }

    const whereDataset = datasetConds.length > 0 ? and(...datasetConds) : undefined;

    const [datasetAgg] = await this.database
      .select({
        total: sql<number>`count(*)::int`,
        gisLinked: sql<number>`count(*) filter (where ${schema.datasetMetadata.gisLayerId} is not null)::int`,
        spatialCoverage: sql<number>`count(*) filter (where ${schema.datasetMetadata.spatialCoverageSummary} is not null and length(${schema.datasetMetadata.spatialCoverageSummary}) > 0)::int`,
      })
      .from(schema.datasetMetadata)
      .innerJoin(
        schema.evidenceItems,
        eq(schema.datasetMetadata.evidenceId, schema.evidenceItems.id),
      )
      .where(whereDataset);

    // 4. Projects & Disputes
    const projectConds: SQL[] = [];
    const projVis = this.getProjectVisibility(user);
    if (projVis) projectConds.push(projVis);
    if (regionId) projectConds.push(eq(schema.projects.regionId, regionId));
    if (sampleFlag !== undefined) projectConds.push(eq(schema.projects.sampleFlag, sampleFlag));

    const whereProject = projectConds.length > 0 ? and(...projectConds) : undefined;

    const [projectAgg] = await this.database
      .select({
        total: sql<number>`count(*)::int`,
        published: sql<number>`count(*) filter (where ${schema.projects.lifecycleStatus} = 'PUBLISHED')::int`,
      })
      .from(schema.projects)
      .where(whereProject);

    // Disputes tied to visible projects
    const [disputeAgg] = await this.database
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(schema.disputes)
      .innerJoin(schema.projects, eq(schema.disputes.projectId, schema.projects.id))
      .where(whereProject);

    // 5. Policies & Indicators
    const policyConds: SQL[] = [];
    const polVis = this.getPolicyVisibility(user);
    if (polVis) policyConds.push(polVis);
    if (regionId) policyConds.push(eq(schema.policies.regionId, regionId));
    if (sampleFlag !== undefined) policyConds.push(eq(schema.policies.sampleFlag, sampleFlag));

    const wherePolicy = policyConds.length > 0 ? and(...policyConds) : undefined;

    const [policyAgg] = await this.database
      .select({
        total: sql<number>`count(*)::int`,
        published: sql<number>`count(*) filter (where ${schema.policies.lifecycleStatus} = 'PUBLISHED')::int`,
      })
      .from(schema.policies)
      .where(wherePolicy);

    const [indicatorAgg] = await this.database
      .select({
        total: sql<number>`count(*)::int`,
      })
      .from(schema.indicators)
      .innerJoin(schema.policies, eq(schema.indicators.policyId, schema.policies.id))
      .where(wherePolicy);

    // 6. GIS Layers
    const gisConds: SQL[] = [];
    if (regionId) gisConds.push(eq(schema.gisLayers.regionId, regionId));
    if (sampleFlag !== undefined) gisConds.push(eq(schema.gisLayers.sampleFlag, sampleFlag));
    const whereGis = gisConds.length > 0 ? and(...gisConds) : undefined;

    const [gisAgg] = await this.database
      .select({
        total: sql<number>`count(*)::int`,
      })
      .from(schema.gisLayers)
      .where(whereGis);

    // 7. Blue Carbon, MRV, and Verification
    const [blueCarbonAgg] = await this.database
      .select({
        projectsCount: sql<number>`count(distinct ${schema.blueCarbonProjects.id})::int`,
        totalHectares: sql<number>`coalesce(sum(${schema.blueCarbonProjects.estimatedHectares}), 0)::float`,
        targetCo2: sql<number>`coalesce(sum(${schema.blueCarbonProjects.targetCo2SequesterTpy}), 0)::float`,
      })
      .from(schema.blueCarbonProjects)
      .innerJoin(schema.projects, eq(schema.blueCarbonProjects.projectId, schema.projects.id))
      .where(whereProject);

    const [mrvAgg] = await this.database
      .select({
        totalMrv: sql<number>`count(*)::int`,
        verifiedMrv: sql<number>`count(*) filter (where ${schema.mrvRecords.status} = 'VERIFIED')::int`,
      })
      .from(schema.mrvRecords)
      .innerJoin(
        schema.blueCarbonProjects,
        eq(schema.mrvRecords.blueCarbonProjectId, schema.blueCarbonProjects.id),
      )
      .innerJoin(schema.projects, eq(schema.blueCarbonProjects.projectId, schema.projects.id))
      .where(whereProject);

    // 8. Regions Represented count
    let regionsCount = 0;
    if (regionId) {
      regionsCount = 1;
    } else {
      const [regionsAgg] = await this.database
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(schema.regions);
      regionsCount = regionsAgg?.count ?? 0;
    }

    // 9. Graph edges & attachments
    const [relAgg] = await this.database
      .select({
        total: sql<number>`count(*)::int`,
      })
      .from(schema.evidenceRelationships);

    const [attAgg] = await this.database
      .select({
        total: sql<number>`count(*)::int`,
      })
      .from(schema.evidenceAttachments)
      .innerJoin(
        schema.evidenceItems,
        eq(schema.evidenceAttachments.evidenceId, schema.evidenceItems.id),
      )
      .where(whereEvidence);

    return {
      totalEvidenceItems: evidenceAgg?.total ?? 0,
      publishedEvidenceItems: evidenceAgg?.published ?? 0,
      verifiedEvidenceItems: evidenceAgg?.verified ?? 0,
      policyLinkedEvidence: evidenceAgg?.policyLinked ?? 0,
      projectLinkedEvidence: evidenceAgg?.projectLinked ?? 0,
      evidenceRelationshipsCount: relAgg?.total ?? 0,
      evidenceAttachmentsCount: attAgg?.total ?? 0,

      totalDatasets: datasetAgg?.total ?? 0,
      gisLinkedDatasets: datasetAgg?.gisLinked ?? 0,
      spatialCoverageDatasets: datasetAgg?.spatialCoverage ?? 0,

      totalProjects: projectAgg?.total ?? 0,
      publishedProjects: projectAgg?.published ?? 0,
      openDisputesCount: disputeAgg?.count ?? 0,

      totalPolicies: policyAgg?.total ?? 0,
      publishedPolicies: policyAgg?.published ?? 0,
      totalIndicators: indicatorAgg?.total ?? 0,

      regionsRepresentedCount: regionsCount,
      gisLayersCount: gisAgg?.total ?? 0,

      blueCarbonProjectsCount: blueCarbonAgg?.projectsCount ?? 0,
      totalRestorationHectares: blueCarbonAgg?.totalHectares ?? 0,
      targetCo2SequesterTpy: blueCarbonAgg?.targetCo2 ?? 0,
      mrvRecordsCount: mrvAgg?.totalMrv ?? 0,
      verifiedMrvRecordsCount: mrvAgg?.verifiedMrv ?? 0,

      resolvedRegionName,
      isSampleData: true, // Grounded in synthetic demo/seed graph
    };
  }
}

export const defaultAnalyticsRepository = new AnalyticsRepository();
