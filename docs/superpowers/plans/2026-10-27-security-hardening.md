# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengatasi seluruh temuan kerentanan keamanan kritis (P1) dan penting (P2) pada sistem pelaporan K3 iHazard, meliputi penghapusan bypass autentikasi URL, proteksi otorisasi backend Apps Script, pencegahan formula injection, dan penambahan CSP.

**Architecture:** Membangun utility sanitasi formula di `src/utils/security.ts`, memperketat autentikasi sesi admin di `App.tsx` & `AdminLoginPage.tsx`, memperbarui otorisasi aksi di `Code.gs` dan `sheets-sync-service.ts`, serta menambahkan header CSP di `vercel.json`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Google Apps Script, ExcelJS, Vitest.

## Global Constraints
- Bahasa UI: Bahasa Indonesia profesional standar K3LH / SHE pertambangan.
- Zero-cost: Solusi murni menggunakan konfigurasi gratis Vercel dan Google Apps Script.
- Backward compatibility: Formulir pelaporan karyawan tetap mudah digunakan tanpa login, sedangkan aksi admin terlindungi PIN.
- Kerapian kode: Seluruh test Vitest wajib lolos 100% dan kompilasi build produksi `tsc && vite build` bersih.

---

### Task 1: Create Formula Sanitizer Utility and Secure CSV/Excel Exports

**Files:**
- Create: `src/utils/security.ts`
- Create: `src/__tests__/security.test.ts`
- Modify: `src/services/storage-service.ts`
- Modify: `src/services/excel-export-service.ts`

**Interfaces:**
- Produces:
  ```typescript
  export function sanitizeFormula(value: string | undefined | null): string;
  ```

- [x] **Step 1: Write failing unit tests for `sanitizeFormula`**

Create `src/__tests__/security.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { sanitizeFormula } from '../utils/security';

describe('Security Utility: Formula Injection Prevention', () => {
  it('prepends single quote to strings starting with formula trigger characters (=, +, -, @)', () => {
    expect(sanitizeFormula('=1+1')).toBe("'=1+1");
    expect(sanitizeFormula('+SUM(A1:A10)')).toBe("'+SUM(A1:A10)");
    expect(sanitizeFormula('-100')).toBe("'-100");
    expect(sanitizeFormula('@HYPERLINK("http://evil.com")')).toBe("'@HYPERLINK(\"http://evil.com\")");
  });

  it('leaves safe strings unmodified', () => {
    expect(sanitizeFormula('Normal hazard description')).toBe('Normal hazard description');
    expect(sanitizeFormula('Pit North 12')).toBe('Pit North 12');
    expect(sanitizeFormula('')).toBe('');
    expect(sanitizeFormula(null)).toBe('');
    expect(sanitizeFormula(undefined)).toBe('');
  });

  it('handles strings with leading whitespace before formula characters', () => {
    expect(sanitizeFormula('   =CMD()')).toBe("'   =CMD()");
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/security.test.ts`
Expected: FAIL with "Cannot find module '../utils/security'"

- [x] **Step 3: Implement `src/utils/security.ts`**

Create `src/utils/security.ts`:
```typescript
/**
 * Utility keamanan untuk mencegah Formula Injection / CSV Injection (CWE-1236)
 * pada Google Sheets dan Microsoft Excel.
 */
export function sanitizeFormula(value: string | undefined | null): string {
  if (!value) return '';
  const trimmed = value.trimStart();
  const firstChar = trimmed.charAt(0);
  if (firstChar === '=' || firstChar === '+' || firstChar === '-' || firstChar === '@') {
    return `'${value}`;
  }
  return value;
}
```

- [x] **Step 4: Integrate `sanitizeFormula` into `storage-service.ts` and `excel-export-service.ts`**

In `src/services/storage-service.ts`:
Update `exportReportsToCSV`:
```typescript
import { sanitizeFormula } from '../utils/security';

const escapeCSV = (str: string | undefined) => `"${sanitizeFormula(str || '').replace(/"/g, '""')}"`;
```

In `src/services/excel-export-service.ts`:
Apply `sanitizeFormula` to `report.description`, `report.locationDetail`, `report.immediateAction`, and `report.reporterName`.

- [x] **Step 5: Run tests to verify all pass**

Run: `npx vitest run src/__tests__/security.test.ts src/__tests__/excel-export.test.ts`
Expected: PASS

- [x] **Step 6: Commit**

Run:
```bash
git add src/utils/security.ts src/__tests__/security.test.ts src/services/storage-service.ts src/services/excel-export-service.ts ; git commit -m "feat: add formula injection protection in CSV and Excel exports"
```

---

### Task 2: Remove URL Authentication Bypass and Remove Default PIN from UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/auth/AdminLoginPage.tsx`
- Modify: `src/__tests__/dashboard.test.tsx`

**Interfaces:**
- Ensures: URL `?role=admin` is strictly ignored; admin mode only accessible via valid PIN entry.
- Ensures: Button "Gunakan PIN Default (1234)" is removed from `AdminLoginPage`.

