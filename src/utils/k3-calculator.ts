/**
 * Utilitas dan kalkulator metrik keselamatan pertambangan (K3LH / SHE)
 * Rumus standar Kepmen ESDM / OSHA:
 * LTIFR = (Jumlah Kasus LTI * 1.000.000) / Total Jam Kerja
 * TRIFR = (Total Kasus Kecelakaan Tercatat * 1.000.000) / Total Jam Kerja
 */

export function calculateLTIFR(ltiCount: number, manHours: number): number {
  if (manHours <= 0) return 0;
  return Number(((ltiCount * 1_000_000) / manHours).toFixed(2));
}

export function calculateTRIFR(totalRecordable: number, manHours: number): number {
  if (manHours <= 0) return 0;
  return Number(((totalRecordable * 1_000_000) / manHours).toFixed(2));
}

export function generateTicketId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HZD-${dateStr}-${randomSuffix}`;
}
