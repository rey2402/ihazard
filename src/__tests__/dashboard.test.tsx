import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('Main Application Navigation & Role Separation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders welcome portal by default when no initialRole is provided', () => {
    render(<App />);
    expect(screen.getByText(/Pilih Portal Masuk/i)).toBeInTheDocument();
    expect(screen.getByText(/Portal Karyawan Lapangan/i)).toBeInTheDocument();
    expect(screen.getByText(/Portal Pengawas & Admin SHE/i)).toBeInTheDocument();
  });

  it('allows worker selection from welcome portal and navigates to report form', () => {
    render(<App />);
    const workerBtn = screen.getByRole('button', { name: /Masuk ke Pelaporan Bahaya/i });
    fireEvent.click(workerBtn);

    expect(screen.getAllByText(/Lapor Bahaya/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ganti Portal/i).length).toBeGreaterThan(0);
  });

  it('allows returning to portal selector via Ganti Portal button', () => {
    render(<App initialRole="karyawan" />);
    const switchBtn = screen.getByRole('button', { name: /Ganti Portal/i });
    fireEvent.click(switchBtn);

    expect(screen.getByText(/Portal Karyawan Lapangan/i)).toBeInTheDocument();
    expect(screen.getByText(/Portal Pengawas & Admin SHE/i)).toBeInTheDocument();
  });

  it('renders worker portal directly when initialRole="karyawan"', () => {
    render(<App initialRole="karyawan" />);
    expect(screen.getAllByText(/Lapor Bahaya/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Status Laporan/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Masuk Mode Admin/i).length).toBeGreaterThan(0);
  });

  it('renders admin portal with Dashboard SHE, Laporan Mingguan, and Laporan Bulanan', () => {
    render(<App initialRole="admin" />);
    expect(screen.getAllByText(/Dashboard SHE/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Laporan Mingguan/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Laporan Bulanan/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lihat Tampilan Karyawan/i).length).toBeGreaterThan(0);
  });

  it('navigates to PIN verification screen when worker requests admin access', () => {
    render(<App initialRole="karyawan" />);
    const adminBtn = screen.getByText(/Masuk Mode Admin/i);
    fireEvent.click(adminBtn);
    expect(screen.getByText(/Verifikasi Akses Admin SHE/i)).toBeInTheDocument();
  });
});
