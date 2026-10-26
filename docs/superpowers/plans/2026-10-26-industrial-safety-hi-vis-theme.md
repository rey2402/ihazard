# Industrial Safety Hi-Vis Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the visual appearance of the Mining SHE Hazard & Executive Portal into an authentic, rugged **Industrial Safety Hi-Vis** aesthetic (Caterpillar/Komatsu heavy equipment & 3M safety gear vernacular) while preserving the zero-scroll 2-column compact form layout and passing all 16 automated tests.

**Architecture:** Update foundational CSS tokens and utilities in `src/index.css`, infuse the primary application frame and header with industrial branding and hazard accents in `src/App.tsx`, and apply high-contrast tactile safety styling to `HazardReportForm.tsx`, `SHEAdminDashboard.tsx`, `WeeklyEntryForm.tsx`, and `MonthlyEntryForm.tsx`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React, Vitest, Testing Library.

## Global Constraints
- App Substrate Canvas: `#EEF2F6` (Industrial Concrete / Hi-Vis Light Slate).
- Primary Hi-Vis Amber: `#F59E0B` (Amber 500) and `#D97706` (Amber 600).
- Hazard Alert Red: `#EF4444` (Red 500) and `#DC2626` (Red 600).
- Safe Field Green: `#10B981` (Emerald 500).
- Caution Stripes: diagonal hazard stripe pattern (`bg-hazard-stripes`).
- Typography: Heavy Industrial Sans for headers (`font-black uppercase tracking-tight`), Monospace for telemetry/IDs/metrics (`font-mono`).
- Form layout MUST remain 2-column compact on desktop (no vertical scroll needed).
- All 16 existing tests must pass throughout.

---

### Task 1: Foundational Industrial Tokens & Hazard Stripe Utility in CSS

**Files:**
- Modify: `src/index.css`
- Test: `src/__tests__/app.test.tsx`

**Interfaces:**
- Produces: CSS utility `.bg-hazard-stripes`, updated `@apply bg-[#EEF2F6] text-zinc-900`, tactile switch classes.

- [x] **Step 1: Check current test status**
Run: `npx vitest run src/__tests__/app.test.tsx`
Expected: PASS

- [x] **Step 2: Update `src/index.css` with Industrial Tokens & Hazard Stripes**
Modify `src/index.css` to define:
- Body background: `#EEF2F6` (Industrial Concrete).
- Utility class `.bg-hazard-stripes`:
  ```css
  .bg-hazard-stripes {
    background-image: repeating-linear-gradient(
      -45deg,
      #f59e0b,
      #f59e0b 8px,
      #181a1f 8px,
      #181a1f 16px
    );
  }
  ```
- Selection highlight and scrollbar colors tuned to Amber/Slate.

- [x] **Step 3: Run tests to verify no regressions**
Run: `npx vitest run src/__tests__/app.test.tsx`
Expected: PASS

- [x] **Step 4: Commit**
```bash
git add src/index.css
git commit -m "style: add industrial safety tokens and hazard stripe pattern"
```

---

### Task 2: Industrial Header, Brand Identity & Portal Selector in `App.tsx`

**Files:**
- Modify: `src/App.tsx`
- Test: `src/__tests__/app.test.tsx`

**Interfaces:**
- Produces: Rugged industrial header with HardHat/Shield icon, Kepmen ESDM mining standard subtitle, subtle hazard stripe accent bar, and high-contrast tactile portal switchers (Karyawan vs Admin).

- [x] **Step 1: Verify current `app.test.tsx` expectations**
Inspect tests in `src/__tests__/app.test.tsx` to ensure labels `Portal Pelaporan Bahaya Karyawan` and `Portal Manajemen K3LH Eksekutif` are matched.

- [x] **Step 2: Implement Industrial Safety Header in `src/App.tsx`**
- Add 3px `.bg-hazard-stripes` accent bar directly underneath the header.
- Header title: **SHE PERTAMBANGAN** with subtitle: `OPERASIONAL K3LH // KEPMEN ESDM 1827 K/30/MEM/2018`.
- Safety badge: `[ PIT OPS // AKTIF ]` in monospace.
- Portal Selector button: Rugged tactile styling with amber active indicators and clear focus rings.

- [x] **Step 3: Run test to verify passes**
Run: `npx vitest run src/__tests__/app.test.tsx`
Expected: PASS

- [x] **Step 4: Commit**
```bash
git add src/App.tsx
git commit -m "feat: implement industrial safety header and brand identity in App"
```

---

### Task 3: Industrial Safety Hi-Vis Styling for `HazardReportForm.tsx`

**Files:**
- Modify: `src/components/hazard/HazardReportForm.tsx`
- Test: `src/__tests__/hazard-form.test.tsx`

**Interfaces:**
- Consumes: Form state, offline storage queue, geolocation.
- Produces: 2-column compact form with rugged industrial tactile switches for KTA vs TTA, 3-tier risk matrix (Amber/Red), industrial dropzone, and heavy Hi-Vis Amber submit button (`KIRIM LAPORAN BAHAYA`).

- [x] **Step 1: Run hazard form tests to ensure baseline**
Run: `npx vitest run src/__tests__/hazard-form.test.tsx`
Expected: PASS

