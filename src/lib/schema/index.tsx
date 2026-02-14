const BASE_URL = 'https://lunary.app';

export const LUNARY_SOCIAL_LINKS = [
  'https://www.instagram.com/lunary.app',
  'https://twitter.com/lunaryApp',
  'https://www.threads.net/@lunary.app',
  'https://bsky.app/profile/lunaryapp.bsky.social',
  'https://www.pinterest.com/lunaryapp',
  'https://www.tiktok.com/@lunaryapp',
  'https://www.youtube.com/@lunaryapp',
  'https://lunary.substack.com',
  'https://github.com/nicholasoxford/lunary',
  'https://www.linkedin.com/company/lunaryapp',
  'https://discord.gg/SUvdhDXFSk',
  `${BASE_URL}/press-kit`,
];

export const LUNARY_BRAND = {
  name: 'Lunary',
  primaryColor: '#8458D8',
  secondaryColor: '#7B7BE8',
  backgroundColor: '#0A0A0A',
  foundingDate: '2024',
  colors: {
    bg: '#0A0A0A',
    bgDeep: '#050505',
    primary: '#8458D8',
    secondary: '#7B7BE8',
    accentSoft: '#C77DFF',
    accentHighlight: '#D070E8',
    text: '#FFFFFF',
    warningSoft: '#EE789E',
    error: '#D06060',
    success: '#6B9B7A',
  },
};

export function createOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Lunary',
    alternateName: 'Lunary App',
    description:
      'The definitive knowledge authority for astrology, tarot, rituals, and symbolic meaning-making. Personalized cosmic guidance based on real astronomical data.',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    image: `${BASE_URL}/logo.png`,
    sameAs: LUNARY_SOCIAL_LINKS,
    founder: {
      '@type': 'Person',
      name: 'Sammii',
      jobTitle: 'Founder',
    },
    foundingDate: LUNARY_BRAND.foundingDate,
    brand: {
      '@type': 'Brand',
      name: 'Lunary',
      logo: `${BASE_URL}/logo.png`,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@lunary.app',
      availableLanguage: ['English'],
    },
    areaServed: 'Worldwide',
    knowsAbout: [
      'Astrology',
      'Tarot',
      'Birth Charts',
      'Moon Phases',
      'Zodiac Signs',
      'Planetary Transits',
      'Crystals',
      'Rituals',
      'Spiritual Practices',
    ],
  };
}

export function createWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Lunary',
    description:
      'The definitive knowledge authority for astrology, tarot, rituals, and symbolic meaning-making. Personalized cosmic guidance based on real astronomical data.',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/grimoire?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
  };
}

export function createWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${BASE_URL}/#webapp`,
    name: 'Lunary',
    description:
      'Progressive Web App for personalized astrology insights based on real astronomical calculations.',
    url: BASE_URL,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '7.99',
      priceCurrency: 'USD',
      offerCount: 3,
    },
    featureList: [
      'Birth chart analysis',
      'Personalized daily horoscopes',
      'Tarot readings',
      'Moon phase tracking',
      'Push notifications',
      'Offline support',
      'AI-powered cosmic guidance',
    ],
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    provider: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
}

interface ArticleSchemaProps {
  headline: string;
  description: string;
  url: string;
  keywords?: string[];
  datePublished?: string;
  dateModified?: string;
  image?: string;
  section?: string;
  aboutEntity?: {
    '@id': string;
    name: string;
  };
}

export function createArticleSchema({
  headline,
  description,
  url,
  keywords = [],
  datePublished,
  dateModified,
  image,
  section,
  aboutEntity,
}: ArticleSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url,
    keywords: keywords.join(', '),
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString(),
    image: image || `${BASE_URL}/api/og/cosmic`,
    author: {
      '@type': 'Organization',
      name: 'Lunary',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lunary',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(aboutEntity && {
      about: {
        '@type': 'Thing',
        '@id': aboutEntity['@id'],
        name: aboutEntity.name,
      },
      mainEntity: {
        '@id': aboutEntity['@id'],
      },
    }),
    ...(section && { articleSection: section }),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
  };
}

interface ProductSchemaProps {
  name: string;
  description: string;
  price: number;
  priceCurrency?: string;
  interval?: 'month' | 'year';
  features?: string[];
  sku?: string;
  stripePriceId?: string;
}

