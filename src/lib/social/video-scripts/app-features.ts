/**
 * App Feature Definitions for App Demo Content
 *
 * Each feature includes problem/solution framing and demo steps
 */

export interface AppFeature {
  id: string;
  name: string;
  problem: string; // Pain point to address in hook
  solution: string; // How Lunary solves it
  steps: string[]; // Demo walkthrough steps
  screenshotPath: string; // Path to feature screenshot
  cta: string; // Call to action
  targetBenefit: 'instant' | 'personalized' | 'comprehensive' | 'actionable';
}

/**
 * App features available for demo videos
 */
export const APP_FEATURES: Record<string, AppFeature> = {
  'daily-transits': {
    id: 'daily-transits',
    name: 'Daily Transits',
    problem:
      "Generic horoscopes feel irrelevant and don't explain why today feels different",
    solution: "See exactly how today's planets affect YOUR unique birth chart",
    steps: [
      'Open Lunary app',
      'View your personalized transit overview',
      'Tap any transit to understand its specific impact on you',
      'Get actionable daily guidance based on your chart',
    ],
    screenshotPath: '/screenshots/daily-transits.png',
    cta: 'Get your personalized transits at lunary.app',
    targetBenefit: 'personalized',
  },

  'synastry-comparison': {
    id: 'synastry-comparison',
    name: 'Relationship Compatibility',
    problem:
      "Wondering if you're compatible with someone but astrology books are overwhelming",
    solution: 'Compare any two birth charts instantly and see your connection',
    steps: [
      'Enter two birth details',
      'See all aspect connections visualized',
      'Read detailed compatibility interpretation',
      'Understand your relationship dynamic',
    ],
    screenshotPath: '/screenshots/synastry.png',
    cta: 'Compare charts instantly at lunary.app',
    targetBenefit: 'instant',
  },

  'pattern-recognition': {
    id: 'pattern-recognition',
    name: 'Pattern Recognition',
    problem: "Feeling stuck in cycles but can't figure out why",
    solution:
      'Lunary tracks your patterns and shows correlations with transits',
    steps: [
      'Journal daily in the app',
      'Track your moods and significant events',
      'See correlations with transits over time',
      'Break negative patterns with awareness',
    ],
    screenshotPath: '/screenshots/patterns.png',
    cta: 'Discover your patterns at lunary.app',
    targetBenefit: 'actionable',
  },

  'birth-chart-walkthrough': {
    id: 'birth-chart-walkthrough',
    name: 'Birth Chart Explained',
    problem: 'Birth charts look overwhelming with all those symbols and lines',
    solution: 'Lunary breaks down your chart in plain English',
    steps: [
      'Enter your birth details',
      'See your chart beautifully visualized',
      'Read each placement explained simply',
      'Understand yourself on a deeper level',
    ],
    screenshotPath: '/screenshots/birth-chart.png',
    cta: 'Get your free birth chart at lunary.app',
    targetBenefit: 'comprehensive',
  },

  'aspect-analysis': {
    id: 'aspect-analysis',
    name: 'Aspect Analysis',
    problem:
      "You know your placements but don't understand how they work together",
    solution: 'See how your placements interact and what it means',
    steps: [
      'View your birth chart',
      'Tap any aspect line',
      'Read how two planets interact in your chart',
      'Understand your internal dynamics',
    ],
    screenshotPath: '/screenshots/aspects.png',
    cta: 'Explore your aspects at lunary.app',
    targetBenefit: 'comprehensive',
  },

  'moon-phase-guidance': {
    id: 'moon-phase-guidance',
    name: 'Moon Phase Rituals',
    problem: "Want to work with moon phases but don't know what to do",
    solution: 'Get personalized guidance for each moon phase',
    steps: [
      "Check today's moon phase",
      'See customized ritual suggestions',
      'Read journal prompts for this phase',
      'Track your lunar cycle over time',
    ],
    screenshotPath: '/screenshots/moon-phases.png',
    cta: 'Work with the moon at lunary.app',
    targetBenefit: 'actionable',
  },
};

/**
 * Get feature by ID
 */
export function getAppFeature(featureId: string): AppFeature {
  const feature = APP_FEATURES[featureId];
  if (!feature) {
    throw new Error(`Unknown app feature: ${featureId}`);
  }
  return feature;
}

/**
 * Get all feature IDs
 */
export function getAllFeatureIds(): string[] {
  return Object.keys(APP_FEATURES);
}

/**
 * Get features by target benefit
 */
export function getFeaturesByBenefit(
  benefit: AppFeature['targetBenefit'],
): AppFeature[] {
  return Object.values(APP_FEATURES).filter((f) => f.targetBenefit === benefit);
}

/**
 * Select feature for a specific day (rotates through features)
 */
export function selectFeatureForDate(date: Date): AppFeature {
  const features = Object.values(APP_FEATURES);
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return features[dayOfYear % features.length];
}
