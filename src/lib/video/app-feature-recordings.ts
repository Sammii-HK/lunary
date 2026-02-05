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
    | 'screenshot';
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
  /** Description of what this step does */
  description?: string;
}

/**
 * Feature recording configurations for all 6 app features
 */
export const FEATURE_RECORDINGS: FeatureRecordingConfig[] = [
  {
    id: 'daily-transits',
    name: 'Daily Transits',
    startUrl: '/',
    durationSeconds: 15,
    steps: [
      {
        type: 'wait',
        duration: 1000,
        description: 'Let app load',
      },
      {
        type: 'navigate',
        url: '/cosmic-weather',
        description: 'Navigate to cosmic weather page',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Show daily transits overview',
      },
      {
        type: 'scroll',
        distance: 300,
        description: 'Scroll to see transit details',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Show detailed transit information',
      },
      {
        type: 'click',
        selector: '[data-transit-card]:first-child',
        description: 'Click on first transit',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Show personalized interpretation',
      },
    ],
  },
  {
    id: 'synastry-comparison',
    name: 'Relationship Compatibility',
    startUrl: '/synastry',
    durationSeconds: 18,
    steps: [
      {
        type: 'wait',
        duration: 1000,
        description: 'Let page load',
      },
      {
        type: 'click',
        selector: '[data-add-person]',
        description: 'Click add person button',
      },
      {
        type: 'wait',
        duration: 1000,
        description: 'Form appears',
      },
      {
        type: 'type',
        selector: '[name="name"]',
        text: 'Alex',
        description: 'Enter name',
      },
      {
        type: 'click',
        selector: '[data-submit]',
        description: 'Submit form',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Show synastry chart',
      },
      {
        type: 'scroll',
        distance: 400,
        description: 'Scroll to compatibility insights',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Show detailed compatibility',
      },
      {
        type: 'click',
        selector: '[data-aspect-card]:first-child',
        description: 'Click on first aspect',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Show aspect interpretation',
      },
    ],
  },
  {
    id: 'pattern-recognition',
    name: 'Pattern Recognition',
    startUrl: '/patterns',
    durationSeconds: 16,
    steps: [
      {
        type: 'wait',
        duration: 1000,
        description: 'Let page load',
      },
      {
        type: 'scroll',
        distance: 200,
        description: 'Show pattern overview',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Display discovered patterns',
      },
      {
        type: 'click',
        selector: '[data-pattern-card]:first-child',
        description: 'Click on first pattern',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Show pattern details',
      },
      {
        type: 'scroll',
        distance: 300,
        description: 'Scroll to correlations',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Show transit correlations',
      },
    ],
  },
  {
    id: 'birth-chart-walkthrough',
    name: 'Birth Chart Walkthrough',
    startUrl: '/chart',
    durationSeconds: 20,
    steps: [
      {
        type: 'wait',
        duration: 2000,
        description: 'Let chart render',
      },
      {
        type: 'hover',
        selector: '[data-planet="sun"]',
        description: 'Hover over Sun',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Show Sun tooltip',
      },
      {
        type: 'hover',
        selector: '[data-planet="moon"]',
        description: 'Hover over Moon',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Show Moon tooltip',
      },
      {
        type: 'click',
        selector: '[data-planet="rising"]',
        description: 'Click Rising sign',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Show Rising interpretation',
      },
      {
        type: 'scroll',
        distance: 400,
        description: 'Scroll to planet list',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Show all placements',
      },
    ],
  },
  {
    id: 'aspect-analysis',
    name: 'Aspect Analysis',
    startUrl: '/chart',
    durationSeconds: 14,
    steps: [
      {
        type: 'wait',
        duration: 1000,
        description: 'Let page load',
      },
      {
        type: 'click',
        selector: '[data-tab="aspects"]',
        description: 'Switch to aspects tab',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Show aspects list',
      },
      {
        type: 'scroll',
        distance: 200,
        description: 'Scroll through aspects',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Display aspect grid',
      },
      {
        type: 'click',
        selector: '[data-aspect]:first-child',
        description: 'Click first aspect',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Show aspect interpretation',
      },
    ],
  },
  {
    id: 'moon-phase-guidance',
    name: 'Moon Phase Rituals',
    startUrl: '/moon',
    durationSeconds: 16,
    steps: [
      {
        type: 'wait',
        duration: 1000,
        description: 'Let page load',
      },
      {
        type: 'scroll',
        distance: 200,
        description: 'Show moon phase calendar',
      },
      {
        type: 'wait',
        duration: 2000,
        description: 'Display current phase',
      },
      {
        type: 'click',
        selector: '[data-moon-phase="full"]',
        description: 'Click full moon',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Show full moon guidance',
      },
      {
        type: 'scroll',
        distance: 300,
        description: 'Scroll to rituals',
      },
      {
        type: 'wait',
        duration: 3000,
        description: 'Show ritual suggestions',
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
