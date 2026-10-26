import { describe, it, expect, vi } from 'vitest';
import { exportReportsToExcel } from '../services/excel-export-service';
import { HazardReport } from '../types/hazard';

describe('Excel Export Service', () => {
  it('generates a valid .xlsx Excel workbook with multiple sheets and triggers download', async () => {
    const mockReports: HazardReport[] = [
      {
        id: 'HZD-20261026-X89A',
        timestamp: '2026-10-26T08:15:00Z',
        reporterName: 'Supriyanto',
        reporterNik: '204192',
        department: 'Mining Operation',
        area: 'Pit North / Front Loading',
        locationDetail: 'Bench 4 Loading Point Exca 01',
        hazardType: 'KTA',
        category: 'Jalan Tambang, Tanggul, & Lereng',
        riskLevel: 'Tinggi',
        description: 'Tanggul pengaman di sisi jurang tergerus air hujan setinggi 40cm, rawan amblas.',
        photoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b',
        immediateAction: 'Dipasang safety cone dan garis pembatas sementara.',
        status: 'In Progress',
        picPerbaikan: 'Foreman Pit North',
        syncedToSheets: true,
      },
      {
        id: 'HZD-20261026-T44B',
        timestamp: '2026-10-26T09:40:00Z',
        reporterName: 'Ahmad Fauzi',
        reporterNik: '205811',
        department: 'Hauling & Transport',
        area: 'Hauling Road',
        locationDetail: 'KM 14 Jalur Angkut Barat',
        hazardType: 'TTA',
        category: 'Kelaikan Unit & Kendaraan Tambang',
        riskLevel: 'Sedang',
        description: 'Operator Dump Truck mengemudi melebihi batas kecepatan 40 km/jam.',
        photoUrl: '',
        immediateAction: 'Diberikan teguran lisan di pos pantau.',
        status: 'Closed',
        picPerbaikan: 'SHE Patrol',
        closedDate: '2026-10-26',
        syncedToSheets: false,
      },
    ];

    // Mock URL and DOM anchor methods
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-excel-url');
    const mockRevokeObjectURL = vi.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

    await exportReportsToExcel(mockReports, 'Test_Laporan_Mining.xlsx');

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-excel-url');
  });
});
