# Spesifikasi Desain: Sistem Pelaporan Hazard Report & Otomatisasi SHE Weekly/Monthly PPT

**Dokumen Versi:** 1.0  
**Tanggal:** 26 Oktober 2026  
**Status:** Disetujui untuk Implementasi  
**Target Proyek:** Digitalisasi K3LH / SHE (*Safety, Health, and Environment*) Pertambangan Batu Bara  

---

## 1. Ringkasan Eksekutif & Latar Belakang

Sistem ini dirancang untuk menjawab dua kebutuhan utama operasional keselamatan kerja di site pertambangan batu bara:
1. **Pelaporan Bahaya Lapangan Cepat (Hazard Report):** Memfasilitasi seluruh karyawan dan operator lapangan untuk melaporkan temuan bahaya (Kondisi Tidak Aman / Tindakan Tidak Aman) langsung dari ponsel pintar (HP) dengan dokumentasi foto dan lokasi site tambang, yang otomatis tersinkronisasi secara *real-time* ke **Google Sheets / Excel**.
2. **Otomatisasi Laporan Presentasi SHE (Weekly & Monthly ke PPT):** Menggantikan proses manual penyusunan slide presentasi mingguan dan bulanan tim SHE. Tim SHE dapat menginput metrik persentase kepatuhan dan pencapaian K3LH melalui portal web, lalu mengunduh slide presentasi PowerPoint (`.pptx`) standar korporat siap pakai hanya dengan satu klik tombol.

---

## 2. Arsitektur Sistem & Alur Data

```
┌────────────────────────────────────────────────────────┐
│               PERANGKAT PENGGUNA (HP / LAPTOP)          │
│                                                        │
│  [Pekerja Lapangan]            [Tim Pengawas & SHE]    │
│    • Buka Link / Scan QR         • Dashboard Manajemen │
│    • Form Cepat Hazard           • Validasi Status     │
│    • Foto Kamera Langsung        • Input Weekly/Monthly│
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS
                           ▼
┌────────────────────────────────────────────────────────┐
│           APLIKASI WEB PORTAL SHE (PWA)                │
│                                                        │
│  • Frontend: React / Next.js / Tailwind CSS (Responsive)│
│  • Backend API: Node.js / Express                      │
│  • Offline Cache: IndexedDB / Service Worker           │
│  • PPT Engine: pptxgenjs / Python-pptx                 │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│     GOOGLE SHEETS & DRIVE    │ │     PPT EXPORT SERVICE       │
│                              │ │                              │
│ • Sheet: Data_Hazard_Report  │ │ • Template Weekly (6 Slide)  │
│ • Sheet: SHE_Weekly_Log      │ │ • Template Monthly (10 Slide)│
│ • Sheet: SHE_Monthly_Log     │ │ • Auto Charts & % Badges     │
│ • Drive: Penyimpanan Foto    │ │ • Auto Format Before-After   │
└──────────────────────────────┘ └──────────────────────────────┘
```

---

## 3. Modul 1: Mobile Web Hazard Report (Pelaporan dari HP)

### 3.1. Karakteristik Antarmuka
* **Mobile-First & Responsif:** Dioptimalkan untuk layar ponsel berbagai ukuran (operator tambang, pengemudi hauling, mekanik workshop).
* **Frictionless Submission:** Pekerja lapangan dapat langsung melapor tanpa login akun yang rumit (cukup mengisi identitas dasar NIK dan Departemen).
* **Offline Caching:** Mendukung penyimpanan sementara di HP (IndexedDB) jika jaringan seluler di area tambang (pit/hauling) terputus, dan otomatis terkirim begitu HP mendapatkan sinyal/Wi-Fi kantor.

### 3.2. Struktur Field Form Hazard Report
1. **Identitas Pelapor:**
   * Nama Lengkap (Teks)
   * NIK / No. Pekerja (Teks/Angka)
   * Departemen / Perusahaan (Dropdown: *Mining Operation, Hauling/Transport, Coal Processing/ROM, Workshop/Plant, SHE, Logistik/Warehouse, Sub-Kontraktor*)
