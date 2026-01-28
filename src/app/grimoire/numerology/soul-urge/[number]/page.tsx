import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { NumerologyProfileCalculator } from '@/components/grimoire/NumerologyProfileCalculator';
import { soulUrgeNumbers } from '@/constants/grimoire/numerology-extended-data';

// 30-day ISR revalidation
export const revalidate = 2592000;
// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  const numberData = soulUrgeNumbers[number as keyof typeof soulUrgeNumbers];

  if (!numberData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const isMaster = ['11', '22', '33'].includes(number);
  const title = `Soul Urge Number ${number}${isMaster ? ' (Master Number)' : ''}: Complete Guide - Lunary`;
  const description = `Discover your Soul Urge Number ${number} meaning. Learn about your deepest desires, motivations, and what truly fulfills your soul.`;

  return {
    title,
    description,
    keywords: [
      `soul urge number ${number}`,
      `heart's desire number ${number}`,
      `soul urge ${number} meaning`,
      'soul urge number',
      "heart's desire",
      'numerology',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/numerology/soul-urge/${number}`,
      siteName: 'Lunary',
      locale: 'en_US',
      type: 'article',
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/numerology/soul-urge/${number}`,
    },
  };
}

export default async function SoulUrgeNumberPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const numberData = soulUrgeNumbers[number as keyof typeof soulUrgeNumbers];

  if (!numberData) {
    notFound();
  }

  const isMaster = ['11', '22', '33'].includes(number);

  const faqs = [
    {
      question: `What does Soul Urge Number ${number} mean?`,
      answer: `${numberData.name} represents ${numberData.meaning}. ${numberData.description}`,
    },
    {
      question: `What does Soul Urge ${number} desire?`,
      answer: `Soul Urge ${number} desires: ${numberData.desires.slice(0, 3).join('; ')}.`,
    },
    {
      question: `What motivates Soul Urge ${number}?`,
      answer: `Soul Urge ${number} is motivated by: ${numberData.motivations.slice(0, 3).join(', ')}.`,
    },
    {
      question: `How does Soul Urge ${number} behave in relationships?`,
      answer: numberData.inRelationships,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`Soul Urge Number ${number} - Lunary`}
        h1={`Soul Urge Number ${number}: ${numberData.meaning}${isMaster ? ' (Master Number)' : ''}`}
        description={`Discover your Soul Urge Number ${number} meaning. Learn about your deepest desires, motivations, and what truly fulfills your soul.`}
        keywords={[
          `soul urge number ${number}`,
          `heart's desire number ${number}`,
          'soul urge number',
          'numerology',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/numerology/soul-urge/${number}`}
        intro={`${numberData.name} reveals ${numberData.meaning}. ${numberData.description}`}
        tldr={`Soul Urge ${number} represents ${numberData.meaning}. Your soul craves ${numberData.desires[0].toLowerCase()}.`}
        meaning={`Your Soul Urge Number, also known as your Heart's Desire Number, reveals your innermost motivations and what your soul truly craves. This is the private you - the desires you may not even share with others.

${numberData.description}

${isMaster ? `**Master Number Energy**\n\nAs a Master Number, Soul Urge ${number} carries intense spiritual energy and deeper soul purposes. Your desires transcend the ordinary.\n\n` : ''}**Your Deepest Desires**

${numberData.desires.map((d) => `- ${d}`).join('\n')}

**What Motivates You**

${numberData.motivations.map((m) => `- ${m}`).join('\n')}

**In Relationships**

${numberData.inRelationships}`}
        emotionalThemes={numberData.keywords}
        howToWorkWith={[
          `Honor your soul's desire for ${numberData.desires[0].toLowerCase()}`,
          `Seek environments that support ${numberData.motivations[0].toLowerCase()}`,
          'Communicate your deeper needs to loved ones',
          'Make choices aligned with your soul purpose',
          'Trust what truly fulfills you',
        ]}
        journalPrompts={[
          `What does ${numberData.meaning.toLowerCase()} mean to me?`,
          `Am I honoring my soul's desire for ${numberData.desires[0].toLowerCase()}?`,
          `What would my ideal life look like if I fully embraced my soul urge?`,
          `How can I better communicate my deeper needs in relationships?`,
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
            name: 'Karmic Debt Numbers',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          {
            label: 'Soul Urge Numbers',
            href: '/grimoire/numerology/soul-urge',
          },
          {
            label: `Number ${number}`,
            href: `/grimoire/numerology/soul-urge/${number}`,
          },
        ]}
        internalLinks={[
          { text: 'Explore Numerology', href: '/grimoire/numerology' },
          { text: 'Expression Numbers', href: '/grimoire/numerology' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Want personalized numerology insights?'
        ctaHref='/pricing'
        faqs={faqs}
        childrenPosition='before-faqs'
      >
        <NumerologyProfileCalculator />
      </SEOContentTemplate>
    </div>
  );
}
