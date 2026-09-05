import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { defaultGisRepository } from '../../src/repositories/gisRepository.js';
import { defaultSessionRepository } from '../../src/repositories/sessionRepository.js';
import type { UserRow } from '@sih26019/db';
import type { Role, GisLayerDetailDto } from '@sih26019/shared-types';

describe('API Integration - /api/v1/gis & Regional Context', () => {
  const app = createApp();

  function mockUserSession(id: string, role: Role): UserRow {
    const user: UserRow = {
      id,
      email: `${id.toLowerCase()}@bluetrace.gov.in`,
      passwordHash: 'dummy',
      name: `User ${id}`,
      role,
      status: 'ACTIVE',
      sampleFlag: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    vi.spyOn(defaultSessionRepository, 'findByTokenHash').mockResolvedValue({
      id: `SES-${id}`,
      userId: user.id,
      sessionTokenHash: 'mock-hash',
      expiresAt: new Date(Date.now() + 100000),
      revokedAt: null,
      ipAddress: '127.0.0.1',
      userAgent: 'test',
      createdAt: new Date(),
      user,
    });

    return user;
  }

  const mockPublicLayer: GisLayerDetailDto = {
    id: 'SAMPLE-GIS-001',
    name: 'Coringa Mangrove Forest Canopy & Core Reserve',
    description: 'Spatial boundaries of primary mangrove forest canopy.',
    layerType: 'COASTAL',
    geometryType: 'Polygon',
    regionId: 'SAMPLE-REG-KR-001',
    regionName: 'Coringa Mangrove Estuarine Zone',
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    period: '2024-Q1',
    coverage: '124.5 sq km',
    legend: { color: '#059669', strokeColor: '#047857', fillOpacity: 0.6, symbol: 'polygon' },
    sampleFlag: true,
    featureCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const mockInternalLayer: GisLayerDetailDto = {
    id: 'SAMPLE-GIS-004',
    name: 'Artisanal Fishing Buffer Mediation Zone',
    description: 'Sensitive demarcation of contested coastal buffer zones.',
    layerType: 'DISPUTES',
    geometryType: 'Polygon',
    regionId: 'SAMPLE-REG-KR-001',
    regionName: 'Coringa Mangrove Estuarine Zone',
    visibility: 'INTERNAL',
    status: 'PUBLISHED',
    period: '2024-Q2',
    coverage: '38.2 sq km',
    legend: { color: '#dc2626', strokeColor: '#b91c1c', fillOpacity: 0.5, symbol: 'polygon' },
    sampleFlag: true,
    featureCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/v1/gis/layers', () => {
    it('returns only public layers when unauthenticated', async () => {
      vi.spyOn(defaultGisRepository, 'findLayers').mockResolvedValue([mockPublicLayer]);

      const response = await request(app).get('/api/v1/gis/layers');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('SAMPLE-GIS-001');
      expect(defaultGisRepository.findLayers).toHaveBeenCalledWith({}, undefined);
    });

    it('returns internal layers when requested by an ADMIN', async () => {
      const adminUser = mockUserSession('USR-ADMIN', 'ADMIN');
      vi.spyOn(defaultGisRepository, 'findLayers').mockResolvedValue([
        mockPublicLayer,
        mockInternalLayer,
      ]);

      const response = await request(app)
        .get('/api/v1/gis/layers')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(defaultGisRepository.findLayers).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ id: adminUser.id, role: 'ADMIN' }),
      );
    });
  });

  describe('GET /api/v1/gis/layers/:id', () => {
    it('returns public layer detail', async () => {
      vi.spyOn(defaultGisRepository, 'findLayerById').mockResolvedValue(mockPublicLayer);

      const response = await request(app).get('/api/v1/gis/layers/SAMPLE-GIS-001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('SAMPLE-GIS-001');
      expect(response.body.data.name).toBe(mockPublicLayer.name);
    });

    it('returns 404 for internal layer when unauthenticated', async () => {
      vi.spyOn(defaultGisRepository, 'findLayerById').mockImplementation(async (_id, user) => {
        if (user?.role === 'ADMIN') return mockInternalLayer;
        return null;
      });

      const response = await request(app).get('/api/v1/gis/layers/SAMPLE-GIS-004');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('returns internal layer detail when authenticated as ADMIN', async () => {
      mockUserSession('USR-ADMIN', 'ADMIN');
      vi.spyOn(defaultGisRepository, 'findLayerById').mockResolvedValue(mockInternalLayer);

      const response = await request(app)
        .get('/api/v1/gis/layers/SAMPLE-GIS-004')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('SAMPLE-GIS-004');
    });
  });

  describe('GET /api/v1/gis/layers/:id/features', () => {
    it('returns features for a public layer', async () => {
      vi.spyOn(defaultGisRepository, 'findLayerById').mockResolvedValue(mockPublicLayer);
      vi.spyOn(defaultGisRepository, 'findFeatures').mockResolvedValue({
        items: [
          {
            id: 'SAMPLE-FEAT-001',
            layerId: 'SAMPLE-GIS-001',
            layerName: mockPublicLayer.name,
            layerType: 'COASTAL',
            regionId: 'SAMPLE-REG-KR-001',
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [82.32, 16.92],
                  [82.35, 16.92],
                  [82.35, 16.89],
                  [82.32, 16.89],
                  [82.32, 16.92],
                ],
              ],
            },
            properties: { canopyCover: '88%' },
            visibility: 'PUBLIC',
            sampleFlag: true,
            relationships: {
              evidenceId: 'SAMPLE-EVD-001',
              datasetId: 'SAMPLE-DTS-001',
            },
          },
        ],
        pagination: {
          page: 1,
          pageSize: 50,
          total: 1,
          totalPages: 1,
        },
      });

      const response = await request(app).get('/api/v1/gis/layers/SAMPLE-GIS-001/features');

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].id).toBe('SAMPLE-FEAT-001');
      expect(response.body.data.items[0].geometry.coordinates).toHaveLength(1);
    });

    it('masks coordinates for internal sensitive features when viewed publicly', async () => {
      vi.spyOn(defaultGisRepository, 'findLayerById').mockResolvedValue(mockPublicLayer);
      vi.spyOn(defaultGisRepository, 'findFeatures').mockResolvedValue({
        items: [
          {
            id: 'SAMPLE-FEAT-005',
            layerId: 'SAMPLE-GIS-004',
            layerName: 'Sensitive Layer',
            layerType: 'DISPUTES',
            regionId: 'SAMPLE-REG-KR-001',
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [82.28, 16.88],
                  [82.31, 16.88],
                  [82.31, 16.86],
                  [82.28, 16.86],
                  [82.28, 16.88],
                ],
              ],
            },
            properties: { disputeSeverity: 'HIGH' },
            visibility: 'INTERNAL',
            sampleFlag: true,
            relationships: {
              disputeId: 'SAMPLE-DSP-001',
            },
          },
        ],
        pagination: {
          page: 1,
          pageSize: 50,
          total: 1,
          totalPages: 1,
        },
      });

      const response = await request(app).get('/api/v1/gis/layers/SAMPLE-GIS-001/features');

      expect(response.status).toBe(200);
      expect(response.body.data.items[0].geometry.coordinates).toEqual([]);
      expect(response.body.data.items[0].coordinatesGeneralized).toBe(true);
    });
  });

  describe('GET /api/v1/gis/features/:id', () => {
    it('returns feature with linked entities', async () => {
      vi.spyOn(defaultGisRepository, 'findFeatureById').mockResolvedValue({
        id: 'SAMPLE-FEAT-001',
        layerId: 'SAMPLE-GIS-001',
        layerName: 'Coringa Mangrove Forest Canopy & Core Reserve',
        layerType: 'COASTAL',
        regionId: 'SAMPLE-REG-KR-001',
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [82.32, 16.92],
              [82.35, 16.92],
              [82.35, 16.89],
              [82.32, 16.89],
              [82.32, 16.92],
            ],
          ],
        },
        properties: { canopyCover: '88%' },
        visibility: 'PUBLIC',
        sampleFlag: true,
        relationships: {
          evidenceId: 'SAMPLE-EVD-001',
          evidenceTitle: 'Mangrove Carbon Stock Assessment 2024',
          datasetId: 'SAMPLE-DTS-001',
          datasetTitle: 'Coringa Estuary Blue Carbon Baseline Dataset',
        },
        linkedEntities: {
          evidence: {
            id: 'SAMPLE-EVD-001',
            title: 'Mangrove Carbon Stock Assessment 2024',
            category: 'SCIENTIFIC_STUDY',
          },
          dataset: {
            id: 'SAMPLE-DTS-001',
            title: 'Coringa Estuary Blue Carbon Baseline Dataset',
            technicalFormat: 'GeoTIFF',
          },
          policy: {
            id: 'SAMPLE-POL-001',
            title: 'National Coastal Zone Management Policy 2025',
            code: 'POL-CRZ-2025',
          },
          project: {
            id: 'SAMPLE-PRJ-001',
            name: 'Coringa Estuary Blue Carbon Restoration',
            code: 'PRJ-CRG-001',
          },
          indicator: { id: 'SAMPLE-IND-001', name: 'Canopy Density Index', unit: 'Percentage' },
          dispute: null,
          blueCarbon: null,
        },
      });

      const response = await request(app).get('/api/v1/gis/features/SAMPLE-FEAT-001');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('SAMPLE-FEAT-001');
      expect(response.body.data.linkedEntities.evidence.title).toBe(
        'Mangrove Carbon Stock Assessment 2024',
      );
      expect(response.body.data.linkedEntities.dataset.id).toBe('SAMPLE-DTS-001');
    });

    it('returns 404 when feature does not exist', async () => {
      vi.spyOn(defaultGisRepository, 'findFeatureById').mockResolvedValue(null);

      const response = await request(app).get('/api/v1/gis/features/NON-EXISTENT');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/regions/:id/context', () => {
    it('returns regional context DTO with counts and features', async () => {
      vi.spyOn(defaultGisRepository, 'getRegionalContext').mockResolvedValue({
        region: {
          id: 'SAMPLE-REG-KR-001',
          code: 'IN-AP-CORINGA',
          name: 'Coringa Mangrove Estuarine Zone',
          level: 'DISTRICT',
          sampleFlag: true,
          hasGisCoverage: true,
        },
        gisLayers: [mockPublicLayer],
        featureCount: 1,
        counts: {
          evidence: 1,
          datasets: 1,
          policies: 1,
          projects: 1,
          indicators: 1,
          disputes: 0,
        },
        connectedEntities: {
          evidence: [
            {
              id: 'SAMPLE-EVD-001',
              title: 'Mangrove Carbon Stock Assessment 2024',
              category: 'SCIENTIFIC_STUDY',
            },
          ],
          datasets: [
            {
              id: 'SAMPLE-DTS-001',
              title: 'Coringa Estuary Blue Carbon Baseline Dataset',
              datasetType: 'GEOSPATIAL',
              format: 'GeoTIFF',
            },
          ],
          policies: [
            {
              id: 'SAMPLE-POL-001',
              code: 'POL-CRZ-2025',
              title: 'National Coastal Zone Management Policy 2025',
            },
          ],
          projects: [
            {
              id: 'SAMPLE-PRJ-001',
              code: 'PRJ-CRG-001',
              name: 'Coringa Estuary Blue Carbon Restoration',
            },
          ],
          indicators: [
            {
              id: 'SAMPLE-IND-001',
              code: 'IND-MNG-01',
              name: 'Canopy Density Index',
              unit: 'Percentage',
            },
          ],
          disputes: [],
        },
      });

      const response = await request(app).get('/api/v1/regions/SAMPLE-REG-KR-001/context');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.region.id).toBe('SAMPLE-REG-KR-001');
      expect(response.body.data.gisLayers).toHaveLength(1);
      expect(response.body.data.connectedEntities.evidence).toHaveLength(1);
    });

    it('returns 404 when region not found', async () => {
      vi.spyOn(defaultGisRepository, 'getRegionalContext').mockResolvedValue(null);

      const response = await request(app).get('/api/v1/regions/NON-EXISTENT/context');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
