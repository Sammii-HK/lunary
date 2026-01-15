import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
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
    {
      question: `How long does it take to heal Karmic Debt ${number}?`,
      answer:
        'It is gradual and ongoing. Progress comes from consistent choices and repeating healthy patterns over time.',
    },
    {
      question: `Can Karmic Debt ${number} affect relationships?`,
      answer:
        'Yes. The lesson often appears through relationships, which give you opportunities to practice new responses.',
    },
    {
      question: `Does Karmic Debt ${number} show up in all charts?`,
      answer:
        'No. Only certain charts contain Karmic Debt numbers, and they highlight specific lessons rather than every life area.',
    },
    {
      question: `What is a simple first step to heal Karmic Debt ${number}?`,
      answer:
        'Choose one recurring pattern and replace it with a small, consistent response you can practice weekly.',
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

${numberData.challenges.map((c) => `- ${c}`).join('\n')}

**Signs the Lesson is Active**

You may notice repeating scenarios, strong emotional reactions, or a feeling that a specific theme keeps returning. These patterns are not punishments; they are invitations to act differently and build new skills.

**Healing the Pattern**

Healing Karmic Debt ${number} is a gradual process. Focus on consistent, grounded choices over dramatic change. Small shifts practiced weekly are more effective than occasional big efforts.

**In Relationships and Work**

Karmic Debt ${number} can show up in close relationships and career choices. When you are aware of the lesson, you can respond with intention instead of habit.

**Practical Steps**

Choose one pattern to work on at a time. Replace it with a simple alternative behavior you can practice consistently. Over time, this rewires the pattern and reduces the charge.

**Signs of Healing**

You may notice calmer reactions, more consistent choices, and fewer repeated conflicts. Healing often feels subtle at first, but the shift becomes clear when you look back over months.

**Supportive Practices**

Pair the lesson with a grounding routine: a weekly reflection, a short affirmation, or a simple boundary. Karmic Debt work is most effective when it is gentle and consistent rather than intense and sporadic.

**Self-Compassion**

Karmic lessons are not punishments. Treat the process as a skill you are learning. Patience and honesty are part of the healing itself.

Support helps. Share your goal with a trusted friend or therapist, and ask for gentle accountability. Progress tends to accelerate when you feel seen and supported.

Avoid perfectionism. The goal is improvement, not a flawless performance. Each small shift counts and builds momentum.

If you feel stuck, return to the lesson and choose one tiny, repeatable action. Momentum builds when the practice is simple enough to keep.

Review your notes monthly to spot patterns and progress. The act of tracking creates clarity and helps you see how far you have come.`}
        emotionalThemes={numberData.keywords}
        howToWorkWith={numberData.howToHeal}
        rituals={[
          'Write the core lesson on paper and place it where you will see it daily.',
          'Choose one healing action from the list and practice it for 30 days.',
          'Light a candle and reflect on one pattern you are ready to release.',
          'End each week by noting a small win related to the lesson.',
          'Create a short mantra you can repeat when the pattern appears.',
        ]}
        journalPrompts={[
          `How does Karmic Debt ${number}'s theme of ${numberData.meaning.toLowerCase()} show up in my life?`,
          `What patterns do I repeat that might relate to this karmic lesson?`,
          `How can I approach ${numberData.meaning.toLowerCase()} differently?`,
          `What would healing this karmic debt look like for me?`,
          'What boundary would support my healing right now?',
          'Where do I already see progress with this lesson?',
          'What small action would break the pattern today?',
          'Who can support me as I work on this lesson?',
        ]}
        tables={[
          {
            title: `Karmic Debt ${number} Snapshot`,
            headers: ['Theme', 'Details'],
            rows: [
              ['Core Meaning', numberData.meaning],
              ['Core Lesson', numberData.lesson],
              ['Challenges', numberData.challenges.slice(0, 3).join(', ')],
              ['Healing Focus', numberData.howToHeal.slice(0, 3).join(', ')],
            ],
          },
          {
            title: 'Balance Check',
            headers: ['In Pattern', 'In Healing'],
            rows: [
              [
                numberData.challenges.slice(0, 2).join(', '),
                numberData.howToHeal.slice(0, 2).join(', '),
              ],
            ],
          },
          {
            title: 'Practice Timeline',
            headers: ['Timeframe', 'Focus'],
            rows: [
              ['Week 1', 'Notice the pattern'],
              ['Weeks 2-4', 'Practice a new response'],
              ['Month 2+', 'Reinforce and review'],
            ],
          },
          {
            title: 'Gentle Reminders',
            headers: ['Reminder', 'Purpose'],
            rows: [
              ['Pause before reacting', 'Create space for choice'],
              ['Name the lesson', 'Stay aware of the theme'],
              ['Choose one small action', 'Build consistency'],
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
      />
    </div>
  );
}
