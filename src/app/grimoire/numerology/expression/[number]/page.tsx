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

${isMaster ? `**Master Number Energy**\n\nAs a Master Number, Expression ${number} carries heightened spiritual potential and responsibility. You have access to profound abilities but also face greater challenges.\n\n` : ''}**Your Natural Talents**

${numberData.talents.map((t) => `- ${t}`).join('\n')}

**Potential Challenges**

${numberData.challenges.map((c) => `- ${c}`).join('\n')}

**Ideal Career Paths**

Expression ${number} thrives in careers that allow you to use your natural talents: ${numberData.careers.join(', ')}.`}
        emotionalThemes={numberData.keywords}
        howToWorkWith={[
          `Develop your natural ${numberData.talents[0].toLowerCase()} abilities`,
          `Be aware of tendency toward ${numberData.challenges[0].toLowerCase()}`,
          `Consider career paths in ${numberData.careers[0].toLowerCase()}`,
          'Honor your unique expression while staying grounded',
          'Use your talents in service to others',
        ]}
        journalPrompts={[
          `How do I naturally express ${numberData.meaning.toLowerCase()} in my life?`,
          `Which of my talents am I not fully utilizing?`,
          `How can I overcome my tendency toward ${numberData.challenges[0].toLowerCase()}?`,
          `What career path would allow me to express my true nature?`,
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
