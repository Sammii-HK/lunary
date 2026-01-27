/**
 * Hook generation and validation for video scripts
 */

import { ContentAspect } from '../shared/types';
import { pickRandom } from '../shared/text/normalize';
import {
  ensureSentenceEndsWithPunctuation,
  normalizeHookLine,
  getSearchPhraseForTopic,
} from '../shared/text/normalize';
import { getFirstSentence, needsLineRewrite } from '../shared/text/truncation';
import { validateVideoHook, isHookLikeLine } from './validation';
import { DEBUG_VIDEO_HOOK } from './constants';
import type { EnsureVideoHookOptions, EnsureVideoHookResult } from './types';

/**
 * Diverse hook templates organized by style
 */
export const HOOK_TEMPLATES = {
  // Direct observation hooks
  observation: [
    `${'{topic}'} shows up differently than most people expect.`,
    `${'{topic}'} tends to feel subtle at first.`,
    `${'{topic}'} changes how you read certain moments.`,
    `${'{topic}'} appears when you least expect it.`,
    `${'{topic}'} reveals itself through small details.`,
  ],

  // Pattern recognition hooks
  pattern: [
    `Watch for ${'{topic}'} when things shift unexpectedly.`,
    `${'{topic}'} often gets confused with something else entirely.`,
    `You'll notice ${'{topic}'} in how decisions feel, not sound.`,
    `${'{topic}'} doesn't announce itself the way you'd think.`,
    `${'{topic}'} leaves clues that are easy to miss.`,
  ],

  // Reframe hooks
  reframe: [
    `${'{topic}'} isn't about what happens, but how it registers.`,
    `${'{topic}'} works through nuance, not drama.`,
    `${'{topic}'} means something specific, not general.`,
    `${'{topic}'} operates on a different timeline than you'd expect.`,
    `${'{topic}'} matters for reasons that aren't obvious.`,
  ],

  // Invitation hooks
  invitation: [
    `Let me show you what ${'{topic}'} actually tracks.`,
    `Here's what ${'{topic}'} tells you about timing.`,
    `${'{topic}'} gives you one clear signal to watch.`,
    `${'{topic}'} points to something specific you can test.`,
    `There's a pattern in ${'{topic}'} worth knowing.`,
  ],

  // Contrast hooks
  contrast: [
    `${'{topic}'} isn't a mood, it's a recognizable shift.`,
    `${'{topic}'} doesn't mean what the internet says.`,
    `${'{topic}'} feels personal, but follows a pattern.`,
    `${'{topic}'} operates quietly, not loudly.`,
    `${'{topic}'} guides choices, not just feelings.`,
  ],

  // Question hooks
  question: [
    `Ever wonder when ${'{topic}'} actually matters?`,
    `What does ${'{topic}'} feel like in real time?`,
    `How do you know ${'{topic}'} is active right now?`,
  ],

  // Timing hooks
  timing: [
    `${'{topic}'} has a narrow window you can actually use.`,
    `${'{topic}'} peaks at a specific moment you can track.`,
    `${'{topic}'} tells you when to move, not just why.`,
    `${'{topic}'} creates a window that doesn't last long.`,
  ],

  // Insight hooks
  insight: [
    `${'{topic}'} reveals something most people overlook.`,
    `${'{topic}'} carries meaning that shifts with context.`,
    `${'{topic}'} connects to something larger than itself.`,
    `${'{topic}'} holds information you can actually use.`,
    `${'{topic}'} offers clarity once you know what to watch.`,
  ],

  // Experiential hooks
  experiential: [
    `${'{topic}'} registers in your body before your mind.`,
    `${'{topic}'} creates a feeling you can learn to recognize.`,
    `${'{topic}'} shows up in how you move through choices.`,
    `${'{topic}'} influences energy in ways that are trackable.`,
  ],

  // Practical hooks
  practical: [
    `${'{topic}'} gives you one thing to watch today.`,
    `${'{topic}'} helps you read a specific kind of moment.`,
    `${'{topic}'} clarifies when to act versus when to wait.`,
    `${'{topic}'} offers a lens for interpreting what's happening.`,
  ],
};

/**
 * Select hook style based on content aspect
 */
