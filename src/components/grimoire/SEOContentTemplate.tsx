'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';
import {
  createArticleSchema,
  createFAQPageSchema,
  createImageObjectSchema,
  renderJsonLd,
} from '@/lib/schema';
import { ParsedMarkdown } from '@/utils/markdown';

/**
 * Format a URL segment into a human-readable label
 * "the-fool" → "The Fool"
 * "birth-chart" → "Birth Chart"
 */
function formatSegmentLabel(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Auto-generate breadcrumbs from a canonical URL
 * https://lunary.app/grimoire/zodiac/aries → [Grimoire, Zodiac, Aries]
 */
function generateBreadcrumbsFromUrl(canonicalUrl: string): BreadcrumbItem[] {
  const path = canonicalUrl.replace(/^https?:\/\/[^/]+/, '');
  const segments = path.split('/').filter(Boolean);

  return segments.map((segment, index) => ({
    label: formatSegmentLabel(segment),
    href: '/' + segments.slice(0, index + 1).join('/'),
  }));
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SEOContentTemplateProps {
  // Core SEO
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;

  // Article metadata
  datePublished?: string;
  dateModified?: string;
  image?: string;
  imageAlt?: string;
  articleSection?: string;

  // Featured snippet optimization
  whatIs?: {
    question: string;
    answer: string;
  };

  // Content sections
  intro?: string;
  tldr?: string;
  meaning?: string;
  emotionalThemes?: string[];
  howToWorkWith?: string[];
  signsMostAffected?: string[];
  journalPrompts?: string[];
  symbolism?: string;
  numerology?: string;
  astrologyCorrespondences?: string;
  rituals?: string[];
  relatedItems?: Array<{ name: string; href: string; type: string }>;

  // Rich content
  tables?: Array<{ title: string; headers: string[]; rows: string[][] }>;
  diagrams?: string;
  glyphs?: string[];
  examplePlacements?: string[];

  // FAQs
  faqs?: FAQItem[];

  // Cosmic Connections (custom component slot)
  cosmicConnections?: React.ReactNode;

  // Internal links
  internalLinks?: Array<{ text: string; href: string }>;

  // Breadcrumbs
  breadcrumbs?: BreadcrumbItem[];

  // CTA
  ctaText?: string;
  ctaHref?: string;

  // E-A-T Credibility
  showEAT?: boolean;
  sources?: Array<{ name: string; url?: string }>;

  // Children (for custom content)
  children?: React.ReactNode;
}

export function SEOContentTemplate({
  title,
  h1,
  description,
  keywords,
  canonicalUrl,
  datePublished,
  dateModified,
  image,
  imageAlt,
  articleSection,
  whatIs,
  intro,
  tldr,
  meaning,
  emotionalThemes,
  howToWorkWith,
  signsMostAffected,
  journalPrompts,
  symbolism,
  numerology,
  astrologyCorrespondences,
  rituals,
  relatedItems,
  tables,
  diagrams,
  glyphs,
  examplePlacements,
  faqs,
  cosmicConnections,
  internalLinks,
  breadcrumbs,
  ctaText,
  ctaHref,
  showEAT = true,
  sources,
  children,
}: SEOContentTemplateProps) {
  // Auto-generate breadcrumbs from URL if not provided
  const autoBreadcrumbs = useMemo(() => {
    if (breadcrumbs && breadcrumbs.length > 0) {
      return breadcrumbs;
    }
    return generateBreadcrumbsFromUrl(canonicalUrl);
  }, [canonicalUrl, breadcrumbs]);

  const faqSchema = faqs ? createFAQPageSchema(faqs) : null;

  const articleImage = image || `https://lunary.app/api/og/cosmic`;
  const articleImageAlt = imageAlt || `${h1} - Lunary Grimoire`;

  // Create article schema with auto-speakable for AI/voice results
  const articleSchema = createArticleSchema({
    headline: h1,
    description,
    url: canonicalUrl,
    keywords,
    datePublished,
    dateModified,
    image: articleImage,
    section: articleSection,
  });

  // Add speakable specification for Google AI Overviews and voice assistants
  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: h1,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: [
        'h1',
        '.tldr',
        '.what-is-answer',
        'header p',
        'section > p:first-of-type',
      ],
    },
    url: canonicalUrl,
  };

  const imageSchema = createImageObjectSchema({
    url: articleImage,
    caption: articleImageAlt,
  });

  return (
    <article className='max-w-4xl mx-auto space-y-8 p-4'>
      {/* JSON-LD Schemas */}
      {renderJsonLd(faqSchema)}
      {renderJsonLd(articleSchema)}
      {renderJsonLd(imageSchema)}
      {renderJsonLd(speakableSchema)}

      {/* Breadcrumbs - auto-generated from URL if not provided */}
      {autoBreadcrumbs.length > 0 && <Breadcrumbs items={autoBreadcrumbs} />}

      {/* H1 */}
      <header className='mb-8'>
        <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
          {h1}
        </h1>
        {description && (
          <p className='text-lg text-zinc-400 leading-relaxed'>{description}</p>
        )}
      </header>

      {/* What is X? - Featured Snippet Optimization */}
      {whatIs && (
        <section className='mb-8'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-3'>
            {whatIs.question}
          </h2>
          <p className='what-is-answer text-zinc-300 leading-relaxed'>
            {whatIs.answer}
          </p>
        </section>
      )}

      {/* TL;DR Quick Meaning Block */}
      {tldr && (
        <div className='tldr bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-lg p-6 mb-8'>
          <h2 className='text-xl font-medium text-lunary-accent-300 mb-3'>
            Quick Meaning
          </h2>
          <p className='text-zinc-200 leading-relaxed'>{tldr}</p>
        </div>
      )}

      {/* Intro */}
      {intro && (
        <section className='prose prose-invert max-w-none'>
          <p className='text-lg text-zinc-300 leading-relaxed'>{intro}</p>
        </section>
      )}

      {/* Meaning Section */}
      {meaning && (
        <section>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>Meaning</h2>
          <div className='prose prose-invert max-w-none'>
            <ParsedMarkdown content={meaning} />
          </div>
        </section>
      )}

      {/* Emotional Themes */}
      {emotionalThemes && emotionalThemes.length > 0 && (
        <section>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            Emotional Themes
          </h2>
          <ul className='space-y-2'>
            {emotionalThemes.map((theme, index) => (
              <li key={index} className='flex items-start gap-3 text-zinc-300'>
                <span className='text-lunary-accent mt-1'>•</span>
                <span>{theme}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* How to Work With This Energy */}
      {howToWorkWith && howToWorkWith.length > 0 && (
        <section>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            How to Work With This Energy
          </h2>
          <div className='space-y-3'>
            {howToWorkWith.map((item, index) => (
              <div
                key={index}
                className='bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4'
              >
                <p className='text-zinc-300 leading-relaxed'>{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Signs Most Affected */}
      {signsMostAffected && signsMostAffected.length > 0 && (
        <section>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            Signs Most Affected
          </h2>
          <div className='flex flex-wrap gap-2'>
            {signsMostAffected.map((sign, index) => (
              <Link
                key={index}
                href={`/grimoire/zodiac/${sign.toLowerCase()}`}
                className='px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 hover:text-lunary-accent-300 transition-colors'
              >
                {sign}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Glyphs */}
      {glyphs && glyphs.length > 0 && (
        <section>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>Symbols</h2>
          <div className='flex gap-4 text-4xl'>
            {glyphs.map((glyph, index) => (
              <span key={index} className='text-zinc-300 font-astro'>
                {glyph}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Symbolism */}
      {symbolism && (
        <section>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            Symbolism Breakdown
          </h2>
          <div className='prose prose-invert max-w-none'>
            <p className='text-zinc-300 leading-relaxed whitespace-pre-line'>
              {symbolism}
            </p>
          </div>
        </section>
      )}

      {/* Numerology */}
      {numerology && (
        <section>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            Numerology & Astrology Correspondences
          </h2>
          <div className='prose prose-invert max-w-none'>
            <p className='text-zinc-300 leading-relaxed whitespace-pre-line'>
              {numerology}
            </p>
          </div>
        </section>
      )}

      {/* Astrology Correspondences */}
      {astrologyCorrespondences && (
        <section>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            Astrological Correspondences
          </h2>
          <div className='prose prose-invert max-w-none'>
            <p className='text-zinc-300 leading-relaxed whitespace-pre-line'>
              {astrologyCorrespondences}
            </p>
          </div>
        </section>
      )}

      {/* Tables */}
      {tables &&
        tables.map((table, tableIndex) => (
          <section key={tableIndex}>
            <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
              {table.title}
            </h2>
            <div className='overflow-x-auto'>
              <table className='w-full border-collapse border border-zinc-700'>
                <thead>
                  <tr className='bg-zinc-800/50'>
                    {table.headers.map((header, headerIndex) => (
                      <th
                        key={headerIndex}
                        className='border border-zinc-700 px-4 py-3 text-left text-zinc-200 font-medium'
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className='border-b border-zinc-700 hover:bg-zinc-800/30'
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className='border border-zinc-700 px-4 py-3 text-zinc-300'
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

      {/* Example Placements */}
      {examplePlacements && examplePlacements.length > 0 && (
        <section>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            Example Chart Placements
          </h2>
          <div className='space-y-3'>
            {examplePlacements.map((placement, index) => (
              <div
                key={index}
                className='bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4'
              >
                <p className='text-zinc-300 leading-relaxed'>{placement}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rituals */}
      {rituals && rituals.length > 0 && (
        <section>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            Rituals to Work With This Energy
          </h2>
          <div className='space-y-4'>
            {rituals.map((ritual, index) => (
              <div
                key={index}
                className='bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-6'
              >
                <div className='prose prose-invert max-w-none'>
                  <p className='text-zinc-300 leading-relaxed whitespace-pre-line'>
                    {ritual}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Journal Prompts */}
      {journalPrompts && journalPrompts.length > 0 && (
        <section>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            Journal Prompts
          </h2>
          <div className='space-y-3'>
            {journalPrompts.map((prompt, index) => (
              <div
                key={index}
                className='bg-lunary-primary-950 border border-lunary-primary-800 rounded-lg p-4'
              >
                <p className='text-zinc-300 leading-relaxed italic'>
                  "{prompt}"
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Items */}
      {relatedItems && relatedItems.length > 0 && (
        <section>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            Related Topics
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {relatedItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className='block p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:bg-zinc-800/50 hover:border-lunary-primary-600 transition-colors'
              >
                <div className='flex items-center justify-between'>
                  <span className='text-zinc-300 font-medium'>{item.name}</span>
                  <span className='text-xs text-zinc-500 uppercase'>
                    {item.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Internal Links */}
      {internalLinks && internalLinks.length > 0 && (
        <section>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            Explore More
          </h2>
          <div className='flex flex-wrap gap-3'>
            {internalLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className='px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 hover:text-lunary-accent-300 transition-colors'
              >
                {link.text}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {ctaText && ctaHref && (
        <section className='bg-gradient-to-r from-lunary-primary-900/30 to-lunary-highlight-900/30 border border-lunary-primary-700 rounded-lg p-8 text-center'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-3'>{ctaText}</h2>
          <Link
            href={ctaHref}
            className='inline-block px-6 py-3 bg-lunary-primary hover:bg-lunary-primary-400 text-white rounded-lg font-medium transition-colors'
          >
            Get Started
          </Link>
        </section>
      )}

      {/* Cosmic Connections */}
      {cosmicConnections}

      {/* FAQs */}
      {faqs && faqs.length > 0 && (
        <section>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Frequently Asked Questions
          </h2>
          <div className='space-y-4'>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className='bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-6'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                  {faq.question}
                </h3>
                <p className='text-zinc-300 leading-relaxed'>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Children (custom content) */}
      {children && <div className='mt-8'>{children}</div>}

      {/* E-A-T Credibility Section */}
      {showEAT && (
        <footer className='mt-12 pt-8 border-t border-zinc-800/50'>
          <div className='space-y-4 text-sm text-zinc-500'>
            <div className='flex flex-wrap gap-x-6 gap-y-2'>
              <span>
                <strong className='text-zinc-400'>Written by:</strong> Sammii,
                Founder of Lunary
              </span>
              <span>
                <strong className='text-zinc-400'>Edited by:</strong> Lunary
                Astrology Team
              </span>
              {(dateModified || datePublished) && (
                <span>
                  <strong className='text-zinc-400'>Last updated:</strong>{' '}
                  {new Date(
                    dateModified || datePublished || '',
                  ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>

            {sources && sources.length > 0 && (
              <div>
                <strong className='text-zinc-400'>Sources:</strong>
                <ul className='mt-2 space-y-1'>
                  {sources.map((source, index) => (
                    <li key={index}>
                      {source.url ? (
                        <a
                          href={source.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-lunary-accent hover:text-lunary-accent-300 transition-colors'
                        >
                          {source.name}
                        </a>
                      ) : (
                        <span>{source.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!sources && (
              <div>
                <strong className='text-zinc-400'>Reference Sources:</strong>
                <ul className='mt-2 space-y-1'>
                  <li>NASA Ephemeris Data (astronomical calculations)</li>
                  <li>Traditional astrological texts</li>
                  <li>Historical tarot and occult references</li>
                </ul>
              </div>
            )}
          </div>
        </footer>
      )}
    </article>
  );
}