export function createProductSchema({
  name,
  description,
  price,
  priceCurrency = 'USD',
  stripePriceId,
  interval,
  features = [],
  sku,
}: ProductSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: {
      '@type': 'Brand',
      name: 'Lunary',
    },
    stripePriceId,
    offers: {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency,
      availability: 'https://schema.org/InStock',
      ...(interval && {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: price.toString(),
          priceCurrency,
          billingDuration: interval === 'month' ? 'P1M' : 'P1Y',
        },
      }),
    },
    ...(sku && { sku }),
    ...(features.length > 0 && {
      additionalProperty: features.map((feature) => ({
        '@type': 'PropertyValue',
        name: 'Feature',
        value: feature,
      })),
    }),
  };
}

interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

interface HowToSchemaProps {
  name: string;
  description: string;
  url: string;
  steps: HowToStep[];
  totalTime?: string;
  tools?: string[];
  supplies?: string[];
  image?: string;
}

export function createHowToSchema({
  name,
  description,
  url,
  steps,
  totalTime,
  tools = [],
  supplies = [],
  image,
}: HowToSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    url,
    ...(totalTime && { totalTime }),
    ...(image && { image }),
    ...(tools.length > 0 && {
      tool: tools.map((tool) => ({
        '@type': 'HowToTool',
        name: tool,
      })),
    }),
    ...(supplies.length > 0 && {
      supply: supplies.map((supply) => ({
        '@type': 'HowToSupply',
        name: supply,
      })),
    }),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };
}

interface ItemListSchemaProps {
  name: string;
  description: string;
  url: string;
  items: Array<{
    name: string;
    url: string;
    description?: string;
    image?: string;
  }>;
}

export function createItemListSchema({
  name,
  description,
  url,
  items,
}: ItemListSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
      ...(item.description && { description: item.description }),
      ...(item.image && { image: item.image }),
    })),
  };
}

interface FAQItem {
  question: string;
  answer: string;
}

export function createFAQPageSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

interface QAPageSchemaProps {
  question: string;
  answer: string;
  url: string;
  datePublished?: string;
}

export function createQAPageSchema({
  question,
  answer,
  url,
  datePublished,
}: QAPageSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: question,
      text: question,
      dateCreated: datePublished || new Date().toISOString(),
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
        dateCreated: datePublished || new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: 'Lunary',
          url: BASE_URL,
        },
      },
    },
    url,
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
      })),
    ],
  };
}

interface DefinedTermSchemaProps {
  term: string;
  definition: string;
  url: string;
  relatedTerms?: string[];
}

export function createDefinedTermSchema({
  term,
  definition,
  url,
  relatedTerms = [],
}: DefinedTermSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term,
    description: definition,
    url,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Lunary Astrology Glossary',
      url: `${BASE_URL}/grimoire/glossary`,
    },
    ...(relatedTerms.length > 0 && {
      sameAs: relatedTerms,
    }),
  };
}

interface ImageObjectSchemaProps {
  url: string;
  caption: string;
  width?: number;
  height?: number;
  contentUrl?: string;
}

export function createImageObjectSchema({
  url,
  caption,
  width = 1200,
  height = 630,
  contentUrl,
}: ImageObjectSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    url,
    contentUrl: contentUrl || url,
    caption,
    width,
    height,
    creator: {
      '@type': 'Organization',
      name: 'Lunary',
      url: BASE_URL,
    },
  };
}

interface ReviewSchemaProps {
  reviewBody: string;
  rating: number;
  authorName: string;
  datePublished?: string;
  isVerified?: boolean;
}

export function createReviewSchema({
  reviewBody,
  rating,
  authorName,
  datePublished,
  isVerified = false,
}: ReviewSchemaProps) {
  if (!isVerified) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      '@type': 'Person',
      name: authorName,
    },
    datePublished: datePublished || new Date().toISOString(),
    itemReviewed: {
      '@type': 'WebApplication',
      name: 'Lunary',
      url: BASE_URL,
    },
  };
}

interface AggregateRatingSchemaProps {
  ratingValue: number;
  reviewCount: number;
  isVerified?: boolean;
}

export function createAggregateRatingSchema({
  ratingValue,
  reviewCount,
  isVerified = false,
}: AggregateRatingSchemaProps) {
  if (!isVerified) {
    return null;
  }

  return {
    '@type': 'AggregateRating',
    ratingValue,
    reviewCount,
    bestRating: 5,
    worstRating: 1,
  };
}

