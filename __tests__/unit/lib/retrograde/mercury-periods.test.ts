import { describe, it, expect } from '@jest/globals';
import {
  MERCURY_RETROGRADE_PERIODS,
  getCurrentRetrogradeStatus,
  getActiveRetrogradeSpaceSlug,
} from '@/lib/retrograde/mercury-periods';

describe('MERCURY_RETROGRADE_PERIODS', () => {
  it('has 4 periods for 2026', () => {
    expect(MERCURY_RETROGRADE_PERIODS).toHaveLength(4);
  });

  it('all periods have valid date ranges', () => {
    for (const period of MERCURY_RETROGRADE_PERIODS) {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      expect(start.getTime()).toBeLessThan(end.getTime());
      expect(period.planet).toBe('Mercury');
      expect(period.sign).toBeTruthy();
    }
  });
});

describe('getCurrentRetrogradeStatus', () => {
  it('returns active during a retrograde period', () => {
    const duringRx = new Date('2026-01-20');
    const status = getCurrentRetrogradeStatus(duringRx);

    expect(status.isActive).toBe(true);
    expect(status.period?.planet).toBe('Mercury');
    expect(status.period?.sign).toBe('Aquarius');
    expect(status.survivalDays).toBeGreaterThan(0);
    expect(status.isCompleted).toBe(false);
  });

  it('calculates correct survival day count', () => {
    // Jan 15 = day 1, Jan 20 = day 6
    const status = getCurrentRetrogradeStatus(new Date('2026-01-20'));
    expect(status.survivalDays).toBe(6);
  });

  it('returns bronze badge for 3-9 days', () => {
    const status = getCurrentRetrogradeStatus(new Date('2026-01-18')); // day 4
    expect(status.badgeLevel).toBe('bronze');
  });

  it('returns silver badge for 10+ days', () => {
    const status = getCurrentRetrogradeStatus(new Date('2026-01-25')); // day 11
    expect(status.badgeLevel).toBe('silver');
  });

  it('returns no badge for first 2 days', () => {
    const status = getCurrentRetrogradeStatus(new Date('2026-01-16')); // day 2
    expect(status.badgeLevel).toBeNull();
  });

  it('returns inactive when not in any period', () => {
    const outsideRx = new Date('2026-03-15');
    const status = getCurrentRetrogradeStatus(outsideRx);

    expect(status.isActive).toBe(false);
    expect(status.survivalDays).toBe(0);
    expect(status.badgeLevel).toBeNull();
  });

  it('returns completed status within 3 days after end', () => {
    const justAfterEnd = new Date('2026-02-05'); // 1 day after Jan Rx ends
    const status = getCurrentRetrogradeStatus(justAfterEnd);

    expect(status.isActive).toBe(false);
    expect(status.isCompleted).toBe(true);
    expect(status.badgeLevel).toBe('gold');
    expect(status.survivalDays).toBeGreaterThan(0);
  });

  it('returns inactive after the 3-day completion window', () => {
    const wellAfterEnd = new Date('2026-02-10');
    const status = getCurrentRetrogradeStatus(wellAfterEnd);

    expect(status.isCompleted).toBe(false);
    expect(status.isActive).toBe(false);
  });

  it('works correctly for each 2026 period', () => {
    const midpoints = [
      { date: '2026-01-25', sign: 'Aquarius' },
      { date: '2026-05-20', sign: 'Gemini' },
      { date: '2026-09-20', sign: 'Virgo' },
      { date: '2027-01-05', sign: 'Capricorn' },
    ];

    for (const { date, sign } of midpoints) {
      const status = getCurrentRetrogradeStatus(new Date(date));
      expect(status.isActive).toBe(true);
      expect(status.period?.sign).toBe(sign);
    }
  });
});

describe('getActiveRetrogradeSpaceSlug', () => {
  it('returns slug during active retrograde', () => {
    const slug = getActiveRetrogradeSpaceSlug(new Date('2026-01-20'));
    expect(slug).toBe('mercury-retrograde-2026-01');
  });

  it('returns correct slug for each period', () => {
    expect(getActiveRetrogradeSpaceSlug(new Date('2026-05-15'))).toBe(
      'mercury-retrograde-2026-05',
    );
    expect(getActiveRetrogradeSpaceSlug(new Date('2026-09-15'))).toBe(
      'mercury-retrograde-2026-09',
    );
    expect(getActiveRetrogradeSpaceSlug(new Date('2027-01-05'))).toBe(
      'mercury-retrograde-2026-12',
    );
  });

  it('returns null outside retrograde periods', () => {
    const slug = getActiveRetrogradeSpaceSlug(new Date('2026-03-15'));
    expect(slug).toBeNull();
  });
});
