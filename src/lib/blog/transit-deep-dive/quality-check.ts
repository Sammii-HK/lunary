/**
 * Quality check for transit deep-dive blog articles.
 *
 * Two-pass check:
 * 1. Deterministic rules — instant, no LLM cost
 * 2. LLM scoring pass — historical depth, UK English, specificity
 *
 * Articles scoring below PUBLISH_THRESHOLD are saved as 'draft' for review.
 */

import { execFileSync } from 'child_process';
import type { TransitBlogContent } from './types';

const USE_OLLAMA = process.env.TRANSIT_USE_OLLAMA === '1';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_SCORER_MODEL = process.env.OLLAMA_SCORER_MODEL || 'qwen3:14b';

async function callOllamaSingle(prompt: string): Promise<string> {
  const body: Record<string, unknown> = {
    model: OLLAMA_SCORER_MODEL,
    messages: [{ role: 'user', content: prompt }],
    stream: false,
    think: false,
    options: { num_predict: 512, temperature: 0 },
  };
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  } as RequestInit);
  if (!res.ok) throw new Error(`Ollama scorer error: ${res.status}`);
  const data = (await res.json()) as { message: { content: string } };
  return data.message.content;
}

export const PUBLISH_THRESHOLD = 7; // out of 10

// --- Deterministic checks ---

const BANNED_PHRASES = [
  'cosmic dance',
  'step into your',
  'unlock your',
  'manifest your',
  'embrace your',
  'gentle nudge',
  'whisper',
  'whispering',
  'journey of self-discovery',
  'many believe',
  'the key to',
  'the secret to',
  'transforms your',
  'level up',
  'in conclusion',
];

const GENERIC_OPENERS = [
  /^saturn is the planet of/i,
  /^jupiter is the planet of/i,
  /^pluto is the planet of/i,
  /^neptune is the planet of/i,
  /^uranus is the planet of/i,
  /^[a-z]+ is (a|the) planet (of|that)/i,
  /^[a-z]+ in [a-z]+ is (a|the)/i,
  /^when [a-z]+ enters [a-z]+, (it|we|you)/i,
];

export interface DeterministicResult {
  pass: boolean;
  issues: string[];
}

export function runDeterministicChecks(
  content: TransitBlogContent,
): DeterministicResult {
  const issues: string[] = [];

  const allText = [
    content.introduction,
    content.historicalDeepDive,
    content.astronomicalContext,
    content.practicalGuidance,
    content.closingSection,
    ...Object.values(content.signBreakdowns),
  ].join(' ');

  // Em dash check
  if (allText.includes('—') || /\s--\s/.test(allText)) {
    issues.push('Contains em dash (—) — use double hyphens or rewrite');
  }

  // Banned phrases
  const lower = allText.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      issues.push(`Contains banned phrase: "${phrase}"`);
    }
  }

  // Generic opener check
  const intro = content.introduction.trim();
  for (const pattern of GENERIC_OPENERS) {
    if (pattern.test(intro)) {
      issues.push(
        'Introduction opens with a generic "X is the planet of..." opener — must open with a specific historical fact',
      );
      break;
    }
  }

  // Title length
  if (content.title.length > 70) {
    issues.push(`Title too long: ${content.title.length} chars (max 70)`);
  }

  // Meta description length
  if (
    content.metaDescription.length < 140 ||
    content.metaDescription.length > 165
  ) {
    issues.push(
      `Meta description is ${content.metaDescription.length} chars (target 140-165)`,
    );
  }

  // All 12 sign breakdowns present
  const SIGNS = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];
  const missingSigns = SIGNS.filter(
    (s) => !content.signBreakdowns[s] || content.signBreakdowns[s].length < 50,
  );
  if (missingSigns.length > 0) {
    issues.push(`Missing or thin sign breakdowns: ${missingSigns.join(', ')}`);
  }

  return { pass: issues.length === 0, issues };
}

// --- LLM scoring pass ---

export interface LLMScoreResult {
  score: number; // 1-10
  breakdown: {
    historicalDepth: number; // 1-10: specific names, dates, events
    ukEnglish: number; // 1-10: colour, honour, realise etc
    specificity: number; // 1-10: avoids vague generalities
    differentiation: number; // 1-10: distinct from generic evergreen content
    readability: number; // 1-10: flows well, earns its word count
  };
  feedback: string;
  pass: boolean;
}

