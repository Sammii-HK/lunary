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
 * Identity trigger templates for ALL content types
 * {sign} is replaced with the extracted sign name (zodiac types)
 * {topic} is replaced with the facet title (all types)
 */
const IDENTITY_TRIGGERS: Record<string, string[]> = {
  // Zodiac triggers (expanded to 6-8 each)
  zodiac_sun: [
    '{sign}s already know this.',
    'If you are a {sign}, pay attention.',
    '{sign}s felt this before they read it.',
    '{sign}s - be honest. This is you.',
    'Every {sign} reading this just nodded.',
    'If you are a {sign}, you already felt called out.',
    '{sign} energy is doing this right now.',
    'The {sign}s in the comments already know.',
  ],
  zodiac_moon: [
    '{sign} moons, this is yours.',
    '{sign} moon? This explains a lot.',
    '{sign} moons process this differently.',
    'If your moon is in {sign}, this hits different.',
    '{sign} moons - you already know why this hurts.',
    '{sign} moon people felt this in their chest.',
  ],
  zodiac_rising: [
    '{sign} risings, you felt this.',
    'If your rising is {sign}, read that again.',
    '{sign} risings project this without trying.',
    '{sign} risings - everyone sees this but you.',
    'If your ascendant is {sign}, this is your default setting.',
    '{sign} risings walk into rooms and this happens.',
  ],

  // Tarot triggers
  tarot_major: [
    'If you have pulled {topic} recently, pay attention.',
    'People who keep seeing {topic} already know this.',
    '{topic} people - this one hits.',
    'If {topic} followed you into this video, there is a reason.',
    'The people who fear {topic} need this most.',
    'If {topic} keeps appearing in your spreads, read this twice.',
    '{topic} showed up for you today. Not random.',
    'Tell me {topic} has not been haunting your readings.',
  ],
  tarot_minor: [
    'If {topic} keeps showing up in your readings, read this twice.',
    '{topic} has been following you for a reason.',
    'The people pulling {topic} this week - this is for you.',
    'If {topic} appeared in your last spread, stop scrolling.',
    '{topic} readers know exactly what I mean.',
    '{topic} has been trying to tell you something.',
  ],

  // Numerology triggers
  angel_numbers: [
    'If you keep seeing {topic}, this is for you.',
    '{topic} has been appearing for a reason. You know it.',
    'The people who see {topic} everywhere already felt this.',
    'If {topic} showed up today, you were meant to see this.',
    '{topic} people - you are not imagining it.',
    'The ones who keep seeing {topic} already know.',
    'If {topic} has been following you, this explains why.',
    'Tell me you have not been seeing {topic} everywhere.',
  ],
  numerology_life_path: [
    '{topic}s - this is specifically about you.',
    'If your life path is {topic}, stop scrolling.',
    '{topic} life paths - you already live this.',
    'Life path {topic}? This is your pattern.',
    'The {topic}s in the comments already know this is accurate.',
    'If you calculated {topic}, you felt this immediately.',
  ],

  // Lunar/planetary triggers
  moon_phases: [
    'If you felt this shift, you already know.',
    'The people who track moon phases felt this one.',
    'Moon trackers - you noticed this already.',
    'If the moon has been hitting different, this is why.',
    'The ones who felt off this week - this explains it.',
    'If you check the moon before making decisions, this is for you.',
  ],
  planets: [
    'If you have been feeling {topic} energy, now you know why.',
    'The people tracking transits already saw this coming.',
    'If things have felt different this week, blame {topic}.',
    'Transit trackers - you called it.',
    '{topic} has been working on you. You felt it.',
    'If you check your transits, you already knew.',
  ],
  retrogrades: [
    'If this retrograde has been hitting you, this explains why.',
    'The people blaming the retrograde are right this time.',
    'If old things keep resurfacing, this is why.',
    'Retrograde survivors - you know exactly what this feels like.',
    'If your phone has been acting up, check the sky.',
    'The ones feeling stuck right now - this retrograde is the reason.',
  ],

  // Crystal triggers
  crystals: [
    'If {topic} is in your collection, you already felt this.',
    '{topic} people know exactly what I mean.',
    'Crystal collectors - you felt this one.',
    'If you carry {topic}, you already know.',
    '{topic} has been calling to you for a reason.',
    'The ones who work with {topic} felt this immediately.',
  ],

  // Spell/ritual triggers
  spells: [
    'Practitioners - you already know this ingredient.',
    'If you have been doing spell work this week, this applies.',
    'The witches in the comments already knew.',
    'If this ingredient is in your cabinet, you felt it.',
    'Baby witches - save this one.',
    'Experienced practitioners know this changes everything.',
  ],

  // Chakra triggers
  chakras: [
    'If this chakra has been blocked, you felt it.',
    'Energy workers - you already sensed this.',
    'If you have been working on {topic}, this explains the resistance.',
    'The ones with {topic} issues already knew.',
    'If your body has been telling you something, this is it.',
    'Healers in the comments already know.',
  ],

  // Generic fallback for any content type
  default: [
    'If this resonated, you already know why.',
    'The people who needed to see this found it.',
    'Comment if this hit.',
    'If you made it this far, this was meant for you.',
    'The ones who felt this - you are not alone.',
    'If this changed something, comment what.',
    'The people who get this, get this.',
    'If you paused on this video, there is a reason.',
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
 * Build a comment-bait identity trigger line for any content type
 * Falls back to default triggers when no exact match exists
 */
export function buildCommentBaitHook(
  topic: string,
  contentTypeKey: string,
): string | null {
  // Try exact content type first, then fall back to default
  let triggers = IDENTITY_TRIGGERS[contentTypeKey];
  if (!triggers) {
    triggers = IDENTITY_TRIGGERS.default;
  }
  if (!triggers) return null;

  // For zodiac types, extract sign and replace {sign}
  const sign = extractSignFromTopic(topic);
  const template = triggers[Math.floor(Math.random() * triggers.length)];

  return template
    .replace(/\{sign\}/g, sign || topic)
    .replace(/\{topic\}/g, topic);
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
