import React from 'react';
import type { FAQItem } from '@/components/FAQ';

/**
 * Generates FAQ Schema (JSON-LD) for SEO
 * https://developers.google.com/search/docs/appearance/structured-data/faqpage
 */
export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripMarkdown(faq.answer),
      },
    })),
  };
}

/**
 * Strips markdown formatting for schema.org text
 * Schema.org expects plain text, not markdown
 */
function stripMarkdown(markdown: string): string {
  return (
    markdown
      // Remove bold **text**
      .replace(/\*\*(.+?)\*\*/g, '$1')
      // Remove italic *text*
      .replace(/\*(.+?)\*/g, '$1')
      // Remove links [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove headings ###
      .replace(/^#{1,6}\s+/gm, '')
      // Remove list markers - and *
      .replace(/^[*-]\s+/gm, '')
      // Normalize line breaks
      .replace(/\n\n+/g, ' ')
      .trim()
  );
}

/**
 * Renders JSON-LD script tag for FAQ schema
 */
export function renderFAQSchema(faqs: FAQItem[]) {
  const schema = generateFAQSchema(faqs);

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
