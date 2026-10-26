# Project Specification: Coal Mining SHE Hazard Report & Automated Excel-to-PPT Engine

> **Instruksi untuk Antigravity Agent:**
> Analisis dokumen spesifikasi ini secara menyeluruh. Tugas Anda adalah:
> 1. Mengevaluasi rancangan arsitektur, alur data, dan skema backend di bawah ini (identifikasi potensi *bottleneck* terutama terkait kondisi sinyal tambang dan otomatisasi manipulasi file `.xlsx` ke `.pptx`).
> 2. Menyusun *Implementation Plan* (`/plan`) untuk membangun *Minimum Viable Product* (MVP) sebagai bahan demo ke klien pada tanggal 31.
> 3. Melakukan *scaffolding* struktur repositori, membuat *prototype* aplikasi web Hazard Report, template Excel SHE, serta *script* backend pengubah Excel ke PowerPoint.

---

## 1. Ringkasan Proyek & Masalah Klien (Problem Statement)

Klien merupakan praktisi/departemen **SHE (Safety, Health, and Environment) / K3LH** di industri pertambangan batu bara yang membutuhkan dua solusi terintegrasi:
1. **Web App Pelaporan Bahaya (Hazard Report) Mobile-First**: Karyawan di lapangan (area tambang) dapat melaporkan temuan bahaya melalui *smartphone*, lengkap dengan foto bukti, dan datanya langsung masuk ke Google Sheets atau Microsoft Excel.
2. **Otomatisasi Pelaporan SHE Weekly & Monthly (Excel ke PPT)**: Klien belum memiliki template standar. Klien menginginkan template Excel terpisah untuk input data *Weekly* (Mingguan) dan *Monthly* (Bulanan) yang terhubung ke slide presentasi PowerPoint (`.pptx`), sehingga angka statistik dan persentase KPI otomatis ter-update di PPT tanpa harus menyalin satu per satu secara manual.

---

## 2. Rancangan Sistem & Arsitektur (System Architecture)

Untuk menyatukan kedua kebutuhan di atas ke dalam satu ekosistem yang ringan, mudah dipelihara, dan cepat didemokan, kita menggunakan pendekatan **Unified Python Backend (FastAPI) + Modern PWA Frontend**.

### 2.1. Diagram Alur Arsitektur (High-Level Data Flow)

```text
[MODUL 1: HAZARD REPORT LAPANGAN]
Karyawan (HP Browser / PWA)
   |-- (1) Kompresi Foto di Browser (< 300 KB) & Simpan Draft Offline (IndexedDB)
   |-- (2) HTTP POST (JSON + Multipart Image)
   v
Backend Server (Python FastAPI)
   |-- (3a) Simpan Foto ke Cloud Storage / Google Drive / Local Storage
   |-- (3b) Tulis Baris Baru ke Google Sheets (via gspread) ATAU File Master Excel (via openpyxl)
   v
Admin SHE dapat mengunduh / melihat rekap Hazard secara Real-Time di Google Sheets / Excel.

-------------------------------------------------------------------------

[MODUL 2: OTOMATISASI LAPORAN WEEKLY & MONTHLY (EXCEL KE PPT)]
Admin SHE
   |-- (1) Input data manual di Template_Weekly_SHE.xlsx atau Template_Monthly_SHE.xlsx
   |-- (2) Kalkulasi rumus KPI & Persentase berjalan otomatis di Excel
   |-- (3) Upload file Excel ke Dashboard Web (atau jalankan Script Generator)
   v
Reporting Engine (Python: openpyxl + python-pptx)
   |-- (4) Ekstrak nilai sel KPI, tabel ringkasan, dan persentase dari Sheet
   |-- (5) Injeksi data ke Placeholder Slide di Template_Weekly.pptx / Template_Monthly.pptx
   v
Output: File Presentasi Siap Rapat (Laporan_SHE_Weekly_W4.pptx / Laporan_SHE_Monthly_Oct.pptx)
```

### 2.2. Mengapa Arsitektur Ini Dipilih?
1. **Unifikasi Bahasa Pemrograman (Python)**: Python memiliki pustaka paling matang untuk memanipulasi file Microsoft Office (`openpyxl` untuk Excel dan `python-pptx` untuk PowerPoint) sekaligus memiliki *framework* API modern (`FastAPI`).
2. **Fleksibilitas Database**: Klien meminta hasil akhir di Google Sheets atau Excel. Backend Python dapat langsung menulis ke Google Sheets menggunakan *Service Account* (`gspread`) sekaligus menyediakan endpoint unduh langsung dalam format `.xlsx`.
3. **Kesiapan Kondisi Lapangan Tambang**: Area Pit dan Hauling sering mengalami sinyal lemah. Frontend dirancang menggunakan konsep *Progressive Web App* (PWA) dengan kompresi gambar di sisi klien (*client-side compression*) sebelum dikirim ke server.

