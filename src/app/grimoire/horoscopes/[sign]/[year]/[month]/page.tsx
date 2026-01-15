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
  generateAllHoroscopeParams,
  ZodiacSign,
  Month,
} from '@/constants/seo/monthly-horoscope';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { HoroscopeCosmicConnections } from '@/components/grimoire/HoroscopeCosmicConnections';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PageParams {
  sign: string;
  year: string;
  month: string;
}

function validateParams(
  params: PageParams,
): { sign: ZodiacSign; year: number; month: Month } | null {
  const sign = params.sign.toLowerCase() as ZodiacSign;
  const month = params.month.toLowerCase() as Month;
  const year = parseInt(params.year);

  if (!ZODIAC_SIGNS.includes(sign)) return null;
  if (!MONTHS.includes(month)) return null;
  if (year < year - 5 || year > year + 5) return null;

  return { sign, year, month };
}

export async function generateStaticParams() {
  return generateAllHoroscopeParams();
}

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

  const { sign, year, month } = validated;
  const signName = SIGN_DISPLAY_NAMES[sign];
  const monthName = MONTH_DISPLAY_NAMES[month];

  const title = `${signName} Horoscope ${monthName} ${year}: Monthly Predictions | Lunary`;
  const description = `${signName} horoscope for ${monthName} ${year}. Discover what the stars have in store for ${signName} this month including love, career, health, and financial predictions.`;

  return {
    title,
    description,
    keywords: [
      `${signName.toLowerCase()} horoscope ${monthName.toLowerCase()} ${year}`,
      `${signName.toLowerCase()} ${monthName.toLowerCase()} ${year}`,
      `${signName.toLowerCase()} monthly horoscope`,
      `${monthName.toLowerCase()} ${year} horoscope`,
      'monthly horoscope',
      'zodiac predictions',
      signName.toLowerCase(),
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/horoscopes/${sign}/${year}/${month}`,
      images: [
        `/api/og/cosmic?title=${encodeURIComponent(`${signName} ${SIGN_SYMBOLS[sign]} ${monthName} ${year}`)}`,
      ],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/horoscopes/${sign}/${year}/${month}`,
    },
  };
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

  const { sign, year, month } = validated;
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

  return (
    <SEOContentTemplate
      title={`${signName} Horoscope ${monthName} ${year}`}
      h1={`${symbol} ${signName} Horoscope: ${monthName} ${year}`}
      description={`Your complete ${signName} horoscope for ${monthName} ${year}. As a ${element} sign ruled by ${ruler}, this month brings focus to ${theme.focus}. Discover your cosmic guidance below.`}
      keywords={[
        `${signName} horoscope`,
        monthName,
        String(year),
        'monthly prediction',
        'zodiac forecast',
      ]}
      canonicalUrl={`https://lunary.app/grimoire/horoscopes/${sign}/${year}/${month}`}
      datePublished='2025-01-01'
      dateModified={new Date().toISOString().split('T')[0]}
      articleSection='Monthly Horoscopes'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Horoscopes', href: '/grimoire/horoscopes' },
        { label: signName, href: `/grimoire/horoscopes/${sign}` },
        { label: String(year), href: `/grimoire/horoscopes/${sign}/${year}` },
        { label: monthName },
      ]}
      whatIs={{
        question: `What is the ${signName} horoscope for ${monthName} ${year}?`,
        answer: `${monthName} ${year} for ${signName} focuses on ${theme.focus}. This month, ${signName} individuals may face challenges around ${theme.challenges}, but will find opportunities in ${theme.opportunities}. Lucky days this month are the ${theme.luckyDays.join(', ')}, and your power color is ${theme.powerColor}.`,
      }}
      tldr={`${signName} ${monthName} ${year}: Focus on ${theme.focus}. Lucky days: ${theme.luckyDays.join(', ')}. Power color: ${theme.powerColor}. Key opportunity: ${theme.opportunities}.`}
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
