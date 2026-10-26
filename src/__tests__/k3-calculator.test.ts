import { describe, it, expect } from 'vitest';
import { calculateLTIFR, calculateTRIFR, generateTicketId } from '../utils/k3-calculator';

describe('K3 Mining Calculator', () => {
  it('calculates LTIFR correctly per 1,000,000 safe man hours', () => {
    // 2 LTI cases in 500,000 man hours -> (2 * 1,000,000) / 500,000 = 4.0
    expect(calculateLTIFR(2, 500000)).toBe(4.0);
  });

  it('handles zero man hours safely without division by zero', () => {
    expect(calculateLTIFR(1, 0)).toBe(0);
    expect(calculateTRIFR(1, 0)).toBe(0);
  });

  it('calculates TRIFR correctly', () => {
    // 5 total recordable cases in 1,000,000 man hours -> 5.0
    expect(calculateTRIFR(5, 1000000)).toBe(5.0);
  });

  it('generates ticket ID with prefix HZD and date stamp', () => {
    const id = generateTicketId();
    expect(id).toMatch(/^HZD-\d{8}-[A-Z0-9]{4}$/);
  });
});
