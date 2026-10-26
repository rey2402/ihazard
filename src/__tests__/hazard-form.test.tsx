import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { HazardReportForm } from '../components/hazard/HazardReportForm';

describe('HazardReportForm Component', () => {
  it('renders form inputs for mining workers', () => {
    render(<HazardReportForm onSubmitSuccess={vi.fn()} />);
    expect(screen.getByLabelText(/Nama Pelapor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/NIK/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Area Lokasi/i)).toBeInTheDocument();
    expect(screen.getByText(/Kondisi Tidak Aman/i)).toBeInTheDocument();
  });

  it('validates required fields before submitting', () => {
    const handleSubmit = vi.fn();
    render(<HazardReportForm onSubmitSuccess={handleSubmit} />);
    
    const submitBtn = screen.getByRole('button', { name: /Kirim Laporan Bahaya/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/Nama pelapor wajib diisi/i)).toBeInTheDocument();
  });
});
