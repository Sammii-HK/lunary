import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ZODIAC_SIGNS,
  MONTHS,
  SIGN_DISPLAY_NAMES,
  MONTH_DISPLAY_NAMES,
  SIGN_SYMBOLS,
  SIGN_ELEMENTS,
  SIGN_RULERS,
  getMonthlyTheme,
  ZodiacSign,
  Month,
} from '@/constants/seo/monthly-horoscope';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { HoroscopeCosmicConnections } from '@/components/grimoire/HoroscopeCosmicConnections';
import { monthMeta, articleSchema } from '@/lib/horoscope-meta';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// 30-day revalidation for monthly horoscopes
export const revalidate = 2592000;

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

interface PageParams {
  sign: string;
  year: string;
  month: string;
}

function validateParams(params: PageParams): {
  sign: ZodiacSign;
  year: number;
  month: Month;
  monthNumber: number;
} | null {
  const sign = params.sign.toLowerCase() as ZodiacSign;
  const month = params.month.toLowerCase() as Month;
  const year = parseInt(params.year, 10);

  if (!ZODIAC_SIGNS.includes(sign)) return null;
  if (!MONTHS.includes(month)) return null;
  if (year < 2025 || year > 2030) return null;

  const monthNumber = MONTHS.indexOf(month) + 1;
  return { sign, year, month, monthNumber };
}

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const validated = validateParams(resolvedParams);

  if (!validated) {
    return { title: 'Horoscope Not Found | Lunary' };
  }

  const { sign, year, month, monthNumber } = validated;
  const signName = SIGN_DISPLAY_NAMES[sign];
  const monthName = MONTH_DISPLAY_NAMES[month];

  return monthMeta(signName, sign, String(year), month, monthName, monthNumber);
}

