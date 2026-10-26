import { describe, it, expect, beforeEach } from 'vitest';
import { saveHazardReport, getAllHazardReports, exportReportsToCSV } from '../services/storage-service';
import { HazardReport } from '../types/hazard';

describe('Storage & Export Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and retrieves hazard reports from local storage', () => {
    const mockReport: HazardReport = {
      id: 'HZD-20261026-0001',
      timestamp: '2026-10-26T10:00:00Z',
      reporterName: 'Budi Santoso',
      reporterNik: '20491',
      department: 'Mining Operation',
      area: 'Hauling Road',
      locationDetail: 'KM 14 Pos 2',
      hazardType: 'KTA',
      category: 'Jalan Tambang, Tanggul, & Lereng',
      riskLevel: 'Tinggi',
      description: 'Tanggul retak',
      photoUrl: 'data:image/png;base64,sample',
      status: 'Open',
      syncedToSheets: false,
    };

    saveHazardReport(mockReport);
    const all = getAllHazardReports();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('HZD-20261026-0001');
  });

  it('converts reports to valid CSV matching Google Sheet columns', () => {
    const mockReport: HazardReport = {
      id: 'HZD-001',
      timestamp: '2026-10-26T10:00:00Z',
      reporterName: 'Budi',
      reporterNik: '123',
      department: 'Mining',
      area: 'Hauling Road',
      locationDetail: 'KM 14',
      hazardType: 'KTA',
      category: 'Jalan Tambang, Tanggul, & Lereng',
      riskLevel: 'Tinggi',
      description: 'Tanggul retak',
      photoUrl: 'http://example.com/photo.jpg',
      status: 'Open',
      syncedToSheets: true,
    };

    const csv = exportReportsToCSV([mockReport]);
    expect(csv).toContain('Tiket_ID,Timestamp,Nama_Pelapor,NIK,Departemen');
    expect(csv).toContain('HZD-001,2026-10-26T10:00:00Z,"Budi",123,"Mining"');
  });
});
