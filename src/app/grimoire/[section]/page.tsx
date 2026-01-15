export const revalidate = 86400;

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { grimoire } from '@/constants/grimoire';
import {
  slugToSection,
  isValidGrimoireSection,
  getAllGrimoireSectionSlugs,
} from '@/utils/grimoire';
import GrimoireLayout from '../GrimoireLayout';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';

const SECTION_KEYWORDS: Record<string, string[]> = {
  moon: [
    'moon phases',
    'lunar cycles',
    'lunar calendar',
    'full moon',
    'new moon',
    'moon magic',
    'lunar wisdom',
    'moon rituals',
    'moon signs',
    'void of course moon',
    'lunar eclipse',
  ],
  'wheel-of-the-year': [
    'wheel of the year',
    'sabbats',
    'pagan holidays',
    'seasonal celebrations',
    'imbolc',
    'beltane',
    'samhain',
    'yule',
    'witchcraft holidays',
    'pagan calendar',
  ],
  astronomy: [
    'astronomy',
    'astrology',
    'planets',
    'zodiac signs',
    'astronomical knowledge',
    'astronomical data',
    'cosmic forces',
    'planetary influences',
    'astrological signs',
    'celestial bodies',
    'astronomical calculations',
  ],
  tarot: [
    'tarot cards',
    'tarot reading',
    'major arcana',
    'minor arcana',
    'tarot spreads',
    'tarot interpretation',
    'divination',
    'tarot guide',
  ],
  runes: [
    'runes',
    'runic alphabet',
    'elder futhark',
    'rune meanings',
    'runic divination',
    'norse runes',
    'rune magic',
  ],
  chakras: [
    'chakras',
    'energy centers',
    'chakra balancing',
    'chakra healing',
    'spiritual energy',
    'seven chakras',
    'chakra colors',
    'chakra meditation',
  ],
  numerology: [
    'numerology',
    'life path number',
    'master numbers',
    'numerological calculations',
    'number meanings',
    'planetary days',
  ],
  crystals: [
    'crystals',
    'crystal healing',
    'crystal meanings',
    'crystal properties',
    'crystal magic',
    'gemstones',
    'crystal guide',
  ],
  correspondences: [
    'magical correspondences',
    'elemental correspondences',
    'astrological correspondences',
    'elements',
    'colors',
    'herbs',
    'planetary days',
    'deities',
    'magical associations',
  ],
  practices: [
    'spells',
    'rituals',
    'witchcraft',
    'witchcraft practices',
    'magic practices',
    'magical practices',
    'spellcraft',
    'protection spells',
    'protection magic',
    'love magic',
    'prosperity spells',
  ],
  'birth-chart': [
    'birth chart',
    'astrology chart',
    'natal chart',
    'astrological chart',
    'birth chart reading',
    'planets',
    'houses',
    'aspects',
    'astrological interpretation',
  ],
  'candle-magic': [
    'candle magic',
    'candle spells',
    'candle colors',
    'candle rituals',
    'candle carving',
    'candle anointing',
  ],
  divination: [
    'divination',
    'pendulum',
    'pendulum reading',
    'scrying',
    'dream interpretation',
    'omen reading',
    'psychic abilities',
  ],
  'modern-witchcraft': [
    'modern witchcraft',
    'witchcraft',
    'witch types',
    'witchcraft tools',
    'witchcraft ethics',
    'book of shadows',
    'coven',
    'solitary witch',
  ],
  meditation: [
    'meditation',
    'mindfulness',
    'breathwork',
    'grounding',
    'grounding exercises',
    'centering',
    'spiritual practice',
    'spiritual meditation',
    'meditation techniques',
  ],
};