export async function runLLMScoring(
  content: TransitBlogContent,
): Promise<LLMScoreResult> {
  const excerpt = [
    `TITLE: ${content.title}`,
    `\nINTRODUCTION:\n${content.introduction}`,
    `\nHISTORICAL DEEP DIVE (first 600 chars):\n${content.historicalDeepDive.slice(0, 600)}`,
    `\nPRACTICAL GUIDANCE (first 300 chars):\n${content.practicalGuidance.slice(0, 300)}`,
    `\nARIES BREAKDOWN:\n${content.signBreakdowns['aries'] ?? '(missing)'}`,
  ].join('\n');

  const prompt = `You are a quality editor for Lunary, a cosmic knowledge platform. Score this transit deep-dive blog article excerpt on five criteria. Be strict — most AI-generated astrology content is mediocre.

${excerpt}

Score each criterion 1-10:

1. **Historical depth**: Does it cite SPECIFIC people, events, dates from previous transits? (10 = multiple named figures/events with precise dates, 1 = vague references like "leaders emerged")
2. **UK English**: Uses colour/honour/realise/whilst etc, not color/honor/realize/while? (10 = fully UK, 1 = American English throughout)
3. **Specificity**: Avoids vague astrology waffle? Feels like a real journalist wrote it? (10 = every sentence earns its place, 1 = generic horoscope copy)
4. **Differentiation**: Clearly distinct from generic "Jupiter in Cancer means nurturing" evergreen content? (10 = entirely case-file/journalism approach, 1 = just rephrased evergreen)
5. **Readability**: Flows well, engaging, appropriate tone? (10 = compulsive read, 1 = robotic)

Return ONLY valid JSON, no markdown:
{
  "historicalDepth": <1-10>,
  "ukEnglish": <1-10>,
  "specificity": <1-10>,
  "differentiation": <1-10>,
  "readability": <1-10>,
  "feedback": "<one sentence of the most important thing to fix, or 'Looks good' if strong>"
}`;

  let rawOutput: string;
  if (USE_OLLAMA) {
    rawOutput = await callOllamaSingle(prompt);
  } else {
    rawOutput = execFileSync(
      'claude',
      ['--print', '--model', 'haiku', '--output-format', 'text'],
      {
        input: prompt,
        encoding: 'utf-8',
        maxBuffer: 512 * 1024,
        timeout: 60_000,
      },
    );
  }

  // Extract JSON
  const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('LLM scorer returned invalid JSON');

  const parsed = JSON.parse(jsonMatch[0]);
  const breakdown = {
    historicalDepth: parsed.historicalDepth ?? 5,
    ukEnglish: parsed.ukEnglish ?? 5,
    specificity: parsed.specificity ?? 5,
    differentiation: parsed.differentiation ?? 5,
    readability: parsed.readability ?? 5,
  };

  // Weighted average: historical depth and differentiation matter most
  const score = Math.round(
    (breakdown.historicalDepth * 2.5 +
      breakdown.ukEnglish * 1.0 +
      breakdown.specificity * 2.5 +
      breakdown.differentiation * 2.5 +
      breakdown.readability * 1.5) /
      10,
  );

  return {
    score,
    breakdown,
    feedback: parsed.feedback ?? '',
    pass: score >= PUBLISH_THRESHOLD,
  };
}

// --- Combined check ---

export interface QualityCheckResult {
  status: 'published' | 'draft';
  score: number | null;
  deterministicIssues: string[];
  llmBreakdown: LLMScoreResult['breakdown'] | null;
  feedback: string;
  summary: string;
}

export async function checkArticleQuality(
  content: TransitBlogContent,
): Promise<QualityCheckResult> {
  // Step 1: deterministic
  const det = runDeterministicChecks(content);

  // Step 2: LLM scoring
  let llm: LLMScoreResult | null = null;
  try {
    llm = await runLLMScoring(content);
  } catch (e) {
    // If LLM scorer fails, fall back to deterministic only
    console.warn(
      '  [quality] LLM scorer failed, using deterministic only:',
      (e as Error).message,
    );
  }

  const deterministicFail = !det.pass;
  const llmFail = llm !== null && !llm.pass;
  const shouldDraft = deterministicFail || llmFail;

  const score = llm?.score ?? null;
  const feedback = llm?.feedback ?? det.issues[0] ?? '';

  const lines: string[] = [];
  if (score !== null) lines.push(`Score: ${score}/10`);
  if (det.issues.length > 0) lines.push(`Issues: ${det.issues.join('; ')}`);
  if (llm?.feedback) lines.push(`Feedback: ${llm.feedback}`);

  return {
    status: shouldDraft ? 'draft' : 'published',
    score,
    deterministicIssues: det.issues,
    llmBreakdown: llm?.breakdown ?? null,
    feedback,
    summary: lines.join(' | ') || 'Passed all checks',
  };
}
