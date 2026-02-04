import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import {
  zodiacSigns,
  zodiacSymbol,
  zodiacUnicode,
} from '../../../../../utils/zodiac/zodiac';
import { stringToKebabCase } from '../../../../../utils/string';
import {
  getEntityRelationships,
  getWikipediaUrl,
} from '@/constants/entity-relationships';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';
import { createZodiacSignSchema, renderJsonLd } from '@/lib/schema';

// 30-day ISR revalidation
export const revalidate = 2592000;
const signSlugs = Object.keys(zodiacSigns);

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string }>;
}) {
  const { sign } = await params;
  const signKey = signSlugs.find(
    (s) => stringToKebabCase(s) === sign.toLowerCase(),
  );

  if (!signKey) {
    return { title: 'Not Found - Lunary Grimoire' };
  }

  const signData = zodiacSigns[signKey as keyof typeof zodiacSigns];

  // Parse dates for compact format (e.g., "Oct 23 - Nov 21" from "October 23 - November 21")
  const shortDates = signData.dates
    .replace('January', 'Jan')
    .replace('February', 'Feb')
    .replace('March', 'Mar')
    .replace('April', 'Apr')
    .replace('May', 'May')
    .replace('June', 'Jun')
    .replace('July', 'Jul')
    .replace('August', 'Aug')
    .replace('September', 'Sep')
    .replace('October', 'Oct')
    .replace('November', 'Nov')
    .replace('December', 'Dec');

  return createGrimoireMetadata({
    title: `${signData.name} Zodiac Sign: Dates, Traits & Compatibility (${shortDates})`,
    description: `Complete ${signData.name} guide: personality traits, love compatibility, career strengths, and horoscope. Discover the ${signData.element.toLowerCase()} sign's true nature.`,
    keywords: [
      `${signData.name} zodiac sign`,
      `${signData.name} dates`,
      `${signData.name.toLowerCase()} traits`,
      `${signData.name.toLowerCase()} compatibility`,
      `${signData.name.toLowerCase()} horoscope`,
      `when is ${signData.name.toLowerCase()}`,
      `${signData.element} sign`,
      `${signData.name.toLowerCase()} personality`,
    ],
    url: `https://lunary.app/grimoire/zodiac/${sign}`,
    ogImagePath: '/api/og/grimoire/zodiac',
    ogImageAlt: `${signData.name} Zodiac Sign`,
  });
}

