import { generateContent } from '@/lib/ai/content-generator';
import {
  CLOSING_PARTICIPATION_INSTRUCTION,
  FACTUAL_GUARDRAIL_INSTRUCTION,
} from '@/lib/social/prompt-guards';

const BIGRAM_THRESHOLD = 0.4;

const splitBigrams = (text: string) => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i += 1) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  return bigrams;
};

const bigramOverlap = (a: string, b: string) => {
  const aBigrams = new Set(splitBigrams(a));
  const bBigrams = new Set(splitBigrams(b));
  if (aBigrams.size === 0 || bBigrams.size === 0) return 0;
  let overlap = 0;
  for (const bigram of aBigrams) {
    if (bBigrams.has(bigram)) overlap += 1;
  }
  return overlap / Math.max(aBigrams.size, bBigrams.size);
};

const isTooSimilar = (text: string, samples: string[]) =>
  samples.some((sample) => bigramOverlap(text, sample) > BIGRAM_THRESHOLD);

const QUESTION_STARTERS = [
  'what',
  'why',
  'how',
  'when',
  'which',
  'who',
  'where',
  'do',
  'does',
  'did',
  'is',
  'are',
  'can',
  'could',
  'would',
  'should',
  'will',
  'have',
  'has',
  'am',
  'was',
  'were',
];

const isQuestionLine = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed.endsWith('?')) return false;
  const lower = trimmed.toLowerCase();
  return QUESTION_STARTERS.some((starter) =>
    new RegExp(`^${starter}\\b`).test(lower),
  );
};

const normalizeQuestionLines = (text: string) => {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const questionLine = lines[0] || '';
  const followUp = lines[1] || '';
  return { questionLine, followUp };
};

const QUESTION_FOLLOWUPS = [
  'Share one moment that stood out.',
  'Name the cue you notice most.',
  'What do you keep coming back to?',
  'Share the moment it clicked.',
  'Which detail feels most telling?',
];

const buildQuestionFollowUp = (seed: number) =>
  QUESTION_FOLLOWUPS[seed % QUESTION_FOLLOWUPS.length];

const callAI = async (prompt: string, retryNote?: string) => {
  return generateContent({
    systemPrompt:
      'You write concise Lunary social microcopy in UK English. Return plain text only.',
    prompt,
    temperature: 0.4,
    maxTokens: 250,
    retryNote,
  });
};

const ensureDistinct = async (
  prompt: string,
  guides: string[],
  retryHint: string,
) => {
  let text = (await callAI(prompt)).trim();
  if (!text) {
    text = (
      await callAI(
        prompt,
        'Please produce one calm, single-paragraph response.',
      )
    ).trim();
  }
  if (isTooSimilar(text, guides)) {
    text = (await callAI(prompt, retryHint)).trim();
  }
  if (!text) {
    throw new Error('AI did not return usable text');
  }
  return text;
};

export type PersonaInput = {
  seed: number;
  themeName: string;
  category: string;
  dayTopic: string;
  sourceSnippet: string;
  personaList: string[];
  personaBodies: string[];
};

export type QuestionInput = {
  seed: number;
  themeName: string;
  category: string;
  dayTopic: string;
  dataKeywords: string[];
  sourceSnippet: string;
  questionGuides: string[];
};

export type ClosingInput = {
  seed: number;
  themeName: string;
  category: string;
  weekTopics: string[];
  closingGuides: string[];
};

const CLOSING_VAGUE_PHRASES = [
  'perhaps',
  'journey continues',
  'beyond understanding',
];

const normalizeClosingLines = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const isClosingInvalid = (text: string) => {
  const lines = normalizeClosingLines(text);
  if (lines.length === 0 || lines.length > 2) return true;
  if (!lines[1] || !lines[1].trim().endsWith('?')) return true;
  const lower = text.toLowerCase();
  if (CLOSING_VAGUE_PHRASES.some((phrase) => lower.includes(phrase)))
    return true;
  return false;
};

export type EducationalCtaInput = {
  themeName: string;
  category: string;
  topic: string;
  sourceSnippet: string;
};

const CTA_GUIDES = [
  'Save this for next time you’re tracking timing.',
  'If you’ve noticed this pattern, reply with what it looked like.',
  'Send this to a friend learning astrology.',
  'Want a part two on another facet? Reply “yes”.',
  'If you want a quick checklist for this, say “checklist”.',
];

const buildQuestionPost = (topic: string, data: Record<string, any> | null) => {
  const keywords = Array.isArray(data?.keywords) ? data.keywords : [];
  const options = keywords.filter(Boolean).slice(0, 3);
  if (options.length >= 3) {
    return `When it comes to ${topic}, what do you notice most: ${options[0]}, ${options[1]}, or ${options[2]}?`;
  }
  return `What's your biggest question about ${topic}?`;
};

export const generateEducationalCta = async ({
  themeName,
  category,
  topic,
  sourceSnippet,
}: EducationalCtaInput): Promise<string> => {
  const prompt = `Write one calm, single-sentence closing remark for a Lunary short-form educational post in UK English. Mention continuing to observe ${topic} or ${themeName} within ${category} without sounding promotional. Reference this snippet for tone: "${sourceSnippet}". End the sentence with: "Explore ${topic} in the Lunary Grimoire." Avoid the word "controls"; describe how the topic influences, shapes, or affects experience (or note its colours) instead.
${FACTUAL_GUARDRAIL_INSTRUCTION}`;
  return ensureDistinct(
    prompt,
    CTA_GUIDES,
    'Shift the language toward a fresh closing remark that feels distinct from the example CTAs.',
  );
};

