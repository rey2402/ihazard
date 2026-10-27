# Welcome Portal & Role Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan layar penyambutan dan pemilihan peran (Welcome Portal & Role Selection) di awal aplikasi iHazard dengan opsi penyimpanan preferensi otomatis (*Ingat pilihan di perangkat ini*) serta tombol beralih peran kapan saja.

**Architecture:** Membangun komponen mandiri `PortalSelectorPage.tsx`, mengintegrasikannya ke state mesin `App.tsx` dengan dukungan `localStorage` (`ihazard_preferred_portal`), dan menambahkan navigasi "Ganti Portal" pada header portal karyawan dan admin.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React, Vitest, React Testing Library.

## Global Constraints
- Bahasa UI: Bahasa Indonesia profesional standar industri pertambangan (K3LH / SHE).
- Mobile-first responsif: Wajib tertata rapi pada viewport HP (375px - 414px) maupun desktop.
- Keamanan: Portal Admin tetap dilindungi autentikasi PIN 4 digit; pemilihan peran admin tidak pernah membypass verifikasi PIN.
- Kerapian kode: TypeScript strict mode tanpa error type, seluruh test Vitest (17+ test) wajib terus lolos tanpa warning unhandled timers.

---

### Task 1: Create `PortalSelectorPage` Component and Unit Tests

**Files:**
- Create: `src/components/portal/PortalSelectorPage.tsx`
- Create: `src/__tests__/portal-selector.test.tsx`

**Interfaces:**
- Produces:
  ```typescript
  export interface PortalSelectorPageProps {
    onSelectRole: (role: 'karyawan' | 'admin', rememberPreference: boolean) => void;
  }
  ```

- [ ] **Step 1: Write the failing unit tests for `PortalSelectorPage`**

Create `src/__tests__/portal-selector.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PortalSelectorPage } from '../components/portal/PortalSelectorPage';

describe('PortalSelectorPage', () => {
  it('renders title, description, and both role cards', () => {
    const handleSelectRole = vi.fn();
    render(<PortalSelectorPage onSelectRole={handleSelectRole} />);

    expect(screen.getByText(/Sistem Manajemen Keselamatan Kerja Tambang/i)).toBeInTheDocument();
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/portal-selector.test.tsx`
Expected: FAIL with "Cannot find module '../components/portal/PortalSelectorPage'"

- [ ] **Step 3: Implement `PortalSelectorPage.tsx`**

Create `src/components/portal/PortalSelectorPage.tsx`:
```tsx
import React, { useState } from 'react';
import { HardHat, ShieldCheck, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface PortalSelectorPageProps {
  onSelectRole: (role: 'karyawan' | 'admin', rememberPreference: boolean) => void;
}

export const PortalSelectorPage: React.FC<PortalSelectorPageProps> = ({ onSelectRole }) => {
  const [rememberPreference, setRememberPreference] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Branding */}
      <div className="max-w-4xl w-full mx-auto pt-4 sm:pt-8 text-center">
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide uppercase mb-4">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Mining Safety & Hazard Portal</span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xl sm:text-2xl shadow-lg shadow-amber-500/20">
            iH
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            iHazard<span className="text-amber-500">.</span>
          </h1>
        </div>

        <h2 className="text-base sm:text-xl font-bold text-slate-200 max-w-xl mx-auto leading-snug">
          Sistem Manajemen Keselamatan Kerja Tambang
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          Pilih portal akses sesuai tugas dan wewenang operasional Anda di site tambang.
        </p>
      </div>

      {/* Main Selection Cards */}
      <div className="max-w-4xl w-full mx-auto my-6 sm:my-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1: Worker / Karyawan */}
        <div className="relative group bg-slate-900/90 border-2 border-slate-800 hover:border-amber-500/80 rounded-2xl p-5 sm:p-7 transition-all duration-200 flex flex-col justify-between shadow-xl shadow-black/40 hover:shadow-amber-500/10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <HardHat className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                Akses Langsung
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
              Portal Karyawan Lapangan
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Kirim temuan kondisi atau tindakan tidak aman, unggah foto bukti lapangan, dan pantau tindak lanjut penanganan bahaya.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Pelaporan instan tanpa ribet password</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Pantau status tiket laporan & PIC penanganan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Lampirkan foto bukti temuan lapangan</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800">
            <button
              onClick={() => onSelectRole('karyawan', rememberPreference)}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <span>Masuk ke Pelaporan Bahaya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 2: Admin / Pengawas SHE */}
        <div className="relative group bg-slate-900/90 border-2 border-slate-800 hover:border-amber-500/80 rounded-2xl p-5 sm:p-7 transition-all duration-200 flex flex-col justify-between shadow-xl shadow-black/40 hover:shadow-amber-500/10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
                Terproteksi PIN
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
              Portal Pengawas & Admin SHE
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Khusus Pengawas K3LH, Safety Officer, & Manajemen Tambang untuk validasi temuan, penugasan PIC, serta monitoring KPI keselamatan.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Verifikasi foto Before & After perbaikan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Ekspor laporan inspeksi & matriks risiko</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Monitoring status penanganan & statistik K3</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800">
            <button
              onClick={() => onSelectRole('admin', rememberPreference)}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-amber-400 border border-amber-500/40 hover:border-amber-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <span>Verifikasi Akses Admin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Preference Footer */}
      <div className="max-w-md w-full mx-auto text-center pb-4">
        <label
          htmlFor="remember-pref"
          className="inline-flex items-center gap-2.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer select-none"
        >
          <input
            id="remember-pref"
            type="checkbox"
            checked={rememberPreference}
            onChange={(e) => setRememberPreference(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 bg-slate-800 cursor-pointer"
          />
          <span>Ingat pilihan di perangkat ini (bisa diganti kapan saja)</span>
        </label>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/portal-selector.test.tsx`
