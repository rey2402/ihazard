/**
 * Utility keamanan untuk mencegah Formula Injection / CSV Injection (CWE-1236)
 * pada Google Sheets dan Microsoft Excel.
 */
export function sanitizeFormula(value: string | undefined | null): string {
  if (!value) return '';
  const trimmed = value.trimStart();
  const firstChar = trimmed.charAt(0);
  if (firstChar === '=' || firstChar === '+' || firstChar === '-' || firstChar === '@') {
    return `'${value}`;
  }
  return value;
}
