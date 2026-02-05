/**
 * App Feature Recording Configuration
 *
 * Defines how to navigate and record each app feature for demo videos
 */

export interface FeatureRecordingConfig {
  /** Feature ID from app-features.ts */
  id: string;
  /** Feature name */
  name: string;
  /** Starting URL for the feature */
  startUrl: string;
  /** Steps to perform during recording */
  steps: RecordingStep[];
  /** Duration in seconds to record */
  durationSeconds: number;
  /** Viewport size for recording */
  viewport?: { width: number; height: number };
}

export interface RecordingStep {
  /** Action type */
  type:
    | 'navigate'
    | 'click'
    | 'type'
    | 'wait'
    | 'scroll'
    | 'hover'
    | 'screenshot'
    | 'pressKey';
  /** Selector for the element (for click, type, hover) */
  selector?: string;
  /** Text to type (for type action) */
  text?: string;
  /** URL to navigate to (for navigate action) */
  url?: string;
  /** Wait duration in ms (for wait action) */
  duration?: number;
  /** Scroll distance in pixels (for scroll action) */
  distance?: number;
  /** Key to press (for pressKey action) - e.g., 'Escape', 'Enter' */
  key?: string;
  /** Description of what this step does */
  description?: string;
  /** If true, step failure won't stop recording (optional interactions) */
  optional?: boolean;
  /** If true, force the click even if element is obscured (bypasses actionability checks) */
  force?: boolean;
}

/**
 * Feature recording configurations for all 6 app features
 */