Expected: PASS (all 3 tests passing)

- [ ] **Step 5: Commit**

Run:
```bash
git add src/components/portal/PortalSelectorPage.tsx src/__tests__/portal-selector.test.tsx ; git commit -m "feat: add PortalSelectorPage component with unit tests"
```

---

### Task 2: Integrate `PortalSelectorPage` and "Ganti Portal" into `App.tsx`

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/__tests__/dashboard.test.tsx`

**Interfaces:**
- Consumes: `PortalSelectorPage` from `src/components/portal/PortalSelectorPage`
- Uses `localStorage` key: `'ihazard_preferred_portal'`

- [ ] **Step 1: Update `App.tsx` State & LocalStorage Lifecycle**

In `src/App.tsx`:
1. Import `PortalSelectorPage` from `./components/portal/PortalSelectorPage`.
2. Introduce state:
   ```typescript
   const [currentScreen, setCurrentScreen] = useState<'selector' | 'karyawan' | 'admin-login' | 'admin-dashboard'>(() => {
     if (typeof window !== 'undefined') {
       const saved = localStorage.getItem('ihazard_preferred_portal');
       if (saved === 'karyawan') return 'karyawan';
       if (saved === 'admin') return 'admin-login';
     }
     return 'selector';
   });
   ```
3. Implement `handleSelectRole(role: 'karyawan' | 'admin', remember: boolean)`:
   - If `remember`, `localStorage.setItem('ihazard_preferred_portal', role)`.
   - If not, `localStorage.removeItem('ihazard_preferred_portal')`.
   - If `role === 'karyawan'`, set `currentScreen('karyawan')` and `setRole('karyawan')`.
   - If `role === 'admin'`, set `currentScreen('admin-login')`.
4. Implement `handleSwitchPortal()`:
   - Sets `currentScreen('selector')`.
   - Optionally clears or retains preference based on user choice.
5. In the employee header and mobile bottom nav, replace or augment the switch button to include **"Ganti Portal"** or an easy way to return to `PortalSelectorPage`.
6. In `SHEAdminDashboard` header or mobile header, add a **"Ganti Portal"** option.

- [ ] **Step 2: Run all vitest suites**

Run: `npx vitest run`
Expected: PASS (all tests pass, 0 regressions)

- [ ] **Step 3: Test production build**

Run: `npm run build`
Expected: `tsc && vite build` succeeds with 0 errors.

- [ ] **Step 4: Commit**

Run:
```bash
git add src/App.tsx src/__tests__/dashboard.test.tsx ; git commit -m "feat: integrate welcome portal role selection with localStorage preference"
```

---

### Task 3: Visual & Interactive Browser Verification

**Files:**
- Visual test across mobile (390x844) and desktop viewports via `browser_subagent`.

- [ ] **Step 1: Clear preference or open browser to test Selector**
- [ ] **Step 2: Verify both cards render cleanly on mobile viewport**
- [ ] **Step 3: Test clicking "Masuk ke Pelaporan Bahaya" -> Opens Worker Form**
- [ ] **Step 4: Test clicking "Ganti Portal" -> Returns to Selector**
- [ ] **Step 5: Test clicking "Verifikasi Akses Admin" -> Opens Admin Login Page**
- [ ] **Step 6: Test entering PIN 1234 -> Opens SHE Admin Dashboard**
- [ ] **Step 7: Capture screenshots and finalize deployment**

---
