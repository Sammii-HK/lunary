import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../../utils/string';

const dayKeys = Object.keys(correspondencesData.days);

export async function generateStaticParams() {
  return dayKeys.map((day) => ({
    day: stringToKebabCase(day),
  }));
}

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
  const title = `${dayKey}: Planetary Day Correspondences & Magic - Lunary`;
  const description = `Learn about ${dayKey}'s magical correspondences. Discover planetary influences, elemental energy, and optimal spellwork for ${dayKey.toLowerCase()}. Plan your magical timing with planetary days.`;

  return {
    title,
    description,
    keywords: [
      `${dayKey} magic`,
      `${dayKey.toLowerCase()} correspondences`,
      `planetary day ${dayKey.toLowerCase()}`,
      `${dayData.planet} day`,
      `magic on ${dayKey.toLowerCase()}`,
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

  const meaning = `${dayKey} is ruled by ${dayData.planet} and corresponds to the ${dayData.element} element. This planetary day carries specific energetic properties that make it ideal for certain types of magical work.

${dayKey} corresponds to ${dayData.correspondences.join(', ')} energies, making it powerful for ${dayData.uses.join(', ')}. The ${dayData.element.toLowerCase()} element brings ${dayData.element.toLowerCase()}-related qualities to your practice, while ${dayData.planet}'s influence adds planetary power.

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
      answer: `${dayKey} is ideal for ${dayData.uses.join(', ')} spells. The ${dayData.planet} planetary influence and ${dayData.element.toLowerCase()} element energy support these types of magical work.`,
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
          href: '/grimoire/spellcraft-fundamentals',
        },
        { text: 'Spells & Rituals', href: '/grimoire/practices' },
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
