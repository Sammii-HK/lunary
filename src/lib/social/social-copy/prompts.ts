/**
 * Prompt builders for social copy generation
 */

import type { SourcePack } from './types';
import { POST_TYPE_SPECS } from './constants';
import { SOCIAL_POST_STYLE_INSTRUCTION } from './style-instructions';
import { buildNoveltyInstruction } from './novelty';

/**
 * Critical rules that must appear in all prompts
 */
const CRITICAL_RULES = `
CRITICAL RULES:
1. IMPORTANT: Do NOT include any hashtags (#) in your content. Hashtags are added separately by the system.
2. NEVER use these overused phrases: "gentle nudge," "cosmic wink/thumbs-up," "like the universe is," "whisper/whispering," "perfect timing to," "curious to see where it leads"
3. Each post about the same topic MUST use completely different angles - not just rephrased versions
4. Vary sentence length dramatically - use fragments, short punchy lines, and longer explanations
5. NEVER use emojis - no emojis in any content
6. Use concrete, specific details instead of vague metaphors
7. Questions must sound like genuine human curiosity, not rhetorical fluff
8. Never use em dashes
9. ANTI-REPETITION: Before writing, check if your sentence could work for ANY topic by swapping the number/topic. If yes, REWRITE with details that ONLY work for THIS specific topic.
   BAD (generic): "Pay attention to how [X] shapes timing or small decisions"
   GOOD (specific): "222 appears most when you're doubting whether to stay - it's telling you to stay"
   GOOD (specific): "The Tower often shows up after you've been ignoring what you already knew"
   GOOD (specific): "Sagittarius risings tend to overshare within 5 minutes of meeting someone"`;

/**
 * Banned patterns that must be avoided
 */
const BANNED_PATTERNS = `
BANNED PATTERNS:
- "Ever notice [X]? It's [metaphor]. In numerology, [meaning]."
- Starting with "Seeing/Spotting/Noticed [number] lately?"
- Ending with vague reflection questions
- Using "journey" more than once per 10 posts
- Three-part structure (hook + explanation + question) every time
- "Many believe" or "can deepen your understanding"
- "deepen your practice" or marketing-speak

GENERIC FILLER SENTENCES (never use these - they work for ANY topic):
- "Pay attention to how [X] shapes timing or small decisions"
- "[X] often appears when you need it most"
- "Notice how [X] shows up in your daily life"
- "There's wisdom in understanding [X]"
- "[X] invites you to reflect on what matters"
- "Consider what [X] might be telling you"
Instead, write sentences with SPECIFIC details that only apply to THIS topic.`;

/**
 * Build educational post prompt
 */
export const buildEducationalPrompt = (pack: SourcePack): string => {
  const spec = POST_TYPE_SPECS[pack.postType];
  const styleGuidance = SOCIAL_POST_STYLE_INSTRUCTION(
    pack.platform,
    pack.postType,
  );

  const domainContext = pack.needsContext
    ? `Make it clear this is about ${pack.categoryLabel.toLowerCase()} - ground it in that context.`
    : `This is within ${pack.categoryLabel.toLowerCase()}.`;

  const timingNote =
    pack.platform === 'threads' ||
    ['educational_deep_2', 'closing_statement', 'closing_ritual'].includes(
      pack.postType,
    )
      ? `If it fits naturally, you can mention timing (today, this week, tonight, next few days).`
      : '';

  const reflectionNote = pack.allowJournaling
    ? 'You can invite gentle reflection or journaling if it feels right.'
    : 'Keep it practical and observational rather than journaling-focused.';

  const noveltyNote = buildNoveltyInstruction(pack.noveltyContext);

  return `Write a social post about "${pack.topicTitle}" in UK English.

What you know:
${pack.grimoireExcerpt}

${pack.grimoireFacts
  .slice(0, 2)
  .map((fact) => `- ${fact}`)
  .join('\n')}

${domainContext}

Tone: ${spec.toneNote}
${styleGuidance}

${timingNote}
${reflectionNote}

${CRITICAL_RULES}

${BANNED_PATTERNS}

Important:
- Use natural, conversational language
- Vary your sentence structure and openings dramatically
- Stay factual but not deterministic - use "tends to", "often", "can" rather than "always" or "guarantees"
- Don't mention Lunary or the Grimoire
- ${spec.sentenceCount[0]}-${spec.sentenceCount[1]} sentences
${noveltyNote ? `\n${noveltyNote}` : ''}

Return JSON:
{
  "content": "your post text here",
  "hashtags": [],
  "safetyChecks": []
}`;
};

/**
 * Build video caption prompt
 */
export const buildVideoCaptionPrompt = (pack: SourcePack): string => {
  const styleGuidance = SOCIAL_POST_STYLE_INSTRUCTION(
    pack.platform,
    pack.postType,
  );

  const domainContext = pack.needsContext
    ? `This is about ${pack.categoryLabel.toLowerCase()} - make that clear.`
    : `Context: ${pack.categoryLabel.toLowerCase()}.`;

  const noveltyNote = buildNoveltyInstruction(pack.noveltyContext);

  return `Write a video caption about "${pack.topicTitle}" in UK English.

What you know:
${pack.grimoireExcerpt}

${pack.grimoireFacts
  .slice(0, 2)
  .map((fact) => `- ${fact}`)
  .join('\n')}

${domainContext}

${styleGuidance}

Write 2-4 lines that:
- Complement the video naturally
- Provide context or insight
- Use conversational, clear language
- Include the topic name once
- Optionally mention timing if relevant (this week, tonight, etc.)

${CRITICAL_RULES}

${BANNED_PATTERNS}

Avoid:
- Marketing speak or "deepen your practice" type phrases
- Rigid formulas
- Mentioning Lunary or the Grimoire
- Deterministic claims - use "tends to", "often", "can" not "always" or "controls"
${noveltyNote ? `\n${noveltyNote}` : ''}

Return JSON:
{
  "bodyLines": ["line 1", "line 2", "line 3"],
  "hashtags": [],
  "safetyChecks": []
}`;
};

/**
 * Build question post prompt
 */
export const buildQuestionPrompt = (pack: SourcePack): string => {
  const styleGuidance = SOCIAL_POST_STYLE_INSTRUCTION(
    pack.platform,
    pack.postType,
  );

  const domainContext = pack.needsContext
    ? `This is about ${pack.categoryLabel.toLowerCase()}.`
    : `Context: ${pack.categoryLabel.toLowerCase()}.`;

  const noveltyNote = buildNoveltyInstruction(pack.noveltyContext);

  return `Write an engaging question about "${pack.topicTitle}" in UK English.

What you know:
${pack.grimoireExcerpt}

${domainContext}

${styleGuidance}

Ask a genuine question that:
- Relates to lived experience with this topic
- Encourages people to share their observations
- Feels conversational and curious (like genuine human curiosity, not rhetorical fluff)
- Avoids "What is..." definitions
- Should inspire CONCRETE, SPECIFIC responses - not vague reflection
- Is answerable, not rhetorical

${CRITICAL_RULES}

Optionally add a short follow-up line to encourage responses (keep it under 7 words).

Don't mention Lunary or the Grimoire.
${noveltyNote ? `\n${noveltyNote}` : ''}

Return JSON:
{"content":"Your question here?\\nOptional prompt","hashtags":[],"safetyChecks":[]}`;
};

/**
 * Build prompt based on post type
 */
export const buildPrompt = (pack: SourcePack): string =>
  pack.postType === 'video_caption'
    ? buildVideoCaptionPrompt(pack)
    : pack.postType === 'question'
      ? buildQuestionPrompt(pack)
      : buildEducationalPrompt(pack);
