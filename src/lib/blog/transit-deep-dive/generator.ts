/**
 * AI content generator for transit deep-dive blog posts.
 *
 * Three-pass pipeline:
 * 1. Sonnet  — editorial content (intro, historical deep dive, practical, closing, meta)
 * 2. Haiku   — all 12 sign breakdowns in parallel
 * 3. Sonnet  — editor pass: rewrites any weak/generic sign breakdowns from Haiku
 *
 * Splitting the work cuts total generation time from ~6min to ~2-3min while
 * keeping Sonnet's depth where it matters most.
 */

import { execFileSync } from 'child_process';
import type { TransitGenerationContext, TransitBlogContent } from './types';

const ZODIAC_SIGNS = [
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
] as const;

type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

function callClaude(
  prompt: string,
  model: 'sonnet' | 'haiku',
  timeoutMs = 240_000,
): string {
  return execFileSync(
    'claude',
    ['--print', '--model', model, '--output-format', 'text'],
    {
      input: prompt,
      encoding: 'utf-8',
      maxBuffer: 8 * 1024 * 1024,
      timeout: timeoutMs,
    },
  ) as string;
}

function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const jsonMatch = text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) return jsonMatch[1].trim();
  return text.trim();
}

function buildContextBlock(ctx: TransitGenerationContext): string {
  const parts: string[] = [];

  parts.push(`Planet: ${ctx.planet}`);
  parts.push(`Sign: ${ctx.sign}`);
  parts.push(`Type: ${ctx.transitType}`);
  if (ctx.startDate) parts.push(`Start: ${ctx.startDate}`);
  if (ctx.endDate) parts.push(`End: ${ctx.endDate}`);
  if (ctx.totalDays) parts.push(`Duration: ~${ctx.totalDays} days`);
  if (ctx.orbitalPeriodYears)
    parts.push(`Orbital period: ${ctx.orbitalPeriodYears} years`);
  if (ctx.yearsPerSign) parts.push(`Time per sign: ~${ctx.yearsPerSign} years`);
  parts.push(`Rarity: ${ctx.rarity}`);
  if (ctx.dignity)
    parts.push(`Dignity: ${ctx.planet} is in ${ctx.dignity} in ${ctx.sign}`);
  if (ctx.hasRetrograde) parts.push('Includes retrograde re-entry periods');
  if (ctx.segments.length > 1) {
    parts.push(
      `Segments: ${ctx.segments.map((s) => `${s.start} to ${s.end}`).join(', ')}`,
    );
  }

  parts.push('');
  parts.push(`Description: ${ctx.description}`);
  parts.push(`Themes: ${ctx.themes.join(', ')}`);
  parts.push(`Do: ${ctx.doList.join(', ')}`);
  parts.push(`Avoid: ${ctx.avoidList.join(', ')}`);
  parts.push(`Tone: ${ctx.tone}`);

  if (ctx.previousPeriods.length > 0 || ctx.historicalTheme) {
    parts.push('');
    if (ctx.historicalTheme)
      parts.push(`Historical theme: ${ctx.historicalTheme}`);
    if (ctx.previousPeriods.length > 0) {
      parts.push(
        `Previous periods in ${ctx.sign}: ${ctx.previousPeriods.join(', ')}`,
      );
    }
    for (const [period, events] of Object.entries(ctx.historicalEvents)) {
      parts.push(`During ${period}: ${events.join('; ')}`);
    }
  }

  if (ctx.previousTransitDates) {
    parts.push(
      `Most recent previous transit: ${ctx.previousTransitDates.start} to ${ctx.previousTransitDates.end}`,
    );
  }

  if (ctx.relatedTransits.length > 0) {
    parts.push('');
    parts.push(
      `Other transits in ${ctx.year}: ${ctx.relatedTransits
        .slice(0, 4)
        .map((r) => r.title)
        .join('; ')}`,
    );
  }

  return parts.join('\n');
}

const STYLE_RULES = `Style rules:
- UK English (colour, honour, realise, whilst)
- Never use em dashes. Use double hyphens (--) or rewrite the sentence
- Sentence case for headings
- Never mention AI or "Lunary's grimoire"
- Conversational but authoritative -- investigative journalist who is also a serious astrologer
- USE SPECIFIC NAMES, DATES, AND PEOPLE. Avoid vague generalities
- Surface facts most readers will not know`;

// --- Pass 1: Sonnet editorial content ---

function buildEditorialPrompt(ctx: TransitGenerationContext): string {
  return `You are the editorial voice of Lunary, a cosmic knowledge platform. You write investigative transit deep-dives -- journalism meets astrology.

${STYLE_RULES}

CRITICAL: The Lunary grimoire already covers general ${ctx.planet}-in-${ctx.sign} meanings. Do NOT repeat those. Focus on:
- What ACTUALLY HAPPENED during previous transits -- specific events, people, cultural shifts
- Obscure historical facts: who was alive, what they built, what collapsed, what was invented
- The surprising angle most astrologers miss

## Transit context
${buildContextBlock(ctx)}

## Output requirements
Return ONLY valid JSON (no markdown fences) with these fields:
- "title": SEO title, under 70 chars (e.g. "Saturn in Aries 2026: meaning and what history tells us")
- "subtitle": supporting line, 10-20 words
- "metaDescription": 150-160 chars for Google snippet
- "keywords": array of 8-12 search terms
- "introduction": 200-300 words. Open with a specific historical fact or surprising detail -- NOT a generic "Saturn is the planet of discipline" opener. Ground in the real world immediately
- "historicalDeepDive": 500-700 words. The centrepiece. Name specific people, events, inventions, cultural movements from previous transits. Include at least one obscure or counterintuitive fact. Identify a repeating pattern and explain why this transit produces it
- "astronomicalContext": 200-300 words. Exact dates, mechanics, retrograde windows explained simply
- "practicalGuidance": 300-400 words. Nuanced do/avoid with real examples
- "closingSection": 100-200 words. Forward-looking, empowering`;
}

