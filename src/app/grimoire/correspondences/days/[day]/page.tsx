import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
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

  const tableOfContents = [
    { label: 'Planetary Correspondences', href: '#planetary' },
    { label: 'Magical Uses', href: '#uses' },
    { label: 'Ritual Notes', href: '#rituals' },
    { label: 'FAQ', href: '#faq' },
  ];

  const cosmicSections: CosmicConnectionSection[] = [
    {
      title: 'Correspondence Guides',
      links: [
        {
          label: 'Day Correspondences',
          href: '/grimoire/correspondences/days',
        },
        {
          label: 'Color Correspondences',
          href: '/grimoire/correspondences/colors',
        },
        { label: 'Elements', href: '/grimoire/correspondences/elements' },
      ],
    },
    {
      title: 'Practice Tools',
      links: [
        {
          label: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { label: 'Candle Magic', href: '/grimoire/candle-magic' },
        { label: 'Moon Phases', href: '/grimoire/moon/phases' },
      ],
    },
  ];

  const sectionContent = (
    <div className='space-y-10'>
      <section id='planetary'>
        <h2 className='text-3xl font-light text-zinc-100 mb-3'>
          Planetary Correspondences
        </h2>
        <p className='text-sm text-zinc-300'>
          {dayKey} is ruled by {dayData.planet} and aligned with the{' '}
          {dayData.element} element. These correspondences shape its magical
          tone.
        </p>
      </section>

      <section id='uses'>
        <h2 className='text-3xl font-light text-zinc-100 mb-3'>Magical Uses</h2>
        <p className='text-sm text-zinc-300'>
          This day supports {dayData.correspondences.join(', ')} energies, ideal
          for {dayData.uses.join(', ')}.
        </p>
      </section>

      <section id='rituals'>
        <h2 className='text-3xl font-light text-zinc-100 mb-3'>Ritual Notes</h2>
        <ul className='list-disc list-inside text-sm text-zinc-300 space-y-2'>
          <li>
            Plan {dayData.uses[0]} spells for {dayKey.toLowerCase()} dawn.
          </li>
          <li>
            Dress altars with {dayData.element.toLowerCase()} colors, herbs, and
            oils.
          </li>
          <li>
            Light candles during {dayData.planet}-ruled hours for extra potency.
          </li>
        </ul>
      </section>
    </div>
  );

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
      tableOfContents={tableOfContents}
      relatedItems={[
        {
          name: 'Day Correspondences Overview',
          href: '/grimoire/correspondences/days',
          type: 'Guide',
        },
        {
          name: 'Color Correspondences',
          href: '/grimoire/correspondences/colors',
          type: 'Guide',
        },
      ]}
      internalLinks={[
        {
          text: 'Correspondences Overview',
          href: '/grimoire/correspondences',
        },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { text: 'Spells & Rituals', href: '/grimoire/spells' },
        { text: 'Astronomy & Astrology', href: '/grimoire/astronomy' },
      ]}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-correspondences'
          entityKey='correspondences'
          title={`${dayKey} Day Connections`}
          sections={cosmicSections}
        />
      }
      ctaText='Book a timing reading'
      ctaHref='/pricing'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Correspondences', href: '/grimoire/correspondences' },
        { label: 'Days', href: '/grimoire/correspondences/days' },
        {
          label: `${dayKey}`,
          href: `/grimoire/correspondences/days/${day}`,
        },
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
    >
      {sectionContent}
    </SEOContentTemplate>
  );
}
