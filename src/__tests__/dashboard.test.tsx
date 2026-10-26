import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('Main Application Navigation & Role Separation', () => {
  it('renders worker portal by default with Lapor Bahaya and Status Laporan', () => {
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

  it('opens PIN verification modal when worker requests admin access', () => {
    render(<App initialRole="karyawan" />);
    const adminBtn = screen.getByText(/Masuk Mode Admin/i);
    fireEvent.click(adminBtn);
    expect(screen.getByText(/Verifikasi Akses Admin SHE/i)).toBeInTheDocument();
  });
});
