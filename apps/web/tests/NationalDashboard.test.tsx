import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { NationalDashboard } from '../src/components/NationalDashboard.js';
import * as apiClient from '../src/api/client.js';
import type { AnalyticsOverviewDto } from '@sih26019/shared-types';

describe('Web Component - NationalDashboard', () => {
  const mockNavigateTab = vi.fn();

  const mockAnalyticsData: AnalyticsOverviewDto = {
    context: {
      regionName: 'National Jurisdiction',
      sampleFlag: true,
      generatedAt: '2026-09-03T12:00:00.000Z',
    },
    sections: {
      nationalSnapshot: [
        {
          key: 'total_evidence_items',
          label: 'Cataloged Evidence Items',
          value: 12,
          unit: 'records',
          definition:
            'Total count of accessible evidence records across all legal, scientific, and policy categories.',
          source: 'Knowledge & Evidence Repository',
          period: { type: 'CATALOG_SNAPSHOT' },
          region: { scope: 'NATIONAL' },
          sampleFlag: true,
          status: 'AVAILABLE',
          detailPath: '/evidence',
        },
        {
          key: 'total_cataloged_datasets',
          label: 'Reusable Datasets',
          value: 5,
          unit: 'datasets',
          definition:
            'Count of reusable scientific and geospatial datasets cataloged with access controls.',
          source: 'Dataset Catalog & Storage',
          period: { type: 'CATALOG_SNAPSHOT' },
          region: { scope: 'NATIONAL' },
          sampleFlag: true,
          status: 'AVAILABLE',
          detailPath: '/datasets',
        },
      ],
      evidenceActivity: [
        {
          key: 'evidence_items_published',
          label: 'Published Evidence Items',
          value: 12,
          unit: 'records',
          definition: 'Formally published evidence items ready for institutional citation.',
          source: 'Knowledge & Evidence Repository',
          period: { type: 'CATALOG_SNAPSHOT' },
          region: { scope: 'NATIONAL' },
          sampleFlag: true,
          status: 'AVAILABLE',
          detailPath: '/evidence',
        },
      ],
      geospatialIntelligence: [
        {
          key: 'gis_linked_datasets',
          label: 'GIS-Linked Datasets',
          value: 2,
          unit: 'datasets',
          definition: 'Cataloged datasets directly connected to spatial GIS layers.',
          source: 'Dataset Catalog & GIS Index',
          period: { type: 'CATALOG_SNAPSHOT' },
          region: { scope: 'NATIONAL' },
          sampleFlag: true,
          status: 'AVAILABLE',
          detailPath: '/datasets',
        },
      ],
      policyIntelligence: [
        {
          key: 'published_policies',
          label: 'Active Policy Frameworks',
          value: 1,
          unit: 'records',
          definition: 'Published regulatory guidelines.',
          source: 'National Policy Registry',
          period: { type: 'CATALOG_SNAPSHOT' },
          region: { scope: 'NATIONAL' },
          sampleFlag: true,
          status: 'AVAILABLE',
          detailPath: '/evidence',
        },
      ],
      implementation: [
        {
          key: 'active_governance_projects',
          label: 'Published Pilots',
          value: 1,
          unit: 'projects',
          definition: 'Formally active and published projects.',
          source: 'Project Implementation Registry',
          period: { type: 'CATALOG_SNAPSHOT' },
          region: { scope: 'NATIONAL' },
          sampleFlag: true,
          status: 'AVAILABLE',
          detailPath: '/workspaces',
        },
      ],
      environmental: [
        {
          key: 'total_restoration_hectares',
          label: 'Restoration Area',
          value: 12500,
          unit: 'hectares',
          definition: 'Total estimated wetland and mangrove area under active restoration.',
          source: 'Blue Carbon Project Baselines',
          period: { type: 'CATALOG_SNAPSHOT' },
          region: { scope: 'NATIONAL' },
          sampleFlag: true,
          status: 'AVAILABLE',
          detailPath: '/workspaces',
        },
      ],
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all 6 dashboard sections and metric cards', async () => {
    vi.spyOn(apiClient, 'getAnalyticsOverview').mockResolvedValue({
      success: true,
      data: mockAnalyticsData,
    });

    render(<NationalDashboard onNavigateTab={mockNavigateTab} />);

    await waitFor(() => {
      expect(screen.getByText('National Evidence & Governance Overview')).toBeInTheDocument();
      expect(screen.getByText('National Snapshot')).toBeInTheDocument();
      expect(screen.getByText('Evidence & Research Activity')).toBeInTheDocument();
      expect(screen.getByText('Geospatial Intelligence & Spatial Extent')).toBeInTheDocument();
      expect(screen.getByText('Policy Intelligence & Indicators')).toBeInTheDocument();
      expect(screen.getByText('Implementation & Project Governance')).toBeInTheDocument();
      expect(screen.getByText('Environmental & Blue Carbon Ecosystems')).toBeInTheDocument();
    });

    // Check metric labels and values
    expect(screen.getByText('Cataloged Evidence Items')).toBeInTheDocument();
    expect(screen.getByTestId('metric-value-total_evidence_items')).toHaveTextContent('12');
    expect(screen.getByText('Reusable Datasets')).toBeInTheDocument();
    expect(screen.getByTestId('metric-value-total_cataloged_datasets')).toHaveTextContent('5');
    expect(screen.getByText('Restoration Area')).toBeInTheDocument();
    expect(screen.getByTestId('metric-value-total_restoration_hectares')).toHaveTextContent(
      '12,500',
    );

    // Prototype sample notice
    expect(screen.getByText(/Prototype Demonstration Environment/i)).toBeInTheDocument();
  });

  it('triggers refetch when changing geographic jurisdiction region', async () => {
    const fetchSpy = vi.spyOn(apiClient, 'getAnalyticsOverview').mockResolvedValue({
      success: true,
      data: mockAnalyticsData,
    });

    render(<NationalDashboard onNavigateTab={mockNavigateTab} />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith({});
    });

    const regionSelect = screen.getByLabelText(/Geographic Jurisdiction/i);
    fireEvent.change(regionSelect, { target: { value: 'SAMPLE-REG-KR-001' } });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith({ regionId: 'SAMPLE-REG-KR-001' });
    });
  });

  it('triggers refetch when changing reporting cycle period', async () => {
    const fetchSpy = vi.spyOn(apiClient, 'getAnalyticsOverview').mockResolvedValue({
      success: true,
      data: mockAnalyticsData,
    });

    render(<NationalDashboard onNavigateTab={mockNavigateTab} />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith({});
    });

    const periodSelect = screen.getByLabelText(/Reporting Cycle/i);
    fireEvent.change(periodSelect, { target: { value: '2025-2026' } });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith({
        periodStart: '2025-01-01T00:00:00.000Z',
        periodEnd: '2026-12-31T23:59:59.000Z',
      });
    });
  });

  it('navigates to relevant module tab when Explore button is clicked', async () => {
    vi.spyOn(apiClient, 'getAnalyticsOverview').mockResolvedValue({
      success: true,
      data: mockAnalyticsData,
    });

    render(<NationalDashboard onNavigateTab={mockNavigateTab} />);

    await waitFor(() => {
      expect(screen.getByTestId('metric-explore-total_cataloged_datasets')).toBeInTheDocument();
    });

    const exploreBtn = screen.getByTestId('metric-explore-total_cataloged_datasets');
    fireEvent.click(exploreBtn);

    expect(mockNavigateTab).toHaveBeenCalledWith('datasets');
  });

  it('displays error notice and allows retry on failure', async () => {
    vi.spyOn(apiClient, 'getAnalyticsOverview')
      .mockResolvedValueOnce({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Database aggregation timed out.',
        },
      })
      .mockResolvedValueOnce({
        success: true,
        data: mockAnalyticsData,
      });

    render(<NationalDashboard onNavigateTab={mockNavigateTab} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load National Overview')).toBeInTheDocument();
      expect(screen.getByText('Database aggregation timed out.')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /Retry Loading/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('National Snapshot')).toBeInTheDocument();
    });
  });
});
