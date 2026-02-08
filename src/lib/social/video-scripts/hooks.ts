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
    `${'{topic}'} catches you off guard the first time.`,
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
    `${'{topic}'} has one tell that gives it away.`,
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
    `There is one signal from ${'{topic}'} worth tracking.`,
    `${'{topic}'} tells you more about timing than you'd expect.`,
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
    `When does ${'{topic}'} actually matter?`,
    `What does ${'{topic}'} feel like in real time?`,
    `How do you know ${'{topic}'} is active right now?`,
    `What happens when you ignore ${'{topic}'}?`,
    `Why does ${'{topic}'} hit harder at certain moments?`,
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

  // Challenge hooks — pattern interrupt, debunking
  challenge: [
    `${'{topic}'} is not what TikTok told you.`,
    `${'{topic}'} gets misread more than any other.`,
    `Stop reading ${'{topic}'} the way everyone else does.`,
    `${'{topic}'} works the opposite of how it sounds.`,
  ],

  // List hooks — numbered, curiosity-driven
  list: [
    `${'{topic}'} has three layers most miss.`,
    `Two things about ${'{topic}'} nobody explains.`,
    `${'{topic}'} hits differently when you know these parts.`,
    `The overlooked detail in ${'{topic}'} that changes everything.`,
  ],

  // Urgency hooks — timely, action-oriented
  urgency: [
    `${'{topic}'} is active right now and here is why.`,
    `${'{topic}'} shifts this week and you should know.`,
    `${'{topic}'} matters more right now than usual.`,
    `This is the window for ${'{topic}'} and it is closing.`,
  ],

  // "Nobody talks about" hooks — instant curiosity gap
  nobody_talks_about: [
    `Nobody talks about the weird part of ${'{topic}'}.`,
    `The part of ${'{topic}'} nobody warns you about.`,
    `${'{topic}'} has a side effect nobody mentions.`,
    `There is a detail about ${'{topic}'} that changes everything.`,
  ],

  // "Reframe reveal" hooks — aha-moment from observer position
  reframe_reveal: [
    `One detail about ${'{topic}'} reframes the whole thing.`,
    `${'{topic}'} makes more sense once you see this one part.`,
    `${'{topic}'} looks completely different from this angle.`,
    `Most people miss the part of ${'{topic}'} that matters most.`,
  ],

  // "Wrong about" hooks — strong pattern interrupt
  wrong_about: [
    `You have been reading ${'{topic}'} wrong this whole time.`,
    `Everything you learned about ${'{topic}'} missed this.`,
    `${'{topic}'} does the opposite of what you think.`,
    `The common take on ${'{topic}'} is backwards.`,
  ],
};

/**
 * Audience-tier style preferences (#2)
 * Discovery: curiosity-gap hooks for cold audiences
 * Consideration: insight-driven hooks for warm audiences
 * Conversion: action-oriented hooks for hot audiences
 */
const AUDIENCE_STYLE_PREFERENCES: Record<
  string,
  Array<keyof typeof HOOK_TEMPLATES>
> = {
  discovery: [
    'question',
    'observation',
    'nobody_talks_about',
    'pattern',
    'reframe_reveal',
  ],
  consideration: ['insight', 'list', 'invitation', 'reframe', 'practical'],
  conversion: [
    'contrast',
    'challenge',
    'wrong_about',
    'urgency',
    'experiential',
  ],
};

/**
 * Select hook style based on content aspect and target audience (#2)
 */
export function selectHookStyle(
  aspect: ContentAspect,
  targetAudience?: 'discovery' | 'consideration' | 'conversion',
): keyof typeof HOOK_TEMPLATES {
  const styleMap: Record<ContentAspect, Array<keyof typeof HOOK_TEMPLATES>> = {
    [ContentAspect.CORE_MEANING]: [
      'observation',
      'insight',
      'invitation',
      'practical',
    ],
    [ContentAspect.COMMON_MISCONCEPTION]: [
      'wrong_about',
      'challenge',
      'reframe',
      'contrast',
    ],
    [ContentAspect.EMOTIONAL_IMPACT]: [
      'reframe_reveal',
      'experiential',
      'observation',
      'pattern',
    ],
    [ContentAspect.REAL_LIFE_EXPRESSION]: [
      'pattern',
      'experiential',
      'observation',
      'practical',
    ],
    [ContentAspect.TIMING_AND_CONTEXT]: [
      'urgency',
      'timing',
      'pattern',
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
      'nobody_talks_about',
      'list',
      'insight',
      'pattern',
    ],
  };

  const aspectStyles = styleMap[aspect] || [
    'observation',
    'pattern',
    'invitation',
    'practical',
  ];

  // Intersect with audience preferences when available
  if (targetAudience && AUDIENCE_STYLE_PREFERENCES[targetAudience]) {
    const audienceStyles = AUDIENCE_STYLE_PREFERENCES[targetAudience];
    const intersection = aspectStyles.filter((s) => audienceStyles.includes(s));
    if (intersection.length > 0) {
      return intersection[Math.floor(Math.random() * intersection.length)];
    }
  }

  return aspectStyles[Math.floor(Math.random() * aspectStyles.length)];
}

/**
 * Identity trigger templates for zodiac content types (#9)
 * {sign} is replaced with the extracted sign name
 */
const IDENTITY_TRIGGERS: Record<string, string[]> = {
  zodiac_sun: [
    '{sign}s already know this.',
    'If you are a {sign}, pay attention.',
    '{sign}s felt this before they read it.',
  ],
  zodiac_moon: [
    '{sign} moons, this is yours.',
    '{sign} moon? This explains a lot.',
    '{sign} moons process this differently.',
  ],
  zodiac_rising: [
    '{sign} risings, you felt this.',
    'If your rising is {sign}, read that again.',
    '{sign} risings project this without trying.',
  ],
};

/**
 * Extract sign name from a topic string
 */
function extractSignFromTopic(topic: string): string | null {
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
  for (const sign of signs) {
    if (topic.toLowerCase().includes(sign.toLowerCase())) return sign;
  }
  return null;
}

/**
 * Build a comment-bait identity trigger line for zodiac content (#9)
 * Returns null for non-zodiac or unrecognized topics
 */
export function buildCommentBaitHook(
  topic: string,
  contentTypeKey: string,
): string | null {
  const triggers = IDENTITY_TRIGGERS[contentTypeKey];
  if (!triggers) return null;

  const sign = extractSignFromTopic(topic);
  if (!sign) return null;

  const template = triggers[Math.floor(Math.random() * triggers.length)];
  return template.replace(/\{sign\}/g, sign);
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
