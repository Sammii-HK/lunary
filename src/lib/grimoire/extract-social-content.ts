/**
 * Grimoire Social Content Extraction Pipeline
 *
 * Extracts social-ready content assets from grimoire articles.
 * Each extraction is template-ready for different platforms (X, Threads, Instagram).
 *
 * Usage:
 *   const assets = extractSocialAssets(articleContent, 'Amethyst Crystal');
 *   const xPost = formatForPlatform(assets.keyInsight, 'x');
 *   const threadsPost = formatForPlatform(assets.contrarian, 'threads');
 */

import { formatRulershipSentence } from '@/lib/astrology/rulerships';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SocialAssetType =
  | 'key_insight'
  | 'quotable'
  | 'contrarian'
  | 'did_you_know'
  | 'step_by_step';

export interface SocialAsset {
  type: SocialAssetType;
  text: string;
  /** Title of the source article */
  sourceTitle: string;
  /** Grimoire URL path (without domain) */
  grimoireSlug?: string;
}

export interface SocialAssetBundle {
  keyInsight: SocialAsset;
  quotable: SocialAsset;
  contrarian: SocialAsset;
  didYouKnow: SocialAsset;
  stepByStep: SocialAsset;
  /** All assets as an array for iteration */
  all: SocialAsset[];
}

export type SocialPlatform = 'x' | 'threads' | 'instagram';

interface PlatformLimits {
  maxChars: number;
  /** Whether to append a grimoire CTA link line */
  appendCta: boolean;
  /** Line break style */
  lineBreak: string;
}

// ---------------------------------------------------------------------------
// Platform config
// ---------------------------------------------------------------------------

const PLATFORM_LIMITS: Record<SocialPlatform, PlatformLimits> = {
  x: { maxChars: 280, appendCta: false, lineBreak: '\n' },
  threads: { maxChars: 500, appendCta: true, lineBreak: '\n\n' },
  instagram: { maxChars: 2200, appendCta: true, lineBreak: '\n\n' },
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Strip HTML tags using an O(n) state machine (no regex -- avoids ReDoS).
 */
function stripHtml(html: string): string {
  let result = '';
  let inTag = false;
  for (let i = 0; i < html.length; i++) {
    const ch = html[i];
    if (ch === '<') {
      inTag = true;
      // Replace block-level tags with a space so words don't merge
      result += ' ';
    } else if (ch === '>') {
      inTag = false;
    } else if (!inTag) {
      result += ch;
    }
  }
  return result;
}

/**
 * Normalise whitespace, collapse multiple spaces/newlines, trim.
 */
function normaliseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Convert raw article body (may be markdown or HTML) to clean plain text.
 */
function toPlainText(content: string): string {
  let text = content;

  // Strip markdown headings
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Strip markdown bold/italic markers
  text = text.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1');
  text = text.replace(/_{1,3}([^_]+)_{1,3}/g, '$1');

  // Strip markdown links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Strip markdown images ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Strip HTML
  text = stripHtml(text);

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  return normaliseWhitespace(text);
}

/**
 * Split text into sentences. Returns non-empty sentences.
 */
function splitSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by space or end of string
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}

/**
 * Truncate text to a character limit, breaking at the last full word.
 * Adds ellipsis if truncated.
 */
function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const truncated = text.slice(0, maxChars - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxChars * 0.6) {
    return truncated.slice(0, lastSpace) + '...';
  }
  return truncated + '...';
}

/**
 * Pick the best N sentences from the start of the text that fit within a char budget.
 */
function pickSentences(
  sentences: string[],
  maxChars: number,
  maxCount: number = 2,
): string {
  const picked: string[] = [];
  let totalLength = 0;

  for (const sentence of sentences) {
    const newLength =
      totalLength + (picked.length > 0 ? 1 : 0) + sentence.length;
    if (newLength > maxChars) break;
    if (picked.length >= maxCount) break;
    picked.push(sentence);
    totalLength = newLength;
  }

  if (picked.length === 0 && sentences.length > 0) {
    return truncate(sentences[0], maxChars);
  }

  return picked.join(' ');
}

// ---------------------------------------------------------------------------
// Extraction functions
// ---------------------------------------------------------------------------

/**
 * Extract a key insight: the core takeaway in 1-2 sentences.
 * Strategy: use the first 1-2 substantial sentences from the article body.
 */
function extractKeyInsight(plainText: string, title: string): string {
  const sentences = splitSentences(plainText);

  // Skip any sentence that just repeats the title
  const meaningful = sentences.filter(
    (s) => !s.toLowerCase().startsWith(title.toLowerCase()),
  );

  const source = meaningful.length > 0 ? meaningful : sentences;
  const insight = pickSentences(source, 250, 2);

  return (
    insight || `${title} is one of the most fascinating topics in the grimoire.`
  );
}

