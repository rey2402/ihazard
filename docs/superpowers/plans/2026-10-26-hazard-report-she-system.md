# Hazard Report & SHE Weekly/Monthly PPT System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi web portal SHE pertambangan batu bara yang mencakup form pelaporan Hazard Report ramah HP (mobile-friendly) yang tersinkronisasi ke Google Sheets/Excel, form penginputan metrik SHE mingguan dan bulanan, serta engine 1-klik untuk mengunduh slide presentasi PowerPoint (`.pptx`) standar K3 pertambangan.

**Architecture:** Client-side PWA responsif berbasis React/Vite (TypeScript) + Tailwind CSS dengan state management terisolasi, offline storage queue (IndexedDB/localStorage) untuk area tambang minim sinyal, adapter integrasi Google Sheets (Google Sheets API v4 / Apps Script webhook), serta client-side presentation engine menggunakan `pptxgenjs` yang menghasilkan slide PPTX dengan chart shapes dan format visual korporat K3LH.

**Tech Stack:** React 18 / Vite, TypeScript, Tailwind CSS, Lucide React (ikon), PptxGenJS (PowerPoint generation), Vitest + React Testing Library (TDD).

## Global Constraints

- Standar K3LH Pertambangan: Metrik LTIFR & TRIFR menggunakan rumus baku per 1.000.000 jam kerja selamat.
- Output PPT harus berupa file `.pptx` asli yang valid dan dapat dibuka di Microsoft PowerPoint 2016+ dan Google Slides.
- Mobile viewport: Form pelaporan hazard harus nyaman digunakan pada resolusi mobile 360px–420px (kamera langsung + kompresi foto).
- Offline-first: Data laporan hazard tersimpan di cache lokal jika tidak ada koneksi, dengan status indikator sinkronisasi.

---

### Task 1: Scaffolding Proyek & Konfigurasi Lingkungan Testing

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Test: `src/__tests__/smoke.test.ts`

**Interfaces:**
- Produces: Proyek Vite + React + TypeScript + Tailwind CSS siap dijalankan dengan `npm run dev` dan `npm test`.

- [ ] **Step 1: Inisialisasi package.json dan instalasi dependensi**

```json
{
  "name": "hazard-she-mining-system",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "lucide-react": "^0.475.0",
    "pptxgenjs": "^3.12.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@types/node": "^22.13.4",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "jsdom": "^26.0.0",
    "postcss": "^8.5.2",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.7.2",
    "vite": "^6.1.0",
    "vitest": "^3.0.5"
  }
}
```

- [ ] **Step 2: Buat vite.config.ts, tsconfig.json, postcss.config.js, dan tailwind.config.js**

Konfigurasi `vite.config.ts` dengan Vitest environment `jsdom`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

Konfigurasi `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 3: Tulis failing test verifikasi smoke test**

File: `src/__tests__/smoke.test.ts`
```typescript
import { describe, it, expect } from 'vitest';

