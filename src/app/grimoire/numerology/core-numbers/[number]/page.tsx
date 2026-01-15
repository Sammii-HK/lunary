import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { lifePathNumbers } from '@/constants/grimoire/numerology-data';

const coreNumberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export async function generateStaticParams() {
  return coreNumberKeys.map((number) => ({
    number: number,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  const numberData = lifePathNumbers[number as keyof typeof lifePathNumbers];

  if (!numberData || !coreNumberKeys.includes(number)) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `Core Number ${number}: ${numberData.meaning} - Numerology Guide | Lunary`;
  const description = `Discover the meaning of Core Number ${number} in numerology. Learn about ${numberData.meaning.toLowerCase()} traits, strengths, challenges, and how this number influences your life path.`;

  return {
    title,
    description,
    keywords: [
      `core number ${number}`,
      `numerology ${number}`,
      `number ${number} meaning`,
      `${numberData.meaning.toLowerCase()} numerology`,
      'numerology guide',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/numerology/core-numbers/${number}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/numerology',
          width: 1200,
          height: 630,
          alt: `Core Number ${number}`,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/api/og/grimoire/numerology'],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/numerology/core-numbers/${number}`,
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

export default async function CoreNumberPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const numberData = lifePathNumbers[number as keyof typeof lifePathNumbers];

  if (!numberData || !coreNumberKeys.includes(number)) {
    notFound();
  }

  const faqs = [
    {
      question: `What does Core Number ${number} mean in numerology?`,
      answer: `Core Number ${number} represents ${numberData.meaning.toLowerCase()}. ${numberData.description}`,
    },
    {
      question: `What are the traits of Core Number ${number}?`,
      answer: `People with Core Number ${number} are typically ${numberData.traits.slice(0, 3).join(', ').toLowerCase()}.`,
    },
    {
      question: `What are the strengths of Core Number ${number}?`,
      answer: `Core Number ${number} strengths include ${numberData.strengths.slice(0, 3).join(', ').toLowerCase()}.`,
    },
    {
      question: `What careers suit Core Number ${number}?`,
      answer: `Core Number ${number} individuals excel in ${numberData.career.slice(0, 3).join(', ').toLowerCase()}.`,
    },
    {
      question: `How is Core Number ${number} different from Life Path ${number}?`,
      answer: `Core numbers and life path numbers share the same fundamental energy. Core Number ${number} represents the base vibrational qualities of ${numberData.meaning.toLowerCase()}, while Life Path ${number} applies these qualities to your life journey and purpose.`,
    },
    {
      question: `How can I work with Core Number ${number} daily?`,
      answer: `Focus on one ${numberData.meaning.toLowerCase()} strength each day and choose one small action that expresses it.`,
    },
    {
      question: `Is Core Number ${number} the same as an Angel Number?`,
      answer:
        'No. Core numbers are foundational numerology meanings, while angel numbers are repeating patterns that carry timing and messages.',
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`Core Number ${number} - Lunary`}
        h1={`Core Number ${number}: ${numberData.meaning}`}
        description={`Discover the meaning of Core Number ${number} in numerology. Learn about ${numberData.meaning.toLowerCase()} traits, strengths, and how this number influences your life.`}
        keywords={[
          `core number ${number}`,
          `numerology ${number}`,
          `number ${number} meaning`,
          `${numberData.meaning.toLowerCase()}`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/numerology/core-numbers/${number}`}
        intro={`Core Number ${number} represents ${numberData.meaning.toLowerCase()}. ${numberData.description}`}
        tldr={`Core Number ${number} embodies ${numberData.meaning.toLowerCase()}. People resonating with this number are ${numberData.traits[0]?.toLowerCase() || 'unique'}.`}
        meaning={`In numerology, core numbers (1-9) are the foundation of all numerological meanings. Each core number carries a distinct vibrational frequency that influences personality, behavior, and life experiences.

Core Number ${number} represents ${numberData.meaning.toLowerCase()}. ${numberData.description}

The energy of ${number} is fundamental in numerology, appearing in life path numbers, destiny numbers, and personal year calculations. Understanding Core Number ${number} helps you:
- Recognize this energy when it appears in your charts
- Understand people who resonate with ${number} energy
- Work with ${number}'s vibration in timing and planning
- Apply ${number}'s qualities to your personal growth

Whether ${number} is prominent in your numerology chart or you're exploring number meanings, understanding Core Number ${number} provides valuable insights into this fundamental numerological energy.

**In Balance vs. Out of Balance**

When you are aligned with Core Number ${number}, the best traits of ${numberData.meaning.toLowerCase()} come forward. When you are out of balance, the challenges can show up more strongly. Recognizing the shift helps you return to center.

**Practical Use**

You can work with Core Number ${number} during planning, habit building, and relationship growth. Lean into the strengths and set simple boundaries around the challenges.

**Working With Repeating Numbers**

If you see ${number} repeating in dates or timing, it can be a cue to lean into the core energy and choose one small action that expresses it.`}
        emotionalThemes={numberData.traits}
        howToWorkWith={[
          `Embrace the ${numberData.meaning.toLowerCase()} energy of ${number}`,
          `Develop strengths: ${numberData.strengths[0]?.toLowerCase() || 'unique abilities'}`,
          `Work on challenges: ${numberData.challenges[0]?.toLowerCase() || 'personal growth'}`,
          `Recognize ${number} energy in others`,
          `Use ${number} days for aligned activities`,
        ]}
        rituals={[
          `Choose one ${number} trait to practice each morning for a week.`,
          'Write a short affirmation that reflects your strongest quality.',
          'Set one boundary that reduces your main challenge.',
          `Schedule key tasks on dates that include ${number} when possible.`,
        ]}
        tables={[
          {
            title: `Core Number ${number} Overview`,
            headers: ['Aspect', 'Description'],
            rows: [
              ['Meaning', numberData.meaning],
              ['Key Traits', numberData.traits.slice(0, 3).join(', ')],
              ['Strengths', numberData.strengths.slice(0, 3).join(', ')],
              ['Challenges', numberData.challenges.slice(0, 3).join(', ')],
              ['Keywords', numberData.keywords.join(', ')],
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
          {
            title: 'Daily Alignment',
            headers: ['Practice', 'Why it helps'],
            rows: [
              ['Name one priority', 'Clarifies the core energy'],
              ['Do one focused task', 'Builds confidence in the number'],
              ['Reflect briefly at night', 'Tracks growth over time'],
            ],
          },
        ]}
        journalPrompts={[
          `How does Core Number ${number} energy appear in my life?`,
          `What ${numberData.meaning.toLowerCase()} qualities do I embody?`,
          `How can I develop ${number}'s strengths?`,
          `What challenges related to ${number} do I face?`,
          `How can I balance ${number} energy in my daily life?`,
          'Where do I see this number reflected in my relationships?',
        ]}
        numerology={`Core Number: ${number}
Meaning: ${numberData.meaning}
Keywords: ${numberData.keywords.join(', ')}`}
        relatedItems={[
          {
            name: `Life Path ${number}`,
            href: `/grimoire/life-path/${number}`,
            type: 'Life Path',
          },
          {
            name: 'Numerology Guide',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: 'Angel Numbers',
            href: '/grimoire/angel-numbers/111',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          { label: 'Core Numbers', href: '/grimoire/numerology/core-numbers' },
          {
            label: `Number ${number}`,
            href: `/grimoire/numerology/core-numbers/${number}`,
          },
        ]}
        internalLinks={[
          { text: 'Explore Numerology', href: '/grimoire/numerology' },
          {
            text: `Life Path ${number}`,
            href: `/grimoire/life-path/${number}`,
          },
          { text: 'Calculate Your Life Path', href: '/birth-chart' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Want to discover your personal numbers?`}
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}
