import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { defaultSessionRepository } from '../../src/repositories/sessionRepository.js';
import { defaultAuditRepository } from '../../src/repositories/auditRepository.js';
import { defaultEvidenceRepository } from '../../src/repositories/evidenceRepository.js';
import { defaultStorageAdapter } from '../../src/storage/storageAdapter.js';
import type { UserRow, AuditEventRow } from '@sih26019/db';
import type { Role, EvidenceDetailDto } from '@sih26019/shared-types';

describe('API Integration - Phase 5 Knowledge and Evidence Repository', () => {
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

  const sampleEvidenceDetail: EvidenceDetailDto = {
    id: 'SAMPLE-EV-001',
    title: 'Sentinel-2 Multispectral Surface Reflectance Canopy Density Scan',
    category: 'DATASET',
    sourceId: 'SAMPLE-SRC-002',
    source: {
      sourceId: 'SAMPLE-SRC-002',
      title: 'Sentinel-2 Coastal Mangrove Biomass Index',
      sourceType: 'SATELLITE_OBSERVATION',
      publisher: 'Space Applications Centre',
    },
    projectId: 'SAMPLE-PROJ-001',
    policyId: 'SAMPLE-POL-001',
    project: {
      id: 'SAMPLE-PROJ-001',
      code: 'PROJ-CORINGA-BC-01',
      name: 'Coringa Estuarine Blue Carbon Restoration Pilot',
    },
    policy: {
      id: 'SAMPLE-POL-001',
      code: 'POL-MANGROVE-2024',
      title: 'National Coastal Mangrove Restoration Guidelines 2024',
    },
    lifecycleStatus: 'PUBLISHED',
    integrityStatus: 'VERIFIED',
    visibility: 'PUBLIC',
    sampleFlag: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
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

  describe('GET /api/v1/evidence', () => {
    it('returns paginated list of public evidence items for unauthenticated users', async () => {
      vi.spyOn(defaultEvidenceRepository, 'findMany').mockResolvedValue({
        items: [sampleEvidenceDetail],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const response = await request(app).get('/api/v1/evidence');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('SAMPLE-EV-001');
      expect(response.body.meta.total).toBe(1);
    });

    it('supports alias /api/v1/research route', async () => {
      vi.spyOn(defaultEvidenceRepository, 'findMany').mockResolvedValue({
        items: [sampleEvidenceDetail],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const response = await request(app).get('/api/v1/research');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/evidence/:id', () => {
    it('returns detailed evidence item with graph relations and attachments', async () => {
      vi.spyOn(defaultEvidenceRepository, 'findById').mockResolvedValue(sampleEvidenceDetail);

      const response = await request(app).get('/api/v1/evidence/SAMPLE-EV-001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('SAMPLE-EV-001');
      expect(response.body.data.project.code).toBe('PROJ-CORINGA-BC-01');
      expect(response.body.data.attachments).toHaveLength(1);
    });

    it('returns 404 if evidence item does not exist', async () => {
      vi.spyOn(defaultEvidenceRepository, 'findById').mockResolvedValue(null);

      const response = await request(app).get('/api/v1/evidence/NONEXISTENT-EV');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/v1/evidence (Create Evidence Item)', () => {
    it('allows authenticated RESEARCHER with evidence:create permission to create item', async () => {
      mockUserSession('RESEARCHER');

      vi.spyOn(defaultEvidenceRepository, 'create').mockResolvedValue({
        id: 'EV-NEW-001',
        title: 'New Mangrove Sequestration Survey',
        category: 'RESEARCH_PAPER',
        sourceId: 'SAMPLE-SRC-001',
        projectId: 'SAMPLE-PROJ-001',
        policyId: 'SAMPLE-POL-001',
        lifecycleStatus: 'PUBLISHED',
        integrityStatus: 'VERIFIED',
        visibility: 'PUBLIC',
        sampleFlag: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.spyOn(defaultEvidenceRepository, 'findById').mockResolvedValue({
        ...sampleEvidenceDetail,
        id: 'EV-NEW-001',
        title: 'New Mangrove Sequestration Survey',
        category: 'RESEARCH_PAPER',
      });

      const response = await request(app)
        .post('/api/v1/evidence')
        .set('Cookie', ['bluetrace_session=mock-token'])
        .send({
          title: 'New Mangrove Sequestration Survey',
          category: 'RESEARCH_PAPER',
          sourceId: 'SAMPLE-SRC-001',
          projectId: 'SAMPLE-PROJ-001',
          policyId: 'SAMPLE-POL-001',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Mangrove Sequestration Survey');
    });

    it('rejects unauthenticated creation attempt with 401 UNAUTHORIZED', async () => {
      const response = await request(app).post('/api/v1/evidence').send({
        title: 'Unauthorized Evidence',
        category: 'RESEARCH_PAPER',
        sourceId: 'SAMPLE-SRC-001',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/evidence/:id/relationships (Evidence Graph Linking)', () => {
    it('creates directed relationship between two evidence records', async () => {
      mockUserSession('POLICY_OFFICER');

      vi.spyOn(defaultEvidenceRepository, 'findById').mockImplementation(async (id) => {
        if (id === 'SAMPLE-EV-001' || id === 'SAMPLE-EV-002') {
          return { ...sampleEvidenceDetail, id };
        }
        return null;
      });

      vi.spyOn(defaultEvidenceRepository, 'createRelationship').mockResolvedValue({
        id: 'REL-NEW-001',
        sourceEvidenceId: 'SAMPLE-EV-001',
        targetEvidenceId: 'SAMPLE-EV-002',
        relationshipType: 'SUPPORTS',
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/api/v1/evidence/SAMPLE-EV-001/relationships')
        .set('Cookie', ['bluetrace_session=mock-token'])
        .send({
          targetEvidenceId: 'SAMPLE-EV-002',
          relationshipType: 'SUPPORTS',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('rejects self-loop relationship (source === target) with 400 BAD_REQUEST', async () => {
      mockUserSession('POLICY_OFFICER');

      const response = await request(app)
        .post('/api/v1/evidence/SAMPLE-EV-001/relationships')
        .set('Cookie', ['bluetrace_session=mock-token'])
        .send({
          targetEvidenceId: 'SAMPLE-EV-001',
          relationshipType: 'SUPPORTS',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('Attachments & Secure Download Stream', () => {
    it('uploads safe attachment and stores metadata with SHA-256 checksum', async () => {
      mockUserSession('RESEARCHER');

      vi.spyOn(defaultEvidenceRepository, 'findById').mockResolvedValue(sampleEvidenceDetail);
      vi.spyOn(defaultStorageAdapter, 'upload').mockResolvedValue({
        key: 'evidence/uuid_field_cores.csv',
        sizeBytes: 128,
        mimeType: 'text/csv',
        lastModified: new Date().toISOString(),
        checksum: 'mock-sha256-checksum',
      });
      vi.spyOn(defaultEvidenceRepository, 'createAttachment').mockResolvedValue({
        id: 'ATT-NEW-001',
        evidenceId: 'SAMPLE-EV-001',
        fileName: 'field_cores.csv',
        fileSize: 128,
        mimeType: 'text/csv',
        storageKey: 'evidence/uuid_field_cores.csv',
        checksumSha256: 'mock-sha256-checksum',
        sampleFlag: true,
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/api/v1/evidence/SAMPLE-EV-001/attachments')
        .set('Cookie', ['bluetrace_session=mock-token'])
        .send({
          fileName: 'field_cores.csv',
          mimeType: 'text/csv',
          content: 'sample core 1, 142.5\nsample core 2, 138.2',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fileName).toBe('field_cores.csv');
      expect(response.body.data.checksumSha256).toBe('mock-sha256-checksum');
    });

    it('downloads attached file with correct Content-Type and Content-Disposition headers', async () => {
      vi.spyOn(defaultEvidenceRepository, 'findById').mockResolvedValue(sampleEvidenceDetail);
      vi.spyOn(defaultEvidenceRepository, 'findAttachmentById').mockResolvedValue({
        id: 'SAMPLE-ATT-001',
        evidenceId: 'SAMPLE-EV-001',
        fileName: 'coringa_sentinel2_canopy_2025.geojson',
        fileSize: 48,
        mimeType: 'application/geo+json',
        storageKey: 'evidence/coringa_sentinel2_canopy_2025.geojson',
        checksumSha256: 'mock-hash',
        sampleFlag: true,
        createdAt: new Date(),
      });

      vi.spyOn(defaultStorageAdapter, 'getBuffer').mockResolvedValue({
        key: 'evidence/coringa_sentinel2_canopy_2025.geojson',
        data: Buffer.from('{"type":"FeatureCollection","features":[]}', 'utf8'),
        mimeType: 'application/geo+json',
        sizeBytes: 48,
        checksumSha256: 'mock-hash',
        createdAt: new Date().toISOString(),
      });

      const response = await request(app).get(
        '/api/v1/evidence/SAMPLE-EV-001/attachments/SAMPLE-ATT-001/download',
      );

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/geo+json');
      expect(response.headers['content-disposition']).toContain(
        'coringa_sentinel2_canopy_2025.geojson',
      );
      expect(response.text).toContain('FeatureCollection');
    });
  });
});
