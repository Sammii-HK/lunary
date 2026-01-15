import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import {
  planetaryBodies,
  bodiesSymbols,
  planetUnicode,
} from '../../../../../../utils/zodiac/zodiac';
import { createPlanetSchema, renderJsonLd } from '@/lib/schema';
import {
  getEntityRelationships,
  getWikipediaUrl,
} from '@/constants/entity-relationships';

const planetKeys = Object.keys(planetaryBodies);

export async function generateStaticParams() {
  return planetKeys.map((planet) => ({
    planet: planet.toLowerCase(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planet: string }>;
}): Promise<Metadata> {
  const { planet } = await params;
  const planetKey = planetKeys.find(
    (p) => p.toLowerCase() === planet.toLowerCase(),
  );

  if (!planetKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const planetData = planetaryBodies[planetKey as keyof typeof planetaryBodies];
  const title = `${planetData.name} in Astrology: Meaning & Influence - Lunary`;
  const description = `Discover ${planetData.name}'s astrological meaning and influence. Learn about ${planetData.name}'s mystical properties, planetary hours, and how to work with ${planetData.name} energy.`;

  return {
    title,
    description,
    keywords: [
      `${planetData.name} astrology`,
      `${planetData.name} meaning`,
      `${planetData.name} influence`,
      `${planetData.name} planet`,
      'planetary astrology',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/astronomy/planets/${planet}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/planets',
          width: 1200,
          height: 630,
          alt: `${planetData.name} in Astrology`,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/api/og/grimoire/planets'],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/astronomy/planets/${planet}`,
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

export default async function PlanetPage({
  params,
}: {
  params: Promise<{ planet: string }>;
}) {
  const { planet } = await params;
  const planetKey = planetKeys.find(
    (p) => p.toLowerCase() === planet.toLowerCase(),
  );

  if (!planetKey) {
    notFound();
  }

  const planetData = planetaryBodies[planetKey as keyof typeof planetaryBodies];
  const symbol = bodiesSymbols[planetKey as keyof typeof bodiesSymbols] || '';

  const unicodeSymbol =
    planetUnicode[planetKey as keyof typeof planetUnicode] || symbol;

  const planetCorrespondences: Record<
    string,
    { day: string; colors: string[]; themes: string[] }
  > = {
    sun: {
      day: 'Sunday',
      colors: ['Gold', 'Yellow', 'Orange'],
      themes: ['Vitality', 'Success', 'Leadership'],
    },
    moon: {
      day: 'Monday',
      colors: ['Silver', 'White', 'Blue'],
      themes: ['Intuition', 'Emotions', 'Dreams'],
    },
    mercury: {
      day: 'Wednesday',
      colors: ['Yellow', 'Orange'],
      themes: ['Communication', 'Travel', 'Learning'],
    },
    venus: {
      day: 'Friday',
      colors: ['Green', 'Pink', 'Copper'],
      themes: ['Love', 'Beauty', 'Harmony'],
    },
    earth: {
      day: 'Every day',
      colors: ['Green', 'Brown', 'Black'],
      themes: ['Grounding', 'Stability', 'Nature'],
    },
    mars: {
      day: 'Tuesday',
      colors: ['Red', 'Orange'],
      themes: ['Action', 'Courage', 'Passion'],
    },
    jupiter: {
      day: 'Thursday',
      colors: ['Purple', 'Blue', 'Gold'],
      themes: ['Expansion', 'Luck', 'Abundance'],
    },
    saturn: {
      day: 'Saturday',
      colors: ['Black', 'Brown', 'Gray'],
      themes: ['Discipline', 'Structure', 'Lessons'],
    },
    uranus: {
      day: 'Wednesday (alt)',
      colors: ['Electric Blue', 'Silver'],
      themes: ['Innovation', 'Change', 'Revolution'],
    },
    neptune: {
      day: 'Monday (alt)',
      colors: ['Sea Green', 'Purple'],
      themes: ['Dreams', 'Spirituality', 'Intuition'],
    },
    pluto: {
      day: 'Tuesday (alt)',
      colors: ['Black', 'Dark Red'],
      themes: ['Transformation', 'Power', 'Rebirth'],
    },
  };

  const correspondences = planetCorrespondences[planetKey] || {
    day: 'Varies',
    colors: [],
    themes: [],
  };

  const faqs = [
    {
      question: `What does ${planetData.name} represent in astrology?`,
      answer: `${planetData.name} ${planetData.mysticalProperties}`,
    },
    {
      question: `What day is ruled by ${planetData.name}?`,
      answer: `${planetData.name} rules ${correspondences.day}. This day is ideal for working with ${planetData.name} energy and themes of ${correspondences.themes.join(', ').toLowerCase()}.`,
    },
    {
      question: `What colors are associated with ${planetData.name}?`,
      answer: `${planetData.name} is associated with ${correspondences.colors.join(', ')}. Use these colors in rituals and spells to connect with ${planetData.name} energy.`,
    },
    {
      question: `How do I work with ${planetData.name} energy?`,
      answer: `Work with ${planetData.name} on ${correspondences.day}, use ${correspondences.colors[0] || 'corresponding'} colors, and focus on themes of ${correspondences.themes.join(', ').toLowerCase()}.`,
    },
  ];

  // Entity schema for Knowledge Graph
  const planetSchema = createPlanetSchema({
    planet: planetData.name,
    description: `${planetData.name} (${unicodeSymbol}) in astrology represents ${correspondences.themes.slice(0, 3).join(', ').toLowerCase()}. ${planetData.mysticalProperties}`,
    rules: planetData.rules || [],
    themes: correspondences.themes,
    day: correspondences.day,
    sameAs: getWikipediaUrl('planets', planetKey),
  });

  const tableOfContents = [
    { label: `${planetData.name} Essentials`, href: '#planet-essentials' },
    { label: 'Working with Correspondences', href: '#planet-correspondences' },
    { label: 'Rituals & Devotion', href: '#planet-rituals' },
    { label: 'Transit Timing Tips', href: '#planet-transits' },
    { label: 'Frequently Asked Questions', href: '#faq' },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(planetSchema)}
      <SEOContentTemplate
        title={`${planetData.name} - Lunary`}
        h1={`${planetData.name} ${unicodeSymbol}: Astrological Meaning`}
        description={`Discover ${planetData.name}'s astrological meaning and influence. Learn about its mystical properties and how to work with ${planetData.name} energy.`}
        keywords={[
          `${planetData.name} astrology`,
          `${planetData.name} meaning`,
          `${planetData.name} influence`,
          'planetary astrology',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/astronomy/planets/${planet}`}
        intro={`${planetData.name} ${unicodeSymbol} is a powerful celestial body in astrology. ${planetData.properties}. ${planetData.mysticalProperties}`}
        tldr={`${planetData.name} ${unicodeSymbol} rules ${correspondences.day} and governs ${correspondences.themes.join(', ').toLowerCase()}.`}
        meaning={`In astrology, each planet carries unique energy and influence that shapes our lives in different ways. ${planetData.name} holds a special place in the cosmic order.

${planetData.properties}

${planetData.mysticalProperties}

Understanding ${planetData.name}'s influence helps you work with its energy consciously. Whether ${planetData.name} is prominent in your birth chart or you're working with planetary timing, knowing its qualities enhances your astrological practice.

${planetData.name} rules ${correspondences.day}, making this day ideal for activities aligned with its themes. The planet's energy influences ${correspondences.themes.join(', ').toLowerCase()}, and working with its correspondences can amplify your intentions.

In magical practice, ${planetData.name} is invoked for matters relating to ${correspondences.themes.join(', ').toLowerCase()}. Using ${correspondences.colors.join(', ')} colors, working on ${correspondences.day}, and understanding the planet's nature helps you align with its cosmic power.`}
        glyphs={symbol ? [symbol] : undefined}
        emotionalThemes={correspondences.themes}
        howToWorkWith={[
          `Plan ${correspondences.themes[0]?.toLowerCase() || 'related'} activities for ${correspondences.day}`,
          `Use ${correspondences.colors.join(', ')} colors in rituals`,
          `Invoke ${planetData.name} for ${correspondences.themes.join(', ').toLowerCase()}`,
          `Study ${planetData.name} in your birth chart`,
          `Track ${planetData.name}'s transits`,
        ]}
        tables={[
          {
            title: `${planetData.name} Correspondences`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Symbol', unicodeSymbol || 'N/A'],
              ['Ruling Day', correspondences.day],
              ['Colors', correspondences.colors.join(', ')],
              ['Themes', correspondences.themes.join(', ')],
            ],
          },
        ]}
        journalPrompts={[
          `How does ${planetData.name} energy manifest in my life?`,
          `What is ${planetData.name}'s placement in my birth chart?`,
          `How can I work with ${planetData.name} more consciously?`,
          `What ${correspondences.themes[0]?.toLowerCase() || ''} goals can ${planetData.name} help me achieve?`,
        ]}
        relatedItems={[
          ...getEntityRelationships('planet', planetKey)
            .slice(0, 6)
            .map((rel) => ({
              name: rel.name,
              href: rel.url,
              type: rel.type.charAt(0).toUpperCase() + rel.type.slice(1),
            })),
          {
            name: 'Astronomy Guide',
            href: '/grimoire/astronomy',
            type: 'Guide',
          },
          { name: 'Birth Chart', href: '/birth-chart', type: 'Tool' },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Astronomy', href: '/grimoire/astronomy' },
          {
            label: planetData.name,
            href: `/grimoire/astronomy/planets/${planet}`,
          },
        ]}
        internalLinks={[
          { text: 'View Your Birth Chart', href: '/birth-chart' },
          { text: 'Astronomy Guide', href: '/grimoire/astronomy' },
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Discover ${planetData.name} in your birth chart`}
        ctaHref='/pricing'
        tableOfContents={tableOfContents}
        faqs={faqs}
        cosmicConnections={
          <CosmicConnections
            entityType='planet'
            entityKey={planetKey}
            title={`${planetData.name} Cosmic Connections`}
          />
        }
      >
        <section
          id='planet-essentials'
          className='mb-10 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-3'
        >
          <div className='flex items-center gap-3 text-3xl text-lunary-primary-300'>
            <span>{unicodeSymbol}</span>
            <span>{planetData.name}</span>
          </div>
          <p className='text-zinc-300'>
            {planetData.name} expresses {planetData.properties.toLowerCase()}.
            When this planet is strong in your chart, you naturally gravitate
            toward experiences that highlight{' '}
            {correspondences.themes.join(', ').toLowerCase()}.
          </p>
          <p className='text-zinc-300'>
            Look at the sign and house placement of {planetData.name} to
            understand how the planet colors your relationships, work style, and
            inner dialogue. Any aspects to the planet describe allies or tension
            points that help you work with its lessons.
          </p>
        </section>

        <section
          id='planet-correspondences'
          className='mb-10 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-4'
        >
          <h2 className='text-2xl font-medium text-zinc-100'>
            Working with Correspondences
          </h2>
          <p className='text-zinc-300'>
            Bring {planetData.name} into your physical space by incorporating
            its preferred colors, herbs, metals, and day of the week. Sensory
            cues help your body remember the planet’s vibration, making rituals
            more effective.
          </p>
          <div className='grid sm:grid-cols-2 gap-4 text-sm text-zinc-300'>
            <div className='rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 space-y-1'>
              <p className='font-semibold text-zinc-100'>Day & Colors</p>
              <p>
                Day: {correspondences.day}. Colors:{' '}
                {correspondences.colors.join(', ')}.
              </p>
            </div>
            <div className='rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 space-y-1'>
              <p className='font-semibold text-zinc-100'>Themes</p>
              <p>{correspondences.themes.join(', ')}</p>
            </div>
          </div>
          <p className='text-zinc-300'>
            Add these correspondences to candles, bath rituals, sigils, or
            wardrobe choices on {correspondences.day} to strengthen the link
            between your mundane routine and the planet’s magic.
          </p>
        </section>

        <section
          id='planet-rituals'
          className='mb-10 bg-zinc-900/35 border border-zinc-800 rounded-xl p-6 space-y-4'
        >
          <h2 className='text-2xl font-medium text-zinc-100'>
            Rituals & Devotion
          </h2>
          <ol className='list-decimal list-inside text-zinc-300 space-y-2'>
            <li>
              <strong>Morning check-in:</strong> Pull a tarot card or rune
              asking, “How can I honor {planetData.name} today?” Record the
              answer in your journal.
            </li>
            <li>
              <strong>Planetary offering:</strong> Light a candle in{' '}
              {correspondences.colors[0] || 'a matching'} tone and write an
              intention focused on the planet’s themes.
            </li>
            <li>
              <strong>Somatic anchor:</strong> Choose a movement practice that
              mirrors the energy—fiery dance for Mars, slow breathing for
              Saturn, oceanic flow for Neptune.
            </li>
            <li>
              <strong>Closing gratitude:</strong> Note any synchronicities that
              appeared after you honored the planet. Over time you’ll build a
              personal dictionary of signs.
            </li>
          </ol>
        </section>

        <section
          id='planet-transits'
          className='mb-10 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-4'
        >
          <h2 className='text-2xl font-medium text-zinc-100'>
            Transit Timing Tips
          </h2>
          <p className='text-zinc-300'>
            Track {planetData.name} transits to anticipate when its lessons will
            be front and center. If the planet moves quickly (Mercury, Venus,
            Mars), note dates when it aspect your natal planets. If it moves
            slowly (Jupiter outward) watch the houses it travels through.
          </p>
          <ul className='space-y-2 text-zinc-300'>
            <li>
              Retrograde phases invite you to review, rework, and reconnect with
              the planet’s themes instead of forcing forward motion.
            </li>
            <li>
              Conjunctions bring fresh cycles—plan launches or initiations that
              echo the planet’s energy.
            </li>
            <li>
              Squares/oppositions highlight growth edges; schedule rest and
              reflection so you can respond intentionally.
            </li>
          </ul>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
