import { sanitizeText, truncateText, wrapText } from '../utils/text';

describe('sanitizeText', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeText('')).toBe('');
    expect(sanitizeText(undefined as unknown as string)).toBe('');
  });

  it('preserves Unicode and emoji', () => {
    expect(sanitizeText('Привет 🚀 こんにちは')).toBe('Привет 🚀 こんにちは');
  });

  it('preserves common punctuation', () => {
    expect(sanitizeText("It's working: 100%! \"yes\" & no")).toBe(
      "It's working: 100%! \"yes\" & no"
    );
  });

  it('strips control characters', () => {
    expect(sanitizeText('hello\u0000world\u001Ffoo')).toBe('helloworldfoo');
  });
});

describe('truncateText', () => {
  it('keeps short strings as-is', () => {
    expect(truncateText('hi', 10)).toBe('hi');
  });

  it('truncates long strings with ellipsis', () => {
    expect(truncateText('abcdefghijklmnop', 10)).toBe('abcdefg...');
  });
});

describe('wrapText', () => {
  it('returns empty array for empty input', () => {
    expect(wrapText('', 100, 20)).toEqual([]);
  });

  it('returns at least one line for short text', () => {
    expect(wrapText('hi', 1000, 20).length).toBeGreaterThanOrEqual(1);
  });

  it('wraps long text into multiple lines', () => {
    const lines = wrapText(
      'this is a fairly long meme caption that should wrap at least once',
      120,
      30
    );
    expect(lines.length).toBeGreaterThan(1);
  });
});