- [x] **Step 2: Apply Industrial Hi-Vis styling to `HazardReportForm.tsx`**
- Card frame: White surface with `border border-slate-300 shadow-sm rounded-lg overflow-hidden`.
- Header strip: subtle `bg-hazard-stripes` top indicator or amber badge: `[ FORMULIR INSIDEN & BAHAYA LAPANGAN ]`.
- KTA vs TTA toggle: Industrial pill switch with bold contrast:
  - Active KTA: `bg-amber-500 text-zinc-950 font-black shadow-sm`.
  - Active TTA: `bg-red-600 text-white font-black shadow-sm`.
- Risk Level buttons:
  - Rendah: `border-amber-300 bg-amber-50 text-amber-900`.
  - Sedang: `border-amber-500 bg-amber-500 text-zinc-950 font-black`.
  - Tinggi/Kritis: `border-red-600 bg-red-600 text-white font-black`.
- Photo upload area: Industrial dashed border with camera icon and high-contrast instruction text.
- Submit button: `bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm uppercase tracking-wider py-2.5 shadow-md flex items-center justify-center gap-2`.

- [x] **Step 3: Run test to verify passes**
Run: `npx vitest run src/__tests__/hazard-form.test.tsx`
Expected: PASS

- [x] **Step 4: Commit**
```bash
git add src/components/hazard/HazardReportForm.tsx
git commit -m "style: apply industrial safety hi-vis styling to hazard report form"
```

---

### Task 4: Rugged Telemetry & High-Contrast Styling for `SHEAdminDashboard.tsx`

**Files:**
- Modify: `src/components/dashboard/SHEAdminDashboard.tsx`
- Test: `src/__tests__/dashboard.test.tsx`

**Interfaces:**
- Produces: 4 KPI metric cards styled with telemetry monospace readouts and status badges, Hi-Vis Amber primary action button (`+ LAPOR BARU (HP)`), tactical outline export buttons, and high-visibility incident table with hazard severity badges.

- [x] **Step 1: Run dashboard tests to verify baseline**
Run: `npx vitest run src/__tests__/dashboard.test.tsx`
Expected: PASS

- [x] **Step 2: Update `SHEAdminDashboard.tsx` with Industrial Telemetry Styling**
- Metric cards: Clean white background with slate border, top accent bar (Amber for Open, Green for Closed, Red for Critical), and large monospace numbers (`font-mono font-black text-2xl`).
- Action toolbar: Bold Hi-Vis Amber CTA button (`+ Lapor Baru (HP)`), tactical border buttons for Excel/PPT export.
- Table: Header in heavy industrial sans uppercase (`text-[10px] font-black tracking-wider text-slate-500 uppercase bg-slate-100/80`), rows with monospace Ticket ID, crisp status badges with dot indicators.

- [x] **Step 3: Run test to verify passes**
Run: `npx vitest run src/__tests__/dashboard.test.tsx`
Expected: PASS

- [x] **Step 4: Commit**
```bash
git add src/components/dashboard/SHEAdminDashboard.tsx
git commit -m "style: apply industrial telemetry styling to admin dashboard"
```

---

### Task 5: Industrial Hi-Vis Alignment for `WeeklyEntryForm.tsx` & `MonthlyEntryForm.tsx`

**Files:**
- Modify: `src/components/she/WeeklyEntryForm.tsx`
- Modify: `src/components/she/MonthlyEntryForm.tsx`
- Test: `src/__tests__/weekly-form.test.tsx`
- Test: `src/__tests__/monthly-form.test.tsx`

**Interfaces:**
- Produces: 2-column compact layout with industrial section badges, digital telemetry box for LTIFR / TRIFR calculator, and Amber/Slate action buttons (`Simpan Log`, `Download PPT`).

- [x] **Step 1: Run weekly and monthly tests to verify baseline**
Run: `npx vitest run src/__tests__/weekly-form.test.tsx src/__tests__/monthly-form.test.tsx`
Expected: PASS

- [x] **Step 2: Update `WeeklyEntryForm.tsx` & `MonthlyEntryForm.tsx` styling**
- Section subheaders: styled with industrial brackets `[ 01. INFORMASI OPERASIONAL ]` and `[ 02. STATISTIK K3LH ]`.
- LTIFR / TRIFR auto-calculation box: styled as a digital telemetry panel with monospace readouts and ESDM compliance tag.
- Primary buttons: Hi-Vis Amber (`bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black uppercase text-xs`).

- [x] **Step 3: Run all tests to verify passes**
Run: `npm test`
Expected: All 16 tests PASS

- [x] **Step 4: Commit**
```bash
git add src/components/she/WeeklyEntryForm.tsx src/components/she/MonthlyEntryForm.tsx
git commit -m "style: align weekly and monthly SHE forms with industrial hi-vis theme"
```

---

### Task 6: Visual Verification & End-to-End Build Check

**Files:**
- Browser / Dev Server
- Production bundle: `npm run build`

- [x] **Step 1: Run production build**
Run: `npm run build`
Expected: Build succeeds with exit code 0.

- [x] **Step 2: Capture visual verification screenshots**
Use browser tool to capture screenshots of Worker Portal and Admin Dashboard.

- [x] **Step 3: Final commit & summary**
```bash
git status
```
