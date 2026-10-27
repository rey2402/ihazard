import { HazardReport } from '../types/hazard';
import { WeeklySHEReport, MonthlySHEReport } from '../types/she-report';
import { sanitizeFormula } from '../utils/security';

const HAZARD_KEY = 'SHE_HAZARD_REPORTS';
const WEEKLY_KEY = 'SHE_WEEKLY_REPORTS';
const MONTHLY_KEY = 'SHE_MONTHLY_REPORTS';

export function saveHazardReport(report: HazardReport): void {
  const current = getAllHazardReports();
  const index = current.findIndex((r) => r.id === report.id);
  if (index >= 0) {
    current[index] = report;
  } else {
    current.unshift(report);
  }
  localStorage.setItem(HAZARD_KEY, JSON.stringify(current));
}

export const INITIAL_HAZARDS: HazardReport[] = [];

export function getAllHazardReports(): HazardReport[] {
  try {
    const raw = localStorage.getItem(HAZARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setAllHazardReports(reports: HazardReport[]): void {
  try {
    localStorage.setItem(HAZARD_KEY, JSON.stringify(reports));
  } catch (err) {
    console.warn('Gagal menyimpan laporan ke localStorage:', err);
  }
}

export function seedInitialDataIfEmpty(): void {
  try {
    const raw = localStorage.getItem(HAZARD_KEY);
    if (raw) {
      // Otomatis bersihkan data dummy lama jika ada di browser
      const dummyIds = [
        'HZD-20261026-X89A',
        'HZD-20261025-A4B2',
        'HZD-20261024-C7F1',
        'HZD-20261023-F9E3',
        'HZD-20261027-VCJC',
      ];
      let list: HazardReport[] = JSON.parse(raw);
      list = list.filter((item) => !dummyIds.includes(item.id) && item.description !== 'Laporan uji tanpa foto');

      // Bersihkan jika ada laporan yang tersimpan dengan foto bawaan/dummy unsplash
      let modified = false;
      list = list.map((item) => {
        if (item.photoUrl && item.photoUrl.includes('images.unsplash.com')) {
          modified = true;
          return { ...item, photoUrl: '' };
        }
        return item;
      });

      localStorage.setItem(HAZARD_KEY, JSON.stringify(list));
    }
  } catch {
    // Abaikan error localStorage
  }
}

export function updateHazardPhoto(id: string, photoUrl: string): HazardReport | null {
  const current = getAllHazardReports();
  const index = current.findIndex((r) => r.id === id);
  if (index >= 0) {
    current[index] = {
      ...current[index],
      photoUrl,
    };
    localStorage.setItem(HAZARD_KEY, JSON.stringify(current));
    return current[index];
  }
  return null;
}

export function clearAllHazardReports(): void {
  localStorage.removeItem(HAZARD_KEY);
}

export interface HazardClosureData {
  picPerbaikan?: string;
  closedDate?: string;
  closurePhotoUrl?: string;
  closureNotes?: string;
  closedBy?: string;
}

export function updateHazardStatus(
  id: string,
  status: HazardReport['status'],
  picPerbaikanOrClosure?: string | HazardClosureData,
  closedDate?: string
): void {
  const current = getAllHazardReports();
  const item = current.find((r) => r.id === id);
  if (item) {
    item.status = status;
    if (typeof picPerbaikanOrClosure === 'object') {
      if (picPerbaikanOrClosure.picPerbaikan) item.picPerbaikan = picPerbaikanOrClosure.picPerbaikan;
      if (picPerbaikanOrClosure.closedDate) item.closedDate = picPerbaikanOrClosure.closedDate;
      if (picPerbaikanOrClosure.closurePhotoUrl) item.closurePhotoUrl = picPerbaikanOrClosure.closurePhotoUrl;
      if (picPerbaikanOrClosure.closureNotes) item.closureNotes = picPerbaikanOrClosure.closureNotes;
      if (picPerbaikanOrClosure.closedBy) item.closedBy = picPerbaikanOrClosure.closedBy;
    } else {
      if (picPerbaikanOrClosure) item.picPerbaikan = picPerbaikanOrClosure;
      if (closedDate) item.closedDate = closedDate;
    }
    localStorage.setItem(HAZARD_KEY, JSON.stringify(current));
  }
}

export function saveWeeklyReport(report: WeeklySHEReport): void {
  const current = getAllWeeklyReports();
  const index = current.findIndex((r) => r.id === report.id);
  if (index >= 0) {
    current[index] = report;
  } else {
    current.unshift(report);
  }
  localStorage.setItem(WEEKLY_KEY, JSON.stringify(current));
}

export function getAllWeeklyReports(): WeeklySHEReport[] {
  try {
    const raw = localStorage.getItem(WEEKLY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMonthlyReport(report: MonthlySHEReport): void {
  const current = getAllMonthlyReports();
  const index = current.findIndex((r) => r.id === report.id);
  if (index >= 0) {
    current[index] = report;
  } else {
    current.unshift(report);
  }
  localStorage.setItem(MONTHLY_KEY, JSON.stringify(current));
}

export function getAllMonthlyReports(): MonthlySHEReport[] {
  try {
    const raw = localStorage.getItem(MONTHLY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function exportReportsToCSV(reports: HazardReport[]): string {
  const headers = [
    'Tiket_ID',
    'Timestamp',
    'Nama_Pelapor',
    'NIK',
    'Departemen',
    'Area_Site',
    'Detail_Lokasi',
    'Tipe_Bahaya',
    'Kategori_K3',
    'Tingkat_Risiko',
    'Deskripsi',
    'URL_Foto',
    'Tindakan_Langsung',
    'Status',
    'PIC_Perbaikan',
  ];

  const escapeCSV = (str: string | undefined) => `"${sanitizeFormula(str || '').replace(/"/g, '""')}"`;

  const rows = reports.map((r) => [
    r.id,
    r.timestamp,
    escapeCSV(r.reporterName),
    r.reporterNik,
    escapeCSV(r.department),
    escapeCSV(r.area),
    escapeCSV(r.locationDetail),
    r.hazardType,
    escapeCSV(r.category),
    r.riskLevel,
    escapeCSV(r.description),
    escapeCSV(r.photoUrl),
    escapeCSV(r.immediateAction),
    r.status,
    escapeCSV(r.picPerbaikan),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
