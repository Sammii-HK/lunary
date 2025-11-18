import { getGlobalCosmicData } from '../cosmic-snapshot/global-cache';
import { getAccurateMoonPhase } from '../../../utils/astrology/cosmic-og';

export type LunarEventType = 'new_moon' | 'full_moon' | 'eclipse' | 'first_quarter' | 'last_quarter';

export interface LunarEvent {
  type: LunarEventType;
  date: Date;
  moonSign: string;
  moonPhase: string;
  isSignificant: boolean;
  description: string;
}

/**
 * Detects significant lunar events for a given date
 */
export async function detectLunarEvent(
  date: Date = new Date(),
): Promise<LunarEvent | null> {
  try {
    const moonPhase = getAccurateMoonPhase(date);
    const globalData = await getGlobalCosmicData(date);

    if (!moonPhase.isSignificant) {
      return null;
    }

    const moonSign = globalData?.planetaryPositions?.Moon?.sign || 'Unknown';
    const phaseName = moonPhase.name.toLowerCase();

    // Check for New Moon
    if (phaseName.includes('new moon')) {
      // Check if it's an eclipse (simplified - would need more complex calculation)
      const isEclipse = checkForEclipse(date, moonSign);
      
      return {
        type: isEclipse ? 'eclipse' : 'new_moon',
        date,
        moonSign,
        moonPhase: moonPhase.name,
        isSignificant: true,
        description: isEclipse
          ? `Solar Eclipse in ${moonSign} - A powerful moment for new beginnings and releasing old patterns`
          : `New Moon in ${moonSign} - A time for setting intentions and planting seeds`,
      };
    }

    // Check for Full Moon
    if (phaseName.includes('full moon') || phaseName.includes('hunter moon') || phaseName.includes('blood moon')) {
      const isEclipse = checkForEclipse(date, moonSign);
      
      return {
        type: isEclipse ? 'eclipse' : 'full_moon',
        date,
        moonSign,
        moonPhase: moonPhase.name,
        isSignificant: true,
        description: isEclipse
          ? `Lunar Eclipse in ${moonSign} - A powerful moment for release and transformation`
          : `Full Moon in ${moonSign} - A time for culmination, release, and celebration`,
      };
    }

    // Check for First Quarter
    if (phaseName.includes('first quarter')) {
      return {
        type: 'first_quarter',
        date,
        moonSign,
        moonPhase: moonPhase.name,
        isSignificant: true,
        description: `First Quarter Moon in ${moonSign} - A time for taking action and moving forward`,
      };
    }

    // Check for Last Quarter
    if (phaseName.includes('last quarter') || phaseName.includes('third quarter')) {
      return {
        type: 'last_quarter',
        date,
        moonSign,
        moonPhase: moonPhase.name,
        isSignificant: true,
        description: `Last Quarter Moon in ${moonSign} - A time for reflection and letting go`,
      };
    }

    return null;
  } catch (error) {
    console.error('[Lunar Events] Failed to detect lunar event:', error);
    return null;
  }
}

/**
 * Simplified eclipse detection
 * In production, this would use more sophisticated astronomical calculations
 */
function checkForEclipse(date: Date, moonSign: string): boolean {
  // This is a simplified check - real eclipse detection requires
  // checking the alignment of Sun, Moon, and Earth's nodes
  // For now, we'll use a heuristic based on moon phase and sign
  
  // Eclipses typically occur near New Moon (solar) or Full Moon (lunar)
  // and when the Moon is near the nodes (Aries/Libra or Cancer/Capricorn)
  const eclipseSigns = ['Aries', 'Libra', 'Cancer', 'Capricorn'];
  
  // Check if moon is in an eclipse-prone sign
  // This is a simplified check - real detection would be more complex
  return eclipseSigns.includes(moonSign);
}

/**
 * Generates a prompt for a lunar event
 */
export function generateLunarEventPrompt(
  event: LunarEvent,
  userName?: string,
): string {
  const parts: string[] = [];

  parts.push(`Hello${userName ? ` ${userName}` : ''}! ${event.moonPhase.includes('New') ? '🌑' : event.moonPhase.includes('Full') ? '🌕' : '🌓'}`);

  parts.push(event.description);

  // Add reflection question based on event type
  switch (event.type) {
    case 'new_moon':
    case 'eclipse':
      parts.push('What new intention would you like to set for this lunar cycle?');
      break;
    case 'full_moon':
      parts.push('What are you ready to release or celebrate?');
      break;
    case 'first_quarter':
      parts.push('What action are you being called to take?');
      break;
    case 'last_quarter':
      parts.push('What are you ready to let go of?');
      break;
  }

  return parts.join('. ') + '.';
}
