# Panduan Optimasi Backend Google Drive, Bukti Perbaikan (Before & After), dan Keamanan iHazard

Dokumen ini memuat panduan lengkap mengenai 3 pilar peningkatan terbaru pada aplikasi **iHazard**:

---

## 1. Optimasi Backend & Penyimpanan (Google Apps Script + Google Drive)

### Mengapa Menggunakan Google Drive?
Sebelumnya, foto bukti temuan dikirim sebagai Base64 teks panjang. Jika disimpan langsung ke dalam sel Google Sheets, foto tersebut berisiko terpotong karena batas maksimal 1 sel Google Sheets adalah 50.000 karakter.

Dengan script baru:
1. **Pemisahan Penyimpanan:** Foto Base64 otomatis diekstrak oleh Google Apps Script menjadi file gambar asli `.jpg` dan disimpan ke dalam folder khusus bernama **`iHazard_Evidence_Drive`** di Google Drive pemilik script.
2. **Sheet Tetap Ringan & Cepat:** Sel Google Sheets hanya menyimpan link URL resmi Google Drive.
3. **Mendukung 2 Foto:** Menyimpan Foto Temuan Awal (**Before**) dan Foto Bukti Perbaikan (**After**).
4. **Logika UPSERT (Update or Insert):** Saat status tiket diubah menjadi *Closed* di Dashboard Admin, sistem akan memperbarui baris tiket yang sudah ada di spreadsheet tanpa membuat baris duplikat baru!
5. **Notifikasi Email Bahaya Tinggi (High Risk):** Jika ada laporan dengan risiko "Tinggi", Apps Script dapat otomatis mengirimkan email alert darurat ke tim SHE.

### Cara Memperbarui Script di Google Apps Script Klien:
1. Buka spreadsheet Google Sheets Anda.
2. Klik menu **Ekstensi** > **Apps Script**.
3. Hapus kode lama di file `Code.gs`, lalu ganti dengan seluruh isi file [google-apps-script/Code.gs](file:///c:/Users/user/Projects/hazard/google-apps-script/Code.gs).
4. *(Opsional)* Pada baris `var SHE_ALERT_EMAIL = '';`, Anda dapat memasukkan email pengawas SHE (misal: `she.site@perusahaan.com`) untuk menerima email darurat otomatis.
5. Klik icon **Simpan** (Floppy disk).
6. Klik **Terapkan (Deploy)** di pojok kanan atas > **Kelola Penerapan (Manage Deployments)**:
   - Klik icon pensil (Edit).
   - Pada kolom **Versi**, pilih **Versi Baru (New Version)**.
   - Akses: **Siapa saja (Anyone)**.
   - Klik **Terapkan (Deploy)**.

---

## 2. Foto Bukti Perbaikan (Before & After)

### Alur Kerja di Lapangan & Kantor:
1. **Pekerja:** Melaporkan bahaya dengan melampirkan foto temuan awal (**Before**).
2. **Pengawas / Admin SHE:**
   - Membuka menu **Dashboard SHE**.
   - Pada daftar laporan, klik tombol **"Selesaikan"** pada temuan yang siap ditutup.
   - Akan muncul jendela verifikasi khusus:
     - Menampilkan foto dan deskripsi temuan awal (**Sebelum / Before**).
     - Mengunggah foto bukti hasil perbaikan (**Sesudah / After**) menggunakan kamera HP atau galeri (otomatis dikompresi ringan < 300KB).
     - Mengisi catatan tindakan perbaikan yang telah dilakukan.
     - Mengisi nama verifikator SHE.
     - Klik **"Simpan & Verifikasi Selesai (Closed)"**.
3. **Pekerja & Tim:**
   - Pada menu **"Status Laporan" (Worker Tracker)**, pekerja dapat melihat bukti penyelesaian dengan menekan tombol **"Lihat Bukti Selesai (Before & After)"**.

---

## 3. Keamanan Website (Website Security)

Aplikasi iHazard kini telah diperkuat dengan standar keamanan web enterprise:

| Komponen Keamanan | Implementasi di iHazard | Manfaat untuk Klien |
| :--- | :--- | :--- |
| **HTTP Security Headers** | Dikonfigurasi di `vercel.json` (`Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Permissions-Policy`) | Mencegah serangan Clickjacking, MIME confusion, sniffing data, dan serangan man-in-the-middle. |
| **Brute-Force Rate Limiting** | Batas maksimal 5 kali percobaan PIN salah berturut-turut. | Jika ada pihak mencoba menebak PIN admin secara berulang, sistem otomatis mengunci akses selama 3 menit. |
| **PIN yang Dapat Disesuaikan** | Mendukung custom PIN melalui `localStorage.setItem('SHE_CUSTOM_ADMIN_PIN', '...')` atau environment variable `VITE_ADMIN_PIN`. | Klien tidak terikat dengan PIN demo '1234' dan dapat menggantinya sesuai protokol keamanan site. |
| **Session Inactivity Timeout** | Sistem otomatis mendeteksi idle/tidak ada aktivitas selama 30 menit pada mode Admin. | Jika tablet atau komputer kantor ditinggal terbuka oleh staf, sistem otomatis keluar (logout) kembali ke tampilan pekerja demi mencegah manipulasi data oleh pihak tak berwenang. |
| **Sanitasi File Gambar** | Validasi MIME type dan kompresi kanvas di sisi klien (`image-compressor.ts`). | Mencegah file executable berbahaya disamarkan sebagai gambar. |
