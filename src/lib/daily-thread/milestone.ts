import { sql } from '@vercel/postgres';
import { DailyThreadModule } from './types';

const MILESTONE_DAYS = [7, 14, 30, 60, 100];

/**
 * Generate a milestone celebration module if user hits a streak milestone
 */
export async function generateMilestoneModule(
  userId: string,
  date: Date,
): Promise<DailyThreadModule | null> {
  try {
    // Get user's current streak
    const streakResult = await sql`
      SELECT current_streak, longest_streak
      FROM user_streaks
      WHERE user_id = ${userId}
    `;

    if (streakResult.rows.length === 0) {
      return null;
    }

    const currentStreak = streakResult.rows[0]?.current_streak || 0;

    // Check if today is a milestone day
    if (!MILESTONE_DAYS.includes(currentStreak)) {
      return null;
    }

    // Build celebration message
    let title = '';
    let body = '';

    if (currentStreak === 7) {
      title = 'Week milestone';
      body =
        "You've maintained your practice for a week. This consistency is building something meaningful.";
    } else if (currentStreak === 14) {
      title = 'Two weeks';
      body =
        'Two weeks of daily practice. You are cultivating a rhythm that honours your journey.';
    } else if (currentStreak === 30) {
      title = 'Month milestone';
      body =
        'A full month of practice. This dedication reflects your commitment to self-awareness and growth.';
    } else if (currentStreak === 60) {
      title = 'Two months';
      body =
        'Sixty days of consistent practice. You have built something substantial and meaningful.';
    } else if (currentStreak === 100) {
      title = 'Century milestone';
      body =
        'One hundred days. This is a remarkable achievement that speaks to your dedication and inner wisdom.';
    }

    const moduleId = `milestone-${currentStreak}-${new Date(date).toISOString().split('T')[0]}`;

    return {
      id: moduleId,
      type: 'milestone',
      level: 2, // Level 2-3 only
      title,
      body,
      meta: {
        streakDays: currentStreak,
      },
      actions: [
        {
          label: 'Continue',
          intent: 'dismiss',
        },
      ],
      priority: 100, // Highest priority
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Daily Thread] Error generating milestone module:', error);
    return null;
  }
}
