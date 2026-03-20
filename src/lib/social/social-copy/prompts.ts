/**
 * Prompt builders for social copy generation
 */

import type { SourcePack } from './types';
import { POST_TYPE_SPECS } from './constants';
import { SOCIAL_POST_STYLE_INSTRUCTION } from './style-instructions';
import { buildNoveltyInstruction } from './novelty';

// ---------------------------------------------------------------------------
// Hook formulas - per-category database of proven hook structures
// ---------------------------------------------------------------------------

export const HOOK_FORMULAS: Record<
  string,
  { formula: string; example: string }[]
> = {
  cosmic_event: [
    {
      formula: 'RARITY + TIMING',
      example:
        "Mercury stations direct once every 4 months. Here's what shifts in the next 48 hours.",
    },
    {
      formula: 'CONVERGENCE + SCALE',
      example:
        'Three major shifts align on one day. The last time the sky looked like this was 9,000 years ago.',
    },
  ],
  zodiac: [
    {
      formula: 'OBSERVATION + SPECIFICITY',
      example:
        "Sagittarius risings overshare within 5 minutes. It's the Jupiter effect.",
    },
    {
      formula: 'CHALLENGE + IDENTITY',
      example: 'Only a real Scorpio would admit to this.',
    },
  ],
  tarot: [
    {
      formula: 'MISCONCEPTION FLIP',
      example:
        "The Tower isn't destruction - it's destruction of what was never built solid.",
    },
    {
      formula: 'HIDDEN MEANING',
      example:
        '3 out of 5 tarot readers miss what the Lovers card actually means.',
    },
  ],
  numerology: [
    {
      formula: 'APPEARANCE TRIGGER',
      example:
        "Seeing 444 most doesn't mean protected. It means: ground yourself, now.",
    },
  ],
  sabbat: [
    {
      formula: 'HISTORICAL + SENSORY',
      example:
        'Samhain is the one night the veil thins. Historically: bonfires, apples, remembrance.',
    },
  ],
  crystals: [
    {
      formula: 'UNEXPECTED PROPERTY',
      example: "Black tourmaline doesn't just protect. It transmutes.",
    },
  ],
  planetary: [
    {
      formula: 'RARITY + HISTORY',
      example:
        'Neptune returns to Aries for the first time since 1861. The Civil War started within 24 hours of its last ingress.',
    },
  ],
};

// ---------------------------------------------------------------------------
// Engagement intent mapping - what action each content style engineers
// ---------------------------------------------------------------------------

const ENGAGEMENT_INTENT_GUIDE = `
ENGAGEMENT INTENT (optimise for saves first, shares second):
- SAVES (most valuable signal): tips, frameworks, rarity facts, repeatable rules of thumb, historical details most sources skip, practical frameworks people can apply immediately
- SHARES: identity-affirming content + surprising facts people want to credit themselves for finding
- COMMENTS: rankings, polls, relatable confessions, specific questions people can answer from experience
- LIKES (least valuable): inspirational, aesthetic - avoid optimising purely for this`;

// ---------------------------------------------------------------------------
// Save-worthiness requirement
// ---------------------------------------------------------------------------

const SAVE_WORTHINESS_RULE = `SAVE-WORTHINESS: Every post must include ONE element people want to reference later: a repeatable rule of thumb, a historical detail most sources don't mention, or a practical framework they can apply immediately.`;

// ---------------------------------------------------------------------------
// Rarity extraction rule
// ---------------------------------------------------------------------------

const RARITY_EXTRACTION_RULE = `RARITY LEAD: Find the ONE rarest fact most people don't know about this topic. Lead with that. If this involves a transit, lead with how rarely it occurs.`;

// ---------------------------------------------------------------------------
// Reference posts - examples of what high-quality Lunary content looks like
// ---------------------------------------------------------------------------

const REFERENCE_POSTS = `
REFERENCE POSTS (study the structure and specificity, do not copy these):
1. "Neptune enters Aries for the first time since 1861. Here's what happened every time this transit occurred."
2. "March 20 has THREE major shifts in one day - equinox, Neptune ingress, Mercury direct. This hasn't happened in your lifetime."
3. "The Death card isn't an ending. It's the moment you stop pretending nothing needs to change."
4. "Saturn in Gemini lasts until 2027. The last time it happened (2000-2003), the dot-com bubble burst and people rebuilt from scratch."
5. "Full Moon in Virgo tonight. If your to-do list suddenly feels urgent, that's the transit, not you."\n`;

// ---------------------------------------------------------------------------
// Helper: build hook formula hint for the prompt
// ---------------------------------------------------------------------------

function getHookHint(pack: SourcePack): string {
  const domain = pack.contentDomain?.toLowerCase() ?? '';
  const category = pack.categoryLabel?.toLowerCase() ?? '';

  // Match against known hook formula categories
  const key =
    Object.keys(HOOK_FORMULAS).find(
      (k) => domain.includes(k) || category.includes(k),
    ) ??
    (pack.transitBrief ? 'cosmic_event' : undefined) ??
    (category.includes('sign') || category.includes('zodiac')
      ? 'zodiac'
      : undefined);

  if (!key || !HOOK_FORMULAS[key]) return '';

  const formulas = HOOK_FORMULAS[key];
  const picked = formulas[hashSeed(pack) % formulas.length];
  return `\nHOOK FORMULA to consider (adapt, don't copy): ${picked.formula}
Example: "${picked.example}"`;
}

// ---------------------------------------------------------------------------
// Helper: build transit brief context for the prompt
// ---------------------------------------------------------------------------

