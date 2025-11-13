import {
  WeeklyCosmicData,
  MoonPhaseEvent,
  BestDaysGuidance,
} from '../blog/weeklyContentGenerator';
import {
  getSpellsByCategory,
  getSpellsByMoonPhase,
} from '../../src/constants/grimoire/spells';

export function generateWeeklyRitualGuides(data: WeeklyCosmicData): string {
  if (
    data.moonPhases.length === 0 &&
    Object.keys(data.bestDaysFor).length === 0
  ) {
    return '## 🔮 Weekly Ritual Guides\n\nNo specific ritual recommendations for this week. Use this time for general spiritual maintenance and intention setting.';
  }

  const guides: string[] = [];

  data.moonPhases.forEach((phase, index) => {
    const bestDays = findBestDaysForPhase(phase, data.bestDaysFor);
    const relevantSpells = findRelevantSpells(phase);

    guides.push(
      generateRitualGuide(phase, bestDays, relevantSpells, index + 1),
    );
  });

  return `## 🔮 Weekly Ritual Guides\n\n${guides.join('\n\n---\n\n')}`;
}

function generateRitualGuide(
  phase: MoonPhaseEvent,
  bestDays: string[],
  spells: any[],
  guideNumber: number,
): string {
  const dateStr = phase.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  let guide = `### Ritual Guide ${guideNumber}: ${phase.phase} in ${phase.sign}\n`;
  guide += `**${dateStr} at ${phase.time}**\n\n`;

  guide += `**Cosmic Energy:** ${phase.energy}\n\n`;
  guide += `**Guidance:** ${phase.guidance}\n\n`;

  guide += `**Optimal Timing:**\n`;
  guide += `- Moon Phase: ${phase.phase}\n`;
  guide += `- Moon Sign: ${phase.sign}\n`;
  if (bestDays.length > 0) {
    guide += `- Best Days: ${bestDays.join(', ')}\n`;
  }
  guide += `\n`;

  guide += `**Ritual Steps:**\n\n`;

  if (phase.ritualSuggestions.length > 0) {
    phase.ritualSuggestions.forEach((suggestion, idx) => {
      guide += `${idx + 1}. ${suggestion}\n`;
    });
  } else {
    guide += `1. Create sacred space by cleansing your environment\n`;
    guide += `2. Set clear intentions aligned with ${phase.phase} energy\n`;
    guide += `3. Work with crystals or tools that resonate with ${phase.sign}\n`;
    guide += `4. Perform your ritual work during the ${phase.time} window\n`;
    guide += `5. Close with gratitude and release\n`;
  }

  if (spells.length > 0) {
    guide += `\n**Recommended Spells:**\n\n`;
    spells.slice(0, 2).forEach((spell) => {
      guide += `**${spell.title}**\n`;
      guide += `${spell.description}\n`;
      if (spell.steps && spell.steps.length > 0) {
        guide += `\n*Quick Steps:* ${spell.steps.slice(0, 3).join(' → ')}\n`;
      }
      guide += `\n`;
    });
  }

  guide += `**Intention Setting:**\n`;
  guide += `Use this ${phase.phase} to ${getPhaseIntention(phase.phase)}. `;
  guide += `The ${phase.sign} energy supports ${getSignIntention(phase.sign)}.\n`;

  return guide;
}

function findBestDaysForPhase(
  phase: MoonPhaseEvent,
  bestDays: BestDaysGuidance,
): string[] {
  const phaseDate = phase.date;
  const matchingDays: string[] = [];

  Object.entries(bestDays).forEach(([activity, guidance]) => {
    const hasMatch = guidance.dates.some((date) => {
      return (
        date.toDateString() === phaseDate.toDateString() ||
        Math.abs(date.getTime() - phaseDate.getTime()) < 24 * 60 * 60 * 1000
      );
    });

    if (hasMatch) {
      matchingDays.push(activity);
    }
  });

  return matchingDays;
}

function findRelevantSpells(phase: MoonPhaseEvent): any[] {
  const moonPhaseName = phase.phase;
  const spells = getSpellsByMoonPhase(moonPhaseName);

  if (spells.length === 0) {
    const categorySpells = getSpellsByCategory('manifestation');
    return categorySpells.slice(0, 2);
  }

  return spells.slice(0, 2);
}

function getPhaseIntention(phase: string): string {
  const intentions: Record<string, string> = {
    'New Moon': 'set new intentions and plant seeds for the coming cycle',
    'Waxing Crescent': 'take initial action on your new moon intentions',
    'First Quarter': 'overcome obstacles and make adjustments',
    'Waxing Gibbous': 'refine and prepare for manifestation',
    'Full Moon': 'release what no longer serves and celebrate achievements',
    'Waning Gibbous': 'share wisdom and give thanks',
    'Last Quarter': 'forgive and let go',
    'Waning Crescent': 'rest, reflect, and prepare for renewal',
  };

  return (
    intentions[phase] ||
    'work with the lunar energy for transformation and growth'
  );
}

function getSignIntention(sign: string): string {
  const intentions: Record<string, string> = {
    Aries: 'bold action and new beginnings',
    Taurus: 'grounding and material manifestation',
    Gemini: 'communication and learning',
    Cancer: 'emotional healing and nurturing',
    Leo: 'creative expression and confidence',
    Virgo: 'organization and service',
    Libra: 'harmony and relationships',
    Scorpio: 'transformation and deep healing',
    Sagittarius: 'expansion and exploration',
    Capricorn: 'structure and achievement',
    Aquarius: 'innovation and community',
    Pisces: 'intuition and spiritual connection',
  };

  return intentions[sign] || 'spiritual growth and alignment';
}
