import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import {
  ZODIAC_SIGNS,
  SIGN_DISPLAY,
  SIGN_SYMBOLS,
  getDecanData,
} from '@/constants/seo/decans';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import {
  createItemListSchema,
  renderJsonLd,
  createBreadcrumbSchema,
} from '@/lib/schema';

export const metadata: Metadata = {
  title: "Zodiac Decans: Your Sign's Hidden Layer Revealed | Lunary",
  description:
    'Complete guide to the 36 zodiac decans. Each sign is divided into three 10-degree sections with unique sub-rulers and traits. Find your decan.',
  keywords: [
    'zodiac decans',
    'decan astrology',
    'first decan',
    'second decan',
    'third decan',
    'sub-ruler',
  ],
  openGraph: {
    title: "Zodiac Decans: Your Sign's Hidden Layer Revealed | Lunary",
    description:
      'Complete guide to the 36 zodiac decans. Each sign is divided into three 10-degree sections.',
    url: 'https://lunary.app/grimoire/decans',
    images: [
      {
        url: '/api/og/grimoire/decans',
        width: 1200,
        height: 630,
        alt: 'Zodiac Decans Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Zodiac Decans: Your Sign's Hidden Layer Revealed | Lunary",
    description: 'Complete guide to the 36 zodiac decans.',
    images: ['/api/og/grimoire/decans'],
  },
  alternates: { canonical: 'https://lunary.app/grimoire/decans' },
};

export default function DecansIndexPage() {
  const decansListSchema = createItemListSchema({
    name: 'Zodiac Decans',
    description:
      'Complete guide to the 36 zodiac decans. Each sign is divided into three 10-degree sections.',
    url: 'https://lunary.app/grimoire/decans',
    items: ZODIAC_SIGNS.map((sign) => ({
      name: `${SIGN_DISPLAY[sign]} Decans`,
      url: `https://lunary.app/grimoire/decans/${sign}/1`,
      description: `The three decans of ${SIGN_DISPLAY[sign]}`,
    })),
  });

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(decansListSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Decans', url: '/grimoire/decans' },
        ]),
      )}
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Decans' },
          ]}
        />

        <h1 className='text-4xl font-light mb-4'>Zodiac Decans</h1>
        <p className='text-lg text-zinc-400 mb-8 max-w-3xl'>
          Each zodiac sign is divided into three 10-degree sections called
          decans. Each decan has a sub-ruler that adds unique qualities to your
          Sun sign placement.
        </p>

        <div className='space-y-8'>
          {ZODIAC_SIGNS.map((sign) => {
            const signName = SIGN_DISPLAY[sign];
            const symbol = SIGN_SYMBOLS[sign];
            return (
              <div
                key={sign}
                className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
              >
                <div className='flex items-center gap-3 mb-4'>
                  <span className='text-3xl'>{symbol}</span>
                  <h2 className='text-xl font-medium'>{signName} Decans</h2>
                </div>
                <div className='grid md:grid-cols-3 gap-4'>
                  {[1, 2, 3].map((d) => {
                    const decan = d as 1 | 2 | 3;
                    const data = getDecanData(sign, decan);
                    return (
                      <Link
                        key={d}
                        href={`/grimoire/decans/${sign}/${d}`}
                        className='p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors group'
                      >
                        <div className='text-sm text-lunary-primary-400 mb-1'>
                          {d === 1 ? 'First' : d === 2 ? 'Second' : 'Third'}{' '}
                          Decan
                        </div>
                        <div className='font-medium group-hover:text-lunary-primary-300 transition-colors'>
                          {data.dateRange}
                        </div>
                        <div className='text-sm text-zinc-400'>
                          Sub-ruler: {data.subruler}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
