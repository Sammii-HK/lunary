/**
 * AI content generator for transit deep-dive blog posts.
 *
 * Two backends:
 * - Default: claude CLI (--print mode) with Sonnet
 * - Local (TRANSIT_USE_OLLAMA=1): Ollama HTTP API on Mac Mini
 */

import { execFileSync } from 'child_process';
import type { TransitGenerationContext, TransitBlogContent } from './types';

const USE_OLLAMA = process.env.TRANSIT_USE_OLLAMA === '1';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_WRITER_MODEL = process.env.OLLAMA_WRITER_MODEL || 'gemma3:27b';

async function callOllama(
  model: string,
  prompt: string,
  numPredict = 8000,
): Promise<string> {
  const isQwen = model.includes('qwen');
  const body: Record<string, unknown> = {
    model,
    messages: [{ role: 'user', content: prompt }],
    stream: false,
    options: { num_predict: numPredict, temperature: 0.7 },
  };
  if (isQwen) body.think = false;

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(900_000), // 15 minutes for large models
  } as RequestInit);

  if (!res.ok) throw new Error(`Ollama ${model} error: ${res.status}`);
  const data = (await res.json()) as { message: { content: string } };
  return data.message.content;
}

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

function buildPrompt(ctx: TransitGenerationContext): string {
  const parts: string[] = [];

  parts.push(`You are the editorial voice of Lunary, a cosmic knowledge platform. You write investigative transit deep-dives -- journalism meets astrology. These articles exist alongside evergreen grimoire pieces that cover general planet-in-sign meanings. Your job is to be entirely different: you go into the history books, surface the obscure, and find the human story behind each transit.

Style rules:
- UK English spelling (colour, honour, realise)
- Never use em dashes. Use double hyphens (--) or rewrite the sentence
- Sentence case for headings (not Title Case)
- Never say "AI-powered" or mention AI. The knowledge comes from Lunary's grimoire
- Be conversational but authoritative. Think "investigative journalist who is also a serious astrologer"
- USE SPECIFIC NAMES, DATES, AND PEOPLE. "Napoleon was born at the tail end of Pluto in Capricorn" beats "leaders emerged"
- Surface facts most readers will not know. Avoid the obvious. The reader already knows "Jupiter expands". Tell them what they have never heard
- Every section should feel like it earns its word count. No filler
- Sign breakdowns should feel personal and specific, not generic horoscope waffle

CRITICAL DIFFERENTIATION FROM EVERGREEN CONTENT:
The Lunary grimoire already covers what ${ctx.planet} in ${ctx.sign} means in general. Do NOT repeat those meanings. Instead:
- Focus on what ACTUALLY HAPPENED during previous transits -- specific events, people, cultural shifts
- Surface obscure historical facts: who was alive, what they built, what collapsed, what was invented
- Find the surprising angle: what conventional astrology gets wrong about this transit, what nobody talks about
- Make the reader feel like they have just been let in on something

Write a deep-dive transit blog post about: ${ctx.planet} ${ctx.transitType} in ${ctx.sign} ${ctx.year}`);
  parts.push('');

  // Core transit data
  parts.push('## Transit details');
  parts.push(`Planet: ${ctx.planet}`);
  parts.push(`Sign: ${ctx.sign}`);
  parts.push(`Type: ${ctx.transitType}`);
  if (ctx.startDate) parts.push(`Start date: ${ctx.startDate}`);
  if (ctx.endDate) parts.push(`End date: ${ctx.endDate}`);
  if (ctx.totalDays)
    parts.push(`Duration: approximately ${ctx.totalDays} days`);
  if (ctx.hasRetrograde)
    parts.push(
      'Note: includes retrograde periods where the planet briefly returns to the previous sign',
    );
  if (ctx.segments.length > 1) {
    parts.push(
      `Segments (retrograde re-entries): ${ctx.segments.map((s) => `${s.start} to ${s.end}`).join(', ')}`,
    );
  }

  // Orbital context
  if (ctx.orbitalPeriodYears) {
    parts.push(
      `Orbital period: ${ctx.orbitalPeriodYears} years (full cycle through all 12 signs)`,
    );
  }
  if (ctx.yearsPerSign) {
    parts.push(`Time per sign: approximately ${ctx.yearsPerSign} years`);
  }
  parts.push(`Rarity: ${ctx.rarity}`);

  // Dignity
  if (ctx.dignity) {
    parts.push(
      `Planetary dignity: ${ctx.planet} is in ${ctx.dignity} in ${ctx.sign}`,
    );
  }

  // Themes and guidance
  parts.push('');
  parts.push('## Themes and guidance');
  parts.push(`Description: ${ctx.description}`);
  parts.push(`Themes: ${ctx.themes.join(', ')}`);
  parts.push(`Do: ${ctx.doList.join(', ')}`);
  parts.push(`Avoid: ${ctx.avoidList.join(', ')}`);
  parts.push(`Tone: ${ctx.tone}`);

  // Historical context
  if (ctx.previousPeriods.length > 0 || ctx.historicalTheme) {
    parts.push('');
    parts.push('## Historical context');
    if (ctx.historicalTheme) {
      parts.push(`Historical theme: ${ctx.historicalTheme}`);
    }
    if (ctx.previousPeriods.length > 0) {
      parts.push(
        `Previous periods when ${ctx.planet} was in ${ctx.sign}: ${ctx.previousPeriods.join(', ')}`,
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

  // Related transits
  if (ctx.relatedTransits.length > 0) {
    parts.push('');
    parts.push('## Other transits happening in ' + ctx.year);
    for (const rel of ctx.relatedTransits.slice(0, 5)) {
      parts.push(`- ${rel.title} (${rel.planet} in ${rel.sign})`);
    }
    parts.push(
      'Mention 1-2 of these in the introduction or closing as additional context for the year.',
    );
  }

  // Output instructions
  parts.push('');
  parts.push('## Output requirements');
  parts.push(
    'Return ONLY a valid JSON object (no markdown fences, no explanation) with these fields:',
  );
  parts.push(
    '- "title": SEO-optimised, under 70 chars. Target search queries like "saturn in aries 2025 meaning"',
  );
  parts.push('- "subtitle": a supporting line, 10-20 words');
  parts.push('- "metaDescription": 150-160 chars for Google snippet');
  parts.push('- "keywords": array of 8-12 search terms people would type');
  parts.push(
    '- "introduction": open with a specific historical fact or surprising detail to hook the reader -- not a generic "Saturn is the planet of discipline" opener. Ground it in the real world immediately. Why does this particular transit matter right now, and what does history tell us to expect, 200-300 words',
  );
  parts.push(
    '- "historicalDeepDive": the centrepiece section, 500-700 words. Go deep into the historical record. Name specific people, events, inventions, and cultural movements that coincided with previous transits. Surface at least one obscure or counterintuitive fact the reader is unlikely to know. Identify a repeating pattern across cycles and explain WHY this transit tends to produce it. Do not repeat the general meanings already in the grimoire -- this is the historical case file',
  );
  parts.push(
    '- "astronomicalContext": exact dates, mechanics, retrograde windows explained simply, 200-300 words',
  );
  parts.push(
    '- "practicalGuidance": nuanced do/avoid with real examples, 300-400 words',
  );
  parts.push(
    '- "signBreakdowns": object with ALL 12 zodiac signs as lowercase keys (aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces), 80-120 words each. Make each feel personal and specific',
  );
  parts.push('- "closingSection": forward-looking, empowering, 100-200 words');

  return parts.join('\n');
}

/**
 * Extract JSON from a response that may be wrapped in markdown code fences.
 */
function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const jsonMatch = text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) return jsonMatch[1].trim();
  return text.trim();
}

/**
 * Generate a transit deep-dive blog post using claude CLI --print.
 *
 * Uses Haiku for speed/cost since the context is rich enough that
 * the model mostly organises and expands existing data.
 */
export async function generateTransitBlogPost(
  ctx: TransitGenerationContext,
): Promise<TransitBlogContent> {
  const prompt = buildPrompt(ctx);

  let rawOutput: string;
  if (USE_OLLAMA) {
    console.log(`  [ollama] ${OLLAMA_WRITER_MODEL} — this may take 10-20 min`);
    rawOutput = await callOllama(OLLAMA_WRITER_MODEL, prompt, 10000);
  } else {
    // Call claude CLI in --print mode with Sonnet for richer historical depth
    // execFileSync avoids shell injection -- prompt passed via stdin
    rawOutput = execFileSync(
      'claude',
      ['--print', '--model', 'sonnet', '--output-format', 'text'],
      {
        input: prompt,
        encoding: 'utf-8',
        maxBuffer: 4 * 1024 * 1024, // 4MB for longer Sonnet output
        timeout: 300_000, // 5 minutes
      },
    );
  }

  const jsonStr = extractJSON(rawOutput);
  const content = JSON.parse(jsonStr) as TransitBlogContent;

  // Validate all 12 signs are present
  const missingSigns = ZODIAC_SIGNS.filter(
    (sign) => !content.signBreakdowns[sign],
  );
  if (missingSigns.length > 0) {
    for (const sign of missingSigns) {
      const capitalSign = sign.charAt(0).toUpperCase() + sign.slice(1);
      content.signBreakdowns[sign] =
        `${capitalSign}, this transit touches your chart in subtle ways. Pay attention to the house where ${ctx.sign} falls in your birth chart, as that is where ${ctx.planet}'s energy will be most active. Use this period to reflect on ${ctx.themes[0]} and how it shows up in your daily life.`;
    }
  }

  return content;
}

/**
 * Count total words across all content sections.
 */
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
