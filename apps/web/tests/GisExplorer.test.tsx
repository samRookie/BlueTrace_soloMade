import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { GisExplorer } from '../src/components/GisExplorer.js';
import * as apiClient from '../src/api/client.js';
import type {
  GisLayerDto,
  GisFeatureDto,
  GisFeatureDetailDto,
  RegionalContextDto,
} from '@sih26019/shared-types';

describe('Web Component - GisExplorer', () => {
  const mockNavigateTab = vi.fn();

  const mockLayers: GisLayerDto[] = [
    {
      id: 'SAMPLE-GIS-001',
      name: 'Coringa Mangrove Forest Canopy',
      description: 'Primary mangrove forest reserve boundaries.',
      layerType: 'COASTAL',
      geometryType: 'Polygon',
      regionId: 'SAMPLE-REG-KR-001',
      regionName: 'Coringa Mangrove Estuarine Zone',
      sourceId: 'SRC-001',
      sourceTitle: 'FSI Mangrove Assessment',
      period: '2024-Q1',
      coverage: '124.5 sq km',
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
      sampleFlag: true,
      legend: { color: '#059669', strokeColor: '#047857', fillOpacity: 0.6, symbol: 'polygon' },
      featureCount: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'SAMPLE-GIS-004',
      name: 'Artisanal Fishing Buffer Mediation Zone',
      description: 'Contested buffer zone under mediation.',
      layerType: 'DISPUTES',
      geometryType: 'Polygon',
      regionId: 'SAMPLE-REG-KR-001',
      regionName: 'Coringa Mangrove Estuarine Zone',
      sourceId: 'SRC-002',
      sourceTitle: 'District Revenue Office',
      period: '2024-Q2',
      coverage: '38.2 sq km',
      visibility: 'INTERNAL',
      status: 'PUBLISHED',
      sampleFlag: true,
      legend: { color: '#dc2626', strokeColor: '#b91c1c', fillOpacity: 0.5, symbol: 'polygon' },
      featureCount: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockFeatures: GisFeatureDto[] = [
    {
      id: 'SAMPLE-FEAT-001',
      layerId: 'SAMPLE-GIS-001',
      layerName: 'Coringa Mangrove Forest Canopy',
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
      properties: { name: 'Core Mangrove Parcel A', canopyCover: '88%' },
      visibility: 'PUBLIC',
      sampleFlag: true,
      relationships: {
        evidenceId: 'SAMPLE-EVD-001',
        evidenceTitle: 'Mangrove Carbon Stock Assessment 2024',
        datasetId: 'SAMPLE-DTS-001',
        datasetTitle: 'Coringa Estuary Blue Carbon Baseline Dataset',
      },
    },
  ];

  const mockFeatureDetail: GisFeatureDetailDto = {
    ...mockFeatures[0]!,
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
      project: {
        id: 'SAMPLE-PRJ-001',
        name: 'Coringa Estuary Blue Carbon Restoration',
        code: 'PRJ-CRG-001',
      },
      policy: {
        id: 'SAMPLE-POL-001',
        title: 'National Coastal Zone Management Policy 2025',
        code: 'POL-CRZ-2025',
      },
      indicator: {
        id: 'SAMPLE-IND-001',
        name: 'Canopy Density Index',
        unit: 'Percentage',
      },
      dispute: null,
      blueCarbon: {
        id: 'SAMPLE-BC-001',
        ecosystemType: 'Mangrove',
        estimatedHectares: '124.5',
      },
    },
  };

  const mockRegionalContext: RegionalContextDto = {
    region: {
      id: 'SAMPLE-REG-KR-001',
      code: 'IN-AP-CORINGA',
      name: 'Coringa Mangrove Estuarine Zone',
      level: 'DISTRICT',
      sampleFlag: true,
      hasGisCoverage: true,
    },
    gisLayers: mockLayers,
    featureCount: 3,
    counts: {
      evidence: 2,
      datasets: 1,
      policies: 1,
      projects: 1,
      indicators: 1,
      disputes: 1,
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
      disputes: [
        {
          id: 'SAMPLE-DSP-001',
          title: 'Artisanal Fishing Community Buffer Dispute',
          status: 'IN_MEDIATION',
        },
      ],
      blueCarbon: {
        id: 'SAMPLE-BC-001',
        ecosystemType: 'Mangrove',
        estimatedHectares: '124.5',
        targetCo2SequesterTpy: '4500.00',
      },
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigateTab.mockClear();

    vi.spyOn(apiClient, 'getRegions').mockResolvedValue({
      success: true,
      data: {
        items: [
          {
            id: 'SAMPLE-REG-KR-001',
            code: 'IN-AP-CORINGA',
            name: 'Coringa Mangrove Estuarine Zone',
            level: 'DISTRICT',
          },
        ],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      },
    });

    vi.spyOn(apiClient, 'getGisLayers').mockResolvedValue({
      success: true,
      data: mockLayers,
    });

    vi.spyOn(apiClient, 'getRegionContext').mockResolvedValue({
      success: true,
      data: mockRegionalContext,
    });

    vi.spyOn(apiClient, 'getGisFeatures').mockResolvedValue({
      success: true,
      data: {
        items: mockFeatures,
        pagination: { page: 1, pageSize: 50, total: 1, totalPages: 1 },
      },
    });

    vi.spyOn(apiClient, 'getGisFeatureById').mockResolvedValue({
      success: true,
      data: mockFeatureDetail,
    });
  });

  it('renders GIS Explorer header, region selector, and prototype badge', async () => {
    render(<GisExplorer onNavigateTab={mockNavigateTab} />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: /GIS Explorer & Regional Context/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Prototype \/ Sample Data/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Region:/i)).toBeInTheDocument();
    });
  });

  it('displays layers and legend controls', async () => {
    render(<GisExplorer onNavigateTab={mockNavigateTab} />);

    await waitFor(() => {
      expect(screen.getByText('Coringa Mangrove Forest Canopy')).toBeInTheDocument();
      expect(screen.getByText('Artisanal Fishing Buffer Mediation Zone')).toBeInTheDocument();
      expect(screen.getByText('🔒 INTERNAL')).toBeInTheDocument();
    });
  });

  it('renders SVG map by default and toggles to Accessible Table view', async () => {
    render(<GisExplorer onNavigateTab={mockNavigateTab} />);

    await waitFor(() => {
      expect(
        screen.getByRole('region', { name: /Interactive GIS Spatial Map/i }),
      ).toBeInTheDocument();
    });

    // Switch to table view
    fireEvent.click(screen.getByRole('button', { name: /Accessible Table/i }));

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByText('SAMPLE-FEAT-001')[0]).toBeInTheDocument();
    });
  });

  it('simulates Map Provider Failure and allows quick switch to Accessible Table', async () => {
    render(<GisExplorer onNavigateTab={mockNavigateTab} />);

    await waitFor(() => {
      expect(
        screen.getByRole('region', { name: /Interactive GIS Spatial Map/i }),
      ).toBeInTheDocument();
    });

    // Toggle simulated failure
    const failureCheckbox = screen.getByLabelText(/Simulate Map Failure/i);
    fireEvent.click(failureCheckbox);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Simulated Map Provider Failure/i)).toBeInTheDocument();
    });

    // Click switch button inside fallback alert
    const fallbackSwitchBtn = screen.getByRole('button', {
      name: /Switch to Accessible Table View/i,
    });
    fireEvent.click(fallbackSwitchBtn);

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  it('opens feature detail modal on click and enables cross-module navigation', async () => {
    render(<GisExplorer onNavigateTab={mockNavigateTab} />);

    // Switch to table view to easily click inspect
    fireEvent.click(screen.getByRole('button', { name: /Accessible Table/i }));

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByText('SAMPLE-FEAT-001')[0]).toBeInTheDocument();
    });

    // Click inspect button
    const inspectBtns = screen.getAllByRole('button', { name: /Inspect/i });
    fireEvent.click(inspectBtns[0]!);

    await waitFor(() => {
      expect(apiClient.getGisFeatureById).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 3, name: 'Core Mangrove Parcel A' }),
      ).toBeInTheDocument();
      expect(screen.getByText(/LINKED EVIDENCE ITEM/i)).toBeInTheDocument();
      expect(screen.getByText(/LINKED SCIENTIFIC DATASET/i)).toBeInTheDocument();
    });

    // Click Open Evidence cross-module button
    const openEvidenceBtn = screen.getByRole('button', { name: /Open Evidence →/i });
    fireEvent.click(openEvidenceBtn);

    expect(mockNavigateTab).toHaveBeenCalledWith('evidence');
  });

  it('displays regional context ecosystem synthesis cards and counts', async () => {
    render(<GisExplorer onNavigateTab={mockNavigateTab} />);

    await waitFor(() => {
      expect(screen.getByText(/Regional Evidence & Governance Ecosystem/i)).toBeInTheDocument();
      expect(screen.getByText(/IN-AP-CORINGA • DISTRICT/i)).toBeInTheDocument();
    });
  });
});
