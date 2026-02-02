/**
 * Streak Milestone Notifications
 *
 * Celebrates user streak achievements with personalized notifications
 */

export interface StreakNotificationContent {
  title: string;
  body: string;
  icon: string;
  data: {
    type: 'streak_milestone';
    streak: number;
    action: string;
  };
}

// Milestones that trigger notifications
export const STREAK_MILESTONES = [7, 14, 21, 30, 50, 69, 100, 150, 200, 365];

// Special messages for each milestone
const STREAK_MESSAGES: Record<
  number,
  { title: string; body: string; icon: string }
> = {
  7: {
    title: '1 Week Streak!',
    body: "You've checked in for 7 days straight! The cosmos rewards consistency.",
    icon: '🔥',
  },
  14: {
    title: '2 Week Streak!',
    body: 'Two weeks of cosmic connection! Your practice is taking root.',
    icon: '🔥',
  },
  21: {
    title: '3 Week Streak!',
    body: "21 days - they say that's how long it takes to form a habit. You did it!",
    icon: '⭐',
  },
  30: {
    title: '1 Month Streak!',
    body: 'A full lunar cycle of dedication! Your cosmic awareness deepens.',
    icon: '🌟',
  },
  50: {
    title: '50 Day Streak!',
    body: 'Half a hundred days of cosmic connection. Truly impressive!',
    icon: '⭐',
  },
  69: {
    title: '69 Day Streak!',
    body: 'Nice. Cosmic balance achieved. The universe appreciates your dedication.',
    icon: '✨',
  },
  100: {
    title: '100 Day Streak!',
    body: 'Century club! Your commitment to cosmic awareness is remarkable.',
    icon: '💫',
  },
  150: {
    title: '150 Day Streak!',
    body: 'Five months of daily practice. Your celestial journey is inspiring!',
    icon: '🌟',
  },
  200: {
    title: '200 Day Streak!',
    body: 'Two hundred days! You are truly aligned with the cosmic rhythms.',
    icon: '✨',
  },
  365: {
    title: '1 Year Streak!',
    body: 'A full solar return of daily practice! You are a cosmic champion!',
    icon: '🏆',
  },
};

/**
 * Check if a streak milestone warrants a notification
 *
 * @param currentStreak - User's current streak count
 * @param lastNotifiedStreak - Last streak count that triggered a notification
 * @returns Whether to send a notification
 */
export function shouldSendStreakNotification(
  currentStreak: number,
  lastNotifiedStreak: number = 0,
): boolean {
  // Check if current streak is a milestone we haven't notified about
  return (
    STREAK_MILESTONES.includes(currentStreak) &&
    currentStreak > lastNotifiedStreak
  );
}

/**
 * Get the streak notification content for a given streak
 *
 * @param streak - The streak number to celebrate
 * @param userName - Optional user name for personalization
 * @returns Notification content object
 */
export function getStreakNotification(
  streak: number,
  userName?: string,
): StreakNotificationContent {
  const message = STREAK_MESSAGES[streak];

  if (message) {
    return {
      title: `${message.icon} ${userName ? `${userName}, ` : ''}${message.title}`,
      body: message.body,
      icon: message.icon,
      data: {
        type: 'streak_milestone',
        streak,
        action: '/profile',
      },
    };
  }

  // Generic milestone message for unlisted milestones
  return {
    title: `🔥 ${userName ? `${userName}, ` : ''}${streak} Day Streak!`,
    body: 'Keep the cosmic momentum going! Your dedication is inspiring.',
    icon: '🔥',
    data: {
      type: 'streak_milestone',
      streak,
      action: '/profile',
    },
  };
}

/**
 * Get the next milestone for a user's current streak
 *
 * @param currentStreak - User's current streak
 * @returns Next milestone number, or null if at max
 */
export function getNextMilestone(currentStreak: number): number | null {
  for (const milestone of STREAK_MILESTONES) {
    if (milestone > currentStreak) {
      return milestone;
    }
  }
  return null;
}

/**
 * Get days until next milestone
 *
 * @param currentStreak - User's current streak
 * @returns Days remaining to next milestone, or null if at max
 */
export function getDaysUntilNextMilestone(
  currentStreak: number,
): number | null {
  const next = getNextMilestone(currentStreak);
  if (next === null) return null;
  return next - currentStreak;
}

/**
 * Get an encouraging message about upcoming milestone
 *
 * @param currentStreak - User's current streak
 * @returns Encouragement string or null
 */
export function getMilestoneEncouragement(
  currentStreak: number,
): string | null {
  const daysLeft = getDaysUntilNextMilestone(currentStreak);
  const nextMilestone = getNextMilestone(currentStreak);

  if (daysLeft === null || nextMilestone === null) {
    return "You've reached legendary status!";
  }

  if (daysLeft <= 3) {
    return `Only ${daysLeft} day${daysLeft === 1 ? '' : 's'} until your ${nextMilestone}-day milestone!`;
  }

  if (daysLeft <= 7) {
    return `${daysLeft} days to go until ${nextMilestone} days!`;
  }

  return null;
}
