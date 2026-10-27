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

export const INITIAL_HAZARDS: HazardReport[] = [
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
    description: 'Tanggul pengaman runtuh tergerus air hujan, ketinggian kurang dari 3/4 diameter roda HD785.',
    photoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    immediateAction: 'Pasang safety cone dan batasi akses unit sarana LV.',
    status: 'In Progress',
    picPerbaikan: 'Foreman Pit North',
    syncedToSheets: true,
  },
  {
    id: 'HZD-20261025-A4B2',
    timestamp: '2026-10-25T14:30:00Z',
    reporterName: 'Dedi Kurniawan',
    reporterNik: '201948',
    department: 'Hauling & Transport',
    area: 'Hauling Road',
    locationDetail: 'KM 14 Tikungan Pos 2',
    hazardType: 'TTA',
    category: 'Blind Spot, Debu, & Rambu Keselamatan',
    riskLevel: 'Sedang',
    description: 'Driver hauling mendahului unit dump truck di area tikungan blind spot.',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    immediateAction: 'Peringatan via radio kanal 3 dan coaching di tempat.',
    status: 'Closed',
    picPerbaikan: 'Safety Officer Hauling',
    closedDate: '2026-10-25',
    syncedToSheets: true,
  },
  {
    id: 'HZD-20261024-C7F1',
    timestamp: '2026-10-24T10:00:00Z',
    reporterName: 'Agus Salim',
    reporterNik: '205310',
    department: 'Workshop & Plant',
    area: 'Workshop / Plant',
    locationDetail: 'Bay 3 Service Truk',
    hazardType: 'KTA',
    category: 'Tumpahan Oli, BBM, & Lingkungan',
    riskLevel: 'Sedang',
    description: 'Ceceran oli hidrolik bocor di lantai bay service, berpotensi terpeleset dan mencemari drainase.',
    photoUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    immediateAction: 'Tabur serbuk gergaji/oil spill kit dan pasang pita barikade.',
    status: 'Closed',
    picPerbaikan: 'Mekanik Leader',
    closedDate: '2026-10-24',
    syncedToSheets: true,
  },
  {
    id: 'HZD-20261023-F9E3',
    timestamp: '2026-10-23T16:45:00Z',
    reporterName: 'Hendra Wijaya',
    reporterNik: '203819',
    department: 'Coal Processing / ROM',
    area: 'ROM Stockpile',
    locationDetail: 'Hopper Crusher Primary',
    hazardType: 'KTA',
    category: 'Bahaya Kelistrikan & Panas',
    riskLevel: 'Rendah',
    description: 'Cover panel emergency stop pada conveyor crusher longgar dan kabel sedikit terbuka.',
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    immediateAction: 'Dilaporkan ke tim elektrikal site.',
    status: 'Open',
    picPerbaikan: 'Electrician ROM',
    syncedToSheets: false,
  },
];

export function getAllHazardReports(): HazardReport[] {
  try {
    const raw = localStorage.getItem(HAZARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function seedInitialDataIfEmpty(): void {
  try {
    const raw = localStorage.getItem(HAZARD_KEY);
    if (!raw || JSON.parse(raw).length === 0) {
      localStorage.setItem(HAZARD_KEY, JSON.stringify(INITIAL_HAZARDS));
    }
  } catch {
    localStorage.setItem(HAZARD_KEY, JSON.stringify(INITIAL_HAZARDS));
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
