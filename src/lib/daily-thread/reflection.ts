import { buildAstralContext } from '@/lib/ai/astral-guide';
import { DailyThreadModule, UserLevel } from './types';

/**
 * Generate a reflection prompt module based on current transits, moon phase, and recent themes
 */
export async function generateReflectionModule(
  userId: string,
  userName?: string,
  userBirthday?: string,
  date: Date = new Date(),
  userLevel: UserLevel = 1,
): Promise<DailyThreadModule | null> {
  try {
    // Build astral context for personalised prompt
    const astralContext = await buildAstralContext(
      userId,
      userName,
      userBirthday,
      date,
    );

    // Extract key information
    const moonPhase = astralContext.moonPhase;
    const currentTransits = astralContext.currentTransits;
    const personalTransits = astralContext.personalTransits;
    const recentThemes = astralContext.journalSummaries
      .slice(0, 3)
      .map((j) => j.summary)
      .join(', ');

    // Build prompt based on level
    let prompt = '';
    let title = 'Reflection prompt';

    if (userLevel === 0) {
      // Level 0: Ambient - just moon phase, neutral
      if (moonPhase) {
        const moonPhaseName = moonPhase.toLowerCase();
        prompt = `The moon is in ${moonPhaseName}. What does this lunar energy invite you to notice today?`;
        title = 'Lunar reflection';
      } else {
        // Fallback if no moon phase
        prompt = 'What would you like to explore or reflect on today?';
        title = 'Reflection invitation';
      }
    } else if (userLevel === 1) {
      // Level 1: Light personalisation
      if (moonPhase && currentTransits) {
        prompt = `With ${moonPhase.toLowerCase()} energy and current cosmic patterns, what feels most present for you right now?`;
        title = 'Cosmic reflection';
      } else if (moonPhase) {
        prompt = `The moon is in ${moonPhase.toLowerCase()}. What does this energy invite you to explore?`;
        title = 'Lunar reflection';
      } else {
        prompt = 'What would you like to reflect on today?';
        title = 'Reflection invitation';
      }
    } else if (userLevel >= 2) {
      // Level 2-3: More personalised with transits and themes
      const parts: string[] = [];

      if (personalTransits && personalTransits.length > 0) {
        const firstTransit = personalTransits[0];
        parts.push(
          `With ${firstTransit.planet} ${firstTransit.event.toLowerCase()}${firstTransit.house ? ` activating your ${getHouseName(firstTransit.house)} house` : ''}`,
        );
      } else if (currentTransits) {
        parts.push('With current cosmic patterns');
      }

      if (moonPhase) {
        parts.push(`and ${moonPhase.toLowerCase()} energy`);
      }

      if (recentThemes && userLevel >= 3) {
        // Only include themes for level 3
        parts.push(`building on recent themes`);
      }

      if (parts.length > 0) {
        prompt = `${parts.join(', ')}, what would you like to explore or reflect on?`;
      } else {
        prompt = 'What feels most present for you to reflect on today?';
      }

      title = 'Personalised reflection';
    }

    // Ensure prompt is 1-2 sentences max
    if (prompt.length > 200) {
      prompt = prompt.substring(0, 200).trim() + '...';
    }

    const moduleId = `reflection-${new Date(date).toISOString().split('T')[0]}`;

    return {
      id: moduleId,
      type: 'reflection',
      level: userLevel,
      title,
      body: prompt,
      meta: {
        // Don't duplicate prompt in meta.question - it's already in body
      },
      actions: [
        {
          label: 'Start journal',
          intent: 'journal',
          payload: {
            prompt,
          },
        },
        {
          label: 'Skip',
          intent: 'dismiss',
        },
      ],
      priority: 60,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Daily Thread] Error generating reflection module:', error);
    // Return a simple fallback prompt
    return {
      id: `reflection-${new Date(date).toISOString().split('T')[0]}`,
      type: 'reflection',
      level: 0,
      title: 'Reflection invitation',
      body: 'What would you like to explore or reflect on today?',
      actions: [
        {
          label: 'Start journal',
          intent: 'journal',
        },
        {
          label: 'Skip',
          intent: 'dismiss',
        },
      ],
      priority: 60,
      createdAt: new Date().toISOString(),
    };
  }
}

function getHouseName(house: number): string {
  const houseNames: Record<number, string> = {
    1: 'identity',
    2: 'values',
    3: 'communication',
    4: 'home',
    5: 'creativity',
    6: 'health',
    7: 'partnerships',
    8: 'transformation',
    9: 'philosophy',
    10: 'career',
    11: 'community',
    12: 'spirituality',
  };
  return houseNames[house] || `house ${house}`;
}
