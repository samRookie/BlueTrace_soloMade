import type { Visibility } from './visibility.js';
import type { RegionReference } from './region.js';

export type GisLayerType =
  | 'COASTAL'
  | 'LAND_USE'
  | 'PROJECTS'
  | 'DISPUTES'
  | 'CLIMATE'
  | 'FOREST'
  | 'AGRICULTURE'
  | 'URBAN'
  | 'INFRASTRUCTURE'
  | 'INDICATORS';

export type GisGeometryType = 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';

export interface GisLegendMetadata {
  color: string;
  strokeColor?: string;
  fillOpacity?: number;
  symbol: 'polygon' | 'line' | 'circle' | 'square';
}

export interface GisLayerDto {
  id: string;
  name: string;
  description?: string | null;
  layerType: GisLayerType;
  geometryType: GisGeometryType;
  regionId: string;
  regionName?: string | null;
  sourceId?: string | null;
  sourceTitle?: string | null;
  period?: string | null;
  coverage?: string | null;
  visibility: Visibility;
  status: string;
  sampleFlag: boolean;
  legend?: GisLegendMetadata | null;
  featureCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GisLayerDetailDto extends GisLayerDto {
  featuresPreview?: GisFeatureDto[];
}

export interface GeoJsonGeometry {
  type: GisGeometryType;
  coordinates: unknown;
}

export interface GisFeatureRelationships {
  evidenceId?: string | null;
  evidenceTitle?: string | null;
  datasetId?: string | null;
  datasetTitle?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  policyId?: string | null;
  policyTitle?: string | null;
  indicatorId?: string | null;
  indicatorName?: string | null;
  disputeId?: string | null;
  disputeTitle?: string | null;
}

export interface GisFeatureDto {
  id: string;
  layerId: string;
  layerName?: string | null;
  layerType?: GisLayerType;
  regionId: string;
  type: 'Feature';
  geometry: GeoJsonGeometry;
  properties: Record<string, unknown>;
  visibility: Visibility;
  sampleFlag: boolean;
  relationships: GisFeatureRelationships;
  coordinatesGeneralized?: boolean;
}

export interface GisFeatureDetailDto extends GisFeatureDto {
  linkedEntities: {
    evidence?: { id: string; title: string; category: string } | null;
    dataset?: { id: string; title: string; technicalFormat: string } | null;
    project?: { id: string; name: string; code: string } | null;
    policy?: { id: string; title: string; code: string } | null;
    indicator?: { id: string; name: string; unit: string } | null;
    dispute?: { id: string; title: string; lifecycleStatus: string } | null;
    blueCarbon?: { id: string; ecosystemType: string; estimatedHectares: string } | null;
  };
}

export interface RegionalContextDto {
  region: RegionReference & {
    id: string;
    sampleFlag: boolean;
    hasGisCoverage: boolean;
  };
  gisLayers: GisLayerDto[];
  featureCount: number;
  counts: {
    evidence: number;
    datasets: number;
    policies: number;
    projects: number;
    indicators: number;
    disputes: number;
  };
  connectedEntities: {
    evidence: Array<{ id: string; title: string; category: string }>;
    datasets: Array<{ id: string; title: string; datasetType: string; format: string }>;
    policies: Array<{ id: string; code: string; title: string }>;
    projects: Array<{ id: string; code: string; name: string }>;
    indicators: Array<{ id: string; code: string; name: string; unit: string }>;
    disputes: Array<{ id: string; title: string; status: string }>;
    blueCarbon?: {
      id: string;
      ecosystemType: string;
      estimatedHectares: string;
      targetCo2SequesterTpy: string;
    } | null;
  };
}

export interface GisLayerFilterQuery {
  regionId?: string;
  layerType?: string;
  sampleFlag?: boolean;
}

export interface GisFeatureFilterQuery {
  regionId?: string;
  bbox?: string;
  page?: number;
  limit?: number;
}
