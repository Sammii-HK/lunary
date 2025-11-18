import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

const lunarNodes = {
  'north-node': {
    name: 'North Node',
    symbol: '☊',
    meaning: 'Life Purpose & Growth',
    description:
      "The North Node (also called the True Node or Dragon's Head) represents your life purpose, soul mission, and the qualities you're here to develop in this lifetime.",
    karmicMeaning:
      "The North Node shows your karmic destiny - the lessons and growth your soul chose to experience. It represents where you're heading and what you're meant to become.",
    inBirthChart:
      "In your birth chart, the North Node reveals your life purpose and the qualities you need to develop. It shows your soul's direction and the path toward growth.",
    howToWorkWith: [
      'Embrace the qualities of your North Node sign',
      'Step out of your comfort zone',
      'Develop new skills and perspectives',
      'Follow your life purpose',
      "Trust your soul's direction",
    ],
    keywords: ['Purpose', 'Growth', 'Destiny', 'Karma', 'Direction'],
  },
  'south-node': {
    name: 'South Node',
    symbol: '☋',
    meaning: 'Past Lives & Comfort Zone',
    description:
      "The South Node (also called the Dragon's Tail) represents your past lives, natural talents, and comfort zone. It shows what you've already mastered.",
    karmicMeaning:
      "The South Node represents your karmic past - the skills, talents, and patterns you've developed in previous lifetimes. It's what comes naturally to you.",
    inBirthChart:
      'In your birth chart, the South Node reveals your past life gifts and comfort zone. While these are natural talents, over-reliance on them can keep you stuck.',
    howToWorkWith: [
      'Recognize your South Node talents',
      'Avoid over-relying on South Node energy',
      'Use South Node gifts to support North Node growth',
      'Release past life patterns that no longer serve',
      'Balance South Node comfort with North Node growth',
    ],
    keywords: ['Past Lives', 'Comfort Zone', 'Natural Talents', 'Karma'],
  },
};

export async function generateStaticParams() {
  return Object.keys(lunarNodes).map((node) => ({
    node: node,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ node: string }>;
}): Promise<Metadata> {
  const { node } = await params;
  const nodeData = lunarNodes[node as keyof typeof lunarNodes];

  if (!nodeData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${nodeData.name} Meaning: Karmic Destiny - Lunary`;
  const description = `Discover the complete guide to ${nodeData.name} (${nodeData.symbol}). Learn about ${nodeData.name} meaning, karmic significance, and how it influences your birth chart and life purpose.`;

  return {
    title,
    description,
    keywords: [
      `${nodeData.name}`,
      `${nodeData.name.toLowerCase()} meaning`,
      `${nodeData.name.toLowerCase()} astrology`,
      `lunar node ${nodeData.name.toLowerCase()}`,
      `${nodeData.name.toLowerCase()} karmic`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/lunar-nodes/${node}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/cosmic',
          width: 1200,
          height: 630,
          alt: `${nodeData.name}`,
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
      canonical: `https://lunary.app/grimoire/lunar-nodes/${node}`,
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

export default async function LunarNodePage({
  params,
}: {
  params: Promise<{ node: string }>;
}) {
  const { node } = await params;
  const nodeData = lunarNodes[node as keyof typeof lunarNodes];

  if (!nodeData) {
    notFound();
  }

  const faqs = [
    {
      question: `What is the ${nodeData.name}?`,
      answer: `The ${nodeData.name} (${nodeData.symbol}) represents ${nodeData.meaning.toLowerCase()}. ${nodeData.description}`,
    },
    {
      question: `What does ${nodeData.name} mean karmically?`,
      answer: `${nodeData.karmicMeaning}`,
    },
    {
      question: `How does ${nodeData.name} affect my birth chart?`,
      answer: `${nodeData.inBirthChart}`,
    },
    {
      question: `How do I work with my ${nodeData.name}?`,
      answer: `To work with your ${nodeData.name}, ${nodeData.howToWorkWith[0]?.toLowerCase() || 'focus on its meaning'}.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${nodeData.name} - Lunary`}
        h1={`${nodeData.name}: Complete Karmic Guide`}
        description={`Discover everything about ${nodeData.name}. Learn about its meaning, karmic significance, and how it influences your life purpose.`}
        keywords={[
          `${nodeData.name}`,
          `${nodeData.name.toLowerCase()} meaning`,
          `${nodeData.name.toLowerCase()} karmic`,
          `lunar node ${nodeData.name.toLowerCase()}`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/lunar-nodes/${node}`}
        intro={`The ${nodeData.name} (${nodeData.symbol}) is one of the two lunar nodes, representing ${nodeData.meaning.toLowerCase()}. ${nodeData.description}`}
        tldr={`${nodeData.name} (${nodeData.symbol}) represents ${nodeData.meaning.toLowerCase()}.`}
        meaning={`The lunar nodes are points where the Moon\'s orbit intersects with the Earth\'s orbit around the Sun. They are always opposite each other and represent karmic destiny and past life patterns.

${nodeData.description}

${nodeData.karmicMeaning}

${nodeData.inBirthChart}

The lunar nodes move backward through the zodiac, completing a full cycle approximately every 18.6 years. Understanding your ${nodeData.name} helps you understand your karmic path and work with your soul\'s purpose consciously.`}
        glyphs={[nodeData.symbol]}
        astrologyCorrespondences={`Lunar Node: ${nodeData.name}
Symbol: ${nodeData.symbol}
Meaning: ${nodeData.meaning}
Keywords: ${nodeData.keywords.join(', ')}`}
        howToWorkWith={nodeData.howToWorkWith}
        journalPrompts={[
          `What does my ${nodeData.name} mean to me?`,
          `How can I work with ${nodeData.name} energy?`,
          `What is my ${nodeData.name} teaching me?`,
          `How does ${nodeData.name} relate to my life purpose?`,
        ]}
        relatedItems={[
          {
            name: node === 'north-node' ? 'South Node' : 'North Node',
            href: `/grimoire/lunar-nodes/${node === 'north-node' ? 'south-node' : 'north-node'}`,
            type: 'Lunar Node',
          },
          {
            name: 'Birth Chart',
            href: '/grimoire/birth-chart',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          { text: 'Calculate Birth Chart', href: '/birth-chart' },
          { text: "View Today's Horoscope", href: '/horoscope' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        faqs={faqs}
      />
    </div>
  );
}
