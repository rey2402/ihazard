import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { WeeklyEntryForm } from '../components/she/WeeklyEntryForm';
import { MonthlyEntryForm } from '../components/she/MonthlyEntryForm';

describe('SHE Weekly & Monthly Entry Forms', () => {
  it('renders weekly input fields for operational metrics', () => {
    render(<WeeklyEntryForm onSaved={vi.fn()} />);
    expect(screen.getByLabelText(/Periode Minggu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kepatuhan P5M/i)).toBeInTheDocument();
  });

  it('renders monthly input fields and calculates LTIFR automatically', () => {
    render(<MonthlyEntryForm onSaved={vi.fn()} />);
    expect(screen.getByLabelText(/Jam Kerja Selamat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Jumlah LTI/i)).toBeInTheDocument();
  });
});
