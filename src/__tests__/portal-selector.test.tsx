import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PortalSelectorPage } from '../components/portal/PortalSelectorPage';

describe('PortalSelectorPage', () => {
  it('renders title, description, and both role cards', () => {
    const handleSelectRole = vi.fn();
    render(<PortalSelectorPage onSelectRole={handleSelectRole} />);

    expect(screen.getByText(/Pilih Portal Masuk/i)).toBeInTheDocument();
    expect(screen.getByText(/Portal Karyawan Lapangan/i)).toBeInTheDocument();
    expect(screen.getByText(/Portal Pengawas & Admin SHE/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingat pilihan di perangkat ini/i)).toBeInTheDocument();
  });

  it('calls onSelectRole with karyawan and remember=true by default', () => {
    const handleSelectRole = vi.fn();
    render(<PortalSelectorPage onSelectRole={handleSelectRole} />);

    const workerBtn = screen.getByRole('button', { name: /Masuk ke Pelaporan Bahaya/i });
    fireEvent.click(workerBtn);

    expect(handleSelectRole).toHaveBeenCalledWith('karyawan', true);
  });

  it('calls onSelectRole with admin and remember=false when checkbox is unticked', () => {
    const handleSelectRole = vi.fn();
    render(<PortalSelectorPage onSelectRole={handleSelectRole} />);

    const checkbox = screen.getByLabelText(/Ingat pilihan di perangkat ini/i);
    fireEvent.click(checkbox); // toggles to false

    const adminBtn = screen.getByRole('button', { name: /Verifikasi Akses Admin/i });
    fireEvent.click(adminBtn);

    expect(handleSelectRole).toHaveBeenCalledWith('admin', false);
  });
});
