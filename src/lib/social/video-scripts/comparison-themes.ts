/**
 * Comparison Themes for Before/After Content
 *
 * Highlights Lunary's moat and value proposition
 */

export interface ComparisonTheme {
  id: string;
  title: string;
  hook: string; // Opening statement (3s)
  beforeTitle: string;
  beforePoints: string[]; // Pain points of old way
  afterTitle: string;
  afterPoints: string[]; // Benefits with Lunary
  appScreenshot: string;
  cta: string;
  moatFocus: 'speed' | 'personalization' | 'depth' | 'accessibility';
}

/**
 * Comparison themes for video content
 */
export const COMPARISON_THEMES: Record<string, ComparisonTheme> = {
  'instant-vs-waiting': {
    id: 'instant-vs-waiting',
    title: 'Instant Insights vs Waiting for a Reading',
    hook: 'Stop waiting days for answers you can get right now',
    beforeTitle: 'Traditional Readings',
    beforePoints: [
      'Book appointment days in advance',
      'Pay $100+ per session',
      'Get generic guidance',
      'No follow-up or tracking',
    ],
    afterTitle: 'With Lunary',
    afterPoints: [
      'Instant access 24/7',
      'Personalized to YOUR chart',
      'Daily updates included',
      'Track patterns over time',
    ],
    appScreenshot: '/screenshots/instant-reading.png',
    cta: 'Get instant insights at lunary.app',
    moatFocus: 'speed',
  },

  'personalized-vs-generic': {
    id: 'personalized-vs-generic',
    title: 'Personal vs Generic Horoscopes',
    hook: "Your horoscope shouldn't apply to millions of people",
    beforeTitle: 'Generic Horoscopes',
    beforePoints: [
      'Read your sun sign only',
      'Vague statements that fit anyone',
      'Same text for millions of people',
      'Miss important personal transits',
    ],
    afterTitle: 'Lunary Personal',
    afterPoints: [
      'See YOUR complete birth chart',
      'Specific to your unique placements',
      'Content generated just for you',
      'Never miss a transit that affects you',
    ],
    appScreenshot: '/screenshots/personalized.png',
    cta: 'Get your personal insights at lunary.app',
    moatFocus: 'personalization',
  },

  'learning-vs-searching': {
    id: 'learning-vs-searching',
    title: 'Easy Learning vs Hours of Research',
    hook: "Learning astrology shouldn't take years of research",
    beforeTitle: 'Traditional Learning',
    beforePoints: [
      'Read dozens of books',
      'Search multiple websites',
      'Confusing jargon everywhere',
      'Hard to apply to yourself',
    ],
    afterTitle: 'Lunary Makes it Easy',
    afterPoints: [
      'All knowledge in one place',
      'Plain English explanations',
      'Applied to YOUR chart',
      'Learn by exploring yourself',
    ],
    appScreenshot: '/screenshots/grimoire.png',
    cta: 'Start learning at lunary.app',
    moatFocus: 'accessibility',
  },

  'surface-vs-depth': {
    id: 'surface-vs-depth',
    title: 'Surface vs Deep Understanding',
    hook: "There's so much more to you than your sun sign",
    beforeTitle: 'Surface Astrology',
    beforePoints: [
      'Know your sun sign only',
      'Read daily horoscopes',
      'Miss your moon, rising, planets',
      'Never understand the full picture',
    ],
    afterTitle: 'Deep with Lunary',
    afterPoints: [
      'Explore your full chart',
      'Understand all your placements',
      'See how planets interact',
      'Get the complete picture',
    ],
    appScreenshot: '/screenshots/full-chart.png',
    cta: 'Discover your depth at lunary.app',
    moatFocus: 'depth',
  },
};

/**
 * Get comparison theme by ID
 */
export function getComparisonTheme(themeId: string): ComparisonTheme {
  const theme = COMPARISON_THEMES[themeId];
  if (!theme) {
    throw new Error(`Unknown comparison theme: ${themeId}`);
  }
  return theme;
}

/**
 * Get all comparison theme IDs
 */
export function getAllComparisonIds(): string[] {
  return Object.keys(COMPARISON_THEMES);
}

/**
 * Select comparison theme for a specific date (rotates through themes)
 */
export function selectComparisonForDate(date: Date): ComparisonTheme {
  const themes = Object.values(COMPARISON_THEMES);
  const weekNumber = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
  return themes[weekNumber % themes.length];
}
