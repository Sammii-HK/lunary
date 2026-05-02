import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { HoroscopeCosmicConnections } from '@/components/grimoire/HoroscopeCosmicConnections';
import { PlacementSelector } from '@/components/grimoire/PlacementSelector';
import { signMeta } from '@/lib/horoscope-meta';

import {
  ZODIAC_SIGNS,
  SIGN_DISPLAY_NAMES,
  SIGN_SYMBOLS,
  SIGN_ELEMENTS,
  ZodiacSign,
  MONTHS,
} from '@/constants/seo/monthly-horoscope';
import { formatRulershipValue } from '@/lib/astrology/rulerships';
import { buildTransitWindowSnapshot } from '@/lib/horoscope/monthly-forecast';

// 30-day revalidation for sign overview pages
export const revalidate = 2592000;
export const dynamicParams = false;

const AVAILABLE_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

function resolveOgImageUrl(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof URL) return value.toString();
  if (typeof value === 'object' && value !== null) {
    const candidate = value as { url?: string | URL; src?: string | URL };
    if (typeof candidate.url === 'string') return candidate.url;
    if (candidate.url instanceof URL) return candidate.url.toString();
    if (typeof candidate.src === 'string') return candidate.src;
    if (candidate.src instanceof URL) return candidate.src.toString();
  }
  return undefined;
}

function resolveCanonicalUrl(value: unknown, fallback: string): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  if (value instanceof URL) return value.toString();
  if (typeof value === 'object' && value !== null) {
    const candidate = value as { canonical?: string | URL };
    if (typeof candidate.canonical === 'string') return candidate.canonical;
    if (candidate.canonical instanceof URL)
      return candidate.canonical.toString();
  }
  return fallback;
}

export function generateStaticParams() {
  return ZODIAC_SIGNS.map((sign) => ({ sign }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string }>;
}): Promise<Metadata> {
  const { sign } = await params;
  const signKey = sign.toLowerCase() as ZodiacSign;

  if (!ZODIAC_SIGNS.includes(signKey)) {
    return { title: 'Sign Not Found | Lunary' };
  }

  const signName = SIGN_DISPLAY_NAMES[signKey];
  return {
    ...signMeta(signName, sign),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SignHoroscopePage({
  params,
}: {
  params: Promise<{ sign: string }>;
}) {
  const { sign } = await params;
  const signKey = sign.toLowerCase() as ZodiacSign;

  if (!ZODIAC_SIGNS.includes(signKey)) {
    notFound();
  }

  const signName = SIGN_DISPLAY_NAMES[signKey];
  const symbol = SIGN_SYMBOLS[signKey];
  const element = SIGN_ELEMENTS[signKey];
  const rulership = formatRulershipValue(signName);

  const heroContent = (
    <div className='text-center space-y-3'>
      <span className='text-6xl'>{symbol}</span>
      <p className='text-sm uppercase tracking-[0.3em] text-content-muted'>
        {element} Sign • Rulership: {rulership}
      </p>
    </div>
  );

  const birthChartCta = {
    text: 'Get your personalised horoscope based on your full birth chart',
    href: '/horoscope',
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthSlug = MONTHS[now.getMonth()];
  const currentSnapshot = buildTransitWindowSnapshot(
    signKey,
    now,
    now,
    'Today',
  );

  const meta = signMeta(signName, sign);
  const canonicalValue =
    meta.alternates?.canonical ?? `/grimoire/horoscopes/${sign}`;
  const canonicalUrl = resolveCanonicalUrl(
    canonicalValue,
    `/grimoire/horoscopes/${sign}`,
  );
  const metaTitle = meta.title ? String(meta.title) : undefined;
  const keywords =
    Array.isArray(meta.keywords) || typeof meta.keywords === 'string'
      ? Array.isArray(meta.keywords)
        ? meta.keywords
        : [meta.keywords]
      : [];
  const openGraphImages = meta.openGraph?.images
    ? Array.isArray(meta.openGraph.images)
      ? meta.openGraph.images
      : [meta.openGraph.images]
    : [];
  const resolvedImage = openGraphImages
    .map(resolveOgImageUrl)
    .find((value): value is string => typeof value === 'string');
  const image = resolvedImage ?? 'https://lunary.app/api/og/cosmic';

  return (
    <SEOContentTemplate
      title={metaTitle ?? `${signName} Horoscopes`}
      h1={`${signName} Horoscopes`}
      description={meta.description ?? ''}
      keywords={keywords}
      canonicalUrl={canonicalUrl}
      tldr={currentSnapshot.summary}
      image={image}
      imageAlt={`${signName} Horoscopes | Lunary`}
      intro={`Select a year to read ${signName} horoscopes written with real planetary context. Each month is grounded in actual sky movement, not generic mood-board filler.`}
      meaning={`${signName} is a ${element} sign with rulership ${rulership}. ${currentSnapshot.summary} ${currentSnapshot.focus}`}
      heroContent={heroContent}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Horoscopes', href: '/grimoire/horoscopes' },
        { label: signName },
      ]}
      cosmicConnections={
        <HoroscopeCosmicConnections
          variant='sign-root'
          sign={signKey}
          monthSlug={currentMonthSlug}
          year={currentYear}
          currentYear={currentYear}
        />
      }
      components={<PlacementSelector signName={signName} />}
      ctaText={birthChartCta.text}
      ctaHref={birthChartCta.href}
      childrenPosition='after-description'
    >
      <section className='mb-12'>
        <h2 className='text-2xl font-medium text-content-primary mb-6'>
          Select a Year
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {AVAILABLE_YEARS.map((year) => (
            <Link
              key={year}
              href={`/grimoire/horoscopes/${sign}/${year}`}
              className='p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/50 hover:border-lunary-primary-600 hover:bg-surface-elevated transition-all text-center group'
            >
              <div className='text-2xl font-light text-content-primary group-hover:text-content-brand transition-colors'>
                {year}
              </div>
              <div className='text-sm text-content-muted mt-1'>
                {signName} Horoscopes
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SEOContentTemplate>
  );
}
