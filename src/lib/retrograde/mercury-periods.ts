export interface RetrogradePeriod {
  planet: string;
  startDate: string;
  endDate: string;
  sign: string;
}

export interface RetrogradeStatus {
  isActive: boolean;
  period?: RetrogradePeriod;
  survivalDays: number;
  isCompleted: boolean;
  badgeLevel: 'bronze' | 'silver' | 'gold' | 'diamond' | null;
}

/** 2026 Mercury Retrograde periods */
export const MERCURY_RETROGRADE_PERIODS: RetrogradePeriod[] = [
  {
    planet: 'Mercury',
    startDate: '2026-01-15',
    endDate: '2026-02-04',
    sign: 'Aquarius',
  },
  {
    planet: 'Mercury',
    startDate: '2026-05-10',
    endDate: '2026-06-03',
    sign: 'Gemini',
  },
  {
    planet: 'Mercury',
    startDate: '2026-09-09',
    endDate: '2026-09-30',
    sign: 'Virgo',
  },
  {
    planet: 'Mercury',
    startDate: '2026-12-29',
    endDate: '2027-01-18',
    sign: 'Capricorn',
  },
];

/**
 * Check current Mercury Retrograde status.
 * Returns active period info, day count, and badge level.
 */
export function getCurrentRetrogradeStatus(date?: Date): RetrogradeStatus {
  const today = date ?? new Date();

  for (const period of MERCURY_RETROGRADE_PERIODS) {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);

    if (today >= start && today <= end) {
      const daysDiff = Math.floor(
        (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      const survivalDays = daysDiff + 1;

      let badgeLevel: RetrogradeStatus['badgeLevel'] = null;
      if (survivalDays >= 3 && survivalDays < 10) {
        badgeLevel = 'bronze';
      } else if (survivalDays >= 10) {
        badgeLevel = 'silver';
      }

      return {
        isActive: true,
        period,
        survivalDays,
        isCompleted: false,
        badgeLevel,
      };
    }

    // Check if just completed (within 3 days after end)
    const threeDaysAfter = new Date(end);
    threeDaysAfter.setDate(threeDaysAfter.getDate() + 3);

    if (today > end && today <= threeDaysAfter) {
      const totalDays =
        Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;

      return {
        isActive: false,
        period,
        survivalDays: totalDays,
        isCompleted: true,
        badgeLevel: 'gold',
      };
    }
  }

  return {
    isActive: false,
    survivalDays: 0,
    isCompleted: false,
    badgeLevel: null,
  };
}

/**
 * Get the active Mercury Retrograde check-in space slug for a given date.
 */
export function getActiveRetrogradeSpaceSlug(date?: Date): string | null {
  const today = date ?? new Date();

  for (const period of MERCURY_RETROGRADE_PERIODS) {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);

    if (today >= start && today <= end) {
      const month = start.toISOString().slice(5, 7);
      const year = start.toISOString().slice(0, 4);
      return `mercury-retrograde-${year}-${month}`;
    }
  }

  return null;
}
