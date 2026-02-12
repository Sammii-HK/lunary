import { describe, it, expect } from '@jest/globals';
import { getUserSigns, signToSpaceSlug } from '@/lib/community/get-user-signs';

describe('getUserSigns', () => {
  it('extracts rising, sun, and moon signs from birth chart', () => {
    const birthChart = [
      { body: 'Sun', sign: 'Aries', degree: 15 },
      { body: 'Moon', sign: 'Cancer', degree: 10 },
      { body: 'Ascendant', sign: 'Leo', degree: 5 },
    ];

    const result = getUserSigns(birthChart);
    expect(result.risingSign).toBe('Leo');
    expect(result.sunSign).toBe('Aries');
    expect(result.moonSign).toBe('Cancer');
  });

  it('handles "Rising" body name as alias for Ascendant', () => {
    const birthChart = [
      { body: 'Rising', sign: 'Scorpio', degree: 20 },
      { body: 'Sun', sign: 'Pisces', degree: 8 },
    ];

    const result = getUserSigns(birthChart);
    expect(result.risingSign).toBe('Scorpio');
    expect(result.sunSign).toBe('Pisces');
  });

  it('returns null for missing entries', () => {
    const birthChart = [{ body: 'Moon', sign: 'Cancer', degree: 10 }];

    const result = getUserSigns(birthChart);
    expect(result.risingSign).toBeNull();
    expect(result.sunSign).toBeNull();
  });

  it('returns null for null input', () => {
    expect(getUserSigns(null)).toEqual({
      risingSign: null,
      sunSign: null,
      moonSign: null,
    });
  });

  it('returns null for undefined input', () => {
    expect(getUserSigns(undefined)).toEqual({
      risingSign: null,
      sunSign: null,
      moonSign: null,
    });
  });

  it('returns null for non-array input', () => {
    expect(getUserSigns('not an array' as any)).toEqual({
      risingSign: null,
      sunSign: null,
      moonSign: null,
    });
  });

  it('skips entries without body or sign', () => {
    const birthChart = [
      { body: 'Sun' } as any,
      { sign: 'Leo' } as any,
      { body: 'Ascendant', sign: 'Virgo' },
    ];

    const result = getUserSigns(birthChart);
    expect(result.risingSign).toBe('Virgo');
    expect(result.sunSign).toBeNull();
  });

  it('is case-insensitive for body names', () => {
    const birthChart = [
      { body: 'SUN', sign: 'Taurus', degree: 12 },
      { body: 'ascendant', sign: 'Gemini', degree: 3 },
    ];

    const result = getUserSigns(birthChart);
    expect(result.sunSign).toBe('Taurus');
    expect(result.risingSign).toBe('Gemini');
  });
});

describe('signToSpaceSlug', () => {
  it('defaults to -rising suffix', () => {
    expect(signToSpaceSlug('Aries')).toBe('aries-rising');
    expect(signToSpaceSlug('Leo')).toBe('leo-rising');
  });

  it('supports sun and moon placements', () => {
    expect(signToSpaceSlug('Aries', 'sun')).toBe('aries-sun');
    expect(signToSpaceSlug('Cancer', 'moon')).toBe('cancer-moon');
  });

  it('handles already lowercase input', () => {
    expect(signToSpaceSlug('pisces')).toBe('pisces-rising');
  });
});