/**
 * Extract a quotable line: a standalone statement that works as a quote.
 * Strategy: find a sentence that reads like a declaration -- short, punchy,
 * ideally containing words like "is", "means", "represents", or making a claim.
 */
function extractQuotable(plainText: string, title: string): string {
  const sentences = splitSentences(plainText);

  // Prefer sentences that are statement-like and between 40-140 chars
  const candidates = sentences.filter((s) => {
    const len = s.length;
    if (len < 30 || len > 150) return false;
    // Prefer declarative sentences (contains "is", "means", "represents", etc.)
    if (
      /\b(is|are|means|represents|symbolises|symbolizes|embodies|reflects)\b/i.test(
        s,
      )
    ) {
      return true;
    }
    // Also accept sentences ending with a period (statements, not questions)
    return s.endsWith('.');
  });

  // Sort by "quotability" -- prefer shorter, punchier sentences
  const sorted = [...candidates].sort((a, b) => {
    // Prefer sentences with claim-making verbs
    const aHasClaim =
      /\b(is|are|means|represents|symbolises|symbolizes)\b/i.test(a) ? -10 : 0;
    const bHasClaim =
      /\b(is|are|means|represents|symbolises|symbolizes)\b/i.test(b) ? -10 : 0;
    // Prefer moderate length (60-100 chars is the sweet spot)
    const aLenScore = Math.abs(a.length - 80);
    const bLenScore = Math.abs(b.length - 80);
    return aHasClaim + aLenScore - (bHasClaim + bLenScore);
  });

  if (sorted.length > 0) {
    return sorted[0];
  }

  // Fallback: first sentence under 150 chars
  const short = sentences.find((s) => s.length <= 150);
  return short || truncate(plainText, 140);
}

/**
 * Extract a contrarian take: something surprising or against common belief.
 * Strategy: look for sentences containing contrast/surprise markers.
 */
