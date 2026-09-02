import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { defaultSessionRepository } from '../../src/repositories/sessionRepository.js';
import { defaultAuditRepository } from '../../src/repositories/auditRepository.js';
import { defaultDatasetRepository } from '../../src/repositories/datasetRepository.js';
import { defaultStorageAdapter } from '../../src/storage/storageAdapter.js';
import type { UserRow, AuditEventRow } from '@sih26019/db';
import type { Role, DatasetDetailDto, DatasetItemDto } from '@sih26019/shared-types';

describe('API Integration - Phase 6 Dataset Catalog and Storage', () => {
  const app = createApp();

  function mockUserSession(role: Role): UserRow {
    const user: UserRow = {
      id: `USR-${role}`,
      email: `${role.toLowerCase()}@bluetrace.gov.in`,
      passwordHash: 'dummy',
      name: `${role} User`,
      role,
      status: 'ACTIVE',
      sampleFlag: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    vi.spyOn(defaultSessionRepository, 'findByTokenHash').mockResolvedValue({
      id: `SES-${role}`,
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

  const sampleDatasetDetail: DatasetDetailDto = {
    id: 'SAMPLE-EV-001',
    title: 'Sentinel-2 Multispectral Surface Reflectance Canopy Density Scan',
    category: 'DATASET',
    source: {
      id: 'SAMPLE-SRC-002',
      title: 'Sentinel-2 Coastal Mangrove Biomass Index',
      sourceType: 'SATELLITE_OBSERVATION',
    },
    projectId: 'SAMPLE-PROJ-001',
    projectName: 'Coringa Estuarine Blue Carbon Restoration Pilot',
    policyId: 'SAMPLE-POL-001',
    policyTitle: 'National Coastal Mangrove Restoration Guidelines 2024',
    lifecycleStatus: 'PUBLISHED',
    integrityStatus: 'VERIFIED',
    visibility: 'PUBLIC',
    sampleFlag: true,
    metadata: {
      id: 'SAMPLE-DS-001',
      evidenceId: 'SAMPLE-EV-001',
      datasetType: 'REMOTE_SENSING',
      technicalFormat: 'GEOTIFF',
      updateFrequency: 'QUARTERLY',
      accessLevel: 'OPEN',
      spatialCoverageSummary: 'Coringa Mangrove Reserve Forest & Estuary Buffer',
      temporalCoverageStart: '2025-01-01T00:00:00.000Z',
      temporalCoverageEnd: '2025-09-30T23:59:59.000Z',
      periodType: 'QUARTERLY',
      regionId: 'SAMPLE-REG-KR-001',
      regionName: 'Coringa Mangrove Estuarine Zone',
      gisLayerId: 'SAMPLE-GIS-001',
      gisLayerName: 'Coringa Mangrove Canopy Boundary 2025',
      tags: ['remote-sensing', 'sentinel-2', 'canopy'],
      sampleFlag: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    region: {
      code: 'IN-AP-CORINGA',
      name: 'Coringa Mangrove Estuarine Zone',
      level: 'DISTRICT',
    },
    gisLayer: {
      id: 'SAMPLE-GIS-001',
      name: 'Coringa Mangrove Canopy Boundary 2025',
      layerType: 'CANOPY_POLYGON',
      status: 'PUBLISHED',
    },
    outgoingRelationships: [],
    incomingRelationships: [],
    attachments: [
      {
        id: 'SAMPLE-ATT-001',
        evidenceId: 'SAMPLE-EV-001',
        fileName: 'coringa_sentinel2_canopy_2025.geojson',
        fileSize: 4829104,
        mimeType: 'application/geo+json',
        storageKey: 'evidence/coringa_sentinel2_canopy_2025.geojson',
        checksumSha256: '9a5f2231b6e4d2847c0bbf234e402b8b64e0a7249339e802315a6b0cf89078de',
        sampleFlag: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    userAccess: {
      canDownload: true,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const sampleDatasetItem: DatasetItemDto = {
    id: sampleDatasetDetail.id,
    title: sampleDatasetDetail.title,
    category: 'DATASET',
    source: sampleDatasetDetail.source,
    datasetType: sampleDatasetDetail.metadata.datasetType,
    technicalFormat: sampleDatasetDetail.metadata.technicalFormat,
    updateFrequency: sampleDatasetDetail.metadata.updateFrequency,
    accessLevel: sampleDatasetDetail.metadata.accessLevel,
    spatialCoverageSummary: sampleDatasetDetail.metadata.spatialCoverageSummary,
    temporalCoverageStart: sampleDatasetDetail.metadata.temporalCoverageStart,
    temporalCoverageEnd: sampleDatasetDetail.metadata.temporalCoverageEnd,
    regionId: sampleDatasetDetail.metadata.regionId,
    regionName: sampleDatasetDetail.metadata.regionName,
    gisLayerId: sampleDatasetDetail.metadata.gisLayerId,
    gisLayerName: sampleDatasetDetail.metadata.gisLayerName,
    tags: sampleDatasetDetail.metadata.tags,
    lifecycleStatus: sampleDatasetDetail.lifecycleStatus,
    integrityStatus: sampleDatasetDetail.integrityStatus,
    visibility: sampleDatasetDetail.visibility,
    sampleFlag: sampleDatasetDetail.sampleFlag,
    attachmentsCount: 1,
    relationshipsCount: 0,
    createdAt: sampleDatasetDetail.createdAt,
    updatedAt: sampleDatasetDetail.updatedAt,
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(defaultAuditRepository, 'create').mockImplementation(async (data) => {
      return {
        ...data,
        createdAt: new Date(),
      } as AuditEventRow;
    });
  });

  describe('GET /api/v1/datasets', () => {
    it('returns paginated list of public datasets for unauthenticated users', async () => {
      vi.spyOn(defaultDatasetRepository, 'findMany').mockResolvedValue({
        items: [sampleDatasetItem],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const res = await request(app).get('/api/v1/datasets');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].datasetType).toBe('REMOTE_SENSING');
      expect(res.body.data[0].technicalFormat).toBe('GEOTIFF');
      expect(res.body.meta.total).toBe(1);
    });

    it('passes search, type, format, and accessLevel query filters to repository', async () => {
      const findManySpy = vi.spyOn(defaultDatasetRepository, 'findMany').mockResolvedValue({
        items: [sampleDatasetItem],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const res = await request(app).get(
        '/api/v1/datasets?q=sentinel&type=REMOTE_SENSING&format=GEOTIFF&accessLevel=OPEN',
      );

      expect(res.status).toBe(200);
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          q: 'sentinel',
          type: 'REMOTE_SENSING',
          format: 'GEOTIFF',
          accessLevel: 'OPEN',
        }),
        undefined,
      );
    });
  });

  describe('GET /api/v1/datasets/:id', () => {
    it('returns full dataset detail with metadata and GIS links', async () => {
      vi.spyOn(defaultDatasetRepository, 'findById').mockResolvedValue(sampleDatasetDetail);

      const res = await request(app).get('/api/v1/datasets/SAMPLE-EV-001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('SAMPLE-EV-001');
      expect(res.body.data.metadata.datasetType).toBe('REMOTE_SENSING');
      expect(res.body.data.gisLayer.name).toBe('Coringa Mangrove Canopy Boundary 2025');
      expect(res.body.data.userAccess.canDownload).toBe(true);
    });

    it('returns HTTP 404 for nonexistent dataset ID', async () => {
      vi.spyOn(defaultDatasetRepository, 'findById').mockResolvedValue(null);

      const res = await request(app).get('/api/v1/datasets/NONEXISTENT-DS');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/v1/datasets', () => {
    it('rejects unauthenticated dataset registration with HTTP 401', async () => {
      const res = await request(app).post('/api/v1/datasets').send({
        title: 'New Cadastral Dataset',
        sourceId: 'SAMPLE-SRC-001',
        datasetType: 'LAND',
        technicalFormat: 'GEOJSON',
        updateFrequency: 'ANNUAL',
        accessLevel: 'OPEN',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects unauthorized VIEWER with HTTP 403', async () => {
      mockUserSession('VIEWER');

      const res = await request(app)
        .post('/api/v1/datasets')
        .set('Cookie', ['bluetrace_session=mock-token'])
        .send({
          title: 'New Cadastral Dataset',
          sourceId: 'SAMPLE-SRC-001',
          datasetType: 'LAND',
          technicalFormat: 'GEOJSON',
          updateFrequency: 'ANNUAL',
          accessLevel: 'OPEN',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('allows RESEARCHER to register dataset and records audit event', async () => {
      mockUserSession('RESEARCHER');

      vi.spyOn(defaultDatasetRepository, 'create').mockResolvedValue(sampleDatasetDetail);
      const auditSpy = vi.spyOn(defaultAuditRepository, 'create');

      const res = await request(app)
        .post('/api/v1/datasets')
        .set('Cookie', ['bluetrace_session=mock-token'])
        .send({
          title: 'New Cadastral Dataset',
          sourceId: 'SAMPLE-SRC-001',
          datasetType: 'LAND',
          technicalFormat: 'GEOJSON',
          updateFrequency: 'ANNUAL',
          accessLevel: 'OPEN',
          tags: ['cadastre', 'land-use'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('SAMPLE-EV-001');

      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'dataset:create',
          targetType: 'dataset',
          status: 'SUCCESS',
        }),
      );
    });
  });

  describe('PATCH /api/v1/datasets/:id', () => {
    it('allows POLICY_OFFICER to update dataset metadata and records audit log', async () => {
      mockUserSession('POLICY_OFFICER');

      const updatedDetail: DatasetDetailDto = {
        ...sampleDatasetDetail,
        metadata: {
          ...sampleDatasetDetail.metadata,
          updateFrequency: 'MONTHLY',
        },
      };

      vi.spyOn(defaultDatasetRepository, 'update').mockResolvedValue(updatedDetail);
      const auditSpy = vi.spyOn(defaultAuditRepository, 'create');

      const res = await request(app)
        .patch('/api/v1/datasets/SAMPLE-EV-001')
        .set('Cookie', ['bluetrace_session=mock-token'])
        .send({
          updateFrequency: 'MONTHLY',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metadata.updateFrequency).toBe('MONTHLY');

      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'dataset:update',
          targetType: 'dataset',
          status: 'SUCCESS',
        }),
      );
    });
  });

  describe('POST /api/v1/datasets/:id/attachments & GET download', () => {
    it('uploads valid dataset attachment and streams download with headers', async () => {
      mockUserSession('RESEARCHER');

      vi.spyOn(defaultDatasetRepository, 'findById').mockResolvedValue(sampleDatasetDetail);
      vi.spyOn(defaultStorageAdapter, 'upload').mockResolvedValue({
        key: 'evidence/uuid_research_sample.csv',
        sizeBytes: 26,
        mimeType: 'text/csv',
        lastModified: new Date().toISOString(),
        checksum: 'mock-sha',
      });
      vi.spyOn(defaultDatasetRepository, 'createAttachment').mockResolvedValue({
        id: 'ATT-MOCK-001',
        evidenceId: 'SAMPLE-EV-001',
        fileName: 'research_sample.csv',
        fileSize: 26,
        mimeType: 'text/csv',
        storageKey: 'evidence/uuid_research_sample.csv',
        checksumSha256: 'mock-sha',
        sampleFlag: true,
        createdAt: new Date(),
      });

      const resUpload = await request(app)
        .post('/api/v1/datasets/SAMPLE-EV-001/attachments')
        .set('Cookie', ['bluetrace_session=mock-token'])
        .send({
          fileName: 'research_sample.csv',
          mimeType: 'text/csv',
          content: 'sample_id,density\n1,120.5',
        });

      expect(resUpload.status).toBe(201);
      expect(resUpload.body.success).toBe(true);
      expect(resUpload.body.data.fileName).toBe('research_sample.csv');

      const attachmentId = resUpload.body.data.id;

      // Mock repository finding attachment
      vi.spyOn(defaultDatasetRepository, 'findAttachmentById').mockResolvedValue({
        id: attachmentId,
        evidenceId: 'SAMPLE-EV-001',
        fileName: 'research_sample.csv',
        fileSize: 26,
        mimeType: 'text/csv',
        storageKey: 'evidence/uuid_research_sample.csv',
        checksumSha256: 'mock-sha',
        sampleFlag: true,
        createdAt: new Date(),
      });

      vi.spyOn(defaultStorageAdapter, 'getBuffer').mockResolvedValue({
        key: 'evidence/uuid_research_sample.csv',
        data: Buffer.from('sample_id,density\n1,120.5', 'utf8'),
        mimeType: 'text/csv',
        sizeBytes: 26,
        checksumSha256: 'mock-sha',
        createdAt: new Date().toISOString(),
      });

      const resDownload = await request(app).get(
        `/api/v1/datasets/SAMPLE-EV-001/attachments/${attachmentId}/download`,
      );

      expect(resDownload.status).toBe(200);
      expect(resDownload.headers['content-type']).toContain('text/csv');
      expect(resDownload.headers['content-disposition']).toContain('attachment; filename=');
      expect(resDownload.text).toContain('sample_id,density');
    });

    it('denies download if dataset access level is restricted and user lacks clearance', async () => {
      const restrictedDataset: DatasetDetailDto = {
        ...sampleDatasetDetail,
        metadata: {
          ...sampleDatasetDetail.metadata,
          accessLevel: 'RESTRICTED',
        },
        userAccess: {
          canDownload: false,
          reason: 'Restricted dataset requires verified researcher or policy officer clearance.',
        },
      };

      vi.spyOn(defaultDatasetRepository, 'findById').mockResolvedValue(restrictedDataset);

      const res = await request(app).get(
        '/api/v1/datasets/SAMPLE-EV-001/attachments/SAMPLE-ATT-001/download',
      );

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
