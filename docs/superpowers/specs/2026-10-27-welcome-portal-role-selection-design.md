# Desain Spesifikasi: Welcome Portal & Role Selection (iHazard Mining System)

Tanggal: 27 Oktober 2026  
Status: Disetujui (Approved)  
Aplikasi: iHazard - Hazard Report & Mining Safety Management System  

---

## 1. Latar Belakang & Tujuan
Saat ini, ketika pengguna pertama kali membuka website `ihazard.vercel.app`, sistem langsung mengarahkan pengguna ke formulir pelaporan karyawan lapangan. Meskipun praktis, hal ini membuat pemisahan peran antara **Karyawan Pelapor Lapangan** dan **Pengawas / Admin SHE** menjadi kurang jelas di awal, terutama bagi pengguna baru atau pengawas K3 yang ingin langsung masuk ke dashboard pengawasan.

Tujuan dari fitur ini adalah:
1. Menyediakan layar penyambutan profesional bertaraf enterprise pertambangan (*Welcome Portal*).
2. Memberikan dua jalur akses yang jelas dan intuitif:
   - **Portal Karyawan Lapangan**: Lapor temuan bahaya & pantau status laporan (tanpa hambatan login/password).
   - **Portal Pengawas & Admin SHE**: Akses manajemen data K3LH & verifikasi lapangan (dilindungi autentikasi PIN).
3. Menyediakan opsi *"Ingat pilihan di perangkat ini"* berbasis `localStorage` agar pekerja lapangan tidak perlu memilih portal berulang kali di perangkat mereka.
4. Menyediakan opsi *"Ganti Portal"* di header navbar agar pengguna dapat beralih peran kapan saja.

---

## 2. Arsitektur & Perubahan Komponen

### A. Komponen Baru: `PortalSelectorPage.tsx`
* **Lokasi**: `src/components/portal/PortalSelectorPage.tsx`
* **Properti (Props)**:
  ```typescript
  interface PortalSelectorPageProps {
    onSelectRole: (role: 'karyawan' | 'admin', rememberPreference: boolean) => void;
  }
  ```
* **Elemen Visual**:
  - **Header Utama**: Logo iHazard, badge site tambang, judul *"Sistem Manajemen Keselamatan Kerja Tambang"*, serta tagline penjelas.
  - **Kartu 1 (Karyawan Lapangan)**:
    - Ikon helm proyek (`HardHat`), aksen Amber pertambangan.
    - Judul: **Portal Karyawan Lapangan**.
    - Deskripsi: *"Kirim laporan temuan bahaya K3LH, lampirkan bukti foto lapangan, dan pantau status tindak lanjut penanganan."*
    - Tag fitur: *"Akses Cepat Lapangan • Tanpa Password • Respon Instan"*.
    - Tombol aksi: *"Masuk ke Pelaporan Bahaya →"*.
  - **Kartu 2 (Pengawas & Admin SHE)**:
    - Ikon perisai keamanan (`ShieldCheck` / `Lock`), aksen Slate-Zinc beraksen emas.
    - Judul: **Portal Pengawas & Admin SHE**.
    - Deskripsi: *"Verifikasi temuan lapangan, penugasan penanggung jawab perbaikan (PIC), validasi foto Before & After, dan analisis data statistik K3."*
    - Tag fitur: *"Akses Terproteksi PIN • Dashboard Operasional • Validasi SHE"*.
    - Tombol aksi: *"Verifikasi Akses Admin →"*.
  - **Kontrol Preferensi**:
    - Checkbox ramah sentuhan: *"Ingat pilihan di perangkat ini"* (default: `true` untuk kenyamanan pengguna).
    - Catatan privasi/operasional singkat mengenai keamanan data site tambang.

### B. Pembaruan State Aplikasi di `App.tsx`
* **State `currentPortal`**:
  ```typescript
  type PortalScreen = 'selector' | 'karyawan' | 'admin-login' | 'admin-dashboard';
  ```
* **Penyimpanan Lokal (`localStorage`)**:
  - Key: `ihazard_preferred_portal` dengan nilai `'karyawan' | 'admin'`.
  - Saat web pertama kali dimuat (`useEffect` mount):
    - Jika key `ihazard_preferred_portal` ada di `localStorage`, aplikasi langsung mengarahkan pengguna ke portal tersebut:
      - `'karyawan'` -> masuk ke portal pelaporan karyawan.
      - `'admin'` -> masuk ke layar verifikasi PIN admin.
    - Jika tidak ada, aplikasi menampilkan `PortalSelectorPage`.
* **Fungsi Ganti Portal**:
  - Di header navbar (baik mode karyawan maupun admin), terdapat tombol **"Ganti Portal"** / **"Pilih Peran"**.
  - Jika diklik, sistem menghapus/mengabaikan sementara preferensi dan kembali menampilkan `PortalSelectorPage`.

### C. Alur Navigasi (User Flow)
```
[Buka Website]
      │
      ▼
Apakah ada "ihazard_preferred_portal" di localStorage?
      ├── Ya: 'karyawan' ──► [Portal Karyawan (Lapor / Status)]
      ├── Ya: 'admin'    ──► [Halaman Login PIN Admin] ──► [Dashboard SHE]
      └── Tidak          ──► [PortalSelectorPage (Layar Pilihan Peran)]
                                   │
                                   ├── Pilih "Karyawan" (+ simpan jika dicentang) ──► [Portal Karyawan]
                                   └── Pilih "Admin" (+ simpan jika dicentang)    ──► [Halaman Login PIN Admin]
```

---

## 3. Desain Responsif & Estetika (UI/UX)
* **Mobile Viewport (<= 414px)**:
  - Kartu Karyawan dan Kartu Admin tersusun secara vertikal (stack).
  - Target sentuh tombol berukuran minimal 44px ramah jari di lapangan.
  - Teks dan lencana fitur mudah dibaca di bawah sinar matahari (kontras tinggi).
* **Desktop Viewport (>= 768px)**:
  - Kedua kartu tampil berdampingan dalam grid 2-kolom yang seimbang dan elegan.
  - Efek hover halus dengan glowing amber border saat kartu disorot kursor.

---

## 4. Keamanan & Penanganan Kesalahan (Security & Error Handling)
1. **Tidak Ada Bypass Autentikasi Admin**: Memilih "Portal Pengawas & Admin SHE" selalu mewajibkan verifikasi PIN 4 digit; sistem tidak pernah mengizinkan akses langsung ke dashboard tanpa PIN yang valid.
2. **Brute Force Lockout**: Sistem penguncian 3 menit setelah 5 kali salah PIN tetap aktif.
3. **Penyimpanan Aman**: `localStorage` hanya menyimpan preferensi string tampilan (`'karyawan'` atau `'admin'`), bukan kredensial atau token sensitif.

---

## 5. Rencana Pengujian (Test Plan)
1. **Test Suite Otomatis (`vitest`)**:
   - Uji render komponen `PortalSelectorPage` dengan 2 kartu peran.
   - Uji callback `onSelectRole` saat kartu Karyawan ditekan.
   - Uji callback `onSelectRole` saat kartu Admin ditekan.
   - Uji penyimpanan preferensi ke `localStorage` saat checkbox dicentang.
   - Uji tombol "Ganti Portal" untuk kembali ke layar selector.
2. **Pengujian Browser Mobile**:
   - Membuka halaman pada viewport HP (390 x 844 px).
   - Memastikan tidak ada layout shift, wrapping teks aneh, atau elemen bertumpuk.
   - Menguji transisi mulus dari Selector -> Portal Karyawan -> Ganti Portal -> Login Admin.