function stringifySafe(data: object) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function renderJsonLd(schema: object | null) {
  if (!schema) return null;

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: stringifySafe(schema),
      }}
    />
  );
}

export function renderJsonLdMulti(schemas: Array<object | null | undefined>) {
  const filtered = schemas.filter(Boolean) as object[];
  if (!filtered.length) return null;

  return (
    <>
      {filtered.map((block, idx) => (
        <script
          key={idx}
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: stringifySafe(block),
          }}
        />
      ))}
    </>
  );
}

// ============================================================================
// COSMIC ENTITY SCHEMAS - For Knowledge Graph Entity SEO
// ============================================================================

interface CosmicEntitySchemaProps {
  name: string;
  description: string;
  url: string;
  image?: string;
  sameAs?: string[];
  relatedEntities?: { name: string; url: string; relationship: string }[];
  additionalType?: string;
  keywords?: string[];
}

export function createCosmicEntitySchema({
  name,
  description,
  url,
  image,
  sameAs,
  relatedEntities,
  additionalType,
  keywords,
}: CosmicEntitySchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    '@id': `${BASE_URL}${url}#entity`,
    name,
    description,
    url: `${BASE_URL}${url}`,
    ...(additionalType && { additionalType }),
    ...(image && { image: `${BASE_URL}${image}` }),
    ...(sameAs && sameAs.length > 0 && { sameAs }),
    ...(keywords && keywords.length > 0 && { keywords: keywords.join(', ') }),
    ...(relatedEntities &&
      relatedEntities.length > 0 && {
        isRelatedTo: relatedEntities.map((entity) => ({
          '@type': 'Thing',
          name: entity.name,
          url: entity.url.startsWith('http')
            ? entity.url
            : `${BASE_URL}${entity.url}`,
          description: entity.relationship,
        })),
      }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}${url}`,
    },
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
}

interface ZodiacSignSchemaProps {
  sign: string;
  element: string;
  modality: string;
  rulingPlanet: string;
  dates: string;
  description: string;
  traits: string[];
  compatibility: string[];
  relatedCrystals?: string[];
  relatedTarot?: string;
  sameAs?: string;
}

export function createZodiacSignSchema({
  sign,
  element,
  modality,
  rulingPlanet,
  dates,
  description,
  traits,
  compatibility,
  relatedCrystals,
  relatedTarot,
  sameAs,
}: ZodiacSignSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    '@id': `${BASE_URL}/grimoire/zodiac/${sign.toLowerCase()}#entity`,
    name: `${sign} Zodiac Sign`,
    alternateName: sign,
    description,
    url: `${BASE_URL}/grimoire/zodiac/${sign.toLowerCase()}`,
    additionalType: 'https://en.wikipedia.org/wiki/Zodiac',
    ...(sameAs && { sameAs }),
    identifier: {
      '@type': 'PropertyValue',
      name: 'Zodiac Sign',
      value: sign,
    },
    isPartOf: {
      '@type': 'Thing',
      name: 'Western Zodiac',
      url: `${BASE_URL}/grimoire/zodiac`,
    },
    isRelatedTo: [
      {
        '@type': 'Thing',
        name: element,
        description: `${sign} is a ${element} sign`,
      },
      {
        '@type': 'Thing',
        name: modality,
        description: `${sign} is a ${modality} sign`,
      },
      {
        '@type': 'Thing',
        name: rulingPlanet,
        url: `${BASE_URL}/grimoire/astronomy/planets/${rulingPlanet.toLowerCase()}`,
        description: `${rulingPlanet} rules ${sign}`,
      },
      ...compatibility.map((compatSign) => ({
        '@type': 'Thing',
        name: compatSign,
        url: `${BASE_URL}/grimoire/zodiac/${compatSign.toLowerCase()}`,
        description: `Compatible with ${sign}`,
      })),
      ...(relatedCrystals?.map((crystal) => ({
        '@type': 'Thing',
        name: crystal,
        url: `${BASE_URL}/grimoire/crystals/${crystal.toLowerCase().replace(/\s+/g, '-')}`,
        description: `Crystal associated with ${sign}`,
      })) || []),
      ...(relatedTarot
        ? [
            {
              '@type': 'CreativeWork',
              name: relatedTarot,
              url: `${BASE_URL}/grimoire/tarot/${relatedTarot.toLowerCase().replace(/\s+/g, '-')}`,
              description: `Tarot card associated with ${sign}`,
            },
          ]
        : []),
    ],
    keywords: [sign, element, modality, rulingPlanet, dates, ...traits].join(
      ', ',
    ),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/grimoire/zodiac/${sign.toLowerCase()}`,
    },
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
}

interface PlanetSchemaProps {
  planet: string;
  description: string;
  rules: string[];
  themes: string[];
  element?: string;
  tarotCard?: string;
  tarotUrl?: string;
  crystals?: string[];
  day?: string;
  chakra?: string;
  sameAs?: string;
}

export function createPlanetSchema({
  planet,
  description,
  rules,
  themes,
  element,
  tarotCard,
  tarotUrl,
  crystals,
  day,
  chakra,
  sameAs,
}: PlanetSchemaProps) {
  const relatedEntities: {
    '@type': string;
    name: string;
    url?: string;
    description: string;
  }[] = [
    ...rules.map((sign) => ({
      '@type': 'Thing' as const,
      name: sign,
      url: `${BASE_URL}/grimoire/zodiac/${sign.toLowerCase()}`,
      description: `${planet} rules ${sign}`,
    })),
  ];

  if (tarotCard && tarotUrl) {
    relatedEntities.push({
      '@type': 'CreativeWork',
      name: tarotCard,
      url: `${BASE_URL}${tarotUrl}`,
      description: `Tarot card associated with ${planet}`,
    });
  }

  if (crystals) {
    crystals.forEach((crystal) => {
      relatedEntities.push({
        '@type': 'Thing',
        name: crystal,
        url: `${BASE_URL}/grimoire/crystals/${crystal.toLowerCase().replace(/\s+/g, '-')}`,
        description: `Crystal associated with ${planet}`,
      });
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    '@id': `${BASE_URL}/grimoire/astronomy/planets/${planet.toLowerCase()}#entity`,
    name: `${planet} in Astrology`,
    alternateName: planet,
    description,
    url: `${BASE_URL}/grimoire/astronomy/planets/${planet.toLowerCase()}`,
    additionalType: 'https://en.wikipedia.org/wiki/Planet',
    ...(sameAs && { sameAs }),
    isRelatedTo: relatedEntities,
    keywords: [
      planet,
      ...rules,
      ...themes,
      ...(element ? [element] : []),
      ...(day ? [day] : []),
      ...(chakra ? [chakra] : []),
    ].join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/grimoire/astronomy/planets/${planet.toLowerCase()}`,
    },
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
}

interface TarotCardSchemaProps {
  name: string;
  description: string;
  uprightMeaning: string;
  reversedMeaning: string;
  keywords: string[];
  element?: string;
  planet?: string;
  sign?: string;
  number?: number;
  arcana: 'major' | 'minor';
  suit?: string;
  imageUrl?: string;
}

export function createTarotCardSchema({
  name,
  description,
  uprightMeaning,
  reversedMeaning,
  keywords,
  element,
  planet,
  sign,
  number,
  arcana,
  suit,
  imageUrl,
}: TarotCardSchemaProps) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  const relatedEntities: {
    '@type': string;
    name: string;
    url?: string;
    description: string;
  }[] = [];

  if (planet) {
    relatedEntities.push({
      '@type': 'Thing',
      name: planet,
      url: `${BASE_URL}/grimoire/astronomy/planets/${planet.toLowerCase()}`,
      description: `Planet associated with ${name}`,
    });
  }

  if (sign) {
    relatedEntities.push({
      '@type': 'Thing',
      name: sign,
      url: `${BASE_URL}/grimoire/zodiac/${sign.toLowerCase()}`,
      description: `Zodiac sign associated with ${name}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${BASE_URL}/grimoire/tarot/${slug}#entity`,
    name,
    description,
    url: `${BASE_URL}/grimoire/tarot/${slug}`,
    ...(imageUrl && { image: imageUrl }),
    genre: 'Tarot',
    isPartOf: {
      '@type': 'CreativeWork',
      name: arcana === 'major' ? 'Major Arcana' : `Minor Arcana - ${suit}`,
      url: `${BASE_URL}/grimoire/tarot`,
    },
    ...(number !== undefined && { position: number }),
    isRelatedTo: relatedEntities,
    keywords: [
      name,
      arcana === 'major' ? 'Major Arcana' : 'Minor Arcana',
      ...(suit ? [suit] : []),
      ...(element ? [element] : []),
      ...keywords,
    ].join(', '),
    abstract: uprightMeaning,
    text: `Upright: ${uprightMeaning}. Reversed: ${reversedMeaning}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/grimoire/tarot/${slug}`,
    },
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
}