export const generatePersonaPost = async ({
  seed,
  personaList,
  personaBodies,
}: PersonaInput): Promise<string> => {
  // Use facet-based audience terms to prevent duplication (e.g., no "moon lovers, moon watchers")
  const { buildAudienceTerms } =
    await import('./shared/constants/persona-templates');
  const audienceTerms = buildAudienceTerms(4);
  const styleGuide =
    personaBodies[seed % personaBodies.length] || personaBodies[0];
  const prompt = `Write a Lunary persona post in UK English. Provide only one text block. First line must be "dear ..." listing ${audienceTerms.join(
    ', ',
  )} with a single line break before the body.

This is a BRAND post. It must be entirely about the Lunary app in general. Do NOT mention any specific topic, theme, category, number, angel number, numerology concept, tarot card name, crystal name, zodiac sign, spell, or any other specific subject. Keep it completely general about Lunary as an app.

The body should be 1-2 sentences focusing on Lunary's key USP: everything is personalised to your FULL BIRTH CHART (or "full natal chart"), not just your sun sign. List features briefly (horoscopes, transits, tarot, crystals) but do NOT explain or describe any single feature in detail. Use "full birth chart" or "full natal chart" instead of just "chart".

BAD example (NEVER do this): "Let's talk about the Emperor card. A symbol of authority..." — expanding on one feature like this is forbidden.
BAD example (NEVER do this): "Ever feel like numbers are just numbers? Think again." — this references numerology which is a specific topic.
GOOD example: "Personalised horoscopes, transits, tarot, and crystals. All based on your full birth chart, not just your sun sign."

FORMATTING RULES:
- Use proper capitalisation (always capitalise "I", start sentences with capitals)
- NEVER use em dashes or hyphens to join clauses. Use full stops, commas, or colons instead.
- Keep it calm and inclusive, avoiding promo codes.
- NEVER expand on, describe, or explain any single feature. Only list them briefly.
- Do NOT include any hashtags.

${FACTUAL_GUARDRAIL_INSTRUCTION}
${CLOSING_PARTICIPATION_INSTRUCTION}
Use this tone reference: "${styleGuide}".`;
  const text = await ensureDistinct(
    prompt,
    personaBodies,
    'Be more distinct from the example persona language while keeping the format calm and reflective. Emphasize full birth chart personalisation. Use proper capitalisation.',
  );
  return text;
};

export const generateQuestionPost = async ({
  seed,
  themeName,
  category,
  dayTopic,
  dataKeywords,
  sourceSnippet,
  questionGuides,
}: QuestionInput): Promise<string> => {
  const keywordHint = dataKeywords.slice(0, 3).join(', ') || 'patterns';
  const example =
    questionGuides[seed % questionGuides.length] || questionGuides[0];
  const prompt = `Write a Lunary question post in UK English. Output either one or two lines.

Line 1: one direct question ending with "?" (single sentence only).
Line 2 (optional): a short reply prompt (max 7 words) that invites a concrete share.

Rules:
- No "What is..." openings.
- Do not repeat the main keyword.
- Focus on lived experience or noticing a pattern related to ${dayTopic} or ${themeName}.
- Mention subtle timing, visibility, transition, or pause, referencing this snippet for flavour: ${sourceSnippet}.
- Include one discovery phrase from (${keywordHint}).
- No hashtags, no emojis, no CTA fluff.
Use this sample tone as guidance: "${example}". ${FACTUAL_GUARDRAIL_INSTRUCTION}`;

  const questionGuidesWithPrompt = questionGuides.map(
    (guide) => `${guide}\n${buildQuestionFollowUp(seed)}`,
  );
  let text = await ensureDistinct(
    prompt,
    questionGuidesWithPrompt,
    'Be more distinct while keeping the two-line question format.',
  );

  let { questionLine, followUp } = normalizeQuestionLines(text);
  if (!isQuestionLine(questionLine)) {
    text = await callAI(
      prompt,
      'Line 1 must be a direct question ending with "?". Add a short reply prompt on line 2.',
    );
    ({ questionLine, followUp } = normalizeQuestionLines(text));
  }

  if (!isQuestionLine(questionLine)) {
    questionLine = buildQuestionPost(dayTopic, null);
  }

  const resolvedFollowUp = followUp
    ? followUp
        .replace(/[.!?]+$/, '')
        .trim()
        .slice(0, 60)
    : buildQuestionFollowUp(seed);

  return resolvedFollowUp
    ? `${questionLine}\n${resolvedFollowUp}`
    : questionLine;
};

export const generateClosingPost = async ({
  seed,
  themeName,
  category,
  weekTopics,
  closingGuides,
}: ClosingInput): Promise<string> => {
  const styleGuide =
    closingGuides[seed % closingGuides.length] || closingGuides[0];
  const prompt = `Write a closing statement for Lunary in UK English.

Schema (2 lines max):
- Line 1: a strong reflective statement (specific, not vague).
- Line 2: a direct engagement question ending with "?" asking for a specific reply (one word, one moment, or one realisation).

Rules:
- No ritual language or metaphors.
- Avoid vague phrases like "perhaps", "journey continues", "beyond understanding".
- Do not summarise specific topics.
${FACTUAL_GUARDRAIL_INSTRUCTION}
${CLOSING_PARTICIPATION_INSTRUCTION}
Use this tone reference: "${styleGuide}".`;

  let text = await ensureDistinct(
    prompt,
    closingGuides,
    'Make the reflection more concrete and the question more specific.',
  );

  if (isClosingInvalid(text)) {
    text = await callAI(
      prompt,
      'Use exactly 2 lines: a strong reflection, then a specific question ending with "?".',
    );
  }

  if (isClosingInvalid(text)) {
    const fallback = 'Patterns are clearest after the rush settles.';
    const question = 'Name one moment that proved it?';
    return `${fallback}\n${question}`;
  }

  return normalizeClosingLines(text).slice(0, 2).join('\n');
};
