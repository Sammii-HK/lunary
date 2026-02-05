import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { TarotKeywords } from '@/components/grimoire/TarotKeywords';
import { tarotCards } from '../../../../../utils/tarot/tarot-cards';
import { tarotSuits } from '@/constants/tarot';
import { stringToKebabCase } from '../../../../../utils/string';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';
import { createTarotCardSchema, renderJsonLd } from '@/lib/schema';
import { getTarotYesNo } from '@/utils/tarot/yes-no';
import { deriveReversedKeywords } from '@/utils/tarot/reversed-keywords';

// Helper to find card by slug

// 30-day ISR revalidation
export const revalidate = 2592000;
function findCardBySlug(slug: string) {
  // Check Major Arcana
  for (const [key, card] of Object.entries(tarotCards.majorArcana)) {
    if (stringToKebabCase(card.name) === slug.toLowerCase()) {
      return { card, type: 'major', suit: null, key };
    }
  }

  // Check Minor Arcana
  for (const [suitKey, suit] of Object.entries(tarotCards.minorArcana)) {
    for (const [key, card] of Object.entries(suit)) {
      if (stringToKebabCase(card.name) === slug.toLowerCase()) {
        return {
          card,
          type: 'minor',
          suit: suitKey,
          key,
        };
      }
    }
  }

  return null;
}

// Generate all card slugs
function getAllCardSlugs() {
  const slugs: string[] = [];

  // Major Arcana
  Object.values(tarotCards.majorArcana).forEach((card) => {
    slugs.push(stringToKebabCase(card.name));
  });

  // Minor Arcana
  Object.values(tarotCards.minorArcana).forEach((suit) => {
    Object.values(suit).forEach((card) => {
      slugs.push(stringToKebabCase(card.name));
    });
  });

  return slugs;
}

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ card: string }>;
}) {
  const { card } = await params;
  const cardData = findCardBySlug(card);

  if (!cardData) {
    return { title: 'Not Found - Lunary Grimoire' };
  }

  return createGrimoireMetadata({
    title: `${cardData.card.name} Tarot Card: Meaning Upright & Reversed - Lunary`,
    description: `Discover the ${cardData.card.name} tarot card: upright & reversed meanings, symbolism & interpretation. Learn what ${cardData.card.name} means in love, career & life readings. Complete card guide.`,
    keywords: [
      `${cardData.card.name} tarot`,
      `${cardData.card.name} tarot card`,
      `${cardData.card.name} meaning`,
      `${cardData.card.name} upright`,
      `${cardData.card.name} reversed`,
      `${cardData.card.name} love`,
      `${cardData.card.name} career`,
      `${cardData.card.name} yes or no`,
      `${cardData.card.name} feelings`,
      `${cardData.card.name} as a person`,
      `${cardData.card.name} advice`,
      `tarot ${cardData.card.name}`,
    ],
    url: `https://lunary.app/grimoire/tarot/${card}`,
    ogImagePath: '/api/og/grimoire/tarot',
    ogImageAlt: `${cardData.card.name} Tarot Card`,
  });
}

