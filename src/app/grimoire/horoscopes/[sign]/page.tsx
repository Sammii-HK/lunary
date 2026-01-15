import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  ZODIAC_SIGNS,
  SIGN_DISPLAY_NAMES,
  SIGN_SYMBOLS,
  SIGN_ELEMENTS,
  SIGN_RULERS,
  ZodiacSign,
} from '@/constants/seo/monthly-horoscope';

const AVAILABLE_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

export async function generateStaticParams() {
  return ZODIAC_SIGNS.map((sign) => ({
    sign,
  }));
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
  const title = `${signName} Horoscopes: Monthly Predictions & Forecasts | Lunary`;
  const description = `${signName} horoscopes for all months and years. Get detailed monthly predictions for ${signName} including love, career, health, and finance forecasts.`;

  return {
    title,
    description,
    keywords: [
      `${signName.toLowerCase()} horoscope`,
      `${signName.toLowerCase()} monthly horoscope`,
      `${signName.toLowerCase()} predictions`,
      `${signName.toLowerCase()} forecast`,
      'monthly horoscope',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/horoscopes/${sign}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/horoscopes/${sign}`,
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
  const ruler = SIGN_RULERS[signKey];

  const breadcrumbs = [
    { label: 'Grimoire', href: '/grimoire' },
    { label: 'Horoscopes', href: '/grimoire/horoscopes' },
    { label: signName },
  ];

  const heroContent = (
    <div className='text-center'>
      <span className='text-6xl mb-4 block'>{symbol}</span>
      <p className='text-lg text-zinc-400'>
        {element} Sign • Ruled by {ruler}
      </p>
    </div>
  );

  const sections = (
    <>
      <section id='select-year' className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
          Select a Year
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {AVAILABLE_YEARS.map((year) => (
            <Link
              key={year}
              href={`/grimoire/horoscopes/${sign}/${year}`}
              className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all text-center group'
            >
              <div className='text-2xl font-light text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                {year}
              </div>
              <div className='text-sm text-zinc-400 mt-1'>
                {signName} Horoscopes
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id='other-signs' className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>Other Signs</h2>
        <div className='flex flex-wrap gap-2'>
          {ZODIAC_SIGNS.filter((s) => s !== signKey).map((s) => (
            <Link
              key={s}
              href={`/grimoire/horoscopes/${s}`}
              className='px-4 py-2 rounded-lg bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-sm'
            >
              {SIGN_SYMBOLS[s]} {SIGN_DISPLAY_NAMES[s]}
            </Link>
          ))}
        </div>
      </section>

      <section
        id='personalized-insights'
        className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'
      >
        <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
          Get Personalized {signName} Insights
        </h2>
        <p className='text-zinc-300 mb-4'>
          Your horoscope is more than your Sun sign. Get personalized insights
          based on your complete birth chart.
        </p>
        <Link
          href='/horoscope'
          className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
        >
          Get Your Personal Horoscope
        </Link>
      </section>
    </>
  );

  const tableOfContents = [
    { label: 'Select a Year', href: '#select-year' },
    { label: 'Other Signs', href: '#other-signs' },
    { label: 'Personalized Insights', href: '#personalized-insights' },
  ];

  return (
    <SEOContentTemplate
      title={`${signName} Horoscopes: Monthly Predictions & Forecasts | Lunary`}
      h1={`${signName} Horoscopes`}
      description={`${signName} horoscopes for all months and years. Get detailed monthly predictions for ${signName} including love, career, health, and finance forecasts.`}
      keywords={[
        `${signName.toLowerCase()} horoscope`,
        `${signName.toLowerCase()} monthly horoscope`,
        `${signName.toLowerCase()} predictions`,
        `${signName.toLowerCase()} forecast`,
        'monthly horoscope',
      ]}
      canonicalUrl={`https://lunary.app/grimoire/horoscopes/${sign}`}
      tableOfContents={tableOfContents}
      breadcrumbs={breadcrumbs}
      intro={`Explore monthly horoscopes tailored to ${signName}. This hub helps you find the year and month you need while offering guidance on how ${signName} energy shifts across seasons.`}
      tldr={`${signName} horoscopes highlight monthly themes for love, career, and wellbeing. Choose a year below to explore month‑by‑month guidance.`}
      meaning={`Your ${signName} horoscope reflects how current transits interact with your Sun sign. While everyone experiences the same planetary weather, each sign experiences it differently based on element, modality, and ruling planet.

Use these horoscopes to track patterns across time. Notice which months support expansion and which encourage reflection. The more you track, the more accurate the guidance feels.

If you know your Rising sign, read that horoscope too. Rising sign timing often aligns with life events, while Sun sign horoscopes describe your inner focus and motivation.

When you track multiple months, you’ll notice your personal rhythm—times when ${signName} energy feels bold and expressive, and times when it turns inward for recalibration.

Use your element (${element}) as a practical guide: fire signs need momentum, earth signs need stability, air signs need clarity, and water signs need emotional alignment. This helps translate the forecast into real actions.

Use your ruling planet, ${ruler}, as a timing ally. When ${ruler} is emphasized in the sky (by aspect or transit), your sign tends to feel more energized and clear. Treat those periods as windows for action, and use quieter periods for reflection.`}
      howToWorkWith={[
        'Pick the current year and read the next month’s forecast.',
        'Note one focus theme and align your schedule to support it.',
        `Use ${signName}’s ruling planet (${ruler}) for timing and rituals.`,
        'Compare different months to see your cyclical patterns.',
        'Pair the forecast with your Moon and Rising sign for nuance.',
      ]}
      rituals={[
        `Light a candle and set a ${signName}-aligned intention for the month.`,
        `Wear a color that resonates with your ${element} element during key dates.`,
        `Write a one‑sentence focus statement for your ${signName} season.`,
        'End each month with a release list and gratitude note.',
        `Set a short weekly goal that matches your ${signName} strengths.`,
      ]}
      tables={[
        {
          title: `${signName} Sign Snapshot`,
          headers: ['Attribute', 'Detail'],
          rows: [
            ['Element', element],
            ['Ruling Planet', ruler],
            ['Symbol', symbol],
            ['Best Use', 'Monthly planning and reflection'],
          ],
        },
      ]}
      journalPrompts={[
        `Where does ${signName} energy feel strongest in my life right now?`,
        'What theme keeps repeating across different months?',
        'How can I respond to challenges with more self‑trust?',
        'What does my ruling planet teach me about timing?',
      ]}
      faqs={[
        {
          question: `Do ${signName} horoscopes apply to me if I’m not a ${signName} Sun?`,
          answer:
            'They are designed for Sun signs, but you can also read for your Moon and Rising for added depth.',
        },
        {
          question: 'How often should I check my horoscope?',
          answer:
            'Monthly is a good rhythm for planning and reflection. Revisit mid‑month to adjust intentions.',
        },
        {
          question: `What if ${signName} doesn’t feel like me?`,
          answer:
            'Check your Rising and Moon signs. Those placements often feel more accurate in daily life.',
        },
        {
          question: `What should I focus on each month as a ${signName}?`,
          answer:
            'Pick one theme from the forecast and commit to one concrete action. Small consistent steps are more effective than vague intention‑setting.',
        },
        {
          question: `How do I use my ruling planet, ${ruler}?`,
          answer:
            'Plan important actions when your ruling planet is highlighted by transits. It often marks periods of momentum or clarity for your sign.',
        },
      ]}
      internalLinks={[
        { text: 'Birth Chart Basics', href: '/grimoire/birth-chart' },
        { text: 'Monthly Horoscopes', href: '/grimoire/horoscopes' },
        { text: 'Personalized Horoscope', href: '/horoscope' },
      ]}
      heroContent={heroContent}
    >
      {sections}
    </SEOContentTemplate>
  );
}
