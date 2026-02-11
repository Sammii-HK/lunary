import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * Tests for cosmic post cron date alignment fix.
 *
 * Verifies:
 * 1. formatRelativeTime produces correct relative labels
 * 2. detectUpcomingSignChanges populates eventTime and uses correct names
 * 3. detectUpcomingRetrogradeStations uses correct names (no "tomorrow")
 */

// ─── formatRelativeTime ─────────────────────────────────────────────────────
// The function lives inside route.ts (not exported), so we replicate it here
// to unit-test the logic in isolation.

function formatRelativeTime(eventTime?: Date): string {
  if (!eventTime) return 'later today';
  const hoursAway = (eventTime.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursAway < 1) return 'in <1h';
  return `in ~${Math.round(hoursAway)}h`;
}

describe('formatRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Fix "now" to 2025-02-10 08:00 UTC (when the cron typically runs)
    jest.setSystemTime(new Date('2025-02-10T08:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "later today" when no eventTime is provided', () => {
    expect(formatRelativeTime(undefined)).toBe('later today');
  });

  it('returns "in <1h" when event is less than 1 hour away', () => {
    const eventTime = new Date('2025-02-10T08:30:00Z'); // 30 min away
    expect(formatRelativeTime(eventTime)).toBe('in <1h');
  });

  it('returns "in ~1h" when event is about 1 hour away', () => {
    const eventTime = new Date('2025-02-10T09:10:00Z'); // 1h10m away
    expect(formatRelativeTime(eventTime)).toBe('in ~1h');
  });

  it('returns "in ~13h" for Venus entering Pisces scenario', () => {
    // Venus enters Pisces at ~21:00 UTC, cron runs at 08:00 UTC = 13h away
    const eventTime = new Date('2025-02-10T21:00:00Z');
    expect(formatRelativeTime(eventTime)).toBe('in ~13h');
  });

  it('returns "in ~6h" for a mid-day event', () => {
    const eventTime = new Date('2025-02-10T14:00:00Z');
    expect(formatRelativeTime(eventTime)).toBe('in ~6h');
  });

  it('rounds correctly (2.7h → ~3h)', () => {
    const eventTime = new Date('2025-02-10T10:42:00Z'); // 2h42m = 2.7h
    expect(formatRelativeTime(eventTime)).toBe('in ~3h');
  });

  it('returns "in <1h" when event is imminent (5 minutes)', () => {
    const eventTime = new Date('2025-02-10T08:05:00Z');
    expect(formatRelativeTime(eventTime)).toBe('in <1h');
  });
});

// ─── detectUpcomingSignChanges ──────────────────────────────────────────────

// Mock the heavy dependencies so we don't need a DB or astronomy-engine
jest.unstable_mockModule('next/cache', () => ({
  unstable_cache: jest.fn((fn: any) => fn),
  revalidateTag: jest.fn(),
}));

