import { Metadata } from 'next';
import Link from 'next/link';
import { ZODIAC_CUSPS, getCuspData, CuspId } from '@/constants/seo/cusps';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { renderJsonLd, createItemListSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Zodiac Cusps: Born on the Cusp? What It Means | Lunary',
  description:
    'Complete guide to zodiac cusps. Born on the cusp of two signs? Learn about the Cusp of Power, Magic, Rebirth, and more. Find your cusp personality.',
  keywords: [
    'zodiac cusp',
    'cusp signs',
    'born on the cusp',
    'cusp personality',
    'aries taurus cusp',
    'pisces aries cusp',
  ],
  openGraph: {
    title: 'Zodiac Cusps: Born on the Cusp? What It Means | Lunary',
    description:
      'Complete guide to zodiac cusps. Born between two signs? Find your cusp personality.',
    url: 'https://lunary.app/grimoire/cusps',
    images: [
      {
        url: '/api/og/grimoire/cusps',
        width: 1200,
        height: 630,
        alt: 'Zodiac Cusps Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zodiac Cusps: Born on the Cusp? What It Means | Lunary',
    description: 'Complete guide to zodiac cusps.',
    images: ['/api/og/grimoire/cusps'],
  },
  alternates: { canonical: 'https://lunary.app/grimoire/cusps' },
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

export default function CuspsIndexPage() {
  const cuspsListSchema = createItemListSchema({
    name: 'Zodiac Cusps',
    description:
      'Complete guide to all 12 zodiac cusps - born between two signs.',
    url: 'https://lunary.app/grimoire/cusps',
    items: ZODIAC_CUSPS.map((cusp) => {
      const data = getCuspData(cusp.id as CuspId);
      return {
        name: `${data.sign1}-${data.sign2} Cusp: The ${data.name}`,
        url: `https://lunary.app/grimoire/cusps/${cusp.id}`,
        description: `${data.dates} - ${data.element1} + ${data.element2}`,
      };
    }),
  });

  const heroContent = (
    <p className='text-lg text-zinc-400 leading-relaxed max-w-3xl mx-auto'>
      Born on the boundary between two signs? Cusp personalities blend elements,
      modalities, and planetary tones, creating multi-faceted energies. Explore
      each cusp to understand your fusion.
    </p>
  );

  const tableOfContents = [
    { label: 'Cusp Grid', href: '#cusp-grid' },
    { label: 'Are You a Cusp Baby?', href: '#cusp-check' },
    { label: 'Meaning', href: '#meaning' },
    { label: 'How to Work With This Energy', href: '#how-to-work' },
    { label: 'FAQ', href: '#faq' },
  ];

  const sections = (
    <>
      <section
        id='cusp-grid'
        className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12'
      >
        {ZODIAC_CUSPS.map((cusp) => {
          const data = getCuspData(cusp.id as CuspId);
          return (
            <Link
              key={cusp.id}
              href={`/grimoire/cusps/${cusp.id}`}
              className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
            >
              <div className='text-sm text-lunary-primary-400 mb-1'>
                {data.dates}
              </div>
              <h3 className='text-lg font-medium mb-1 group-hover:text-lunary-primary-300 transition-colors'>
                {data.sign1}-{data.sign2} Cusp
              </h3>
              <div className='text-zinc-300 mb-2'>The {data.name}</div>
              <div className='text-sm text-zinc-400'>
                {data.element1} + {data.element2}
              </div>
            </Link>
          );
        })}
      </section>

      <section
        id='cusp-check'
        className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'
      >
        <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
          Are You a Cusp Baby?
        </h2>
        <p className='text-zinc-300 mb-4'>
          Enter your birth details to see if you were born on a cusp and which
          one.
        </p>
        <Link
          href='/birth-chart'
          className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
        >
          Check Your Birth Chart
        </Link>
      </section>
    </>
  );

  return (
    <>
      {renderJsonLd(cuspsListSchema)}
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Zodiac Cusps'
        description='Born between two zodiac signs? Learn how cusp energies blend traits, elements, and timing to create unique personalities.'
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/cusps'
        }
        tableOfContents={tableOfContents}
        whatIs={{
          question: 'What is a zodiac cusp?',
          answer:
            'A cusp happens when your birth date falls near the boundary between two signs, blending their energies and giving you qualities from both.',
        }}
        intro='Cusp babies navigate dual archetypes. Explore each cusp type to understand which signs you straddle and how those energies show up in your chart.'
        tldr='Cusps describe people born near sign boundaries. Your Sun sign is fixed by degree, but nearby placements can blend energies. Use cusps as nuance, not a replacement for your full chart.'
        meaning={`Zodiac cusps are a useful way to describe “edge season” energy: the transition period where one archetype fades and another begins. In practice, your Sun sign is determined by the Sun’s exact degree at birth—so a full birth chart is always the most accurate.\n\nCusps are still meaningful as a *theme*: they describe why people born near a sign change often feel like they carry two styles at once (especially if they also have personal planets or rising sign placements in the neighboring sign). The healthiest way to use cusp language is as nuance—not as an override.\n\nTo deepen your cusp understanding, check your Sun degree, your Mercury/Venus/Mars signs, and your rising sign. Those placements show *how* your personality expresses itself day-to-day.`}
        howToWorkWith={[
          'Look up your exact Sun degree (birth time matters) to confirm which sign your Sun is actually in.',
          'If you relate strongly to the neighboring sign, check whether your Mercury, Venus, Mars, or rising sign are in that sign.',
          'Treat cusp energy as a “bridge”: use one sign for comfort and the other for growth, depending on the situation.',
          'Journal the two archetypes as roles—how do you act when you’re safe vs when you’re challenged?',
        ]}
        rituals={[
          'Write two short lists: one for each sign’s strengths. Combine them into a single intention.',
          'Create a small altar with colors or symbols from both signs.',
          'Meditate on when you feel most like sign one vs sign two.',
          'On your birthday, set a balance intention for the year ahead.',
        ]}
        journalPrompts={[
          'Where do I feel the strongest pull between two energies?',
          'Which sign helps me move forward, and which helps me rest?',
          'What does balance look like in my daily routine?',
          'How do I integrate the best of both signs?',
        ]}
        tables={[
          {
            title: 'Cusp Quick Check',
            headers: ['Step', 'Why It Helps'],
            rows: [
              ['Check Sun degree', 'Confirms your actual Sun sign.'],
              [
                'Check Mercury/Venus/Mars',
                'Shows why you feel the other sign.',
              ],
              ['Check Rising sign', 'Explains outward behavior.'],
              ['Track patterns', 'Reveals how you move between energies.'],
            ],
          },
        ]}
        internalLinks={[
          { text: 'All Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Zodiac Decans', href: '/grimoire/decans' },
          { text: 'Birth Chart', href: '/birth-chart' },
          { text: 'Compatibility', href: '/grimoire/compatibility' },
        ]}
        faqs={[
          {
            question: 'Are cusps real in astrology?',
            answer:
              'Your Sun sign is determined by the exact position of the Sun at birth, so you are always one sign. Cusps are best used as a helpful “transition season” concept—especially when other chart placements sit in the neighboring sign.',
          },
          {
            question: 'How close to the sign change counts as a cusp?',
            answer:
              'Different astrologers use different ranges, but a common rule of thumb is within a few days of the sign change. The most accurate method is checking your Sun degree in your birth chart.',
          },
          {
            question: 'Why do I feel like two signs?',
            answer:
              'Often it’s because your Mercury/Venus/Mars, Moon, or rising sign is in the neighboring sign, or because you have strong aspects that bring out those traits.',
          },
        ]}
        cosmicConnectionsParams={{
          entityType: 'hub-zodiac',
          entityKey: 'zodiac',
        }}
        ctaText='Want your exact Sun degree, rising sign, and full chart breakdown?'
        ctaHref='/birth-chart'
        heroContent={heroContent}
        // childrenPosition='after-intro'
      >
        {sections}
      </SEOContentTemplate>
    </>
  );
}
