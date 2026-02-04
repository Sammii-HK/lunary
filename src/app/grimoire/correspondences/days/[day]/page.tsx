import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../../utils/string';

// 30-day ISR revalidation
export const revalidate = 2592000;
const dayKeys = Object.keys(correspondencesData.days);

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

// Day-specific meta descriptions with use cases
const dayMetaInfo: Record<
  string,
  { titleSuffix: string; description: string }
> = {
  Sunday: {
    titleSuffix: 'Sun Day for Success, Vitality & Confidence Spells',
    description:
      'Sunday is ruled by the Sun. Best day for success spells, career magic, confidence rituals, healing work, and leadership. Use gold and yellow candles.',
  },
  Monday: {
    titleSuffix: 'Moon Day for Intuition, Dreams & Emotional Magic',
    description:
      'Monday is ruled by the Moon. Best day for intuition, dream work, psychic development, emotional healing, and lunar magic. Use silver and white candles.',
  },
  Tuesday: {
    titleSuffix: 'Mars Day for Courage, Protection & Strength Spells',
    description:
      'Tuesday is ruled by Mars. Best day for courage spells, protection magic, banishing enemies, physical strength, and overcoming obstacles. Use red candles.',
  },
  Wednesday: {
    titleSuffix: 'Mercury Day for Communication, Travel & Study Magic',
    description:
      'Wednesday is ruled by Mercury. Best day for communication spells, business magic, travel protection, learning, and divination. Use orange and purple candles.',
  },
  Thursday: {
    titleSuffix: 'Jupiter Day for Money, Abundance & Luck Spells',
    description:
      'Thursday is ruled by Jupiter. Best day for money magic, abundance spells, luck rituals, career growth, and legal success. Use blue and purple candles.',
  },
  Friday: {
    titleSuffix: 'Venus Day for Love Spells, Beauty & Self-Care Rituals',
    description:
      'Friday is ruled by Venus. Best day for love spells, beauty magic, relationship healing, self-care rituals, and artistic creativity. Use green and pink candles.',
  },
  Saturday: {
    titleSuffix: 'Saturn Day for Protection, Banishing & Breaking Bad Habits',
    description:
      'Saturday is ruled by Saturn. Best day for protection spells, banishing negativity, breaking bad habits, boundaries, and ancestor work. Use black candles.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ day: string }>;
}): Promise<Metadata> {
  const { day } = await params;
  const dayKey = dayKeys.find(
    (d) => stringToKebabCase(d) === day.toLowerCase(),
  );

  if (!dayKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const dayData =
    correspondencesData.days[dayKey as keyof typeof correspondencesData.days];
  const metaInfo = dayMetaInfo[dayKey] || {
    titleSuffix: `${dayData.planet} Day Correspondences & Magic`,
    description: `Learn about ${dayKey}'s magical correspondences. Discover planetary influences, elemental energy, and optimal spellwork.`,
  };

  const title = `${dayKey}: ${metaInfo.titleSuffix}`;
  const description = metaInfo.description;

  return {
    title,
    description,
    keywords: [
      `${dayKey} magic`,
      `${dayKey.toLowerCase()} correspondences`,
      `planetary day ${dayKey.toLowerCase()}`,
      `${dayData.planet} day`,
      `magic on ${dayKey.toLowerCase()}`,
      `${dayData.uses[0].toLowerCase()} spells`,
      `${dayData.planet.toLowerCase()} magic`,
    ],
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/correspondences/days/${day}`,
    },
  };
}

export default async function DayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day } = await params;
  const dayKey = dayKeys.find(
    (d) => stringToKebabCase(d) === day.toLowerCase(),
  );

  if (!dayKey) {
    notFound();
  }

  const dayData =
    correspondencesData.days[dayKey as keyof typeof correspondencesData.days];

  const meaning = `${dayData.description}

## Best Spells for ${dayKey}

${dayKey} is especially powerful for:
${dayData.bestSpells.map((spell) => `- ${spell}`).join('\n')}

## What to Avoid on ${dayKey}

${dayData.planet} energy may conflict with:
${dayData.avoidSpells.map((spell) => `- ${spell}`).join('\n')}

## Ritual Suggestions

${dayData.ritualSuggestions.map((ritual) => `- ${ritual}`).join('\n')}

## Affirmation

*"${dayData.affirmation}"*

Understanding planetary days helps you time your spellwork for maximum effectiveness. Working with ${dayKey.toLowerCase()}'s energy aligns your magic with cosmic forces, amplifying your intentions.`;

  const howToWorkWith = [
    `Plan ${dayData.uses[0]} spells for ${dayKey.toLowerCase()}`,
    `Work with ${dayData.element.toLowerCase()}-aligned correspondences`,
    `Align with ${dayData.planet} planetary influences`,
    `Use ${dayData.correspondences[0]}-themed ingredients`,
    `Perform ${dayData.uses.join(' and ')} rituals`,
    `Time important magical work for ${dayKey.toLowerCase()}`,
    `Create ${dayKey.toLowerCase()}-themed altars`,
    `Use ${dayData.planet}-ruled crystals and herbs`,
  ];

  const faqs = [
    {
      question: `What planet rules ${dayKey}?`,
      answer: `${dayKey} is ruled by ${dayData.planet} and corresponds to the ${dayData.element} element. This planetary influence makes ${dayKey.toLowerCase()} ideal for ${dayData.uses.join(', ')} magical work.`,
    },
    {
      question: `What spells work best on ${dayKey}?`,
      answer: `${dayKey} is ideal for ${dayData.bestSpells.slice(0, 4).join(', ')} spells. The ${dayData.planet} planetary influence and ${dayData.element.toLowerCase()} element energy support these types of magical work.`,
    },
    {
      question: `What should I avoid on ${dayKey}?`,
      answer: `${dayData.planet} energy may not support ${dayData.avoidSpells.join(', ')} work. If these are your goals, consider a different day or work during a counterbalancing planetary hour.`,
    },
    {
      question: `What colors enhance ${dayKey} magic?`,
      answer: `${dayData.element === 'Fire' ? 'Red, orange, and gold colors' : dayData.element === 'Water' ? 'Blue, silver, and white colors' : dayData.element === 'Air' ? 'Yellow, white, and pale blue colors' : 'Green, brown, and black colors'} enhance ${dayKey} magic due to the ${dayData.element.toLowerCase()} elemental correspondence. ${dayData.planet} planetary colors also work well.`,
    },
    {
      question: `Do I have to do magic on the exact day?`,
      answer: `While planetary days provide optimal timing, you can work magic any day. Planetary days amplify specific energies, but your intention is always most important. Use planetary days as guidance, not strict rules.`,
    },
  ];

  return (
    <SEOContentTemplate
      title={`${dayKey}: Planetary Day Correspondences & Magic - Lunary`}
      h1={`${dayKey} - Planetary Day`}
      description={`Learn about ${dayKey}'s magical correspondences. Discover planetary influences, elemental energy, and optimal spellwork for ${dayKey.toLowerCase()}.`}
      keywords={[
        `${dayKey} magic`,
        `${dayKey.toLowerCase()} correspondences`,
        `planetary day ${dayKey.toLowerCase()}`,
        `${dayData.planet} day`,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/correspondences/days/${day}`}
      intro={`${dayKey} is ruled by ${dayData.planet} and corresponds to the ${dayData.element} element. Understanding ${dayKey.toLowerCase()}'s correspondences helps you time your spellwork for maximum effectiveness and align with cosmic forces.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      faqs={faqs}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Correspondences', href: '/grimoire/correspondences' },
        { label: 'Days', href: '/grimoire/correspondences/days' },
        {
          label: `${dayKey}`,
          href: `/grimoire/correspondences/days/${day}`,
        },
      ]}
      internalLinks={[
        {
          text: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { text: 'Spells & Rituals', href: '/grimoire/spells' },
        { text: 'Astronomy & Astrology', href: '/grimoire/astronomy' },
      ]}
      tables={[
        {
          title: `${dayKey} Correspondences`,
          headers: ['Category', 'Details'],
          rows: [
            ['Planet', dayData.planet],
            ['Element', dayData.element],
            ['Correspondences', dayData.correspondences.join(', ')],
            ['Uses', dayData.uses.join(', ')],
          ],
        },
      ]}
    />
  );
}