function extractContrarian(plainText: string, title: string): string {
  const sentences = splitSentences(plainText);

  // Look for contrarian markers
  const contrarianPatterns = [
    /\b(but|however|contrary|surprisingly|unlike|actually|in fact|misconception|myth|not what|isn't about|aren't|doesn't|don't)\b/i,
    /\b(most people|many believe|commonly|often misunderstood|overlooked|underestimated|rarely)\b/i,
    /\b(more than|beyond|deeper|hidden|secret|unexpected|forgotten)\b/i,
  ];

  // Score sentences by how many contrarian markers they contain
  const scored = sentences
    .filter((s) => s.length >= 30 && s.length <= 250)
    .map((s) => {
      let score = 0;
      for (const pattern of contrarianPatterns) {
        if (pattern.test(s)) score += 1;
      }
      return { text: s, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored[0].text;
  }

  // Fallback: construct a contrarian frame around the topic
  const firstSubstantial = sentences.find(
    (s) => s.length >= 40 && s.length <= 200,
  );
  if (firstSubstantial) {
    return `${title} is more than what most people think. ${firstSubstantial}`;
  }

  return `${title} is widely misunderstood. There is far more depth here than surface-level interpretations suggest.`;
}

/**
 * Extract a "did you know" fact.
 * Strategy: look for sentences with factual markers (numbers, dates, origins,
 * historical references) or construct one from the content.
 */
function extractDidYouKnow(plainText: string, title: string): string {
  const sentences = splitSentences(plainText);

  // Look for factual/historical markers
  const factPatterns = [
    /\b(\d{3,4})\b/, // Years
    /\b(ancient|historically|traditionally|origins|originated|dating back|centuries|millennium)\b/i,
    /\b(derived from|comes from|named after|known as|also called)\b/i,
    /\b(studies|research|scientists|astronomers|cultures|civilisations|civilizations)\b/i,
    /\b(used to|was believed|were used|has been)\b/i,
  ];

  const scored = sentences
    .filter((s) => s.length >= 25 && s.length <= 220)
    .map((s) => {
      let score = 0;
      for (const pattern of factPatterns) {
        if (pattern.test(s)) score += 1;
      }
      return { text: s, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    const fact = scored[0].text;
    // Don't double-prefix if it already starts with "Did you know"
    if (/^did you know/i.test(fact)) return fact;
    return `Did you know? ${fact}`;
  }

  // Fallback: use a later sentence as a fact (skip the opening)
  const laterSentence = sentences.find(
    (s, i) => i >= 2 && s.length >= 30 && s.length <= 200,
  );
  if (laterSentence) {
    return `Did you know? ${laterSentence}`;
  }

  // Last resort
  const first = sentences[0];
  if (first) {
    return `Did you know? ${truncate(first, 220)}`;
  }

  return `Did you know? ${title} has a rich and fascinating history in mystical traditions.`;
}

/**
 * Extract a step-by-step tip: actionable advice.
 * Strategy: look for sentences with instructional language, or list items.
 * Construct a mini how-to from the content.
 */
function extractStepByStep(plainText: string, title: string): string {
  const sentences = splitSentences(plainText);

  // Look for actionable/instructional sentences
  const actionPatterns = [
    /\b(try|place|hold|meditate|focus|visualise|visualize|set|light|create|write|practice|begin|start|use|carry|wear|keep)\b/i,
    /\b(step|first|then|next|finally|before|during|after|when you)\b/i,
    /\b(ritual|exercise|technique|method|practice|routine)\b/i,
  ];

  const actionSentences = sentences.filter((s) => {
    if (s.length < 20 || s.length > 200) return false;
    return actionPatterns.some((p) => p.test(s));
  });

  if (actionSentences.length >= 2) {
    // Build a mini step sequence
    const steps = actionSentences.slice(0, 3);
    const formatted = steps
      .map((s, i) => `${i + 1}. ${s.replace(/^\d+\.\s*/, '')}`)
      .join('\n');
    return `How to work with ${title}:\n${formatted}`;
  }

  if (actionSentences.length === 1) {
    return `Working with ${title}: ${actionSentences[0]}`;
  }

  // Fallback: construct generic actionable advice from the content
  const descriptive = sentences.find((s) => s.length >= 30 && s.length <= 180);
  if (descriptive) {
    return `Start exploring ${title}: ${descriptive}`;
  }

  return `To begin working with ${title}, explore its properties and history in the grimoire.`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extract all social-ready content assets from a grimoire article.
 *
 * @param articleContent - Raw article body (HTML or markdown)
 * @param articleTitle - The article title
 * @param grimoireSlug - Optional grimoire slug for CTA links
 * @returns A bundle of social assets ready for platform formatting
 */
export function extractSocialAssets(
  articleContent: string,
  articleTitle: string,
  grimoireSlug?: string,
): SocialAssetBundle {
  const plainText = toPlainText(articleContent);

  const keyInsight: SocialAsset = {
    type: 'key_insight',
    text: extractKeyInsight(plainText, articleTitle),
    sourceTitle: articleTitle,
    grimoireSlug,
  };

  const quotable: SocialAsset = {
    type: 'quotable',
    text: extractQuotable(plainText, articleTitle),
    sourceTitle: articleTitle,
    grimoireSlug,
  };

  const contrarian: SocialAsset = {
    type: 'contrarian',
    text: extractContrarian(plainText, articleTitle),
    sourceTitle: articleTitle,
    grimoireSlug,
  };

  const didYouKnow: SocialAsset = {
    type: 'did_you_know',
    text: extractDidYouKnow(plainText, articleTitle),
    sourceTitle: articleTitle,
    grimoireSlug,
  };

  const stepByStep: SocialAsset = {
    type: 'step_by_step',
    text: extractStepByStep(plainText, articleTitle),
    sourceTitle: articleTitle,
    grimoireSlug,
  };

  return {
    keyInsight,
    quotable,
    contrarian,
    didYouKnow,
    stepByStep,
    all: [keyInsight, quotable, contrarian, didYouKnow, stepByStep],
  };
}

/**
 * Format a social asset for a specific platform.
 *
 * Applies character limits, CTA formatting, and platform-specific line breaks.
 *
 * @param asset - The social asset to format
 * @param platform - Target platform ('x', 'threads', or 'instagram')
 * @returns Platform-ready text string
 */
export function formatForPlatform(
  asset: SocialAsset,
  platform: SocialPlatform,
): string {
  const limits = PLATFORM_LIMITS[platform];
  let text = asset.text;

  // Build CTA line if the platform supports it and we have a slug
  const ctaLine =
    limits.appendCta && asset.grimoireSlug
      ? `Explore more: lunary.app/grimoire/${asset.grimoireSlug}`
      : '';

  // Calculate available space for the main text
  const ctaOverhead = ctaLine ? limits.lineBreak.length + ctaLine.length : 0;
  const availableChars = limits.maxChars - ctaOverhead;

  // Truncate the main text to fit
  text = truncate(text, availableChars);

  // Assemble final output
  if (ctaLine) {
    return `${text}${limits.lineBreak}${ctaLine}`;
  }

  return text;
}

/**
 * Extract social assets from a GrimoireSnippet (integrates with existing system).
 *
 * This bridges the existing GrimoireSnippet type from grimoire-content.ts
 * into the social extraction pipeline.
 */
export function extractFromSnippet(snippet: {
  title: string;
  slug: string;
  summary: string;
  keyPoints: string[];
  fullContent?: {
    description?: string;
    keywords?: string[];
    strengths?: string[];
    loveTrait?: string;
    careerTrait?: string;
    affirmation?: string;
    metaphysicalProperties?: string;
    historicalUse?: string;
    uprightMeaning?: string;
    reversedMeaning?: string;
    symbolism?: string;
    element?: string;
    planet?: string;
    traditionalRuler?: string;
    modernRuler?: string;
    modality?: string;
    spiritualMeaning?: string;
    message?: string;
    magicalUses?: string[];
    healingPractices?: string[];
    colors?: string[];
    herbs?: string[];
    traditions?: string[];
    rituals?: string[];
    history?: string;
  };
}): SocialAssetBundle {
  // Reconstruct article content from the snippet's structured data
  const parts: string[] = [];

  if (snippet.fullContent?.description) {
    parts.push(snippet.fullContent.description);
  } else if (snippet.summary) {
    parts.push(snippet.summary);
  }

  if (snippet.fullContent?.spiritualMeaning) {
    parts.push(snippet.fullContent.spiritualMeaning);
  }

  if (snippet.fullContent?.uprightMeaning) {
    parts.push(`When upright: ${snippet.fullContent.uprightMeaning}`);
  }

  if (snippet.fullContent?.reversedMeaning) {
    parts.push(`When reversed: ${snippet.fullContent.reversedMeaning}`);
  }

  if (snippet.fullContent?.metaphysicalProperties) {
    parts.push(snippet.fullContent.metaphysicalProperties);
  }

  if (snippet.fullContent?.historicalUse) {
    parts.push(snippet.fullContent.historicalUse);
  }

  if (snippet.fullContent?.history) {
    parts.push(snippet.fullContent.history);
  }

  if (snippet.fullContent?.symbolism) {
    parts.push(`Symbolism: ${snippet.fullContent.symbolism}`);
  }

  if (snippet.fullContent?.loveTrait) {
    parts.push(`In love and relationships: ${snippet.fullContent.loveTrait}`);
  }

  if (snippet.fullContent?.careerTrait) {
    parts.push(`In career: ${snippet.fullContent.careerTrait}`);
  }

  if (
    snippet.fullContent?.element &&
    (snippet.fullContent?.traditionalRuler || snippet.fullContent?.planet)
  ) {
    parts.push(
      `${snippet.title} is associated with the ${snippet.fullContent.element} element and ${formatRulershipSentence(snippet.title)}.`,
    );
  }

  if (snippet.fullContent?.healingPractices?.length) {
    parts.push(
      `Healing practices: ${snippet.fullContent.healingPractices.join('. ')}.`,
    );
  }

  if (snippet.fullContent?.magicalUses?.length) {
    parts.push(
      `Magical uses include: ${snippet.fullContent.magicalUses.join(', ')}.`,
    );
  }

  if (snippet.fullContent?.traditions?.length) {
    parts.push(
      `Traditional practices: ${snippet.fullContent.traditions.join('. ')}.`,
    );
  }

  if (snippet.fullContent?.rituals?.length) {
    parts.push(`Rituals: ${snippet.fullContent.rituals.join('. ')}.`);
  }

  if (snippet.fullContent?.affirmation) {
    parts.push(snippet.fullContent.affirmation);
  }

  // Add key points as additional content
  if (snippet.keyPoints.length > 0) {
    parts.push(...snippet.keyPoints);
  }

  const articleContent = parts.join(' ');

  return extractSocialAssets(articleContent, snippet.title, snippet.slug);
}

/**
 * Batch extract social assets for multiple articles.
 * Useful for generating a week's worth of social content from grimoire topics.
 */
export function batchExtract(
  articles: Array<{
    content: string;
    title: string;
    slug?: string;
  }>,
): SocialAssetBundle[] {
  return articles.map((article) =>
    extractSocialAssets(article.content, article.title, article.slug),
  );
}

/**
 * Get the best asset from a bundle for a given platform,
 * based on how well the text fits the platform's character limit.
 */
export function pickBestAsset(
  bundle: SocialAssetBundle,
  platform: SocialPlatform,
): SocialAsset {
  const limits = PLATFORM_LIMITS[platform];

  // Score each asset by how well it fills the available space
  // (too short = wasted opportunity, too long = needs truncation)
  const scored = bundle.all.map((asset) => {
    const formatted = formatForPlatform(asset, platform);
    const ratio = formatted.length / limits.maxChars;
    // Ideal ratio is 0.7-0.95 (fills most of the space without truncation)
    const score =
      ratio > 1
        ? 0.3 // penalise truncated content
        : ratio >= 0.7
          ? 1.0 // ideal range
          : ratio >= 0.4
            ? 0.7 // acceptable
            : 0.4; // too short
    return { asset, score, ratio };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].asset;
}
