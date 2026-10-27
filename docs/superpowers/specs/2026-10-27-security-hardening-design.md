# Desain Spesifikasi: Penguatan Keamanan Sistem iHazard (Security Hardening)

Tanggal: 27 Oktober 2026  
Status: Disetujui (Approved)  
Aplikasi: iHazard - Hazard Report & Mining Safety Management System  
Target: Menutup celah keamanan kritis (P1) dan penting (P2) hasil audit K3/SHE  

---

## 1. Latar Belakang & Tujuan
Berdasarkan audit komprehensif, ditemukan celah kritis pada autentikasi admin di frontend dan otorisasi di Google Apps Script yang memungkinkan modifikasi data dan bypass akses. 

Tujuan penguatan ini:
1. Menghilangkan seluruh celah *Authentication Bypass* di frontend.
2. Mengamankan backend Google Apps Script dengan otorisasi berbasis aksi (*action-based authorization*) dan *concurrency lock*.
3. Mencegah eksploitasi *Formula / CSV Injection* pada Google Sheets dan unduhan Microsoft Excel.
4. Menerapkan header keamanan browser *Content-Security-Policy* (CSP) pada Vercel.

---

## 2. Arsitektur & Spesifikasi Perubahan

### A. Frontend: Perbaikan Autentikasi & Penghapusan Celah Bypass
1. **`src/App.tsx`**:
   - Hapus parsing `?role=admin` dari `window.location.search`. Parameter URL dilarang memberikan akses admin langsung tanpa verifikasi PIN.
   - Sesi admin disimpan dalam `sessionStorage` (`SHE_ADMIN_SESSION = 'active'`), sehingga jika tab ditutup atau browser ditutup, sesi admin langsung berakhir.
   - Tetap pertahankan auto-logout 30 menit tidak aktif.
2. **`src/components/auth/AdminLoginPage.tsx`**:
   - Hapus tombol *"Gunakan PIN Default (1234)"* dari form publik agar PIN tidak terekspos ke siapa pun.
   - Pertahankan fitur lockout brute-force (3 menit setelah 5x salah PIN).
   - Terapkan verifikasi PIN yang aman dengan input tersamar (*masked*).

### B. Backend: Penguncian Otorisasi & Concurrency di Google Apps Script (`Code.gs`)
1. **Konfigurasi PIN Admin di Backend**:
   - Variabel konfigurasi: `var ADMIN_PIN = '1234';` (dapat disesuaikan di editor skrip).
2. **Pemisahan Aksi POST (`doPost`)**:
   - Payload wajib menyertakan properti `action`:
     - **`action: 'create_report'`** (Karyawan):
       - Hanya boleh menambah baris baru (`sheet.appendRow`).
       - Dilarang menimpa atau mengedit baris yang sudah ada. Jika `tiketId` sudah ada, return error `409 Conflict`.
     - **`action: 'update_status'` / `'resolve_hazard'`** (Admin):
       - Wajib menyertakan `adminPin`. Skrip memverifikasi `payload.adminPin === ADMIN_PIN`.
       - Jika salah atau tidak disertakan, tolak dengan status `error: 'Unauthorized'`.
3. **Pencegahan Race Condition**:
   - Pasang `LockService.getScriptLock()` dengan batas tunggu 10 detik (`waitLock(10000)`) dan pelepasan kunci di blok `finally` (`releaseLock()`).
4. **Perlindungan Pembacaan Data (`doGet`)**:
   - Jika dipanggil tanpa otentikasi admin, request yang menyertakan `?nik=...` hanya mengembalikan tiket milik NIK tersebut.
   - Pengambilan seluruh data tanpa filter hanya diizinkan jika menyertakan header atau parameter `?pin=...`.

### C. Proteksi Formula Injection (CWE-1236)
1. **Sanitasi di Backend (`Code.gs`) & Frontend (`storage-service.ts`, `excel-export-service.ts`)**:
   - Fungsi helper `sanitizeFormula(value: string): string`:
     - Jika karakter pertama string adalah `=`, `+`, `-`, atau `@`, sisipkan tanda kutip tunggal (`'`) di depannya.
     - Contoh: `=HYPERLINK(...)` diubah menjadi `'=HYPERLINK(...)`.
   - Diterapkan pada seluruh field bebas: `description`, `reporterName`, `locationDetail`, `immediateAction`, `closureNotes`.

### D. Penguatan Header Keamanan Vercel (`vercel.json`)
- Tambahkan header `Content-Security-Policy`:
  ```
  default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://drive.google.com https://*.googleusercontent.com; connect-src 'self' https://script.google.com https://script.googleusercontent.com;
  ```

---

## 3. Rencana Pengujian (Test Plan)
1. **Pengujian Unit Otomatis (`vitest`)**:
   - Uji sanitasi formula injection pada teks berawalan `=`, `+`, `-`, `@`.
   - Uji navigasi App: Pastikan `?role=admin` di URL tidak lagi membuka dashboard secara instan.
   - Uji login admin: Verifikasi PIN yang benar memberikan akses, PIN salah memicu lockout, dan tombol PIN default tidak lagi ada di DOM.
2. **Pengujian Integrasi Backend**:
   - Pastikan pengiriman laporan karyawan (`create_report`) tidak dapat menimpa tiket yang sudah ada.
   - Pastikan update tiket tanpa `adminPin` ditolak.
3. **Pengujian Build & Verifikasi Visual**:
   - `tsc && vite build` selesai tanpa error.
   - Halaman login admin tampil bersih tanpa ekspos PIN default.