function buildTransitBriefBlock(pack: SourcePack): string {
  const brief = pack.transitBrief;
  if (!brief) return '';

  const lines: string[] = ['TRANSIT/EVENT DATA (use these facts):'];
  lines.push(`- Event: ${brief.eventName}`);
  lines.push(`- Date: ${brief.date}`);
  lines.push(`- Rarity: ${brief.rarity} (score ${brief.score}/100)`);

  if (brief.orbitalPeriodYears) {
    lines.push(`- Full orbital period: ${brief.orbitalPeriodYears} years`);
  }
  if (brief.yearsPerSign) {
    lines.push(`- Time in each sign: ~${brief.yearsPerSign} years`);
  }
  if (brief.lastInThisSign) {
    lines.push(`- Last in this sign: ${brief.lastInThisSign}`);
  }
  if (brief.historicalContext) {
    lines.push(`- Historical context: ${brief.historicalContext}`);
  }
  if (brief.rarityFrame) {
    lines.push(`- Rarity frame: ${brief.rarityFrame}`);
  }
  if (brief.hookSuggestions?.length) {
    lines.push(`- Hook suggestions: ${brief.hookSuggestions.join(' | ')}`);
  }

  return '\n' + lines.join('\n');
}

/**
 * Simple hash for deterministic seeding
 */
function hashSeed(pack: SourcePack): number {
  const str = `${pack.topicTitle}-${pack.platform}-${pack.postType}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Platform-specific video caption instructions
 */
const TIKTOK_CAPTION_INSTRUCTIONS = `Write 2-3 lines (150-300 characters total) that:
- Hook-first: line 1 must stop the scroll
- Use searchable keywords naturally (TikTok is a search engine)
- Spoken-style, conversational language
- Optimise for saves and shares
- Include the topic name once`;

const INSTAGRAM_REELS_CAPTION_INSTRUCTIONS = `Write 2-4 lines (200-500 characters total) that:
- First 125 characters must work as a feed preview (the hook)
- Build a mini-narrative arc: hook, insight, payoff
- Include a save-worthy insight or reframe
- Natural interaction invitation (not "comment below!")
- Include the topic name once`;

const GENERIC_VIDEO_CAPTION_INSTRUCTIONS = `Write 2-4 lines that:
- Complement the video naturally
- Provide context or insight
- Use conversational, clear language
- Include the topic name once
- Optionally mention timing if relevant (this week, tonight, etc.)`;

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

  const transitBlock = buildTransitBriefBlock(pack);
  const hookHint = getHookHint(pack);

  return `Write a social post about "${pack.topicTitle}" in UK English.

What you know:
${pack.grimoireExcerpt}

${pack.grimoireFacts
  .slice(0, 2)
  .map((fact) => `- ${fact}`)
  .join('\n')}
${transitBlock}

${domainContext}

Tone: ${spec.toneNote}
${styleGuidance}
${hookHint}

${timingNote}
${reflectionNote}

${CRITICAL_RULES}

${RARITY_EXTRACTION_RULE}

${SAVE_WORTHINESS_RULE}

${ENGAGEMENT_INTENT_GUIDE}

${BANNED_PATTERNS}

${REFERENCE_POSTS}

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

  const captionInstructions =
    pack.platform === 'tiktok'
      ? TIKTOK_CAPTION_INSTRUCTIONS
      : pack.platform === 'instagram'
        ? INSTAGRAM_REELS_CAPTION_INSTRUCTIONS
        : GENERIC_VIDEO_CAPTION_INSTRUCTIONS;

  const includeSoftCta = hashSeed(pack) % 4 === 0;
  const ctaInstruction = includeSoftCta
    ? `\nEnd with a natural soft CTA like "Get your personalised chart on Lunary" or "Lunary breaks this down for your exact chart". Make it feel like a natural extension of the insight, not an ad.`
    : '\nDo not mention Lunary or the Grimoire.';

  const transitBlock = buildTransitBriefBlock(pack);
  const hookHint = getHookHint(pack);

  return `Write a video caption about "${pack.topicTitle}" in UK English.

What you know:
${pack.grimoireExcerpt}

${pack.grimoireFacts
  .slice(0, 2)
  .map((fact) => `- ${fact}`)
  .join('\n')}
${transitBlock}

${domainContext}

${styleGuidance}
${hookHint}

${captionInstructions}
${ctaInstruction}

${CRITICAL_RULES}

${RARITY_EXTRACTION_RULE}

${SAVE_WORTHINESS_RULE}

${ENGAGEMENT_INTENT_GUIDE}

${BANNED_PATTERNS}

Avoid:
- Marketing speak or "deepen your practice" type phrases
- Rigid formulas${includeSoftCta ? '' : '\n- Mentioning Lunary or the Grimoire'}
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

  const transitBlock = buildTransitBriefBlock(pack);

  return `Write an engaging question about "${pack.topicTitle}" in UK English.

What you know:
${pack.grimoireExcerpt}
${transitBlock}

${domainContext}

${styleGuidance}

Ask a genuine question that:
- Relates to lived experience with this topic
- Encourages people to share their observations
- Feels conversational and curious (like genuine human curiosity, not rhetorical fluff)
- Avoids "What is..." definitions
- Should inspire CONCRETE, SPECIFIC responses - not vague reflection
- Is answerable, not rhetorical
- Optimises for COMMENTS: use rankings, relatable confessions, or specific "which one are you?" style questions

${CRITICAL_RULES}

${SAVE_WORTHINESS_RULE}

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