---

## 3. Rancangan Modul 1: Aplikasi Web Hazard Report

### 3.1. Spesifikasi Antarmuka (UI/UX Mobile-First)
* **Target Perangkat**: Layar *smartphone* (Android/iOS) melalui browser (Chrome/Safari) tanpa wajib instal dari Play Store/App Store.
* **Fitur Kunci Frontend**:
  * **Auto-Timestamp & Auto-ID**: Tanggal, jam, dan nomor tiket laporan dibuat otomatis.
  * **Client-Side Image Compression**: Menggunakan HTML5 `<canvas>` untuk mengecilkan resolusi foto dari kamera HP (misal dari $8\text{ MB}$ menjadi $\le 300\text{ KB}$) agar pengiriman cepat di sinyal 3G/4G lemah.
  * **Offline Queue (Opsional/Fase 2)**: Jika tidak ada sinyal, laporan disimpan di `IndexedDB` browser dan dikirim otomatis saat sinyal kembali tersedia.

### 3.2. Skema Data Form & Kolom Sheet (`HAZARD_DATA`)

| Nama Field (JSON) | Kolom Excel / Sheet | Tipe Data | Pilihan / Validasi (Khusus Tambang Batu Bara) |
| :--- | :--- | :--- | :--- |
| `ticket_id` | `A: ID Laporan` | String | Format: `HZ-YYYYMMDD-XXXX` (Auto-generated) |
| `timestamp` | `B: Waktu Lapor` | DateTime | `YYYY-MM-DD HH:MM:SS` |
| `reporter_name` | `C: Nama Pelapor` | String | Wajib diisi |
| `reporter_nik` | `D: NIK / ID Badge` | String | Wajib diisi |
| `department` | `E: Departemen / Mitra` | Enum | `Produksi`, `Plant/Maintenance`, `Engineering`, `SHE`, `HRGA`, `Logistik`, `Kontraktor/Subkon` |
| `location` | `F: Lokasi Tambang` | Enum | `Pit Utama`, `Jalan Hauling`, `Disposal / Dumping Area`, `ROM / Stockpile`, `Crusher`, `Jetty / Port`, `Workshop`, `Fuel Station`, `Mess / Office` |
| `location_detail` | `G: Detail Lokasi` | String | Contoh: `KM 14 Hauling`, `Pit Selatan Seam B` |
| `hazard_type` | `H: Jenis Bahaya` | Enum | `KTA (Kondisi Tidak Aman)` atau `TTA (Tindakan Tidak Aman)` |
| `risk_level` | `I: Tingkat Risiko` | Enum | `Rendah (Low)`, `Sedang (Medium)`, `Tinggi (High)`, `Ekstrem (Critical)` |
| `description` | `J: Deskripsi Temuan` | Text | Penjelasan bahaya yang ditemukan |
| `immediate_action` | `K: Tindakan Langsung` | Text | Perbaikan sementara yang sudah dilakukan saat itu juga |
| `photo_before_url` | `L: Link Foto Temuan` | URL / String | URL gambar di Google Drive / Server |
| `status` | `M: Status Perbaikan` | Enum | `OPEN`, `IN_PROGRESS`, `CLOSED` (Default: `OPEN`) |
| `pic_department` | `N: PIC Tindak Lanjut` | String | Departemen penanggung jawab perbaikan |
| `closed_date` | `O: Tanggal Closed` | Date | Diisi saat status berubah menjadi `CLOSED` |
| `photo_after_url` | `P: Link Foto Perbaikan`| URL / String | Bukti foto setelah diperbaiki |

---

## 4. Rancangan Modul 2: Pelaporan SHE Weekly & Monthly (Excel ke PPT)

Klien membutuhkan pemisahan yang tegas antara penginputan dan pelaporan **Weekly (Mingguan)** dan **Monthly (Bulanan)**, serta belum memiliki template. Berikut adalah rancangan standar industri pertambangan batu bara Indonesia (mengacu pada kaidah SMKP Minerba).

### 4.1. Perbedaan Struktur Laporan Weekly vs Monthly

| Aspek | Laporan Weekly (Mingguan) | Laporan Monthly (Bulanan) |
| :--- | :--- | :--- |
| **Fokus Utama** | Operasional taktis mingguan, *closing rate* Hazard Report minggu berjalan, evaluasi cepat area kritis (Pit & Hauling). | Evaluasi strategis bulanan & *Year-to-Date* (YTD), jam kerja selamat (*Safe Man Hours*), nilai rasio kecelakaan ($LTIFR$, $TRIFR$, $SR$), kepatuhan lingkungan & kesehatan kerja. |
| **File Excel** | `Template_SHE_Weekly.xlsx` | `Template_SHE_Monthly.xlsx` |
| **File Output PPT** | `Presentasi_SHE_Weekly.pptx` (5-7 Slide) | `Presentasi_SHE_Monthly.pptx` (10-14 Slide) |

