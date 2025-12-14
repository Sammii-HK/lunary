import { Metadata } from 'next';
import Link from 'next/link';
import {
  planetDescriptions,
  signDescriptions,
} from '@/constants/seo/planet-sign-content';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import {
  createItemListSchema,
  createFAQPageSchema,
  renderJsonLd,
  createBreadcrumbSchema,
} from '@/lib/schema';

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

  const faqSchema = createFAQPageSchema(
    faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(itemListSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Placements', url: '/grimoire/placements' },
        ]),
      )}
      {renderJsonLd(faqSchema)}
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Placements' },
          ]}
        />

        <header className='mb-12'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Astrological Placements: Sun, Moon & Rising in Every Sign
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl'>
            Explore what each planet means in every zodiac sign. Click any
            combination to learn about its influence on personality, strengths,
            and challenges.
          </p>
        </header>

        <nav className='mb-8 overflow-x-auto'>
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
        </nav>

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

        {/* Planet Sections */}
        <div className='space-y-12'>
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
                    className='p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-lunary-primary-600 transition-colors text-center group'
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
                    <div className='text-sm text-zinc-300 group-hover:text-lunary-primary-300 transition-colors'>
                      {sign.name}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Sign Quick Links */}
        <section className='mt-12 p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
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

        <section className='mt-12 mb-12'>
          <h2 className='text-2xl font-light mb-6'>
            Frequently Asked Questions
          </h2>
          <div className='space-y-4'>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'
              >
                <h3 className='text-lg font-medium mb-2 text-zinc-100'>
                  {faq.question}
                </h3>
                <p className='text-zinc-400'>{faq.answer}</p>
              </div>
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
        <ExploreGrimoire />
      </div>
    </div>
  );
}
