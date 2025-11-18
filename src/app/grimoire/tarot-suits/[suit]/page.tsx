import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { tarotSuits } from '@/constants/tarot';
import { tarotCards } from '../../../../../utils/tarot/tarot-cards';
import { stringToKebabCase } from '../../../../../utils/string';

const suitKeys = Object.keys(tarotSuits);

export async function generateStaticParams() {
  return suitKeys.map((suit) => ({
    suit: stringToKebabCase(suit),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ suit: string }>;
}): Promise<Metadata> {
  const { suit } = await params;
  const suitKey = suitKeys.find(
    (s) => stringToKebabCase(s) === suit.toLowerCase(),
  );

  if (!suitKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const suitData = tarotSuits[suitKey as keyof typeof tarotSuits];
  const title = `${suitData.name} Tarot Suit: ${suitData.element} Element Guide - Lunary`;
  const description = `Discover the complete guide to ${suitData.name} tarot suit (${suitData.element} element). Learn about ${suitData.name} meanings, qualities (${suitData.qualities}), and how to interpret ${suitData.name} cards in readings.`;

  return {
    title,
    description,
    keywords: [
      `${suitData.name} tarot`,
      `${suitData.name} suit`,
      `${suitData.element} element tarot`,
      `${suitData.name} cards`,
      `${suitData.name} meaning`,
      stringToKebabCase(suitData.name),
    ],
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
      canonical: `https://lunary.app/grimoire/tarot-suits/${suit}`,
    },
  };
}

export default async function TarotSuitPage({
  params,
}: {
  params: Promise<{ suit: string }>;
}) {
  const { suit } = await params;
  const suitKey = suitKeys.find(
    (s) => stringToKebabCase(s) === suit.toLowerCase(),
  );

  if (!suitKey) {
    notFound();
  }

  const suitData = tarotSuits[suitKey as keyof typeof tarotSuits];
  const suitCards =
    tarotCards.minorArcana[suitKey as keyof typeof tarotCards.minorArcana];
  const cards = Object.values(suitCards);

  const meaning = `The ${suitData.name} suit is one of the four Minor Arcana suits in the tarot deck, representing the ${suitData.element.toLowerCase()} element. ${suitData.name} cards focus on ${suitData.qualities.toLowerCase()}.

${suitData.mysticalProperties}

The ${suitData.name} suit contains 14 cards: Ace through 10 (pip cards) and four court cards (Page, Knight, Queen, King). Each card in the suit carries the ${suitData.element.toLowerCase()} element's energy while expressing its own unique meaning based on its number or court position.

When ${suitData.name} cards appear in a reading, they bring attention to ${suitData.qualities.toLowerCase()}. The specific card and its position in the spread determine how this energy manifests in your situation.`;

  const howToWorkWith = [
    `Understand that ${suitData.name} cards represent ${suitData.element.toLowerCase()} element energy`,
    `Recognize ${suitData.name} themes: ${suitData.qualities.toLowerCase()}`,
    `Interpret ${suitData.name} cards in context of the spread and question`,
    `Notice when multiple ${suitData.name} cards appear—this emphasizes ${suitData.element.toLowerCase()} energy`,
    `Consider reversed ${suitData.name} cards as blocked or internal ${suitData.element.toLowerCase()} energy`,
    `Use ${suitData.name} correspondences in spellwork and ritual`,
    `Study each ${suitData.name} card individually for deeper understanding`,
    `Notice patterns when ${suitData.name} cards appear with other suits`,
  ];

  const faqs = [
    {
      question: `What does the ${suitData.name} suit represent?`,
      answer: `The ${suitData.name} suit represents the ${suitData.element.toLowerCase()} element and focuses on ${suitData.qualities.toLowerCase()}. ${suitData.mysticalProperties}`,
    },
    {
      question: `How many cards are in the ${suitData.name} suit?`,
      answer: `The ${suitData.name} suit contains 14 cards: Ace through 10 (the pip cards) and four court cards (Page, Knight, Queen, King).`,
    },
    {
      question: `What does it mean when multiple ${suitData.name} cards appear in a reading?`,
      answer: `Multiple ${suitData.name} cards indicate strong emphasis on ${suitData.element.toLowerCase()} energy and ${suitData.qualities.toLowerCase()}. This suggests the situation is primarily about these themes.`,
    },
    {
      question: `How do I interpret reversed ${suitData.name} cards?`,
      answer: `Reversed ${suitData.name} cards typically indicate blocked, internalized, or delayed ${suitData.element.toLowerCase()} energy. The specific meaning depends on the card and its position in the spread.`,
    },
  ];

  return (
    <SEOContentTemplate
      title={`${suitData.name} Tarot Suit: ${suitData.element} Element Guide - Lunary`}
      h1={`${suitData.name} Tarot Suit`}
      description={`Discover the complete guide to ${suitData.name} tarot suit (${suitData.element} element). Learn about ${suitData.name} meanings, qualities, and how to interpret ${suitData.name} cards in readings.`}
      keywords={[
        `${suitData.name} tarot`,
        `${suitData.name} suit`,
        `${suitData.element} element tarot`,
        `${suitData.name} cards`,
        `${suitData.name} meaning`,
        stringToKebabCase(suitData.name),
      ]}
      canonicalUrl={`https://lunary.app/grimoire/tarot-suits/${suit}`}
      intro={`The ${suitData.name} suit is one of the four Minor Arcana suits in the tarot deck, representing the ${suitData.element.toLowerCase()} element. This comprehensive guide covers everything you need to know about ${suitData.name} cards, their meanings, and how to interpret them in tarot readings.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      faqs={faqs}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Tarot', href: '/grimoire/tarot' },
        {
          label: suitData.name,
          href: `/grimoire/tarot-suits/${suit}`,
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
        { text: 'Tarot Spreads', href: '/grimoire/tarot#spreads' },
      ]}
      tables={[
        {
          title: `${suitData.name} Suit Overview`,
          headers: ['Property', 'Value'],
          rows: [
            ['Element', suitData.element],
            ['Qualities', suitData.qualities],
            ['Number of Cards', '14 (Ace-10 + Page, Knight, Queen, King)'],
            ['Suit Type', 'Minor Arcana'],
          ],
        },
      ]}
    />
  );
}
