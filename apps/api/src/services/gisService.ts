import { GisRepository, defaultGisRepository } from '../repositories/gisRepository.js';
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
} from '@sih26019/shared-types';

export class GisService {
  constructor(private readonly repository: GisRepository = defaultGisRepository) {}

  async listLayers(
    query: GisLayerFilterQuery = {},
    user?: AuthenticatedUser | null,
  ): Promise<GisLayerDto[]> {
    return this.repository.findLayers(query, user);
  }

  async getLayerById(
    id: string,
    user?: AuthenticatedUser | null,
  ): Promise<GisLayerDetailDto | null> {
    return this.repository.findLayerById(id, user);
  }

  async listFeatures(
    layerId: string,
    query: GisFeatureFilterQuery = {},
    user?: AuthenticatedUser | null,
  ): Promise<PaginatedData<GisFeatureDto>> {
    const data = await this.repository.findFeatures(layerId, query, user);

    // Apply sensitive location protection: if user is not ADMIN and feature is INTERNAL, mask exact coordinates
    const sanitizedItems = data.items.map((feat) => {
      if (feat.visibility === 'INTERNAL' && (!user || user.role === 'VIEWER')) {
        return {
          ...feat,
          geometry: {
            type: feat.geometry.type,
            coordinates: [], // coordinates masked
          },
          coordinatesGeneralized: true,
        };
      }
      return feat;
    });

    return {
      ...data,
      items: sanitizedItems,
    };
  }

  async getFeatureById(
    id: string,
    user?: AuthenticatedUser | null,
  ): Promise<GisFeatureDetailDto | null> {
    return this.repository.findFeatureById(id, user);
  }

  async getRegionalContext(
    regionId: string,
    user?: AuthenticatedUser | null,
  ): Promise<RegionalContextDto | null> {
    return this.repository.getRegionalContext(regionId, user);
  }
}

export const defaultGisService = new GisService();
