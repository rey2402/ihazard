import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WeeklyEntryForm } from '../components/she/WeeklyEntryForm';
import { MonthlyEntryForm } from '../components/she/MonthlyEntryForm';

describe('SHE Weekly & Monthly Entry Forms', () => {
  it('renders weekly input fields for operational metrics', () => {
    render(<WeeklyEntryForm onSaved={vi.fn()} />);
    expect(screen.getByLabelText(/Periode Minggu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tanggal Laporan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kepatuhan P5M/i)).toBeInTheDocument();
  });

  it('automatically calculates week of month and updates month when report date changes', () => {
    render(<WeeklyEntryForm onSaved={vi.fn()} />);

    // Ubah tanggal ke 5 November 2026 (Minggu 1)
    fireEvent.change(screen.getByLabelText(/Tanggal Laporan/i), {
      target: { value: '2026-11-05' },
    });

    const select = screen.getByLabelText(/Periode Minggu/i) as HTMLSelectElement;
    expect(select.value).toBe('1');
    expect(screen.getByText(/November 2026/i)).toBeInTheDocument();
    expect(screen.getByText('Otomatis')).toBeInTheDocument();

    // Ubah tanggal ke 27 Oktober 2026 (Minggu 4)
    fireEvent.change(screen.getByLabelText(/Tanggal Laporan/i), {
      target: { value: '2026-10-27' },
    });
    expect(select.value).toBe('4');
    expect(screen.getByText(/Oktober 2026/i)).toBeInTheDocument();
  });

  it('allows manual override of week dropdown and marks it as Kustom', () => {
    render(<WeeklyEntryForm onSaved={vi.fn()} />);
    const select = screen.getByLabelText(/Periode Minggu/i) as HTMLSelectElement;

    // Ubah pilihan minggu manual ke Minggu 2
    fireEvent.change(select, { target: { value: '2' } });
    expect(select.value).toBe('2');
    expect(screen.getByText('Kustom')).toBeInTheDocument();
  });

  it('renders monthly input fields and calculates LTIFR automatically', () => {
    render(<MonthlyEntryForm onSaved={vi.fn()} />);
    expect(screen.getByLabelText(/Jam Kerja Selamat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Jumlah LTI/i)).toBeInTheDocument();
  });
});
