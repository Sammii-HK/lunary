import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { TAROT_SPREAD_MAP, type TarotPlan } from '@/constants/tarotSpreads';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';

// 30-day ISR revalidation
export const revalidate = 2592000;
const difficultyLabel: Record<TarotPlan, string> = {
  free: 'Beginner',
  monthly: 'Intermediate',
  yearly: 'Advanced',
};

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ spread: string }>;
}) {
  const { spread } = await params;
  const spreadData = TAROT_SPREAD_MAP[spread];

  if (!spreadData) {
    return { title: 'Not Found - Lunary Grimoire' };
  }

  return createGrimoireMetadata({
    title: `${spreadData.name}: How to Read & Interpret - Lunary`,
    description: spreadData.description,
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
  const spreadData = TAROT_SPREAD_MAP[spread];

  if (!spreadData) {
    notFound();
  }

  const positions = spreadData?.positions ?? [];
  const bestFor = spreadData?.bestFor ?? [];
  const difficulty = difficultyLabel[spreadData.minimumPlan] ?? 'Varies';
  const journalPrompts =
    spreadData.journalPrompts && spreadData.journalPrompts.length > 0
      ? spreadData.journalPrompts
      : ['Reflect on what shifted during the reading.'];

  const samplePositions =
    positions.length > 0
      ? positions
          .slice(0, 3)
          .map((position, index) => `${index + 1}. ${position.label}`)
          .join(', ')
      : '';

  const tables =
    positions.length > 0
      ? [
          {
            title: `${spreadData.name} Positions`,
            headers: ['Position', 'Meaning'],
            rows: positions.map((position) => [
              position.label,
              position.prompt || 'Position meaning coming soon.',
            ]),
          },
        ]
      : [];

  const bestForSentence = bestFor.length
    ? ` It is best for ${bestFor.join(', ')}.`
    : '';
  const intentionSentence = spreadData.intention
    ? ` ${spreadData.intention}`
    : '';
  const meaningCopy = `Tarot spreads provide structure for deeper readings. The ${spreadData.name.toLowerCase()} ${spreadData.description.toLowerCase()}${intentionSentence}${bestForSentence}`;

  const faqs = [
    {
      question: `What is the ${spreadData.name}?`,
      answer: spreadData.description,
    },
    {
      question: `Who benefits from the ${spreadData.name}?`,
      answer: bestFor.length
        ? `This spread is best for ${bestFor.join(', ')}.`
        : 'This spread adds clarity to any thoughtful tarot reading.',
    },
    {
      question: `How do I lay out the ${spreadData.name}?`,
      answer: `Shuffle with intention, lay ${spreadData.cardCount} cards, and read each position in order. ${
        samplePositions
          ? `Start by focusing on ${samplePositions.toLowerCase()}.`
          : ''
      }`,
    },
    {
      question: `How difficult is the ${spreadData.name}?`,
      answer: `${difficulty} level: ${spreadData.estimatedTime} with ${spreadData.cardCount} cards.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${spreadData.name} - Lunary`}
        h1={`${spreadData.name}: Complete Guide`}
        description={spreadData.description}
        keywords={[
          spreadData.name.toLowerCase(),
          `${spreadData.name.toLowerCase()} tarot`,
          'tarot spread',
          'tarot reading',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/tarot/spreads/${spread}`}
        intro={spreadData.description}
        tldr={`The ${spreadData.name} uses ${spreadData.cardCount} cards, takes ${spreadData.estimatedTime}, and is rated ${difficulty}.`}
        meaning={meaningCopy}
        emotionalThemes={['Insight', 'Structure', 'Clarity', 'Presence']}
        howToWorkWith={[
          'Clarify your question or intention before shuffling.',
          `Lay out the ${spreadData.cardCount} cards in the order described.`,
          'Read each card in context of its position and surrounding cards.',
          'Capture your insights in a journal to spot patterns over time.',
        ]}
        tables={tables}
        journalPrompts={journalPrompts}
        relatedItems={[
          { name: 'Tarot Guide', href: '/grimoire/tarot', type: 'Guide' },
          {
            name: 'Tarot Spreads',
            href: '/grimoire/tarot/spreads',
            type: 'Guide',
          },
          { name: 'Tarot Reading', href: '/tarot', type: 'Tool' },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Tarot', href: '/grimoire/tarot' },
          { label: 'Spreads', href: '/grimoire/tarot/spreads' },
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