export default async function TarotCardPage({
  params,
}: {
  params: Promise<{ card: string }>;
}) {
  const { card } = await params;
  const cardData = findCardBySlug(card);

  if (!cardData) {
    notFound();
  }

  const suitInfo = cardData.suit
    ? tarotSuits[cardData.suit as keyof typeof tarotSuits]
    : null;

  // Use detailed card data if available, otherwise generate generic content
  const cardDetails = cardData.card as {
    name: string;
    keywords: string[];
    information: string;
    number?: number;
    element?: string;
    planet?: string;
    zodiacSign?: string;
    uprightMeaning?: string;
    reversedMeaning?: string;
    symbolism?: string;
    loveMeaning?: string;
    careerMeaning?: string;
    affirmation?: string;
  };

  const reversedMeaning =
    cardDetails.reversedMeaning ||
    `When ${cardData.card.name} appears reversed, it suggests blocked or inverted energy. The card's themes may be internalized, delayed, or expressed in unhealthy ways. Consider what obstacles are preventing the upright energy from manifesting.`;

  const uprightMeaning =
    cardDetails.uprightMeaning || cardData.card.information;

  const symbolismContent =
    cardDetails.symbolism ||
    `${cardData.card.name} symbolizes ${cardData.card.keywords.join(', ').toLowerCase()}. The card's imagery and symbolism reflect these themes, offering insights into how this energy manifests in your life.`;

  const loveMeaning =
    cardDetails.loveMeaning ||
    `In love readings, ${cardData.card.name} suggests ${cardData.card.keywords[0]?.toLowerCase() || 'emotional themes'} in relationships. The specific meaning depends on the question and surrounding cards.`;

  const careerMeaning =
    cardDetails.careerMeaning ||
    `In career readings, ${cardData.card.name} indicates ${cardData.card.keywords[0]?.toLowerCase() || 'work-related themes'}. Consider how the card's energy applies to your professional life.`;

  const feelingsMeaning = `When asking about feelings, ${cardData.card.name} suggests someone is experiencing ${cardData.card.keywords.slice(0, 2).join(' and ').toLowerCase() || 'complex emotions'}. This card often indicates ${cardData.card.keywords[0]?.toLowerCase() || 'deep feelings'} toward you or the situation.`;

  const asPersonMeaning = `As a person, ${cardData.card.name} represents someone who embodies ${cardData.card.keywords.slice(0, 2).join(' and ').toLowerCase() || 'these qualities'}. They may be ${cardData.card.keywords[0]?.toLowerCase() || 'a significant figure'} in your life or someone you aspire to become.`;

  const adviceMeaning = `${cardData.card.name} advises you to embrace ${cardData.card.keywords[0]?.toLowerCase() || 'its energy'}. ${cardData.card.information.split('.')[0]}.`;

  const yesNo = getTarotYesNo({
    name: cardData.card.name,
    type: cardData.type as 'major' | 'minor',
    suit: cardData.suit,
    keywords: cardData.card.keywords,
  });

  // Generate reversed keywords from upright keywords
  const reversedKeywords = deriveReversedKeywords(cardData.card.keywords);

  // Generate related cards (simplified)
  const relatedCards: Array<{ name: string; href: string; type: string }> = [];

  if (cardData.type === 'major') {
    // Add adjacent major arcana cards
    const majorKeys = Object.keys(tarotCards.majorArcana);
    const currentIndex = majorKeys.indexOf(cardData.key);
    if (currentIndex > 0) {
      const prevCard =
        tarotCards.majorArcana[
          majorKeys[currentIndex - 1] as keyof typeof tarotCards.majorArcana
        ];
      relatedCards.push({
        name: prevCard.name,
        href: `/grimoire/tarot/${stringToKebabCase(prevCard.name)}`,
        type: 'Major Arcana',
      });
    }
    if (currentIndex < majorKeys.length - 1) {
      const nextCard =
        tarotCards.majorArcana[
          majorKeys[currentIndex + 1] as keyof typeof tarotCards.majorArcana
        ];
      relatedCards.push({
        name: nextCard.name,
        href: `/grimoire/tarot/${stringToKebabCase(nextCard.name)}`,
        type: 'Major Arcana',
      });
    }
  } else if (cardData.suit) {
    // Add other cards in same suit
    const suitCards =
      tarotCards.minorArcana[
        cardData.suit as keyof typeof tarotCards.minorArcana
      ];
    const suitCardKeys = Object.keys(suitCards);
    const currentIndex = suitCardKeys.indexOf(cardData.key);
    if (currentIndex > 0) {
      const prevKey = suitCardKeys[currentIndex - 1];
      const prevCard = suitCards[prevKey as keyof typeof suitCards] as
        | { name: string }
        | undefined;
      if (prevCard && 'name' in prevCard) {
        relatedCards.push({
          name: prevCard.name,
          href: `/grimoire/tarot/${stringToKebabCase(prevCard.name)}`,
          type: suitInfo?.name || 'Minor Arcana',
        });
      }
    }
    if (currentIndex < suitCardKeys.length - 1) {
      const nextKey = suitCardKeys[currentIndex + 1];
      const nextCard = suitCards[nextKey as keyof typeof suitCards] as
        | { name: string }
        | undefined;
      if (nextCard && 'name' in nextCard) {
        relatedCards.push({
          name: nextCard.name,
          href: `/grimoire/tarot/${stringToKebabCase(nextCard.name)}`,
          type: suitInfo?.name || 'Minor Arcana',
        });
      }
    }
  }

  const faqs = [
    {
      question: `What does ${cardData.card.name} mean?`,
      answer: `${cardData.card.name} represents ${cardData.card.keywords.join(', ').toLowerCase()}. ${cardData.card.information}`,
    },
    {
      question: `What does ${cardData.card.name} mean in love?`,
      answer: loveMeaning,
    },
    {
      question: `What does ${cardData.card.name} mean in career?`,
      answer: careerMeaning,
    },
    {
      question: `What does ${cardData.card.name} reversed mean?`,
      answer: reversedMeaning,
    },
    {
      question: `Is ${cardData.card.name} a positive or negative card?`,
      answer: `${cardData.card.name} can be interpreted as ${cardData.card.keywords.some((k) => ['love', 'success', 'joy', 'harmony'].includes(k.toLowerCase())) ? 'generally positive' : 'neutral or challenging depending on context'}. The meaning depends on the question and surrounding cards.`,
    },
    {
      question: `Is ${cardData.card.name} yes or no?`,
      answer: `Upright: ${yesNo.upright.answer} — ${yesNo.upright.reason} Reversed: ${yesNo.reversed.answer} — ${yesNo.reversed.reason} Best used for simple questions.`,
    },
    {
      question: `What does ${cardData.card.name} mean for feelings?`,
      answer: feelingsMeaning,
    },
    {
      question: `What does ${cardData.card.name} represent as a person?`,
      answer: asPersonMeaning,
    },
    {
      question: `What advice does ${cardData.card.name} give?`,
      answer: adviceMeaning,
    },
    ...(cardDetails.affirmation
      ? [
          {
            question: `What is the affirmation for ${cardData.card.name}?`,
            answer: cardDetails.affirmation,
          },
        ]
      : []),
  ];

  // Entity schema for Knowledge Graph
  const tarotSchema = createTarotCardSchema({
    name: cardData.card.name,
    description:
      cardDetails.information ||
      `${cardData.card.name} is a ${cardData.type === 'major' ? 'Major Arcana' : 'Minor Arcana'} tarot card.`,
    uprightMeaning:
      cardDetails.uprightMeaning || cardData.card.keywords.join(', '),
    reversedMeaning:
      cardDetails.reversedMeaning || 'Reversed meaning varies by context',
    keywords: cardData.card.keywords,
    element: cardDetails.element || suitInfo?.element,
    planet: cardDetails.planet,
    sign: cardDetails.zodiacSign,
    number: cardDetails.number,
    arcana: cardData.type as 'major' | 'minor',
    suit: suitInfo?.name,
  });

  const breadcrumbs = [
    { label: 'Grimoire', href: '/grimoire' },
    { label: 'Tarot', href: '/grimoire/tarot' },
    ...(cardData.suit && suitInfo
      ? [
          { label: 'Suits', href: '/grimoire/tarot/suits' },
          {
            label: suitInfo.name,
            href: `/grimoire/tarot/suits/${cardData.suit}`,
          },
        ]
      : []),
    {
      label: cardData.card.name,
      href: `/grimoire/tarot/${card}`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(tarotSchema)}
      <SEOContentTemplate
        title={`${cardData.card.name} - Lunary`}
        h1={`${cardData.card.name} Meaning: Upright & Reversed`}
        description={`Discover the complete meaning of ${cardData.card.name} tarot card. Learn about upright and reversed meanings, symbolism, and interpretation.`}
        keywords={[
          `${cardData.card.name} meaning`,
          `${cardData.card.name} tarot`,
          `${cardData.card.name} card`,
          `${cardData.card.name} upright`,
          `${cardData.card.name} reversed`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/tarot/${card}`}
        whatIs={{
          question: `What is ${cardData.card.name}?`,
          answer: `${cardData.card.name} is ${cardData.type === 'major' ? 'a Major Arcana tarot card' : `a ${suitInfo?.name || 'Minor Arcana'} tarot card`} representing ${cardData.card.keywords.join(', ').toLowerCase()}. ${cardData.type === 'major' ? 'As one of the 22 Major Arcana cards, it represents significant life themes and spiritual lessons.' : suitInfo ? `Associated with the ${suitInfo.element} element, it relates to ${suitInfo.qualities.toLowerCase()}.` : ''} When this card appears in a reading, it brings attention to themes of ${cardData.card.keywords.slice(0, 3).join(', ').toLowerCase()}.`,
        }}
        intro={`${cardData.card.name} is ${cardData.type === 'major' ? 'a Major Arcana card' : `a ${suitInfo?.name || 'Minor Arcana'} card`} representing ${cardData.card.keywords.join(', ').toLowerCase()}. ${cardData.card.information}`}
        tldr={`${cardData.card.name} represents ${cardData.card.keywords.slice(0, 3).join(', ').toLowerCase()}. Yes/No: ${yesNo.upright.answer}. As feelings: ${cardData.card.keywords[0]?.toLowerCase() || 'complex emotions'}. As a person: someone embodying ${cardData.card.keywords[0]?.toLowerCase() || 'these qualities'}.`}
        meaning={`${cardData.card.name} is ${cardData.type === 'major' ? 'one of the 22 Major Arcana cards' : `a ${suitInfo?.name || 'Minor Arcana'} card`} in the tarot deck. ${cardData.type === 'major' ? 'Major Arcana cards represent significant life themes and spiritual lessons.' : suitInfo ? `${suitInfo.name} cards are associated with ${suitInfo.element} element and represent ${suitInfo.qualities.toLowerCase()}.` : ''}

## Upright Meaning

${uprightMeaning}

## Reversed Meaning

${reversedMeaning}

## Yes or No Guidance

Upright: ${yesNo.upright.answer} — ${yesNo.upright.reason}
Reversed: ${yesNo.reversed.answer} — ${yesNo.reversed.reason}
Best used for simple questions.

## ${cardData.card.name} for Feelings

${feelingsMeaning}

## ${cardData.card.name} as a Person

${asPersonMeaning}

## Advice from ${cardData.card.name}

${adviceMeaning}

When ${cardData.card.name} appears in a reading, it brings attention to ${cardData.card.keywords.join(', ').toLowerCase()}. The card's position, surrounding cards, and your question all influence how this energy manifests in your situation.`}
        symbolism={
          symbolismContent +
          (cardData.type === 'major'
            ? `\n\nAs a Major Arcana card, ${cardData.card.name} represents significant life themes and karmic lessons.`
            : suitInfo
              ? `\n\nAs a ${suitInfo.name} card, ${cardData.card.name} is associated with ${suitInfo.element} element, representing ${suitInfo.qualities.toLowerCase()}.`
              : '')
        }
        numerology={
          cardData.type === 'major'
            ? cardDetails.number !== undefined
              ? `${cardData.card.name} is card number ${cardDetails.number} in the Major Arcana, representing a significant stage in the Fool's Journey. The number ${cardDetails.number} carries its own numerological significance.`
              : `Major Arcana cards are numbered 0-21, each representing a stage in the Fool's Journey. ${cardData.card.name} represents a specific stage in this spiritual journey.`
            : suitInfo
              ? `${suitInfo.name} cards are associated with ${suitInfo.element} element and numbered 1-10, plus court cards. Each number carries numerological significance.`
              : ''
        }
        astrologyCorrespondences={
          cardData.type === 'major'
            ? cardDetails.zodiacSign ||
              cardDetails.planet ||
              cardDetails.element
              ? [
                  cardDetails.zodiacSign &&
                    `Zodiac Sign: ${cardDetails.zodiacSign}`,
                  cardDetails.planet && `Ruling Planet: ${cardDetails.planet}`,
                  cardDetails.element && `Element: ${cardDetails.element}`,
                ]
                  .filter(Boolean)
                  .join('\n')
              : `Major Arcana cards are associated with astrological signs, planets, and elements. ${cardData.card.name} connects to specific cosmic energies.`
            : suitInfo
              ? `Suit: ${suitInfo.name}
Element: ${suitInfo.element}
Qualities: ${suitInfo.qualities}
Mystical Properties: ${suitInfo.mysticalProperties}`
              : ''
        }
        howToWorkWith={[
          `Meditate on ${cardData.card.name}'s symbolism`,
          `Reflect on how ${cardData.card.keywords[0]?.toLowerCase() || "the card's themes"} appear in your life`,
          `Use ${cardData.card.name} energy for guidance`,
          `Work with ${cardData.card.name} in your tarot practice`,
          `Apply ${cardData.card.name}'s wisdom to your situation`,
        ]}
        journalPrompts={[
          `What does ${cardData.card.name} mean to me right now?`,
          `How do I see ${cardData.card.keywords[0]?.toLowerCase() || "the card's themes"} in my life?`,
          `What message is ${cardData.card.name} bringing me?`,
          `How can I work with ${cardData.card.name} energy?`,
          `What does ${cardData.card.name} teach me about myself?`,
        ]}
        relatedItems={[
          ...relatedCards,
          {
            name: 'Yes or No Tarot',
            href: '/grimoire/tarot/yes-or-no',
            type: 'Guide',
          },
          {
            name: 'Tarot Guide',
            href: '/grimoire/tarot',
            type: 'Guide',
          },
          {
            name: 'Daily Tarot',
            href: '/tarot',
            type: 'Reading',
          },
        ]}
        breadcrumbs={breadcrumbs}
        internalLinks={[
          { text: 'Get Daily Tarot Reading', href: '/tarot' },
          { text: 'Explore All Tarot Cards', href: '/grimoire/tarot' },
          { text: 'Learn Tarot Spreads', href: '/grimoire/tarot/spreads' },
          { text: 'Yes or No Tarot Guide', href: '/grimoire/tarot/yes-or-no' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Want a personalized interpretation of ${cardData.card.name}?`}
        ctaHref='/pricing'
        faqs={faqs}
        components={
          <TarotKeywords
            uprightKeywords={cardData.card.keywords}
            reversedKeywords={reversedKeywords}
          />
        }
        cosmicConnections={
          <CosmicConnections
            entityType='tarot'
            entityKey={card}
            title={`${cardData.card.name} Cosmic Connections`}
          />
        }
      />
    </div>
  );
}
