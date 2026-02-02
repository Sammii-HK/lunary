import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

// 30-day ISR revalidation
export const revalidate = 2592000;
const candleColors = {
  red: {
    name: 'Red',
    meanings: ['Passion', 'Love', 'Courage', 'Strength', 'Vitality'],
    uses: [
      'Love spells',
      'Passion magic',
      'Courage rituals',
      'Energy work',
      'Protection',
    ],
    element: 'Fire',
    planet: 'Mars',
    chakra: 'Root',
    day: 'Tuesday',
  },
  pink: {
    name: 'Pink',
    meanings: [
      'Romantic love',
      'Self-love',
      'Friendship',
      'Compassion',
      'Emotional healing',
    ],
    uses: [
      'Romance spells',
      'Self-care rituals',
      'Friendship magic',
      'Heart healing',
      'Nurturing',
    ],
    element: 'Water',
    planet: 'Venus',
    chakra: 'Heart',
    day: 'Friday',
  },
  orange: {
    name: 'Orange',
    meanings: ['Creativity', 'Joy', 'Success', 'Attraction', 'Enthusiasm'],
    uses: [
      'Creative projects',
      'Career success',
      'Attraction magic',
      'Confidence spells',
      'Celebration',
    ],
    element: 'Fire',
    planet: 'Sun/Mercury',
    chakra: 'Sacral',
    day: 'Sunday/Wednesday',
  },
  yellow: {
    name: 'Yellow',
    meanings: [
      'Intellect',
      'Communication',
      'Learning',
      'Clarity',
      'Confidence',
    ],
    uses: [
      'Study magic',
      'Communication spells',
      'Mental clarity',
      'Confidence building',
      'Solar magic',
    ],
    element: 'Air',
    planet: 'Mercury/Sun',
    chakra: 'Solar Plexus',
    day: 'Wednesday/Sunday',
  },
  green: {
    name: 'Green',
    meanings: ['Prosperity', 'Growth', 'Healing', 'Abundance', 'Fertility'],
    uses: [
      'Money spells',
      'Healing rituals',
      'Growth magic',
      'Nature work',
      'Abundance',
    ],
    element: 'Earth',
    planet: 'Venus',
    chakra: 'Heart',
    day: 'Friday',
  },
  blue: {
    name: 'Blue',
    meanings: ['Peace', 'Healing', 'Truth', 'Communication', 'Protection'],
    uses: [
      'Healing spells',
      'Peace rituals',
      'Truth seeking',
      'Communication magic',
      'Calm',
    ],
    element: 'Water',
    planet: 'Jupiter/Moon',
    chakra: 'Throat',
    day: 'Thursday/Monday',
  },
  purple: {
    name: 'Purple',
    meanings: [
      'Spirituality',
      'Psychic power',
      'Wisdom',
      'Royalty',
      'Transformation',
    ],
    uses: [
      'Psychic development',
      'Spiritual work',
      'Wisdom seeking',
      'Power rituals',
      'Divination',
    ],
    element: 'Spirit',
    planet: 'Jupiter/Neptune',
    chakra: 'Third Eye/Crown',
    day: 'Thursday',
  },
  indigo: {
    name: 'Indigo',
    meanings: [
      'Intuition',
      'Deep meditation',
      'Spiritual insight',
      'Karma',
      'Justice',
    ],
    uses: [
      'Deep meditation',
      'Psychic work',
      'Past life work',
      'Justice spells',
      'Spiritual vision',
    ],
    element: 'Spirit',
    planet: 'Saturn',
    chakra: 'Third Eye',
    day: 'Saturday',
  },
  white: {
    name: 'White',
    meanings: ['Purity', 'Protection', 'All purposes', 'Cleansing', 'Truth'],
    uses: [
      'Purification',
      'Protection spells',
      'All-purpose magic',
      'New beginnings',
      'Blessing',
    ],
    element: 'All/Spirit',
    planet: 'Moon',
    chakra: 'Crown',
    day: 'Monday',
  },
  black: {
    name: 'Black',
    meanings: [
      'Protection',
      'Banishing',
      'Absorption',
      'Binding',
      'Transformation',
    ],
    uses: [
      'Banishing spells',
      'Protection magic',
      'Absorbing negativity',
      'Shadow work',
      'Endings',
    ],
    element: 'Earth/Spirit',
    planet: 'Saturn',
    chakra: 'Root',
    day: 'Saturday',
  },
  brown: {
    name: 'Brown',
    meanings: ['Stability', 'Grounding', 'Home', 'Animals', 'Material matters'],
    uses: [
      'Grounding work',
      'Home blessing',
      'Pet magic',
      'Stability spells',
      'Earth magic',
    ],
    element: 'Earth',
    planet: 'Earth',
    chakra: 'Root',
    day: 'Saturday',
  },
  silver: {
    name: 'Silver',
    meanings: [
      'Moon magic',
      'Intuition',
      'Dreams',
      'Feminine energy',
      'Psychic ability',
    ],
    uses: [
      'Lunar rituals',
      'Dream work',
      'Intuition development',
      'Goddess work',
      'Divination',
    ],
    element: 'Water',
    planet: 'Moon',
    chakra: 'Third Eye',
    day: 'Monday',
  },
};

