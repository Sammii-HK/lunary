/**
 * App Feature Recording Configuration
 *
 * Generates Playwright recording configs from TikTok scripts.
 * Single source of truth: tiktok-scripts.ts defines the storyboard,
 * this file converts scenes → recording steps.
 */

import {
  TIKTOK_SCRIPTS,
  type TikTokScript,
  type Scene,
} from './tiktok-scripts';

export interface FeatureRecordingConfig {
  /** Feature ID from tiktok-scripts.ts */
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
  /** Whether this feature requires authentication (default: true) */
  requiresAuth?: boolean;
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
  /** If true, force the click even if element is obscured */
  force?: boolean;
}

/** Per-script overrides for the generator */
interface ScriptOverrides {
  /** Steps to insert before the generated steps */
  beforeSteps?: RecordingStep[];
  /** Steps to insert after specific scene indices */
  afterScene?: Record<number, RecordingStep[]>;
  /** Override requiresAuth (default: true) */
  requiresAuth?: boolean;
}

/**
 * Convert a TikTok scene action to RecordingStep(s)
 */
function sceneToSteps(scene: Scene): RecordingStep[] {
  const steps: RecordingStep[] = [];
  const durationMs = scene.durationSeconds * 1000;

  switch (scene.action) {
    case 'show':
      steps.push({
        type: 'wait',
        duration: durationMs,
        description: scene.description,
      });
      break;

    case 'scroll':
      steps.push({
        type: 'scroll',
        distance: scene.scrollDistance || 300,
        description: scene.description,
      });
      // Use remaining time as a wait to let content settle
      steps.push({
        type: 'wait',
        duration: Math.max(durationMs - 1000, 500),
        description: `Show: ${scene.focusPoint}`,
      });
      break;

    case 'click':
    case 'expand':
      if (scene.target) {
        steps.push({
          type: 'click',
          selector: scene.target,
          description: scene.description,
          force: true,
          optional: true,
        });
        steps.push({
          type: 'wait',
          duration: Math.max(durationMs - 500, 500),
          description: `Show: ${scene.focusPoint}`,
        });
      }
      break;

    case 'type':
      if (scene.target && scene.typeText) {
        steps.push({
          type: 'type',
          selector: scene.target,
          text: scene.typeText,
          description: scene.description,
        });
        steps.push({
          type: 'wait',
          duration: Math.max(durationMs - 1000, 500),
          description: `Show: ${scene.focusPoint}`,
        });
      }
      break;

    case 'navigate':
      steps.push({
        type: 'navigate',
        url: scene.target || scene.path,
        description: scene.description,
      });
      steps.push({
        type: 'wait',
        duration: Math.max(durationMs - 1500, 500),
        description: `Show: ${scene.focusPoint}`,
      });
      break;

    case 'wait':
      steps.push({
        type: 'wait',
        duration: durationMs,
        description: scene.description,
      });
      break;
  }

  return steps;
}

/**
 * Generate a FeatureRecordingConfig from a TikTok script
 */
function generateRecordingFromScript(
  script: TikTokScript,
  overrides?: ScriptOverrides,
): FeatureRecordingConfig {
  const steps: RecordingStep[] = [];

  // Add pre-steps (e.g., dismiss modals)
  if (overrides?.beforeSteps) {
    steps.push(...overrides.beforeSteps);
  }

  // Add hook wait
  steps.push({
    type: 'wait',
    duration: script.hook.durationSeconds * 1000,
    description: `Hook: ${script.hook.text.substring(0, 60)}...`,
  });

  // Process each scene
  let lastPath = script.scenes[0]?.path || '';

  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];

    // Auto-insert navigate when path changes (and action isn't already navigate)
    if (scene.path !== lastPath && scene.action !== 'navigate') {
      steps.push({
        type: 'navigate',
        url: scene.path,
        description: `Navigate to ${scene.path}`,
      });
      steps.push({
        type: 'wait',
        duration: 1500,
        description: 'Wait for page load',
      });
    }

    // Convert scene to recording steps
    steps.push(...sceneToSteps(scene));

    // Add per-scene overrides
    if (overrides?.afterScene?.[i]) {
      steps.push(...overrides.afterScene[i]);
    }

    lastPath = scene.path;
  }

  // Add outro wait
  steps.push({
    type: 'wait',
    duration: script.outro.durationSeconds * 1000,
    description: `Outro: ${script.outro.text}`,
  });

  return {
    id: script.id,
    name: script.title,
    startUrl: script.scenes[0]?.path || '/app',
    steps,
    durationSeconds: script.totalSeconds,
    viewport: { width: 390, height: 844 },
    requiresAuth: overrides?.requiresAuth ?? true,
  };
}

// ============================================================================
// RECORDING CONFIGS — generated from TikTok scripts with per-script overrides
// ============================================================================

const DISMISS_MODALS: RecordingStep[] = [
  {
    type: 'pressKey',
    key: 'Escape',
    description: 'Close any open modals',
  },
  {
    type: 'wait',
    duration: 1000,
    description: 'Wait for modal to close',
  },
];

/** Script-specific overrides */
const OVERRIDES: Record<string, ScriptOverrides> = {
  'dashboard-overview': {
    beforeSteps: DISMISS_MODALS,
  },
  'sky-now-deepdive': {
    beforeSteps: DISMISS_MODALS,
  },
  'ritual-system': {
    beforeSteps: DISMISS_MODALS,
  },
  'horoscope-deepdive': {
    // Close numerology modal after scene 2 (click numerology-day)
    afterScene: {
      2: [
        {
          type: 'pressKey',
          key: 'Escape',
          description: 'Close numerology modal',
        },
        {
          type: 'wait',
          duration: 500,
          description: 'Wait for modal to close',
        },
      ],
    },
  },
  'numerology-deepdive': {
    // numerology-close click is already in the scenes
  },
  'profile-circle': {
    // Need to navigate to profile first (circle tab), friend card click is in scenes
  },
  'crystals-overview': {
    requiresAuth: false,
  },
  'spells-overview': {
    requiresAuth: false,
  },
  'grimoire-search': {
    requiresAuth: false,
    // Scroll back to top after category scroll so search input is visible for typing
    afterScene: {
      1: [
        {
          type: 'scroll',
          distance: -400,
          description: 'Scroll back to search bar',
        },
        {
          type: 'wait',
          duration: 500,
          description: 'Let scroll settle',
        },
      ],
    },
  },
};

/**
 * Generate all recording configs from TikTok scripts
 */
function generateAllConfigs(): FeatureRecordingConfig[] {
  return TIKTOK_SCRIPTS.map((script) => {
    const overrides = OVERRIDES[script.id];
    return generateRecordingFromScript(script, overrides);
  });
}

/**
 * All 16 feature recording configurations
 */
export const FEATURE_RECORDINGS: FeatureRecordingConfig[] =
  generateAllConfigs();

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
