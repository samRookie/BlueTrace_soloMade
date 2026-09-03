export type MetricUnit =
  'count' | 'percent' | 'hectares' | 'records' | 'projects' | 'datasets' | 'tonnes_co2e';

export type MetricStatus = 'AVAILABLE' | 'PARTIAL' | 'SAMPLE' | 'UNAVAILABLE';

export type MetricScope = 'NATIONAL' | 'REGIONAL';

export interface DashboardMetricDto {
  key: string;
  label: string;
  value: number | string | null;
  unit: MetricUnit;
  definition: string;
  source: string;
  period: {
    start?: string;
    end?: string;
    type: 'CATALOG_SNAPSHOT' | 'REPORTING_PERIOD' | 'CUSTOM_RANGE';
  };
  region: {
    id?: string;
    code?: string;
    name?: string;
    scope: 'NATIONAL' | 'REGIONAL';
  };
  sampleFlag: boolean;
  status: MetricStatus;
  detailPath?: string;
}

export interface AnalyticsOverviewSections {
  nationalSnapshot: DashboardMetricDto[];
  evidenceActivity: DashboardMetricDto[];
  geospatialIntelligence: DashboardMetricDto[];
  policyIntelligence: DashboardMetricDto[];
  implementation: DashboardMetricDto[];
  environmental: DashboardMetricDto[];
}

export interface AnalyticsOverviewDto {
  context: {
    regionId?: string;
    regionName?: string;
    periodStart?: string;
    periodEnd?: string;
    sampleFlag: boolean;
    generatedAt: string;
  };
  sections: AnalyticsOverviewSections;
}

export interface AnalyticsQuery {
  regionId?: string;
  periodStart?: string;
  periodEnd?: string;
  sampleFlag?: boolean;
}