- [x] **Step 1: Update `src/App.tsx`**

Remove `urlRole === 'admin'` auto-elevation.
Use `sessionStorage` for temporary admin session:
```typescript
const [currentScreen, setCurrentScreen] = useState<'selector' | 'karyawan' | 'admin-login' | 'admin'>(() => {
  if (initialRole === 'admin') return 'admin';
  if (initialRole === 'karyawan') return 'karyawan';
  if (initialRole === 'selector') return 'selector';

  if (typeof window !== 'undefined') {
    // Check active session in sessionStorage
    const sessionActive = sessionStorage.getItem('SHE_ADMIN_SESSION');
    if (sessionActive === 'active') return 'admin';

    const urlParams = new URLSearchParams(window.location.search);
    const urlRole = urlParams.get('role');
    if (urlRole === 'karyawan') return 'karyawan';
    if (urlRole === 'selector') return 'selector';

    const savedPortal = localStorage.getItem('ihazard_preferred_portal');
    if (savedPortal === 'karyawan') return 'karyawan';
    if (savedPortal === 'admin') return 'admin-login';
  }

  return 'selector';
});
```

When admin logs in:
```typescript
sessionStorage.setItem('SHE_ADMIN_SESSION', 'active');
```
When admin logs out:
```typescript
sessionStorage.removeItem('SHE_ADMIN_SESSION');
```

- [x] **Step 2: Update `src/components/auth/AdminLoginPage.tsx`**

Remove the "Gunakan PIN Default (1234)" button.
Retain the lockout counter and eye toggle.

- [x] **Step 3: Update `src/__tests__/dashboard.test.tsx`**

Update tests to verify that `?role=admin` in URL does not grant admin access, and that the default PIN button is absent from the DOM.

- [x] **Step 4: Run tests to verify all pass**

Run: `npx vitest run src/__tests__/dashboard.test.tsx`
Expected: PASS

- [x] **Step 5: Commit**

Run:
```bash
git add src/App.tsx src/components/auth/AdminLoginPage.tsx src/__tests__/dashboard.test.tsx ; git commit -m "fix: remove URL admin auth bypass and remove default PIN button from login page"
```

---

### Task 3: Hardening Google Apps Script Backend (`Code.gs`) and Sync Service

**Files:**
- Modify: `google-apps-script/Code.gs`
- Modify: `src/services/sheets-sync-service.ts`

**Interfaces:**
- Action types:
  - `action: 'create_report'` (Public, Insert Only)
  - `action: 'update_status'` (Admin, Requires valid `adminPin`)
- Concurrency Lock: `LockService.getScriptLock()`
- Formula Sanitization in Apps Script

- [x] **Step 1: Update `google-apps-script/Code.gs`**

Implement:
1. `var ADMIN_PIN = '1234';`
2. Concurrency lock at start of `doPost`:
   ```javascript
   var lock = LockService.getScriptLock();
   lock.waitLock(10000);
   ```
3. Action-based authorization:
   - If `payload.action === 'update_status'` or `payload.action === 'resolve_hazard'`:
     Verify `payload.adminPin === ADMIN_PIN` (or active custom PIN). Reject with 401 Unauthorized if mismatch.
   - If `payload.action === 'create_report'` (or default new report):
     Only allow insert. If `tiketId` already exists, reject with 409 Conflict to prevent unauthenticated overwrite!
4. Sanitize formula in `Code.gs` for `description`, `reporterName`, `locationDetail`.
5. Release lock in `finally` block:
   ```javascript
   lock.releaseLock();
   ```

- [x] **Step 2: Update `src/services/sheets-sync-service.ts`**

Include `action` in payload:
- `'create_report'` for initial submission.
- `'update_status'` with `adminPin: getActiveAdminPin()` when an admin updates status or resolves hazard.

- [x] **Step 3: Run Vitest suites**

Run: `npx vitest run`
Expected: PASS (all tests pass)

- [x] **Step 4: Commit**

Run:
```bash
git add google-apps-script/Code.gs src/services/sheets-sync-service.ts ; git commit -m "feat: enforce action-based authorization, concurrency lock, and formula sanitization in Apps Script"
```

---

### Task 4: Add Content-Security-Policy (CSP) in `vercel.json`

**Files:**
- Modify: `vercel.json`

- [x] **Step 1: Update `vercel.json` headers**

Add `Content-Security-Policy` header allowing Google Apps Script and Google Fonts while blocking untrusted origins.

- [x] **Step 2: Run build to verify headers and config syntax**

Run: `npm run build`
Expected: PASS

- [x] **Step 3: Commit**

Run:
```bash
git add vercel.json ; git commit -m "feat: add Content-Security-Policy headers in vercel.json"
```

---

### Task 5: Browser Subagent Verification & Deployment

- [x] **Step 1: Verify in browser subagent that `?role=admin` does NOT bypass authentication**
- [x] **Step 2: Verify login page no longer exposes default PIN button**
- [x] **Step 3: Test valid PIN entry -> logs into Admin Dashboard**
- [x] **Step 4: Push to origin main and verify deployment**
