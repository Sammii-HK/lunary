/**
 * TikTok script prompt builders
 */

import type { DailyFacet, WeeklyTheme } from '../../weekly-themes';
import { buildScopeGuard } from '../../topic-scope';
import { FACTUAL_GUARDRAIL_INSTRUCTION } from '../../prompt-guards';
import { ContentAspect } from '../../shared/types';
import { getSearchPhraseForTopic } from '../../shared/text/normalize';
import { aspectLabel } from '../constants';
import {
  getContentTypeFromCategory,
  getVoiceConfig,
  getRandomScriptStructure,
  type ContentTypeKey,
} from '../content-type-voices';
import { buildCommentBaitHook } from '../hooks';

/**
 * Universal banned patterns that apply to ALL content types
 */
const UNIVERSAL_BANS = `
UNIVERSAL BANS - NEVER USE IN ANY SCRIPT:
- "gentle nudge" / "cosmic wink" / "like the universe is"
- "whisper" / "perfect timing to" / "curious to see where it leads"
- "deepen your practice/understanding"
- "journey of self-discovery" / "cosmic dance" / "your growth awaits"
- "embrace your" / "step into" / "unlock your" / "manifest your"
- "Look for [X] in the small, repeatable details"
- "Notice what shifts when you work with [X] intentionally"
- "Patterns make sense once you start noticing them"
- "Here is the clear meaning of [X] in practice"
- "[X] describes [meaning]" as a formula
- "It's like..." comparisons
- "Ever thought about..." as hooks
- "It matters because..." as transitions
- "Curious how/to..." questions
- em dashes (-- or —)
- Any sentence that could work for 3+ different topics by swapping the keyword`;

/**
 * Generic sentence test
 */
const SPECIFICITY_TEST = `
SPECIFICITY TEST - ASK YOURSELF:
"Could this exact sentence work for 5 different topics if I swapped the keyword?"
If YES: DELETE IT AND WRITE SOMETHING SPECIFIC.

BAD (works for anything): "Pay attention to how [X] shows up in your daily life"
BAD (works for anything): "[X] often appears when you need it most"
BAD (works for anything): "There's wisdom in understanding [X]"

GOOD (specific to 222): "222 appears when you're about to quit something. Job feels stuck. Relationship feels off. Then: 222."
GOOD (specific to The Tower): "The Tower doesn't destroy what's working. It destroys what you've been pretending works."
GOOD (specific to Mercury retrograde): "Mercury retrograde doesn't break technology. It exposes communication you've been avoiding."`;

/**
 * Content types with natural time-sensitivity (retrogrades, eclipses, moon phases)
 */
const TIME_SENSITIVE_TYPES = new Set<ContentTypeKey>([
  'retrogrades',
  'eclipses',
  'moon_phases',
]);

const URGENCY_LABELS: Record<string, string> = {
  retrogrades: 'retrograde',
  eclipses: 'eclipse',
  moon_phases: 'moon phase',
};

/**
 * Build urgency framing guidance for time-sensitive content types.
 * Returns empty string for non-time-sensitive types (no impact on zodiac, tarot, etc.).
 */
export function buildUrgencyGuidance(contentTypeKey: ContentTypeKey): string {
  if (!TIME_SENSITIVE_TYPES.has(contentTypeKey)) return '';

  const label = URGENCY_LABELS[contentTypeKey] || contentTypeKey;

  return `
URGENCY FRAMING (this content is time-sensitive):
- This ${label} is happening NOW — frame the content as timely
- Use present tense: "is active", "is happening", "shifts this week"
- Include ONE timing anchor: "through [approximate end]" or "peaks this week"
- NOT: "hurry" / "don't miss out" / "act now" — those kill authenticity`;
}

/**
 * Build Grimoire data context for prompt
 */
export function buildGrimoireContext(
  grimoireData: Record<string, any> | null,
): string {
  if (!grimoireData) return '';

  let dataContext = '';
  if (grimoireData.description) {
    dataContext += `Description: ${grimoireData.description}\n`;
  }
  if (grimoireData.element) {
    dataContext += `Element: ${grimoireData.element}\n`;
  }
  if (grimoireData.ruler || grimoireData.rulingPlanet) {
    dataContext += `Ruled by: ${grimoireData.ruler || grimoireData.rulingPlanet}\n`;
  }
  if (grimoireData.modality) {
    dataContext += `Modality: ${grimoireData.modality}\n`;
  }
  if (grimoireData.keywords && Array.isArray(grimoireData.keywords)) {
    dataContext += `Key themes: ${grimoireData.keywords.join(', ')}\n`;
  }
  if (grimoireData.meaning || grimoireData.mysticalProperties) {
    dataContext += `Meaning: ${grimoireData.meaning || grimoireData.mysticalProperties}\n`;
  }
  if (grimoireData.strengths && Array.isArray(grimoireData.strengths)) {
    dataContext += `Strengths: ${grimoireData.strengths.join(', ')}\n`;
  }
  if (grimoireData.affirmation) {
    dataContext += `Affirmation: ${grimoireData.affirmation}\n`;
  }

  return dataContext;
}

/**
 * Build TikTok script prompt with content-type specific voice
 */