interface CrystalSchemaProps {
  name: string;
  description: string;
  properties: string[];
  chakras: string[];
  zodiacSigns?: string[];
  planets?: string[];
  element?: string;
  imageUrl?: string;
}

export function createCrystalSchema({
  name,
  description,
  properties,
  chakras,
  zodiacSigns,
  planets,
  element,
  imageUrl,
}: CrystalSchemaProps) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  const relatedEntities: {
    '@type': string;
    name: string;
    url?: string;
    description: string;
  }[] = [];

  zodiacSigns?.forEach((sign) => {
    relatedEntities.push({
      '@type': 'Thing',
      name: sign,
      url: `${BASE_URL}/grimoire/zodiac/${sign.toLowerCase()}`,
      description: `${name} is associated with ${sign}`,
    });
  });

  planets?.forEach((planet) => {
    relatedEntities.push({
      '@type': 'Thing',
      name: planet,
      url: `${BASE_URL}/grimoire/astronomy/planets/${planet.toLowerCase()}`,
      description: `${name} is associated with ${planet}`,
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    '@id': `${BASE_URL}/grimoire/crystals/${slug}#entity`,
    name,
    description,
    url: `${BASE_URL}/grimoire/crystals/${slug}`,
    ...(imageUrl && { image: imageUrl }),
    additionalType: 'https://en.wikipedia.org/wiki/Crystal',
    isPartOf: {
      '@type': 'Thing',
      name: 'Crystal Guide',
      url: `${BASE_URL}/grimoire/crystals`,
    },
    isRelatedTo: relatedEntities,
    keywords: [
      name,
      'crystal',
      'gemstone',
      ...(element ? [element] : []),
      ...properties,
      ...chakras,
    ].join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/grimoire/crystals/${slug}`,
    },
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
}

interface SpeakableSchemaProps {
  url: string;
  headline: string;
  cssSelectors?: string[];
}

export function createSpeakableSchema({
  url,
  headline,
  cssSelectors = ['h1', 'h2', '.summary', '.intro'],
}: SpeakableSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    name: headline,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors,
    },
    url,
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
}

export function createArticleWithSpeakableSchema({
  headline,
  description,
  url,
  keywords = [],
  section,
  speakableSections = ['h1', 'h2', 'header p', 'section > p:first-of-type'],
}: ArticleSchemaProps & { speakableSections?: string[] }) {
  const articleSchema = createArticleSchema({
    headline,
    description,
    url,
    keywords,
    section,
  });

  return {
    ...articleSchema,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: speakableSections,
    },
  };
}

// ============================================
// URL-to-Entity Parser for Auto-Detection
// ============================================

export interface GrimoireEntity {
  type: string;
  schemaType: string;
  slug: string;
  category: string;
  collection: string;
}

/**
 * Entity type mappings for grimoire URL categories
 * Maps URL path segments to schema.org types and collection names
 */
const GRIMOIRE_ENTITY_MAP: Record<
  string,
  { schemaType: string; collection: string }
> = {
  zodiac: { schemaType: 'Thing', collection: 'Zodiac Signs' },
  tarot: { schemaType: 'CreativeWork', collection: 'Tarot Cards' },
  crystals: { schemaType: 'Thing', collection: 'Crystals & Gemstones' },
  planets: { schemaType: 'Thing', collection: 'Planetary Bodies' },
  moon: { schemaType: 'Thing', collection: 'Moon Phases' },
  houses: { schemaType: 'Thing', collection: 'Astrological Houses' },
  aspects: { schemaType: 'Thing', collection: 'Planetary Aspects' },
  numerology: { schemaType: 'Thing', collection: 'Numerology' },
  'life-path': { schemaType: 'Thing', collection: 'Life Path Numbers' },
  'angel-numbers': { schemaType: 'Thing', collection: 'Angel Numbers' },
  chakras: { schemaType: 'Thing', collection: 'Chakras' },
  runes: { schemaType: 'CreativeWork', collection: 'Runes' },
  correspondences: {
    schemaType: 'Thing',
    collection: 'Magical Correspondences',
  },
  spells: { schemaType: 'HowTo', collection: 'Spells & Rituals' },
  practices: { schemaType: 'HowTo', collection: 'Magical Practices' },
  guides: { schemaType: 'Article', collection: 'Guides' },
  'wheel-of-the-year': { schemaType: 'Event', collection: 'Sabbats' },
  eclipses: { schemaType: 'Event', collection: 'Eclipse Events' },
  retrogrades: { schemaType: 'Event', collection: 'Retrograde Periods' },
  compatibility: { schemaType: 'Thing', collection: 'Zodiac Compatibility' },
  'birth-chart': { schemaType: 'Thing', collection: 'Birth Chart' },
  horoscopes: { schemaType: 'Article', collection: 'Horoscopes' },
  meditation: { schemaType: 'HowTo', collection: 'Meditation Techniques' },
  divination: { schemaType: 'Thing', collection: 'Divination Methods' },
  glossary: { schemaType: 'DefinedTermSet', collection: 'Astrology Glossary' },
};

/**
 * Parse a grimoire URL to detect entity type
 * @param url - Full URL or path (e.g., "/grimoire/zodiac/aries" or "https://lunary.app/grimoire/zodiac/aries")
 * @returns Entity info or null if not a grimoire URL
 */
export function parseGrimoireUrl(url: string): GrimoireEntity | null {
  // Extract path from URL
  const path = url.replace(/^https?:\/\/[^/]+/, '');

  // Check if it's a grimoire URL
  if (!path.startsWith('/grimoire/')) {
    return null;
  }

  // Parse segments: /grimoire/category/slug
  const segments = path.replace('/grimoire/', '').split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const category = segments[0];
  const slug = segments[1] || '';

  const entityInfo = GRIMOIRE_ENTITY_MAP[category];

  if (!entityInfo) {
    // Unknown category, return generic
    return {
      type: category,
      schemaType: 'Thing',
      slug,
      category,
      collection: formatCategoryName(category),
    };
  }

  return {
    type: category,
    schemaType: entityInfo.schemaType,
    slug,
    category,
    collection: entityInfo.collection,
  };
}

/**
 * Format a URL segment into a human-readable name
 */
function formatCategoryName(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get related entities for auto-mentions based on entity type
 * This creates semantic connections for Google's Knowledge Graph
 */
export function getRelatedEntities(
  entity: GrimoireEntity,
): Array<{ name: string; url: string; type: string }> {
  const related: Array<{ name: string; url: string; type: string }> = [];

  // Add collection as parent
  related.push({
    name: entity.collection,
    url: `${BASE_URL}/grimoire/${entity.category}`,
    type: 'ItemList',
  });

  // Add grimoire as top-level parent
  related.push({
    name: 'Lunary Grimoire',
    url: `${BASE_URL}/grimoire`,
    type: 'CollectionPage',
  });

  return related;
}

// ============================================================================
// EVENT SCHEMA - For Sabbats, Eclipses, Retrogrades, Astrological Events
// ============================================================================

interface EventSchemaProps {
  name: string;
  description: string;
  url: string;
  startDate: string;
  endDate?: string;
  eventType?: 'Festival' | 'SocialEvent' | 'Event';
  location?: string;
  isAccessibleForFree?: boolean;
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed';
  eventAttendanceMode?:
    | 'OnlineEventAttendanceMode'
    | 'OfflineEventAttendanceMode'
    | 'MixedEventAttendanceMode';
  image?: string;
  keywords?: string[];
}

export function createEventSchema({
  name,
  description,
  url,
  startDate,
  endDate,
  eventType = 'Event',
  location = 'Worldwide',
  isAccessibleForFree = true,
  eventStatus = 'EventScheduled',
  eventAttendanceMode = 'OnlineEventAttendanceMode',
  image,
  keywords,
}: EventSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': eventType,
    name,
    description,
    url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
    startDate,
    ...(endDate && { endDate }),
    eventStatus: `https://schema.org/${eventStatus}`,
    eventAttendanceMode: `https://schema.org/${eventAttendanceMode}`,
    location: {
      '@type': 'VirtualLocation',
      name: location,
      url: `${BASE_URL}${url}`,
    },
    organizer: {
      '@id': `${BASE_URL}/#organization`,
    },
    isAccessibleForFree,
    ...(image && { image }),
    ...(keywords && { keywords: keywords.join(', ') }),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}${url}`,
      validFrom: new Date().toISOString(),
    },
  };
}

// ============================================================================
// SOFTWARE APPLICATION SCHEMA - For App Pages
// ============================================================================

interface SoftwareAppSchemaProps {
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem?: string;
  offers?: {
    price: number;
    priceCurrency: string;
  };
  aggregateRating?: {
    ratingValue: number;
    ratingCount: number;
  };
  featureList?: string[];
}

export function createSoftwareAppSchema({
  name,
  description,
  applicationCategory,
  operatingSystem = 'Web, iOS, Android',
  offers,
  aggregateRating,
  featureList,
}: SoftwareAppSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url: BASE_URL,
    applicationCategory,
    operatingSystem,
    ...(offers && {
      offers: {
        '@type': 'Offer',
        price: offers.price.toString(),
        priceCurrency: offers.priceCurrency,
      },
    }),
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        ratingCount: aggregateRating.ratingCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(featureList && { featureList }),
    provider: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
}

// ============================================================================
// COLLECTION PAGE SCHEMA - For Index/List Pages
// ============================================================================

interface CollectionPageSchemaProps {
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
  hasPart?: Array<{ name: string; url: string }>;
}

export function createCollectionPageSchema({
  name,
  description,
  url,
  numberOfItems,
  hasPart,
}: CollectionPageSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
    numberOfItems,
    ...(hasPart && {
      hasPart: hasPart.map((item) => ({
        '@type': 'WebPage',
        name: item.name,
        url: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
      })),
    }),
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
    },
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
}

// ============================================================================
// PODCAST SCHEMAS - For Podcast Episode and Series SEO
// ============================================================================

interface PodcastEpisodeSchemaProps {
  name: string;
  description: string;
  url: string;
  audioUrl: string;
  datePublished: string;
  durationSecs: number;
  episodeNumber: number;
  transcript?: string;
}

/**
 * Convert duration in seconds to ISO 8601 duration format (PT10M30S)
 */
function formatIsoDuration(secs: number): string {
  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  if (seconds === 0) return `PT${minutes}M`;
  return `PT${minutes}M${seconds}S`;
}

export function createPodcastEpisodeSchema({
  name,
  description,
  url,
  audioUrl,
  datePublished,
  durationSecs,
  episodeNumber,
  transcript,
}: PodcastEpisodeSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    name,
    description,
    url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
    datePublished,
    duration: formatIsoDuration(durationSecs),
    episodeNumber,
    associatedMedia: {
      '@type': 'MediaObject',
      contentUrl: audioUrl,
      encodingFormat: 'audio/mpeg',
    },
    partOfSeries: {
      '@type': 'PodcastSeries',
      name: 'Lunary Cosmic Insights',
      url: `${BASE_URL}/podcast`,
    },
    ...(transcript && { transcript }),
    publisher: { '@id': `${BASE_URL}/#organization` },
  };
}

interface VideoObjectSchemaProps {
  name: string;
  description: string;
  thumbnailUrl?: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl: string;
  durationSecs: number;
  episodeUrl: string;
}

export function createVideoObjectSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
  embedUrl,
  durationSecs,
  episodeUrl,
}: VideoObjectSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    ...(thumbnailUrl && { thumbnailUrl }),
    uploadDate,
    ...(contentUrl && { contentUrl }),
    embedUrl,
    duration: formatIsoDuration(durationSecs),
    publisher: { '@id': `${BASE_URL}/#organization` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': episodeUrl.startsWith('http')
        ? episodeUrl
        : `${BASE_URL}${episodeUrl}`,
    },
  };
}

export function createPodcastSeriesSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    name: 'Lunary Cosmic Insights',
    description:
      'Weekly explorations of astrology, tarot, crystals, numerology, and cosmic wisdom from the Lunary grimoire.',
    url: `${BASE_URL}/podcast`,
    webFeed: `${BASE_URL}/podcast`,
    author: {
      '@type': 'Organization',
      name: 'Lunary',
      url: BASE_URL,
    },
    publisher: { '@id': `${BASE_URL}/#organization` },
  };
}
