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
  if (year < 2024 || year > 2030) return null;

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
        `/api/og/horoscope?sign=${encodeURIComponent(sign)}&month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}&size=landscape`,
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
  const prevMonth = monthIndex > 0 ? MONTHS[monthIndex - 1] : null;
  const nextMonth = monthIndex < 11 ? MONTHS[monthIndex + 1] : null;

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

### Practical Focus

If you want a simple roadmap, focus on one core intention connected to ${theme.focus}. Build small, consistent actions around it, and notice how that shifts your confidence and direction throughout the month.

### Love, Career, and Wellbeing

In love, emphasize ${theme.opportunities} and practice patience around ${theme.challenges}. For career or school, let ${theme.focus} guide your priorities and set clear boundaries where needed. For wellbeing, support your ${element.toLowerCase()} energy with routines that keep you steady and focused.
      `}
      howToWorkWith={[
        'Choose one focus area and set a simple intention for the month.',
        'Schedule important actions on your lucky days when possible.',
        `Use ${theme.powerColor} in clothing or ritual tools for support.`,
        `Reflect on ${theme.challenges} as a growth edge, not a flaw.`,
        'Track how the theme shows up in love, work, and wellbeing.',
      ]}
      rituals={[
        `Light a ${theme.powerColor} candle and set a clear monthly intention.`,
        'Write a short affirmation and place it on your altar.',
        'Do a mid‑month check‑in and adjust your plan if needed.',
        'Close the month with a gratitude and release ritual.',
      ]}
      journalPrompts={[
        `Where can I lean into ${theme.focus} without overextending?`,
        `What is the first step toward ${theme.opportunities}?`,
        `How can I respond to ${theme.challenges} with more clarity?`,
        'What felt most aligned this month, and why?',
      ]}
      faqs={[
        {
          question: `Is this ${signName} horoscope personalized?`,
          answer:
            'It is a Sun‑sign forecast. For deeper personalization, use your full birth chart and rising sign.',
        },
        {
          question: `How often should I check this horoscope?`,
          answer:
            'Read it at the start of the month and revisit mid‑month to stay aligned with the theme.',
        },
        {
          question: `Can I use the power color daily?`,
          answer:
            'Yes. Small touches like accessories, stationery, or candles help reinforce the month’s intention without overthinking it.',
        },
        {
          question: 'What if the horoscope feels off?',
          answer:
            'Check your Rising and Moon signs as well. Those placements often reflect timing and emotions more precisely.',
        },
      ]}
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
      relatedItems={[
        {
          name: `${signName} Zodiac Sign`,
          href: `/grimoire/zodiac/${sign}`,
          type: 'Zodiac',
        },
        {
          name: `${SIGN_DISPLAY_NAMES[prevSign]} Horoscope ${monthName}`,
          href: `/grimoire/horoscopes/${prevSign}/${year}/${month}`,
          type: 'Horoscope',
        },
        {
          name: `${SIGN_DISPLAY_NAMES[nextSign]} Horoscope ${monthName}`,
          href: `/grimoire/horoscopes/${nextSign}/${year}/${month}`,
          type: 'Horoscope',
        },
        {
          name: `${ruler} in Astrology`,
          href: `/grimoire/astronomy/planets/${ruler.toLowerCase()}`,
          type: 'Planet',
        },
      ]}
      internalLinks={[
        {
          text: `${signName} Horoscopes`,
          href: `/grimoire/horoscopes/${sign}`,
        },
        { text: 'Monthly Horoscopes', href: '/grimoire/horoscopes' },
        { text: 'Personalized Horoscope', href: '/horoscope' },
      ]}
      ctaText={`Get your personalized ${signName} reading`}
      ctaHref='/horoscope'
      sources={[
        { name: 'Planetary transit calculations' },
        { name: 'Traditional astrological interpretations' },
      ]}
    >
      <div className='mt-8 flex justify-between text-sm'>
        <div className='space-x-4'>
          {prevMonth && (
            <Link
              href={`/grimoire/horoscopes/${sign}/${year}/${prevMonth}`}
              className='text-lunary-primary-400 hover:text-lunary-primary-300'
            >
              ← {MONTH_DISPLAY_NAMES[prevMonth]}
            </Link>
          )}
        </div>
        <div className='space-x-4'>
          {nextMonth && (
            <Link
              href={`/grimoire/horoscopes/${sign}/${year}/${nextMonth}`}
              className='text-lunary-primary-400 hover:text-lunary-primary-300'
            >
              {MONTH_DISPLAY_NAMES[nextMonth]} →
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