export function buildTikTokPrompt(
  facet: DailyFacet,
  theme: WeeklyTheme,
  grimoireData: Record<string, any> | null,
  angle: string,
  aspect: ContentAspect,
): string {
  const searchPhrase = getSearchPhraseForTopic(facet.title, theme.category);
  const dataContext = buildGrimoireContext(grimoireData);
  const guardrailNote = FACTUAL_GUARDRAIL_INSTRUCTION;

  // Get content-type specific configuration
  const contentType = getContentTypeFromCategory(theme.category);
  const urgencyGuidance = buildUrgencyGuidance(contentType);
  const voiceConfig = getVoiceConfig(contentType);
  const scriptStructure = getRandomScriptStructure(contentType);

  // Build content-type specific bans
  const contentTypeBans =
    voiceConfig.specificBans.length > 0
      ? `\nCONTENT-TYPE SPECIFIC BANS:\n${voiceConfig.specificBans.map((b) => `- "${b}"`).join('\n')}`
      : '';

  return `You are writing a short-form video script about ${facet.title}.

CONTENT TYPE: ${contentType.toUpperCase().replace('_', ' ')}
This content type has a SPECIFIC voice. Do NOT write generic spiritual content.

${voiceConfig.voiceDescription}

${voiceConfig.exampleEnergy}

SCRIPT STRUCTURE TO USE:
${scriptStructure}

${UNIVERSAL_BANS}
${contentTypeBans}

${SPECIFICITY_TEST}

Topic: ${facet.title}
Angle: ${angle}
Aspect focus: ${aspectLabel(aspect)}
Keyword phrase: ${searchPhrase}
Focus: ${facet.focus}
${buildScopeGuard(facet.title)}

TONE: ${voiceConfig.tone}

HOOK REQUIREMENTS (FIRST LINE):
- Single sentence, 8-14 words, grammatically correct
- Must include "${facet.title}" or "${searchPhrase}" exactly once
- Must match the ${contentType.replace('_', ' ')} voice
- NO generic hooks that could work for any topic
- Banned hook patterns:
  * "Most people..."
  * "Here's what/how..."
  * "Let me explain/show you..."
  * "Ever notice...?"
  * "What if I told you..."

SCRIPT BODY (6-10 lines after hook):
- Follow the script structure above
- PACING IS EVERYTHING:
  * Mix sentence lengths: short (3-7 words), medium (8-12 words), occasional long (13-18 words)
  * Use one-beat sentences for impact: "That's the pattern." / "Not even close." / "Watch what happens."
  * After a complex idea, follow with a short clarifying punch
  * Read it aloud. If you can't deliver a line in one breath, split it.
- Each sentence must be SPECIFIC to ${facet.title}
- TEST: Would this sentence work for a different ${contentType.replace('_', ' ')}? If yes, rewrite it.
- RETENTION HOOKS (critical for keeping viewers):
  * Line 2-3: Include ONE "wait, here's the thing" moment - something unexpected
  * Line 5-6 (midpoint): Pattern interrupt - shift perspective, tone, or reveal
  * These keep viewers past the 3-second and midpoint drop-off thresholds
- COMMENT TRIGGER (drives the #1 algorithm signal):
  * Include ONE line that invites identification or reaction
  * Formats: "If you're a [sign/type], you already know." / "This one's for the [specific group]." / "Tell me this isn't you."
  * Place between lines 3-5 — after the viewer is hooked, before the midpoint
  * Must feel natural, not forced. It's an aside, not a call-to-action.${(() => {
    const bait = buildCommentBaitHook(facet.title, contentType);
    return bait
      ? `\n  * COMMENT BAIT PREFIX to weave into lines 3-5: "${bait}"`
      : '';
  })()}
- Include ONE recognition cue (real-world sign someone would notice)
- Include ONE contrast/clarification (what it's NOT or how it differs)
- SHARE TRIGGER (makes someone send this to a friend):
  * Include ONE hyper-specific, relatable observation people recognize in someone they know
  * Examples: "The friend who answers every question with another question" / "The person who goes silent for three days then comes back like nothing happened"
  * Specificity drives shares — vague observations get skipped, precise ones get sent
- Near the end: practical observation someone can notice or try this week

CLOSING LINE (most important line after hook):
- Must be SAVE-WORTHY - the line someone screenshots or quotes
- Formats that work:
  * Reframe in a single sentence: "[Topic] isn't [expected]. It's [unexpected]."
  * Provocative observation: the kind of line that makes someone comment "say that again"
  * Callback to hook that lands differently now (if using bookend structure)
  * Stitch bait: end with an open question or provocative claim others want to respond to ("But that's only the surface read." / "Unless you look at it from [other angle].")
- NOT: inspirational, motivational, "embrace your", generic wisdom
- NOT: "so next time you see X, remember Y" (too generic)
- TEST: Would someone quote this line to a friend? If not, rewrite it.

ANTI-MONOTONY:
- Do NOT start 3+ lines with the same word or pattern
- Vary line openings: observation, question, contrast, action, single beat
- At least ONE line should be a question or direct address
- At least ONE line should use contrast ("not X, but Y" or "the opposite of what you'd think")

LOOP & REWATCH TECHNIQUES (use if the structure above calls for it):
- OPEN LOOP: If the structure mentions "open loop" or "tease", delay the key insight to lines 7-8 and callback to the hook in the final line
- BOOKEND: If the structure mentions "bookend", repeat the opening observation as the closing line — the middle content should change its meaning
- COUNTDOWN: If the structure mentions "countdown" or "layers", number each insight and make the last one recontextualize the earlier ones
- The goal: viewers who reach the end want to rewatch from the start

KEY PHRASES TO CONSIDER USING:
${voiceConfig.keyPhrases.map((p) => `- "${p}"`).join('\n')}

${guardrailNote}
${urgencyGuidance}
${dataContext ? `\nGrimoire Data (reference only):\n${dataContext}` : ''}

Return strict JSON only:
{
  "video": {
    "hook": "Single hook sentence about ${facet.title}",
    "scriptBody": [
      "Observation specific to ${facet.title}",
      "Recognition cue - when/where someone notices this",
      "Contrast or clarification",
      "Deeper insight",
      "Practical moment to notice this week",
      "Save-worthy closing line someone would quote"
    ]
  }
}`;
}
