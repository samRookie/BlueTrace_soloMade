import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../src/App.js';

// Mock global fetch for initial /api/v1/auth/me check
vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({
    json: async () => ({ success: false }),
  }),
);

describe('Web Application - Boot & Render', () => {
  it('renders the SIH26019 title and Phase 4 authentication interface', () => {
    render(<App />);

    // Verify main brand badge & title
    expect(screen.getByText('SIH26019')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /National Land Governance Research & Policy Innovation Platform/i,
      }),
    ).toBeInTheDocument();

    // Verify Phase 4 status card
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Phase 4 — Authentication, RBAC & Security Baseline/i,
      }),
    ).toBeInTheDocument();

    // Verify Sign In form is presented when unauthenticated
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Platform Sign In/i,
      }),
    ).toBeInTheDocument();

    // Verify Demo Persona Selector is rendered
    expect(screen.getByText(/Development Demo Persona Quick-Selector/i)).toBeInTheDocument();
  });

  it('renders semantic landmarks (header, main, footer)', () => {
    const { container } = render(<App />);

    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
