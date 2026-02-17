/**
 * YouTube script prompt builders
 */

import type { DailyFacet, WeeklyTheme } from '../../weekly-themes';
import { buildScopeGuard } from '../../topic-scope';
import { FACTUAL_GUARDRAIL_INSTRUCTION } from '../../prompt-guards';
import {
  getContentTypeFromCategory,
  getVoiceConfig,
} from '../content-type-voices';

/**
 * Universal banned patterns
 */
const UNIVERSAL_BANS = `
UNIVERSAL BANS - NEVER USE:
- "gentle nudge" / "cosmic wink" / "like the universe is"
- "whisper" / "perfect timing to" / "curious to see where it leads"
- "deepen your practice/understanding"
- "journey of self-discovery" / "cosmic dance" / "your growth awaits"
- "embrace your" / "step into your" / "unlock your potential"
- "Look for [X] in the small, repeatable details"
- "Notice what shifts when you work with [X] intentionally"
- "Patterns make sense once you start noticing them"
- "Here is the clear meaning of..."
- "[X] describes [meaning]" as formula
- "It's like..." comparisons
- "Ever thought about..." as hooks
- em dashes (-- or —)
- Any sentence that works for multiple topics by swapping the keyword`;

/**
 * Specificity test
 */
const SPECIFICITY_TEST = `
SPECIFICITY TEST FOR EVERY SENTENCE:
Before writing any sentence, ask: "Could this work for 5 different topics by swapping the subject?"
If YES: DELETE IT. Write something that ONLY works for THIS specific topic.

BAD: "[X] can guide you through transitions" (works for anything)
BAD: "Pay attention to how [X] shows up" (works for anything)
BAD: "There's wisdom in understanding [X]" (works for anything)

GOOD: "222 appears when you're about to quit something." (specific to 222)
GOOD: "Saturn returns audit what you built in the last 29 years." (specific to Saturn)
GOOD: "Scorpio suns learned early that information is power." (specific to Scorpio)`;

/**
 * Build facet context for YouTube prompt
 */
export function buildFacetContext(
  facet: DailyFacet,
  data: Record<string, any> | null,
  index: number,
): string {
  let context = `Day ${index + 1}: ${facet.title}\nFocus: ${facet.focus}\n`;
  if (data) {
    if (data.description) context += `Description: ${data.description}\n`;
    if (data.element) context += `Element: ${data.element}\n`;
    if (data.ruler || data.rulingPlanet) {
      context += `Ruled by: ${data.ruler || data.rulingPlanet}\n`;
    }
    if (data.modality) context += `Modality: ${data.modality}\n`;
    if (data.keywords && Array.isArray(data.keywords)) {
      context += `Key themes: ${data.keywords.join(', ')}\n`;
    }
    if (data.meaning || data.mysticalProperties) {
      context += `Meaning: ${data.meaning || data.mysticalProperties}\n`;
    }
    if (data.mysticalProperties) {
      context += `Mystical properties: ${data.mysticalProperties}\n`;
    }
    if (data.healingPractices && Array.isArray(data.healingPractices)) {
      context += `Healing practices: ${data.healingPractices.join(', ')}\n`;
    }
  }
  return context;
}

/**
 * Build YouTube script prompt with content-type specific voice
 */
export function buildYouTubePrompt(
  theme: WeeklyTheme,
  facets: DailyFacet[],
  allData: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const facetContexts = allData.map(({ facet, data }, index) =>
    buildFacetContext(facet, data, index),
  );

  const guardrailNote = FACTUAL_GUARDRAIL_INSTRUCTION;

  // Get content-type specific configuration — pass theme name for precise sub-type
  const contentType = getContentTypeFromCategory(theme.category, theme.name);
  const voiceConfig = getVoiceConfig(contentType);

  // Build content-type specific bans
  const contentTypeBans =
    voiceConfig.specificBans.length > 0
      ? `\nCONTENT-TYPE SPECIFIC BANS:\n${voiceConfig.specificBans.map((b) => `- "${b}"`).join('\n')}`
      : '';

  // Randomly select an opening approach for variety
  const openingApproaches = [
    'Start with the most surprising or counterintuitive aspect of the topic',
    'Open with what most people get wrong, then correct it',
    'Begin with a specific real-world scenario where this matters',
    'Start by stating the core insight directly, then unpack it',
    'Open with a provocative question that the script will answer',
  ];
  const selectedOpening =
    openingApproaches[Math.floor(Math.random() * openingApproaches.length)];

  return `Create a complete YouTube video script (3-4 minutes, 450-650 words) for a weekly educational deep dive on ${theme.name}.

CONTENT TYPE: ${contentType.toUpperCase().replace('_', ' ')}
This content type has a SPECIFIC voice. Do NOT write generic spiritual content.

${voiceConfig.voiceDescription}

${voiceConfig.exampleEnergy}

${UNIVERSAL_BANS}
${contentTypeBans}

${SPECIFICITY_TEST}

OPENING APPROACH: ${selectedOpening}

The script should be:
- Written as a flowing narrative that can be read aloud smoothly
- Educational and interpretive, using the ${contentType.replace('_', ' ')} voice
- SPECIFIC to ${theme.name} - every sentence should only work for this topic
- Varied in sentence length and rhythm
- Clear, grounded, and premium in tone

Opening guidance:
- ${selectedOpening}
- Avoid generic greetings or channel-style introductions
- Do not reference "this video" or the act of watching
- Hook with something surprising or genuinely interesting
- NEVER use "In this video, we'll explore..."

Content guidance:
- Build understanding progressively from foundations to deeper insight
- Cover all facets listed below, integrating them naturally
- Be SPECIFIC - every claim should only apply to THIS topic
- Challenge common assumptions where appropriate
- No generic filler sentences

Closing guidance:
- End with a reflective synthesis specific to ${theme.name}
- NEVER end with motivational poster language
- Add one short final sentence with "try this:" and a concrete action tied to a time window

TONE: ${voiceConfig.tone}

KEY PHRASES TO CONSIDER:
${voiceConfig.keyPhrases.map((p) => `- "${p}"`).join('\n')}

Theme: ${theme.name}
Category: ${theme.category}
Description: ${theme.description}

Facets to cover:
${facetContexts.join('\n---\n')}

Return ONLY the complete script text. No section headers, no labels, no markdown.
Avoid deterministic claims; use soft language like "can", "tends to", "may", "often".
${buildScopeGuard(theme.name)}
${guardrailNote}`;
}