2. **Lokasi & Waktu:**
   * Tanggal & Jam Temuan (Otomatis waktu lokal)
   * Area Site Utama (Dropdown: *Pit North/South, Disposal Area, Hauling Road KM 00-30, ROM Stockpile, Workshop & Washpad, Jetty/Port Pelabuhan, Camp & Kantor Site, Stasiun Pengisian BBM*)
   * Titik Spesifik / Keterangan Lokasi (Teks: contoh *"KM 14 dekat persimpangan Pos 2"*)
3. **Karakteristik Bahaya K3LH:**
   * Tipe Bahaya: **KTA** (Kondisi Tidak Aman) atau **TTA** (Tindakan Tidak Aman)
   * Kategori Bahaya (Dropdown):
     * *Jalan Tambang, Tanggul, & Lereng*
     * *Kelaikan Unit & Kendaraan Tambang (Alat Berat / Sarana)*
     * *Housekeeping & Kerapian 5S*
     * *Kepatuhan Alat Pelindung Diri (APD)*
     * *Tumpahan Oli, BBM, & Pencemaran Lingkungan*
     * *Blind Spot, Debu, & Rambu Keselamatan*
     * *Bahaya Kelistrikan & Panas*
   * Tingkat Risiko (*Risk Matrix*):
     * **Rendah (Hijau):** Tidak berpotensi cidera berat / operasional normal.
     * **Sedang (Kuning):** Berpotensi cidera ringan / butuh perbaikan dalam 24-48 jam.
     * **Tinggi (Merah):** Berpotensi insiden fatal / unit rusak berat / tindakan stop kerja seketika.
4. **Dokumentasi & Tindakan:**
   * **Foto Temuan Bahaya:** Menggunakan akses kamera langsung di HP atau upload file foto.
   * **Deskripsi Singkat:** Uraian kondisi bahaya yang ditemukan.
   * **Tindakan Langsung yang Diambil (*Immediate Action*):** Contoh: *"Memasang safety cone dan menyingkirkan batu besar ke tepi."*
   * **Saran Perbaikan (*Corrective Action*):** Rekomendasi tindak lanjut untuk pengawas.

### 3.3. Skema Data Google Sheets (`Data_Hazard_Report`)
Setiap laporan yang disubmit akan langsung masuk ke Google Sheet dengan kolom:
| Kolom | Nama Field | Tipe Data | Deskripsi / Contoh |
|---|---|---|---|
| A | `Tiket_ID` | String | Format unik `HZD-YYYYMMDD-XXXX` |
| B | `Timestamp` | DateTime | Waktu submit laporan |
| C | `Nama_Pelapor` | String | Nama pelapor |
| D | `NIK` | String | Nomor induk karyawan |
| E | `Departemen` | String | Departemen pelapor |
| F | `Area_Site` | String | Area utama temuan |
| G | `Detail_Lokasi` | String | Titik spesifik temuan |
| H | `Tipe_Bahaya` | Enum | KTA / TTA |
| I | `Kategori_K3` | String | Kategori bahaya |
| J | `Tingkat_Risiko`| Enum | Rendah / Sedang / Tinggi |
| K | `Deskripsi` | String | Penjelasan temuan |
| L | `URL_Foto` | String | Tautan foto di Google Drive / Cloud |
| M | `Tindakan_Langsung` | String | Penanganan sementara |
| N | `Status` | Enum | `Open`, `In Progress`, `Closed` |
| O | `PIC_Perbaikan`| String | Penanggung jawab perbaikan (diisi tim SHE) |
| P | `Catatan_SHE` | String | Tindak lanjut penutupan bahaya |
| Q | `Tanggal_Closed` | Date | Tanggal bahaya diselesaikan |

---

## 4. Modul 2: Form Input Pelaporan SHE Weekly & Monthly

Untuk laporan Weekly dan Monthly, disediakan 2 tab/halaman penginputan khusus di portal admin SHE.

