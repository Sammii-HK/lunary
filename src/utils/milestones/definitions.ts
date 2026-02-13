/**
 * Milestone type definitions, thresholds, and display text.
 */

export interface MilestoneDefinition {
  type: string;
  key: string;
  title: string;
  description: string;
  tier: 'basic' | 'advanced';
}

// App milestone thresholds
export const READING_MILESTONES = [10, 25, 50, 100, 250] as const;
export const JOURNAL_MILESTONES = [10, 25, 50, 100] as const;
export const STREAK_MILESTONES = [7, 30, 60, 90, 180, 365] as const;
export const APP_ANNIVERSARY_MONTHS = [1, 6, 12, 24] as const;

export function getReadingMilestoneDefinition(
  count: number,
): MilestoneDefinition {
  return {
    type: 'reading_count',
    key: `${count}_tarot_readings`,
    title: `${count} Tarot Readings`,
    description: `You've completed ${count} tarot readings on your cosmic journey.`,
    tier: 'basic',
  };
}

export function getJournalMilestoneDefinition(
  count: number,
): MilestoneDefinition {
  return {
    type: 'journal_count',
    key: `${count}_journal_entries`,
    title: `${count} Journal Entries`,
    description: `You've written ${count} entries in your Book of Shadows.`,
    tier: 'basic',
  };
}

export function getStreakMilestoneDefinition(
  days: number,
): MilestoneDefinition {
  return {
    type: 'streak',
    key: `${days}_day_streak`,
    title: `${days}-Day Streak`,
    description: `${days} consecutive days of cosmic practice.`,
    tier: 'basic',
  };
}

export function getAppAnniversaryDefinition(
  months: number,
): MilestoneDefinition {
  const label = months >= 12 ? `${months / 12} Year` : `${months} Month`;
  return {
    type: 'app_anniversary',
    key: `app_anniversary_${months}m`,
    title: `${label} Anniversary`,
    description: `You've been on your cosmic journey with Lunary for ${label.toLowerCase()}${months >= 12 ? '' : 's'}.`,
    tier: 'basic',
  };
}

export function getSolarReturnDefinition(year: number): MilestoneDefinition {
  return {
    type: 'solar_return',
    key: `solar_return_${year}`,
    title: `Solar Return ${year}`,
    description:
      'The Sun returns to the exact position it was at your birth. Happy cosmic birthday!',
    tier: 'basic',
  };
}

export function getLunarReturnDefinition(
  yearMonth: string,
): MilestoneDefinition {
  return {
    type: 'lunar_return',
    key: `lunar_return_${yearMonth}`,
    title: 'Lunar Return',
    description:
      'The Moon returns to your natal Moon sign. A time of emotional renewal.',
    tier: 'advanced',
  };
}

export function getSaturnReturnDefinition(year: number): MilestoneDefinition {
  return {
    type: 'saturn_return',
    key: `saturn_return_${year}`,
    title: 'Saturn Return',
    description:
      'Saturn returns to its natal position. A once-in-29-years milestone of maturation and restructuring.',
    tier: 'advanced',
  };
}
