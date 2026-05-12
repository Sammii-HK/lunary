import { Metadata } from 'next';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { signDescriptions } from '@/constants/seo/planet-sign-content';
import { getCuratedCompatibilitySlugs } from '@/constants/seo/compatibility-content';
import { CompatibilityMatrix } from '@/components/CompatibilityMatrix';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import {
  createItemListSchema,
  renderJsonLd,
  createBreadcrumbSchema,
} from '@/lib/schema';

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

export const metadata: Metadata = {
  title:
    'Zodiac Compatibility: Best & Worst Matches for Every Sign: Love & Relationship Matches - Lunary',
  description:
    'Complete zodiac compatibility guide. Explore love, friendship, and work compatibility between all 12 zodiac signs. 78+ detailed match analyses.',
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

  return (
    <div className='min-h-screen bg-surface-base text-content-primary'>
      {renderJsonLd(compatibilityListSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Compatibility', url: '/grimoire/compatibility' },
        ]),
      )}
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Compatibility' },
          ]}
        />
        <div className='mb-12'>
          <h1 className='text-4xl font-light text-content-primary mb-4'>
            Zodiac Compatibility: Best & Worst Matches for Every Sign
          </h1>
          <p className='text-lg text-content-muted max-w-2xl'>
            Explore how zodiac signs interact in love, friendship, and work.
            Select two signs to see their compatibility analysis.
          </p>
        </div>

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
        <div className='mb-12 overflow-x-auto'>
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
        <div className='space-y-8'>
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

        {/* Birth Chart CTA */}
        <section className='mt-6 text-center'>
          <Link
            href='/birth-chart'
            className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-surface-card/50 hover:bg-surface-card border border-stroke-default text-content-secondary hover:text-content-primary transition-colors'
          >
            View Your Birth Chart
          </Link>
          <p className='mt-3 text-sm text-content-muted'>
            Understand your complete astrological profile
          </p>
        </section>

        <ExploreGrimoire />
      </div>
    </div>
  );
}
