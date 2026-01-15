import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../../utils/string';

const elementKeys = Object.keys(correspondencesData.elements);

export async function generateStaticParams() {
  return elementKeys.map((element) => ({
    element: stringToKebabCase(element),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ element: string }>;
}): Promise<Metadata> {
  const { element } = await params;
  const elementKey = elementKeys.find(
    (e) => stringToKebabCase(e) === element.toLowerCase(),
  );

  if (!elementKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const elementData =
    correspondencesData.elements[
      elementKey as keyof typeof correspondencesData.elements
    ];
  const title = `${elementKey} Element: Magical Correspondences & Meanings - Lunary`;
  const description = `Discover the complete magical correspondences for the ${elementKey.toLowerCase()} element. Learn about ${elementKey} colors, crystals, herbs, planets, zodiac signs, and how to work with ${elementKey.toLowerCase()} energy in your practice.`;

  return {
    title,
    description,
    keywords: [
      `${elementKey} element`,
      `${elementKey.toLowerCase()} magic`,
      `${elementKey.toLowerCase()} correspondences`,
      `${elementKey.toLowerCase()} element meaning`,
      stringToKebabCase(elementKey),
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
      canonical: `https://lunary.app/grimoire/correspondences/elements/${element}`,
    },
  };
}

export default async function ElementPage({
  params,
}: {
  params: Promise<{ element: string }>;
}) {
  const { element } = await params;
  const elementKey = elementKeys.find(
    (e) => stringToKebabCase(e) === element.toLowerCase(),
  );

  if (!elementKey) {
    notFound();
  }

  const elementData =
    correspondencesData.elements[
      elementKey as keyof typeof correspondencesData.elements
    ];

  const meaning = `The ${elementKey} element represents fundamental forces of nature and magical energy. In magical practice, elements are the building blocks of all spellwork and ritual. The ${elementKey.toLowerCase()} element corresponds to ${elementData.directions.toLowerCase()} direction, ${elementData.seasons.toLowerCase()} season, and ${elementData.timeOfDay.toLowerCase()} time of day.

Working with ${elementKey.toLowerCase()} energy brings ${elementData.zodiacSigns.join(', ')} qualities into your practice. This element connects you with ${elementData.planets.join(' and ')} planetary influences, creating powerful alignments for specific types of magical work.

The ${elementKey.toLowerCase()} element's energy is ${elementData.colors.join(', ')} in color, resonating with crystals like ${elementData.crystals.slice(0, 2).join(' and ')}, and herbs such as ${elementData.herbs.slice(0, 2).join(' and ')}. Understanding these correspondences helps you create more effective and aligned magical work.`;

  const howToWorkWith = [
    `Use ${elementData.colors.join(', ')} colors in your spellwork`,
    `Work with ${elementKey.toLowerCase()}-aligned crystals: ${elementData.crystals.slice(0, 3).join(', ')}`,
    `Incorporate ${elementKey.toLowerCase()} herbs: ${elementData.herbs.join(', ')}`,
    `Align with ${elementData.planets.join(' and ')} planetary influences`,
    `Work during ${elementData.timeOfDay.toLowerCase()} for enhanced power`,
    `Face ${elementData.directions.toLowerCase()} direction when calling ${elementKey.toLowerCase()} energy`,
    `Use ${elementKey.toLowerCase()} energy for ${elementData.zodiacSigns.join(', ')} zodiac work`,
    `Create ${elementKey.toLowerCase()}-themed altars and sacred spaces`,
  ];

  const faqs = [
    {
      question: `What does the ${elementKey} element represent?`,
      answer: `The ${elementKey} element represents ${elementData.directions.toLowerCase()} direction, ${elementData.seasons.toLowerCase()} season, and fundamental ${elementKey.toLowerCase()} energy in magical practice. It corresponds to ${elementData.zodiacSigns.join(', ')} zodiac signs and ${elementData.planets.join(' and ')} planetary influences.`,
    },
    {
      question: `How do I work with ${elementKey.toLowerCase()} energy?`,
      answer: `Work with ${elementKey.toLowerCase()} energy by using ${elementData.colors.join(', ')} colors, ${elementKey.toLowerCase()}-aligned crystals and herbs, facing ${elementData.directions.toLowerCase()} direction, and aligning with ${elementData.planets.join(' and ')} planetary influences.`,
    },
    {
      question: `What crystals correspond to ${elementKey}?`,
      answer: `${elementKey} element crystals include ${elementData.crystals.join(', ')}. These crystals resonate with ${elementKey.toLowerCase()} energy and enhance ${elementKey.toLowerCase()}-themed spellwork.`,
    },
  ];

  const tableOfContents = [
    { label: 'Element Overview', href: '#element-overview' },
    { label: 'Practice Notes', href: '#practice-notes' },
    { label: 'Correspondences', href: '#correspondences' },
  ];

  const cosmicSections: CosmicConnectionSection[] = [
    {
      title: 'Element Connections',
      links: [
        {
          label: 'Element Correspondences',
          href: '/grimoire/correspondences/elements',
        },
        {
          label: 'Fire, Water, Air, Earth',
          href: '/grimoire/correspondences/elements',
        },
        { label: 'Zodiac Signs', href: '/grimoire/zodiac' },
      ],
    },
    {
      title: 'Practice Tools',
      links: [
        {
          label: 'Correspondences Overview',
          href: '/grimoire/correspondences',
        },
        {
          label: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { label: 'Moon Phases', href: '/grimoire/moon/phases' },
      ],
    },
  ];

  return (
    <SEOContentTemplate
      title={`${elementKey} Element: Magical Correspondences & Meanings - Lunary`}
      h1={`${elementKey} Element`}
      description={`Discover the complete magical correspondences for the ${elementKey.toLowerCase()} element. Learn about ${elementKey} colors, crystals, herbs, planets, zodiac signs, and how to work with ${elementKey.toLowerCase()} energy.`}
      keywords={[
        `${elementKey} element`,
        `${elementKey.toLowerCase()} magic`,
        `${elementKey.toLowerCase()} correspondences`,
        `${elementKey.toLowerCase()} element meaning`,
        stringToKebabCase(elementKey),
      ]}
      canonicalUrl={`https://lunary.app/grimoire/correspondences/elements/${element}`}
      intro={`The ${elementKey} element is one of the four fundamental elements in magical practice. Understanding ${elementKey.toLowerCase()} correspondences helps you create more powerful and aligned spellwork. This comprehensive guide covers all ${elementKey.toLowerCase()} correspondences, meanings, and practical applications.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      faqs={faqs}
      internalLinks={[
        {
          text: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { text: 'Candle Magic', href: '/grimoire/candle-magic' },
        { text: 'Spells & Rituals', href: '/grimoire/spells' },
      ]}
      tables={[
        {
          title: `${elementKey} Element Correspondences`,
          headers: ['Category', 'Items'],
          rows: [
            ['Colors', elementData.colors.join(', ')],
            ['Crystals', elementData.crystals.join(', ')],
            ['Herbs', elementData.herbs.join(', ')],
            ['Planets', elementData.planets.join(', ')],
            ['Zodiac Signs', elementData.zodiacSigns.join(', ')],
            ['Direction', elementData.directions],
            ['Season', elementData.seasons],
            ['Time of Day', elementData.timeOfDay],
            ['Numbers', elementData.numbers.join(', ')],
            ['Animals', elementData.animals.join(', ')],
          ],
        },
      ]}
      tableOfContents={tableOfContents}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-correspondences'
          entityKey='correspondences'
          title={`${elementKey} Connections`}
          sections={cosmicSections}
        />
      }
      ctaText={`Want ${elementKey.toLowerCase()} ritual ideas?`}
      ctaHref='/pricing'
    >
      <section id='element-overview' className='space-y-3 mb-8'>
        <p className='text-sm text-zinc-300'>{meaning}</p>
        <p className='text-sm text-zinc-300'>
          Combine {elementData.colors.join(', ')} colors, crystals like{' '}
          {elementData.crystals.slice(0, 2).join(', ')}, and herbs such as{' '}
          {elementData.herbs.slice(0, 2).join(', ')} to embody{' '}
          {elementKey.toLowerCase()} energy.
        </p>
      </section>
      <section id='practice-notes' className='space-y-3 mb-8'>
        <h2 className='text-xl font-semibold text-zinc-100'>Practice Notes</h2>
        <ul className='list-disc list-inside text-sm text-zinc-300 space-y-2'>
          {howToWorkWith.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section id='correspondences' className='space-y-3'>
        <h2 className='text-xl font-semibold text-zinc-100'>
          Element Correspondences
        </h2>
        <p className='text-sm text-zinc-300'>
          {elementKey} connects to the {elementData.directions.toLowerCase()}{' '}
          direction, {elementData.seasons.toLowerCase()} season, and{' '}
          {elementData.timeOfDay.toLowerCase()} time of day. Its zodiac signs
          include {elementData.zodiacSigns.join(', ')}, and it resonates with
          planets such as {elementData.planets.join(', ')}.
        </p>
      </section>
    </SEOContentTemplate>
  );
}
