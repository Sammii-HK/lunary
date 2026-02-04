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
import { getSmartPageDates } from '@/lib/getPageDates';
import { NavParamLink } from '@/components/NavParamLink';
import { getContextualCopy } from '@/lib/grimoire/getContextualCopy';
import {
  getContextualHub,
  getContextualNudge,
} from '@/lib/grimoire/getContextualNudge';
import { SEOCTAButton } from '@/components/grimoire/SEOCTAButton';
import { ExploreGrimoire } from './ExploreGrimoire';
import { Heading } from '../ui/Heading';
import { ArticleFooter } from './ArticleFooter';
import { PeopleAlsoAsk } from './PeopleAlsoAsk';
import { ContextualNudgeSection } from '../ui/ContextualNudgeSection';
import { InlineContextualNudge } from './InlineContextualNudge';
import { ReadFullGuidePrompt } from '@/app/grimoire/guides/ReadFullGuidePrompt';
import { getInlineCtaVariant } from '@/lib/ab-tests-server';

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

  // Article metadata (auto-detected from git history if not provided)
  datePublished?: string; // First commit date if omitted
  dateModified?: string; // Last commit date if omitted
  image?: string;
  imageAlt?: string;
  articleSection?: string;

  // Featured snippet optimization
  whatIs?: {
    question: string;
    answer: string;
  };

  // Full Guide
  fullGuide?: {
    href: string;
    title: string;
    description: string;
  };

  // Content sections
  intro?: string;
  tldr?: string;
  meaning?: string;
  meaningTitle?: string;
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
  tableHidden?: boolean;
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

  // Components
  components?: React.ReactNode;
}

export async function SEOContentTemplate({
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
  meaningTitle,
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
  tableHidden = false,
  examplePlacements,
  fullGuide,
  faqs,
  tableOfContents,
  additionalSchemas,
  cosmicConnections,
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
  components,
}: SEOContentTemplateProps) {
  // Get A/B test variant for inline CTA (server-side)
  const inlineCtaVariant = await getInlineCtaVariant();

  // Auto-generate breadcrumbs from URL if not provided
  const autoBreadcrumbs =
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs
      : generateBreadcrumbsFromUrl(canonicalUrl);

  const faqSchema = faqs ? createFAQPageSchema(faqs) : null;

  const articleImage = image || `https://lunary.app/api/og/cosmic`;
  const articleImageAlt = imageAlt || `${h1} - Lunary Grimoire`;

  // Automatically get dates from git history if not provided
  const smartDates = getSmartPageDates(
    canonicalUrl,
    datePublished,
    dateModified,
  );

  // Create article schema with auto-speakable for AI/voice results
  const articleSchema = createArticleSchema({
    headline: h1,
    description,
    url: canonicalUrl,
    keywords,
    datePublished: smartDates.datePublished,
    dateModified: smartDates.dateModified,
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
  const contextualHub = getContextualHub(canonicalPathname);
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
    <article className='max-w-4xl h-fit mx-auto overflow-x-hidden pt-2 px-4 pb-[120px]'>
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
        <Heading as='h1' variant='h1'>
          {h1 || title}
        </Heading>
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
            <Heading as='h2' variant='h2'>
              Table of Contents
            </Heading>
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
            <Heading
              as='h2'
              variant='h2'
              className='text-lunary-accent-300 mb-3'
            >
              Quick Meaning
            </Heading>
            <p className='text-zinc-200 leading-relaxed break-words'>{tldr}</p>
          </div>
        )}

        {/* Inline Contextual Nudge - after TL;DR for early conversion */}
        {hasContextualNudge && contextualNudge && (
          <InlineContextualNudge
            nudge={contextualNudge}
            location='seo_inline_post_tldr'
            serverVariant={inlineCtaVariant}
          />
        )}

        {/* What is X? - Featured Snippet Optimization */}
        {whatIs && (
          <section id='what-is' className='mb-8'>
            <Heading as='h2' variant='h2'>
              {whatIs.question}
            </Heading>
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

        {fullGuide && (
          <ReadFullGuidePrompt
            href={fullGuide.href}
            title={fullGuide.title}
            description={fullGuide.description}
          />
        )}

        {/* Children (custom content) - optional placement */}
        {childrenPosition === 'after-description' && children && (
          <div id='explore-practices' className='mt-8'>
            {children}
          </div>
        )}

        {components}

        {/* Meaning Section */}
        {meaning && (
          <section id='meaning' className='overflow-x-hidden'>
            <Heading as='h2' variant='h2'>
              {meaningTitle ? meaningTitle : 'Meaning'}
            </Heading>
            <div className='prose prose-invert max-w-none break-words'>
              <ParsedMarkdown content={meaning} />
            </div>
          </section>
        )}

        {/* Emotional Themes */}
        {emotionalThemes && emotionalThemes.length > 0 && (
          <section className='overflow-x-hidden'>
            <Heading as='h2' variant='h2'>
              Emotional Themes
            </Heading>
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
            <Heading as='h2' variant='h2'>
              How to Work With This Energy
            </Heading>
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
            <Heading as='h2' variant='h2'>
              Signs Most Affected
            </Heading>
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
            <Heading as='h2' variant='h2'>
              Symbols
            </Heading>
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
            <Heading as='h2' variant='h2'>
              Symbolism Breakdown
            </Heading>
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
            <Heading as='h2' variant='h2'>
              Numerology & Astrology Correspondences
            </Heading>
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
            <Heading as='h2' variant='h2'>
              Astrological Correspondences
            </Heading>
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
              className={`overflow-x-hidden ${tableHidden ? 'hidden' : ''}`}
            >
              <Heading as='h2' variant='h2' className='capitalize'>
                {table.title}
              </Heading>
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
            <Heading as='h2' variant='h2'>
              Example Chart Placements
            </Heading>
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
            <Heading as='h2' variant='h2'>
              Rituals to Work With This Energy
            </Heading>
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
            <Heading as='h2' variant='h2'>
              Journal Prompts
            </Heading>
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
            <Heading as='h2' variant='h2'>
              Continue Exploring
            </Heading>
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
            <PeopleAlsoAsk questions={faqs} />
          </section>
        )}

        {/* Full CTA or contextual nudge - positioned after FAQs for committed readers */}
        {hasContextualNudge && contextualNudge ? (
          <ContextualNudgeSection
            nudge={contextualNudge}
            location='seo_contextual_nudge'
          />
        ) : ctaText && ctaHref ? (
          <section className='bg-gradient-to-r from-lunary-primary-900/30 to-lunary-highlight-900/30 border border-lunary-primary-700 rounded-lg p-6 sm:p-8 text-center overflow-x-hidden'>
            <Heading as='h2' variant='h3'>
              {ctaText}
            </Heading>
            <SEOCTAButton
              href={ctaHref}
              label='Get Started'
              hub={contextualHub}
            />
          </section>
        ) : null}

        {/* Universal Grimoire Exploration - always shown */}
        <ExploreGrimoire />

        {/* E-A-T Credibility Section */}
        {showEAT && (
          <ArticleFooter
            sources={sources || []}
            datePublished={smartDates.datePublished}
            dateModified={smartDates.dateModified}
          />
        )}
      </div>
    </article>
  );
}
