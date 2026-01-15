import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
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

const tableOfContents = [
  { label: 'House Overview', href: '#house-overview' },
  { label: 'Key Themes', href: '#house-themes' },
  { label: 'Practice', href: '#house-practice' },
  { label: 'FAQ', href: '#faq' },
];

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

  const sections = (
    <div className='space-y-10'>
      <section
        id='house-overview'
        className='bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-3'
      >
        <h2 className='text-2xl font-medium text-zinc-100'>House Overview</h2>
        <p className='text-zinc-300'>
          {houseData.name} governs {houseData.area.toLowerCase()} and reflects
          how that energy shows up in your life. The ruling sign{' '}
          {houseData.rulingSign} and {houseData.rulingPlanet} shape its flavor.
        </p>
        <ul className='text-sm text-zinc-400 space-y-1 list-disc list-inside'>
          <li>Element: {houseData.element}</li>
          <li>Keywords: {houseData.keywords.join(', ')}</li>
          <li>Ruling Planet: {houseData.rulingPlanet}</li>
        </ul>
      </section>

      <section
        id='house-themes'
        className='bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-3'
      >
        <h2 className='text-2xl font-medium text-zinc-100'>Key Themes</h2>
        <p className='text-zinc-300 bg-zinc-950/40 border border-zinc-900/50 rounded-xl p-4 text-sm'>
          {houseData.description}
        </p>
        <div className='grid md:grid-cols-2 gap-4 text-sm text-zinc-300'>
          {houseData.themes.map((theme) => (
            <div
              key={theme}
              className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-3'
            >
              <p>{theme}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id='house-practice'
        className='bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-3'
      >
        <h2 className='text-2xl font-medium text-zinc-100'>
          Practice & Reflection
        </h2>
        <ol className='list-decimal list-inside text-zinc-300 space-y-2'>
          <li>
            Note which planets occupy this house; they tell the story in action.
          </li>
          <li>
            Honor the planet that rules this house when working on its life
            area.
          </li>
          <li>Track transits through this cusp to feel the narrative shift.</li>
          <li>
            Journal about how the house themes show up in current projects.
          </li>
        </ol>
      </section>
    </div>
  );

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

Understanding your ${ordinal} House helps you navigate its life areas more consciously. The sign on your ${ordinal} House cusp (starting point) also influences how you approach these themes.`}
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
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Calculate your birth chart'
        ctaHref='/birth-chart'
        cosmicConnections={
          <CosmicConnections
            entityType='house'
            entityKey={houseKey || 'first'}
            title={`${houseData.name} Connections`}
          />
        }
        tableOfContents={tableOfContents}
        faqs={faqs}
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
