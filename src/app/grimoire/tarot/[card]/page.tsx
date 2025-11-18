import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { tarotCards } from '../../../../../utils/tarot/tarot-cards';
import { tarotSuits } from '@/constants/tarot';
import { stringToKebabCase } from '../../../../../utils/string';

// Helper to find card by slug
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

export async function generateStaticParams() {
  return getAllCardSlugs().map((slug) => ({
    card: slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ card: string }>;
}): Promise<Metadata> {
  const { card } = await params;
  const cardData = findCardBySlug(card);

  if (!cardData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${cardData.card.name} Meaning: Upright & Reversed - Lunary`;
  const description = `Discover the complete meaning of ${cardData.card.name} tarot card. Learn about ${cardData.card.name} upright and reversed meanings, symbolism, and how to interpret this card in readings.`;

  return {
    title,
    description,
    keywords: [
      `${cardData.card.name} meaning`,
      `${cardData.card.name} tarot`,
      `${cardData.card.name} card`,
      `${cardData.card.name} upright`,
      `${cardData.card.name} reversed`,
      `tarot ${cardData.card.name}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/tarot/${card}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/cosmic',
          width: 1200,
          height: 630,
          alt: `${cardData.card.name} Tarot Card`,
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
      canonical: `https://lunary.app/grimoire/tarot/${card}`,
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

  // Generate reversed meaning (simplified - would need actual data)
  const reversedMeaning = `When ${cardData.card.name} appears reversed, it suggests blocked or inverted energy. The card's themes may be internalized, delayed, or expressed in unhealthy ways. Consider what obstacles are preventing the upright energy from manifesting.`;

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
      const prevCard =
        suitCards[suitCardKeys[currentIndex - 1] as keyof typeof suitCards];
      relatedCards.push({
        name: prevCard.name,
        href: `/grimoire/tarot/${stringToKebabCase(prevCard.name)}`,
        type: suitInfo?.name || 'Minor Arcana',
      });
    }
    if (currentIndex < suitCardKeys.length - 1) {
      const nextCard =
        suitCards[suitCardKeys[currentIndex + 1] as keyof typeof suitCards];
      relatedCards.push({
        name: nextCard.name,
        href: `/grimoire/tarot/${stringToKebabCase(nextCard.name)}`,
        type: suitInfo?.name || 'Minor Arcana',
      });
    }
  }

  const faqs = [
    {
      question: `What does ${cardData.card.name} mean?`,
      answer: `${cardData.card.name} represents ${cardData.card.keywords.join(', ').toLowerCase()}. ${cardData.card.information}`,
    },
    {
      question: `What does ${cardData.card.name} mean in love?`,
      answer: `In love readings, ${cardData.card.name} suggests ${cardData.card.keywords[0]?.toLowerCase() || 'emotional themes'} in relationships. The specific meaning depends on the question and surrounding cards.`,
    },
    {
      question: `What does ${cardData.card.name} mean in career?`,
      answer: `In career readings, ${cardData.card.name} indicates ${cardData.card.keywords[0]?.toLowerCase() || 'work-related themes'}. Consider how the card's energy applies to your professional life.`,
    },
    {
      question: `What does ${cardData.card.name} reversed mean?`,
      answer: `When ${cardData.card.name} appears reversed, it suggests blocked or inverted energy. ${reversedMeaning}`,
    },
    {
      question: `Is ${cardData.card.name} a positive or negative card?`,
      answer: `${cardData.card.name} can be interpreted as ${cardData.card.keywords.some((k) => ['love', 'success', 'joy', 'harmony'].includes(k.toLowerCase())) ? 'generally positive' : 'neutral or challenging depending on context'}. The meaning depends on the question and surrounding cards.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
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
        intro={`${cardData.card.name} is ${cardData.type === 'major' ? 'a Major Arcana card' : `a ${suitInfo?.name || 'Minor Arcana'} card`} representing ${cardData.card.keywords.join(', ').toLowerCase()}. ${cardData.card.information}`}
        tldr={`${cardData.card.name} represents ${cardData.card.keywords.join(', ').toLowerCase()}.`}
        meaning={`${cardData.card.name} is ${cardData.type === 'major' ? 'one of the 22 Major Arcana cards' : `a ${suitInfo?.name || 'Minor Arcana'} card`} in the tarot deck. ${cardData.type === 'major' ? 'Major Arcana cards represent significant life themes and spiritual lessons.' : suitInfo ? `${suitInfo.name} cards are associated with ${suitInfo.element} element and represent ${suitInfo.qualities.toLowerCase()}.` : ''}

${cardData.card.information}

When ${cardData.card.name} appears in a reading, it brings attention to ${cardData.card.keywords.join(', ').toLowerCase()}. The card's position, surrounding cards, and your question all influence how this energy manifests in your situation.

Understanding ${cardData.card.name} helps you interpret its message in your readings and apply its wisdom to your life.`}
        symbolism={`${cardData.card.name} symbolizes ${cardData.card.keywords.join(', ').toLowerCase()}. The card's imagery and symbolism reflect these themes, offering insights into how this energy manifests in your life.

${cardData.type === 'major' ? 'As a Major Arcana card, ' + cardData.card.name + ' represents significant life themes and karmic lessons.' : suitInfo ? `As a ${suitInfo.name} card, ${cardData.card.name} is associated with ${suitInfo.element} element, representing ${suitInfo.qualities.toLowerCase()}.` : ''}

The card's meaning is enriched by its position in the spread and its relationship to other cards in the reading.`}
        numerology={
          cardData.type === 'major'
            ? `Major Arcana cards are numbered 0-21, each representing a stage in the Fool's Journey. ${cardData.card.name} represents a specific stage in this spiritual journey.`
            : suitInfo
              ? `${suitInfo.name} cards are associated with ${suitInfo.element} element and numbered 1-10, plus court cards. Each number carries numerological significance.`
              : ''
        }
        astrologyCorrespondences={
          cardData.type === 'major'
            ? `Major Arcana cards are associated with astrological signs, planets, and elements. ${cardData.card.name} connects to specific cosmic energies.`
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
        internalLinks={[
          { text: 'Get Daily Tarot Reading', href: '/tarot' },
          { text: 'Explore All Tarot Cards', href: '/grimoire/tarot' },
          { text: 'Learn Tarot Spreads', href: '/grimoire/tarot#spreads' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Want a personalized interpretation of ${cardData.card.name}?`}
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}
