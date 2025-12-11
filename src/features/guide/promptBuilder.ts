export interface GuideHint {
  id: string;
  title: string;
  shortText: string;
  suggestedAction: 'ask_guide' | 'reflect' | 'journal';
  promptTemplate?: string;
}

export interface PromptContext {
  tarotThemes?: string[];
  journalPatterns?: string[];
  moonPhase?: string;
  recentMoods?: string[];
  dominantSuit?: string;
}

const THEME_PROMPTS: Record<string, string> = {
  healing:
    "I've been noticing themes of healing in my readings. Can you help me understand what this might be calling me toward?",
  action:
    "There's been a lot of action energy in my tarot patterns lately. What should I focus this energy on?",
  truth:
    'My cards keep pointing toward truth and clarity. What truths might I be ready to see?',
  stability:
    "I'm sensing themes of stability and grounding. How can I build on this foundation?",
  transformation:
    'Transformation keeps appearing in my readings. What changes might be unfolding for me?',
  intuition:
    'My intuition seems heightened lately. How can I better trust and follow it?',
  creativity:
    'Creative energy is flowing strongly. How can I channel this into something meaningful?',
  release:
    'I feel called to release something. What might I be holding onto that no longer serves me?',
  connection:
    'Themes of connection and relationships are prominent. What do my patterns reveal about my relationships?',
  growth:
    'Growth and expansion are calling. What areas of my life are ready to flourish?',
};

const SUIT_PROMPTS: Record<string, string> = {
  Cups: 'My readings have been heavy with Cups energy. What emotional currents are moving through my life right now?',
  Wands:
    'Wands are dominating my readings. How can I channel this creative fire constructively?',
  Swords:
    'Swords keep appearing in my spreads. What mental patterns or communications need my attention?',
  Pentacles:
    'Pentacles are prominent in my readings. What practical or material matters should I focus on?',
  'Major Arcana':
    'Major Arcana cards are strongly present. What significant life lessons or transitions am I navigating?',
};

const MOON_PHASE_PROMPTS: Record<string, string> = {
  'New Moon':
    'During this New Moon, what intentions should I be setting based on my recent patterns?',
  'Waxing Crescent':
    'As the moon waxes, what small steps can I take toward my intentions?',
  'First Quarter':
    'At the First Quarter, what challenges might I face in pursuing my goals?',
  'Waxing Gibbous':
    'With the moon nearly full, how can I refine and strengthen my current focus?',
  'Full Moon':
    'Under this Full Moon, what is ready to be illuminated or celebrated in my journey?',
  'Waning Gibbous':
    'As the moon wanes, what gratitude or lessons should I acknowledge?',
  'Last Quarter':
    'At the Last Quarter, what am I ready to release or let go of?',
  'Waning Crescent':
    'During this Waning Crescent, how can I best rest and integrate my experiences?',
};

const MOOD_PROMPTS: Record<string, string> = {
  hopeful:
    "I've been feeling hopeful lately. How can I nurture and sustain this optimism?",
  anxious:
    'Anxiety has been present for me recently. What guidance do my patterns offer for finding calm?',
  reflective:
    "I'm in a reflective mood. What deeper patterns might be worth exploring?",
  energized:
    "I'm feeling energized and motivated. How can I best direct this energy?",
  peaceful:
    'A sense of peace has settled in. What has contributed to this and how can I maintain it?',
  uncertain:
    "I'm experiencing uncertainty. What clarity might my cosmic patterns offer?",
  grateful:
    'Gratitude is filling my heart. What blessings should I acknowledge and cultivate?',
  restless:
    'Restlessness is stirring in me. What might be calling for change or movement?',
};

export function buildGuidePromptFromHint(hint: GuideHint): string {
  if (hint.promptTemplate) {
    return hint.promptTemplate;
  }
  return `Tell me more about "${hint.title}" - ${hint.shortText}`;
}

export function buildGuidePromptFromContext(
  context: PromptContext,
): string | null {
  if (context.tarotThemes && context.tarotThemes.length > 0) {
    const primaryTheme = context.tarotThemes[0].toLowerCase();
    if (THEME_PROMPTS[primaryTheme]) {
      return THEME_PROMPTS[primaryTheme];
    }
  }

  if (context.dominantSuit && SUIT_PROMPTS[context.dominantSuit]) {
    return SUIT_PROMPTS[context.dominantSuit];
  }

  if (context.moonPhase && MOON_PHASE_PROMPTS[context.moonPhase]) {
    return MOON_PHASE_PROMPTS[context.moonPhase];
  }

  if (context.recentMoods && context.recentMoods.length > 0) {
    const primaryMood = context.recentMoods[0].toLowerCase();
    if (MOOD_PROMPTS[primaryMood]) {
      return MOOD_PROMPTS[primaryMood];
    }
  }

  return null;
}

export function generateReflectionPrompt(context: PromptContext): string {
  const parts: string[] = [];

  if (context.moonPhase) {
    parts.push(`the ${context.moonPhase}`);
  }

  if (context.tarotThemes && context.tarotThemes.length > 0) {
    parts.push(`themes of ${context.tarotThemes.slice(0, 2).join(' and ')}`);
  }

  if (context.dominantSuit) {
    parts.push(`${context.dominantSuit} energy`);
  }

  if (parts.length === 0) {
    return "What's present in your heart and mind today?";
  }

  return `With ${parts.join(', ')}, what's emerging for you right now?`;
}
