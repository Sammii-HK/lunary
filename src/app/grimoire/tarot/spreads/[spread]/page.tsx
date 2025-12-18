import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { tarotSpreads } from '@/constants/tarot';
import { stringToKebabCase } from '../../../../../../utils/string';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';

const spreadKeys = Object.keys(tarotSpreads);

// Convert kebab-case slug back to camelCase key
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export async function generateStaticParams() {
  return spreadKeys.map((spread) => ({
    spread: stringToKebabCase(spread),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ spread: string }>;
}) {
  const { spread } = await params;
  const spreadKey = kebabToCamel(spread);
  const spreadData = tarotSpreads[spreadKey as keyof typeof tarotSpreads];

  if (!spreadData) {
    return { title: 'Not Found - Lunary Grimoire' };
  }

  return createGrimoireMetadata({
    title: `${spreadData.name}: How to Read & Interpret - Lunary`,
    description: `Learn the ${spreadData.name} for tarot reading. Discover card positions, interpretations, and tips for accurate readings with this popular tarot spread.`,
    keywords: [
      spreadData.name.toLowerCase(),
      `${spreadData.name.toLowerCase()} tarot`,
      'tarot spread',
      'tarot reading',
      'how to read tarot',
    ],
    url: `https://lunary.app/grimoire/tarot/spreads/${spread}`,
    ogImagePath: '/api/og/grimoire/tarot',
    ogImageAlt: spreadData.name,
  });
}

export default async function TarotSpreadPage({
  params,
}: {
  params: Promise<{ spread: string }>;
}) {
  const { spread } = await params;
  // Convert kebab-case URL slug back to camelCase key
  const spreadKey = kebabToCamel(spread);
  const spreadData = tarotSpreads[spreadKey as keyof typeof tarotSpreads];

  if (!spreadData) {
    notFound();
  }

  const spreadDetails: Record<
    string,
    { positions: string[]; bestFor: string[]; difficulty: string }
  > = {
    threeCard: {
      positions: ['Past', 'Present', 'Future'],
      bestFor: [
        'Quick answers',
        'Daily readings',
        'Simple questions',
        'Beginners',
      ],
      difficulty: 'Beginner',
    },
    fiveCard: {
      positions: ['Past', 'Present', 'Hidden Influences', 'Advice', 'Outcome'],
      bestFor: [
        'Detailed insights',
        'Decision making',
        'Understanding situations',
      ],
      difficulty: 'Beginner-Intermediate',
    },
    sevenCard: {
      positions: [
        'Past',
        'Present',
        'Future',
        'Advice',
        'External Influences',
        'Hopes/Fears',
        'Outcome',
      ],
      bestFor: [
        'Complex situations',
        'Relationship questions',
        'Career decisions',
      ],
      difficulty: 'Intermediate',
    },
    tenCard: {
      positions: [
        'Present',
        'Challenge',
        'Past',
        'Future',
        'Above',
        'Below',
        'Advice',
        'External',
        'Hopes/Fears',
        'Outcome',
      ],
      bestFor: [
        'In-depth analysis',
        'Major life decisions',
        'Comprehensive readings',
      ],
      difficulty: 'Advanced',
    },
    crossSpread: {
      positions: ['Center', 'Above', 'Below', 'Left', 'Right'],
      bestFor: [
        'Balanced perspective',
        'Understanding dynamics',
        'Spiritual questions',
      ],
      difficulty: 'Intermediate',
    },
    yearAhead: {
      positions: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      bestFor: ['New Year readings', 'Annual planning', 'Long-term guidance'],
      difficulty: 'Intermediate',
    },
    pastPresentFuture: {
      positions: ['Past influences', 'Current situation', 'Future potential'],
      bestFor: [
        'Understanding timelines',
        'Quick readings',
        'General guidance',
      ],
      difficulty: 'Beginner',
    },
  };

  const details = spreadDetails[spreadKey] || {
    positions: [],
    bestFor: [],
    difficulty: 'Varies',
  };

  const faqs = [
    {
      question: `What is the ${spreadData.name}?`,
      answer: `The ${spreadData.name} ${spreadData.description.toLowerCase()}`,
    },
    {
      question: `How many cards are in the ${spreadData.name}?`,
      answer: `The ${spreadData.name} uses ${details.positions.length} cards, with positions for ${details.positions.slice(0, 3).join(', ')}.`,
    },
    {
      question: `When should I use the ${spreadData.name}?`,
      answer: `The ${spreadData.name} is best for ${details.bestFor.join(', ').toLowerCase()}.`,
    },
    {
      question: `Is the ${spreadData.name} good for beginners?`,
      answer: `The ${spreadData.name} is rated as ${details.difficulty} difficulty. ${details.difficulty === 'Beginner' ? 'It is an excellent choice for those new to tarot.' : 'It requires some tarot experience for best results.'}`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${spreadData.name} - Lunary`}
        h1={`${spreadData.name}: Complete Guide`}
        description={`Learn the ${spreadData.name} for tarot reading. Discover card positions and interpretations.`}
        keywords={[
          spreadData.name.toLowerCase(),
          `${spreadData.name.toLowerCase()} tarot`,
          'tarot spread',
          'tarot reading',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/tarot/spreads/${spread}`}
        intro={`${spreadData.description}`}
        tldr={`The ${spreadData.name} uses ${details.positions.length} cards and is rated ${details.difficulty} difficulty.`}
        meaning={`Tarot spreads provide structure for readings, with each position offering specific insights. The ${spreadData.name} is a popular layout used by readers worldwide.

${spreadData.description}

This spread works well for ${details.bestFor.join(', ').toLowerCase()}. The ${details.positions.length} positions each reveal different aspects of your question or situation.

Card positions in the ${spreadData.name}:
${details.positions.map((pos, i) => `${i + 1}. ${pos}`).join('\n')}

When using this spread, take time to shuffle while focusing on your question. Lay out the cards in order and read them both individually and in relation to each other. The overall story the cards tell is as important as individual meanings.

${spreadData.instructions.length > 0 ? `Instructions: ${spreadData.instructions.join(' ')}` : ''}`}
        emotionalThemes={['Insight', 'Guidance', 'Clarity', 'Understanding']}
        howToWorkWith={[
          'Shuffle while focusing on your question',
          `Lay out ${details.positions.length} cards in order`,
          'Read each position individually',
          'Consider card relationships',
          'Trust your intuition',
        ]}
        tables={[
          {
            title: `${spreadData.name} Positions`,
            headers: ['Position', 'Meaning'],
            rows: details.positions.map((pos, i) => [String(i + 1), pos]),
          },
        ]}
        journalPrompts={[
          'What question am I seeking guidance on?',
          'How do the cards relate to each other?',
          'What patterns do I notice in this reading?',
          'What actions should I take based on this reading?',
        ]}
        relatedItems={[
          { name: 'Tarot Guide', href: '/grimoire/tarot', type: 'Guide' },
          { name: 'Major Arcana', href: '/grimoire/tarot', type: 'Cards' },
          { name: 'Tarot Reading', href: '/tarot', type: 'Tool' },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Tarot', href: '/grimoire/tarot' },
          { label: spreadData.name, href: `/grimoire/tarot/spreads/${spread}` },
        ]}
        internalLinks={[
          { text: 'Get a Tarot Reading', href: '/tarot' },
          { text: 'Tarot Guide', href: '/grimoire/tarot' },
          { text: 'All Tarot Spreads', href: '/grimoire/tarot/spreads' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Try a ${spreadData.name} reading`}
        ctaHref='/tarot'
        faqs={faqs}
      />
    </div>
  );
}
