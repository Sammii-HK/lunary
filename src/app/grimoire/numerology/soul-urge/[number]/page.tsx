import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { NumerologyCalculator } from '@/components/grimoire/NumerologyCalculator';
import {
  soulUrgeNumbers,
  soulUrgeKeys,
} from '@/constants/grimoire/numerology-extended-data';

export async function generateStaticParams() {
  return soulUrgeKeys.map((number) => ({
    number,
  }));
}

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
    {
      question: `How can I honor Soul Urge ${number} daily?`,
      answer:
        'Choose one small action each day that supports your core desire. Consistency matters more than scale.',
    },
    {
      question: `Can Soul Urge ${number} change over time?`,
      answer:
        'The number stays the same, but how you express it can evolve as you grow.',
    },
    {
      question: `How do I calculate Soul Urge ${number}?`,
      answer:
        'It is calculated from the vowels in your full birth name using numerology letter values.',
    },
    {
      question: `What if my Soul Urge ${number} feels hard to satisfy?`,
      answer:
        'Start with small, consistent choices that honor your desire. Alignment grows through repetition, not perfection.',
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

Soul Urge numbers describe the "why" beneath your choices. Even when your life looks successful, misalignment with this number can feel like restlessness or dissatisfaction.

${isMaster ? `**Master Number Energy**\n\nAs a Master Number, Soul Urge ${number} carries intense spiritual energy and deeper soul purposes. Your desires transcend the ordinary.\n\n` : ''}**Your Deepest Desires**

${numberData.desires.map((d) => `- ${d}`).join('\n')}

**What Motivates You**

${numberData.motivations.map((m) => `- ${m}`).join('\n')}

**In Relationships**

${numberData.inRelationships}

**When You Are Out of Alignment**

When your Soul Urge is ignored, you may feel drained, unfulfilled, or disconnected from your choices. Returning to what nourishes you brings your energy back.

**Daily Alignment**

Small rituals and consistent choices are enough. You do not need a dramatic life change to honor your soul's desire; you need steady attention.

**Soul Urge vs Expression**

Soul Urge is the inner desire, Expression is the outer style. When they support each other, you feel coherent. When they conflict, you may feel pulled in two directions and need to make choices that honor both.

**Signs of Alignment**

When aligned, you feel energized, calm, and clear about next steps. When misaligned, you may feel restless or disconnected from your choices. Use these signals to adjust gently rather than forcing change. Small shifts done weekly add up steadily.`}
        emotionalThemes={numberData.keywords}
        howToWorkWith={[
          `Honor your soul's desire for ${numberData.desires[0].toLowerCase()}`,
          `Seek environments that support ${numberData.motivations[0].toLowerCase()}`,
          'Communicate your deeper needs to loved ones',
          'Make choices aligned with your soul purpose',
          'Trust what truly fulfills you',
        ]}
        rituals={[
          'Write a short list of what truly nourishes you and revisit it weekly.',
          'Choose one small daily action that aligns with your desire.',
          'Set a boundary that protects your energy and time.',
          'End the week by noting where you felt most fulfilled.',
          'Create a simple symbol that represents your soul desire.',
        ]}
        journalPrompts={[
          `What does ${numberData.meaning.toLowerCase()} mean to me?`,
          `Am I honoring my soul's desire for ${numberData.desires[0].toLowerCase()}?`,
          `What would my ideal life look like if I fully embraced my soul urge?`,
          `How can I better communicate my deeper needs in relationships?`,
          'Where do I feel most aligned and alive?',
          'What drains me that I can gently reduce?',
          'What would I do if I trusted my inner desire fully?',
        ]}
        tables={[
          {
            title: `Soul Urge ${number} Snapshot`,
            headers: ['Focus', 'Details'],
            rows: [
              ['Core Meaning', numberData.meaning],
              ['Top Desires', numberData.desires.slice(0, 3).join(', ')],
              ['Motivations', numberData.motivations.slice(0, 3).join(', ')],
              [
                'Relationship Theme',
                numberData.keywords.slice(0, 3).join(', '),
              ],
            ],
          },
          {
            title: 'Alignment Check',
            headers: ['Aligned', 'Misaligned'],
            rows: [
              [
                numberData.motivations.slice(0, 2).join(', '),
                numberData.desires.slice(0, 2).join(', '),
              ],
            ],
          },
          {
            title: 'Supportive Actions',
            headers: ['Action', 'Why it helps'],
            rows: [
              ['Name your desire', 'Clarifies direction'],
              ['Set one boundary', 'Protects energy'],
              ['Schedule time', 'Turns desire into practice'],
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
      >
        <NumerologyCalculator type='soul-urge' />
      </SEOContentTemplate>
    </div>
  );
}