describe('Smoke Test Environment', () => {
  it('should pass basic assertion', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 4: Jalankan tes untuk memverifikasi runner bekerja**

Run: `npm test`  
Expected: PASS (1 test passed)

- [ ] **Step 5: Buat file dasar index.html, src/index.css, src/App.tsx, dan src/main.tsx**

- [ ] **Step 6: Commit hasil scaffolding**

```bash
git add package.json vite.config.ts tsconfig.json index.html src/
git commit -m "chore: scaffold project structure with React, Vite, Tailwind and Vitest"
```

---

### Task 2: Model Data, Tipe TypeScript, dan Fungsi Kalkulasi K3LH (TDD)

**Files:**
- Create: `src/types/hazard.ts`
- Create: `src/types/she-report.ts`
- Create: `src/utils/k3-calculator.ts`
- Test: `src/__tests__/k3-calculator.test.ts`

**Interfaces:**
- Produces:
  - `HazardReport`: Tipe data tiket bahaya lapangan (KTA/TTA, risiko, lokasi, foto).
  - `WeeklySHEReport`: Tipe data rekapitulasi operasional mingguan.
  - `MonthlySHEReport`: Tipe data indikator keselamatan bulanan.
  - `calculateLTIFR(ltiCount: number, manHours: number): number`
  - `calculateTRIFR(totalRecordable: number, manHours: number): number`
  - `generateTicketId(): string`

- [ ] **Step 1: Tulis failing tests untuk kalkulasi LTIFR, TRIFR, dan generator Tiket ID**

File: `src/__tests__/k3-calculator.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { calculateLTIFR, calculateTRIFR, generateTicketId } from '../utils/k3-calculator';

describe('K3 Mining Calculator', () => {
  it('calculates LTIFR correctly per 1,000,000 safe man hours', () => {
    // 2 LTI cases in 500,000 man hours -> (2 * 1,000,000) / 500,000 = 4.0
    expect(calculateLTIFR(2, 500000)).toBe(4.0);
  });

  it('handles zero man hours safely without division by zero', () => {
    expect(calculateLTIFR(1, 0)).toBe(0);
    expect(calculateTRIFR(1, 0)).toBe(0);
  });

  it('calculates TRIFR correctly', () => {
    // 5 total recordable cases in 1,000,000 man hours -> 5.0
    expect(calculateTRIFR(5, 1000000)).toBe(5.0);
  });

  it('generates ticket ID with prefix HZD and date stamp', () => {
    const id = generateTicketId();
    expect(id).toMatch(/^HZD-\d{8}-[A-Z0-9]{4}$/);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test src/__tests__/k3-calculator.test.ts`  
Expected: FAIL (Cannot find module '../utils/k3-calculator')

- [ ] **Step 3: Implementasikan tipe data dan modul kalkulasi K3**

File: `src/types/hazard.ts`
```typescript
export type RiskLevel = 'Rendah' | 'Sedang' | 'Tinggi';
export type HazardType = 'KTA' | 'TTA';
export type HazardStatus = 'Open' | 'In Progress' | 'Closed';

export type MiningArea = 
  | 'Pit North / Front Loading'
  | 'Pit South / Front Loading'
  | 'Hauling Road'
  | 'Disposal Area'
  | 'ROM Stockpile'
  | 'Workshop / Plant'
  | 'Port / Jetty Pelabuhan'
  | 'Camp / Office Area'
  | 'Fuel Station';

export type HazardCategory =
  | 'Jalan Tambang, Tanggul, & Lereng'
  | 'Kelaikan Unit & Kendaraan Tambang'
  | 'Housekeeping & Kerapian 5S'
  | 'Kepatuhan Alat Pelindung Diri (APD)'
  | 'Tumpahan Oli, BBM, & Lingkungan'
  | 'Blind Spot, Debu, & Rambu Keselamatan'
  | 'Bahaya Kelistrikan & Panas';

export interface HazardReport {
  id: string;
  timestamp: string;
  reporterName: string;
  reporterNik: string;
  department: string;
  area: MiningArea;
  locationDetail: string;
  hazardType: HazardType;
  category: HazardCategory;
  riskLevel: RiskLevel;
  description: string;
  photoUrl: string;
  immediateAction?: string;
  status: HazardStatus;
  picPerbaikan?: string;
  closedDate?: string;
  syncedToSheets: boolean;
}
```

File: `src/types/she-report.ts`
```typescript
export interface WeeklySHEReport {
  id: string;
  periodWeek: string; // e.g. "Minggu 4 - Okt 2026"
  createdDate: string;
  safeManHoursWeek: number;
  toolboxMeetingPercent: number;
  plannedInspectionTarget: number;
  plannedInspectionActual: number;
  fatigueCheckPercent: number;
  incidentsFatality: number;
  incidentsLTI: number;
  incidentsPropertyDamage: number;
  incidentsNearmiss: number;
  waterQualityPH: number;
  topPriorityNotes: string;
  totalHazardsReported: number;
  hazardsClosedPercent: number;
}

export interface MonthlySHEReport {
  id: string;
  periodMonth: string; // e.g. "Oktober 2026"
  safeManHoursMonth: number;
  safeManHoursYTD: number;
  incidentsFatality: number;
  incidentsLTI: number;
  incidentsRestrictedWork: number;
  incidentsMedicalTreatment: number;
  ltifr: number;
  trifr: number;
  hazardResolutionRatePercent: number;
  plannedInspectionRatePercent: number;
  safetyTrainingAttendancePercent: number;
  goldenRulesCompliancePercent: number;
  b3WasteVolumeTons: number;
  reclamationLandHa: number;
  p2k3Notes: string;
}
```

File: `src/utils/k3-calculator.ts`
```typescript
export function calculateLTIFR(ltiCount: number, manHours: number): number {
  if (manHours <= 0) return 0;
  return Number(((ltiCount * 1_000_000) / manHours).toFixed(2));
}

export function calculateTRIFR(totalRecordable: number, manHours: number): number {
  if (manHours <= 0) return 0;
  return Number(((totalRecordable * 1_000_000) / manHours).toFixed(2));
}

export function generateTicketId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HZD-${dateStr}-${randomSuffix}`;
}
```

- [ ] **Step 4: Jalankan tes kembali untuk memastikan lulus**

Run: `npm test src/__tests__/k3-calculator.test.ts`  
Expected: PASS (4 tests passed)

- [ ] **Step 5: Commit kode tipe dan utilitas kalkulator**

```bash
git add src/types/ src/utils/ src/__tests__/
git commit -m "feat: add hazard and SHE data types and K3 rate calculators with unit tests"
```

---

### Task 3: Penyimpanan Lokal & Sinkronisasi Google Sheets / Excel

**Files:**
- Create: `src/services/storage-service.ts`
- Create: `src/services/sheets-sync-service.ts`
- Test: `src/__tests__/storage-service.test.ts`

**Interfaces:**
- Consumes: `HazardReport`, `WeeklySHEReport`, `MonthlySHEReport` dari `src/types/`
- Produces:
  - `saveHazardReport(report: HazardReport): Promise<void>`
  - `getAllHazardReports(): HazardReport[]`
  - `syncHazardToSheets(report: HazardReport, webhookUrl?: string): Promise<boolean>`
  - `exportReportsToCSV(reports: HazardReport[]): string`

- [ ] **Step 1: Tulis failing tests untuk storage service & CSV exporter**

File: `src/__tests__/storage-service.test.ts`
```typescript
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
    expect(csv).toContain('HZD-001,2026-10-26T10:00:00Z,Budi,123,Mining');
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memverifikasi gagal**

Run: `npm test src/__tests__/storage-service.test.ts`  
Expected: FAIL (Cannot find module '../services/storage-service')

- [ ] **Step 3: Implementasikan storage service dan webhook sync Google Sheets**

File: `src/services/storage-service.ts`
```typescript
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

export function saveWeeklyReport(report: WeeklySHEReport): void {
  const current = getAllWeeklyReports();
  current.unshift(report);
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
  current.unshift(report);
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
```

File: `src/services/sheets-sync-service.ts`
```typescript
import { HazardReport } from '../types/hazard';

export async function syncHazardToGoogleSheets(
  report: HazardReport,
  webhookUrl?: string
): Promise<boolean> {
  const targetUrl = webhookUrl || localStorage.getItem('SHE_SHEETS_WEBHOOK_URL');
  if (!targetUrl) {
    // Mode offline / belum konfigurasi webhook: tetap simpan di local dengan flag false
    return false;
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    return response.ok;
  } catch (err) {
    console.warn('Gagal sinkronisasi ke Google Sheets (offline):', err);
    return false;
  }
}
```

- [ ] **Step 4: Jalankan tes untuk memverifikasi lulus**

Run: `npm test src/__tests__/storage-service.test.ts`  
Expected: PASS (2 tests passed)

- [ ] **Step 5: Commit storage & sync service**

```bash
git add src/services/ src/__tests__/
git commit -m "feat: implement local storage and Google Sheets sync service with CSV export"
```

---

### Task 4: Modul 1 – Mobile Web Hazard Report Form (UI & Capture Foto)

**Files:**
- Create: `src/components/hazard/HazardReportForm.tsx`
- Create: `src/components/hazard/HazardSuccessModal.tsx`
- Test: `src/__tests__/hazard-form.test.tsx`

**Interfaces:**
- Consumes: `HazardReport`, `saveHazardReport`, `generateTicketId`
- Produces: Komponen form mobile-friendly dengan tombol kamera, seleksi risiko visual warna (Hijau/Kuning/Merah), dan konfirmasi nomor tiket.

- [ ] **Step 1: Tulis test untuk render form dan validasi input wajib**

File: `src/__tests__/hazard-form.test.tsx`
```typescript
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
    expect(screen.getByText(/Kondisi Tidak Aman \(KTA\)/i)).toBeInTheDocument();
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
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test src/__tests__/hazard-form.test.tsx`  
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implementasikan HazardReportForm dan Modal Sukses**

File: `src/components/hazard/HazardReportForm.tsx`
Mendukung input Nama, NIK, Departemen, Area Dropdown, Tipe KTA/TTA, Kategori Bahaya, visual Risk Level badge selector, input Deskripsi, dan tombol Ambil Foto dengan kompresi HTML5 Canvas `toDataURL('image/jpeg', 0.7)`.

- [ ] **Step 4: Jalankan tes kembali untuk memastikan lulus**

Run: `npm test src/__tests__/hazard-form.test.tsx`  
Expected: PASS (2 tests passed)

- [ ] **Step 5: Commit komponen form hazard**

```bash
git add src/components/hazard/ src/__tests__/
git commit -m "feat: implement mobile-friendly hazard report form with image capture"
```

---

### Task 5: Modul 2 – Form Penginputan SHE Mingguan & Bulanan

**Files:**
- Create: `src/components/she/WeeklyEntryForm.tsx`
- Create: `src/components/she/MonthlyEntryForm.tsx`
- Test: `src/__tests__/she-forms.test.tsx`

**Interfaces:**
- Consumes: `WeeklySHEReport`, `MonthlySHEReport`, `saveWeeklyReport`, `saveMonthlyReport`
- Produces: Dua form penginputan terpisah untuk parameter operasional mingguan dan metrik manajerial bulanan.

- [ ] **Step 1: Tulis test untuk form Weekly dan Monthly entry**

File: `src/__tests__/she-forms.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WeeklyEntryForm } from '../components/she/WeeklyEntryForm';
import { MonthlyEntryForm } from '../components/she/MonthlyEntryForm';

describe('SHE Weekly & Monthly Entry Forms', () => {
  it('renders weekly input fields for operational metrics', () => {
    render(<WeeklyEntryForm onSaved={vi.fn()} />);
    expect(screen.getByLabelText(/Periode Minggu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kepatuhan P5M/i)).toBeInTheDocument();
  });

  it('renders monthly input fields and calculates LTIFR automatically', () => {
    render(<MonthlyEntryForm onSaved={vi.fn()} />);
    expect(screen.getByLabelText(/Jam Kerja Selamat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Jumlah LTI/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memverifikasi gagal**

Run: `npm test src/__tests__/she-forms.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implementasikan WeeklyEntryForm dan MonthlyEntryForm**

File: `src/components/she/WeeklyEntryForm.tsx`: Input P5M %, inspeksi target vs aktual, fatigue check %, insiden breakdown, dan tombol Simpan Log Mingguan.  
File: `src/components/she/MonthlyEntryForm.tsx`: Input Safe Man Hours, LTI, LTIFR calculation display, lingkungan tambang, dan tombol Simpan Log Bulanan.

- [ ] **Step 4: Jalankan tes untuk memastikan lulus**

Run: `npm test src/__tests__/she-forms.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit form SHE mingguan dan bulanan**

```bash
git add src/components/she/ src/__tests__/
git commit -m "feat: implement separate weekly and monthly SHE data entry forms"
```

---

### Task 6: Modul 3 – PowerPoint Generation Engine (Template PPTX Otomatis)

**Files:**
- Create: `src/services/pptx-engine.ts`
- Test: `src/__tests__/pptx-engine.test.ts`

**Interfaces:**
- Consumes: `WeeklySHEReport`, `MonthlySHEReport`, `HazardReport[]`
- Produces:
  - `generateWeeklyPPT(report: WeeklySHEReport, hazards: HazardReport[]): Promise<Blob>`
  - `generateMonthlyPPT(report: MonthlySHEReport, hazards: HazardReport[]): Promise<Blob>`

- [ ] **Step 1: Tulis test untuk PPT Generator Engine**

File: `src/__tests__/pptx-engine.test.ts`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { generateWeeklyPPT, generateMonthlyPPT } from '../services/pptx-engine';
import { WeeklySHEReport, MonthlySHEReport } from '../types/she-report';

describe('PowerPoint Generation Engine', () => {
  const mockWeekly: WeeklySHEReport = {
    id: 'W-01',
    periodWeek: 'Minggu 4 - Okt 2026',
    createdDate: '2026-10-26',
    safeManHoursWeek: 25000,
    toolboxMeetingPercent: 98,
    plannedInspectionTarget: 5,
    plannedInspectionActual: 5,
    fatigueCheckPercent: 96,
    incidentsFatality: 0,
    incidentsLTI: 0,
    incidentsPropertyDamage: 1,
    incidentsNearmiss: 2,
    waterQualityPH: 7.2,
    topPriorityNotes: 'Pengawasan tanggul disposal',
    totalHazardsReported: 12,
    hazardsClosedPercent: 83.3,
  };

  it('generates weekly PPT presentation blob', async () => {
    const blob = await generateWeeklyPPT(mockWeekly, []);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test src/__tests__/pptx-engine.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implementasikan PPT Engine menggunakan `pptxgenjs`**

File: `src/services/pptx-engine.ts`
Mengonfigurasi:
- Warna korporat pertambangan: Navy Dark (`#0A192F`), Safety Orange (`#FF6B00`), Emerald Green (`#10B981`), Danger Red (`#EF4444`).
- Slide Weekly: 6 Slide lengkap dengan cover, scorecard badges, pie chart rasio KTA/TTA, tabel insiden, dan highlight foto before-after.
- Slide Monthly: 10 Slide lengkap dengan milestone jam kerja aman, statistik LTIFR/TRIFR, compliance training, lingkungan, dan rekomendasi P2K3.

- [ ] **Step 4: Jalankan tes kembali untuk memastikan lulus**

Run: `npm test src/__tests__/pptx-engine.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit engine generator PPT**

```bash
git add src/services/pptx-engine.ts src/__tests__/
git commit -m "feat: implement automated weekly and monthly PowerPoint generation engine"
```

---

### Task 7: Dashboard Manajemen SHE & Hub 1-Klik Download PPT

**Files:**
- Create: `src/components/dashboard/SHEAdminDashboard.tsx`
- Modify: `src/App.tsx`
- Test: `src/__tests__/dashboard.test.tsx`

**Interfaces:**
- Consumes: Seluruh komponen (`HazardReportForm`, `WeeklyEntryForm`, `MonthlyEntryForm`, `pptx-engine`, `storage-service`)
- Produces: Antarmuka terpadu portal SHE dengan tab navigasi:
  1. *Lapor Bahaya (Mobile View untuk Karyawan)*
  2. *Dashboard Pengawas (Tabel & Filter Status Open/Closed)*
  3. *Input Laporan Mingguan & Download PPT*
  4. *Input Laporan Bulanan & Download PPT*
  5. *Export Data ke Excel/CSV & Pengaturan Google Sheets*

- [ ] **Step 1: Tulis test interaksi download PPT pada Dashboard**

File: `src/__tests__/dashboard.test.tsx`
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('Main Application Navigation & Dashboard', () => {
  it('renders navigation tabs for hazard report, admin, weekly, and monthly', () => {
    render(<App />);
    expect(screen.getByText(/Lapor Bahaya/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard SHE/i)).toBeInTheDocument();
    expect(screen.getByText(/Laporan Mingguan/i)).toBeInTheDocument();
    expect(screen.getByText(/Laporan Bulanan/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memverifikasi gagal**

Run: `npm test src/__tests__/dashboard.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implementasikan Dashboard dan integrasikan ke src/App.tsx**

Membuat tampilan dashboard profesional standar tambang batu bara dengan kartu KPI, tabel hazard interaktif dengan badge status, filter pencarian, dan tombol 1-Klik download PPT.

- [ ] **Step 4: Jalankan seluruh suite pengujian**

Run: `npm test`  
Expected: ALL PASS

- [ ] **Step 5: Verifikasi build produksi**

Run: `npm run build`  
Expected: Build berhasil tanpa error TypeScript atau bundling.

- [ ] **Step 6: Commit final implementasi dashboard dan integrasi app**

```bash
git add src/
git commit -m "feat: complete SHE management dashboard with integrated 1-click PPT downloads"
```
