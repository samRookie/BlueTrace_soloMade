import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../src/App.js';

describe('Web Application - Landing Page Boot & Render', () => {
  it('renders the SIH26019 title and platform description', () => {
    render(<App />);

    // Verify main brand badge & title
    expect(screen.getByText('SIH26019')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /National Land Governance Research & Policy Innovation Platform/i,
      }),
    ).toBeInTheDocument();

    // Verify Phase 1 status section
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Phase 1 — Shared Contracts Foundation Initialized/i,
      }),
    ).toBeInTheDocument();

    // Verify status description
    expect(
      screen.getByText(
        /The shared domain contract layer, validation schemas, API response envelopes/i,
      ),
    ).toBeInTheDocument();

    // Verify Architecture Version badge
    expect(screen.getByText('v1.0')).toBeInTheDocument();
  });

  it('renders semantic landmarks (header, main, footer)', () => {
    const { container } = render(<App />);

    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