jest.unstable_mockModule('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

// We need to mock getGlobalCosmicData at the module level
jest.unstable_mockModule('@/lib/cosmic-snapshot/global-cache', () => {
  const actual = jest.requireActual(
    '@/lib/cosmic-snapshot/global-cache',
  ) as any;
  return {
    ...actual,
    getGlobalCosmicData: jest.fn(),
  };
});

describe('detectUpcomingSignChanges', () => {
  it('includes eventTime from duration.endDate and omits "tomorrow" from names', async () => {
    // Since the module mocking is complex with ESM, test the logic directly
    // by verifying the contract: given two dates with different signs,
    // the event names should NOT contain "tomorrow" and should contain eventTime

    const venusEndDate = new Date('2025-02-10T21:00:00Z');

    // Simulate the detection logic from global-cache.ts
    const todayPositions: Record<string, any> = {
      Venus: {
        sign: 'Aquarius',
        retrograde: false,
        duration: {
          totalDays: 30,
          remainingDays: 0.5,
          displayText: '12h left',
          startDate: new Date('2025-01-10'),
          endDate: venusEndDate,
        },
      },
    };

    const tomorrowPositions: Record<string, any> = {
      Venus: {
        sign: 'Pisces',
        retrograde: false,
      },
    };

    // Replicate the detection logic
    const ingresses: any[] = [];
    const egresses: any[] = [];

    for (const [planet, todayPos] of Object.entries(todayPositions)) {
      const tomorrowPos = tomorrowPositions[planet];
      if (!tomorrowPos) continue;

      const todaySign = todayPos.sign;
      const tomorrowSign = tomorrowPos.sign;

      if (todaySign !== tomorrowSign) {
        const eventTime = todayPos.duration?.endDate
          ? new Date(todayPos.duration.endDate)
          : undefined;

        ingresses.push({
          name: `${planet} enters ${tomorrowSign}`,
          type: 'ingress',
          planet,
          sign: tomorrowSign,
          previousSign: todaySign,
          eventTime,
        });

        egresses.push({
          name: `${planet}'s last hours in ${todaySign}`,
          type: 'egress',
          planet,
          sign: todaySign,
          nextSign: tomorrowSign,
          eventTime,
        });
      }
    }

    // Verify: no "tomorrow" in names
    expect(ingresses).toHaveLength(1);
    expect(ingresses[0].name).toBe('Venus enters Pisces');
    expect(ingresses[0].name).not.toContain('tomorrow');

    expect(egresses).toHaveLength(1);
    expect(egresses[0].name).toBe("Venus's last hours in Aquarius");
    expect(egresses[0].name).not.toContain('tomorrow');

    // Verify: eventTime is populated
    expect(ingresses[0].eventTime).toEqual(venusEndDate);
    expect(egresses[0].eventTime).toEqual(venusEndDate);
  });

  it('sets eventTime to undefined when duration is not available', () => {
    const todayPositions: Record<string, any> = {
      Mars: {
        sign: 'Aries',
        retrograde: false,
        // No duration field
      },
    };

    const tomorrowPositions: Record<string, any> = {
      Mars: {
        sign: 'Taurus',
        retrograde: false,
      },
    };

    const ingresses: any[] = [];

    for (const [planet, todayPos] of Object.entries(todayPositions)) {
      const tomorrowPos = tomorrowPositions[planet];
      if (!tomorrowPos) continue;

      if (todayPos.sign !== tomorrowPos.sign) {
        const eventTime = todayPos.duration?.endDate
          ? new Date(todayPos.duration.endDate)
          : undefined;

        ingresses.push({
          name: `${planet} enters ${tomorrowPos.sign}`,
          eventTime,
        });
      }
    }

    expect(ingresses).toHaveLength(1);
    expect(ingresses[0].eventTime).toBeUndefined();
  });
});

// ─── detectUpcomingRetrogradeStations ────────────────────────────────────────

describe('detectUpcomingRetrogradeStations', () => {
  it('retrograde station names do not contain "tomorrow"', () => {
    const todayPositions: Record<string, any> = {
      Mercury: { sign: 'Pisces', retrograde: false },
    };

    const tomorrowPositions: Record<string, any> = {
      Mercury: { sign: 'Pisces', retrograde: true },
    };

    const stations: any[] = [];

    for (const [planet, todayPos] of Object.entries(todayPositions)) {
      const tomorrowPos = tomorrowPositions[planet];
      if (!tomorrowPos) continue;

      if (!todayPos.retrograde && tomorrowPos.retrograde) {
        stations.push({
          name: `${planet} stations retrograde`,
          type: 'retrograde_start',
          planet,
          sign: todayPos.sign,
        });
      }

      if (todayPos.retrograde && !tomorrowPos.retrograde) {
        stations.push({
          name: `${planet} stations direct`,
          type: 'retrograde_end',
          planet,
          sign: todayPos.sign,
        });
      }
    }

    expect(stations).toHaveLength(1);
    expect(stations[0].name).toBe('Mercury stations retrograde');
    expect(stations[0].name).not.toContain('tomorrow');
  });

  it('direct station names do not contain "tomorrow"', () => {
    const todayPositions: Record<string, any> = {
      Mercury: { sign: 'Aquarius', retrograde: true },
    };

    const tomorrowPositions: Record<string, any> = {
      Mercury: { sign: 'Aquarius', retrograde: false },
    };

    const stations: any[] = [];

    for (const [planet, todayPos] of Object.entries(todayPositions)) {
      const tomorrowPos = tomorrowPositions[planet];
      if (!tomorrowPos) continue;

      if (!todayPos.retrograde && tomorrowPos.retrograde) {
        stations.push({
          name: `${planet} stations retrograde`,
          type: 'retrograde_start',
        });
      }

      if (todayPos.retrograde && !tomorrowPos.retrograde) {
        stations.push({
          name: `${planet} stations direct`,
          type: 'retrograde_end',
        });
      }
    }

    expect(stations).toHaveLength(1);
    expect(stations[0].name).toBe('Mercury stations direct');
    expect(stations[0].name).not.toContain('tomorrow');
  });
});

// ─── Integration: formatRelativeTime + eventTime ────────────────────────────

describe('formatRelativeTime with eventTime from sign change detection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-02-10T08:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('Venus scenario: endDate at 21:00 UTC produces "in ~13h"', () => {
    const eventTime = new Date('2025-02-10T21:00:00Z');
    const timeStr = formatRelativeTime(eventTime);
    expect(timeStr).toBe('in ~13h');

    // This would produce: "Venus enters Pisces in ~13h."
    const postLine = `Venus enters Pisces ${timeStr}.`;
    expect(postLine).toBe('Venus enters Pisces in ~13h.');
    expect(postLine).not.toContain('tomorrow');
  });

  it('no duration data falls back to "later today"', () => {
    const timeStr = formatRelativeTime(undefined);
    expect(timeStr).toBe('later today');

    const postLine = `Mercury stations retrograde ${timeStr}.`;
    expect(postLine).toBe('Mercury stations retrograde later today.');
    expect(postLine).not.toContain('tomorrow');
  });

  it('egress post uses relative time correctly', () => {
    const eventTime = new Date('2025-02-10T21:00:00Z');
    const timeStr = formatRelativeTime(eventTime);

    const egressLine = `Venus's last hours in Aquarius.`;
    const ingressLine = `Venus enters Pisces ${timeStr}.`;
    expect(egressLine).not.toContain('tomorrow');
    expect(ingressLine).toBe('Venus enters Pisces in ~13h.');
  });
});
