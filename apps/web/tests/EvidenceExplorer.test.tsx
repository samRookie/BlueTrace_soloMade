import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { EvidenceExplorer } from '../src/components/EvidenceExplorer.js';
import * as client from '../src/api/client.js';
import { AuthContext } from '../src/context/AuthContext.js';
import type { EvidenceItemDto, AuthenticatedUser } from '@sih26019/shared-types';

const mockEvidenceItems: EvidenceItemDto[] = [
  {
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
    lifecycleStatus: 'PUBLISHED',
    integrityStatus: 'VERIFIED',
    visibility: 'PUBLIC',
    sampleFlag: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    outgoingRelationshipsCount: 1,
    incomingRelationshipsCount: 1,
    attachmentsCount: 1,
  },
];

const mockResearcher: AuthenticatedUser = {
  id: 'USR-RESEARCHER',
  email: 'researcher@bluetrace.gov.in',
  name: 'Dr. Anand Rao',
  role: 'RESEARCHER',
  status: 'ACTIVE',
  sampleFlag: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('Web Component - EvidenceExplorer (Phase 5 Knowledge & Evidence)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(client, 'getEvidenceList').mockResolvedValue({
      success: true,
      data: mockEvidenceItems,
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });
  });

  it('renders knowledge repository header and prototype disclaimer notice', async () => {
    render(
      <AuthContext.Provider
        value={{
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          login: vi.fn(),
          logout: vi.fn(),
          demoLogin: vi.fn(),
          clearError: vi.fn(),
        }}
      >
        <EvidenceExplorer />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /Knowledge & Evidence Repository/i,
        }),
      ).toBeInTheDocument();

      expect(screen.getByText(/Prototype \/ Demonstration Dataset Notice:/i)).toBeInTheDocument();
    });
  });

  it('renders fetched evidence items with metadata badges and relationship counts', async () => {
    render(
      <AuthContext.Provider
        value={{
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          login: vi.fn(),
          logout: vi.fn(),
          demoLogin: vi.fn(),
          clearError: vi.fn(),
        }}
      >
        <EvidenceExplorer />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('Sentinel-2 Multispectral Surface Reflectance Canopy Density Scan'),
      ).toBeInTheDocument();
      expect(screen.getByText('Space Applications Centre')).toBeInTheDocument();
      expect(screen.getByText('🔗 2 Links')).toBeInTheDocument();
      expect(screen.getByText('📎 1 Files')).toBeInTheDocument();
      expect(screen.getByText('Inspect Graph →')).toBeInTheDocument();
    });
  });

  it('renders "+ Register Evidence Item" button for authenticated RESEARCHER persona', async () => {
    render(
      <AuthContext.Provider
        value={{
          user: mockResearcher,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          login: vi.fn(),
          logout: vi.fn(),
          demoLogin: vi.fn(),
          clearError: vi.fn(),
        }}
      >
        <EvidenceExplorer />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /\+ Register Evidence Item/i }),
      ).toBeInTheDocument();
    });
  });

  it('opens registration modal when clicking "+ Register Evidence Item"', async () => {
    render(
      <AuthContext.Provider
        value={{
          user: mockResearcher,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          login: vi.fn(),
          logout: vi.fn(),
          demoLogin: vi.fn(),
          clearError: vi.fn(),
        }}
      >
        <EvidenceExplorer />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      const registerButton = screen.getByRole('button', { name: /\+ Register Evidence Item/i });
      fireEvent.click(registerButton);
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 3, name: /Register New Evidence Resource/i }),
      ).toBeInTheDocument();
      expect(screen.getByText('Evidence Title')).toBeInTheDocument();
    });
  });
});
