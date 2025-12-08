import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
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
      url: `https://lunary.app/horoscope/${sign}`,
    },
    alternates: {
      canonical: `https://lunary.app/horoscope/${sign}`,
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

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <nav className='text-sm text-zinc-500 mb-8'>
          <Link href='/horoscope' className='hover:text-zinc-300'>
            Horoscope
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-zinc-300'>{signName}</span>
        </nav>

        <header className='mb-12 text-center'>
          <span className='text-6xl mb-4 block'>{symbol}</span>
          <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-4'>
            {signName} Horoscopes
          </h1>
          <p className='text-lg text-zinc-400'>
            {element} Sign • Ruled by {ruler}
          </p>
        </header>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Select a Year
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {AVAILABLE_YEARS.map((year) => (
              <Link
                key={year}
                href={`/horoscope/${sign}/${year}`}
                className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all text-center group'
              >
                <div className='text-2xl font-light text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                  {year}
                </div>
                <div className='text-sm text-zinc-500 mt-1'>
                  {signName} Horoscopes
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Other Signs
          </h2>
          <div className='flex flex-wrap gap-2'>
            {ZODIAC_SIGNS.filter((s) => s !== signKey).map((s) => (
              <Link
                key={s}
                href={`/horoscope/${s}`}
                className='px-4 py-2 rounded-lg bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-sm'
              >
                {SIGN_SYMBOLS[s]} {SIGN_DISPLAY_NAMES[s]}
              </Link>
            ))}
          </div>
        </section>

        <section className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            Get Personalized {signName} Insights
          </h2>
          <p className='text-zinc-300 mb-4'>
            Your horoscope is more than your Sun sign. Get personalized insights
            based on your complete birth chart.
          </p>
          <Link
            href='/welcome'
            className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
          >
            Get Your Personal Horoscope
          </Link>
        </section>
      </div>
    </div>
  );
}