export default async function MonthlyHoroscopePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = await params;
  const validated = validateParams(resolvedParams);
  const currentYear = new Date().getFullYear();

  if (!validated) {
    notFound();
  }

  const { sign, year, month, monthNumber } = validated;
  const signName = SIGN_DISPLAY_NAMES[sign];
  const monthName = MONTH_DISPLAY_NAMES[month];
  const symbol = SIGN_SYMBOLS[sign];
  const element = SIGN_ELEMENTS[sign];
  const ruler = SIGN_RULERS[sign];
  const theme = getMonthlyTheme(sign, month, year);

  const monthIndex = MONTHS.indexOf(month);
  const prevMonth = monthIndex > 0 ? MONTHS[monthIndex - 1] : MONTHS[11];
  const nextMonth = monthIndex < 11 ? MONTHS[monthIndex + 1] : MONTHS[0];

  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  const prevSign =
    signIndex > 0 ? ZODIAC_SIGNS[signIndex - 1] : ZODIAC_SIGNS[11];
  const nextSign =
    signIndex < 11 ? ZODIAC_SIGNS[signIndex + 1] : ZODIAC_SIGNS[0];

  const meta = monthMeta(
    signName,
    sign,
    String(year),
    month,
    monthName,
    monthNumber,
  );
  const canonicalSource =
    meta.alternates?.canonical ??
    `/grimoire/horoscopes/${sign}/${year}/${month}`;
  const canonicalUrl =
    typeof canonicalSource === 'string'
      ? canonicalSource
      : String(canonicalSource);
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
  const articleLd = articleSchema(
    signName,
    String(year),
    monthName,
    monthNumber,
  );

  return (
    <SEOContentTemplate
      title={metaTitle ?? `${signName} Horoscope ${monthName} ${year}`}
      h1={`${symbol} ${signName} Horoscope ${monthName} ${year}: Your Complete Monthly Guide`}
      description={meta.description ?? ''}
      keywords={keywords}
      canonicalUrl={canonicalUrl}
      image={image}
      imageAlt={`${signName} ${monthName} ${year} Horoscope | Lunary`}
      datePublished={`${year}-${String(monthNumber).padStart(2, '0')}-01`}
      articleSection='Monthly Horoscopes'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Horoscopes', href: '/grimoire/horoscopes' },
        { label: signName, href: `/grimoire/horoscopes/${sign}` },
        { label: String(year), href: `/grimoire/horoscopes/${sign}/${year}` },
        { label: monthName },
      ]}
      whatIs={{
        question: `What can ${signName} expect in ${monthName} ${year}?`,
        answer: `${monthName} ${year} for ${signName} focuses on ${theme.focus}. This month brings opportunities in ${theme.opportunities}, with challenges around ${theme.challenges}. Lucky days are ${theme.luckyDays.join(', ')}, and your power color is ${theme.powerColor}.`,
      }}
      tldr={`${signName}, ${monthName} brings ${theme.opportunities}. Focus on ${theme.focus}. Luck Days: ${theme.luckyDays.join(' & ')} (wear ${theme.powerColor}). Navigate: ${theme.challenges}.`}
      faqs={[
        {
          question: `What can ${signName} expect in ${monthName} ${year}?`,
          answer: `${signName} ${monthName} ${year} focuses on ${theme.focus}. Key highlights include lucky days on the ${theme.luckyDays.join(', ')}, power color ${theme.powerColor}, main opportunity in ${theme.opportunities}, and key challenge around ${theme.challenges}.`,
        },
        {
          question: `What are the lucky days for ${signName} in ${monthName} ${year}?`,
          answer: `The most auspicious days for ${signName} in ${monthName} ${year} are ${theme.luckyDays.join(', ')}. These dates carry especially favorable energy for ${signName}.`,
        },
        {
          question: `What is ${signName}'s power color for ${monthName} ${year}?`,
          answer: `${signName}'s power color for ${monthName} ${year} is ${theme.powerColor}. Incorporating this color can help align your energy with the month's cosmic themes.`,
        },
      ]}
      meaning={`
## ${signName} Overview for ${monthName} ${year}

Dear ${signName}, ${monthName} ${year} brings important cosmic shifts that will impact your ${theme.focus}. As a ${element} sign guided by ${ruler}, you have natural strengths that will serve you well this month.

### Monthly Focus

This month emphasizes ${theme.focus}. The planetary alignments suggest this is an ideal time to direct your energy toward these areas of life. ${signName}'s natural ${element.toLowerCase()} energy harmonizes beautifully with these themes.

### Challenges to Navigate

Be mindful of ${theme.challenges}. This is a common growth edge for ${signName} during this period. Your ruling planet ${ruler} offers guidance—channel its energy consciously to overcome obstacles.

### Opportunities Ahead

The cosmos opens doors for ${theme.opportunities}. This is where ${signName} can truly shine this month. Trust your instincts and take aligned action when these opportunities present themselves.

### Lucky Days

The ${theme.luckyDays.join(', ')} of ${monthName} carry especially favorable energy for you. Consider scheduling important meetings, launches, or personal initiatives on these dates.

### Power Color

Wearing or surrounding yourself with ${theme.powerColor} can help align your energy with the month's cosmic currents.

### Love

In love, ${signName} benefits from focusing on ${theme.opportunities}. Keep communication soft and steady while navigating ${theme.challenges}. Small acts of care build momentum this month.

### Career

Career energy centers on ${theme.focus}. Prioritize what is most visible and measurable, and use your ${element.toLowerCase()} strengths to move toward ${theme.opportunities}.

### Year Ahead

${monthName} sets the tone for ${year}. Use this month to lay foundations that support your bigger goals, especially around ${theme.focus} and ${theme.opportunities}.
      `}
      emotionalThemes={[
        `Focus: ${theme.focus}`,
        `Challenge: ${theme.challenges}`,
        `Opportunity: ${theme.opportunities}`,
        `Power Color: ${theme.powerColor}`,
      ]}
      signsMostAffected={[signName]}
      tables={[
        {
          title: `${signName} ${monthName} ${year} At a Glance`,
          headers: ['Aspect', 'Details'],
          rows: [
            ['Sign', `${signName} ${symbol}`],
            ['Element', element],
            ['Ruling Planet', ruler],
            ['Monthly Focus', theme.focus],
            ['Key Challenge', theme.challenges],
            ['Opportunity', theme.opportunities],
            ['Lucky Days', theme.luckyDays.join(', ')],
            ['Power Color', theme.powerColor],
          ],
        },
      ]}
      cosmicConnections={
        <HoroscopeCosmicConnections
          variant='monthly-sign'
          sign={sign}
          monthSlug={month}
          year={year}
          currentYear={currentYear}
        />
      }
      ctaText={`Get your personalized ${signName} reading`}
      ctaHref='/horoscope'
      sources={[
        { name: 'Planetary transit calculations' },
        { name: 'Traditional astrological interpretations' },
      ]}
      additionalSchemas={[articleLd]}
    >
      <div className='mt-8 flex justify-between text-lg'>
        <div className='space-x-4'>
          {prevMonth && (
            <Link
              href={`/grimoire/horoscopes/${sign}/${year}/${prevMonth}`}
              className='text-lunary-primary-400 hover:text-lunary-primary-300 flex items-center gap-2'
            >
              <ArrowLeft className='w-4 h-4' />
              {MONTH_DISPLAY_NAMES[prevMonth]}
            </Link>
          )}
        </div>
        <div className='space-x-4'>
          {nextMonth && (
            <Link
              href={`/grimoire/horoscopes/${sign}/${year}/${nextMonth}`}
              className='text-lunary-primary-400 hover:text-lunary-primary-300 flex items-center gap-2'
            >
              {MONTH_DISPLAY_NAMES[nextMonth]}
              <ArrowRight className='w-4 h-4' />
            </Link>
          )}
        </div>
      </div>

      <div className='mt-6 flex flex-wrap gap-2 justify-center'>
        {ZODIAC_SIGNS.map((s) => (
          <Link
            key={s}
            href={`/grimoire/horoscopes/${s}/${year}/${month}`}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              s === sign
                ? 'bg-lunary-primary-900/30 text-lunary-primary-200 border border-lunary-primary-600'
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            {SIGN_SYMBOLS[s]} {SIGN_DISPLAY_NAMES[s]}
          </Link>
        ))}
      </div>
    </SEOContentTemplate>
  );
}