export function selectHookStyle(
  aspect: ContentAspect,
): keyof typeof HOOK_TEMPLATES {
  const styleMap: Record<ContentAspect, Array<keyof typeof HOOK_TEMPLATES>> = {
    [ContentAspect.CORE_MEANING]: [
      'observation',
      'insight',
      'invitation',
      'practical',
    ],
    [ContentAspect.COMMON_MISCONCEPTION]: [
      'reframe',
      'contrast',
      'pattern',
      'invitation',
    ],
    [ContentAspect.EMOTIONAL_IMPACT]: [
      'experiential',
      'observation',
      'pattern',
      'invitation',
    ],
    [ContentAspect.REAL_LIFE_EXPRESSION]: [
      'pattern',
      'experiential',
      'observation',
      'practical',
    ],
    [ContentAspect.TIMING_AND_CONTEXT]: [
      'timing',
      'pattern',
      'observation',
      'practical',
    ],
    [ContentAspect.PRACTICAL_APPLICATION]: [
      'practical',
      'invitation',
      'insight',
      'observation',
    ],
    [ContentAspect.WHEN_TO_AVOID]: [
      'timing',
      'contrast',
      'reframe',
      'practical',
    ],
    [ContentAspect.SUBTLE_INSIGHT]: [
      'insight',
      'pattern',
      'reframe',
      'observation',
    ],
  };

  const preferredStyles = styleMap[aspect] || [
    'observation',
    'pattern',
    'invitation',
    'practical',
  ];
  return preferredStyles[Math.floor(Math.random() * preferredStyles.length)];
}

/**
 * Build hook for topic
 */
export function buildHookForTopic(
  topic: string,
  aspect?: ContentAspect,
): string {
  const safeTopic = topic.trim();

  const style = aspect
    ? selectHookStyle(aspect)
    : pickRandom(
        Object.keys(HOOK_TEMPLATES) as Array<keyof typeof HOOK_TEMPLATES>,
      );
  const templates = HOOK_TEMPLATES[style];
  const selectedTemplate =
    templates[Math.floor(Math.random() * templates.length)];

  return selectedTemplate.replace(/\{topic\}/g, safeTopic);
}

/**
 * Log video hook event (debug only)
 */
const logVideoHookEvent = (
  detail: string,
  context: EnsureVideoHookOptions & { changed: boolean; issues?: string[] },
): void => {
  if (!DEBUG_VIDEO_HOOK) return;
  const dateLabel = context.scheduledDate
    ? context.scheduledDate.toISOString().split('T')[0]
    : 'unknown';
  const idLabel = context.scriptId ? `id=${context.scriptId}` : 'id=unsaved';
  const issueLabel = context.issues?.length
    ? ` issues=${context.issues.join('|')}`
    : '';
  console.log(
    `[video-hook] ${detail} source=${context.source || 'unknown'} ${idLabel} topic=${context.topic} date=${dateLabel} changed=${context.changed}${issueLabel}`,
  );
};

/**
 * Ensure video script has valid hook
 */
export const ensureVideoHook = (
  script: string,
  options: EnsureVideoHookOptions,
): EnsureVideoHookResult => {
  const trimmedScript = (script || '').trim();
  const topic = options.topic;
  const searchPhrase = getSearchPhraseForTopic(topic, options.category);
  const firstSentence = getFirstSentence(trimmedScript);
  let hookLine = '';
  let modified = false;
  let issues: string[] = [];

  if (firstSentence) {
    const normalized = normalizeHookLine(firstSentence);
    issues = validateVideoHook(normalized, topic, searchPhrase);
    if (issues.length === 0) {
      hookLine = normalized;
    }
  } else {
    issues = ['Hook missing'];
  }

  if (!hookLine) {
    const fallbackHook = normalizeHookLine(buildHookForTopic(topic, undefined));
    hookLine = fallbackHook;
    modified = true;
  }

  hookLine = ensureSentenceEndsWithPunctuation(hookLine);
  if (hookLine.length > 140) {
    hookLine = `${hookLine.substring(0, 140).trim()}`;
    hookLine = ensureSentenceEndsWithPunctuation(hookLine);
  }

  let bodyAfterHook = trimmedScript;
  if (modified && firstSentence) {
    bodyAfterHook = trimmedScript.slice(firstSentence.length).trim();
  }
  const normalizedHook = normalizeHookLine(hookLine);
  const bodyLinesRaw = bodyAfterHook
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  let cleanedBodyLines = bodyLinesRaw;
  while (
    cleanedBodyLines.length > 0 &&
    (normalizeHookLine(cleanedBodyLines[0]) === normalizedHook ||
      isHookLikeLine(cleanedBodyLines[0], topic, searchPhrase))
  ) {
    cleanedBodyLines = cleanedBodyLines.slice(1);
    modified = true;
  }
  while (
    cleanedBodyLines.length > 0 &&
    needsLineRewrite(cleanedBodyLines[cleanedBodyLines.length - 1])
  ) {
    cleanedBodyLines = cleanedBodyLines.slice(0, -1);
    modified = true;
  }
  if (cleanedBodyLines.length > 0) {
    bodyAfterHook = cleanedBodyLines.join('\n');
  }
  const finalScript = modified
    ? `${hookLine}\n\n${bodyAfterHook}`.trim()
    : trimmedScript;

  logVideoHookEvent('hook-check', {
    ...options,
    changed: modified,
    issues: modified ? issues : undefined,
  });

  return {
    script: finalScript,
    hook: hookLine,
    modified,
    issues: modified ? issues : undefined,
  };
};
