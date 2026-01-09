import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { NumerologyProfileCalculator } from '@/components/grimoire/NumerologyProfileCalculator';
import { KarmicDebtCalculatorExtras } from '@/components/grimoire/KarmicDebtCalculatorExtras';
import {
  karmicDebtNumbers,
  karmicDebtKeys,
} from '@/constants/grimoire/numerology-extended-data';

export async function generateStaticParams() {
  return karmicDebtKeys.map((number) => ({
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
    karmicDebtNumbers[number as keyof typeof karmicDebtNumbers];

  if (!numberData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `Karmic Debt Number ${number}: Complete Meaning & Healing Guide - Lunary`;
  const description = `Discover the complete meaning of Karmic Debt ${number}. Learn about its challenges, life lessons, and how to heal this karmic pattern.`;

  return {
    title,
    description,
    keywords: [
      `karmic debt ${number}`,
      `karmic debt number ${number} meaning`,
      `numerology ${number}`,
      'karmic debt',
      'past life karma',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/numerology/karmic-debt/${number}`,
      siteName: 'Lunary',
      locale: 'en_US',
      type: 'article',
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/numerology/karmic-debt/${number}`,
    },
  };
}

export default async function KarmicDebtPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const numberData =
    karmicDebtNumbers[number as keyof typeof karmicDebtNumbers];

  if (!numberData) {
    notFound();
  }

  const faqs = [
    {
      question: `What does Karmic Debt ${number} mean?`,
      answer: `${numberData.name} represents ${numberData.meaning.toLowerCase()}. ${numberData.description}`,
    },
    {
      question: `What is the lesson of Karmic Debt ${number}?`,
      answer: numberData.lesson,
    },
    {
      question: `How do I heal Karmic Debt ${number}?`,
      answer: `To heal Karmic Debt ${number}, focus on: ${numberData.howToHeal.slice(0, 3).join(', ')}.`,
    },
    {
      question: `What are the challenges of Karmic Debt ${number}?`,
      answer: `The main challenges of Karmic Debt ${number} include: ${numberData.challenges.slice(0, 3).join(', ')}.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`Karmic Debt ${number} - Lunary`}
        h1={`Karmic Debt Number ${number}: Complete Healing Guide`}
        description={`Discover the complete meaning of Karmic Debt ${number}. Learn about its challenges, life lessons, and how to heal this karmic pattern.`}
        keywords={[
          `karmic debt ${number}`,
          'karmic debt',
          'numerology',
          'past life karma',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/numerology/karmic-debt/${number}`}
        intro={`${numberData.name} carries the energy of ${numberData.meaning.toLowerCase()}. ${numberData.description}`}
        tldr={`Karmic Debt ${number} means ${numberData.meaning.toLowerCase()}. ${numberData.lesson}`}
        meaning={`Karmic Debt numbers in numerology reveal lessons carried over from past lives. When Karmic Debt ${number} appears in your chart, it indicates unfinished business that requires attention in this lifetime.

${numberData.description}

**The Core Lesson**

${numberData.lesson}

**Past Life Origins**

Karmic Debt ${number} often indicates a past life where there were issues around ${numberData.meaning.toLowerCase()}. This life presents opportunities to resolve these patterns.

**Challenges You May Face**

${numberData.challenges.map((c) => `- ${c}`).join('\n')}`}
        emotionalThemes={numberData.keywords}
        howToWorkWith={numberData.howToHeal}
        journalPrompts={[
          `How does Karmic Debt ${number}'s theme of ${numberData.meaning.toLowerCase()} show up in my life?`,
          `What patterns do I repeat that might relate to this karmic lesson?`,
          `How can I approach ${numberData.meaning.toLowerCase()} differently?`,
          `What would healing this karmic debt look like for me?`,
        ]}
        relatedItems={[
          {
            name: 'Life Path Numbers',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: 'Expression Numbers',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: 'Soul Urge Numbers',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          { label: 'Karmic Debt', href: '/grimoire/numerology/karmic-debt' },
          {
            label: `Number ${number}`,
            href: `/grimoire/numerology/karmic-debt/${number}`,
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
        childrenPosition='before-faqs'
      >
        <NumerologyProfileCalculator>
          <KarmicDebtCalculatorExtras />
        </NumerologyProfileCalculator>
      </SEOContentTemplate>
    </div>
  );
}
