/**
 * AI Overview & Voice Search Optimization Utilities
 * Helps content be selected for Google AI Overviews, Featured Snippets,
 * and voice search results.
 */

const BASE_URL = 'https://lunary.app';

/**
 * Speakable Schema - Marks content as suitable for text-to-speech
 * Used by Google for voice search results
 */
export interface SpeakableSchemaProps {
  url: string;
  cssSelectors?: string[];
  xpaths?: string[];
}

export function createSpeakableSchema({
  url,
  cssSelectors,
}: SpeakableSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors || ['.quick-meaning', '.tldr', 'h1', '.intro'],
    },
    url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
  };
}

/**
 * Format content for AI Overview selection
 * Returns a structured summary optimized for extraction
 */
export interface AIOptimizedContent {
  directAnswer: string;
  expandedAnswer: string;
  keyPoints: string[];
  relatedQuestions: string[];
}

export function formatForAIOverview(
  question: string,
  content: {
    shortAnswer: string;
    longAnswer: string;
    bulletPoints: string[];
    faqs?: Array<{ question: string; answer: string }>;
  },
): AIOptimizedContent {
  return {
    directAnswer: content.shortAnswer,
    expandedAnswer: content.longAnswer,
    keyPoints: content.bulletPoints,
    relatedQuestions: content.faqs?.map((faq) => faq.question) || [],
  };
}

/**
 * Generate a "Featured Snippet" optimized paragraph
 * Google looks for 40-60 word answers that directly answer the question
 */
export function generateFeaturedSnippetParagraph(
  question: string,
  answer: string,
  wordCount = 50,
): string {
  const words = answer.split(' ');
  if (words.length <= wordCount) {
    return answer;
  }

  // Find a natural break point around the target word count
  let breakPoint = wordCount;
  while (breakPoint < words.length && breakPoint < wordCount + 10) {
    if (words[breakPoint].endsWith('.') || words[breakPoint].endsWith('!')) {
      break;
    }
    breakPoint++;
  }

  return words.slice(0, breakPoint + 1).join(' ');
}

/**
 * Generate list snippet format (numbered or bulleted)
 * Google often shows list snippets for "how to" and "best of" queries
 */
export function generateListSnippet(
  title: string,
  items: string[],
  type: 'numbered' | 'bulleted' = 'bulleted',
): { title: string; items: string[]; html: string } {
  const listItems = items.map((item, i) =>
    type === 'numbered' ? `${i + 1}. ${item}` : `• ${item}`,
  );

  const html =
    type === 'numbered'
      ? `<ol>${items.map((item) => `<li>${item}</li>`).join('')}</ol>`
      : `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;

  return {
    title,
    items: listItems,
    html,
  };
}

/**
 * Generate definition snippet format
 * Optimal for "what is" queries
 */
export function generateDefinitionSnippet(
  term: string,
  definition: string,
): {
  term: string;
  definition: string;
  html: string;
} {
  // Ensure definition starts with the term for clarity
  const formattedDefinition = definition
    .toLowerCase()
    .startsWith(term.toLowerCase())
    ? definition
    : `${term} is ${definition.charAt(0).toLowerCase()}${definition.slice(1)}`;

  return {
    term,
    definition: formattedDefinition,
    html: `<p><strong>${term}</strong>: ${formattedDefinition}</p>`,
  };
}

/**
 * Generate table snippet format
 * Good for comparison queries and data-heavy topics
 */
export function generateTableSnippet(
  title: string,
  headers: string[],
  rows: string[][],
): { title: string; headers: string[]; rows: string[][]; html: string } {
  const html = `
<table>
  <thead>
    <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
  </thead>
  <tbody>
    ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
  </tbody>
</table>`;

  return { title, headers, rows, html };
}

/**
 * Core Web Vitals hints generator
 * Provides preload/prefetch hints for critical resources
 */
export interface PerformanceHint {
  type: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch';
  href: string;
  as?: string;
  crossorigin?: boolean;
}

export function generatePerformanceHints(pageType: string): PerformanceHint[] {
  const hints: PerformanceHint[] = [
    // Preconnect to critical origins
    { type: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      type: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: true,
    },
    // DNS prefetch for analytics
    { type: 'dns-prefetch', href: 'https://www.google-analytics.com' },
  ];

  // Page-specific hints
  switch (pageType) {
    case 'grimoire':
      hints.push({
        type: 'prefetch',
        href: '/grimoire/search',
      });
      break;
    case 'tarot':
      hints.push({
        type: 'preload',
        href: '/api/tarot/draw',
        as: 'fetch',
      });
      break;
    case 'birth-chart':
      hints.push({
        type: 'preload',
        href: '/api/chart/generate',
        as: 'fetch',
      });
      break;
  }

  return hints;
}

/**
 * Generate meta description optimized for CTR and AI extraction
 */
export function generateOptimizedMetaDescription(
  primaryKeyword: string,
  content: string,
  cta?: string,
  maxLength = 155,
): string {
  // Start with the keyword for relevance
  let description = content;

  // Add CTA if provided and fits
  if (cta && description.length + cta.length + 2 <= maxLength) {
    description = `${description}. ${cta}`;
  }

  // Truncate to max length at word boundary
  if (description.length > maxLength) {
    const words = description.slice(0, maxLength - 3).split(' ');
    words.pop(); // Remove potentially cut word
    description = words.join(' ') + '...';
  }

  return description;
}

/**
 * Generate title tag optimized for SEO and CTR
 */
export function generateOptimizedTitle(
  primaryKeyword: string,
  modifier?: string,
  brand = 'Lunary',
  maxLength = 60,
): string {
  let title = primaryKeyword;

  if (modifier) {
    title = `${primaryKeyword} ${modifier}`;
  }

  const fullTitle = `${title} | ${brand}`;

  if (fullTitle.length <= maxLength) {
    return fullTitle;
  }

  // If too long, try without modifier
  const shortTitle = `${primaryKeyword} | ${brand}`;
  if (shortTitle.length <= maxLength) {
    return shortTitle;
  }

  // Truncate primary keyword
  const available = maxLength - brand.length - 3; // 3 for " | "
  return `${primaryKeyword.slice(0, available - 3)}... | ${brand}`;
}
