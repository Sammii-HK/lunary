import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { runesList } from '@/constants/runes';
import { stringToKebabCase } from '../../../../../utils/string';

const runeKeys = Object.keys(runesList);

export async function generateStaticParams() {
  return runeKeys.map((rune) => ({
    rune: stringToKebabCase(rune),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ rune: string }>;
}): Promise<Metadata> {
  const { rune } = await params;
  const runeKey = runeKeys.find(
    (r) => stringToKebabCase(r) === rune.toLowerCase(),
  );

  if (!runeKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const runeData = runesList[runeKey as keyof typeof runesList];
  const title = `${runeData.name} Rune Meaning: ${runeData.meaning} - Lunary`;
  const description = `Discover the complete meaning of ${runeData.name} rune (${runeData.symbol}). Learn about ${runeData.name} meaning, magical properties, and how to use this rune in divination and spellwork.`;

  return {
    title,
    description,
    keywords: [
      `${runeData.name} rune`,
      `${runeData.name} meaning`,
      `rune ${runeData.symbol}`,
      `${runeData.name} magical properties`,
      `${runeData.meaning} rune`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/runes/${rune}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/cosmic',
          width: 1200,
          height: 630,
          alt: `${runeData.name} Rune`,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/api/og/cosmic'],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/runes/${rune}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RunePage({
  params,
}: {
  params: Promise<{ rune: string }>;
}) {
  const { rune } = await params;
  const runeKey = runeKeys.find(
    (r) => stringToKebabCase(r) === rune.toLowerCase(),
  );

  if (!runeKey) {
    notFound();
  }

  const runeData = runesList[runeKey as keyof typeof runesList];

  const faqs = [
    {
      question: `What does ${runeData.name} rune mean?`,
      answer: `${runeData.name} (${runeData.symbol}) means "${runeData.meaning}". ${runeData.notes}`,
    },
    {
      question: `What are ${runeData.name}'s magical properties?`,
      answer: `${runeData.name} is associated with ${runeData.magicalProperties.toLowerCase()}. ${runeData.notes}`,
    },
    {
      question: `How do I use ${runeData.name} in spellwork?`,
      answer: `${runeData.name} can be used in spells for ${runeData.magicalProperties.toLowerCase()}. ${runeData.notes}`,
    },
    {
      question: `What does ${runeData.name} mean in divination?`,
      answer: `In rune readings, ${runeData.name} represents ${runeData.meaning.toLowerCase()} and ${runeData.magicalProperties.toLowerCase()}.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${runeData.name} Rune - Lunary`}
        h1={`${runeData.name} Rune: Complete Guide`}
        description={`Discover everything about ${runeData.name} rune. Learn about its meaning, magical properties, and how to use it in divination and spellwork.`}
        keywords={[
          `${runeData.name} rune`,
          `${runeData.name} meaning`,
          `rune ${runeData.symbol}`,
          `${runeData.name} magical`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/runes/${rune}`}
        intro={`${runeData.name} (${runeData.symbol}) is an Elder Futhark rune meaning "${runeData.meaning}". ${runeData.notes}`}
        tldr={`${runeData.name} (${runeData.symbol}) means "${runeData.meaning}" and is associated with ${runeData.magicalProperties.toLowerCase()}.`}
        meaning={`The runes are an ancient alphabet used by Germanic peoples for writing, divination, and magic. Each rune carries deep symbolic meaning and magical power. ${runeData.name} is one of the 24 Elder Futhark runes, the oldest known runic alphabet.

${runeData.name} (${runeData.symbol}) means "${runeData.meaning}" and carries the energy of ${runeData.magicalProperties.toLowerCase()}. This rune has been used for centuries in divination, spellwork, and magical practices.

${runeData.notes}

Understanding ${runeData.name} helps you work with its energy in your magical practice, whether you're using it for divination, spellwork, or personal growth. Each rune offers unique insights and can be a powerful tool for transformation and manifestation.`}
        glyphs={[runeData.symbol]}
        symbolism={`${runeData.name} (${runeData.symbol}) symbolizes ${runeData.meaning.toLowerCase()} and represents ${runeData.magicalProperties.toLowerCase()}. The rune's shape and meaning connect to ancient Germanic traditions and carry powerful magical energy.

In runic traditions, ${runeData.name} is associated with specific energies and can be used to:
- Enhance spells related to ${runeData.magicalProperties.toLowerCase()}
- Provide guidance in divination
- Connect with ancient wisdom
- Manifest ${runeData.magicalProperties.toLowerCase()}`}
        howToWorkWith={[
          `Use ${runeData.name} in spells for ${runeData.magicalProperties.toLowerCase()}`,
          `Draw ${runeData.name} for divination guidance`,
          `Carve or draw ${runeData.symbol} for magical work`,
          `Meditate on ${runeData.name}'s meaning`,
          `Work with ${runeData.name} energy consciously`,
        ]}
        journalPrompts={[
          `What does ${runeData.name} mean to me?`,
          `How can I work with ${runeData.name} energy?`,
          `What does ${runeData.meaning.toLowerCase()} represent in my life?`,
          `How can ${runeData.name} guide my path?`,
        ]}
        relatedItems={[
          {
            name: 'Runes Guide',
            href: '/grimoire/runes',
            type: 'Guide',
          },
          {
            name: 'Divination',
            href: '/grimoire/divination',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          { text: 'Explore All Runes', href: '/grimoire/runes' },
          { text: 'Learn Divination', href: '/grimoire/divination' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        faqs={faqs}
      />
    </div>
  );
}