### 4.2. Rumus KPI & Persentase Otomatis di Excel
Rumus berikut ditanam langsung di dalam sheet Excel sehingga klien hanya perlu menginput angka mentah (*raw data*):

1. **Persentase Penyelesaian Hazard Report (*Hazard Closing Rate*)**:
   $$\text{Hazard Closed (\%)} = \left( \frac{\text{Jumlah Hazard CLOSED}}{\text{Total Hazard Masuk}} \right) \times 100\%$$

2. **Pencapaian Program SAP (Safety Accountability Program)**:
   *(Meliputi target Inspeksi, Observasi Tugas Terencana / PTO, dan Safety Talk / P5M)*
   $$\text{Pencapaian SAP (\%)} = \left( \frac{\text{Aktual Pelaksanaan}}{\text{Target Mingguan atau Bulanan}} \right) \times 100\%$$

3. **Lost Time Injury Frequency Rate ($\text{LTIFR}$)** *(Khusus Monthly)*:
   $$\text{LTIFR} = \frac{\text{Jumlah Kasus LTI} \times 10^6}{\text{Total Jam Kerja Selamat (Man Hours)}}$$

4. **Severity Rate ($\text{SR}$)** *(Khusus Monthly)*:
   $$\text{SR} = \frac{\text{Jumlah Hari Kerja Hilang} \times 10^6}{\text{Total Jam Kerja Selamat (Man Hours)}}$$

5. **Total Recordable Injury Frequency Rate ($\text{TRIFR}$)** *(Khusus Monthly)*:
   $$\text{TRIFR} = \frac{(\text{LTI} + \text{RWI} + \text{MTC}) \times 10^6}{\text{Total Jam Kerja Selamat (Man Hours)}}$$

### 4.3. Mekanisme Koneksi Excel ke PowerPoint (Dual-Approach)

Sistem menyediakan **dua metode koneksi** agar klien memiliki fleksibilitas penuh:

#### Metode 1: Automated PPT Generator Engine (Via Backend Python `python-pptx`)
* Di dalam file `Template_SHE_Weekly.pptx` dan `Template_SHE_Monthly.pptx`, setiap kotak teks dan tabel diberi *tag placeholder* unik, misalnya:
  * `{{PERIODE_LAPORAN}}`
  * `{{TOTAL_HAZARD}}`, `{{HAZARD_OPEN}}`, `{{HAZARD_CLOSED_PCT}}`
  * `{{INSPEKSI_PCT}}`, `{{PTO_PCT}}`, `{{SAFETY_TALK_PCT}}`
  * `{{SAFE_MAN_HOURS}}`, `{{LTI_COUNT}}`, `{{LTIFR_VALUE}}`
* Backend membaca sel spesifik di tab `SUMMARY_PPT` pada file Excel menggunakan `openpyxl` (`data_only=True` untuk mengambil hasil rumus), lalu mengganti seluruh *tag placeholder* dan memperbarui grafik (*chart data*) di dalam PowerPoint secara terprogram tanpa merusak desain atau font slide.

#### Metode 2: Native Microsoft Office OLE Linking (Tanpa Server / Offline)
* Di dalam workbook Excel, disediakan satu sheet khusus bernama `SLIDE_READY` yang sudah ditata tabel dan grafiknya.
* Tabel/grafik di-tautkan ke PowerPoint menggunakan fitur bawaan `Paste Special -> Paste Link`. Saat file Excel diperbarui, pengguna cukup membuka PowerPoint dan menekan `Update Links`.

---

## 5. Rancangan Struktur Direktori & Backend (Untuk Eksekusi Antigravity)

Berikut adalah struktur proyek yang harus dibangun oleh Antigravity Agent:

```text
she-mining-system/
├── README.md
├── requirements.txt                  # fastapi, uvicorn, openpyxl, python-pptx, gspread, python-multipart, pillow
├── .env.example                      # Konfigurasi Google Sheet ID, Service Account path, Storage
├── backend/
│   ├── main.py                       # Entry point FastAPI + static file serving untuk PWA
│   ├── config.py                     # Konfigurasi environment
│   ├── services/
│   │   ├── excel_service.py          # Fungsi baca/tulis Hazard ke Excel & inisialisasi template
│   │   ├── gsheet_service.py         # Integrasi opsional ke Google Sheets & Google Drive API
│   │   └── ppt_generator.py          # Engine pengubah data Excel Weekly/Monthly menjadi file .pptx
│   └── templates_generator/
│       └── build_initial_templates.py # Script untuk men-generate file .xlsx dan .pptx master secara otomatis
├── storage/
│   ├── uploads/                      # Penyimpanan foto bukti hazard
│   ├── templates/                    # Lokasi file master Template_Weekly/Monthly (.xlsx & .pptx)
│   └── generated/                    # Output laporan PPT yang siap diunduh
└── frontend/
    ├── index.html                    # Halaman Utama: Form Hazard Report (Mobile-First)
    ├── admin.html                    # Halaman Admin SHE: Tabel Hazard, Export Excel, & Upload Excel-to-PPT
    ├── manifest.json                 # Konfigurasi PWA
    └── assets/
        ├── app.js                    # Logika kompresi gambar, submit form, & fetch API
        └── styles.css                # Styling tambahan di atas Tailwind CSS
```

