import { Metadata } from 'next';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { signDescriptions } from '@/constants/seo/planet-sign-content';
import { getCuratedCompatibilitySlugs } from '@/constants/seo/compatibility-content';
import { CompatibilityMatrix } from '@/components/CompatibilityMatrix';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

// 30-day ISR revalidation
export const revalidate = 2592000;
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

const tldr: string =
  'Zodiac compatibility compares how two signs relate by element, modality, polarity, and chart dynamics. Sun signs are a useful starting point, while synastry gives the deeper full-chart view.';

export const metadata: Metadata = {
  title:
    'Zodiac Compatibility: Best & Worst Matches for Every Sign: Love & Relationship Matches - Lunary',
  description:
    'Selective zodiac compatibility guide. Explore curated love, friendship, and work match reads, then go deeper with synastry and full-chart comparison.',
  openGraph: {
    title: 'Zodiac Compatibility: Best & Worst Matches for Every Sign - Lunary',
    description:
      'Explore curated zodiac compatibility reads, then go deeper with synastry and full-chart comparison.',
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
      'Explore curated zodiac compatibility reads, then go deeper with synastry and full-chart comparison.',
    images: ['/api/og/grimoire/compatibility'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/compatibility',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CompatibilityIndexPage() {
  const signs = Object.entries(signDescriptions);
  const curatedSlugs = getCuratedCompatibilitySlugs();
  const curatedPairs = curatedSlugs
    .map((slug) => {
      const [sign1, sign2] = slug.split('-and-');
      const left = signDescriptions[sign1];
      const right = signDescriptions[sign2];
      if (!left || !right) return null;
      return {
        slug,
        sign1,
        sign2,
        sign1Name: left.name,
        sign2Name: right.name,
      };
    })
    .filter(Boolean) as Array<{
    slug: string;
    sign1: string;
    sign2: string;
    sign1Name: string;
    sign2Name: string;
  }>;

  const compatibilityListSchema = createItemListSchema({
    name: 'Zodiac Compatibility: Best & Worst Matches for Every Sign',
    description:
      'Selective zodiac compatibility guide with stronger curated match analyses plus links into synastry and sign interpretation.',
    url: 'https://lunary.app/grimoire/compatibility',
    items: curatedPairs.map((pair) => ({
      name: `${pair.sign1Name} and ${pair.sign2Name} Compatibility`,
      url: `https://lunary.app/grimoire/compatibility/${pair.slug}`,
      description: `${pair.sign1Name} and ${pair.sign2Name} zodiac compatibility`,
    })),
  });

  const faqs = [
    {
      question: 'What is zodiac compatibility?',
      answer:
        'Zodiac compatibility describes how two signs relate based on element, modality, polarity, and planetary rulership. It is a starting point for understanding relationship dynamics, not a verdict. Full synastry compares complete birth charts for a deeper read.',
    },
    {
      question: 'Which zodiac signs are most compatible?',
      answer:
        'Signs of the same element (Fire and Fire, Earth and Earth, Air and Air, Water and Water) share a natural temperament and often feel easy together. Complementary elements, Fire with Air and Earth with Water, bring balance. Compatibility is always more accurate with a full synastry chart than with Sun signs alone.',
    },
    {
      question:
        'What is the difference between Sun sign compatibility and synastry?',
      answer:
        'Sun sign compatibility compares one planet in each chart. Synastry overlays every placement, Sun, Moon, Venus, Mars, and all others, to show the full relational picture. Sun sign reads are useful as a starting point; synastry is where meaningful compatibility analysis lives.',
    },
    {
      question: 'Can incompatible signs have a good relationship?',
      answer:
        'Yes. Challenging Sun sign combinations are often softened by harmonious Moon, Venus, or Mars aspects in a synastry chart. Low Sun sign scores do not predict relationship failure; they flag areas that need more awareness and communication.',
    },
  ];

  return (
    <>
      {renderJsonLd(compatibilityListSchema)}
      <SEOContentTemplate
        title='Zodiac Compatibility: Best & Worst Matches for Every Sign'
        h1='Zodiac Compatibility'
        description='Selective zodiac compatibility guide. Explore curated love, friendship, and work match reads, then go deeper with synastry and full-chart comparison.'
        keywords={[
          'zodiac compatibility',
          'astrology compatibility',
          'zodiac love matches',
          'compatible zodiac signs',
          'synastry',
        ]}
        canonicalUrl='https://lunary.app/grimoire/compatibility'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Compatibility' },
        ]}
        whatIs={{
          question: 'What is zodiac compatibility?',
          answer:
            'Zodiac compatibility describes how two signs relate based on element, modality, polarity, and planetary rulership. It is a useful starting point for understanding relationship dynamics, but full synastry, comparing complete birth charts, gives a far deeper and more accurate picture.',
        }}
        tldr={tldr}
        intro='Explore how zodiac signs interact in love, friendship, and work. Select two signs to see their compatibility analysis. Sun signs are a useful starting point, while synastry and full chart comparison reveal the real picture.'
        meaning={`Compatibility in astrology is not a binary pass or fail. Element affinity (Fire with Air, Earth with Water) creates natural ease. Complementary modalities (Cardinal with Mutable, Fixed with Fixed) shape how two people approach goals and change together. Polarity, each sign paired with its opposite, adds tension that can be creative or draining depending on the rest of the chart.\n\nSun sign reads capture one layer. The Moon describes emotional needs. Venus and Mars describe how each person loves and pursues. When these four points align across two charts, the connection typically feels effortless. When they clash, effort and awareness matter more than raw sign labels.`}
        howToWorkWith={[
          'Start with Sun sign as a style overview, not a verdict.',
          'Check Moon signs next. Emotional compatibility shapes day-to-day life more than Sun.',
          'Venus and Mars aspects in synastry reveal attraction, affection style, and drive.',
          'Use a full synastry chart before drawing conclusions about long-term compatibility.',
        ]}
        faqs={faqs}
        tableOfContents={[
          { label: 'What compatibility means', href: '#what-is' },
          { label: 'How to read it', href: '#meaning' },
          { label: 'Compatibility matrix', href: '#matrix' },
          { label: 'Curated pair reads', href: '#curated-pairs' },
          { label: 'FAQ', href: '#faq' },
        ]}
        internalLinks={[
          { text: 'Synastry Calculator', href: '/grimoire/synastry/generate' },
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Birth Chart Guide', href: '/grimoire/birth-chart' },
          { text: 'Placements', href: '/grimoire/placements' },
        ]}
        sources={[
          {
            name: 'Lunary compatibility interpretation framework',
            url: 'https://lunary.app/about/methodology',
          },
          {
            name: 'Traditional Western astrology elemental and modal doctrine',
          },
        ]}
        ctaText='Generate your synastry chart'
        ctaHref='/grimoire/synastry/generate'
        childrenPosition='before-faqs'
      >
        {/* Stats */}
        <div className='grid grid-cols-3 gap-4 mb-12 max-w-md'>
          <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50 text-center'>
            <div className='text-3xl font-light text-lunary-rose'>12</div>
            <div className='text-sm text-content-muted'>Signs</div>
          </div>
          <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50 text-center'>
            <div className='text-3xl font-light text-lunary-rose'>
              {curatedPairs.length}
            </div>
            <div className='text-sm text-content-muted'>Curated Pairs</div>
          </div>
          <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50 text-center'>
            <div className='text-3xl font-light text-lunary-rose'>3</div>
            <div className='text-sm text-content-muted'>Categories</div>
          </div>
        </div>

        {/* Compatibility Matrix */}
        <div id='matrix' className='mb-12 overflow-x-auto'>
          <h2 className='text-2xl font-medium text-content-primary mb-6'>
            Compatibility Matrix
          </h2>
          <p className='text-content-muted text-sm mb-6'>
            Hover to highlight row and column. Click any cell to see the full
            compatibility analysis.
          </p>
          <CompatibilityMatrix signs={signs} />
          <p className='text-content-muted text-sm mt-4'>
            Sun-sign compatibility is only a starting point. For real chart
            mechanics, use synastry and compare full placements.
          </p>
        </div>

        {/* Curated pairs */}
        <div id='curated-pairs' className='space-y-8'>
          <h2 className='text-2xl font-medium text-content-primary'>
            Curated Compatibility Reads
          </h2>
          {signs.map(([key1, sign1]) => {
            const matchingPairs = curatedPairs.filter(
              (pair) => pair.sign1 === key1 || pair.sign2 === key1,
            );

            if (matchingPairs.length === 0) {
              return null;
            }

            return (
              <section
                key={key1}
                className='p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/30'
              >
                <div className='flex items-center gap-3 mb-4'>
                  <span className='text-2xl'>
                    {ZODIAC_SYMBOLS[key1] || '⭐'}
                  </span>
                  <div>
                    <h3 className='text-xl font-medium text-content-primary'>
                      {sign1.name} Compatibility
                    </h3>
                    <p className='text-sm text-content-muted'>
                      {sign1.element} • {sign1.modality}
                    </p>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {matchingPairs.map((pair) => {
                    const otherSign =
                      pair.sign1 === key1 ? pair.sign2Name : pair.sign1Name;
                    return (
                      <Link
                        key={pair.slug}
                        href={`/grimoire/compatibility/${pair.slug}`}
                        className='px-3 py-1.5 rounded-lg bg-surface-card/50 hover:bg-layer-base border border-stroke-default/50 hover:border-lunary-rose-600 text-content-secondary hover:text-lunary-rose-300 text-sm transition-colors'
                      >
                        {sign1.name} & {otherSign}
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Synastry CTA */}
        <section className='mt-12'>
          <Link
            href='/grimoire/synastry/generate'
            className='block p-6 rounded-lg bg-gradient-to-r from-lunary-rose-900/30 to-layer-base/30 border border-lunary-rose-700 hover:border-lunary-rose-500 transition-colors group'
          >
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-xl font-medium text-lunary-rose-300 group-hover:text-lunary-rose-200 transition-colors flex items-center gap-2'>
                  <Heart className='h-5 w-5' />
                  Generate Synastry Chart
                </h3>
                <p className='text-content-muted mt-1'>
                  Compare two birth charts to discover deep compatibility,
                  strengths, and growth areas
                </p>
              </div>
              <span className='text-lunary-rose-400 group-hover:text-lunary-rose-300 transition-colors text-2xl'>
                →
              </span>
            </div>
          </Link>
        </section>
      </SEOContentTemplate>
    </>
  );
}