### 4.1. Form Input MINGGUAN (Weekly SHE)
* **Informasi Periode:** Nomor Minggu (W1/W2/W3/W4/W5), Bulan, dan Tahun.
* **Agregasi Hazard:** Otomatis menarik data dari Modul 1 (Total laporan masuk minggu ini, jumlah Open, jumlah Closed, rasio KTA vs TTA).
* **Input Manual Persentase & Capaian Operasional:**
  * `% Kepatuhan P5M / Tool Box Meeting Harian` (Target: 100%)
  * `Inspeksi Keselamatan Terlaksana vs Target` (Angka terencana vs aktual)
  * `% Kepatuhan Uji Bugar & Pemeriksaan Fatigue Operator`
  * `Statistik Insiden Minggu Berjalan:` Fatality (0), LTI (0), Property Damage (n), Near Miss (n).
  * `Highlight Kondisi Lingkungan:` Kualitas pH air settling pond tambang dan debit pengelolaan air limpasan.
  * `Daftar Top 3 Isu K3 Prioritas Minggu Depan`

### 4.2. Form Input BULANAN (Monthly SHE)
* **Informasi Periode:** Bulan dan Tahun Kalender.
* **Metrik Resmi Tambang (Lagging Indicators):**
  * `Jam Kerja Selamat (Safe Man Hours):` Akumulasi jam kerja karyawan & mitra kerja (Bulan berjalan & YTD).
  * `Recordable Incidents:` Fatality (0), LTI (0), Restricted Work Case (0), Medical Treatment Case (0).
  * `Kalkulasi Otomatis Tingkat Frekuensi:`
    $$\text{LTIFR} = \frac{\text{Jumlah LTI} \times 1.000.000}{\text{Total Jam Kerja}}$$
    $$\text{TRIFR} = \frac{\text{Total Recordable Injuries} \times 1.000.000}{\text{Total Jam Kerja}}$$
* **Persentase Leading Indicators:**
  * `% Penyelesaian Hazard Report tepat waktu (< 14 hari)`
  * `% Ketercapaian Planned Safety Inspection & Management Walkthrough`
  * `% Karyawan/Mitra Mengikuti Safety Induction & Refreshment Training`
  * `% Kepatuhan Golden Rules K3 Pertambangan`
* **Metrik Pengelolaan Lingkungan Pertambangan:**
  * Kepatuhan Baku Mutu Air Asam Tambang (BOD/COD/pH/TSS)
  * Neraca Pengelolaan Limbah B3 (Oli bekas, filter bekas, aki)
  * Luas Lahan Reklamasi & Revegetasi Tambang (Hektar)
* **Catatan Rapat P2K3 & Kebijakan K3LH:** Poin-poin evaluasi komite K3 site.

---

## 5. Modul 3: PowerPoint Generation Engine (Template PPT Otomatis)

Engine menggunakan pustaka generator presentasi (`pptxgenjs` atau `python-pptx`) yang bekerja secara *headless* di server tanpa memerlukan software PowerPoint terpasang.

### 5.1. Struktur Slide Laporan MINGGUAN (Weekly SHE Deck) - 6 Slide
1. **Slide 1 - Title Cover:**
   * Judul: *"WEEKLY SAFETY, HEALTH & ENVIRONMENT REPORT"*
   * Site Name, Nomor Periode Minggu, Tanggal, Logo Tambang.
2. **Slide 2 - Executive Scorecard Mingguan:**
   * 4 Kartu Metrik Persentase Utama: Zero Fatality, % Inspeksi Terlaksana, % Hazard Selesai, Jam Kerja Aman Minggu Ini.
3. **Slide 3 - Analisis Hazard Mingguan:**
   * Donut Chart: Distribusi KTA vs TTA.
   * Bar Chart: Jumlah temuan bahaya berdasarkan area (*Pit, Hauling, Workshop, ROM, Port*).
4. **Slide 4 - Ringkasan Insiden & Near Miss:**
   * Tabel matriks insiden minggu ini beserta ringkasan investigasi singkat jika ada temuan nearmiss/property damage.
5. **Slide 5 - Highlight Temuan Before vs After:**
   * Kolase visual 2 kolom: Foto kondisi bahaya saat ditemukan (*Before*) vs Foto kondisi setelah diperbaiki (*After*).
6. **Slide 6 - Action Plan & Prioritas SHE Minggu Berikutnya:**
   * Tabel PIC, target tanggal penyelesaian, dan fokus area pengawasan.

