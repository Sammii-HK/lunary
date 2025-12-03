const ENERGY_THEMES = [
  'Clarity',
  'Expansion',
  'Stillness',
  'Depth',
  'Release',
  'Softening',
  'Focus',
  'Movement',
  'Awareness',
  'Courage',
  'Alignment',
  'Reflection',
  'Renewal',
  'Grounding',
  'Flow',
  'Transformation',
  'Patience',
  'Trust',
  'Intuition',
  'Harmony',
] as const;

export type EnergyTheme = (typeof ENERGY_THEMES)[number];

interface ThemeInput {
  tarotKeywords?: string[];
  moonSign?: string;
  moonPhase?: string;
  transitTone?: string;
}

const TAROT_KEYWORD_TO_THEME: Record<string, EnergyTheme> = {
  hope: 'Expansion',
  inspiration: 'Clarity',
  renewal: 'Renewal',
  clarity: 'Clarity',
  insight: 'Awareness',
  intuition: 'Intuition',
  dreams: 'Depth',
  mystery: 'Depth',
  transformation: 'Transformation',
  change: 'Movement',
  endings: 'Release',
  beginnings: 'Renewal',
  balance: 'Harmony',
  harmony: 'Harmony',
  justice: 'Alignment',
  strength: 'Courage',
  courage: 'Courage',
  patience: 'Patience',
  discipline: 'Focus',
  structure: 'Grounding',
  stability: 'Grounding',
  abundance: 'Expansion',
  growth: 'Expansion',
  love: 'Harmony',
  connection: 'Harmony',
  solitude: 'Stillness',
  reflection: 'Reflection',
  wisdom: 'Awareness',
  knowledge: 'Clarity',
  action: 'Movement',
  movement: 'Movement',
  rest: 'Stillness',
  pause: 'Stillness',
  trust: 'Trust',
  faith: 'Trust',
  release: 'Release',
  letting: 'Release',
  focus: 'Focus',
  concentration: 'Focus',
  flow: 'Flow',
  ease: 'Flow',
  softness: 'Softening',
  gentleness: 'Softening',
  power: 'Courage',
  mastery: 'Focus',
  completion: 'Alignment',
  wholeness: 'Alignment',
};

const MOON_SIGN_TO_THEME: Record<string, EnergyTheme> = {
  Aries: 'Courage',
  Taurus: 'Grounding',
  Gemini: 'Clarity',
  Cancer: 'Intuition',
  Leo: 'Courage',
  Virgo: 'Focus',
  Libra: 'Harmony',
  Scorpio: 'Depth',
  Sagittarius: 'Expansion',
  Capricorn: 'Focus',
  Aquarius: 'Awareness',
  Pisces: 'Intuition',
};

const MOON_PHASE_TO_THEME: Record<string, EnergyTheme> = {
  'New Moon': 'Renewal',
  'Waxing Crescent': 'Movement',
  'First Quarter': 'Courage',
  'Waxing Gibbous': 'Expansion',
  'Full Moon': 'Clarity',
  'Waning Gibbous': 'Reflection',
  'Last Quarter': 'Release',
  'Waning Crescent': 'Stillness',
};

export function generateEnergyTheme(input: ThemeInput): EnergyTheme {
  const themeScores: Record<EnergyTheme, number> = {} as Record<
    EnergyTheme,
    number
  >;

  for (const theme of ENERGY_THEMES) {
    themeScores[theme] = 0;
  }

  if (input.tarotKeywords && input.tarotKeywords.length > 0) {
    for (const keyword of input.tarotKeywords) {
      const normalizedKeyword = keyword.toLowerCase().trim();
      for (const [key, theme] of Object.entries(TAROT_KEYWORD_TO_THEME)) {
        if (normalizedKeyword.includes(key)) {
          themeScores[theme] += 3;
        }
      }
    }
  }

  if (input.moonSign) {
    const theme = MOON_SIGN_TO_THEME[input.moonSign];
    if (theme) {
      themeScores[theme] += 2;
    }
  }

  if (input.moonPhase) {
    for (const [phase, theme] of Object.entries(MOON_PHASE_TO_THEME)) {
      if (input.moonPhase.toLowerCase().includes(phase.toLowerCase())) {
        themeScores[theme] += 2;
        break;
      }
    }
  }

  if (input.transitTone) {
    const tone = input.transitTone.toLowerCase();
    if (
      tone.includes('harmonious') ||
      tone.includes('trine') ||
      tone.includes('sextile')
    ) {
      themeScores['Flow'] += 2;
      themeScores['Harmony'] += 1;
    }
    if (
      tone.includes('challenging') ||
      tone.includes('square') ||
      tone.includes('opposition')
    ) {
      themeScores['Transformation'] += 2;
      themeScores['Courage'] += 1;
    }
    if (tone.includes('conjunction')) {
      themeScores['Focus'] += 2;
      themeScores['Alignment'] += 1;
    }
  }

  let maxScore = 0;
  let selectedTheme: EnergyTheme = 'Clarity';

  for (const [theme, score] of Object.entries(themeScores)) {
    if (score > maxScore) {
      maxScore = score;
      selectedTheme = theme as EnergyTheme;
    }
  }

  if (maxScore === 0) {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        86400000,
    );
    const index = dayOfYear % ENERGY_THEMES.length;
    selectedTheme = ENERGY_THEMES[index];
  }

  return selectedTheme;
}

export function getEnergyThemeFromCosmicData(cosmicData: any): EnergyTheme {
  const input: ThemeInput = {};

  if (cosmicData?.tarot?.daily?.keywords) {
    input.tarotKeywords = cosmicData.tarot.daily.keywords;
  }

  if (
    cosmicData?.moonPhase?.sign ||
    cosmicData?.planetaryPositions?.Moon?.sign
  ) {
    input.moonSign =
      cosmicData.moonPhase?.sign || cosmicData.planetaryPositions?.Moon?.sign;
  }

  if (cosmicData?.moonPhase?.name) {
    input.moonPhase = cosmicData.moonPhase.name;
  }

  if (cosmicData?.generalTransits?.length > 0) {
    const mainTransit = cosmicData.generalTransits[0];
    input.transitTone = mainTransit.aspect || mainTransit.name;
  }

  return generateEnergyTheme(input);
}
