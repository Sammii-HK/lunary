import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  ZODIAC_SIGNS,
  SIGN_DISPLAY,
  SIGN_SYMBOLS,
  getDecanData,
} from '@/constants/seo/decans';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

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
  },
  alternates: { canonical: 'https://lunary.app/grimoire/decans' },
};

const tableOfContents = [
  { label: 'Decan Grid', href: '#decan-grid' },
  { label: 'Explore More', href: '#explore-more' },
  { label: 'Meaning', href: '#meaning' },
  { label: 'How to Work With This Energy', href: '#how-to-work' },
  { label: 'FAQ', href: '#faq' },
];

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

const sections = (
  <>
    <section id='decan-grid' className='space-y-8'>
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
                      {d === 1 ? 'First' : d === 2 ? 'Second' : 'Third'} Decan
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
    </section>

    <section id='explore-more' className='pt-8 border-t border-zinc-800'>
      <h2 className='text-2xl font-light text-zinc-100 mb-4'>
        Explore More Astrology
      </h2>
      <div className='flex flex-wrap gap-3'>
        <Link
          href='/grimoire/birth-chart'
          className='px-4 py-2 rounded-lg border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 transition-colors'
        >
          Birth Chart
        </Link>
        <Link
          href='/grimoire/aspects'
          className='px-4 py-2 rounded-lg border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 transition-colors'
        >
          Aspects
        </Link>
        <Link
          href='/grimoire/houses'
          className='px-4 py-2 rounded-lg border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 transition-colors'
        >
          Houses
        </Link>
        <Link
          href='/grimoire/numerology'
          className='px-4 py-2 rounded-lg border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 transition-colors'
        >
          Numerology
        </Link>
      </div>
    </section>
  </>
);

export default function DecansIndexPage() {
  return (
    <>
      {renderJsonLd(decansListSchema)}
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Zodiac Decans'
        description={metadata.description as string}
        keywords={
          Array.isArray(metadata.keywords)
            ? metadata.keywords
            : metadata.keywords
              ? [metadata.keywords]
              : []
        }
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/decans'
        }
        tableOfContents={tableOfContents}
        intro='Decans split each zodiac sign into three 10-degree sections, each with its own subruler and tonal flavor. Explore every decan to understand the hidden layers of your Sun sign.'
        tldr='Decans divide each zodiac sign into three 10-degree segments. Each segment has a sub-ruler that adds nuance to the sign’s expression and timing.'
        meaning={`Decans add nuance to astrology by splitting each sign into three parts (roughly 10° each). While your Sun sign describes the *archetype*, your decan describes the *flavor*—often showing up as style, pacing, motivation, and what you’re drawn to.\n\nThink of decans as sub-themes:\n\n- **First decan**: the purest expression of the sign\n- **Second decan**: a secondary tone (often more social or relational)\n- **Third decan**: an intensified or transformed expression\n\nDecans are especially helpful when you relate strongly to your sign but don’t match the “stereotype.” They’re also useful in timing work—transits through your decan can feel more specific than general sign-based forecasts.\n\nHistorically, decans come from ancient astrological and magical traditions, where each 10-degree segment had its own ruling influence. Modern astrology uses them to add texture to chart readings without changing your core placements.\n\nTo apply decans, start with your Sun, then check your Moon and Rising. You’ll often notice that your decan explains subtle preferences, how you pace yourself, and the kind of environments where you feel most at ease.`}
        tables={[
          {
            title: 'Decan Structure Overview',
            headers: ['Segment', 'Degrees', 'Tone'],
            rows: [
              ['First Decan', '0°–10°', 'Core expression of the sign'],
              ['Second Decan', '10°–20°', 'Secondary tone via sub-ruler'],
              ['Third Decan', '20°–30°', 'Intensified or transformed style'],
            ],
          },
        ]}
        howToWorkWith={[
          'Find your Sun degree (birth time helps) and identify which 10° segment it lands in.',
          'Read your decan alongside your Moon and rising sign for a “Big Three” nuance layer.',
          'Use your decan ruler as a practice focus (rituals, journaling themes, and timing).',
          'When a transit hits your decan, look for the “tone shift” in your mood and priorities.',
        ]}
        rituals={[
          'Pick a sub-ruler planet and work with its symbolism for one week.',
          'Create a short intention aligned with your decan’s tone and review it daily.',
          'Track your energy during your decan season to see what shifts.',
          'Use a tarot pull to explore how your decan wants to express itself.',
        ]}
        journalPrompts={[
          'What part of my sign feels most true to my lived experience?',
          'Which sub-ruler themes show up in my daily decisions?',
          'How does my pace change across the month?',
          'Where do I feel the strongest “tone shift” in my sign expression?',
        ]}
        internalLinks={[
          { text: 'All Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Zodiac Cusps', href: '/grimoire/cusps' },
          { text: 'Birth Chart', href: '/birth-chart' },
          { text: 'Aspects', href: '/grimoire/aspects' },
        ]}
        faqs={[
          {
            question: 'What is a decan in astrology?',
            answer:
              'A decan is one of three 10-degree segments inside each zodiac sign. Each segment adds a slightly different “tone” and is traditionally associated with a sub-ruler.',
          },
          {
            question: 'Do I need my birth time to find my decan?',
            answer:
              'Birth time isn’t always required for your Sun decan (date is often enough), but it helps ensure accuracy—especially around sign change days and when calculating your rising sign and houses.',
          },
          {
            question: 'Are decans more important than my Moon or rising sign?',
            answer:
              'No—Moon and rising sign usually have a bigger impact on day-to-day expression. Decans are a nuance layer that helps you refine your Sun sign interpretation.',
          },
          {
            question: 'How do I find my exact decan?',
            answer:
              'Find your Sun degree from a birth chart, then match it to the 0°–10°, 10°–20°, or 20°–30° segment of your sign.',
          },
        ]}
        cosmicConnectionsParams={{
          entityType: 'hub-zodiac',
          entityKey: 'zodiac',
        }}
        ctaText='Want your exact degrees and a full interpretation of your chart?'
        ctaHref='/birth-chart'
        heroContent={
          <p className='text-lg text-zinc-400 max-w-3xl leading-relaxed'>
            Each zodiac sign contains three decans with unique sub-rulers and
            traits. Learning your decan adds nuance to your natal chart and
            predictions.
          </p>
        }
      >
        {sections}
      </SEOContentTemplate>
    </>
  );
}
