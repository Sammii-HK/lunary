import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  ZODIAC_SIGNS,
  MONTHS,
  SIGN_DISPLAY_NAMES,
  SIGN_SYMBOLS,
  SIGN_ELEMENTS,
  MONTH_DISPLAY_NAMES,
  ZodiacSign,
} from '@/constants/seo/monthly-horoscope';

const AVAILABLE_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

export async function generateStaticParams() {
  const params: { sign: string; year: string }[] = [];

  ZODIAC_SIGNS.forEach((sign) => {
    AVAILABLE_YEARS.forEach((year) => {
      params.push({
        sign,
        year: String(year),
      });
    });
  });

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string; year: string }>;
}): Promise<Metadata> {
  const { sign, year } = await params;
  const signKey = sign.toLowerCase() as ZodiacSign;
  const yearNum = parseInt(year);

  if (!ZODIAC_SIGNS.includes(signKey) || !AVAILABLE_YEARS.includes(yearNum)) {
    return { title: 'Not Found | Lunary' };
  }

  const signName = SIGN_DISPLAY_NAMES[signKey];
  const title = `${signName} Horoscope ${year}: All Monthly Forecasts | Lunary`;
  const description = `${signName} horoscope for all 12 months of ${year}. Complete monthly predictions including love, career, and life guidance for ${signName}.`;

  return {
    title,
    description,
    keywords: [
      `${signName.toLowerCase()} horoscope ${year}`,
      `${signName.toLowerCase()} ${year}`,
      `${signName.toLowerCase()} monthly horoscope`,
      `${year} horoscope`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/horoscopes/${sign}/${year}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/horoscopes/${sign}/${year}`,
    },
  };
}

export default async function YearHoroscopePage({
  params,
}: {
  params: Promise<{ sign: string; year: string }>;
}) {
  const { sign, year } = await params;
  const signKey = sign.toLowerCase() as ZodiacSign;
  const yearNum = parseInt(year);

  if (!ZODIAC_SIGNS.includes(signKey) || !AVAILABLE_YEARS.includes(yearNum)) {
    notFound();
  }

  const signName = SIGN_DISPLAY_NAMES[signKey];
  const symbol = SIGN_SYMBOLS[signKey];
  const element = SIGN_ELEMENTS[signKey];

  const tableOfContents = [
    { label: 'Select a Month', href: '#select-month' },
    { label: 'Other Years', href: '#other-years' },
    { label: 'Other Signs', href: '#other-signs' },
    { label: 'Personalized Forecast', href: '#personalized-forecast' },
  ];

  const heroContent = (
    <div className='text-center'>
      <span className='text-6xl mb-4 block'>{symbol}</span>
      <p className='text-lg text-zinc-400'>
        Monthly forecasts for {signName} • {element} Sign
      </p>
    </div>
  );

  const sections = (
    <>
      <section id='select-month' className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
          Select a Month
        </h2>
        <div className='grid grid-cols-3 md:grid-cols-4 gap-4'>
          {MONTHS.map((month) => (
            <Link
              key={month}
              href={`/grimoire/horoscopes/${sign}/${year}/${month}`}
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all text-center group'
            >
              <div className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                {MONTH_DISPLAY_NAMES[month]}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id='other-years' className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>Other Years</h2>
        <div className='flex flex-wrap gap-2'>
          {AVAILABLE_YEARS.filter((y) => y !== yearNum).map((y) => (
            <Link
              key={y}
              href={`/grimoire/horoscopes/${sign}/${y}`}
              className='px-4 py-2 rounded-lg bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-sm'
            >
              {y}
            </Link>
          ))}
        </div>
      </section>

      <section id='other-signs' className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
          Other Signs for {year}
        </h2>
        <div className='flex flex-wrap gap-2'>
          {ZODIAC_SIGNS.filter((s) => s !== signKey).map((s) => (
            <Link
              key={s}
              href={`/grimoire/horoscopes/${s}/${year}`}
              className='px-4 py-2 rounded-lg bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-sm'
            >
              {SIGN_SYMBOLS[s]} {SIGN_DISPLAY_NAMES[s]}
            </Link>
          ))}
        </div>
      </section>

      <section
        id='personalized-forecast'
        className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'
      >
        <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
          Get Your Full {year} Forecast
        </h2>
        <p className='text-zinc-300 mb-4'>
          Want a personalized yearly forecast? Get insights tailored to your
          complete birth chart, not just your Sun sign.
        </p>
      </section>
    </>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title={`${signName} Horoscope ${year}: All Monthly Forecasts | Lunary`}
        h1={`${signName} Horoscope ${year}`}
        description={`${signName} horoscope for all 12 months of ${year}. Complete monthly predictions including love, career, and life guidance.`}
        keywords={[
          `${signName.toLowerCase()} horoscope ${year}`,
          `${signName.toLowerCase()} ${year}`,
          `${signName.toLowerCase()} monthly horoscope`,
          `${year} horoscope`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/horoscopes/${sign}/${year}`}
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        intro={`Explore every ${signName} monthly horoscope for ${year}. Use this page to navigate month by month and align your goals with the year’s overall rhythm.`}
        tldr={`${signName} in ${year}: browse all twelve monthly forecasts and track themes as they unfold.`}
        meaning={`Yearly horoscope hubs help you see the larger arc. Each month adds a chapter—some focus on growth, others on integration. When you read the year as a whole, patterns become easier to spot and act on.

Use this page as your planning tool. Mark months that feel supportive for launches, relationships, or rest, then check back as transits shift.

Think in seasons: identify one quarter for expansion, one for consolidation, and one for rest. This rhythm helps ${signName} stay aligned instead of overextending.

If you want a clear start, choose a single yearly theme—such as stability, creativity, or visibility—and use each monthly horoscope to support that theme.

Another useful method is to assign “focus seasons.” Give yourself one season to expand, one to refine, one to rest, and one to integrate. This keeps the year balanced and helps you avoid burnout.`}
        howToWorkWith={[
          'Scan all months and highlight the ones that feel most aligned.',
          'Set a yearly intention and break it into monthly milestones.',
          `Use ${signName}’s element (${element}) to guide your pacing.`,
          'Revisit quarterly to adjust your focus.',
        ]}
        rituals={[
          'Create a simple yearly altar with one symbol for each season.',
          'Light a candle on the first day of each month and set an intention.',
          'Do a mid‑year reflection and update your goals.',
        ]}
        tables={[
          {
            title: `${signName} ${year} Planning Guide`,
            headers: ['Step', 'Focus'],
            rows: [
              ['Quarter 1', 'Set direction and choose priorities'],
              ['Quarter 2', 'Build momentum and refine habits'],
              ['Quarter 3', 'Evaluate progress and adjust'],
              ['Quarter 4', 'Rest, integrate, and prepare for next year'],
            ],
          },
        ]}
        journalPrompts={[
          `What do I want ${year} to teach me as a ${signName}?`,
          'Which months feel expansive, and which feel restorative?',
          'How can I honor my energy cycles throughout the year?',
          'What is one habit that will support me all year?',
        ]}
        faqs={[
          {
            question: 'Is this the same as a yearly horoscope?',
            answer:
              'This page links to all monthly horoscopes for the year. Reading them together creates a yearly overview.',
          },
          {
            question: 'Do I need to read every month?',
            answer:
              'No. Focus on the months most relevant to your plans, then revisit as needed.',
          },
          {
            question: 'How do I pick my focus months?',
            answer:
              'Look at upcoming goals and choose months with supportive themes. Use quieter months for rest and integration.',
          },
          {
            question: 'How should I use this with my birth chart?',
            answer:
              'Read the monthly forecasts for your Sun and Rising signs, then compare them with major transits in your chart for deeper alignment.',
          },
        ]}
        internalLinks={[
          { text: 'Monthly Horoscopes', href: '/grimoire/horoscopes' },
          {
            text: `${signName} Horoscopes`,
            href: `/grimoire/horoscopes/${sign}`,
          },
          { text: 'Personalized Horoscope', href: '/horoscope' },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Horoscopes', href: '/grimoire/horoscopes' },
          { label: `${signName}` },
          { label: year },
        ]}
        ctaText='Get Personalized Forecast'
        ctaHref='/horoscope'
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
