import { Metadata } from 'next';

type GrimoireEntityType =
  | 'crystal'
  | 'chakra'
  | 'planet'
  | 'zodiac'
  | 'rune'
  | 'tarot'
  | 'herb'
  | 'spell'
  | 'ritual'
  | 'meditation'
  | 'numerology'
  | 'element'
  | 'lunar-node'
  | 'eclipse'
  | 'placement'
  | 'glossary'
  | 'compatibility'
  | 'grounding'
  | 'scrying'
  | 'generic';

interface GrimoireMetadataOptions {
  entityType: GrimoireEntityType;
  entityName: string;
  description: string;
  keywords: string[];
  path: string;
  ogImagePath?: string;
  additionalKeywords?: string[];
}

const entityTypeLabels: Record<GrimoireEntityType, string> = {
  crystal: 'Crystal',
  chakra: 'Chakra',
  planet: 'Planet',
  zodiac: 'Zodiac Sign',
  rune: 'Rune',
  tarot: 'Tarot Card',
  herb: 'Herb',
  spell: 'Spell',
  ritual: 'Ritual',
  meditation: 'Meditation',
  numerology: 'Number',
  element: 'Element',
  'lunar-node': 'Lunar Node',
  eclipse: 'Eclipse',
  placement: 'Placement',
  glossary: 'Term',
  compatibility: 'Compatibility',
  grounding: 'Grounding',
  scrying: 'Scrying',
  generic: '',
};

const defaultOgImages: Partial<Record<GrimoireEntityType, string>> = {
  crystal: '/api/og/grimoire/crystals',
  chakra: '/api/og/grimoire/chakras',
  planet: '/api/og/grimoire/planets',
  zodiac: '/api/og/grimoire/zodiac',
  tarot: '/api/og/tarot',
  generic: '/api/og/cosmic',
};

export function createGrimoireMetadata({
  entityType,
  entityName,
  description,
  keywords,
  path,
  ogImagePath,
  additionalKeywords = [],
}: GrimoireMetadataOptions): Metadata {
  const label = entityTypeLabels[entityType];
  const title = label
    ? `${entityName} ${label}: ${description.slice(0, 50)}${description.length > 50 ? '...' : ''} - Lunary`
    : `${entityName}: ${description.slice(0, 50)}${description.length > 50 ? '...' : ''} - Lunary`;

  const fullDescription =
    description.length > 160 ? description.slice(0, 157) + '...' : description;

  const canonicalUrl = `https://lunary.app${path}`;
  const ogImage =
    ogImagePath || defaultOgImages[entityType] || '/api/og/cosmic';

  const allKeywords = [
    ...keywords,
    ...additionalKeywords,
    entityName.toLowerCase(),
    `${entityName} meaning`,
    label ? `${entityName} ${label.toLowerCase()}` : entityName,
  ].filter((k, i, arr) => arr.indexOf(k) === i);

  return {
    title,
    description: fullDescription,
    keywords: allKeywords,
    openGraph: {
      title,
      description: fullDescription,
      url: canonicalUrl,
      siteName: 'Lunary',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${entityName}${label ? ` ${label}` : ''}`,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: fullDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
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

export function createNotFoundMetadata(): Metadata {
  return {
    title: 'Not Found - Lunary Grimoire',
    description: 'The requested page was not found in the Lunary Grimoire.',
    robots: {
      index: false,
      follow: false,
    },
  };
}
