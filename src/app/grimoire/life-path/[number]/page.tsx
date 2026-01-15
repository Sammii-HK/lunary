import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { NumerologyCalculator } from '@/components/grimoire/NumerologyCalculator';
import { lifePathNumbers } from '@/constants/grimoire/numerology-data';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';
import { createCosmicEntitySchema, renderJsonLd } from '@/lib/schema';

const lifePathKeys = Object.keys(lifePathNumbers);

export async function generateStaticParams() {
  return lifePathKeys.map((number) => ({
    number: number,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const numberData = lifePathNumbers[number as keyof typeof lifePathNumbers];

  if (!numberData) {
    return { title: 'Not Found - Lunary Grimoire' };
  }

  return createGrimoireMetadata({
    title: `${numberData.name} Meaning: Traits, Career & Love - Lunary`,
    description: `Discover the complete guide to ${numberData.name}. Learn about ${numberData.name} traits, strengths, challenges, career paths, love compatibility, and how to calculate your life path number.`,
    keywords: [
      `${numberData.name}`,
      `life path ${numberData.number}`,
      `life path number ${numberData.number}`,
      `${numberData.name} traits`,
      `${numberData.name} meaning`,
    ],
    url: `https://lunary.app/grimoire/life-path/${number}`,
    ogImagePath: '/api/og/grimoire/life-path',
    ogImageAlt: `${numberData.name}`,
  });
}

export default async function LifePathNumberPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const numberData = lifePathNumbers[number as keyof typeof lifePathNumbers];

  if (!numberData) {
    notFound();
  }

  const faqs = [
    {
      question: `What does ${numberData.name} mean?`,
      answer: `${numberData.name} represents ${numberData.meaning.toLowerCase()}. ${numberData.description}`,
    },
    {
      question: `What are ${numberData.name} traits?`,
      answer: `${numberData.name} individuals are typically ${numberData.traits.slice(0, 3).join(', ').toLowerCase()}.`,
    },
    {
      question: `What are ${numberData.name} strengths?`,
      answer: `${numberData.name} strengths include ${numberData.strengths.slice(0, 3).join(', ').toLowerCase()}.`,
    },
    {
      question: `What careers suit ${numberData.name}?`,
      answer: `${numberData.name} individuals excel in ${numberData.career.slice(0, 3).join(', ').toLowerCase()}.`,
    },
    {
      question: `How does ${numberData.name} approach love?`,
      answer: `In love, ${numberData.name} individuals ${numberData.love[0]?.toLowerCase() || 'value deep connection'}.`,
    },
  ];

  // Entity schema for Knowledge Graph
  const lifePathSchema = createCosmicEntitySchema({
    name: numberData.name,
    description: `${numberData.name} numerology meaning. Traits: ${numberData.traits.slice(0, 3).join(', ')}. ${numberData.description.slice(0, 100)}...`,
    url: `/grimoire/life-path/${number}`,
    additionalType: 'https://en.wikipedia.org/wiki/Numerology',
    keywords: [
      numberData.name,
      `life path ${number}`,
      'numerology',
      'life path number',
      ...numberData.traits.slice(0, 3),
    ],
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(lifePathSchema)}
      <SEOContentTemplate
        title={`${numberData.name} - Lunary`}
        h1={`${numberData.name}: Complete Guide`}
        description={`Discover everything about ${numberData.name}. Learn about traits, strengths, challenges, career paths, and love compatibility.`}
        keywords={[
          `${numberData.name}`,
          `life path ${numberData.number}`,
          `${numberData.name} traits`,
          `${numberData.name} meaning`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/life-path/${number}`}
        intro={`${numberData.name} represents ${numberData.meaning.toLowerCase()}. ${numberData.description}`}
        tldr={`${numberData.name} is ${numberData.meaning.toLowerCase()}. People with this life path are ${numberData.traits[0]?.toLowerCase() || 'unique'}.`}
        meaning={`Your Life Path Number is one of the most important numbers in numerology, revealing your life's purpose, natural talents, and the lessons you're here to learn. ${numberData.name} represents ${numberData.meaning.toLowerCase()}.

${numberData.description}

Life Path ${numberData.number} individuals are here to learn about ${numberData.meaning.toLowerCase()} and express these qualities in their lives. This number shapes your personality, influences your choices, and guides your path through life.

## How Your Life Path Is Calculated

Your Life Path Number is derived from your full birth date. Each part of the date is reduced to a single digit, then added together and reduced again until you reach a single digit (or a master number like 11 or 22). The resulting number reveals your life theme and the skills you are meant to cultivate.

## Growth Lessons for ${numberData.name}

Every life path comes with strengths and growth edges. For ${numberData.name}, the greatest growth happens when you lean into your natural gifts while staying aware of your tendencies. Awareness helps you balance intensity with patience, ambition with humility, and independence with collaboration.

## Relationships and Communication

Life Path ${numberData.number} shapes how you connect with others. When you are in balance, your traits feel supportive and clear. When you are out of balance, the same traits can feel rigid or overdone. Communication improves when you name your needs directly.

## Career and Purpose

Your life path influences the kinds of environments where you thrive. Use your strengths as a compass when choosing roles, and build habits that support the lesson you are here to learn.

## Daily Alignment

Choose one simple action each day that reflects your core theme. Repetition turns insight into growth, and growth turns the life path into a lived practice.

Understanding your Life Path Number helps you:
- Recognize your natural talents and abilities
- Understand your life's purpose
- Navigate challenges more effectively
- Make choices aligned with your true nature
- Develop your strengths and work on your challenges

Whether ${numberData.number} is your Life Path Number or you're curious about this number's energy, understanding its meaning provides valuable insights into personality, purpose, and potential.

Return to this page seasonally to notice how the theme evolves over time.`}
        emotionalThemes={numberData.traits}
        howToWorkWith={[
          `Embrace your ${numberData.meaning.toLowerCase()} nature`,
          `Develop your strengths: ${numberData.strengths[0]?.toLowerCase() || 'unique abilities'}`,
          `Work on challenges: ${numberData.challenges[0]?.toLowerCase() || 'personal growth'}`,
          `Pursue careers aligned with ${numberData.name}`,
          `Understand your life purpose`,
        ]}
        tables={[
          {
            title: `${numberData.name} Overview`,
            headers: ['Aspect', 'Description'],
            rows: [
              ['Meaning', numberData.meaning],
              ['Key Traits', numberData.traits.slice(0, 3).join(', ')],
              ['Strengths', numberData.strengths.slice(0, 3).join(', ')],
              ['Challenges', numberData.challenges.slice(0, 3).join(', ')],
            ],
          },
          {
            title: `${numberData.name} in Daily Life`,
            headers: ['Area', 'Focus'],
            rows: [
              ['Career', numberData.career.slice(0, 3).join(', ')],
              ['Love', numberData.love.slice(0, 3).join(', ')],
              ['Motivation', numberData.keywords.slice(0, 3).join(', ')],
            ],
          },
          {
            title: 'Balance Check',
            headers: ['In Balance', 'Out of Balance'],
            rows: [
              [
                numberData.strengths.slice(0, 2).join(', '),
                numberData.challenges.slice(0, 2).join(', '),
              ],
            ],
          },
        ]}
        journalPrompts={[
          `How do I express my ${numberData.name} energy?`,
          `What are my natural ${numberData.name} strengths?`,
          `What ${numberData.name} challenges do I face?`,
          `How can I align my career with ${numberData.name}?`,
          `What does ${numberData.name} teach me about my life purpose?`,
          'What small habit would support my life path this month?',
        ]}
        rituals={[
          'Write a short personal mission statement and read it each morning.',
          'Choose a weekly ritual that strengthens your core strengths.',
          'Set one small goal aligned with your life path and track progress.',
          'Create a space with symbols that reflect your life path theme.',
        ]}
        numerology={`Life Path Number: ${numberData.number}
Meaning: ${numberData.meaning}
Keywords: ${numberData.keywords.join(', ')}`}
        relatedItems={[
          {
            name: 'Numerology Guide',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: 'Angel Numbers',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          {
            label: numberData.name,
            href: `/grimoire/life-path/${number}`,
          },
        ]}
        internalLinks={[
          { text: 'Explore Numerology', href: '/grimoire/numerology' },
          { text: 'Calculate Your Life Path', href: '/birth-chart' },
          { text: "View Today's Horoscope", href: '/horoscope' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Want to calculate your Life Path Number?`}
        ctaHref='/pricing'
        faqs={faqs}
      >
        <NumerologyCalculator type='life-path' />
      </SEOContentTemplate>
    </div>
  );
}
