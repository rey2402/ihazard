import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('Main Application Navigation & Dashboard', () => {
  it('renders navigation tabs for hazard report, admin, weekly, and monthly', () => {
    render(<App />);
    expect(screen.getAllByText(/Lapor Bahaya/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Dashboard SHE/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Laporan Mingguan/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Laporan Bulanan/i).length).toBeGreaterThan(0);
  });
});
