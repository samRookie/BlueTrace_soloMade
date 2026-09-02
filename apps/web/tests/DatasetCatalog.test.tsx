import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { DatasetCatalog } from '../src/components/DatasetCatalog.js';
import * as client from '../src/api/client.js';
import type { DatasetItemDto, DatasetDetailDto } from '@sih26019/shared-types';

const mockDatasetItems: DatasetItemDto[] = [
  {
    id: 'SAMPLE-EV-001',
    title: 'Sentinel-2 Multispectral Surface Reflectance Canopy Density Scan',
    category: 'DATASET',
    source: {
      sourceId: 'SAMPLE-SRC-002',
      title: 'Sentinel-2 Coastal Mangrove Biomass Index',
      sourceType: 'SATELLITE_OBSERVATION',
    },
    datasetType: 'REMOTE_SENSING',
    technicalFormat: 'GEOTIFF',
    updateFrequency: 'QUARTERLY',
    accessLevel: 'OPEN',
    spatialCoverageSummary: 'Coringa Mangrove Reserve Forest & Estuary Buffer',
    temporalCoverageStart: '2025-01-01T00:00:00.000Z',
    temporalCoverageEnd: '2025-09-30T23:59:59.000Z',
    regionId: 'SAMPLE-REG-KR-001',
    regionName: 'Coringa Mangrove Estuarine Zone',
    gisLayerId: 'SAMPLE-GIS-001',
    gisLayerName: 'Coringa Mangrove Canopy Boundary 2025',
    tags: ['remote-sensing', 'sentinel-2', 'canopy'],
    lifecycleStatus: 'PUBLISHED',
    integrityStatus: 'VERIFIED',
    visibility: 'PUBLIC',
    sampleFlag: true,
    attachmentsCount: 1,
    relationshipsCount: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'SAMPLE-EV-009',
    title: 'National Cadastral Land-Use & Coastal Buffer Classification 2025',
    category: 'DATASET',
    source: {
      sourceId: 'SAMPLE-SRC-003',
      title: 'Digital Land Records Modernization Survey',
      sourceType: 'GOVERNMENT_RECORD',
    },
    datasetType: 'LAND',
    technicalFormat: 'GEOJSON',
    updateFrequency: 'ANNUAL',
    accessLevel: 'OPEN',
    spatialCoverageSummary: 'Andhra Pradesh Coastal Zone & Coringa Estuary',
    temporalCoverageStart: '2025-01-01T00:00:00.000Z',
    temporalCoverageEnd: '2025-12-31T23:59:59.000Z',
    regionId: 'SAMPLE-REG-KR-001',
    regionName: 'Coringa Mangrove Estuarine Zone',
    gisLayerId: 'SAMPLE-GIS-001',
    gisLayerName: 'Coringa Mangrove Canopy Boundary 2025',
    tags: ['cadastre', 'land-use', 'zoning'],
    lifecycleStatus: 'PUBLISHED',
    integrityStatus: 'VERIFIED',
    visibility: 'PUBLIC',
    sampleFlag: true,
    attachmentsCount: 1,
    relationshipsCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const mockDatasetDetail: DatasetDetailDto = {
  id: 'SAMPLE-EV-001',
  title: 'Sentinel-2 Multispectral Surface Reflectance Canopy Density Scan',
  category: 'DATASET',
  source: {
    sourceId: 'SAMPLE-SRC-002',
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
  outgoingRelationships: [
    {
      id: 'SAMPLE-REL-002',
      sourceEvidenceId: 'SAMPLE-EV-001',
      targetEvidenceId: 'SAMPLE-EV-003',
      relationshipType: 'SUPPORTS',
      targetEvidence: {
        id: 'SAMPLE-EV-003',
        title: 'National Coastal Mangrove Restoration Guidelines 2024',
        category: 'POLICY_DOCUMENT',
        integrityStatus: 'VERIFIED',
      },
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
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

describe('Web Component - DatasetCatalog (Phase 6 Dataset Catalog & Storage)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(client, 'getDatasets').mockResolvedValue({
      success: true,
      data: mockDatasetItems,
      meta: { total: 2, page: 1, limit: 12, totalPages: 1 },
    });

    vi.spyOn(client, 'getDatasetById').mockResolvedValue({
      success: true,
      data: mockDatasetDetail,
    });
  });

  it('renders dataset catalog title and synthetic prototype disclaimer notice', async () => {
    render(<DatasetCatalog />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /Dataset Catalog & Evidence Storage/i,
        }),
      ).toBeInTheDocument();

      expect(screen.getByText(/RESEARCH & DEMONSTRATION PROTOTYPE:/i)).toBeInTheDocument();
      expect(screen.getByText(/Pillar 2 Catalog/i)).toBeInTheDocument();
    });
  });

  it('renders dataset cards with category, format, and access level badges', async () => {
    render(<DatasetCatalog />);

    await waitFor(() => {
      expect(
        screen.getByText('Sentinel-2 Multispectral Surface Reflectance Canopy Density Scan'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('National Cadastral Land-Use & Coastal Buffer Classification 2025'),
      ).toBeInTheDocument();

      expect(screen.getByText('REMOTE_SENSING')).toBeInTheDocument();
      expect(screen.getByText('LAND')).toBeInTheDocument();
      expect(screen.getByText('GEOTIFF')).toBeInTheDocument();
      expect(screen.getByText('GEOJSON')).toBeInTheDocument();
    });
  });

  it('opens DatasetDetailModal with full metadata and attachments when clicking Explore', async () => {
    render(<DatasetCatalog />);

    await waitFor(() => {
      expect(
        screen.getByText('Sentinel-2 Multispectral Surface Reflectance Canopy Density Scan'),
      ).toBeInTheDocument();
    });

    const exploreButtons = screen.getAllByRole('button', { name: /Explore Dataset/i });
    expect(exploreButtons.length).toBeGreaterThan(0);
    expect(exploreButtons[0]).toBeDefined();

    fireEvent.click(exploreButtons[0]!);

    await waitFor(() => {
      expect(screen.getByText(/Geographic & Temporal Coverage/i)).toBeInTheDocument();
      expect(screen.getByText(/Data Source & Provenance/i)).toBeInTheDocument();
      expect(screen.getByText(/NOT LIVE FEED/i)).toBeInTheDocument();
    });
  });
});
