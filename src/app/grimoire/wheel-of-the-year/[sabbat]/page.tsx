import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { wheelOfTheYearSabbats } from '@/constants/sabbats';
import { stringToKebabCase } from '../../../../../utils/string';

export async function generateStaticParams() {
  return wheelOfTheYearSabbats.map((sabbat) => ({
    sabbat: stringToKebabCase(sabbat.name),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sabbat: string }>;
}): Promise<Metadata> {
  const { sabbat } = await params;
  const sabbatData = wheelOfTheYearSabbats.find(
    (s) => stringToKebabCase(s.name) === sabbat.toLowerCase(),
  );

  if (!sabbatData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${sabbatData.name}: Meaning, Rituals & Traditions - Lunary`;
  const description = `Discover ${sabbatData.name} (${sabbatData.date}). Learn about this sabbat's meaning, rituals, traditions, and how to celebrate the Wheel of the Year.`;

  return {
    title,
    description,
    keywords: [
      sabbatData.name.toLowerCase(),
      `${sabbatData.name.toLowerCase()} sabbat`,
      `${sabbatData.name.toLowerCase()} rituals`,
      `${sabbatData.name.toLowerCase()} meaning`,
      'wheel of the year',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/wheel-of-the-year/${sabbat}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/cosmic',
          width: 1200,
          height: 630,
          alt: sabbatData.name,
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
      canonical: `https://lunary.app/grimoire/wheel-of-the-year/${sabbat}`,
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

export default async function SabbatPage({
  params,
}: {
  params: Promise<{ sabbat: string }>;
}) {
  const { sabbat } = await params;
  const sabbatData = wheelOfTheYearSabbats.find(
    (s) => stringToKebabCase(s.name) === sabbat.toLowerCase(),
  );

  if (!sabbatData) {
    notFound();
  }

  const sabbatCorrespondences: Record<
    string,
    { colors: string[]; themes: string[]; activities: string[] }
  > = {
    samhain: {
      colors: ['Black', 'Orange', 'Purple'],
      themes: ['Ancestors', 'Death', 'Divination', 'Transformation'],
      activities: [
        'Honor ancestors',
        'Divination work',
        'Release rituals',
        'Feast for the dead',
      ],
    },
    yule: {
      colors: ['Red', 'Green', 'Gold', 'White'],
      themes: ['Rebirth', 'Light', 'Hope', 'Renewal'],
      activities: [
        'Yule log burning',
        'Gift giving',
        'Decorating with evergreens',
        'Welcoming the returning sun',
      ],
    },
    imbolc: {
      colors: ['White', 'Red', 'Pink'],
      themes: ['Purification', 'New beginnings', 'Inspiration', 'Creativity'],
      activities: [
        'Candle rituals',
        'Spring cleaning',
        'Seed blessing',
        'Brigid devotions',
      ],
    },
    ostara: {
      colors: ['Pastels', 'Green', 'Yellow', 'Pink'],
      themes: ['Balance', 'Fertility', 'Growth', 'New life'],
      activities: [
        'Egg decorating',
        'Planting seeds',
        'Balance rituals',
        'Spring celebrations',
      ],
    },
    beltane: {
      colors: ['Green', 'Red', 'White'],
      themes: ['Fertility', 'Passion', 'Fire', 'Union'],
      activities: [
        'Maypole dancing',
        'Bonfires',
        'Handfasting',
        'Flower crowns',
      ],
    },
    litha: {
      colors: ['Gold', 'Yellow', 'Green'],
      themes: ['Power', 'Abundance', 'Light', 'Vitality'],
      activities: [
        'Sunrise watching',
        'Bonfires',
        'Herb gathering',
        'Solar magic',
      ],
    },
    'lammas-or-lughnasadh': {
      colors: ['Gold', 'Orange', 'Brown'],
      themes: ['Harvest', 'Gratitude', 'Abundance', 'Sacrifice'],
      activities: [
        'Bread baking',
        'First harvest feast',
        'Games and competitions',
        'Grain offerings',
      ],
    },
    mabon: {
      colors: ['Brown', 'Orange', 'Gold', 'Red'],
      themes: ['Balance', 'Thanksgiving', 'Reflection', 'Preparation'],
      activities: [
        'Harvest feast',
        'Apple magic',
        'Gratitude rituals',
        'Wine making',
      ],
    },
  };

  const correspondences = sabbatCorrespondences[sabbat.toLowerCase()] || {
    colors: [],
    themes: [],
    activities: [],
  };

  const faqs = [
    {
      question: `When is ${sabbatData.name}?`,
      answer: `${sabbatData.name} is celebrated on ${sabbatData.date}. ${sabbatData.description}`,
    },
    {
      question: `What is ${sabbatData.name}?`,
      answer: `${sabbatData.name} is one of the eight sabbats on the Wheel of the Year. ${sabbatData.description}`,
    },
    {
      question: `How do you celebrate ${sabbatData.name}?`,
      answer: `${sabbatData.name} can be celebrated through ${correspondences.activities.slice(0, 2).join(' and ').toLowerCase()}. Focus on themes of ${correspondences.themes.join(', ').toLowerCase()}.`,
    },
    {
      question: `What colors represent ${sabbatData.name}?`,
      answer: `${sabbatData.name} is associated with ${correspondences.colors.join(', ')} colors. Use these in altar decorations, candles, and ritual wear.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${sabbatData.name} - Lunary`}
        h1={`${sabbatData.name}: Complete Guide`}
        description={`Discover ${sabbatData.name} (${sabbatData.date}). Learn about this sabbat's meaning, rituals, and traditions.`}
        keywords={[
          sabbatData.name.toLowerCase(),
          `${sabbatData.name.toLowerCase()} sabbat`,
          `${sabbatData.name.toLowerCase()} rituals`,
          'wheel of the year',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/wheel-of-the-year/${sabbat}`}
        intro={`${sabbatData.name} is celebrated on ${sabbatData.date}. ${sabbatData.description}`}
        tldr={`${sabbatData.name} (${sabbatData.date}) celebrates ${correspondences.themes.slice(0, 2).join(' and ').toLowerCase()}.`}
        meaning={`The Wheel of the Year consists of eight sabbats that mark the seasonal cycles and the sun's journey through the year. ${sabbatData.name} holds a special place in this cycle.

${sabbatData.description}

Celebrating ${sabbatData.name} connects you to the natural rhythms of the earth and the turning of the seasons. This sabbat carries themes of ${correspondences.themes.join(', ').toLowerCase()}, making it a powerful time for related magical work.

The traditions associated with ${sabbatData.name} have evolved over centuries, blending ancient pagan practices with modern interpretations. Whether you follow a specific tradition or create your own celebrations, honoring ${sabbatData.name} deepens your connection to the natural world.

Altar decorations for ${sabbatData.name} typically include ${correspondences.colors.join(', ')} colors, seasonal items, and symbols that reflect the sabbat's themes. Creating sacred space for this celebration enhances your experience of the turning wheel.`}
        emotionalThemes={correspondences.themes}
        howToWorkWith={[
          `Decorate your altar with ${correspondences.colors.join(', ')} colors`,
          ...correspondences.activities,
          `Meditate on ${correspondences.themes[0]?.toLowerCase() || 'seasonal'} themes`,
        ]}
        rituals={correspondences.activities}
        tables={[
          {
            title: `${sabbatData.name} Correspondences`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Date', sabbatData.date],
              ['Colors', correspondences.colors.join(', ')],
              ['Themes', correspondences.themes.join(', ')],
              ['Activities', correspondences.activities.join(', ')],
            ],
          },
        ]}
        journalPrompts={[
          `What does ${sabbatData.name} mean to me?`,
          `How can I honor ${correspondences.themes[0]?.toLowerCase() || 'this season'}?`,
          `What am I grateful for this ${sabbatData.name}?`,
          `How has the wheel turned since the last sabbat?`,
        ]}
        relatedItems={[
          {
            name: 'Wheel of the Year',
            href: '/grimoire/wheel-of-the-year',
            type: 'Guide',
          },
          { name: 'Moon Phases', href: '/grimoire/moon', type: 'Guide' },
          { name: 'Horoscope', href: '/horoscope', type: 'Daily Reading' },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
          {
            label: sabbatData.name,
            href: `/grimoire/wheel-of-the-year/${sabbat}`,
          },
        ]}
        internalLinks={[
          {
            text: 'Wheel of the Year Guide',
            href: '/grimoire/wheel-of-the-year',
          },
          { text: 'Moon Phases', href: '/grimoire/moon' },
          { text: 'Spells & Rituals', href: '/grimoire/practices' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Plan your ${sabbatData.name} celebration`}
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}
