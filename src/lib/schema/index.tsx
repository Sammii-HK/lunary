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
  primaryColor: '#a855f7',
  secondaryColor: '#c084fc',
  backgroundColor: '#09090b',
  foundingDate: '2024',
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
}

export function createProductSchema({
  name,
  description,
  price,
  priceCurrency = 'USD',
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

export function renderJsonLd(schema: object | null) {
  if (!schema) return null;

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
