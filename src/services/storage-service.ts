import { HazardReport } from '../types/hazard';
import { WeeklySHEReport, MonthlySHEReport } from '../types/she-report';

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

export function getAllHazardReports(): HazardReport[] {
  try {
    const raw = localStorage.getItem(HAZARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function updateHazardStatus(id: string, status: HazardReport['status'], picPerbaikan?: string, closedDate?: string): void {
  const current = getAllHazardReports();
  const item = current.find((r) => r.id === id);
  if (item) {
    item.status = status;
    if (picPerbaikan) item.picPerbaikan = picPerbaikan;
    if (closedDate) item.closedDate = closedDate;
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

  const escapeCSV = (str: string | undefined) => `"${(str || '').replace(/"/g, '""')}"`;

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