export const FEATURE_RECORDINGS: FeatureRecordingConfig[] = [
  {
    id: 'dashboard-overview-simple',
    name: 'Dashboard Overview (Simple)',
    startUrl: '/app',
    durationSeconds: 15,
    viewport: { width: 390, height: 844 }, // iPhone 12 Pro
    steps: [
      {
        type: 'wait',
        duration: 3000,
        description: 'Let dashboard fully load',
      },
      {
        type: 'pressKey',
        key: 'Escape',
        description: 'Close any modals',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Wait after escape',
      },
      {
        type: 'scroll',
        distance: 400,
        description: 'Scroll through dashboard',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Show content',
      },
      {
        type: 'scroll',
        distance: 400,
        description: 'Continue scrolling',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Show more content',
      },
    ],
  },
  {
    id: 'dashboard-overview',
    name: 'Dashboard Overview',
    startUrl: '/app',
    durationSeconds: 18,
    steps: [
      {
        type: 'wait',
        duration: 2000,
        description: 'Let dashboard load',
      },
      {
        type: 'pressKey',
        key: 'Escape',
        description: 'Close any open modals (press Escape)',
      },
      {
        type: 'wait',
        duration: 500,
        description: 'Wait for modal to start closing',
      },
      {
        type: 'click',
        selector:
          '.fixed.inset-0.bg-black, [class*="backdrop"], [class*="overlay"]',
        description: 'Click backdrop to close modal',
        optional: true,
      },
      {
        type: 'wait',
        duration: 1000,
        description: 'Wait for modal to fully close',
      },
      {
        type: 'scroll',
        distance: 200,
        description: 'Show moon phase section',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Display moon phases',
      },
      {
        type: 'click',
        selector: '[data-testid="sky-now-widget"]',
        description: 'Expand sky now widget',
        force: true, // Force click even if backdrop is present
      },
      {
        type: 'wait',
        duration: 2500,
        description: 'Show all planetary positions',
      },
      {
        type: 'scroll',
        distance: 300,
        description: 'Scroll to transits section',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Show daily transits',
      },
      {
        type: 'scroll',
        distance: 300,
        description: 'Scroll to tarot cards',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Display tarot cards',
      },
      {
        type: 'scroll',
        distance: 200,
        description: 'Scroll to crystal recommendation',
      },
      {
        type: 'wait',
        duration: 1500,
        description: 'Let crystal card load',
      },
      {
        type: 'click',
        selector: '[data-testid="crystal-card"]',
        description: 'Open crystal recommendation',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Show crystal modal',
      },
    ],
  },
  {
    id: 'horoscope-deepdive',
    name: 'Horoscope Deep Dive',
    startUrl: '/horoscope',
    durationSeconds: 20,
    steps: [
      {
        type: 'wait',
        duration: 2000,
        description: 'Let horoscope load',
      },
      {
        type: 'scroll',
        distance: 200,
        description: 'Show personal numerology',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Display numerology insights',
      },
      {
        type: 'scroll',
        distance: 350,
        description: 'Scroll to transit wisdom',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Show personalized transit wisdom',
      },
      {
        type: 'scroll',
        distance: 350,
        description: 'Scroll to upcoming transits',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Display upcoming transits',
      },
      {
        type: 'scroll',
        distance: 300,
        description: 'Scroll to more content',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Show additional insights',
      },
    ],
  },
  {
    id: 'tarot-patterns',
    name: 'Tarot Pattern Analysis',
    startUrl: '/tarot',
    durationSeconds: 20,
    steps: [
      {
        type: 'wait',
        duration: 2000,
        description: 'Let tarot page load',
      },
      {
        type: 'scroll',
        distance: 250,
        description: 'Show daily and weekly cards',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Display tarot cards',
      },
      {
        type: 'scroll',
        distance: 300,
        description: 'Scroll to pattern analysis',
      },
      {
        type: 'wait',
        duration: 2500,
        description: 'Show pattern timeframes',
      },
      {
        type: 'click',
        selector:
          '[data-pattern-timeframe]:first-child, button:has-text("7 days"), button:has-text("14 days")',
        description: 'Select pattern timeframe',
      },
      {
        type: 'wait',
        duration: 2500,
        description: 'Display pattern insights',
      },
      {
        type: 'scroll',
        distance: 300,
        description: 'Scroll to rituals',
      },
      {
        type: 'wait',
        duration: 2500,
        description: 'Show ritual suggestions',
      },
      {
        type: 'scroll',
        distance: 250,
        description: 'Scroll to journal prompts',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Display journal prompts',
      },
    ],
  },
  {
    id: 'astral-guide',
    name: 'Astral Guide AI Assistant',
    startUrl: '/guide',
    durationSeconds: 18,
    steps: [
      {
        type: 'wait',
        duration: 2000,
        description: 'Let guide page load',
      },
      {
        type: 'click',
        selector:
          'button:has-text("Tarot Patterns"), [data-guide-option="tarot"]',
        description: 'Select tarot patterns option',
      },
      {
        type: 'wait',
        duration: 2500,
        description: 'Show tarot pattern prompt',
      },
      {
        type: 'type',
        selector: 'textarea, [contenteditable="true"], input[type="text"]',
        text: 'What patterns do you see in my recent cards?',
        description: 'Type question',
      },
      {
        type: 'click',
        selector:
          'button[type="submit"], button:has-text("Send"), [aria-label="Send"]',
        description: 'Send question',
      },
      {
        type: 'wait',
        duration: 4000,
        description: 'Show AI response',
      },
      {
        type: 'scroll',
        distance: 300,
        description: 'Scroll through response',
      },
      {
        type: 'wait',
        duration: 2500,
        description: 'Display full AI insights',
      },
    ],
  },
  {
    id: 'birth-chart',
    name: 'Birth Chart Walkthrough',
    startUrl: '/chart',
    durationSeconds: 22,
    steps: [
      {
        type: 'wait',
        duration: 2500,
        description: 'Let chart render fully',
      },
      {
        type: 'scroll',
        distance: 200,
        description: 'Show chart visualization',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Display planetary positions',
      },
      {
        type: 'scroll',
        distance: 350,
        description: 'Scroll to planetary list',
      },
      {
        type: 'wait',
        duration: 2500,
        description: 'Show all planet placements',
      },
      {
        type: 'click',
        selector: '[data-tab="aspects"], button:has-text("Aspects")',
        description: 'Switch to aspects tab',
      },
      {
        type: 'wait',
        duration: 2500,
        description: 'Show aspects list',
      },
      {
        type: 'scroll',
        distance: 300,
        description: 'Scroll through aspects',
      },
      {
        type: 'wait',
        duration: 2500,
        description: 'Display detailed aspects',
      },
      {
        type: 'click',
        selector: '[data-tab="houses"], button:has-text("Houses")',
        description: 'Switch to houses tab',
      },
      {
        type: 'wait',
        duration: 2500,
        description: 'Show house placements',
      },
    ],
  },
  {
    id: 'profile-circle',
    name: 'Profile & Circle',
    startUrl: '/profile',
    durationSeconds: 18,
    steps: [
      {
        type: 'wait',
        duration: 2000,
        description: 'Let profile load',
      },
      {
        type: 'scroll',
        distance: 250,
        description: 'Show profile information',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Display user stats',
      },
      {
        type: 'click',
        selector:
          '[data-tab="circle"], button:has-text("Circle"), a[href*="circle"]',
        description: 'Navigate to circle',
      },
      {
        type: 'wait',
        duration: 2500,
        description: 'Show circle/friends list',
      },
      {
        type: 'scroll',
        distance: 300,
        description: 'Scroll through circle',
      },
      {
        type: 'wait',
        duration: 2500,
        description: 'Display leaderboard',
      },
      {
        type: 'click',
        selector: '[data-friend]:first-child, [class*="friend" i]:first-child',
        description: 'Click on friend',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Show synastry comparison',
      },
    ],
  },
];

/**
 * Get recording config for a specific feature
 */
export function getFeatureRecording(featureId: string): FeatureRecordingConfig {
  const config = FEATURE_RECORDINGS.find((r) => r.id === featureId);
  if (!config) {
    throw new Error(`No recording config found for feature: ${featureId}`);
  }
  return config;
}

/**
 * Get all feature IDs that need recording
 */
export function getAllFeatureIds(): string[] {
  return FEATURE_RECORDINGS.map((r) => r.id);
}
