import { describe, it, expect } from 'vitest';
import { sanitizeCell } from './sheets-sanitize';

describe('sanitizeCell', () => {
  it('leaves ordinary text unchanged', () => {
    expect(sanitizeCell('Saya ingin konsultasi dana pendidikan')).toBe(
      'Saya ingin konsultasi dana pendidikan',
    );
    expect(sanitizeCell('budi@example.com')).toBe('budi@example.com');
    expect(sanitizeCell('')).toBe('');
  });

  it('neutralizes leading formula triggers', () => {
    expect(sanitizeCell('=HYPERLINK("http://evil")')).toBe("'=HYPERLINK(\"http://evil\")");
    expect(sanitizeCell('+1+1')).toBe("'+1+1");
    expect(sanitizeCell('-2+3')).toBe("'-2+3");
    expect(sanitizeCell('@SUM(A1)')).toBe("'@SUM(A1)");
  });

  it('neutralizes leading control characters used to bypass naive filters', () => {
    expect(sanitizeCell('\t=cmd')).toBe("'\t=cmd");
    expect(sanitizeCell('\r=cmd')).toBe("'\r=cmd");
  });

  it('only guards the first character, not internal symbols', () => {
    expect(sanitizeCell('a=b')).toBe('a=b');
    expect(sanitizeCell('Rp 1-2 juta')).toBe('Rp 1-2 juta');
  });
});
