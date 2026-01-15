import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { NumerologyCalculator } from '@/components/grimoire/NumerologyCalculator';
import {
  expressionNumbers,
  expressionKeys,
} from '@/constants/grimoire/numerology-extended-data';

export async function generateStaticParams() {
  return expressionKeys.map((number) => ({
    number,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  const numberData =
    expressionNumbers[number as keyof typeof expressionNumbers];

  if (!numberData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const isMaster = ['11', '22', '33'].includes(number);
  const title = `Expression Number ${number}${isMaster ? ' (Master Number)' : ''}: Complete Guide - Lunary`;
  const description = `Discover your Expression Number ${number} meaning. Learn about your talents, challenges, ideal careers, and how to fulfill your destiny.`;

  return {
    title,
    description,
    keywords: [
      `expression number ${number}`,
      `destiny number ${number}`,
      `expression number ${number} meaning`,
      'expression number',
      'destiny number',
      'numerology',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/numerology/expression/${number}`,
      siteName: 'Lunary',
      locale: 'en_US',
      type: 'article',
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/numerology/expression/${number}`,
    },
  };
}

export default async function ExpressionNumberPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const numberData =
    expressionNumbers[number as keyof typeof expressionNumbers];

  if (!numberData) {
    notFound();
  }

  const isMaster = ['11', '22', '33'].includes(number);

  const faqs = [
    {
      question: `What does Expression Number ${number} mean?`,
      answer: `${numberData.name} represents ${numberData.meaning}. ${numberData.description}`,
    },
    {
      question: `What are the talents of Expression Number ${number}?`,
      answer: `Expression ${number} talents include: ${numberData.talents.slice(0, 3).join(', ')}.`,
    },
    {
      question: `What careers suit Expression Number ${number}?`,
      answer: `Ideal careers for Expression ${number} include: ${numberData.careers.join(', ')}.`,
    },
    {
      question: `What are the challenges of Expression Number ${number}?`,
      answer: `Expression ${number} challenges include: ${numberData.challenges.slice(0, 3).join(', ')}.`,
    },
    {
      question: `How is Expression Number ${number} calculated?`,
      answer:
        'It is calculated from the letters in your full birth name using numerology letter values.',
    },
    {
      question: `How does Expression ${number} differ from Life Path?`,
      answer:
        'Life Path describes your overall journey, while Expression describes your natural talents and how you show up day to day.',
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`Expression Number ${number} - Lunary`}
        h1={`Expression Number ${number}: ${numberData.meaning}${isMaster ? ' (Master Number)' : ''}`}
        description={`Discover your Expression Number ${number} meaning. Learn about your talents, challenges, ideal careers, and how to fulfill your destiny.`}
        keywords={[
          `expression number ${number}`,
          `destiny number ${number}`,
          'expression number',
          'numerology',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/numerology/expression/${number}`}
        intro={`${numberData.name} embodies ${numberData.meaning}. ${numberData.description}`}
        tldr={`Expression ${number} means ${numberData.meaning}. Your talents include ${numberData.talents[0].toLowerCase()}, and ideal careers involve ${numberData.careers[0].toLowerCase()}.`}
        meaning={`Your Expression Number, also called your Destiny Number, reveals your natural talents and the abilities you are meant to develop in this lifetime. It shows how you express yourself to the world.

${numberData.description}

Expression numbers describe style and gifts, while Life Path numbers describe the broader lesson. If your Expression and Life Path align, your strengths may feel easy to access. If they differ, you may feel pulled to develop new capacities over time.

${isMaster ? `**Master Number Energy**\n\nAs a Master Number, Expression ${number} carries heightened spiritual potential and responsibility. You have access to profound abilities but also face greater challenges.\n\n` : ''}**Your Natural Talents**

${numberData.talents.map((t) => `- ${t}`).join('\n')}

**Potential Challenges**

${numberData.challenges.map((c) => `- ${c}`).join('\n')}

**Ideal Career Paths**

Expression ${number} thrives in careers that allow you to use your natural talents: ${numberData.careers.join(', ')}.

**Relationships and Communication**

Expression ${number} shapes how you speak, decide, and collaborate. When you are in balance, your strengths feel natural and others respond well to your style. When you are out of balance, the same gifts can become exaggerated.

**In Balance vs. Out of Balance**

When aligned, Expression ${number} feels like ${numberData.keywords.slice(0, 3).join(', ').toLowerCase()}. When stressed, the challenges can show up as ${numberData.challenges.slice(0, 2).join(', ').toLowerCase()}.

**Growth Practices**

Focus on one talent at a time and build it into a daily habit. Small, consistent steps help Expression ${number} mature into its best form.

**Expression vs. Soul Urge**

Expression shows how you naturally operate, while Soul Urge shows what you deeply want. If these align, life may feel smoother. If they differ, you can develop skills that support both.

**Practical Application**

Use Expression ${number} to choose roles, projects, and environments where your strengths are valued. When you feel out of place, return to the core strengths and make one adjustment.

**How It Is Calculated**

Expression Numbers are derived from the full birth name. Each letter has a numeric value, and the sum is reduced to a single digit or Master Number. This is why your legal name matters for accurate calculation.

**In Career and Leadership**

Expression ${number} influences how you lead and collaborate. In leadership roles, emphasize your strongest talent and delegate the tasks that highlight your challenges. In creative roles, your Expression shows the style others associate with you.

**Shadow Expression**

When Expression ${number} is under stress, it can overcompensate. Notice when your strengths turn into extremes, and return to balance with small, grounding routines.

**Daily Alignment**

Pick one talent to express deliberately each day. Consistent expression builds confidence and keeps the energy balanced. Small wins count. Track them weekly. Stay consistent.`}
        emotionalThemes={numberData.keywords}
        howToWorkWith={[
          `Develop your natural ${numberData.talents[0].toLowerCase()} abilities`,
          `Be aware of tendency toward ${numberData.challenges[0].toLowerCase()}`,
          `Consider career paths in ${numberData.careers[0].toLowerCase()}`,
          'Honor your unique expression while staying grounded',
          'Use your talents in service to others',
          'Build routines that support your primary talent',
        ]}
        rituals={[
          'Write a one-page statement of your core talents and read it weekly.',
          'Choose one skill to practice for 10 minutes a day for 30 days.',
          'Create a small altar item that represents your Expression Number.',
          'End each day by listing one moment you expressed your strengths.',
          'Ask for feedback from a trusted friend on your natural strengths.',
        ]}
        journalPrompts={[
          `How do I naturally express ${numberData.meaning.toLowerCase()} in my life?`,
          `Which of my talents am I not fully utilizing?`,
          `How can I overcome my tendency toward ${numberData.challenges[0].toLowerCase()}?`,
          `What career path would allow me to express my true nature?`,
          'Where do I feel most confident in my expression?',
          'What feedback do I receive repeatedly from others?',
          'What role or project would showcase my strengths?',
        ]}
        tables={[
          {
            title: `Expression ${number} Snapshot`,
            headers: ['Focus', 'Details'],
            rows: [
              ['Core Meaning', numberData.meaning],
              ['Top Talents', numberData.talents.slice(0, 3).join(', ')],
              ['Challenges', numberData.challenges.slice(0, 3).join(', ')],
              ['Career Fit', numberData.careers.slice(0, 3).join(', ')],
            ],
          },
          {
            title: 'Balance Check',
            headers: ['In Balance', 'Out of Balance'],
            rows: [
              [
                numberData.keywords.slice(0, 2).join(', '),
                numberData.challenges.slice(0, 2).join(', '),
              ],
            ],
          },
          {
            title: 'Expression vs Soul Urge',
            headers: ['Expression', 'Soul Urge'],
            rows: [
              [
                'How you operate and express gifts',
                'What your inner self truly desires',
              ],
            ],
          },
          {
            title: 'Work and Relationships',
            headers: ['Area', 'Focus'],
            rows: [
              ['Work', `Lead with ${numberData.talents[0]}`],
              [
                'Relationships',
                `Communicate through ${numberData.keywords[0]}`,
              ],
            ],
          },
        ]}
        relatedItems={[
          {
            name: 'Life Path Numbers',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: 'Soul Urge Numbers',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: 'Karmic Debt Numbers',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          {
            label: 'Expression Numbers',
            href: '/grimoire/numerology/expression',
          },
          {
            label: `Number ${number}`,
            href: `/grimoire/numerology/expression/${number}`,
          },
        ]}
        internalLinks={[
          { text: 'Explore Numerology', href: '/grimoire/numerology' },
          { text: 'Life Path Numbers', href: '/grimoire/numerology' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Want personalized numerology insights?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <NumerologyCalculator type='expression' />
      </SEOContentTemplate>
    </div>
  );
}