export default async function ZodiacSignPage({
  params,
}: {
  params: Promise<{ sign: string }>;
}) {
  const { sign } = await params;
  const signKey = signSlugs.find(
    (s) => stringToKebabCase(s) === sign.toLowerCase(),
  );

  if (!signKey) {
    notFound();
  }

  const signData = zodiacSigns[signKey as keyof typeof zodiacSigns];
  const symbol = zodiacSymbol[signKey as keyof typeof zodiacSymbol];
  const unicodeSymbol = zodiacUnicode[signKey as keyof typeof zodiacUnicode];

  // Generate comprehensive content
  const elementDescriptions: Record<string, string> = {
    Fire: 'Fire signs are passionate, energetic, and action-oriented. They bring enthusiasm, creativity, and a drive to achieve their goals.',
    Earth:
      'Earth signs are practical, grounded, and reliable. They value stability, material security, and tangible results.',
    Air: 'Air signs are intellectual, communicative, and social. They thrive on ideas, communication, and mental stimulation.',
    Water:
      'Water signs are emotional, intuitive, and deeply feeling. They are connected to their emotions, intuition, and the subconscious.',
  };

  const qualityDescriptions: Record<string, string> = {
    Cardinal:
      'Cardinal signs initiate action and are natural leaders. They start new projects and take charge.',
    Fixed:
      'Fixed signs are stable, determined, and persistent. They see things through to completion.',
    Mutable:
      'Mutable signs are adaptable, flexible, and versatile. They can adjust to changing circumstances.',
  };

  // Determine quality (simplified - would need actual dates for precision)
  const cardinalSigns = ['Aries', 'Cancer', 'Libra', 'Capricorn'];
  const fixedSigns = ['Taurus', 'Leo', 'Scorpio', 'Aquarius'];
  const mutableSigns = ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'];
  const mysticalProperties = signData.mysticalProperties.replace(/\.\s*$/, '');
  const quality = cardinalSigns.includes(signData.name)
    ? 'Cardinal'
    : fixedSigns.includes(signData.name)
      ? 'Fixed'
      : 'Mutable';

  const faqs = [
    {
      question: `What are the dates for ${signData.name}?`,
      answer: `${signData.name} dates are ${signData.dates}. If you were born during this period, you are a ${signData.name}.`,
    },
    {
      question: `What element is ${signData.name}?`,
      answer: `${signData.name} is a ${signData.element} sign. ${elementDescriptions[signData.element]}`,
    },
    {
      question: `What are ${signData.name} personality traits?`,
      answer: `${signData.name} is known for ${mysticalProperties.toLowerCase()}. ${signData.name} individuals are typically ${quality.toLowerCase()} in nature, meaning ${qualityDescriptions[quality]}`,
    },
    {
      question: `What is ${signData.name} compatible with?`,
      answer: `${signData.name} is most compatible with other ${signData.element} signs and complementary elements. ${signData.element === 'Fire' ? 'Fire signs work well with Air signs, and Earth signs provide grounding.' : signData.element === 'Earth' ? 'Earth signs harmonize with Water signs, and Fire signs bring passion.' : signData.element === 'Air' ? 'Air signs connect well with Fire signs, and Earth signs offer stability.' : 'Water signs flow well with Earth signs, and Air signs provide mental stimulation.'}`,
    },
    {
      question: `What does ${signData.name} mean spiritually?`,
      answer: `Spiritually, ${signData.name} represents ${signData.mysticalProperties.toLowerCase()}. This sign teaches lessons about ${signData.element.toLowerCase()} energy and how to express it authentically.`,
    },
  ];

  // Compatible signs by element
  const compatibleSigns =
    signData.element === 'Fire'
      ? ['Aries', 'Leo', 'Sagittarius', 'Gemini', 'Libra', 'Aquarius']
      : signData.element === 'Earth'
        ? ['Taurus', 'Virgo', 'Capricorn', 'Cancer', 'Scorpio', 'Pisces']
        : signData.element === 'Air'
          ? ['Gemini', 'Libra', 'Aquarius', 'Aries', 'Leo', 'Sagittarius']
          : ['Cancer', 'Scorpio', 'Pisces', 'Taurus', 'Virgo', 'Capricorn'];

  // Ruling planet mapping
  const rulingPlanets: Record<string, string> = {
    Aries: 'Mars',
    Taurus: 'Venus',
    Gemini: 'Mercury',
    Cancer: 'Moon',
    Leo: 'Sun',
    Virgo: 'Mercury',
    Libra: 'Venus',
    Scorpio: 'Pluto',
    Sagittarius: 'Jupiter',
    Capricorn: 'Saturn',
    Aquarius: 'Uranus',
    Pisces: 'Neptune',
  };

  // Entity schema for Knowledge Graph
  const zodiacSchema = createZodiacSignSchema({
    sign: signData.name,
    element: signData.element,
    modality: quality,
    rulingPlanet: rulingPlanets[signData.name] || 'Unknown',
    dates: signData.dates,
    description: `${signData.name} is a ${signData.element} sign known for ${signData.mysticalProperties.toLowerCase()}`,
    traits: signData.mysticalProperties.split(',').map((t) => t.trim()),
    compatibility: compatibleSigns.slice(0, 4),
    sameAs: getWikipediaUrl('zodiac', signKey),
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(zodiacSchema)}
      <SEOContentTemplate
        title={`${signData.name} Zodiac Sign - Lunary`}
        h1={`${signData.name} Zodiac Sign: Complete Guide`}
        description={`Discover everything about the ${signData.name} zodiac sign. Learn about ${signData.name} traits, dates, element, and mystical properties.`}
        keywords={[
          `${signData.name} zodiac`,
          `${signData.name} sign`,
          `${signData.name} meaning`,
          `${signData.name} traits`,
          `${signData.name} dates`,
          `${signData.element} sign`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/zodiac/${sign}`}
        whatIs={{
          question: `What is ${signData.name}?`,
          answer: `${signData.name} is the ${signSlugs.indexOf(signKey) + 1}${signSlugs.indexOf(signKey) === 0 ? 'st' : signSlugs.indexOf(signKey) === 1 ? 'nd' : signSlugs.indexOf(signKey) === 2 ? 'rd' : 'th'} sign of the zodiac, spanning ${signData.dates}. It is a ${signData.element} sign represented by the symbol ${unicodeSymbol}. ${signData.name} individuals are characterized by ${mysticalProperties}. As a ${quality.toLowerCase()} sign, ${signData.name} ${quality === 'Cardinal' ? 'initiates action and leads' : quality === 'Fixed' ? 'is stable and persistent' : 'adapts and is flexible'}.`,
        }}
        intro={`The ${signData.name} zodiac sign, represented by the symbol ${unicodeSymbol}, is a ${signData.element} sign that governs those born between ${signData.dates}. ${signData.name} is known for ${mysticalProperties.toLowerCase()}.`}
        tldr={`${signData.name} (${signData.dates}) is a ${signData.element} sign representing ${mysticalProperties.toLowerCase()}.`}
        meaning={`${signData.name} is the ${signSlugs.indexOf(signKey) + 1}${signSlugs.indexOf(signKey) === 0 ? 'st' : signSlugs.indexOf(signKey) === 1 ? 'nd' : signSlugs.indexOf(signKey) === 2 ? 'rd' : 'th'} sign of the zodiac, spanning ${signData.dates}. As a ${signData.element} sign, ${signData.name} embodies the qualities of ${elementDescriptions[signData.element].toLowerCase()}

${signData.mysticalProperties}

The ${signData.name} personality is characterized by a ${quality.toLowerCase()} quality, meaning ${qualityDescriptions[quality].toLowerCase()} This influences how ${signData.name} individuals approach life, relationships, and their goals.

In relationships, ${signData.name} brings ${signData.element === 'Fire' ? 'passion and enthusiasm' : signData.element === 'Earth' ? 'stability and reliability' : signData.element === 'Air' ? 'intellectual connection and communication' : 'emotional depth and intuition'}. They value ${signData.element === 'Fire' ? 'independence and adventure' : signData.element === 'Earth' ? 'security and comfort' : signData.element === 'Air' ? 'freedom and mental stimulation' : 'emotional connection and understanding'}.

In career and life purpose, ${signData.name} individuals excel in areas that allow them to express their ${signData.element.toLowerCase()} nature. They are drawn to ${signData.element === 'Fire' ? 'leadership roles, creative fields, and entrepreneurial ventures' : signData.element === 'Earth' ? 'practical careers, financial management, and hands-on work' : signData.element === 'Air' ? 'communication, technology, and intellectual pursuits' : 'healing, creative arts, and intuitive work'}.

Spiritually, ${signData.name} teaches lessons about ${signData.element.toLowerCase()} energy and how to channel it constructively. This sign encourages ${signData.element === 'Fire' ? 'taking action and pursuing passions' : signData.element === 'Earth' ? 'building foundations and creating stability' : signData.element === 'Air' ? 'seeking knowledge and sharing ideas' : 'connecting with emotions and intuition'}.`}
        glyphs={[symbol]}
        emotionalThemes={[
          `${signData.element} emotional expression`,
          `${quality} approach to feelings`,
          `Connection with ${signData.element.toLowerCase()} element`,
          `Emotional needs shaped by ${signData.name} energy`,
        ]}
        howToWorkWith={[
          `Honor your ${signData.name} nature and ${signData.element.toLowerCase()} energy`,
          `Express yourself authentically through ${signData.element.toLowerCase()} activities`,
          `Create space for ${signData.name} traits in your life`,
          `Connect with ${signData.element.toLowerCase()} element practices and rituals`,
          `Embrace the ${quality.toLowerCase()} quality of ${signData.name}`,
        ]}
        signsMostAffected={[signData.name]}
        journalPrompts={[
          `How do I express my ${signData.name} energy in daily life?`,
          `What ${signData.element.toLowerCase()} activities bring me joy?`,
          `How can I honor my ${signData.name} nature more fully?`,
          `What lessons is ${signData.name} teaching me about myself?`,
          `How do I balance my ${signData.name} traits with other aspects of my chart?`,
        ]}
        astrologyCorrespondences={`Element: ${signData.element}
Quality: ${quality}
Ruling Planet: ${signData.rulingPlanet}
Symbol: ${unicodeSymbol}
Dates: ${signData.dates}
Tarot Card: ${signData.tarotCard}`}
        relatedItems={[
          ...getEntityRelationships('zodiac', signKey)
            .slice(0, 5)
            .map((rel) => ({
              name: rel.name,
              href: rel.url,
              type: rel.type.charAt(0).toUpperCase() + rel.type.slice(1),
            })),
          {
            name: signData.tarotCard,
            href: `/grimoire/tarot/${signData.tarotCard.toLowerCase().replace(/\s+/g, '-')}`,
            type: 'Tarot',
          },
          {
            name: 'Birth Chart',
            href: '/grimoire/birth-chart',
            type: 'Guide',
          },
          {
            name: 'Horoscope',
            href: '/horoscope',
            type: 'Daily Reading',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Astronomy & Astrology', href: '/grimoire/astronomy' },
          {
            label: signData.name,
            href: `/grimoire/zodiac/${sign}`,
          },
        ]}
        internalLinks={[
          {
            text: `${signData.name} Daily Horoscope`,
            href: `/grimoire/horoscopes/${signKey.toLowerCase()}`,
          },
          {
            text: `${signData.name} Compatibility`,
            href: `/grimoire/compatibility/${signKey.toLowerCase()}`,
          },
          {
            text: `Moon in ${signData.name}`,
            href: `/grimoire/moon-in/${signKey.toLowerCase()}`,
          },
          {
            text: `${signData.name} Crystals`,
            href: `/grimoire/crystals?sign=${signKey.toLowerCase()}`,
          },
          { text: 'Calculate Birth Chart', href: '/birth-chart' },
          { text: 'All Zodiac Signs', href: '/grimoire/zodiac' },
        ]}
        ctaText={`Want personalized insights for your ${signData.name} chart?`}
        ctaHref='/pricing'
        faqs={faqs}
        cosmicConnections={
          <CosmicConnections
            entityType='sign'
            entityKey={signKey}
            title={`${signData.name} Cosmic Web`}
          />
        }
      />
    </div>
  );
}
