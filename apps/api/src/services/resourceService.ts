import {
  ResourceRepository,
  defaultResourceRepository,
} from '../repositories/resourceRepository.js';
import type { EntityCounts } from '@sih26019/db';
import { ARCHITECTURE_VERSION } from '@sih26019/shared-types';

export interface ResourceCountsDto {
  categories: EntityCounts;
  totalEntities: number;
}

export interface DataStatusDto {
  database: {
    connected: boolean;
    status: 'connected' | 'unreachable';
  };
  sampleDataSeeded: boolean;
  counts: EntityCounts;
  architectureVersion: string;
  environment: string;
}

export class ResourceService {
  constructor(
    private readonly resourceRepository: ResourceRepository = defaultResourceRepository,
  ) {}

  /**
   * Retrieves categorized entity counts across all persistent evidence tables.
   */
  async getResourceCounts(): Promise<ResourceCountsDto> {
    const counts = await this.resourceRepository.getCounts();

    const totalEntities = Object.values(counts).reduce((acc, count) => acc + count, 0);

    return {
      categories: counts,
      totalEntities,
    };
  }

  /**
   * Evaluates overall data status, connectivity, and seeded sample data state.
   */
  async getDataStatus(): Promise<DataStatusDto> {
    const health = await this.resourceRepository.checkHealth();
    let counts: EntityCounts = {
      sources: 0,
      regions: 0,
      workspaces: 0,
      policies: 0,
      indicators: 0,
      gisLayers: 0,
      gisFeatures: 0,
      projects: 0,
      innovationOpportunities: 0,
      blueCarbonProjects: 0,
      mrvRecords: 0,
      verificationRecords: 0,
      integrityRecords: 0,
      disputes: 0,
      evidenceItems: 0,
      evidenceRelationships: 0,
      users: 0,
      sessions: 0,
      auditEvents: 0,
      workspaceMemberships: 0,
      evidenceAttachments: 0,
      datasetMetadata: 0,
    };

    let sampleDataSeeded = false;

    if (health.connected) {
      counts = await this.resourceRepository.getCounts();
      sampleDataSeeded =
        counts.projects > 0 && counts.regions > 0 && counts.evidenceRelationships > 0;
    }

    return {
      database: {
        connected: health.connected,
        status: health.connected ? 'connected' : 'unreachable',
      },
      sampleDataSeeded,
      counts,
      architectureVersion: ARCHITECTURE_VERSION,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

export const defaultResourceService = new ResourceService();
