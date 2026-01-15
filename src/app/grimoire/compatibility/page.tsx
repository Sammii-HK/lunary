import { Metadata } from 'next';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { signDescriptions } from '@/constants/seo/planet-sign-content';
import { CompatibilityMatrix } from '@/components/CompatibilityMatrix';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { Heading } from '@/components/ui/Heading';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

export const metadata: Metadata = {
  title:
    'Zodiac Compatibility: Best & Worst Matches for Every Sign: Love & Relationship Matches - Lunary',
  description:
    'Complete zodiac compatibility guide. Explore love, friendship, and work compatibility between all 12 zodiac signs. 78+ detailed match analyses.',
  keywords: [
    'zodiac compatibility',
    'astrology relationships',
    'synastry chart',
    'love forecast',
  ],
  openGraph: {
    title: 'Zodiac Compatibility: Best & Worst Matches for Every Sign - Lunary',
    description:
      'Explore compatibility between all 12 zodiac signs in love and relationships.',
    url: 'https://lunary.app/grimoire/compatibility',
    images: [
      {
        url: '/api/og/grimoire/compatibility',
        width: 1200,
        height: 630,
        alt: 'Zodiac Compatibility Guide - Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zodiac Compatibility: Best & Worst Matches for Every Sign - Lunary',
    description:
      'Explore compatibility between all 12 zodiac signs in love and relationships.',
    images: ['/api/og/grimoire/compatibility'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/compatibility',
  },
};

export default function CompatibilityIndexPage() {
  const signs = Object.entries(signDescriptions);

  const compatibilityListSchema = createItemListSchema({
    name: 'Zodiac Compatibility: Best & Worst Matches for Every Sign',
    description:
      'Complete zodiac compatibility guide with 78+ detailed match analyses for love, friendship, and work.',
    url: 'https://lunary.app/grimoire/compatibility',
    items: Object.keys(signDescriptions).map((sign) => ({
      name: `${signDescriptions[sign].name} Compatibility`,
      url: `https://lunary.app/grimoire/zodiac/${sign}`,
      description: `${signDescriptions[sign].element} sign compatibility`,
    })),
  });

  const heroContent = (
    <div className='text-center mb-6'>
      <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
        Explore how zodiac signs interact in love, friendship, and work. Select
        two signs to see their compatibility tone, strengths, and growth areas.
      </p>
    </div>
  );

  const sections = (
    <>
      <div className='grid grid-cols-3 gap-4 mb-12 max-w-md'>
        <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
          <div className='text-3xl font-light text-lunary-rose'>12</div>
          <div className='text-sm text-zinc-400'>Signs</div>
        </div>
        <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
          <div className='text-3xl font-light text-lunary-rose'>78</div>
          <div className='text-sm text-zinc-400'>Unique Pairs</div>
        </div>
        <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
          <div className='text-3xl font-light text-lunary-rose'>3</div>
          <div className='text-sm text-zinc-400'>Categories</div>
        </div>
      </div>

      <section id='compatibility-matrix' className='mb-12'>
        <Heading variant='h2' className='mb-6'>
          Compatibility Matrix
        </Heading>
        <p className='text-zinc-400 text-sm mb-6'>
          Hover to highlight row and column. Click any cell to see the full
          compatibility analysis.
        </p>
        <CompatibilityMatrix signs={signs} />
      </section>

      <section id='browse-by-sign' className='space-y-8'>
        <Heading variant='h2'>Browse by Sign</Heading>
        {signs.map(([key1, sign1]) => (
          <section
            key={key1}
            className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'
          >
            <div className='flex items-center gap-3 mb-4'>
              <span className='text-2xl'>{ZODIAC_SYMBOLS[key1] || '⭐'}</span>
              <div>
                <Heading variant='h4'>{sign1.name} Compatibility</Heading>
                <p className='text-sm text-zinc-400'>
                  {sign1.element} • {sign1.modality}
                </p>
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              {signs.map(([key2, sign2]) => {
                const slug =
                  key1 <= key2 ? `${key1}-and-${key2}` : `${key2}-and-${key1}`;
                return (
                  <Link
                    key={key2}
                    href={`/grimoire/compatibility/${slug}`}
                    className='px-3 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-lunary-rose-900 border border-zinc-700/50 hover:border-lunary-rose-600 text-zinc-300 hover:text-lunary-rose-300 text-sm transition-colors'
                  >
                    {sign1.name} & {sign2.name}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </section>

      <section id='compatibility-cta' className='mt-12 space-y-6'>
        <Link
          href='/grimoire/synastry/generate'
          className='block p-6 rounded-lg bg-gradient-to-r from-lunary-rose-900/30 to-lunary-primary-900/30 border border-lunary-rose-700 hover:border-lunary-rose-500 transition-colors group'
        >
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-xl font-medium text-lunary-rose-300 group-hover:text-lunary-rose-200 transition-colors flex items-center gap-2'>
                <Heart className='h-5 w-5' />
                Generate Synastry Chart
              </h3>
              <p className='text-zinc-400 mt-1'>
                Compare two birth charts to discover deep compatibility,
                strengths, and growth areas
              </p>
            </div>
            <span className='text-lunary-rose-400 group-hover:text-lunary-rose-300 transition-colors text-2xl'>
              →
            </span>
          </div>
        </Link>
        <section className='text-center'>
          <Link
            href='/birth-chart'
            className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors'
          >
            View Your Birth Chart
          </Link>
          <p className='mt-3 text-sm text-zinc-400'>
            Understand your complete astrological profile
          </p>
        </section>
      </section>
    </>
  );

  const howToWorkWith = [
    'Compare elemental modalities to feel the tone of the pair.',
    'Use the matrix to spot best loves, friendships, and work alliances.',
    'Run a synastry chart for deep insight when dating or collaborating.',
  ];

  const faqs = [
    {
      question: 'How accurate is zodiac compatibility?',
      answer:
        'Zodiac compatibility highlights energetic potentials based on elements, modes, and planetary rulers. It offers guidance, but personal growth, communication, and free will shape the full story.',
    },
    {
      question: 'What if my signs don’t seem compatible?',
      answer:
        'Challenging signs bring growth opportunities. Use compatibility as a map—balance energy with conscious awareness, respect, and shared intentions.',
    },
    {
      question: 'What is the best way to use the compatibility matrix?',
      answer:
        'Hover over rows and columns to see the tone, then follow the links to detailed match write-ups. Use the matrix as a starting point for conversations or collaborations.',
    },
    {
      question: 'Should I check Rising and Moon sign compatibility too?',
      answer:
        'Yes. Sun sign compatibility is a starting point, but Moon and Rising signs often reveal emotional and day‑to‑day dynamics.',
    },
  ];

  const cosmicSections: CosmicConnectionSection[] = [
    {
      title: 'Compatibility Guides',
      links: [
        { label: 'Zodiac Compatibility', href: '/grimoire/compatibility' },
        { label: 'Synastry Generator', href: '/grimoire/synastry/generate' },
        { label: 'Birth Chart', href: '/birth-chart' },
      ],
    },
    {
      title: 'Astrology Tools',
      links: [
        { label: 'Horoscopes', href: '/grimoire/horoscopes' },
        { label: 'Chakras', href: '/grimoire/chakras' },
        { label: 'Numerology', href: '/grimoire/numerology' },
      ],
    },
  ];

  const tableOfContents = [
    { label: 'Compatibility Matrix', href: '#compatibility-matrix' },
    { label: 'Browse by Sign', href: '#browse-by-sign' },
    { label: 'Synastry & Birth Chart', href: '#compatibility-cta' },
  ];

  return (
    <>
      {renderJsonLd(compatibilityListSchema)}
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Zodiac Compatibility'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/compatibility'
        }
        tableOfContents={tableOfContents}
        whatIs={{
          question: 'What is zodiac compatibility?',
          answer:
            'Zodiac compatibility compares elemental, modality, and planetary interplay to highlight how two signs meet, clash, or balance across love, friendship, and work.',
        }}
        intro='Explore compatibility across all 12 zodiac signs, including matrix overviews, pair-by-pair links, and deeper synastry tools for your chart.'
        heroContent={heroContent}
        tldr='Compatibility shows how two signs blend in love, friendship, and work. Use the matrix as a starting point, then explore synastry for deeper chart‑to‑chart insight.'
        meaning='Compatibility compares elements, modalities, and planetary placements to show how two charts interact. Use the matrix and in-depth match links to guide relationship conversations.

Think of compatibility as potential, not fate. Strong matches still require communication, and challenging matches can be deeply rewarding when both people commit to growth.'
        howToWorkWith={howToWorkWith}
        rituals={[
          'Choose one shared intention and write it together.',
          'Use a two‑card tarot pull: one card for each person’s needs.',
          'Schedule a check‑in on a calm day to align expectations.',
        ]}
        journalPrompts={[
          'What does compatibility mean to me beyond astrology?',
          'Where do our elements naturally support each other?',
          'What growth edge shows up most often in this connection?',
          'How can we communicate more clearly during conflict?',
        ]}
        faqs={faqs}
        tables={[
          {
            title: 'Quick Compatibility Lens',
            headers: ['Factor', 'What It Shows'],
            rows: [
              ['Element', 'Core energy style and needs'],
              ['Modality', 'Pace and change approach'],
              ['Ruler', 'Motivation and values'],
              ['Synastry', 'Chart‑to‑chart dynamics'],
            ],
          },
        ]}
        relatedItems={[
          {
            name: 'Synastry Generator',
            href: '/grimoire/synastry/generate',
            type: 'Tool',
          },
          { name: 'Birth Chart', href: '/birth-chart', type: 'Tool' },
        ]}
        internalLinks={[
          { text: 'Synastry Generator', href: '/grimoire/synastry/generate' },
          { text: 'Birth Chart', href: '/birth-chart' },
          { text: 'Horoscopes', href: '/grimoire/horoscopes' },
        ]}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-zodiac'
            entityKey='zodiac'
            title='Compatibility Connections'
            sections={cosmicSections}
          />
        }
        ctaText='Generate a synastry chart'
        ctaHref='/grimoire/synastry/generate'
      >
        {sections}
      </SEOContentTemplate>
    </>
  );
}
