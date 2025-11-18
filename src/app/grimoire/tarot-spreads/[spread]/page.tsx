import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { tarotSpreads } from '@/constants/tarot';
import { stringToKebabCase } from '../../../../../utils/string';

// Helper to find spread by slug
function findSpreadBySlug(slug: string) {
  for (const [key, spread] of Object.entries(tarotSpreads)) {
    if (stringToKebabCase(key) === slug.toLowerCase()) {
      return { spread, key };
    }
  }
  return null;
}

// Generate all spread slugs
function getAllSpreadSlugs() {
  return Object.keys(tarotSpreads).map((key) => stringToKebabCase(key));
}

export async function generateStaticParams() {
  return getAllSpreadSlugs().map((slug) => ({
    spread: slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ spread: string }>;
}): Promise<Metadata> {
  const { spread } = await params;
  const spreadData = findSpreadBySlug(spread);

  if (!spreadData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${spreadData.spread.name} Tarot Spread Guide - Lunary`;
  const description = `${spreadData.spread.description} Learn how to use the ${spreadData.spread.name} for accurate tarot readings.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/tarot-spreads/${spread}`,
    },
  };
}

export default async function TarotSpreadPage({
  params,
}: {
  params: Promise<{ spread: string }>;
}) {
  const { spread } = await params;
  const spreadData = findSpreadBySlug(spread);

  if (!spreadData) {
    notFound();
  }

  const instructions = Array.isArray(spreadData.spread.instructions)
    ? spreadData.spread.instructions
    : [];

  const meaning = `The ${spreadData.spread.name} is a powerful tarot spread designed to provide comprehensive insights into your question or situation. ${spreadData.spread.description}

This spread uses multiple card positions, each representing a different aspect or perspective on your question. Understanding how to use this spread effectively helps you gain deeper insights and create more meaningful readings.

Tarot spreads are structured layouts that guide you in interpreting cards. Each position has a specific meaning, helping you explore different facets of your question systematically. The ${spreadData.spread.name} is particularly effective for ${instructions.length > 0 ? 'questions that require multiple perspectives' : 'complex questions that benefit from structured exploration'}.`;

  const howToWorkWith =
    instructions.length > 0
      ? instructions.map(
          (instruction: string, index: number) =>
            `${index + 1}. ${instruction}`,
        )
      : [
          'Shuffle your deck while focusing on your question',
          'Draw cards one at a time, placing them in order',
          'Read each card in relation to its position',
          'Look for connections and patterns between cards',
          'Synthesize the overall story the cards tell',
        ];

  const faqs = [
    {
      question: `How do I use the ${spreadData.spread.name} spread?`,
      answer:
        instructions.length > 0
          ? `Follow these steps: ${instructions.join(' ')}`
          : `Shuffle your deck while focusing on your question, draw cards one at a time placing them in order, and read each card in relation to its position. Look for connections and patterns between cards to create a cohesive reading.`,
    },
    {
      question: `What questions work best with the ${spreadData.spread.name}?`,
      answer: `This spread works best for questions that require multiple perspectives or layers. It's ideal for complex issues, relationship questions, decision-making, and situations where you need to understand different aspects or timeframes.`,
    },
    {
      question: 'How many cards does this spread use?',
      answer: `The ${spreadData.spread.name} uses ${instructions.length} card positions. Each position represents a different aspect of your question, helping you explore the situation comprehensively.`,
    },
  ];

  return (
    <SEOContentTemplate
      title={`${spreadData.spread.name} Tarot Spread Guide - Lunary`}
      h1={`${spreadData.spread.name} Tarot Spread`}
      description={`${spreadData.spread.description} Learn how to use the ${spreadData.spread.name} for accurate tarot readings.`}
      keywords={[
        `${spreadData.spread.name} tarot spread`,
        `${spreadData.spread.name} spread`,
        'tarot spreads',
        'how to use tarot spreads',
        stringToKebabCase(spreadData.spread.name),
      ]}
      canonicalUrl={`https://lunary.app/grimoire/tarot-spreads/${spread}`}
      intro={`The ${spreadData.spread.name} is a powerful tarot spread designed to provide comprehensive insights into your question or situation. This guide covers everything you need to know to use this spread effectively, from preparation to interpretation.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      faqs={faqs}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Tarot', href: '/grimoire/tarot' },
        {
          label: spreadData.spread.name,
          href: `/grimoire/tarot-spreads/${spread}`,
        },
      ]}
      internalLinks={[
        { text: 'Tarot Cards Guide', href: '/grimoire/tarot' },
        {
          text: 'Reversed Cards Guide',
          href: '/grimoire/reversed-cards-guide',
        },
        {
          text: 'Reading Card Combinations',
          href: '/grimoire/card-combinations',
        },
      ]}
    />
  );
}
