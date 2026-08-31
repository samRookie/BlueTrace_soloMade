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

    // Verify foundation phase status section
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Foundation Phase Initialized/i,
      }),
    ).toBeInTheDocument();

    // Verify status description
    expect(
      screen.getByText(
        /Core platform infrastructure and monorepo architecture are being established/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders semantic landmarks (header, main, footer)', () => {
    const { container } = render(<App />);

    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