// --- Pass 2: Haiku sign breakdowns ---

function buildSignBreakdownsPrompt(ctx: TransitGenerationContext): string {
  return `You are writing the per-sign section of a transit article for Lunary about ${ctx.planet} in ${ctx.sign} (${ctx.year}).

${STYLE_RULES}

The article's main themes: ${ctx.themes.join(', ')}
Transit tone: ${ctx.tone}
Do: ${ctx.doList.join(', ')}
Avoid: ${ctx.avoidList.join(', ')}

Write a breakdown for ALL 12 signs. Each should be 80-120 words, personal and specific -- not generic horoscope waffle. Reference where ${ctx.sign} falls in their chart, how ${ctx.planet}'s energy manifests for that rising/sun sign specifically. Vary the angle across signs so they don't feel templated.

Return ONLY valid JSON (no markdown fences):
{
  "aries": "...",
  "taurus": "...",
  "gemini": "...",
  "cancer": "...",
  "leo": "...",
  "virgo": "...",
  "libra": "...",
  "scorpio": "...",
  "sagittarius": "...",
  "capricorn": "...",
  "aquarius": "...",
  "pisces": "..."
}`;
}

// --- Pass 3: Sonnet editor pass on sign breakdowns ---

function buildEditorPassPrompt(
  ctx: TransitGenerationContext,
  breakdowns: Record<string, string>,
): string {
  const breakdownsText = ZODIAC_SIGNS.map(
    (s) => `${s}: ${breakdowns[s] ?? '(missing)'}`,
  ).join('\n\n');

  return `You are a senior editor at Lunary reviewing 12 per-sign breakdowns for a transit article about ${ctx.planet} in ${ctx.sign} (${ctx.year}).

${STYLE_RULES}

Rewrite any breakdown that:
- Feels generic or templated ("This transit will bring changes to your...")
- Contains an em dash
- Uses banned phrases: "cosmic dance", "step into", "unlock your", "manifest your", "gentle nudge", "whisper"
- Is under 70 words or over 130 words
- Doesn't feel specific to that sign's relationship with ${ctx.planet} in ${ctx.sign}

Leave strong breakdowns unchanged. Return ALL 12, improved or not.

## Current breakdowns:
${breakdownsText}

Return ONLY valid JSON (no markdown fences) with all 12 signs as keys.`;
}

export async function generateTransitBlogPost(
  ctx: TransitGenerationContext,
): Promise<TransitBlogContent> {
  console.log('  [1/3] Sonnet: editorial content...');
  const editorialRaw = callClaude(buildEditorialPrompt(ctx), 'sonnet', 240_000);
  const editorial = JSON.parse(extractJSON(editorialRaw)) as Omit<
    TransitBlogContent,
    'signBreakdowns'
  >;

  console.log('  [2/3] Haiku: sign breakdowns...');
  const breakdownsRaw = callClaude(
    buildSignBreakdownsPrompt(ctx),
    'haiku',
    60_000,
  );
  let breakdowns = JSON.parse(extractJSON(breakdownsRaw)) as Record<
    ZodiacSign,
    string
  >;

  // Fill any missing signs with a fallback before the editor pass
  for (const sign of ZODIAC_SIGNS) {
    if (!breakdowns[sign]) {
      const cap = sign.charAt(0).toUpperCase() + sign.slice(1);
      breakdowns[sign] =
        `${cap}, pay attention to the house where ${ctx.sign} falls in your birth chart -- that is where ${ctx.planet}'s energy will be most active during this transit.`;
    }
  }

  console.log('  [3/3] Sonnet: editor pass on breakdowns...');
  const editorRaw = callClaude(
    buildEditorPassPrompt(ctx, breakdowns),
    'sonnet',
    120_000,
  );
  try {
    const editedBreakdowns = JSON.parse(extractJSON(editorRaw)) as Record<
      ZodiacSign,
      string
    >;
    // Only accept edited versions for signs that came back
    for (const sign of ZODIAC_SIGNS) {
      if (editedBreakdowns[sign] && editedBreakdowns[sign].length > 50) {
        breakdowns[sign] = editedBreakdowns[sign];
      }
    }
  } catch {
    // Editor pass failed to parse -- keep Haiku breakdowns as-is
    console.warn('  [3/3] Editor pass parse failed, keeping Haiku breakdowns');
  }

  return {
    ...editorial,
    signBreakdowns: breakdowns,
  } as TransitBlogContent;
}

export function countWords(content: TransitBlogContent): number {
  const allText = [
    content.introduction,
    content.historicalDeepDive,
    content.astronomicalContext,
    content.practicalGuidance,
    ...Object.values(content.signBreakdowns),
    content.closingSection,
  ].join(' ');
  return allText.split(/\s+/).filter(Boolean).length;
}
