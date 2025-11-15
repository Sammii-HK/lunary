import {
  AstroTime,
  Body,
  Illumination,
  MoonPhase,
  GeoVector,
  Ecliptic,
} from 'astronomy-engine';

export interface MoonCircleContent {
  moonPhase: 'New Moon' | 'Full Moon';
  moonSign: string;
  circleDate: Date;
  guidedRitual: string;
  journalQuestions: string[];
  tarotSpreadSuggestion: string;
  aiDeepDivePrompt: string;
  moonSignInfo: string;
  intention: string;
}

const getZodiacSign = (longitude: number): string => {
  const signs = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];
  const index = Math.floor((((longitude % 360) + 360) % 360) / 30);
  return signs[index];
};

const getMoonSign = (date: Date): string => {
  const astroTime = new AstroTime(date);
  const moonVector = GeoVector(Body.Moon, astroTime, true);
  const moonEcliptic = Ecliptic(moonVector);
  const longitude = moonEcliptic.elon;
  return getZodiacSign(longitude);
};

const getMoonPhase = (date: Date): 'New Moon' | 'Full Moon' | null => {
  const astroTime = new AstroTime(date);
  const moonIllumination = Illumination(Body.Moon, astroTime);
  const moonPhaseAngle = MoonPhase(date);

  if (moonPhaseAngle >= 355 || moonPhaseAngle <= 5) {
    return 'New Moon';
  } else if (moonPhaseAngle >= 175 && moonPhaseAngle <= 185) {
    return 'Full Moon';
  }

  return null;
};

const getMoonSignInfo = (sign: string): string => {
  const signInfo: Record<string, string> = {
    Aries:
      'Aries brings fiery, pioneering energy. This is a time for bold action and new beginnings.',
    Taurus:
      'Taurus offers grounding, stability, and sensuality. Focus on building solid foundations.',
    Gemini:
      'Gemini brings communication, curiosity, and adaptability. Explore new ideas and connections.',
    Cancer:
      'Cancer emphasizes emotion, nurturing, and home. Honour your feelings and care for yourself.',
    Leo: 'Leo shines with creativity, confidence, and generosity. Express yourself authentically.',
    Virgo:
      'Virgo values precision, service, and improvement. Focus on details and practical matters.',
    Libra:
      'Libra seeks balance, harmony, and relationships. Cultivate partnerships and beauty.',
    Scorpio:
      'Scorpio brings intensity, transformation, and depth. Embrace change and explore hidden truths.',
    Sagittarius:
      'Sagittarius is adventurous, philosophical, and free. Expand your horizons and seek truth.',
    Capricorn:
      'Capricorn emphasizes ambition, discipline, and structure. Set long-term goals and work steadily.',
    Aquarius:
      'Aquarius is innovative, individualistic, and humanitarian. Embrace your uniqueness and contribute.',
    Pisces:
      'Pisces is compassionate, intuitive, and spiritual. Connect with your inner self and creativity.',
  };

  return (
    signInfo[sign] || 'The Moon brings its unique energy to guide your journey.'
  );
};

const generateGuidedRitual = (
  phase: 'New Moon' | 'Full Moon',
  sign: string,
): string => {
  const phaseGuidance: Record<string, string> = {
    'New Moon': `This New Moon in ${sign} invites you to set powerful intentions. Find a quiet space, light a candle, and write down what you wish to manifest. Be specific and feel the energy of ${sign} supporting your vision.`,
    'Full Moon': `This Full Moon in ${sign} brings clarity and completion. Create a release ritual: write down what no longer serves you, then safely burn or bury the paper. Express gratitude for what you've learned and what you're ready to let go.`,
  };

  return (
    phaseGuidance[phase] ||
    `Honour this ${phase} in ${sign} with a ritual that feels meaningful to you.`
  );
};

const generateJournalQuestions = (
  phase: 'New Moon' | 'Full Moon',
  sign: string,
): string[] => {
  const newMoonQuestions = [
    `What seeds am I planting under this New Moon in ${sign}?`,
    `How can I align my intentions with the energy of ${sign}?`,
    `What new beginning am I ready to embrace?`,
    `What do I want to manifest in the coming lunar cycle?`,
  ];

  const fullMoonQuestions = [
    `What has come to fruition under this Full Moon in ${sign}?`,
    `What am I ready to release and let go of?`,
    `How has the energy of ${sign} supported my growth?`,
    `What clarity has this Full Moon brought me?`,
  ];

  return phase === 'New Moon' ? newMoonQuestions : fullMoonQuestions;
};

const getTarotSpreadSuggestion = (phase: 'New Moon' | 'Full Moon'): string => {
  const spreads: Record<string, string> = {
    'New Moon':
      'Three-Card Spread: Past intention, Present seed, Future manifestation',
    'Full Moon':
      'Release Spread: What to honour, What to release, What to carry forward',
  };

  return (
    spreads[phase] || 'Pull cards with intention and see what guidance emerges.'
  );
};

const generateAIDeepDivePrompt = (
  phase: 'New Moon' | 'Full Moon',
  sign: string,
): string => {
  if (phase === 'New Moon') {
    return `What does this New Moon in ${sign} mean for my intentions and new beginnings? How can I align with this lunar energy?`;
  } else {
    return `What does this Full Moon in ${sign} reveal about what I need to release? How can I honour what's coming to completion?`;
  }
};

export async function generateMoonCircle(
  date: Date = new Date(),
): Promise<MoonCircleContent | null> {
  const phase = getMoonPhase(date);
  if (!phase) {
    return null;
  }

  const sign = getMoonSign(date);
  const moonSignInfo = getMoonSignInfo(sign);
  const guidedRitual = generateGuidedRitual(phase, sign);
  const journalQuestions = generateJournalQuestions(phase, sign);
  const tarotSpreadSuggestion = getTarotSpreadSuggestion(phase);
  const aiDeepDivePrompt = generateAIDeepDivePrompt(phase, sign);

  const intention =
    phase === 'New Moon'
      ? `Set intentions aligned with ${sign}'s energy`
      : `Release and honour completion under ${sign}'s illumination`;

  return {
    moonPhase: phase,
    moonSign: sign,
    circleDate: date,
    guidedRitual,
    journalQuestions,
    tarotSpreadSuggestion,
    aiDeepDivePrompt,
    moonSignInfo,
    intention,
  };
}
