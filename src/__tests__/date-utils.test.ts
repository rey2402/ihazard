import { describe, it, expect } from 'vitest';
import {
  getWeekOfMonth,
  formatWeeklyPeriod,
  formatMonthlyPeriod,
  parseMonthlyPeriod,
  INDONESIAN_MONTHS,
} from '../utils/date-utils';

describe('Date Utils: Auto Weekly Period Detection', () => {
  it('detects week 1 for days 1 to 7', () => {
    expect(getWeekOfMonth(new Date(2026, 9, 1))).toBe(1); // 1 Okt 2026
    expect(getWeekOfMonth(new Date(2026, 9, 7))).toBe(1); // 7 Okt 2026
  });

  it('detects week 2 for days 8 to 14', () => {
    expect(getWeekOfMonth(new Date(2026, 9, 8))).toBe(2);
    expect(getWeekOfMonth(new Date(2026, 9, 14))).toBe(2);
  });

  it('detects week 3 for days 15 to 21', () => {
    expect(getWeekOfMonth(new Date(2026, 9, 15))).toBe(3);
    expect(getWeekOfMonth(new Date(2026, 9, 21))).toBe(3);
  });

  it('detects week 4 for days 22 to 28', () => {
    expect(getWeekOfMonth(new Date(2026, 9, 22))).toBe(4);
    expect(getWeekOfMonth(new Date(2026, 9, 27))).toBe(4); // 27 Okt 2026 (hari ini)
    expect(getWeekOfMonth(new Date(2026, 9, 28))).toBe(4);
  });

  it('detects week 5 for days 29 to 31', () => {
    expect(getWeekOfMonth(new Date(2026, 9, 29))).toBe(5);
    expect(getWeekOfMonth(new Date(2026, 9, 31))).toBe(5);
  });

  it('formats weekly period correctly into Indonesian mining standard', () => {
    const d = new Date(2026, 9, 27); // 27 Okt 2026
    expect(formatWeeklyPeriod(4, d)).toBe('Minggu 4 - Oktober 2026');

    const dNov = new Date(2026, 10, 5); // 5 Nov 2026
    expect(formatWeeklyPeriod(1, dNov)).toBe('Minggu 1 - November 2026');
  });

  it('contains all 12 Indonesian month names', () => {
    expect(INDONESIAN_MONTHS).toHaveLength(12);
    expect(INDONESIAN_MONTHS[0]).toBe('Januari');
    expect(INDONESIAN_MONTHS[9]).toBe('Oktober');
    expect(INDONESIAN_MONTHS[11]).toBe('Desember');
  });

  it('formats monthly period correctly into Indonesian mining standard', () => {
    expect(formatMonthlyPeriod(9, 2026)).toBe('Oktober 2026');
    expect(formatMonthlyPeriod(0, 2027)).toBe('Januari 2027');
    expect(formatMonthlyPeriod(11, 2025)).toBe('Desember 2025');
  });

  it('parses monthly period string back into monthIndex and year', () => {
    expect(parseMonthlyPeriod('Oktober 2026')).toEqual({ monthIndex: 9, year: 2026 });
    expect(parseMonthlyPeriod('Januari 2027')).toEqual({ monthIndex: 0, year: 2027 });
    expect(parseMonthlyPeriod('desember 2025')).toEqual({ monthIndex: 11, year: 2025 });
  });
});
