import { Metadata } from 'next';
import Link from 'next/link';
import {
  planetDescriptions,
  signDescriptions,
} from '@/constants/seo/planet-sign-content';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title:
    'Astrological Placements: Sun, Moon & Rising in Every Sign: Planet in Sign Meanings - Lunary',
  description:
    'Complete guide to astrological placements. Explore what each planet means in every zodiac sign. 144+ detailed interpretations for your birth chart analysis.',
  openGraph: {
    title: 'Astrological Placements: Sun, Moon & Rising in Every Sign - Lunary',
    description: 'Explore 144+ planet-in-sign combinations and their meanings.',
    url: 'https://lunary.app/grimoire/placements',
    images: [
      {
        url: '/api/og/grimoire/placements',
        width: 1200,
        height: 630,
        alt: 'Astrological Placements Guide - Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrological Placements: Sun, Moon & Rising in Every Sign - Lunary',
    description: 'Explore 144+ planet-in-sign combinations and their meanings.',
    images: ['/api/og/grimoire/placements'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/placements',
  },
};

const faqs = [
  {
    question: 'What are astrological placements?',
    answer:
      'Astrological placements refer to which zodiac sign each planet was in at the time of your birth. For example, having Sun in Leo or Moon in Cancer. These placements shape different aspects of your personality and life experiences.',
  },
  {
    question: 'Why do placements matter?',
    answer:
      'Each planet governs specific life areas (love, career, emotions, etc.), and the sign it occupies modifies how that energy expresses. Understanding your placements provides deeper self-knowledge beyond just your Sun sign.',
  },
  {
    question: "What's the difference between signs, planets, and houses?",
    answer:
      'Signs describe how energy is expressed (personality style). Planets represent what type of energy (action, love, communication). Houses show where in life that energy manifests (career, relationships, home). Together they create your unique cosmic blueprint.',
  },
];

export default function PlacementsIndexPage() {
  const planets = Object.entries(planetDescriptions);
  const signs = Object.entries(signDescriptions);

  const allPlacements: { name: string; url: string; description: string }[] =
    [];
  planets.forEach(([planetKey, planet]) => {
    signs.forEach(([signKey, sign]) => {
      allPlacements.push({
        name: `${planet.name} in ${sign.name}`,
        url: `https://lunary.app/grimoire/placements/${planetKey}-in-${signKey}`,
        description: `What it means to have ${planet.name} in ${sign.name} in your birth chart.`,
      });
    });
  });

  const itemListSchema = createItemListSchema({
    name: 'Astrological Placements',
    description:
      'Complete guide to all planet-in-sign combinations for birth chart analysis.',
    url: 'https://lunary.app/grimoire/placements',
    items: allPlacements.slice(0, 50),
  });

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(itemListSchema)}
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Astrological Placements'
        description='Explore every planet-in-sign combination to understand how placements shape your personality and life.'
        keywords={[
          'astrological placements',
          'planet in sign meanings',
          'birth chart placements',
        ]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/placements'
        }
        intro='Placements show how each planet expresses itself through a zodiac sign. Together they form the character and focus of your chart.'
        tldr='Planet = what, sign = how. Combine them to understand your chart and daily tendencies.'
        meaning={`Placements are the core language of astrology. A planet shows the area of life, and the sign shows the style and tone.

Look at personal planets first (Sun, Moon, Mercury, Venus, Mars). These describe identity, emotions, communication, love, and action. Outer planets add long-term themes.

If a placement feels unfamiliar, read the planet meaning and the sign meaning separately, then blend the two.

When you read any placement, ask: what does the planet want, how does the sign pursue it, and where does the house express it? That three-part question turns a list of placements into a practical story.

If you are overwhelmed by details, pick one placement to study for a week and notice how it shows up in daily choices. Patterns become obvious when you track them.

Over time, placements feel less like labels and more like tools for self-awareness.`}
        howToWorkWith={[
          'Start with Sun, Moon, and Rising placements.',
          'Read the planet first, then the sign.',
          'Notice repeating elements or modalities.',
          'Compare placements in relationships for contrast.',
        ]}
        rituals={[
          'Write your Sun, Moon, and Rising and describe each in one sentence.',
          'Pick one placement to focus on for a week.',
          'Track how that placement shows up in daily choices.',
        ]}
        journalPrompts={[
          'Which placement feels most accurate right now, and why?',
          'Which placement feels underused?',
          'What habit would bring this placement into balance?',
          'What placement do I want to understand next?',
        ]}
        tables={[
          {
            title: 'Placement Formula',
            headers: ['Part', 'Meaning'],
            rows: [
              ['Planet', 'The life area or function'],
              ['Sign', 'The style or expression'],
              ['House', 'The life setting'],
            ],
          },
          {
            title: 'Placement Reading Order',
            headers: ['Step', 'Focus'],
            rows: [
              ['1', 'Personal planets and Rising'],
              ['2', 'Element and modality patterns'],
              ['3', 'House emphasis'],
              ['4', 'Outer planets for long-term tone'],
            ],
          },
          {
            title: 'Element Balance',
            headers: ['If you have lots of', 'Notice'],
            rows: [
              ['Fire', 'Drive, initiative, restlessness'],
              ['Earth', 'Stability, practicality, routine'],
              ['Air', 'Ideas, communication, curiosity'],
              ['Water', 'Emotion, sensitivity, intuition'],
            ],
          },
        ]}
        internalLinks={[
          { text: 'Birth Chart', href: '/birth-chart' },
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Planets', href: '/grimoire/astronomy/planets' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        heroContent={
          <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
            Explore what each planet means in every zodiac sign. Tap any
            combination to dive deeper into how it influences personality,
            strengths, and challenges in your birth chart.
          </p>
        }
        tableOfContents={[
          { label: 'Planet Sections', href: '#planet-sections' },
          { label: 'Browse by Sign', href: '#sign-links' },
          { label: 'FAQ', href: '#faq' },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Placements' },
        ]}
        faqs={faqs}
      >
        <div className='mb-8 overflow-x-auto'>
          <div className='flex gap-2 pb-2'>
            {planets.map(([planetKey, planet]) => (
              <a
                key={planetKey}
                href={`#${planetKey}-placements`}
                className='px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-lunary-primary-300 text-sm whitespace-nowrap transition-colors'
              >
                {planet.name}
              </a>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-3 gap-4 mb-12 max-w-md'>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-3xl font-light text-lunary-primary-400'>
              {planets.length}
            </div>
            <div className='text-sm text-zinc-400'>Planets</div>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-3xl font-light text-lunary-primary-400'>
              {signs.length}
            </div>
            <div className='text-sm text-zinc-400'>Signs</div>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-3xl font-light text-lunary-primary-400'>
              {planets.length * signs.length}
            </div>
            <div className='text-sm text-zinc-400'>Combinations</div>
          </div>
        </div>

        <section id='planet-sections' className='space-y-12'>
          {planets.map(([planetKey, planet]) => (
            <section
              key={planetKey}
              id={`${planetKey}-placements`}
              className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'
            >
              <div className='mb-6'>
                <h2 className='text-2xl font-medium text-zinc-100 mb-2'>
                  {planet.name} Placements
                </h2>
                <p className='text-zinc-400 text-sm'>
                  {planet.name} governs {planet.themes}. Rules {planet.rules}.
                </p>
              </div>
              <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2'>
                {signs.map(([signKey, sign]) => (
                  <Link
                    key={signKey}
                    href={`/grimoire/placements/${planetKey}-in-${signKey}`}
                    className='p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-lunary-primary-600 text-center group'
                  >
                    <div className='text-lg mb-1'>
                      {sign.element === 'Fire'
                        ? '🔥'
                        : sign.element === 'Earth'
                          ? '🌍'
                          : sign.element === 'Air'
                            ? '💨'
                            : '💧'}
                    </div>
                    <div className='text-sm text-zinc-300 group-hover:text-lunary-primary-300'>
                      {sign.name}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </section>

        <section
          id='sign-links'
          className='mt-12 p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Browse by Zodiac Sign
          </h2>
          <div className='flex flex-wrap gap-3'>
            {signs.map(([signKey, sign]) => (
              <Link
                key={signKey}
                href={`/grimoire/zodiac/${signKey}`}
                className='px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-lunary-primary-300 text-sm transition-colors'
              >
                {sign.name}
              </Link>
            ))}
          </div>
        </section>

        <section className='text-center'>
          <Link
            href='/birth-chart'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium text-lg transition-colors'
          >
            Discover Your Placements
          </Link>
          <p className='mt-3 text-sm text-zinc-400'>
            Generate your complete birth chart to see all your planetary
            placements
          </p>
        </section>

        <div className='mt-8'>
          <CosmicConnections
            entityType='hub-placements'
            entityKey='placements'
            title='Placements Connections'
          />
        </div>
      </SEOContentTemplate>
    </div>
  );
}
