/**
 * Milestone detection functions.
 * Runs in batch during the daily cron to detect new milestones.
 */

import {
  READING_MILESTONES,
  JOURNAL_MILESTONES,
  STREAK_MILESTONES,
  APP_ANNIVERSARY_MONTHS,
  getReadingMilestoneDefinition,
  getJournalMilestoneDefinition,
  getStreakMilestoneDefinition,
  getAppAnniversaryDefinition,
  getSolarReturnDefinition,
  getLunarReturnDefinition,
  type MilestoneDefinition,
} from './definitions';

interface UserData {
  userId: string;
  birthday?: string | null;
  birthChart?: Record<string, { sign?: string }> | null;
  signupAt?: string | null;
  tarotReadingCount: number;
  journalCount: number;
  longestStreak: number;
  currentStreak: number;
}

interface CosmicContext {
  currentMoonSign?: string;
  currentDate: Date;
}

export interface DetectedMilestone {
  definition: MilestoneDefinition;
  achievedAt: Date;
  data: Record<string, unknown>;
}

/**
 * Detect all milestones for a user.
 */
export function detectMilestones(
  user: UserData,
  cosmic: CosmicContext,
): DetectedMilestone[] {
  const milestones: DetectedMilestone[] = [];
  const now = cosmic.currentDate;

  // App milestones: reading count
  for (const threshold of READING_MILESTONES) {
    if (user.tarotReadingCount >= threshold) {
      milestones.push({
        definition: getReadingMilestoneDefinition(threshold),
        achievedAt: now,
        data: { count: user.tarotReadingCount },
      });
    }
  }

  // App milestones: journal count
  for (const threshold of JOURNAL_MILESTONES) {
    if (user.journalCount >= threshold) {
      milestones.push({
        definition: getJournalMilestoneDefinition(threshold),
        achievedAt: now,
        data: { count: user.journalCount },
      });
    }
  }

  // App milestones: streak
  const peakStreak = Math.max(user.longestStreak, user.currentStreak);
  for (const threshold of STREAK_MILESTONES) {
    if (peakStreak >= threshold) {
      milestones.push({
        definition: getStreakMilestoneDefinition(threshold),
        achievedAt: now,
        data: { streak: peakStreak },
      });
    }
  }

  // App milestones: anniversary
  if (user.signupAt) {
    const signupDate = new Date(user.signupAt);
    const monthsSinceSignup = monthDiff(signupDate, now);
    for (const months of APP_ANNIVERSARY_MONTHS) {
      if (monthsSinceSignup >= months) {
        milestones.push({
          definition: getAppAnniversaryDefinition(months),
          achievedAt: now,
          data: { monthsSinceSignup },
        });
      }
    }
  }

  // Astrological: Solar Return (birthday in 7/3/0 days)
  if (user.birthday) {
    const daysUntilBirthday = getDaysUntilBirthday(user.birthday, now);
    if (
      daysUntilBirthday !== null &&
      (daysUntilBirthday === 0 ||
        daysUntilBirthday === 3 ||
        daysUntilBirthday === 7)
    ) {
      milestones.push({
        definition: getSolarReturnDefinition(now.getFullYear()),
        achievedAt: now,
        data: { daysUntil: daysUntilBirthday, birthday: user.birthday },
      });
    }
  }

  // Astrological: Lunar Return (current moon sign matches natal moon sign)
  if (user.birthChart && cosmic.currentMoonSign) {
    const natalMoon = user.birthChart['Moon'];
    if (natalMoon?.sign && natalMoon.sign === cosmic.currentMoonSign) {
      const yearMonth = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}`;
      milestones.push({
        definition: getLunarReturnDefinition(yearMonth),
        achievedAt: now,
        data: {
          natalMoonSign: natalMoon.sign,
          currentMoonSign: cosmic.currentMoonSign,
        },
      });
    }
  }

  return milestones;
}

/**
 * Calculate days until birthday from a date string (YYYY-MM-DD or MM/DD/YYYY).
 */
export function getDaysUntilBirthday(
  birthday: string,
  now: Date,
): number | null {
  try {
    const parsed = new Date(birthday);
    if (isNaN(parsed.getTime())) return null;

    const thisYear = now.getFullYear();
    const birthdayThisYear = new Date(
      thisYear,
      parsed.getMonth(),
      parsed.getDate(),
    );

    // If birthday has passed this year, check next year
    if (birthdayThisYear < now) {
      birthdayThisYear.setFullYear(thisYear + 1);
    }

    const diffMs = birthdayThisYear.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

function monthDiff(start: Date, end: Date): number {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
}