const colorKeys = Object.keys(candleColors);

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ color: string }>;
}): Promise<Metadata> {
  const { color } = await params;
  const colorData = candleColors[color as keyof typeof candleColors];

  if (!colorData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${colorData.name} Candle Magic: Meaning & Spells - Lunary`;
  const description = `Discover ${colorData.name.toLowerCase()} candle magic: meaning, properties & spells. Learn how to use ${colorData.name.toLowerCase()} candles for ${colorData.meanings.slice(0, 2).join(' & ').toLowerCase()}. Complete color magic guide with rituals.`;

  return {
    title,
    description,
    keywords: [
      `${colorData.name.toLowerCase()} candle`,
      `${colorData.name.toLowerCase()} candle magic`,
      `${colorData.name.toLowerCase()} candle meaning`,
      'candle magic',
      'candle spells',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/candle-magic/colors/${color}`,
      siteName: 'Lunary',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/candle-magic/colors/${color}`,
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

export default async function CandleColorPage({
  params,
}: {
  params: Promise<{ color: string }>;
}) {
  const { color } = await params;
  const colorData = candleColors[color as keyof typeof candleColors];

  if (!colorData) {
    notFound();
  }

  const faqs = [
    {
      question: `What does a ${colorData.name.toLowerCase()} candle mean?`,
      answer: `${colorData.name} candles represent ${colorData.meanings.join(', ').toLowerCase()}. They are used in magic for ${colorData.uses.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
    {
      question: `When should I use a ${colorData.name.toLowerCase()} candle?`,
      answer: `Use ${colorData.name.toLowerCase()} candles for ${colorData.uses.join(', ').toLowerCase()}. The best day is ${colorData.day} (${colorData.planet} day).`,
    },
    {
      question: `What element is associated with ${colorData.name.toLowerCase()} candles?`,
      answer: `${colorData.name} candles are associated with the ${colorData.element} element and the ${colorData.chakra} chakra.`,
    },
    {
      question: `What planet rules ${colorData.name.toLowerCase()} candle magic?`,
      answer: `${colorData.name} candles are ruled by ${colorData.planet}. Work with them on ${colorData.day} for enhanced power.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${colorData.name} Candle Magic - Lunary`}
        h1={`${colorData.name} Candle Magic: Complete Guide`}
        description={`Learn ${colorData.name.toLowerCase()} candle magic meanings, correspondences, and spell uses.`}
        keywords={[
          `${colorData.name.toLowerCase()} candle`,
          'candle magic',
          'candle spells',
          'color magic',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/candle-magic/colors/${color}`}
        intro={`${colorData.name} candles are powerful tools for ${colorData.meanings.slice(0, 2).join(' and ').toLowerCase()} magic. Associated with ${colorData.planet} and the ${colorData.element} element, ${colorData.name.toLowerCase()} candles are essential for ${colorData.uses[0].toLowerCase()}.`}
        tldr={`${colorData.name} candles represent ${colorData.meanings[0].toLowerCase()}. Use on ${colorData.day} for ${colorData.uses[0].toLowerCase()}.`}
        meaning={`Candle magic is one of the most accessible and powerful forms of spell work. The color of your candle carries specific vibrations and correspondences that align with different intentions and outcomes.

${colorData.name} candles embody the energies of ${colorData.meanings.join(', ').toLowerCase()}. When you light a ${colorData.name.toLowerCase()} candle, you invoke these qualities and direct them toward your magical intention.

Correspondences for ${colorData.name} candles:
- Element: ${colorData.element}
- Planet: ${colorData.planet}
- Chakra: ${colorData.chakra}
- Best Day: ${colorData.day}

${colorData.name} candles are ideal for:
${colorData.uses.map((u) => `- ${u}`).join('\n')}

When working with ${colorData.name.toLowerCase()} candles, focus your intention clearly. You may dress the candle with corresponding oils, carve symbols or words into the wax, and speak incantations as the candle burns.`}
        emotionalThemes={colorData.meanings}
        howToWorkWith={[
          `Light ${colorData.name.toLowerCase()} candles on ${colorData.day}`,
          `Focus on ${colorData.meanings[0].toLowerCase()} intentions`,
          'Dress with corresponding oils if desired',
          'Carve symbols or words into the wax',
          'Speak your intention as you light',
          'Allow to burn completely when safe',
        ]}
        tables={[
          {
            title: `${colorData.name} Candle Correspondences`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Meanings', colorData.meanings.join(', ')],
              ['Element', colorData.element],
              ['Planet', colorData.planet],
              ['Chakra', colorData.chakra],
              ['Day', colorData.day],
              ['Uses', colorData.uses.join(', ')],
            ],
          },
        ]}
        journalPrompts={[
          `What ${colorData.meanings[0].toLowerCase()} intentions do I have?`,
          `How can ${colorData.name.toLowerCase()} candle magic support my goals?`,
          'What results have I seen from candle magic?',
          'What other correspondences can I combine?',
        ]}
        relatedItems={[
          {
            name: 'Candle Magic Guide',
            href: '/grimoire/candle-magic',
            type: 'Guide',
          },
          {
            name: 'Color Correspondences',
            href: '/grimoire/correspondences',
            type: 'Guide',
          },
          {
            name: 'Spells & Rituals',
            href: '/grimoire/spells',
            type: 'Practice',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Candle Magic', href: '/grimoire/candle-magic' },
          {
            label: `${colorData.name} Candles`,
            href: `/grimoire/candle-magic/colors/${color}`,
          },
        ]}
        internalLinks={[
          { text: 'Candle Magic Guide', href: '/grimoire/candle-magic' },
          { text: 'Color Correspondences', href: '/grimoire/correspondences' },
          { text: 'Spells & Rituals', href: '/grimoire/spells' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Explore more candle magic'
        ctaHref='/grimoire/candle-magic'
        faqs={faqs}
      />
    </div>
  );
}
