import { buildLunaryContext } from '../ai/context';
import { buildReflectionPrompt } from '../ai/reflection';
import { getCachedSnapshot } from '../cosmic-snapshot/cache';
import { sql } from '@vercel/postgres';

export interface CosmicPulseContent {
  moonSign: string;
  moonEnergy: string;
  mainTransit: string;
  reflectionPrompt: string;
  aiPrompt: string;
}

export async function generateCosmicPulse({
  userId,
  userName,
  userBirthday,
  userEmail,
  timezone = 'Europe/London',
  locale = 'en-GB',
  now = new Date(),
  preferredTime = 'morning',
}: {
  userId: string;
  userName?: string;
  userBirthday?: string;
  userEmail?: string;
  timezone?: string;
  locale?: string;
  now?: Date;
  preferredTime?: 'morning' | 'evening';
}): Promise<CosmicPulseContent | null> {
  try {
    let isPayingUser = false;
    try {
      const subscriptionResult = await sql`
        SELECT status FROM subscriptions 
        WHERE user_id = ${userId} 
        AND status IN ('active', 'trial')
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      isPayingUser = subscriptionResult.rows.length > 0;
    } catch (error) {
      console.error('[cosmic-pulse] Failed to check subscription:', error);
    }

    let context;

    const cachedSnapshot = await getCachedSnapshot(userId, now);
    if (cachedSnapshot) {
      context = cachedSnapshot;

      if (isPayingUser) {
        const { getBirthChart } = await import('../ai/providers');
        const { personalizeTransits } = await import('../ai/providers');
        const birthChart = await getBirthChart({ userId });
        if (
          birthChart &&
          context.currentTransits &&
          context.currentTransits.length > 0
        ) {
          context = {
            ...context,
            currentTransits: personalizeTransits(
              context.currentTransits,
              birthChart,
            ),
          };
        }
      }
    } else {
      const result = await buildLunaryContext({
        userId,
        tz: timezone,
        locale,
        displayName: userName,
        userBirthday,
        historyLimit: 0,
        includeMood: false,
        now,
      });
      context = result.context;

      if (isPayingUser) {
        const { getBirthChart } = await import('../ai/providers');
        const { personalizeTransits } = await import('../ai/providers');
        const birthChart = await getBirthChart({ userId });
        if (
          birthChart &&
          context.currentTransits &&
          context.currentTransits.length > 0
        ) {
          context = {
            ...context,
            currentTransits: personalizeTransits(
              context.currentTransits,
              birthChart,
            ),
          };
        }
      }
    }

    const moonSign = context.moon?.sign || 'Unknown';
    const moonPhase = context.moon?.phase || 'Unknown';
    const moonEnergy = `${moonPhase} Moon in ${moonSign}`;

    const mainTransit =
      context.currentTransits && context.currentTransits.length > 0
        ? `${context.currentTransits[0].from} ${context.currentTransits[0].aspect} ${context.currentTransits[0].to}`
        : 'No major transits today';

    const reflectionPrompt = buildReflectionPrompt(
      context,
      'What cosmic energy is guiding me today?',
    );

    const aiPrompt = `What does today's ${moonEnergy} mean for me? ${mainTransit}`;

    return {
      moonSign,
      moonEnergy,
      mainTransit,
      reflectionPrompt,
      aiPrompt,
    };
  } catch (error) {
    console.error('Error generating cosmic pulse:', error);
    return null;
  }
}
