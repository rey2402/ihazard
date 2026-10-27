# Design Specification: Auto Weekly Period Detection and Smart Period Picker

## 1. Overview & Goals
Pada formulir Laporan Keselamatan Mingguan (`WeeklyEntryForm.tsx`), kolom **Periode Minggu** sebelumnya berupa input teks bebas (`<input type="text" />`) yang mengharuskan pengguna mengetik secara manual (misal: "Minggu 3 Oktober 2026"), rawan salah ketik, dan memakan waktu.

**Tujuan Desain:**
1. Mengubah input periode minggu menjadi pilihan terstruktur (*dropdown*) yang otomatis mendeteksi minggu ke berapa berdasarkan **Tanggal Laporan**.
2. Menyinkronkan bulan dan tahun secara dinamis saat tanggal laporan diubah.
3. Memberikan fleksibilitas bagi petugas K3 jika ingin memilih minggu yang berbeda secara manual melalui dropdown.
4. Menjaga kompatibilitas format penyimpanan data (`Minggu X - Bulan Tahun`) agar sinkron dengan database, export Excel, dan generator slide PPT (`pptx-engine.ts`).

---

## 2. Architecture & Algoritma Perhitungan

### 2.1 Utility Perhitungan Minggu (`src/utils/date-utils.ts`)
Fungsi cerdas untuk menghitung nomor minggu dalam bulan dan memformat nama bulan dalam Bahasa Indonesia standar K3:

```typescript
export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Menghitung minggu ke-1 s/d ke-5 dalam satu bulan berdasarkan tanggal hari
 * Rumus standar kalender operasional tambang: Math.ceil(day / 7)
 */
export function getWeekOfMonth(date: Date): number {
  const day = date.getDate();
  return Math.min(5, Math.max(1, Math.ceil(day / 7)));
}

/**
 * Menghasilkan string periode terformat: "Minggu X - Bulan Tahun"
 */
export function formatWeeklyPeriod(weekNumber: number, date: Date): string {
  const monthName = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `Minggu ${weekNumber} - ${monthName} ${year}`;
}
```

---

## 3. Komponen & Alur Pengguna (UI/UX)

### 3.1 Perubahan pada `WeeklyEntryForm.tsx`
- **State Tambahan:**
  - `selectedWeek`: number (`1 | 2 | 3 | 4 | 5`)
  - `isManualOverride`: boolean (menandakan apakah pengguna sengaja memilih minggu berbeda dari tanggal laporan)
- **Saat Pengguna Mengubah Tanggal Laporan (`createdDate`):**
  - Menguraikan tanggal menjadi objek `Date`.
  - Jika belum di-override secara manual (atau saat inisialisasi awal), otomatis menghitung:
    `const autoWeek = getWeekOfMonth(dateObj);`
    `setSelectedWeek(autoWeek);`
  - Menyusun string periode: `formatWeeklyPeriod(autoWeek, dateObj)`.
  - Mengupdate `periodWeek`.
- **Tampilan Antarmuka Section 1:**
  - **Kiri (Periode Minggu):**
    - Dropdown `<select>` berisi:
      - `Minggu 1`
      - `Minggu 2`
      - `Minggu 3`
      - `Minggu 4`
      - `Minggu 5`
    - Label bulan & tahun otomatis di samping dropdown: misal `Oktober 2026`.
    - Indikator badge halus:
      - `Otomatis` jika mengikuti tanggal laporan.
      - `Kustom` jika pengguna sengaja memilih minggu lain.
  - **Kanan (Tanggal Laporan):**
    - Date picker input `<input type="date" />`.
    - Setiap kali tanggal dipilih/diubah, bulan dan minggu otomatis menyesuaikan secara instan.

---

## 4. Kompatibilitas Data & Testing

1. **Format Output:**
   - String `periodWeek` yang dikirim ke `WeeklySHEReport` tetap bertipe `string` dengan format:
     `Minggu 4 - Oktober 2026`
   - Tidak ada perubahan schema database Google Sheets maupun type definition TypeScript.
2. **Pengujian:**
   - Unit test untuk `date-utils.ts` menguji:
     - Tanggal 1 s/d 7 -> Minggu 1
     - Tanggal 8 s/d 14 -> Minggu 2
     - Tanggal 15 s/d 21 -> Minggu 3
     - Tanggal 22 s/d 28 -> Minggu 4
     - Tanggal 29 s/d 31 -> Minggu 5
     - Format string bahasa Indonesia.
   - Component test pada `WeeklyEntryForm.tsx` menguji bahwa memilih tanggal otomatis mengganti minggu dan bulan pada formulir.
