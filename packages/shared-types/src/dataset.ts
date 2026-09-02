import type { IsoTimestamp } from './timestamp.js';
import type { Visibility } from './visibility.js';
import type { LifecycleStatus, IntegrityStatus } from './status.js';
import type { PeriodType } from './period.js';
import type { SourceReference } from './source.js';
import type { RegionReference } from './region.js';
import type { EvidenceRelationshipDto, ResourceAttachmentDto } from './evidence.js';

/**
 * Controlled domain classification for datasets.
 */
export type DatasetType = 'LAND' | 'CLIMATE' | 'REMOTE_SENSING' | 'SOCIOECONOMIC' | 'BLUE_CARBON';

/**
 * Supported technical data formats.
 */
export type DatasetTechnicalFormat = 'CSV' | 'GEOJSON' | 'JSON' | 'GEOTIFF' | 'PARQUET' | 'PDF';

/**
 * Controlled update frequency vocabulary.
 */
export type DatasetUpdateFrequency =
  'STATIC' | 'ANNUAL' | 'QUARTERLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'IRREGULAR';

/**
 * Controlled access level vocabulary for datasets.
 */
export type DatasetAccessLevel = 'OPEN' | 'CONTROLLED' | 'REQUEST_REQUIRED' | 'RESTRICTED';

/**
 * Dataset metadata representation.
 */
export interface DatasetMetadataDto {
  id: string;
  evidenceId: string;
  datasetType: DatasetType;
  technicalFormat: DatasetTechnicalFormat;
  updateFrequency: DatasetUpdateFrequency;
  accessLevel: DatasetAccessLevel;
  spatialCoverageSummary?: string | null;
  temporalCoverageStart?: string | null;
  temporalCoverageEnd?: string | null;
  periodType?: PeriodType | null;
  regionId?: string | null;
  regionName?: string | null;
  gisLayerId?: string | null;
  gisLayerName?: string | null;
  tags: string[];
  sampleFlag: boolean;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}

/**
 * Summary DTO for dataset discovery and catalog search results.
 */
export interface DatasetItemDto {
  id: string; // evidenceId
  title: string;
  category: 'DATASET';
  source: SourceReference;
  datasetType: DatasetType;
  technicalFormat: DatasetTechnicalFormat;
  updateFrequency: DatasetUpdateFrequency;
  accessLevel: DatasetAccessLevel;
  spatialCoverageSummary?: string | null;
  temporalCoverageStart?: string | null;
  temporalCoverageEnd?: string | null;
  regionId?: string | null;
  regionName?: string | null;
  gisLayerId?: string | null;
  gisLayerName?: string | null;
  tags: string[];
  lifecycleStatus: LifecycleStatus;
  integrityStatus: IntegrityStatus;
  visibility: Visibility;
  sampleFlag: boolean;
  attachmentsCount: number;
  relationshipsCount: number;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}

/**
 * Comprehensive DTO for deep dataset inspection.
 */
export interface DatasetDetailDto {
  id: string; // evidenceId
  title: string;
  category: 'DATASET';
  source: SourceReference;
  projectId?: string | null;
  projectName?: string | null;
  policyId?: string | null;
  policyTitle?: string | null;
  lifecycleStatus: LifecycleStatus;
  integrityStatus: IntegrityStatus;
  visibility: Visibility;
  sampleFlag: boolean;
  metadata: DatasetMetadataDto;
  region?: RegionReference | null;
  gisLayer?: {
    id: string;
    name: string;
    layerType: string;
    status: string;
  } | null;
  outgoingRelationships: EvidenceRelationshipDto[];
  incomingRelationships: EvidenceRelationshipDto[];
  attachments: ResourceAttachmentDto[];
  userAccess: {
    canDownload: boolean;
    reason?: string;
  };
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}

/**
 * Query filter parameters for dataset search and faceted filtering.
 */
export interface DatasetFilterQuery {
  q?: string;
  type?: DatasetType;
  format?: DatasetTechnicalFormat;
  accessLevel?: DatasetAccessLevel;
  updateFrequency?: DatasetUpdateFrequency;
  regionId?: string;
  sourceId?: string;
  tag?: string;
  lifecycleStatus?: LifecycleStatus;
  integrityStatus?: IntegrityStatus;
  visibility?: Visibility;
  page?: number;
  limit?: number;
}

/**
 * Creation payload for registering a new dataset.
 */
export interface CreateDatasetRequest {
  title: string;
  sourceId: string;
  datasetType: DatasetType;
  technicalFormat: DatasetTechnicalFormat;
  updateFrequency: DatasetUpdateFrequency;
  accessLevel: DatasetAccessLevel;
  spatialCoverageSummary?: string;
  temporalCoverageStart?: string;
  temporalCoverageEnd?: string;
  periodType?: PeriodType;
  regionId?: string;
  gisLayerId?: string;
  projectId?: string;
  policyId?: string;
  tags?: string[];
  lifecycleStatus?: LifecycleStatus;
  integrityStatus?: IntegrityStatus;
  visibility?: Visibility;
}

/**
 * Partial update payload for dataset metadata.
 */
export interface UpdateDatasetRequest {
  title?: string;
  datasetType?: DatasetType;
  technicalFormat?: DatasetTechnicalFormat;
  updateFrequency?: DatasetUpdateFrequency;
  accessLevel?: DatasetAccessLevel;
  spatialCoverageSummary?: string;
  temporalCoverageStart?: string;
  temporalCoverageEnd?: string;
  periodType?: PeriodType;
  regionId?: string;
  gisLayerId?: string;
  projectId?: string;
  policyId?: string;
  tags?: string[];
  lifecycleStatus?: LifecycleStatus;
  integrityStatus?: IntegrityStatus;
  visibility?: Visibility;
}
