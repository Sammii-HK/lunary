import { Metadata } from 'next';

const BASE_URL = 'https://lunary.app';
const OG_BASE = `${BASE_URL}/api/og/cosmic`;

const encode = (value: string) => encodeURIComponent(value);

const formatKeywords = (...terms: string[]) =>
  terms
    .flatMap((term) => term.split(',').map((fragment) => fragment.trim()))
    .filter(Boolean);

export const signMeta = (signName: string, slug: string): Metadata => {
  const title = `${signName} Horoscopes: Monthly Predictions & Forecasts`;
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
      title: `${signName} Horoscope Guide`,
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
  const title = `${signName} Horoscope ${year}: All Monthly Forecasts`;
  const description = `Complete ${signName} horoscope for ${year}! Explore all 12 monthly forecasts, yearly themes, love & career predictions. Your full year astrological guide.`;
  const image = `${OG_BASE}?sign=${encode(signName)}&year=${encode(year)}`;

  return {
    title,
    description,
    keywords: formatKeywords(
      `${signName} horoscope ${year}`,
      `${signName} astrology ${year}`,
      `${signName} ${year} predictions`,
      'yearly horoscope',
      `${signName} monthly forecast`,
      `${signName} ${year} forecast`,
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
      title: `${signName} Horoscope ${year}`,
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
  const title = `${signName} Horoscope ${monthName} ${year}: Monthly Predictions`;
  const description = `Your complete ${signName} horoscope for ${monthName} ${year}! Discover your lucky days, power color, love forecast & career opportunities. Free detailed monthly predictions.`;
  const image = `${OG_BASE}?sign=${encode(signName)}&month=${encode(monthSlug)}&year=${encode(year)}`;

  return {
    title,
    description,
    keywords: formatKeywords(
      `${signName} horoscope ${monthName} ${year}`,
      `${signName} monthly horoscope`,
      `${signName} ${year} astrology`,
      `${signName} ${monthName} forecast`,
      `${signName} ${monthName} predictions`,
      `${signName} lucky days ${monthName}`,
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
      title: `${signName} Horoscope ${monthName} ${year}`,
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
