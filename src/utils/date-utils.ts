/**
 * Utility tanggal untuk kalkulasi periode pelaporan K3 / SHE tambang.
 */

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Menghitung minggu ke-1 s/d ke-5 dalam satu bulan kalender
 * berdasarkan tanggal hari.
 * Rumus standar kalender operasional: Math.ceil(day / 7)
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
