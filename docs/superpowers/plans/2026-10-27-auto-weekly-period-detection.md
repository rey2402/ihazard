# Auto Weekly Period Detection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengotomatiskan pemilihan periode minggu pada formulir Laporan Keselamatan Mingguan (`WeeklyEntryForm.tsx`) dengan mendeteksi minggu ke berapa dan bulan secara otomatis berdasarkan tanggal laporan yang dipilih, sambil tetap memberikan fleksibilitas pilihan manual via dropdown.

**Architecture:** Membangun helper kalkulasi tanggal di `src/utils/date-utils.ts`, mengintegrasikan pemilih minggu pintar di `src/components/she/WeeklyEntryForm.tsx`, dan memvalidasi kompatibilitas format penyimpanan dengan test suite.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vitest.

## Global Constraints
- Bahasa UI: Bahasa Indonesia profesional standar K3LH / SHE pertambangan.
- Format Output: Tetap `Minggu X - Bulan Tahun` (contoh: `Minggu 4 - Oktober 2026`).
- Kompatibilitas: Generator presentasi mingguan (`pptx-engine.ts`) dan database Google Sheets tetap menerima data tanpa perubahan schema.
- Kerapian kode: Seluruh test Vitest wajib lolos 100% dan build produksi `tsc && vite build` bersih.

---

### Task 1: Create Date Calculation Utility and Unit Tests

**Files:**
- Create: `src/utils/date-utils.ts`
- Create: `src/__tests__/date-utils.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export const INDONESIAN_MONTHS: string[];
  export function getWeekOfMonth(date: Date): number;
  export function formatWeeklyPeriod(weekNumber: number, date: Date): string;
  ```

- [x] **Step 1: Write failing unit test for `date-utils`**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement `src/utils/date-utils.ts`**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Commit Task 1**

---

### Task 2: Integrate Smart Period Picker into WeeklyEntryForm

**Files:**
- Modify: `src/components/she/WeeklyEntryForm.tsx`
- Modify: `src/__tests__/she-forms.test.tsx`

**Interfaces:**
- Consumes:
  ```typescript
  import { getWeekOfMonth, formatWeeklyPeriod, INDONESIAN_MONTHS } from '../../utils/date-utils';
  ```
- Ensures:
  - Mengubah tanggal laporan otomatis memperbarui `periodWeek` dan dropdown `selectedWeek`.
  - Memilih dropdown `selectedWeek` memperbarui `periodWeek` dengan bulan/tahun tanggal aktif.
  - Tampilan visual dropdown rapi, intuitif, dan responsif di mobile.

- [x] **Step 1: Update `WeeklyEntryForm.tsx` with smart dropdown and auto-sync**
- [x] **Step 2: Update `she-forms.test.tsx` to assert auto-detection on date change**
- [x] **Step 3: Run Vitest suites to verify all tests pass**
- [x] **Step 4: Commit Task 2**

---

### Task 3: Build Verification, Browser Subagent Verification & Deployment

- [x] **Step 1: Run production build `npm run build`**
- [x] **Step 2: Browser subagent verification of Laporan Mingguan date sync**
- [x] **Step 3: Push to origin main and verify deployment**
