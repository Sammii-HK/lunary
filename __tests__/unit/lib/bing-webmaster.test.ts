import { parseBingApiDate } from '@/lib/bing/webmaster';

describe('Bing Webmaster API helpers', () => {
  it('parses Microsoft JSON date strings', () => {
    expect(parseBingApiDate('/Date(1316156400000-0700)/')).toBe('2011-09-16');
  });

  it('parses ISO date strings', () => {
    expect(parseBingApiDate('2026-05-15T00:00:00-07:00')).toBe('2026-05-15');
  });

  it('returns an empty string for invalid dates', () => {
    expect(parseBingApiDate('not-a-date')).toBe('');
  });
});
