import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  planetaryBodies,
  bodiesSymbols,
  planetUnicode,
} from '../../../../../../utils/zodiac/zodiac';

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
      images: ['/api/og/cosmic'],
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

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
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
          {
            name: 'Astronomy Guide',
            href: '/grimoire/astronomy',
            type: 'Guide',
          },
          { name: 'Birth Chart', href: '/birth-chart', type: 'Tool' },
          { name: 'Horoscope', href: '/horoscope', type: 'Daily Reading' },
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
        faqs={faqs}
      />
    </div>
  );
}
