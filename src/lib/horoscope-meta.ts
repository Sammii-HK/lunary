import { Metadata } from 'next';

const BASE_URL = 'https://lunary.app';
const OG_BASE = `${BASE_URL}/api/og/cosmic`;

const encode = (value: string) => encodeURIComponent(value);

const formatKeywords = (...terms: string[]) =>
  terms
    .flatMap((term) => term.split(',').map((fragment) => fragment.trim()))
    .filter(Boolean);

export const signMeta = (signName: string, slug: string): Metadata => {
  const title = `${signName} Horoscope 2025–2030: Monthly & Yearly Forecasts`;
  const description = `${signName} horoscopes for every month from 2025 to 2030. Personalised love, career, health and finance forecasts for ${signName} — updated monthly.`;
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
  // Add specificity + emotional hooks for high-value years
  const yearNum = parseInt(year);
  let title: string;

  if (yearNum === 2027) {
    // 2027 is shaped by: Saturn in Aries (all year), Jupiter Leo→Virgo (H1→H2), Saturn Opposition (Jun-Jan)
    // Based on actual transits from yearly-transits.ts
    const signHooks: Record<string, string> = {
      Aries: 'Saturn in Aries & Mature Leadership Year',
      Taurus: 'Saturn Opposition & Relationship Recalibration',
      Gemini: 'Saturn Alignment & Long-Term Structure',
      Cancer: 'Saturn Opposition & Partnership Evolution',
      Leo: 'Jupiter in Leo & Creative Peak (Until July)',
      Virgo: 'Jupiter Enters Virgo & Health Expansion',
      Libra: 'Saturn Alignment & Authentic Power',
      Scorpio: 'Saturn Foundations & Deep Transformation',
      Sagittarius: 'Saturn Integration & Disciplined Vision',
      Capricorn: 'Saturn Opposition & Full Circle Completion',
      Aquarius: 'Saturn Evolution & Visionary Grounding',
      Pisces: 'Saturn Clarity & Spiritual Integration',
    };
    const hook =
      signHooks[signName] || `${year} Yearly Forecast & Major Shifts`;
    title = `${signName} Horoscope 2027: ${hook}`;
  } else {
    title = `${signName} Horoscope ${year}: Love, Career & Year Ahead`;
  }

  const description = `Your complete ${signName} horoscope for ${year}. All 12 monthly forecasts, yearly themes, love, career and wellness predictions — personalised to your sign.`;
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
  const title = `${signName} Horoscope ${monthName} ${year}: Love, Career & What to Expect`;
  const description = `Your personalised ${signName} horoscope for ${monthName} ${year}. Lucky days, power colour, love & career forecasts, plus what the transits mean for your sign this month.`;
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
