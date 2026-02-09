import { __test__ } from 'utils/astrology/birthChart';

const { toUtcFromTimeZone } = __test__;

describe('birth chart timezone conversion', () => {
  // --- US Timezones ---

  it('converts EST (Eastern Standard, UTC-5) to UTC correctly', () => {
    // January = no DST, EST = UTC-5
    const date = toUtcFromTimeZone(1990, 1, 15, 14, 30, 'America/New_York');
    expect(date.toISOString()).toBe('1990-01-15T19:30:00.000Z');
  });

  it('converts EDT (Eastern Daylight, UTC-4) to UTC correctly', () => {
    // May = DST, EDT = UTC-4
    const date = toUtcFromTimeZone(1990, 5, 15, 14, 30, 'America/New_York');
    expect(date.toISOString()).toBe('1990-05-15T18:30:00.000Z');
  });

  it('converts CST (Central Standard, UTC-6) to UTC correctly', () => {
    const date = toUtcFromTimeZone(1985, 12, 25, 8, 0, 'America/Chicago');
    expect(date.toISOString()).toBe('1985-12-25T14:00:00.000Z');
  });

  it('converts MST (Mountain Standard, UTC-7) to UTC correctly', () => {
    const date = toUtcFromTimeZone(2000, 2, 1, 6, 45, 'America/Denver');
    expect(date.toISOString()).toBe('2000-02-01T13:45:00.000Z');
  });

  it('converts PST (Pacific Standard, UTC-8) to UTC correctly', () => {
    const date = toUtcFromTimeZone(1995, 11, 10, 23, 0, 'America/Los_Angeles');
    expect(date.toISOString()).toBe('1995-11-11T07:00:00.000Z');
  });

  it('converts PDT (Pacific Daylight, UTC-7) to UTC correctly', () => {
    const date = toUtcFromTimeZone(1995, 7, 10, 15, 0, 'America/Los_Angeles');
    expect(date.toISOString()).toBe('1995-07-10T22:00:00.000Z');
  });

  // --- DST Boundary Cases ---

  it('handles US spring forward correctly (2:30 AM EDT, March 2024)', () => {
    // 2024 US spring forward: March 10, 2:00 AM → 3:00 AM
    // 2:30 AM doesn't exist, but we should handle gracefully
    // Most implementations will produce 3:30 AM EDT = 7:30 AM UTC
    const date = toUtcFromTimeZone(2024, 3, 10, 2, 30, 'America/New_York');
    const hour = date.getUTCHours();
    // Should produce either 6:30 or 7:30 UTC (EST or EDT interpretation)
    expect([6, 7]).toContain(hour);
  });

  it('handles US fall back correctly (1:30 AM EST, November 2024)', () => {
    // 2024 US fall back: November 3, 2:00 AM → 1:00 AM
    // 1:30 AM is ambiguous but should still produce a valid UTC time
    const date = toUtcFromTimeZone(2024, 11, 3, 1, 30, 'America/New_York');
    const hour = date.getUTCHours();
    // Should produce either 5:30 or 6:30 UTC (EDT or EST interpretation)
    expect([5, 6]).toContain(hour);
  });

  // --- International Timezones ---

  it('converts IST (India Standard Time, UTC+5:30) correctly', () => {
    const date = toUtcFromTimeZone(1994, 3, 15, 10, 30, 'Asia/Kolkata');
    expect(date.toISOString()).toBe('1994-03-15T05:00:00.000Z');
  });

  it('converts ACST (Australian Central, UTC+9:30) correctly', () => {
    // July = winter in Australia, no DST = ACST = UTC+9:30
    const date = toUtcFromTimeZone(2000, 7, 1, 18, 0, 'Australia/Adelaide');
    expect(date.toISOString()).toBe('2000-07-01T08:30:00.000Z');
  });

  it('converts NZST (New Zealand Standard, UTC+12) correctly', () => {
    // July = winter in NZ, NZST = UTC+12
    const date = toUtcFromTimeZone(1988, 7, 20, 9, 15, 'Pacific/Auckland');
    expect(date.toISOString()).toBe('1988-07-19T21:15:00.000Z');
  });

  it('converts NZDT (New Zealand Daylight, UTC+13) correctly', () => {
    // January = summer in NZ, NZDT = UTC+13
    const date = toUtcFromTimeZone(1988, 1, 20, 9, 15, 'Pacific/Auckland');
    expect(date.toISOString()).toBe('1988-01-19T20:15:00.000Z');
  });

  it('converts GMT (London winter, UTC+0) correctly', () => {
    const date = toUtcFromTimeZone(1994, 1, 20, 1, 0, 'Europe/London');
    expect(date.toISOString()).toBe('1994-01-20T01:00:00.000Z');
  });

  it('converts BST (London summer, UTC+1) correctly', () => {
    const date = toUtcFromTimeZone(1994, 7, 20, 14, 0, 'Europe/London');
    expect(date.toISOString()).toBe('1994-07-20T13:00:00.000Z');
  });

  it('converts JST (Japan Standard, UTC+9, no DST) correctly', () => {
    const date = toUtcFromTimeZone(1975, 6, 15, 3, 30, 'Asia/Tokyo');
    expect(date.toISOString()).toBe('1975-06-14T18:30:00.000Z');
  });

  // --- Southern Hemisphere DST ---

  it('converts AEDT (Australia Eastern Daylight, UTC+11) correctly', () => {
    // January = summer in Australia, AEDT = UTC+11
    const date = toUtcFromTimeZone(2010, 1, 5, 22, 0, 'Australia/Sydney');
    expect(date.toISOString()).toBe('2010-01-05T11:00:00.000Z');
  });

  it('converts BRT (Brazil Standard, UTC-3) correctly', () => {
    const date = toUtcFromTimeZone(2005, 6, 12, 8, 0, 'America/Sao_Paulo');
    expect(date.toISOString()).toBe('2005-06-12T11:00:00.000Z');
  });

  // --- Edge Cases ---

  it('handles midnight (00:00) correctly', () => {
    const date = toUtcFromTimeZone(2000, 6, 15, 0, 0, 'America/New_York');
    expect(date.toISOString()).toBe('2000-06-15T04:00:00.000Z');
  });

  it('handles noon (12:00) correctly', () => {
    const date = toUtcFromTimeZone(2000, 6, 15, 12, 0, 'America/New_York');
    expect(date.toISOString()).toBe('2000-06-15T16:00:00.000Z');
  });

  it('handles 23:59 correctly (day boundary)', () => {
    const date = toUtcFromTimeZone(2000, 1, 1, 23, 59, 'America/New_York');
    expect(date.toISOString()).toBe('2000-01-02T04:59:00.000Z');
  });

  it('handles UTC timezone (offset 0)', () => {
    const date = toUtcFromTimeZone(2000, 6, 15, 14, 30, 'UTC');
    expect(date.toISOString()).toBe('2000-06-15T14:30:00.000Z');
  });
});
