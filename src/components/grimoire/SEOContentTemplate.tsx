import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';
import {
  createArticleSchema,
  createFAQPageSchema,
  createImageObjectSchema,
  createBreadcrumbSchema,
  renderJsonLd,
} from '@/lib/schema';
import { ParsedMarkdown } from '@/utils/markdown';
import { NavParamLink } from '@/components/NavParamLink';
import { getContextualCopy } from '@/lib/grimoire/getContextualCopy';
import { getContextualNudge } from '@/lib/grimoire/getContextualNudge';
import { ContextualNudgeButton } from '@/components/grimoire/ContextualNudgeButton';
import { ExploreGrimoire } from './ExploreGrimoire';
import { Heading } from '../ui/Heading';

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
  subtitle?: string;
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

  // Table of Contents
  tableOfContents?: Array<{ label: string; href: string }>;

  // Additional schema blocks (e.g., ItemList)
  additionalSchemas?: Array<Record<string, unknown>>;

  // Cosmic Connections (custom component slot)
  cosmicConnections?: React.ReactNode;

  // Internal links
  internalLinks?: Array<{ text: string; href: string }>;
  internalLinksTitle?: string;

  // Breadcrumbs
  breadcrumbs?: BreadcrumbItem[];

  // CTA
  ctaText?: string;
  ctaHref?: string;
  disableContextualNudge?: boolean;

  // E-A-T Credibility
  showEAT?: boolean;
  sources?: Array<{ name: string; url?: string }>;

  // Entity linking for schema (links Article to Thing entity)
  entityId?: string;
  entityName?: string;

  // Hero slot (e.g., moon phase preview)
  heroContent?: React.ReactNode;

  // Children (for custom content)
  children?: React.ReactNode;

  // Children placement within the template
  childrenPosition?: 'after-description' | 'before-faqs' | 'after-faqs';
  contextualCopy?: string;
  contextualCopyVariant?: 'note' | 'callout';
}

