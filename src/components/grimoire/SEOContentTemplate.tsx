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
import { GrimoireStats } from './GrimoireStats';
import { Heading } from '../ui/Heading';
import { ArticleFooter } from './ArticleFooter';
import { PeopleAlsoAsk } from './PeopleAlsoAsk';
import { ContextualNudgeSection } from '../ui/ContextualNudgeSection';
import { InlineContextualNudge } from './InlineContextualNudge';
import { ReadFullGuidePrompt } from '@/app/grimoire/guides/ReadFullGuidePrompt';
import {
  assignVariantServer,
  getInlineCtaVariant,
} from '@/lib/ab-tests-static';
import { GrimoireSearch } from '@/app/grimoire/GrimoireSearch';
import { StickyBottomCTA } from './StickyBottomCTA';
import { MidArticleEmailCapture } from './MidArticleEmailCapture';
import { ChartPreviewTeaser } from './ChartPreviewTeaser';
import { SignTransitTeaser } from './SignTransitTeaser';
import { NewsletterSignupForm } from '@/components/NewsletterSignupForm';
// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// import AudioNarrator from '@/components/audio/AudioNarrator';
import { AutoLinkText } from '@/components/glossary/AutoLinkText';

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

  // Sign for transit teaser (shows live transits affecting this sign)
  transitSign?: string;
  transitSignDisplay?: string;
}

