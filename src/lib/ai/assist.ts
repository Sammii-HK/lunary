import { LunaryContext, TransitRecord } from './types';
import { getRecommendedSpells } from '@/constants/spells';

export type AssistCommand =
  | { type: 'summarise_week' }
  | { type: 'interpret_tarot' }
  | { type: 'tarot_patterns' }
  | { type: 'explain_energy' }
  | { type: 'cosmic_weather' }
  | { type: 'transit_feelings' }
  | { type: 'ritual_generation' }
  | { type: 'weekly_overview' }
  | { type: 'journal_entry' }
  | { type: 'none' };

const weekPhrases = [
  'summarise my week',
  'summary of my week',
  'recap my week',
  'weekly overview',
];
const tarotSpreadPhrases = [
  'interpret my spread',
  'latest spread',
  'spread interpretation',
  'detailed interpretation of my latest tarot spread',
  'my last spread',
];
const tarotPatternsPhrases = [
  'tarot patterns',
  'patterns in my recent daily tarot',
  'daily tarot pulls',
  'recent daily tarot',
];
const energyPhrases = ['explain today', "today's energy"];
const cosmicWeatherPhrases = [
  "ask tonight's cosmic weather",
  "tonight's cosmic weather",
  'cosmic weather',
  'what is the cosmic weather',
];
const transitFeelingsPhrases = [
  'how might i be feeling with these transits',
  'how am i feeling with transits',
  'transit feelings',
  'how do transits affect me',
];
const ritualPhrases = [
  'give me a ritual',
  'ritual based on moon',
  'ritual for tonight',
  'ritual generator',
];
const journalPhrases = [
  'turn this into a journal entry',
  'journal entry',
  'journal format',
  'format as journal',
];

const normalise = (value: string) => value.trim().toLowerCase();

export const detectAssistCommand = (userMessage: string): AssistCommand => {
  const content = normalise(userMessage);

  if (cosmicWeatherPhrases.some((phrase) => content.includes(phrase))) {
    return { type: 'cosmic_weather' };
  }

  if (transitFeelingsPhrases.some((phrase) => content.includes(phrase))) {
    return { type: 'transit_feelings' };
  }

  if (ritualPhrases.some((phrase) => content.includes(phrase))) {
    return { type: 'ritual_generation' };
  }

  if (weekPhrases.some((phrase) => content.includes(phrase))) {
    return { type: 'summarise_week' };
  }

  if (journalPhrases.some((phrase) => content.includes(phrase))) {
    return { type: 'journal_entry' };
  }

  if (tarotPatternsPhrases.some((phrase) => content.includes(phrase))) {
    return { type: 'tarot_patterns' };
  }

  if (tarotSpreadPhrases.some((phrase) => content.includes(phrase))) {
    return { type: 'interpret_tarot' };
  }

  if (energyPhrases.some((phrase) => content.includes(phrase))) {
    return { type: 'explain_energy' };
  }

  return { type: 'none' };
};

const summariseWeek = (context: LunaryContext): string => {
  const moods = context.mood?.last7d ?? [];
  if (moods.length === 0) {
    return 'The past week has been gentle yet shifting; notice how your energy has ebbed and flowed each day.';
  }

  const moodTags = moods.map((entry) => entry.tag);
  const uniqueTags = Array.from(new Set(moodTags));

  return `Your week traced ${uniqueTags.join(', ')} threads. Let those textures guide how you honour yourself this weekend.`;
};

const interpretTarot = (_context: LunaryContext): string | null => {
  return null;
};

const tarotPatterns = (_context: LunaryContext): string | null => {
  return null;
};

const describeTransit = (transit: TransitRecord): string => {
  const direction = transit.applying
    ? 'moving towards exact'
    : 'softening after exact';
  return `${transit.from} ${transit.aspect.toLowerCase()} ${transit.to} is ${direction}, with strength ${transit.strength.toFixed(
    2,
  )}`;
};

const explainEnergy = (context: LunaryContext): string => {
  const moon = context.moon
    ? `${context.moon.phase.toLowerCase()} in ${context.moon.sign}`
    : null;

  const keyTransit = context.currentTransits[0]
    ? describeTransit(context.currentTransits[0])
    : null;

  const parts = [
    moon ? `The Moon is currently ${moon}` : null,
    keyTransit ? `Key transit: ${keyTransit}` : null,
  ].filter(Boolean);

  if (parts.length === 0) {
    return 'Cosmic weather is calm and asks you to listen inward. Let subtle cues lead the way.';
  }

  return parts.join('. ') + '.';
};

const cosmicWeather = (context: LunaryContext): string => {
  const moon = context.moon
    ? `${context.moon.phase.toLowerCase()} Moon in ${context.moon.sign}`
    : null;

  const transits = context.currentTransits.slice(0, 3);
  const transitDescriptions = transits.map(describeTransit);

  const parts: string[] = [];
  if (moon) {
    parts.push(`Tonight's cosmic weather brings a ${moon}`);
  }
  if (transitDescriptions.length > 0) {
    parts.push(`Key planetary influences: ${transitDescriptions.join('; ')}`);
  }

  if (parts.length === 0) {
    return "Tonight's cosmic weather is gentle and still, inviting you to rest and reflect.";
  }

  return parts.join('. ') + '.';
};

