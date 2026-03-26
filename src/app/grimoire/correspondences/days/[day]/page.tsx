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

const dayNumberMapping: Record<string, number> = {
  Sunday: 1,
  Monday: 2,
  Tuesday: 9,
  Wednesday: 5,
  Thursday: 3,
  Friday: 6,
  Saturday: 8,
};

// Day-specific meta — informational-intent titles matching "wednesday ruling planet" queries
const dayMetaInfo: Record<string, { title: string; description: string }> = {
  Sunday: {
    title: "Sunday's Planet Is the Sun: Meaning, Energy & Magic",
    description:
      'Sunday is ruled by the Sun. What this means for your energy, best activities, spells & rituals. Correspondences, candle colors & timing.',
  },
  Monday: {
    title: "Monday's Planet Is the Moon: Meaning, Energy & Magic",
    description:
      'Monday is ruled by the Moon. What this means for your energy, best activities, spells & rituals. Correspondences, candle colors & timing.',
  },
  Tuesday: {
    title: "Tuesday's Planet Is Mars: Meaning, Energy & Magic",
    description:
      'Tuesday is ruled by Mars. What this means for your energy, best activities, spells & rituals. Correspondences, candle colors & timing.',
  },
  Wednesday: {
    title: "Wednesday's Planet Is Mercury: Meaning, Energy & Magic",
    description:
      'Wednesday is ruled by Mercury. What this means for your energy, best activities, spells & rituals. Correspondences, candle colors & timing.',
  },
  Thursday: {
    title: "Thursday's Planet Is Jupiter: Meaning, Energy & Magic",
    description:
      'Thursday is ruled by Jupiter. What this means for your energy, best activities, spells & rituals. Correspondences, candle colors & timing.',
  },
  Friday: {
    title: "Friday's Planet Is Venus: Meaning, Energy & Magic",
    description:
      'Friday is ruled by Venus. What this means for your energy, best activities, spells & rituals. Correspondences, candle colors & timing.',
  },
  Saturday: {
    title: "Saturday's Planet Is Saturn: Meaning, Energy & Magic",
    description:
      'Saturday is ruled by Saturn. What this means for your energy, best activities, spells & rituals. Correspondences, candle colors & timing.',
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
    title: `${dayKey}'s Planet Is ${dayData.planet}: Meaning, Energy & Magic`,
    description: `${dayKey} is ruled by ${dayData.planet}. What this means for your energy, best activities, spells & rituals. Correspondences, candle colors & timing.`,
  };

  const title = metaInfo.title;
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
  const numerologyNumber = dayNumberMapping[dayKey] ?? 0;

  const meaning = `${dayData.description}

## Numerology & ${dayKey}

In numerology, ${dayKey} resonates with the number ${numerologyNumber}. This number's energy combines with ${dayData.planet}'s influence to shape the day's vibrational qualities. Working with both the planetary and numerical correspondences deepens your alignment with ${dayKey.toLowerCase()}'s energy.

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
      question: `What number is associated with ${dayKey}?`,
      answer: `In numerology, ${dayKey} resonates with the number ${numerologyNumber}. This number's energy combines with ${dayData.planet}'s influence to shape the day's vibrational qualities.`,
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
            ['Numerology Number', String(numerologyNumber)],
            ['Correspondences', dayData.correspondences.join(', ')],
            ['Uses', dayData.uses.join(', ')],
          ],
        },
      ]}
      journalPrompts={[
        `How does ${dayKey}'s energy feel to me?`,
        `What ${dayData.uses[0]?.toLowerCase() || ''} activities can I plan for ${dayKey.toLowerCase()}?`,
        `How can I work with ${dayData.planet} energy?`,
        `What does number ${numerologyNumber} mean in my life?`,
        `How can I honor ${dayKey.toLowerCase()}'s planetary influence?`,
      ]}
    />
  );
}
