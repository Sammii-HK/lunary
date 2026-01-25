import { Metadata } from 'next';

const BASE_URL = 'https://lunary.app';
const OG_BASE = `${BASE_URL}/api/og/cosmic`;

const encode = (value: string) => encodeURIComponent(value);

const formatKeywords = (...terms: string[]) =>
  terms
    .flatMap((term) => term.split(',').map((fragment) => fragment.trim()))
    .filter(Boolean);

export const signMeta = (signName: string, slug: string): Metadata => {
  const title = `${signName} Horoscopes: Monthly Predictions & Forecasts | Lunary`;
  const description = `${signName} horoscopes for all months and years. Get detailed monthly predictions for ${signName} including love, career, health, and finance forecasts.`;
  const image = `${OG_BASE}?sign=${encode(signName)}`;

  return {
    title,
    description,
    keywords: formatKeywords(
      `${signName} horoscope`,
      `${signName} monthly horoscope`,
      `${signName} yearly horoscope`,
      'astrology forecast',
      'zodiac forecast',
      'Lunary',
    ),
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/grimoire/horoscopes/${slug}`,
      images: [image],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${signName} Horoscope Guide | Lunary`,
      description: `Explore ${signName} monthly and yearly astrology forecasts.`,
      images: [image],
    },
    alternates: {
      canonical: `${BASE_URL}/grimoire/horoscopes/${slug}`,
    },
  };
};

export const yearMeta = (
  signName: string,
  slug: string,
  year: string,
): Metadata => {
  const title = `${signName} Horoscope ${year}: All Monthly Forecasts | Lunary`;
  const description = `${signName} horoscope for all 12 months of ${year}. Complete monthly predictions including love, career, and life guidance for ${signName}.`;
  const image = `${OG_BASE}?sign=${encode(signName)}&year=${encode(year)}`;

  return {
    title,
    description,
    keywords: formatKeywords(
      `${signName} horoscope ${year}`,
      `${signName} astrology ${year}`,
      'yearly horoscope',
      `${signName} monthly forecast`,
      'Lunary',
    ),
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/grimoire/horoscopes/${slug}/${year}`,
      images: [image],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${signName} Horoscope ${year} | Lunary`,
      description: `Month-by-month astrology forecast for ${signName} in ${year}.`,
      images: [image],
    },
    alternates: {
      canonical: `${BASE_URL}/grimoire/horoscopes/${slug}/${year}`,
    },
  };
};

export const monthMeta = (
  signName: string,
  slug: string,
  year: string,
  monthSlug: string,
  monthName: string,
  monthNumber: number,
): Metadata => {
  const title = `${signName} Horoscope ${monthName} ${year}: Monthly Predictions | Lunary`;
  const description = `${signName} horoscope for ${monthName} ${year}. Discover what the stars have in store for ${signName} this month including love, career, health, and financial predictions.`;
  const image = `${OG_BASE}?sign=${encode(signName)}&month=${encode(monthSlug)}&year=${encode(year)}`;

  return {
    title,
    description,
    keywords: formatKeywords(
      `${signName} horoscope ${monthName} ${year}`,
      `${signName} monthly horoscope`,
      `${signName} ${year} astrology`,
      `${signName} ${monthName} forecast`,
      'Lunary',
    ),
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/grimoire/horoscopes/${slug}/${year}/${monthSlug}`,
      images: [image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${signName} Horoscope ${monthName} ${year} | Lunary`,
      description: `Detailed ${signName} astrology forecast for ${monthName} ${year}.`,
      images: [image],
    },
    alternates: {
      canonical: `${BASE_URL}/grimoire/horoscopes/${slug}/${year}/${monthSlug}`,
    },
  };
};

export const articleSchema = (
  signName: string,
  year: string,
  monthName: string,
  monthNumber: number,
): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: `${signName} Horoscope ${monthName} ${year} | Love, Career & Wellbeing Astrology Forecast`,
  description: `Detailed astrology forecasts for ${signName} in ${monthName} ${year}.`,
  datePublished: `${year}-${String(monthNumber).padStart(2, '0')}-01`,
  dateModified: new Date().toISOString(),
  author: { '@type': 'Organization', name: 'Lunary' },
  publisher: {
    '@type': 'Organization',
    name: 'Lunary',
    logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
  },
  isAccessibleForFree: true,
});