const transitFeelings = (context: LunaryContext): string => {
  const transits = context.currentTransits.slice(0, 2);
  if (transits.length === 0) {
    return 'Current transits are gentle, allowing space for inner reflection and steady movement.';
  }

  const descriptions = transits.map((t) => {
    const emotionalTone =
      t.aspect === 'conjunction' || t.aspect === 'trine'
        ? 'harmonious'
        : t.aspect === 'square' || t.aspect === 'opposition'
          ? 'challenging'
          : 'supportive';
    return `${t.from} ${t.aspect} ${t.to} brings ${emotionalTone} energy`;
  });

  return `With ${descriptions.join(' and ')}, you might notice shifts in how you process emotions, make decisions, or connect with others.`;
};

const ritualGeneration = (context: LunaryContext): string => {
  const moon = context.moon;
  if (!moon) {
    return 'The Moon invites you to create a simple ritual of intention and presence.';
  }

  try {
    const moonPhaseLabel = moon.phase || 'New Moon';
    const recommendedSpells = getRecommendedSpells(moonPhaseLabel as any);

    if (recommendedSpells.length > 0) {
      const spellNames = recommendedSpells
        .slice(0, 3)
        .map((s) => s.title)
        .join(', ');
      return `Tonight's ${moon.phase} in ${moon.sign} aligns with ${moonPhaseLabel} energy. Consider these rituals: ${spellNames}. These practices honour this lunar moment and support your intentions.`;
    }
  } catch (error) {
    console.error('Error getting recommended spells:', error);
  }

  const phase = moon.phase.toLowerCase();
  const sign = moon.sign.toLowerCase();

  const phaseGuidance: Record<string, string> = {
    'new moon': 'Set intentions and plant seeds for new beginnings',
    'waxing crescent': 'Nurture your intentions with gentle action',
    'first quarter': 'Take decisive steps toward your goals',
    'waxing gibbous': 'Refine and adjust your path',
    'full moon': 'Release what no longer serves and celebrate growth',
    'waning gibbous': 'Share wisdom and gratitude',
    'last quarter': 'Reflect and prepare for renewal',
    'waning crescent': 'Rest and restore before the next cycle',
  };

  const guidance =
    phaseGuidance[phase] ||
    `Work with the ${phase} energy in ${sign} to align your practice`;

  return `Tonight's ${moon.phase} in ${moon.sign} invites you to ${guidance}. Consider a ritual that honours this lunar moment.`;
};

const weeklyOverview = (context: LunaryContext): string => {
  const moods = context.mood?.last7d ?? [];
  const transits = context.currentTransits.slice(0, 5);
  const moon = context.moon;

  const parts: string[] = [];

  if (moon) {
    parts.push(
      `This week's lunar journey moves through ${moon.phase} in ${moon.sign}`,
    );
  }

  if (transits.length > 0) {
    const keyTransits = transits
      .slice(0, 3)
      .map((t) => `${t.from} ${t.aspect} ${t.to}`)
      .join(', ');
    parts.push(`Key planetary influences: ${keyTransits}`);
  }

  if (moods.length > 0) {
    const moodTags = Array.from(new Set(moods.map((m) => m.tag)));
    parts.push(
      `Your emotional landscape has touched on ${moodTags.join(', ')}`,
    );
  }

  if (parts.length === 0) {
    return 'This week offers gentle cosmic support for reflection and steady movement forward.';
  }

  return parts.join('. ') + '.';
};

const journalEntry = (context: LunaryContext): string => {
  const moon = context.moon
    ? `${context.moon.phase.toLowerCase()} Moon in ${context.moon.sign}`
    : null;
  const tarot = context.tarot.daily?.name || context.tarot.weekly?.name;

  const parts: string[] = [];
  if (moon) {
    parts.push(`Under the ${moon}`);
  }
  if (tarot) {
    parts.push(`with ${tarot} as guide`);
  }

  const date = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `Journal entry for ${date}${parts.length > 0 ? ` — ${parts.join(', ')}` : ''}:`;
};

export const runAssistCommand = (
  command: AssistCommand,
  context: LunaryContext,
): string | null => {
  switch (command.type) {
    case 'summarise_week':
      return summariseWeek(context);
    case 'interpret_tarot':
      return interpretTarot(context);
    case 'tarot_patterns':
      return tarotPatterns(context);
    case 'explain_energy':
      return explainEnergy(context);
    case 'cosmic_weather':
      return cosmicWeather(context);
    case 'transit_feelings':
      return transitFeelings(context);
    case 'ritual_generation':
      return ritualGeneration(context);
    case 'weekly_overview':
      return weeklyOverview(context);
    case 'journal_entry':
      return journalEntry(context);
    default:
      return null;
  }
};
