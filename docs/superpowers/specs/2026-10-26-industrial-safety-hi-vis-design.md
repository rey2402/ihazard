# Design Spec: Industrial Safety Hi-Vis Theme (Mining K3LH Portal)

- **Date:** 2026-10-26
- **Topic:** Visual Redesign - Mining Industrial Safety Hi-Vis Theme
- **Selected Archetype:** Industrial Safety Hi-Vis (Heavy Equipment & Safety Gear Vernacular)
- **Status:** Proposed

---

## 1. Problem Statement & Aesthetic Objective
The current interface is clean and functional, but lacks strong industry character—appearing like a generic SaaS/developer tool rather than an operational coal mining Safety, Health, and Environment (SHE / K3LH) system.

The objective is to infuse authentic **Coal Mining & Heavy Industry Character** into both the Worker Hazard Reporting Portal and Admin SHE Executive Portal without sacrificing speed, scannability, or the zero-scroll compact layout.

---

## 2. Visual Archetype & Metaphor
- **Inspiration:** Heavy earthmoving machinery (Caterpillar, Komatsu, Liebherr), 3M reflective high-visibility safety vests, physical industrial control panels, and Kepmen ESDM mining safety signage.
- **Atmosphere:** Rugged, reliable, safety-first, authoritative, tactile, and built for harsh site environments.

---

## 3. Design Tokens & Color Architecture

### 3.1 Substrate & Surfaces
- **App Canvas Substrate:** `#EEF2F6` (Industrial Light Concrete / High-visibility matte slate). Provides high contrast against dust and outdoor glare.
- **Card / Surface Container:** `#FFFFFF` with structural border `1px solid #CBD5E1` and micro-radius (`rounded-lg`).
- **Dark Elements / Accents:** `#181A1F` (Charcoal Carbon / Coal Pit Graphite).

### 3.2 Safety Accent System
- **Primary Brand / Hi-Vis Amber:** `#F59E0B` (Amber 500) & `#D97706` (Amber 600) — Represents mining warning signals, safety helmets, and equipment livery.
- **Hazard Critical Red:** `#EF4444` (Red 500) & `#DC2626` (Red 600) — Used strictly for Tindakan Tidak Aman (TTA), Risiko Kritis/Tinggi, and LTI incidents.
- **Field Safety Green:** `#10B981` (Emerald 500) — Used for Safe Manhours, Completed Reports, and Zero-Incident status.
- **Industrial Accent Yellow:** `#FACC15` (Yellow 400) — Reflective accents, caution borders, and active tab highlights.

### 3.3 Subtle Hazard Striping (Signature Element)
- A 3px-4px diagonal caution stripe pattern (`repeating-linear-gradient(45deg, #F59E0B, #F59E0B 10px, #181A1F 10px, #181A1F 20px)`) applied tastefully to:
  - Top edge of the main app header or active portal banner.
  - Urgent/Critical hazard ticket indicators.

---

## 4. Typography & Symbology

### 4.1 Typographic Hierarchy
- **Header & Structural Titles:** Heavy Sans-Serif (`Inter`, `font-extrabold` / `font-black`, `uppercase`, `tracking-tight`).
- **Telemetry & Identity Metadata:** Monospace (`font-mono`, `text-xs`, uppercase) for Ticket IDs (`HZD-2026-001`), NIK, GPS/Lokasi Pit, and KPI metrics.
- **Body & Labels:** Crisp Sans-Serif (`Inter`, `font-semibold` for labels, `font-normal` for descriptions).

### 4.2 Mining & Safety Symbology
- Technical badges with brackets: `[ PIT TIMUR // FLEET 04 ]`, `[ K3LH-ESDM COMPLIANT ]`.
- Tactile toggle buttons for **KTA (Kondisi Tidak Aman)** vs **TTA (Tindakan Tidak Aman)** with safety-vest-inspired pill styling.
- Risk Matrix 3-tier selector:
  - **Rendah:** Soft Amber/Yellow outline (`border-amber-300 bg-amber-50 text-amber-800`).
  - **Sedang:** Solid Amber warning (`border-amber-500 bg-amber-100 text-amber-900 font-bold`).
  - **Tinggi / Kritis:** Industrial Hazard Red (`border-red-600 bg-red-600 text-white font-black animate-pulse-subtle`).

---

## 5. Component Impact & Layout Preservation

1. **Header & Navigation ([App.tsx](file:///c:/Users/user/Projects/hazard/src/App.tsx)):**
   - Brand logo with mining helmet / safety shield icon and bold title: **SHE PERTAMBANGAN // K3LH OPERASIONAL**.
   - Subtitle: `STANDAR KEPMEN ESDM 1827 K/30/MEM/2018`.
   - Subtle caution stripe accent under the header border.
   - Portal Switcher (Karyawan vs Admin) styled as rugged industrial selector tabs.

2. **Worker Hazard Form ([HazardReportForm.tsx](file:///c:/Users/user/Projects/hazard/src/components/hazard/HazardReportForm.tsx)):**
   - Retains the **2-column compact zero-scroll layout**.
   - Inputs styled with crisp industrial borders, amber focus rings (`focus:ring-2 focus:ring-amber-500 focus:border-amber-500`).
   - Foto bukti dropzone with high-contrast dashed border and industrial camera icon.
   - Primary submit button: Bold Hi-Vis Amber/Charcoal button (`bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black shadow-md uppercase tracking-wider`).

3. **Admin Dashboard ([SHEAdminDashboard.tsx](file:///c:/Users/user/Projects/hazard/src/components/dashboard/SHEAdminDashboard.tsx)):**
   - 4 Metric KPI Cards with rugged industrial badge styling, telemetry mono numbers, and safety status indicators.
   - Quick Action buttons: Hi-Vis Amber primary (`+ LAPOR BARU`), Tactical outline buttons (`EXPORT EXCEL`, `DOWNLOAD PPT MINGGUAN`).
   - Incident Table with high-contrast safety badges and clear severity tagging.

4. **Weekly & Monthly Forms ([WeeklyEntryForm.tsx](file:///c:/Users/user/Projects/hazard/src/components/she/WeeklyEntryForm.tsx) & [MonthlyEntryForm.tsx](file:///c:/Users/user/Projects/hazard/src/components/she/MonthlyEntryForm.tsx)):**
   - Retains the **2-column compact layout**.
   - Automated LTIFR / TRIFR calculator styled as a digital telemetry readout box.
   - Action buttons with clear industrial hierarchy.

---

## 6. Testing & Quality Criteria
- All 16 existing automated tests must pass.
- Zero horizontal layout breakages.
- Maintains fast 400px-450px vertical height on desktop viewports.
- Responsive to mobile field devices (single-column stack).