export function SEOContentTemplate({
  title,
  h1,
  subtitle,
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
  tableOfContents,
  additionalSchemas,
  cosmicConnections,
  internalLinks,
  internalLinksTitle = 'Explore More',
  breadcrumbs,
  ctaText,
  ctaHref,
  disableContextualNudge = false,
  showEAT = true,
  sources,
  entityId,
  entityName,
  heroContent,
  children,
  childrenPosition = 'before-faqs',
  contextualCopy,
  contextualCopyVariant = 'note',
}: SEOContentTemplateProps) {
  // Auto-generate breadcrumbs from URL if not provided
  const autoBreadcrumbs =
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs
      : generateBreadcrumbsFromUrl(canonicalUrl);

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
    ...(entityId &&
      entityName && {
        aboutEntity: {
          '@id': entityId,
          name: entityName,
        },
      }),
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

  const breadcrumbSchema =
    autoBreadcrumbs.length === 0
      ? null
      : createBreadcrumbSchema(
          autoBreadcrumbs.map((crumb) => ({
            name: crumb.label,
            url: crumb.href
              ? new URL(crumb.href, canonicalUrl).toString()
              : canonicalUrl,
          })),
        );

  const canonicalPathname = (() => {
    try {
      return new URL(canonicalUrl).pathname;
    } catch {
      return canonicalUrl;
    }
  })();
  const automaticCopy = getContextualCopy(canonicalPathname);
  const contextualCopySentence = contextualCopy ?? automaticCopy.sentence;
  const contextualCopyClasses =
    contextualCopyVariant === 'callout'
      ? 'bg-gradient-to-r from-lunary-primary-900 to-lunary-highlight-900 border border-transparent text-white'
      : 'bg-zinc-900/40 border border-zinc-800 text-zinc-200';
  const shouldShowContextualNudge = !disableContextualNudge;
  const contextualNudge = shouldShowContextualNudge
    ? getContextualNudge(canonicalPathname)
    : null;
  const hasContextualNudge =
    Boolean(contextualNudge?.headline) && Boolean(contextualNudge?.buttonLabel);

  return (
    <article className='max-w-4xl mx-auto overflow-x-hidden py-2 px-4'>
      {/* JSON-LD Schemas */}
      {renderJsonLd(faqSchema)}
      {renderJsonLd(articleSchema)}
      {renderJsonLd(imageSchema)}
      {renderJsonLd(speakableSchema)}
      {renderJsonLd(breadcrumbSchema)}
      {additionalSchemas?.map((schema, index) => (
        <React.Fragment key={`schema-${index}`}>
          {renderJsonLd(schema)}
        </React.Fragment>
      ))}

      {/* Breadcrumbs - auto-generated from URL if not provided */}
      {autoBreadcrumbs.length > 0 && (
        <div className='mt-2 md:mb-8 md:mt-4'>
          <Breadcrumbs items={autoBreadcrumbs} renderSchema={false} />
        </div>
      )}

      {/* H1 */}
      <header className='mb-8'>
        <h1 className='text-xl md:text-2xl font-light lg:text-4xl text-lunary-primary-100 break-words'>
          {h1}
        </h1>
        {subtitle && (
          <span className='block text-lg text-lunary-primary-400 mt-2 mb-4'>
            {subtitle}
          </span>
        )}
        {description && (
          <p className='text-zinc-400 leading-relaxed break-words mt-4'>
            {description}
          </p>
        )}
      </header>
      <div className='space-y-8 p-2 md:p-4'>
        {heroContent && <div className='mb-8'>{heroContent}</div>}

        {/* Table of Contents */}
        {tableOfContents && tableOfContents.length > 0 && (
          <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6 mb-12'>
            <h2 className='text-lg text-lunary-primary-100 mb-4'>
              Table of Contents
            </h2>
            <ol className='space-y-2 text-zinc-400'>
              {tableOfContents.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className='hover:text-lunary-primary-400 break-words'
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {contextualCopySentence && (
          <div
            className={`${contextualCopyClasses} rounded-lg p-4 sm:p-5 text-sm leading-relaxed break-words`}
          >
            {contextualCopySentence}
          </div>
        )}

        {/* TL;DR Quick Meaning Block */}
        {tldr && (
          <div className='tldr bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-lg p-4 sm:p-6 my-6 mb-8 w-full overflow-x-hidden'>
            <h2 className='text-md md:text-xl font-medium text-lunary-accent-300 mb-3 break-words'>
              Quick Meaning
            </h2>
            <p className='text-zinc-200 leading-relaxed break-words'>{tldr}</p>
          </div>
        )}

        {/* What is X? - Featured Snippet Optimization */}
        {whatIs && (
          <section id='what-is' className='mb-8'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-3 break-words'>
              {whatIs.question}
            </h2>
            <p className='what-is-answer text-zinc-300 leading-relaxed break-words'>
              {whatIs.answer}
            </p>
          </section>
        )}

        {/* Intro */}
        {intro && (
          <section className='prose prose-invert max-w-none overflow-x-hidden'>
            <p className='text-zinc-300 leading-relaxed break-words'>{intro}</p>
          </section>
        )}

        {/* Children (custom content) - optional placement */}
        {childrenPosition === 'after-description' && children && (
          <div id='explore-practices' className='mt-8'>
            {children}
          </div>
        )}

        {/* Meaning Section */}
        {meaning && (
          <section id='meaning' className='overflow-x-hidden'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-4 break-words'>
              Meaning
            </h2>
            <div className='prose prose-invert max-w-none break-words'>
              <ParsedMarkdown content={meaning} />
            </div>
          </section>
        )}

        {/* Emotional Themes */}
        {emotionalThemes && emotionalThemes.length > 0 && (
          <section className='overflow-x-hidden'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-4 break-words'>
              Emotional Themes
            </h2>
            <ul className='space-y-2'>
              {emotionalThemes.map((theme, index) => (
                <li
                  key={index}
                  className='flex items-start gap-3 text-zinc-300 break-words'
                >
                  <span className='text-lunary-accent mt-1 flex-shrink-0'>
                    •
                  </span>
                  <span className='min-w-0'>{theme}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* How to Work With This Energy */}
        {howToWorkWith && howToWorkWith.length > 0 && (
          <section id='how-to-work' className='overflow-x-hidden'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-4 break-words'>
              How to Work With This Energy
            </h2>
            <div className='space-y-3'>
              {howToWorkWith.map((item, index) => (
                <div
                  key={index}
                  className='bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4 w-full overflow-x-hidden'
                >
                  <p className='text-zinc-300 leading-relaxed break-words'>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Signs Most Affected */}
        {signsMostAffected && signsMostAffected.length > 0 && (
          <section className='overflow-x-hidden'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-4 break-words'>
              Signs Most Affected
            </h2>
            <div className='flex flex-wrap gap-2'>
              {signsMostAffected.map((sign, index) => (
                <NavParamLink
                  key={index}
                  href={`/grimoire/zodiac/${sign.toLowerCase()}`}
                  className='px-3 sm:px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 hover:text-lunary-accent-300 transition-colors whitespace-nowrap'
                >
                  {sign}
                </NavParamLink>
              ))}
            </div>
          </section>
        )}

        {/* Glyphs */}
        {glyphs && glyphs.length > 0 && (
          <section className='overflow-x-hidden'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-4 break-words'>
              Symbols
            </h2>
            <div className='flex flex-wrap gap-4 text-3xl sm:text-4xl'>
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
          <section className='overflow-x-hidden'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-4 break-words'>
              Symbolism Breakdown
            </h2>
            <div className='prose prose-invert max-w-none break-words'>
              <p className='text-zinc-300 leading-relaxed whitespace-pre-line break-words'>
                {symbolism}
              </p>
            </div>
          </section>
        )}

        {/* Numerology */}
        {numerology && (
          <section className='overflow-x-hidden'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-4 break-words'>
              Numerology & Astrology Correspondences
            </h2>
            <div className='prose prose-invert max-w-none break-words'>
              <p className='text-zinc-300 leading-relaxed whitespace-pre-line break-words'>
                {numerology}
              </p>
            </div>
          </section>
        )}

        {/* Astrology Correspondences */}
        {astrologyCorrespondences && (
          <section className='overflow-x-hidden'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-4 break-words'>
              Astrological Correspondences
            </h2>
            <div className='prose prose-invert max-w-none break-words'>
              <p className='text-zinc-300 leading-relaxed whitespace-pre-line break-words'>
                {astrologyCorrespondences}
              </p>
            </div>
          </section>
        )}

        {/* Tables */}
        {tables &&
          tables.map((table, tableIndex) => (
            <section
              key={tableIndex}
              id={tableIndex === 0 ? 'practices-overview' : undefined}
              className='overflow-x-hidden'
            >
              <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-4 break-words'>
                {table.title}
              </h2>
              <div className='max-w-full overflow-x-auto'>
                <table className='w-full border-collapse border border-zinc-700'>
                  <thead>
                    <tr className='bg-zinc-800/50'>
                      {table.headers.map((header, headerIndex) => (
                        <th
                          key={headerIndex}
                          className='border border-zinc-700 px-2 sm:px-4 py-2 sm:py-3 text-left text-zinc-200 font-medium  break-words whitespace-nowrap'
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
                            className='border border-zinc-700 px-2 sm:px-4 py-2 sm:py-3 text-zinc-300  break-words'
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
          <section className='overflow-x-hidden'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-4 break-words'>
              Example Chart Placements
            </h2>
            <div className='space-y-3'>
              {examplePlacements.map((placement, index) => (
                <div
                  key={index}
                  className='bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4 w-full overflow-x-hidden'
                >
                  <p className='text-zinc-300 leading-relaxed break-words'>
                    {placement}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Rituals */}
        {rituals && rituals.length > 0 && (
          <section id='rituals' className='overflow-x-hidden'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-4 break-words'>
              Rituals to Work With This Energy
            </h2>
            <div className='space-y-4'>
              {rituals.map((ritual, index) => (
                <div
                  key={index}
                  className='bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4 sm:p-6 w-full overflow-x-hidden'
                >
                  <div className='prose prose-invert max-w-none break-words'>
                    <p className='text-zinc-300 leading-relaxed whitespace-pre-line break-words'>
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
          <section id='journal-prompts' className='overflow-x-hidden'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-4 break-words'>
              Journal Prompts
            </h2>
            <div className='space-y-3'>
              {journalPrompts.map((prompt, index) => (
                <div
                  key={index}
                  className='bg-lunary-primary-950 border border-lunary-primary-800 rounded-lg p-4 w-full overflow-x-hidden'
                >
                  <p className='text-zinc-300 leading-relaxed italic break-words'>
                    "{prompt}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Internal Links */}
        {/* {internalLinks && internalLinks.length > 0 && (
        <section className='overflow-x-hidden'>
          <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-4 break-words'>
            {internalLinksTitle}
          </h2>
          <div className='flex flex-wrap gap-3'>
            {internalLinks.map((link, index) => (
              <NavParamLink
                key={index}
                href={link.href}
                className='px-3 sm:px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 hover:text-lunary-accent-300 transition-colors  break-words'
              >
                {link.text}
              </NavParamLink>
            ))}
          </div>
        </section>
      )} */}

        {/* CTA or contextual nudge */}
        {hasContextualNudge && contextualNudge ? (
          <section className='bg-gradient-to-r from-lunary-primary-900/30 to-lunary-highlight-900/30 border border-lunary-primary-700 rounded-lg p-6 sm:p-8 my-4 md:my-6 text-center overflow-x-hidden'>
            <Heading
              variant='h2'
              className='text-lunary-primary-200 mb-3 break-words text-xl md:text-2xl'
            >
              {contextualNudge.headline}
            </Heading>
            <p className='text-zinc-200 mb-5 leading-relaxed'>
              {contextualNudge.subline}
            </p>
            <ContextualNudgeButton nudge={contextualNudge} />
          </section>
        ) : ctaText && ctaHref ? (
          <section className='bg-gradient-to-r from-lunary-primary-900/30 to-lunary-highlight-900/30 border border-lunary-primary-700 rounded-lg p-6 sm:p-8 text-center overflow-x-hidden'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-3 break-words'>
              {ctaText}
            </h2>
            <NavParamLink
              href={ctaHref}
              className='inline-block px-5 sm:px-6 py-2 sm:py-3 bg-lunary-primary hover:bg-lunary-primary-400 text-white rounded-lg font-medium transition-colors '
            >
              Get Started
            </NavParamLink>
          </section>
        ) : null}

        {/* Optional slot before FAQs */}
        {childrenPosition === 'before-faqs' && children && (
          <div id='explore-practices' className='mt-8'>
            {children}
          </div>
        )}

        {/* Cosmic Connections */}
        {cosmicConnections}

        {/* Related Items */}
        {!cosmicConnections && relatedItems && relatedItems.length > 0 && (
          <section className='overflow-x-hidden'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-4 break-words'>
              Continue Exploring
            </h2>
            <div className='flex flex-wrap gap-3'>
              {relatedItems?.map((item, index) => (
                <NavParamLink
                  key={index}
                  href={item.href}
                  className='px-3 sm:px-4 py-2 bg-zinc-800/80 border border-lunary-primary-400 rounded-lg text-zinc-300 hover:bg-zinc-700 hover:text-lunary-accent-300 transition-colors  break-words'
                >
                  {item.name}
                </NavParamLink>
              ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        {faqs && faqs.length > 0 && (
          <section id='faq' className='overflow-x-hidden sentence'>
            <h2 className='text-lg md:text-2xl text-lunary-primary-100 mb-6 break-words'>
              Frequently Asked Questions
            </h2>
            <div className='space-y-4'>
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className='bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4 sm:p-6 w-full overflow-x-hidden'
                >
                  <h3 className='text-lunary-secondary-200 mb-2 break-words'>
                    {faq.question}
                  </h3>
                  <p className='text-zinc-300 leading-relaxed break-words'>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Universal Grimoire Exploration - always shown */}
        <ExploreGrimoire />

        {/* E-A-T Credibility Section */}
        {showEAT && (
          <footer className='mt-12 pt-8 border-t border-zinc-800/50 overflow-x-hidden'>
            <div className='space-y-4 text-sm text-zinc-400'>
              <div className='flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2'>
                <span className='break-words'>
                  <strong className='text-zinc-400'>Written by:</strong> Sammii,
                  Founder of Lunary
                </span>
                <span className='break-words'>
                  <strong className='text-zinc-400'>Edited by:</strong> Lunary
                  Astrology Team
                </span>
                {(dateModified || datePublished) && (
                  <span className='break-words'>
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
      </div>
    </article>
  );
}