const sectionDescriptions: Record<string, string> = {
  moon: "Explore moon phases, full moon names, and lunar wisdom. Learn about the moon's influence on magic and daily life.",
  'wheel-of-the-year':
    'Discover the Wheel of the Year, Sabbats, and seasonal celebrations. Connect with ancient traditions and cosmic cycles.',
  astronomy:
    'Learn about planets, zodiac signs, and astronomical knowledge. Understand the cosmic forces that shape our world.',
  tarot:
    'Comprehensive tarot guide with Major and Minor Arcana, spreads, and interpretations. Master the art of tarot reading.',
  runes:
    'Explore ancient runic alphabets and their meanings. Learn runic divination and magical practices.',
  chakras:
    'Understanding the seven chakras, their colors, meanings, and balancing practices. Align your energy centers.',
  numerology:
    'Discover core numbers, master numbers, planetary days, and numerological calculations. Understand the power of numbers.',
  crystals:
    'Comprehensive crystal guide with daily selections, categories, and how to work with crystals for healing and magic.',
  correspondences:
    'Magical correspondences including elements, colors, days, deities, flowers, numbers, wood, herbs, and animals.',
  practices:
    'Spells, rituals, protection, love magic, prosperity, healing, cleansing, divination, manifestation, and banishing practices.',
  'birth-chart':
    'Learn about planets, houses, and astrological components. Understand how birth charts are calculated and interpreted.',
  'candle-magic':
    'Complete guide to candle magic: color meanings, carving techniques, anointing with oils, lighting candles on altar, incantations by color, safety practices, and candle rituals.',
  divination:
    'Explore divination methods beyond tarot: pendulum reading, scrying, dream interpretation, and reading omens from nature.',
  'modern-witchcraft':
    'Discover different paths of modern witchcraft, essential tools, ethics, coven vs solitary practice, and creating your Book of Shadows.',
  meditation:
    'Meditation and mindfulness practices for spiritual growth: techniques, breathwork, grounding exercises, centering, and magical journaling.',
  'compatibility-chart':
    'Interactive compatibility chart for zodiac signs, elements, moon phases, and crystal categories. Discover how different energies interact and complement each other.',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section: sectionSlug } = await params;
  const section = slugToSection(sectionSlug);
  const sectionData = grimoire[section];

  if (!sectionData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${sectionData.title} - Lunary Grimoire`;
  const description =
    sectionDescriptions[sectionSlug] ||
    `Explore ${sectionData.title} in the Lunary Grimoire. Comprehensive mystical knowledge and cosmic wisdom.`;

  const keywords = [
    ...(SECTION_KEYWORDS[sectionSlug] || []),
    'grimoire',
    'mystical knowledge',
    'cosmic wisdom',
    'astrology guide',
    'spiritual guide',
  ];

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Lunary' }],
    creator: 'Lunary',
    publisher: 'Lunary',
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/${sectionSlug}`,
      siteName: 'Lunary',
      images: [
        {
          url: `/api/og/grimoire/${sectionSlug}`,
          width: 1200,
          height: 630,
          alt: `${sectionData.title} - Lunary Grimoire`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og/grimoire/${sectionSlug}`],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/${sectionSlug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export async function generateStaticParams() {
  return getAllGrimoireSectionSlugs().map((slug) => ({
    section: slug,
  }));
}

export default async function GrimoireSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isValidGrimoireSection(section)) {
    notFound();
  }

  const sectionData = grimoire[slugToSection(section)];

  const templateKeywords = sectionData?.contents ??
    SECTION_KEYWORDS[section as keyof typeof SECTION_KEYWORDS] ?? ['grimoire'];

  const sectionTitle = sectionData?.title || section;
  const seoIntro =
    sectionDescriptions[section] ||
    sectionData?.contents?.[0] ||
    `Delve into ${sectionTitle} within the Lunary Grimoire.`;
  const sectionSummary =
    sectionDescriptions[section] ||
    `${sectionTitle} collects deep dives, rituals, and correspondences so you can study this branch of the grimoire in one sitting.`;
  const internalLinksForSection = [
    { text: 'Grimoire Home', href: '/grimoire' },
    { text: 'Search the Library', href: '/grimoire/search' },
    { text: 'A–Z Index', href: '/grimoire/a-z' },
    { text: sectionTitle, href: `/grimoire/${section}` },
  ];
  const sectionContents = sectionData?.contents ?? [];
  const featuredEntries = sectionContents.slice(0, 6);
  const tableOfContentsData = [
    { label: `${sectionTitle} overview`, href: '#section-overview' },
    ...(featuredEntries.length > 0
      ? [{ label: 'Featured topics', href: '#section-topics' }]
      : []),
    {
      label: 'Research workflow',
      href: '#section-navigation',
    },
  ];
  const howToWorkWithList = [
    `Bookmark ${sectionTitle} alongside the matching search query so you can hop between sidebar and search results.`,
    `Review the “featured topics” list before diving in—each item represents a pillar article that keeps your study structured.`,
    `Take notes in your Book of Shadows when you discover correspondences, then loop back to the index to link related spells or guides.`,
  ];
  const faqsForSection = [
    {
      question: `What lives inside ${sectionTitle}?`,
      answer: `${sectionTitle} bundles every Lunary guide, ritual, and glossary entry tied to this theme. Use it whenever you want a bird’s-eye view or need to share a clean URL with friends or clients.`,
    },
    {
      question: 'How do I navigate long sections?',
      answer:
        'Start with the featured list, then jump into the sidebar for granular topics. If a section contains dozens of entries (like zodiac signs), use the site search with the letter shortcut “/” on desktop.',
    },
    {
      question: 'Can I contribute feedback?',
      answer:
        'Absolutely. Each page has a feedback link at the bottom—let us know what summaries, correspondences, or ritual examples you want expanded.',
    },
  ];
  const cosmicSections = [
    {
      title: `Navigate ${sectionTitle}`,
      links: [
        { label: 'Grimoire A–Z', href: '/grimoire/a-z' },
        { label: 'Search the Library', href: '/grimoire/search' },
        { label: 'Explore Sections', href: '/grimoire/page' },
      ],
    },
    {
      title: 'Keep Studying',
      links: [
        { label: 'Book of Shadows', href: '/book-of-shadows' },
        { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
        { label: 'Spell Fundamentals', href: '/grimoire/spells/fundamentals' },
      ],
    },
  ];

  return (
    <>
      <SEOContentTemplate
        title={`${sectionTitle} - Lunary Grimoire`}
        h1={sectionTitle || 'Grimoire Section'}
        description={sectionSummary}
        keywords={templateKeywords ?? []}
        canonicalUrl={`https://lunary.app/grimoire/${section}`}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: sectionTitle },
        ]}
        intro={seoIntro}
        meaning={sectionSummary}
        whatIs={{
          question: `What is ${sectionTitle || section}?`,
          answer: sectionSummary,
        }}
        howToWorkWith={howToWorkWithList}
        tableOfContents={tableOfContentsData}
        faqs={faqsForSection}
        internalLinks={internalLinksForSection}
        ctaText='See the rest of the Grimoire'
        ctaHref='/grimoire'
        cosmicConnections={
          <CosmicConnections
            entityType='hub-guides'
            entityKey={section}
            title='Section Connections'
            sections={cosmicSections}
          />
        }
      >
        <section id='section-overview' className='mb-10 space-y-4'>
          <h2 className='text-3xl font-light text-zinc-100'>
            {sectionTitle} Overview
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            {sectionSummary} Each entry links to a full-length article, ritual,
            or reference sheet so you can navigate the entire Lunary library
            without leaving this hub.
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            Skim the summaries below, then use the sidebar to travel directly to
            a subtopic. Treat this page like the front door to your Book of
            Shadows—organized, cross-referenced, and easy to annotate.
          </p>
        </section>

        {featuredEntries.length > 0 && (
          <section id='section-topics' className='mb-10 space-y-4'>
            <h2 className='text-3xl font-light text-zinc-100'>
              Featured Topics
            </h2>
            <div className='space-y-3'>
              {featuredEntries.map((entry) => (
                <div
                  key={entry}
                  className='rounded-lg border border-zinc-800 bg-zinc-900/40 p-4'
                >
                  <h3 className='text-lg font-semibold text-zinc-100'>
                    {entry}
                  </h3>
                  <p className='text-sm text-zinc-300'>
                    {entry} serves as a pillar article inside {sectionTitle},
                    guiding you through practice tips, correspondences, and
                    practical rituals that reinforce the rest of the section.
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id='section-navigation' className='mb-10 space-y-4'>
          <h2 className='text-3xl font-light text-zinc-100'>
            Build Your Research Workflow
          </h2>
          <ul className='space-y-2 text-zinc-300 leading-relaxed'>
            <li>
              <strong className='text-zinc-100'>Start broad:</strong> read the
              overview, then open the sidebar to trace the learning path Lunary
              recommends for this topic.
            </li>
            <li>
              <strong className='text-zinc-100'>Cross-reference:</strong> log
              any spells, crystals, or tarot archetypes that relate to this
              section so you can circle back later.
            </li>
            <li>
              <strong className='text-zinc-100'>Update monthly:</strong> treat
              this page as a dashboard—when new lessons drop, add bookmarks and
              highlight what changed.
            </li>
          </ul>
        </section>

        <GrimoireLayout currentSectionSlug={section} />
      </SEOContentTemplate>
    </>
  );
}