### 5.2. Struktur Slide Laporan BULANAN (Monthly SHE Deck) - 10 Slide
1. **Slide 1 - Title Cover:** *"MONTHLY SHE PERFORMANCE MANAGEMENT REVIEW"*.
2. **Slide 2 - Executive Dashboard:** KPI Summary, Pencapaian Jam Kerja Aman Akumulatif (Safe Man Hours Milestones).
3. **Slide 3 - Lagging Indicators & Zero Accident Matrix:** Statistik kecelakaan kerja, kalkulasi LTIFR & TRIFR YTD vs Target.
4. **Slide 4 - Leading Indicators & Analisis Hazard Report:** Tren jumlah pelaporan hazard bulanan, rasio penyelesaian (*resolution rate*).
5. **Slide 5 - Risk Matrix Distribution:** Sebaran temuan risiko Tinggi/Sedang/Rendah dan status tindakan perbaikannya (*CAPA Status*).
6. **Slide 6 - Planned Safety Inspection & Management Walkthrough:** Realisasi inspeksi terencana per departemen.
7. **Slide 7 - Safety Training & Kampanye K3:** Kepatuhan induksi, pelatihan izin kerja khusus (Working at Height, Hot Work, Confined Space).
8. **Slide 8 - Kinerja Pengelolaan Lingkungan:** Kualitas air settling pond tambang, pemantauan debu tambang, pengelolaan limbah B3.
9. **Slide 9 - Best SHE Improvement Gallery:** Dokumentasi program perbaikan keselamatan kerja terbaik bulan berjalan.
10. **Slide 10 - Rekomendasi Komite P2K3 & Focus Area Bulan Depan.**

---

## 6. Spesifikasi Teknologi (Tech Stack)

* **Frontend:** Next.js / React (TypeScript) + Tailwind CSS + PWA Service Worker (Mobile-first, responsif, elegan).
* **Backend:** Node.js API Routes (Serverless / Express) + Integrasi Google Sheets API (v4) menggunakan Service Account.
* **Database & File Storage:** 
  * Google Sheets sebagai Database Data Utama (sehingga tim Mas Gusti bebas mengolah data di spreadsheet kapan saja).
  * Google Drive API / Cloud Storage untuk penyimpanan file foto bukti temuan bahaya.
* **Presentation Engine:** `pptxgenjs` / `python-pptx` untuk merender slide PowerPoint secara native dengan grafik dinamis (chart shapes) dan format warna korporat K3LH (Navy, Safety Orange, Green).

---

## 7. Strategi Pengujian (Testing Strategy)

1. **Pengujian Form Mobile:** Uji coba input form di perangkat Android dan iOS, pengujian responsivitas kamera, serta kompresi foto otomatis di bawah 1 MB per gambar.
2. **Pengujian Offline Resilience:** Menguji submit laporan saat koneksi internet dimatikan (mode pesawat), lalu memastikan data tersimpan di local cache dan terkirim otomatis saat internet aktif kembali.
3. **Pengujian Sinkronisasi Google Sheets:** Validasi tidak adanya *race condition* atau data hilang saat puluhan karyawan submit laporan bersamaan.
4. **Pengujian Export PPT:** Memastikan file `.pptx` hasil generate dapat dibuka dengan sempurna di Microsoft PowerPoint (Windows/Mac) dan Google Slides tanpa ada font/elemen grafik yang rusak.

---

## 8. Panduan Bahan Diskusi Pertemuan dengan Klien (Tgl 31)

Dokumen ini dapat langsung Anda gunakan sebagai acuan saat bertemu dengan Mas Gusti pada tanggal 31:
1. **Validasi Fleksibilitas:** Tunjukkan bahwa sistem ini tidak mewajibkan instalasi software berat di server perusahaan; data langsung mengalir ke Google Sheets yang mudah mereka kontrol.
2. **Nilai Tambah Otomatisasi PPT:** Jelaskan bahwa tugas mingguan/bulanan yang biasanya menyita waktu 4-8 jam untuk copy-paste grafik ke PPT kini selesai dalam 1 klik.
3. **Konfirmasi Template Perusahaan:** Tanyakan apakah perusahaan mereka memiliki warna khas, logo resmi, atau kode template font tertentu untuk dimasukkan ke dalam generator PPT.