const HOROSCOPE_EMAIL_CAPTURE_TEST = 'horoscope_email_capture_proposition_v1';
const HOROSCOPE_EMAIL_UPSELL_TEST = 'horoscope_email_signup_upsell_v1';

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
  transitSign,
  transitSignDisplay,
}: SEOContentTemplateProps) {
  // Keep SEO pages statically renderable: do not read request cookies here.
  // Public grimoire pages should not depend on per-request anon ids, otherwise
  // Next marks them dynamic/private and Google receives uncachable HTML.
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
      ? 'bg-gradient-to-r from-layer-base to-lunary-highlight-900 border border-transparent text-content-primary'
      : 'bg-surface-elevated/40 border border-stroke-subtle text-content-primary';
  const shouldShowContextualNudge = !disableContextualNudge;
  const stableSeoSeed = canonicalPathname;
  const contextualNudge = shouldShowContextualNudge
    ? getContextualNudge(canonicalPathname, stableSeoSeed)
    : null;
  const hasContextualNudge =
    Boolean(contextualNudge?.headline) && Boolean(contextualNudge?.buttonLabel);
  // Extract the variant index from ctaVariant (e.g. "horoscopes_1" -> 1) so sticky bar avoids it
  const inlineVariantIndex = contextualNudge?.ctaVariant
    ? parseInt(contextualNudge.ctaVariant.split('_').pop() || '0', 10)
    : undefined;
  const horoscopeEmailCaptureVariant =
    contextualHub === 'horoscopes'
      ? assignVariantServer(HOROSCOPE_EMAIL_CAPTURE_TEST, stableSeoSeed, [
          'cosmic_newsletter',
          'daily_horoscope',
        ] as const)
      : undefined;
  const horoscopeEmailUpsellVariant =
    contextualHub === 'horoscopes'
      ? assignVariantServer(HOROSCOPE_EMAIL_UPSELL_TEST, stableSeoSeed, [
          'full_chart',
          'exact_degree',
          'exact_timing',
        ] as const)
      : undefined;

  return (
    <article className='max-w-4xl mx-auto px-4 pb-[120px]'>
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

      {/* Sticky Breadcrumbs with Search - sticks after title scrolls off */}

      <div
        style={{
          position: 'sticky',
          top: 0,
        }}
        className='z-40 bg-surface-base border-b border-stroke-subtle/50 -mx-4 px-4 py-2 mb-6'
      >
        <div className='flex items-center justify-between gap-4 [&>nav]:mb-0'>
          {autoBreadcrumbs.length > 0 && (
            <Breadcrumbs items={autoBreadcrumbs} renderSchema={false} />
          )}
          <GrimoireSearch compact placeholder='Search grimoire...' />
        </div>
      </div>

      {/* H1 - above sticky breadcrumbs so they stick after title scrolls off */}
      <header className='pt-2 md:pt-4 mb-2 md:mb-3'>
        <Heading as='h1' variant='h1'>
          {h1 || title}
        </Heading>
        {subtitle && (
          <span className='block text-lg text-lunary-primary-400 mt-2 mb-4'>
            {subtitle}
          </span>
        )}
        {description && (
          <AutoLinkText
            as='p'
            className='text-content-muted leading-relaxed break-words mt-4'
          >
            {description}
          </AutoLinkText>
        )}
        {/* AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting. */}
        {/* {(() => {
          const narrationParts = [
            h1 || title,
            description,
            tldr,
            whatIs?.answer,
            intro,
            symbolism,
            numerology,
            astrologyCorrespondences,
          ].filter((p): p is string => Boolean(p && p.trim()));
          if (narrationParts.length < 2) return null;
          return (
            <div className='mt-4'>
              <AudioNarrator
                text={narrationParts.join('\n\n')}
                title={h1 || title}
                compactVariant='inline'
              />
            </div>
          );
        })()} */}
      </header>

      <div className='space-y-8 p-2 md:p-4'>
        {heroContent && <div className='mb-8'>{heroContent}</div>}

        {/* Table of Contents */}
        {tableOfContents && tableOfContents.length > 0 && (
          <nav className='bg-surface-elevated/50 border border-stroke-subtle rounded-xl p-4 sm:p-6 mb-12'>
            <Heading as='h2' variant='h2'>
              Table of Contents
            </Heading>
            <ol className='space-y-2 text-content-muted'>
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
          <div className='tldr bg-layer-base/20 border border-lunary-primary-700 rounded-lg p-4 sm:p-6 my-6 mb-8 w-full overflow-x-hidden'>
            <Heading
              as='h2'
              variant='h2'
              className='text-content-brand-accent mb-3'
            >
              Quick Meaning
            </Heading>
            <AutoLinkText
              as='p'
              className='text-content-primary leading-relaxed break-words'
            >
              {tldr}
            </AutoLinkText>
          </div>
        )}

        {/* What is X? - Featured Snippet Optimization */}
        {whatIs && (
          <section id='what-is' className='mb-8'>
            <Heading as='h2' variant='h2'>
              {whatIs.question}
            </Heading>
            <AutoLinkText
              as='p'
              className='what-is-answer text-content-secondary leading-relaxed break-words'
            >
              {whatIs.answer}
            </AutoLinkText>
          </section>
        )}

        {/* Intro */}
        {intro && (
          <section className='prose prose-invert max-w-none overflow-x-hidden'>
            <AutoLinkText
              as='p'
              className='text-content-secondary leading-relaxed break-words'
            >
              {intro}
            </AutoLinkText>
          </section>
        )}

        {/* Sign Transit Teaser - shows live transits + birthday input for this sign */}
        {transitSign && transitSignDisplay && (
          <SignTransitTeaser
            sign={transitSign}
            signDisplay={transitSignDisplay}
          />
        )}

        {/* Chart Preview Teaser - only on non-horoscope pages (transit teaser handles it) */}
        {!transitSign && <ChartPreviewTeaser hub={contextualHub} />}

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
                  className='flex items-start gap-3 text-content-secondary break-words'
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
                  className='bg-surface-elevated/50 border border-stroke-subtle/50 rounded-lg p-4 w-full overflow-x-hidden'
                >
                  <AutoLinkText
                    as='p'
                    className='text-content-secondary leading-relaxed break-words'
                  >
                    {item}
                  </AutoLinkText>
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
                  className='px-3 sm:px-4 py-2 bg-surface-card/50 border border-stroke-default rounded-lg text-content-secondary hover:bg-surface-overlay hover:text-content-brand-accent transition-colors whitespace-nowrap'
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
                <span key={index} className='text-content-secondary font-astro'>
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
              <AutoLinkText
                as='p'
                className='text-content-secondary leading-relaxed whitespace-pre-line break-words'
              >
                {symbolism}
              </AutoLinkText>
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
              <AutoLinkText
                as='p'
                className='text-content-secondary leading-relaxed whitespace-pre-line break-words'
              >
                {numerology}
              </AutoLinkText>
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
              <AutoLinkText
                as='p'
                className='text-content-secondary leading-relaxed whitespace-pre-line break-words'
              >
                {astrologyCorrespondences}
              </AutoLinkText>
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
                <table className='w-full border-collapse border border-stroke-default'>
                  <thead>
                    <tr className='bg-surface-card/50'>
                      {table.headers.map((header, headerIndex) => (
                        <th
                          key={headerIndex}
                          className='border border-stroke-default px-2 sm:px-4 py-2 sm:py-3 text-left text-content-primary font-medium  break-words whitespace-nowrap'
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
                        className='border-b border-stroke-default hover:bg-surface-card/30'
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className='border border-stroke-default px-2 sm:px-4 py-2 sm:py-3 text-content-secondary  break-words'
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
                  className='bg-surface-elevated/50 border border-stroke-subtle/50 rounded-lg p-4 w-full overflow-x-hidden'
                >
                  <AutoLinkText
                    as='p'
                    className='text-content-secondary leading-relaxed break-words'
                  >
                    {placement}
                  </AutoLinkText>
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
                  className='bg-surface-elevated/50 border border-stroke-subtle/50 rounded-lg p-4 sm:p-6 w-full overflow-x-hidden'
                >
                  <div className='prose prose-invert max-w-none break-words'>
                    <AutoLinkText
                      as='p'
                      className='text-content-secondary leading-relaxed whitespace-pre-line break-words'
                    >
                      {ritual}
                    </AutoLinkText>
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
                  className='bg-layer-deep border border-lunary-primary-800 rounded-lg p-4 w-full overflow-x-hidden'
                >
                  <p className='text-content-secondary leading-relaxed italic break-words'>
                    "{prompt}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Inline Contextual Nudge - scroll-triggered at 50% for mid-article conversion */}
        {hasContextualNudge && contextualNudge && (
          <InlineContextualNudge
            nudge={contextualNudge}
            location='seo_inline_mid_article'
            serverVariant={inlineCtaVariant}
            scrollTriggered
          />
        )}

        {/* Email capture for horoscope readers - personalised daily horoscope offer */}
        {contextualHub === 'horoscopes' && (
          <MidArticleEmailCapture
            topic="today's horoscope"
            hub={contextualHub}
            propositionVariant={horoscopeEmailCaptureVariant}
            upsellVariant={horoscopeEmailUpsellVariant}
          />
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
                  className='px-3 sm:px-4 py-2 bg-surface-card/80 border border-lunary-primary-400 rounded-lg text-content-secondary hover:bg-surface-overlay hover:text-content-brand-accent transition-colors  break-words'
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

        {/* Newsletter signup - low friction capture for readers who enjoyed the article */}
        <NewsletterSignupForm
          compact
          source={`grimoire_${contextualHub}`}
          headline={
            contextualHub === 'horoscopes'
              ? 'Get your daily horoscope by email'
              : 'Get weekly cosmic updates'
          }
          description={
            contextualHub === 'horoscopes'
              ? 'Personalised to your sign. Free daily readings, transit alerts, and guidance in your inbox every morning.'
              : 'Free forecasts, transit alerts, and guides delivered every Friday.'
          }
          ctaLabel={
            contextualHub === 'horoscopes'
              ? 'Send me my horoscope'
              : 'Subscribe'
          }
          align='left'
        />

        {/* Full CTA or contextual nudge - positioned after FAQs for committed readers */}
        {hasContextualNudge && contextualNudge ? (
          <ContextualNudgeSection
            nudge={contextualNudge}
            location='seo_contextual_nudge'
          />
        ) : ctaText && ctaHref ? (
          <section className='bg-gradient-to-r from-layer-base/30 to-lunary-highlight-900/30 border border-lunary-primary-700 rounded-lg p-6 sm:p-8 text-center overflow-x-hidden'>
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

        {/* Social proof stats */}
        <GrimoireStats pagePath={canonicalPathname} />

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

      {/* Sticky bottom CTA bar - uses a different copy variant from the inline CTA */}
      {hasContextualNudge && contextualNudge && (
        <StickyBottomCTA
          nudge={getContextualNudge(
            canonicalPathname,
            stableSeoSeed,
            inlineVariantIndex,
          )}
        />
      )}
    </article>
  );
}