---

## 6. Spesifikasi Endpoint API Backend (`FastAPI`)

### 6.1. Endpoint Modul 1: Hazard Report
* **`POST /api/v1/hazards`**
  * **Input**: `Multipart/form-data` (semua field hazard + file gambar `photo_before`).
  * **Proses**:
    1. Validasi input dan simpan gambar terkompresi ke `/storage/uploads/`.
    2. Tambahkan baris baru ke file `Master_Hazard_Database.xlsx` (dan/atau kirim ke Google Sheets jika kredensial aktif).
  * **Output**: `201 Created` beserta `ticket_id` dan ringkasan data.

* **`GET /api/v1/hazards`**
  * **Output**: Daftar laporan hazard terbaru beserta statistik cepat (Total, Open, Closed, Persentase Closed).

* **`PATCH /api/v1/hazards/{ticket_id}/status`**
  * **Input**: Status baru (`IN_PROGRESS` / `CLOSED`) + foto perbaikan (`photo_after`).
  * **Proses**: Mengubah status di baris Excel/Google Sheets yang sesuai.

* **`GET /api/v1/hazards/export`**
  * **Output**: Mengunduh file `Master_Hazard_Database.xlsx` terbaru.

### 6.2. Endpoint Modul 2: Excel to PPT Reporting
* **`GET /api/v1/templates/{report_type}`**
  * **Parameter**: `report_type` bernilai `weekly` atau `monthly`.
  * **Output**: Mengunduh template Excel kosong (`Template_SHE_Weekly.xlsx` atau `Template_SHE_Monthly.xlsx`) yang sudah dilengkapi rumus persentase otomatis.

* **`POST /api/v1/reports/generate-ppt`**
  * **Input**: `report_type` (`weekly` / `monthly`) + File Excel yang sudah diisi oleh klien.
  * **Proses**:
    1. `openpyxl` membaca sheet `INPUT_DATA` dan `SUMMARY_KPI`.
    2. `python-pptx` membuka template slide master yang sesuai.
    3. Mengganti seluruh teks placeholder persentase, angka Leading/Lagging Indicator, dan tabel ringkasan hazard per lokasi tambang.
  * **Output**: File `.pptx` langsung terunduh ke perangkat klien (`FileResponse`).

---

## 7. Rencana Kerja Agent (Tasks untuk Antigravity)

Saat dokumen ini dijalankan di **Google Antigravity**, ikuti tahapan kerja berikut secara berurutan:

- [ ] **Task 1 (Analisis & Validasi Arsitektur)**: Tinjau rancangan di atas dan berikan rekomendasi perbaikan jika ada *edge-case* yang terlewat.
- [ ] **Task 2 (Generator Template Otomatis)**: Buat dan jalankan script Python `build_initial_templates.py` yang menggunakan `openpyxl` dan `python-pptx` untuk menciptakan file fisik:
  - `Template_SHE_Weekly.xlsx` & `Template_SHE_Monthly.xlsx` (lengkap dengan tabel terformat, *dropdown validation*, dan rumus persentase).
  - `Template_SHE_Weekly.pptx` & `Template_SHE_Monthly.pptx` (lengkap dengan slide judul, slide Leading Indicators, slide Lagging Indicators, dan slide Distribusi Hazard dengan *placeholder tags*).
- [ ] **Task 3 (Backend API & Engine)**: Bangun aplikasi `FastAPI` yang mengimplementasikan seluruh endpoint penyimpanan Hazard ke Excel dan konversi Excel ke PowerPoint.
- [ ] **Task 4 (Frontend Mobile & Dashboard Admin)**: Bangun UI `index.html` (Form Pelaporan HP untuk karyawan tambang dengan kompresi gambar otomatis) dan `admin.html` (Dashboard konversi Excel ke PPT & manajemen status Hazard).
- [ ] **Task 5 (Pengujian End-to-End)**: Jalankan pengujian otomatis di dalam *sandbox* untuk memastikan pengiriman laporan menulis ke Excel dengan benar dan proses *generate* PPT menghasilkan slide dengan persentase yang akurat.