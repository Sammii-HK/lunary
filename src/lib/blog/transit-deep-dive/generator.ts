/**
 * AI content generator for transit deep-dive blog posts.
 *
 * Uses the existing content-generator pattern with gpt-4o-mini
 * and structured JSON output via Zod schema.
 */

import { generateStructuredContent } from '@/lib/ai/content-generator';
import { z } from 'zod';
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

const TransitBlogSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  metaDescription: z.string(),
  keywords: z.array(z.string()),
  introduction: z.string(),
  historicalDeepDive: z.string(),
  astronomicalContext: z.string(),
  practicalGuidance: z.string(),
  signBreakdowns: z.record(z.string(), z.string()),
  closingSection: z.string(),
});

function buildSystemPrompt(): string {
  return `You are the editorial voice of Lunary, a cosmic knowledge platform. Your writing is witty, historically rich, and grounded in real astrology. You write deep-dive transit guides that help people understand what is coming and how to prepare.

Style rules:
- UK English spelling (colour, honour, realise)
- Never use em dashes. Use double hyphens (--) or rewrite the sentence
- Sentence case for headings (not Title Case)
- Never say "AI-powered" or mention AI. The knowledge comes from Lunary's grimoire
- Be conversational but authoritative. Think "clever friend who studied history and astrology"
- Use concrete historical examples, not vague references
- Every section should feel like it earns its word count. No filler
- Sign breakdowns should feel personal and specific, not generic horoscope waffle

Return valid JSON matching the schema exactly. No markdown code fences.`;
}

function buildUserPrompt(ctx: TransitGenerationContext): string {
  const parts: string[] = [];

  parts.push(
    `Write a deep-dive transit blog post about: ${ctx.planet} ${ctx.transitType} in ${ctx.sign} ${ctx.year}`,
  );
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
  parts.push('Generate a JSON object with these sections:');
  parts.push(
    '- title: SEO-optimised, under 70 chars. Target search queries like "saturn in aries 2025 meaning"',
  );
  parts.push('- subtitle: a supporting line, 10-20 words');
  parts.push('- metaDescription: 150-160 chars for Google snippet');
  parts.push('- keywords: 8-12 search terms people would type');
  parts.push(
    '- introduction: witty opening hook, why this transit matters NOW, 200-300 words',
  );
  parts.push(
    '- historicalDeepDive: what happened during previous transits, patterns across centuries, 400-600 words',
  );
  parts.push(
    '- astronomicalContext: exact dates, mechanics, retrograde windows explained simply, 200-300 words',
  );
  parts.push(
    '- practicalGuidance: nuanced do/avoid with real examples, 300-400 words',
  );
  parts.push(
    '- signBreakdowns: object with ALL 12 zodiac signs as lowercase keys, 80-120 words each. Make each feel personal',
  );
  parts.push('- closingSection: forward-looking, empowering, 100-200 words');

  return parts.join('\n');
}

/**
 * Generate a transit deep-dive blog post using AI.
 */
export async function generateTransitBlogPost(
  ctx: TransitGenerationContext,
): Promise<TransitBlogContent> {
  const content = await generateStructuredContent({
    prompt: buildUserPrompt(ctx),
    systemPrompt: buildSystemPrompt(),
    schema: TransitBlogSchema,
    schemaName: 'TransitBlogPost',
    temperature: 0.7,
    maxTokens: 8000,
  });

  // Validate all 12 signs are present
  const missingSigns = ZODIAC_SIGNS.filter(
    (sign) => !content.signBreakdowns[sign],
  );
  if (missingSigns.length > 0) {
    // Fill missing signs with a generic entry rather than failing
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
