import { formatIsoDateOnly, parseIsoDateOnly } from '@/lib/date-only';

describe('date-only helpers', () => {
  it('parses ISO dates without shifting local components', () => {
    const date = parseIsoDateOnly('1990-05-15');
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(1990);
    expect(date?.getMonth()).toBe(4);
    expect(date?.getDate()).toBe(15);
  });

  it('rejects invalid ISO dates', () => {
    expect(parseIsoDateOnly('1990-02-30')).toBeNull();
  });

  it('formats ISO dates using the provided locale', () => {
    const expected = new Intl.DateTimeFormat('en-US').format(
      new Date(1990, 4, 15),
    );
    expect(formatIsoDateOnly('1990-05-15', 'en-US')).toBe(expected);
  });

  it('falls back to the input when formatting invalid dates', () => {
    expect(formatIsoDateOnly('not-a-date', 'en-US')).toBe('not-a-date');
  });
});
