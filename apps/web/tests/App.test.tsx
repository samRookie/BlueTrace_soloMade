import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../src/App.js';

// Mock global fetch for initial /api/v1/auth/me check
vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({
    json: async () => ({ success: false }),
  }),
);

describe('Web Application - Direct Access Boot & Render', () => {
  it('renders the SIH26019 title and direct access navigation tabs', async () => {
    render(<App />);

    await waitFor(() => {
      // Verify main brand badge & title
      expect(screen.getByText('SIH26019')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /National Land Governance Research & Policy Innovation Platform/i,
        }),
      ).toBeInTheDocument();

      // Verify direct access persona welcome banner
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /Welcome, Admin User/i,
        }),
      ).toBeInTheDocument();

      // Verify direct access tabs
      expect(screen.getByRole('button', { name: /Platform Overview/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Dataset Catalog/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Knowledge & Evidence/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /GIS Explorer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /My Workspaces/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Security Audit Trail/i })).toBeInTheDocument();
    });
  });

  it('renders semantic landmarks (header, main, footer)', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });
  });
});
