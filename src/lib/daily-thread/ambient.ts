import { buildAstralContext } from '@/lib/ai/astral-guide';
import { DailyThreadModule } from './types';

/**
 * Generate an ambient module for level 0 users (moon phase, neutral transit)
 */
export async function generateAmbientModule(
  userId: string,
  userName?: string,
  userBirthday?: string,
  date: Date = new Date(),
): Promise<DailyThreadModule | null> {
  try {
    const astralContext = await buildAstralContext(
      userId,
      userName,
      userBirthday,
      date,
    );

    const moonPhase = astralContext.moonPhase;
    if (!moonPhase) {
      return null;
    }

    const moduleId = `ambient-${new Date(date).toISOString().split('T')[0]}`;

    return {
      id: moduleId,
      type: 'ambient',
      level: 0,
      title: 'Lunar energy',
      body: `The moon is in ${moonPhase.toLowerCase()}. This lunar phase invites gentle awareness and reflection.`,
      meta: {
        moonPhase,
      },
      actions: [
        {
          label: 'Learn more',
          intent: 'view',
          href: '/grimoire/moon',
        },
        {
          label: 'Dismiss',
          intent: 'dismiss',
        },
      ],
      priority: 50,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Daily Thread] Error generating ambient module:', error);
    return null;
  }
}
