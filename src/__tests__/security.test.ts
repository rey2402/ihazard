import { describe, it, expect } from 'vitest';
import { sanitizeFormula } from '../utils/security';

describe('Security Utility: Formula Injection Prevention', () => {
  it('prepends single quote to strings starting with formula trigger characters (=, +, -, @)', () => {
    expect(sanitizeFormula('=1+1')).toBe("'=1+1");
    expect(sanitizeFormula('+SUM(A1:A10)')).toBe("'+SUM(A1:A10)");
    expect(sanitizeFormula('-100')).toBe("'-100");
    expect(sanitizeFormula('@HYPERLINK("http://evil.com")')).toBe("'@HYPERLINK(\"http://evil.com\")");
  });

  it('leaves safe strings unmodified', () => {
    expect(sanitizeFormula('Normal hazard description')).toBe('Normal hazard description');
    expect(sanitizeFormula('Pit North 12')).toBe('Pit North 12');
    expect(sanitizeFormula('')).toBe('');
    expect(sanitizeFormula(null)).toBe('');
    expect(sanitizeFormula(undefined)).toBe('');
  });

  it('handles strings with leading whitespace before formula characters', () => {
    expect(sanitizeFormula('   =CMD()')).toBe("'   =CMD()");
  });
});
