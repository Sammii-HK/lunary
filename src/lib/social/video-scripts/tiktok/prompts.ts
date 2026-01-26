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
} from '../content-type-voices';

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
- Each line = one complete sentence
- Each sentence must be SPECIFIC to ${facet.title}
- TEST: Would this sentence work for a different ${contentType.replace('_', ' ')}? If yes, rewrite it.
- Include ONE recognition cue (real-world sign)
- Include ONE contrast/clarification
- Include ONE practical line near the end (Try this: or So what:) tied to a time window
- Final line: observational, NOT inspirational

KEY PHRASES TO CONSIDER USING:
${voiceConfig.keyPhrases.map((p) => `- "${p}"`).join('\n')}

${guardrailNote}
${dataContext ? `\nGrimoire Data (reference only):\n${dataContext}` : ''}

Return strict JSON only:
{
  "video": {
    "hook": "Spoken hook line specific to ${facet.title}",
    "scriptBody": [
      "Line 1 - specific to ${facet.title}",
      "Line 2 - specific to ${facet.title}"
    ]
  }
}`;
}
