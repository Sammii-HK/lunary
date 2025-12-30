import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { astrologicalHouses } from '@/constants/grimoire/seo-data';

const houseNumbers = Array.from({ length: 12 }, (_, i) => String(i + 1));

const houseKeyMap: Record<string, keyof typeof astrologicalHouses> = {
  '1': 'first',
  '2': 'second',
  '3': 'third',
  '4': 'fourth',
  '5': 'fifth',
  '6': 'sixth',
  '7': 'seventh',
  '8': 'eighth',
  '9': 'ninth',
  '10': 'tenth',
  '11': 'eleventh',
  '12': 'twelfth',
};

export async function generateStaticParams() {
  return houseNumbers.map((house) => ({
    house: house,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ house: string }>;
}): Promise<Metadata> {
  const { house } = await params;
  const houseKey = houseKeyMap[house];
  const houseData = houseKey ? astrologicalHouses[houseKey] : null;

  if (!houseData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const ordinal =
    house === '1'
      ? '1st'
      : house === '2'
        ? '2nd'
        : house === '3'
          ? '3rd'
          : `${house}th`;

  const extraHouseNotes =
    house === '10'
      ? `\n\nThe ${ordinal} House is strongly tied to career, reputation, and life direction. It relates to the Midheaven (MC) and shows how you want to be seen for your work in the world.`
      : house === '11'
        ? `\n\nThe ${ordinal} House highlights community, collaboration, and long-term goals. It shows the kind of networks that support your future.`
        : house === '12'
          ? `\n\nThe ${ordinal} House governs solitude, subconscious patterns, and spiritual restoration. It often asks for quiet reflection before major decisions.`
          : '';

  const isUpperHouses = ['10', '11', '12'].includes(house);
  const extraInternalLinks = isUpperHouses
    ? [
        { text: 'Rising Sign (Ascendant)', href: '/grimoire/rising-sign' },
        { text: 'Planets in Astrology', href: '/grimoire/astronomy/planets' },
        { text: 'Birth Chart Guide', href: '/grimoire/birth-chart' },
        { text: 'Astrology Placements', href: '/grimoire/placements' },
        { text: 'Life Path', href: '/grimoire/life-path' },
      ]
    : [];

  const extraRelatedItems = isUpperHouses
    ? [
        { name: 'Rising Sign', href: '/grimoire/rising-sign', type: 'Guide' },
        {
          name: 'Planets in Astrology',
          href: '/grimoire/astronomy/planets',
          type: 'Guide',
        },
        { name: 'Life Path', href: '/grimoire/life-path', type: 'Guide' },
      ]
    : [];
  const title = `${ordinal} House in Astrology: ${houseData.keywords[0]} & More - Lunary`;
  const description = `Learn about the ${ordinal} House in your birth chart. Discover how the ${houseData.name} influences ${houseData.area.toLowerCase()} and what planets mean in this house.`;

  return {
    title,
    description,
    keywords: [
      `${ordinal} house astrology`,
      houseData.name.toLowerCase(),
      `${houseData.keywords[0].toLowerCase()} house`,
      'birth chart houses',
      'astrology houses',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/birth-chart/houses/${house}`,
      siteName: 'Lunary',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/birth-chart/houses/${house}`,
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

export default async function BirthChartHousePage({
  params,
}: {
  params: Promise<{ house: string }>;
}) {
  const { house } = await params;
  const houseKey = houseKeyMap[house];
  const houseData = houseKey ? astrologicalHouses[houseKey] : null;

  if (!houseData) {
    notFound();
  }

  const ordinal =
    house === '1'
      ? '1st'
      : house === '2'
        ? '2nd'
        : house === '3'
          ? '3rd'
          : `${house}th`;
  const extraHouseNotes =
    house === '10'
      ? `\n\nThe ${ordinal} House is strongly tied to career, reputation, and life direction. It relates to the Midheaven (MC) and shows how you want to be seen for your work in the world.`
      : house === '11'
        ? `\n\nThe ${ordinal} House highlights community, collaboration, and long-term goals. It shows the kind of networks that support your future.`
        : house === '12'
          ? `\n\nThe ${ordinal} House governs solitude, subconscious patterns, and spiritual restoration. It often asks for quiet reflection before major decisions.`
          : '';

  const isUpperHouses = ['10', '11', '12'].includes(house);
  const extraInternalLinks = isUpperHouses
    ? [
        { text: 'Rising Sign (Ascendant)', href: '/grimoire/rising-sign' },
        { text: 'Planets in Astrology', href: '/grimoire/astronomy/planets' },
        { text: 'Birth Chart Guide', href: '/grimoire/birth-chart' },
        { text: 'Astrology Placements', href: '/grimoire/placements' },
        { text: 'Life Path', href: '/grimoire/life-path' },
      ]
    : [];

  const extraRelatedItems = isUpperHouses
    ? [
        { name: 'Rising Sign', href: '/grimoire/rising-sign', type: 'Guide' },
        {
          name: 'Planets in Astrology',
          href: '/grimoire/astronomy/planets',
          type: 'Guide',
        },
        { name: 'Life Path', href: '/grimoire/life-path', type: 'Guide' },
      ]
    : [];

  const faqs = [
    {
      question: `What does the ${ordinal} House represent?`,
      answer: `The ${ordinal} House (${houseData.name}) represents ${houseData.area}. ${houseData.description}`,
    },
    {
      question: `What sign rules the ${ordinal} House?`,
      answer: `The ${ordinal} House is naturally ruled by ${houseData.rulingSign} and the planet ${houseData.rulingPlanet}. It corresponds to the ${houseData.element} element.`,
    },
    {
      question: `What planets are important in the ${ordinal} House?`,
      answer: `Any planet in your ${ordinal} House influences ${houseData.area.toLowerCase()}. The ruling planet ${houseData.rulingPlanet} has natural affinity with this house.`,
    },
    {
      question: `How do I know what sign is in my ${ordinal} House?`,
      answer: `Your ${ordinal} House sign is determined by your birth chart. Calculate your chart using your exact birth time, date, and location to discover your house placements.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${ordinal} House - Lunary`}
        h1={`The ${ordinal} House: ${houseData.keywords.slice(0, 2).join(' & ')}`}
        description={`Learn about the ${ordinal} House in your birth chart and how it influences ${houseData.area.toLowerCase()}.`}
        keywords={[
          `${ordinal} house`,
          houseData.name.toLowerCase(),
          'birth chart',
          'astrology houses',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/birth-chart/houses/${house}`}
        intro={`The ${ordinal} House, known as the ${houseData.name}, governs ${houseData.area}. Ruled by ${houseData.rulingSign} and ${houseData.rulingPlanet}, this ${houseData.element} house reveals important aspects of your life.`}
        tldr={`The ${ordinal} House represents ${houseData.keywords[0].toLowerCase()}. It's ruled by ${houseData.rulingSign} (${houseData.rulingPlanet}).`}
        meaning={`In astrology, the birth chart is divided into twelve houses, each governing different life areas. The ${ordinal} House, or ${houseData.name}, is one of the most important for understanding ${houseData.area.toLowerCase()}.

${houseData.description}

The ${ordinal} House is associated with the ${houseData.element} element and naturally ruled by ${houseData.rulingSign} and its planetary ruler, ${houseData.rulingPlanet}. These associations color the house's expression in your chart.

Key themes of the ${ordinal} House:
${houseData.themes.map((t) => `- ${t}`).join('\n')}

Planets placed in your ${ordinal} House will express their energy through these themes. For example, if you have Venus in the ${ordinal} House, you'll experience Venusian themes of love, beauty, and value through the lens of ${houseData.area.toLowerCase()}.

Understanding your ${ordinal} House helps you navigate its life areas more consciously. The sign on your ${ordinal} House cusp (starting point) also influences how you approach these themes.${extraHouseNotes}`}
        glyphs={[houseData.symbol]}
        emotionalThemes={houseData.keywords}
        howToWorkWith={[
          `Study planets in your ${ordinal} House`,
          `Note the sign on your ${ordinal} House cusp`,
          `Observe transits through your ${ordinal} House`,
          `Work with ${houseData.rulingPlanet} for house support`,
          `Honor ${houseData.element} element practices`,
        ]}
        tables={[
          {
            title: `${ordinal} House Correspondences`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['House Name', houseData.name],
              ['Keywords', houseData.keywords.join(', ')],
              ['Element', houseData.element],
              ['Ruling Sign', houseData.rulingSign],
              ['Ruling Planet', houseData.rulingPlanet],
              ['Life Area', houseData.area],
            ],
          },
        ]}
        journalPrompts={[
          `What planets do I have in my ${ordinal} House?`,
          `How do ${houseData.keywords[0].toLowerCase()} themes show up in my life?`,
          `What sign rules my ${ordinal} House?`,
          `How can I work with my ${ordinal} House energy?`,
        ]}
        relatedItems={[
          {
            name: 'Birth Chart Guide',
            href: '/grimoire/birth-chart',
            type: 'Guide',
          },
          { name: 'Get Your Birth Chart', href: '/birth-chart', type: 'Tool' },
          {
            name: houseData.rulingSign,
            href: `/grimoire/zodiac/${houseData.rulingSign.toLowerCase()}`,
            type: 'Sign',
          },
          ...extraRelatedItems,
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Birth Chart', href: '/grimoire/birth-chart' },
          {
            label: `${ordinal} House`,
            href: `/grimoire/birth-chart/houses/${house}`,
          },
        ]}
        internalLinks={[
          { text: 'Birth Chart Guide', href: '/grimoire/birth-chart' },
          { text: 'Get Your Birth Chart', href: '/birth-chart' },
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
          ...extraInternalLinks,
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Calculate your birth chart'
        ctaHref='/birth-chart'
        faqs={faqs}
      />
    </div>
  );
}
