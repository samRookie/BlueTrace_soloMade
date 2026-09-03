import {
  AnalyticsRepository,
  defaultAnalyticsRepository,
  type RawAnalyticsAggregates,
} from '../repositories/analyticsRepository.js';
import type {
  AnalyticsOverviewDto,
  AnalyticsQuery,
  AuthenticatedUser,
  DashboardMetricDto,
} from '@sih26019/shared-types';

export class AnalyticsService {
  constructor(private readonly repository: AnalyticsRepository = defaultAnalyticsRepository) {}

  async getOverview(
    query: AnalyticsQuery = {},
    user?: AuthenticatedUser | null,
  ): Promise<AnalyticsOverviewDto> {
    const raw: RawAnalyticsAggregates = await this.repository.getOverviewAggregates(query, user);

    const isRegional = Boolean(query.regionId);
    const regionScope = isRegional ? 'REGIONAL' : 'NATIONAL';
    const regionContext = {
      id: query.regionId,
      name: raw.resolvedRegionName || (isRegional ? 'Selected Region' : 'National Jurisdiction'),
      scope: regionScope as 'NATIONAL' | 'REGIONAL',
    };

    const periodContext = {
      start: query.periodStart,
      end: query.periodEnd,
      type: (query.periodStart || query.periodEnd ? 'CUSTOM_RANGE' : 'CATALOG_SNAPSHOT') as
        'CATALOG_SNAPSHOT' | 'REPORTING_PERIOD' | 'CUSTOM_RANGE',
    };

    // 1. National Snapshot
    const nationalSnapshot: DashboardMetricDto[] = [
      {
        key: 'total_evidence_items',
        label: 'Cataloged Evidence Items',
        value: raw.totalEvidenceItems,
        unit: 'records',
        definition:
          'Total count of accessible evidence records across all legal, scientific, and policy categories.',
        source: 'Knowledge & Evidence Repository',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/evidence',
      },
      {
        key: 'total_cataloged_datasets',
        label: 'Reusable Datasets',
        value: raw.totalDatasets,
        unit: 'datasets',
        definition:
          'Count of reusable scientific and geospatial datasets cataloged with access controls.',
        source: 'Dataset Catalog & Storage',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/datasets',
      },
      {
        key: 'total_projects',
        label: 'Governance Projects',
        value: raw.totalProjects,
        unit: 'projects',
        definition:
          'Active coastal restoration, cadastral surveying, and land-use governance projects.',
        source: 'Project Implementation Registry',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/workspaces',
      },
      {
        key: 'total_policies',
        label: 'Governing Policies',
        value: raw.totalPolicies,
        unit: 'records',
        definition:
          'Formally cataloged national and regional land governance policies and guidelines.',
        source: 'National Policy Registry',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/evidence',
      },
      {
        key: 'total_indicators',
        label: 'Monitored Indicators',
        value: raw.totalIndicators,
        unit: 'records',
        definition:
          'Quantifiable biophysical and land-use governance indicators tracked across policies.',
        source: 'Policy Indicator Framework',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/evidence',
      },
      {
        key: 'active_regions_represented',
        label: 'Administrative Regions',
        value: raw.regionsRepresentedCount,
        unit: 'records',
        definition:
          'Distinct administrative zones and coastal districts with cataloged evidence or active projects.',
        source: 'Geographic Administrative Hierarchy',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/evidence',
      },
    ];

    // 2. Evidence Activity
    const evidenceActivity: DashboardMetricDto[] = [
      {
        key: 'evidence_items_published',
        label: 'Published Evidence Items',
        value: raw.publishedEvidenceItems,
        unit: 'records',
        definition:
          'Formally published evidence items ready for institutional citation and decision support.',
        source: 'Knowledge & Evidence Repository',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/evidence',
      },
      {
        key: 'verified_evidence_items',
        label: 'Cryptographically Verified',
        value: raw.verifiedEvidenceItems,
        unit: 'records',
        definition: 'Evidence assets with verified cryptographic integrity stamps.',
        source: 'Evidence Integrity Engine',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/evidence',
      },
      {
        key: 'evidence_relationships_mapped',
        label: 'Graph Relationship Edges',
        value: raw.evidenceRelationshipsCount,
        unit: 'records',
        definition:
          'Corroborating, supporting, and citing relationship edges connecting evidence items.',
        source: 'Evidence Graph Network',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/evidence',
      },
      {
        key: 'evidence_attachments_stored',
        label: 'Stored Attachments',
        value: raw.evidenceAttachmentsCount,
        unit: 'records',
        definition:
          'Audited downloadable documentation, GeoJSON layers, and data files attached to evidence.',
        source: 'Evidence Storage Vault',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/evidence',
      },
    ];

    // 3. Geospatial Intelligence
    const geospatialIntelligence: DashboardMetricDto[] = [
      {
        key: 'gis_linked_datasets',
        label: 'GIS-Linked Datasets',
        value: raw.gisLinkedDatasets,
        unit: 'datasets',
        definition:
          'Cataloged datasets directly connected to spatial GIS layers and polygon boundaries.',
        source: 'Dataset Catalog & GIS Index',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/datasets',
      },
      {
        key: 'gis_layers_published',
        label: 'Published GIS Layers',
        value: raw.gisLayersCount,
        unit: 'records',
        definition:
          'Geospatial vector boundary, cadastral, and mangrove canopy layers in repository.',
        source: 'Geospatial Layer Registry',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/datasets',
      },
      {
        key: 'spatial_coverage_datasets',
        label: 'Bound Spatial Datasets',
        value: raw.spatialCoverageDatasets,
        unit: 'datasets',
        definition:
          'Datasets with documented geographical extent and spatial bounding descriptions.',
        source: 'Dataset Spatial Coverage Catalog',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/datasets',
      },
    ];

    // 4. Policy Intelligence
    const policyIntelligence: DashboardMetricDto[] = [
      {
        key: 'published_policies',
        label: 'Active Policy Frameworks',
        value: raw.publishedPolicies,
        unit: 'records',
        definition:
          'Published regulatory guidelines, conservation covenants, and land tenure rules.',
        source: 'National Policy Registry',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/evidence',
      },
      {
        key: 'policy_connected_indicators',
        label: 'Policy-Bound Indicators',
        value: raw.totalIndicators,
        unit: 'records',
        definition:
          'Standardized metrics actively linked to evaluate policy objectives and enforcement.',
        source: 'Policy Indicator Framework',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/evidence',
      },
      {
        key: 'policy_linked_evidence',
        label: 'Policy-Linked Evidence',
        value: raw.policyLinkedEvidence,
        unit: 'records',
        definition:
          'Scientific papers and baseline reports formally linked to supporting policies.',
        source: 'Policy Evidence Graph',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/evidence',
      },
    ];

    // 5. Implementation Overview
    const implementation: DashboardMetricDto[] = [
      {
        key: 'active_governance_projects',
        label: 'Published Pilots',
        value: raw.publishedProjects,
        unit: 'projects',
        definition:
          'Formally active and published land restoration and governance pilot initiatives.',
        source: 'Project Implementation Registry',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/workspaces',
      },
      {
        key: 'project_linked_evidence',
        label: 'Project Supporting Evidence',
        value: raw.projectLinkedEvidence,
        unit: 'records',
        definition:
          'Field surveys and datasets tied to specific on-the-ground project compartments.',
        source: 'Project Evidence Links',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/evidence',
      },
      {
        key: 'open_disputes',
        label: 'Logged Tenure Disputes',
        value: raw.openDisputesCount,
        unit: 'records',
        definition:
          'Boundary overlap or artisanal access disputes formally registered for mediation.',
        source: 'Tenure Dispute Register',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/workspaces',
      },
    ];

    // 6. Environmental / Blue Carbon
    const environmental: DashboardMetricDto[] = [
      {
        key: 'blue_carbon_projects',
        label: 'Blue Carbon Projects',
        value: raw.blueCarbonProjectsCount,
        unit: 'projects',
        definition:
          'Coastal mangrove and wetland restoration projects under Blue Carbon MRV protocols.',
        source: 'Blue Carbon Project Registry',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/workspaces',
      },
      {
        key: 'total_restoration_hectares',
        label: 'Restoration Area',
        value: raw.totalRestorationHectares,
        unit: 'hectares',
        definition:
          'Total estimated wetland and mangrove area under active ecological restoration.',
        source: 'Blue Carbon Project Baselines',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/workspaces',
      },
      {
        key: 'target_co2_sequester_tpy',
        label: 'Annual Sequestration Target',
        value: raw.targetCo2SequesterTpy,
        unit: 'tonnes_co2e',
        definition:
          'Modeled carbon sequestration capacity per year based on canopy density and area.',
        source: 'Sequestration Target Models',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/workspaces',
      },
      {
        key: 'mrv_records_logged',
        label: 'MRV Biomass Logs',
        value: raw.mrvRecordsCount,
        unit: 'records',
        definition:
          'Monitoring, Reporting, and Verification biomass allometry records in registry.',
        source: 'MRV Protocol System',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/evidence',
      },
      {
        key: 'verified_mrv_records',
        label: 'Third-Party Verified MRV',
        value: raw.verifiedMrvRecordsCount,
        unit: 'records',
        definition:
          'Biomass and carbon sequestration reports verified by certified third-party auditors.',
        source: 'MRV Verification Protocol',
        period: periodContext,
        region: regionContext,
        sampleFlag: raw.isSampleData,
        status: 'AVAILABLE',
        detailPath: '/evidence',
      },
    ];

    return {
      context: {
        regionId: query.regionId,
        regionName: regionContext.name,
        periodStart: query.periodStart,
        periodEnd: query.periodEnd,
        sampleFlag: raw.isSampleData,
        generatedAt: new Date().toISOString(),
      },
      sections: {
        nationalSnapshot,
        evidenceActivity,
        geospatialIntelligence,
        policyIntelligence,
        implementation,
        environmental,
      },
    };
  }
}

export const defaultAnalyticsService = new AnalyticsService();
