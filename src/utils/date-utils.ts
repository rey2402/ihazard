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

/**
 * Menghasilkan string periode bulanan: "Bulan Tahun" (contoh: "Oktober 2026")
 */
export function formatMonthlyPeriod(monthIndex: number, year: number): string {
  const monthName = INDONESIAN_MONTHS[monthIndex] || INDONESIAN_MONTHS[0];
  return `${monthName} ${year}`;
}

/**
 * Parsing string periode bulanan ("Oktober 2026") menjadi { monthIndex, year }
 */
export function parseMonthlyPeriod(period: string): { monthIndex: number; year: number } {
  const parts = period.trim().split(/\s+/);
  if (parts.length >= 2) {
    const monthName = parts[0];
    const yearNum = parseInt(parts[1], 10);
    const mIdx = INDONESIAN_MONTHS.findIndex(
      (m) => m.toLowerCase() === monthName.toLowerCase()
    );
    if (mIdx !== -1 && !isNaN(yearNum)) {
      return { monthIndex: mIdx, year: yearNum };
    }
  }
  const now = new Date();
  return { monthIndex: now.getMonth(), year: now.getFullYear() };
}

/**
 * Format string "YYYY-MM" menjadi "Bulan Tahun" (contoh: "2026-10" -> "Oktober 2026")
 */
export function formatYearMonth(yearMonthStr: string): string {
  if (!yearMonthStr) return '';
  const [yearStr, monthStr] = yearMonthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return yearMonthStr;
  }
  return `${INDONESIAN_MONTHS[month - 1]} ${year}`;
}

/**
 * Menghasilkan rentang tanggal untuk pekan ke-1 s/d ke-5 dalam bulan tertentu.
 * Contoh: Pekan 1 = "1 - 7 Oktober 2026"
 */
export function getWeekDateRange(weekNum: number, monthIndex: number, year: number): string {
  const monthName = INDONESIAN_MONTHS[monthIndex] || INDONESIAN_MONTHS[0];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  let startDay = (weekNum - 1) * 7 + 1;
  let endDay = Math.min(weekNum * 7, daysInMonth);

  if (weekNum === 5) {
    startDay = 29;
    endDay = daysInMonth;
  }

  return `${startDay} - ${endDay} ${monthName} ${year}`;
}

