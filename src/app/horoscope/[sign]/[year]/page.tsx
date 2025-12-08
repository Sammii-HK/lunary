import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ZODIAC_SIGNS,
  MONTHS,
  SIGN_DISPLAY_NAMES,
  SIGN_SYMBOLS,
  SIGN_ELEMENTS,
  MONTH_DISPLAY_NAMES,
  ZodiacSign,
  Month,
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
      url: `https://lunary.app/horoscope/${sign}/${year}`,
    },
    alternates: {
      canonical: `https://lunary.app/horoscope/${sign}/${year}`,
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

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <nav className='text-sm text-zinc-500 mb-8'>
          <Link href='/horoscope' className='hover:text-zinc-300'>
            Horoscope
          </Link>
          <span className='mx-2'>/</span>
          <Link href={`/horoscope/${sign}`} className='hover:text-zinc-300'>
            {signName}
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-zinc-300'>{year}</span>
        </nav>

        <header className='mb-12 text-center'>
          <span className='text-6xl mb-4 block'>{symbol}</span>
          <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-4'>
            {signName} Horoscope {year}
          </h1>
          <p className='text-lg text-zinc-400'>
            Monthly forecasts for {signName} • {element} Sign
          </p>
        </header>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Select a Month
          </h2>
          <div className='grid grid-cols-3 md:grid-cols-4 gap-4'>
            {MONTHS.map((month) => (
              <Link
                key={month}
                href={`/horoscope/${sign}/${year}/${month}`}
                className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all text-center group'
              >
                <div className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                  {MONTH_DISPLAY_NAMES[month]}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Other Years
          </h2>
          <div className='flex flex-wrap gap-2'>
            {AVAILABLE_YEARS.filter((y) => y !== yearNum).map((y) => (
              <Link
                key={y}
                href={`/horoscope/${sign}/${y}`}
                className='px-4 py-2 rounded-lg bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-sm'
              >
                {y}
              </Link>
            ))}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Other Signs for {year}
          </h2>
          <div className='flex flex-wrap gap-2'>
            {ZODIAC_SIGNS.filter((s) => s !== signKey).map((s) => (
              <Link
                key={s}
                href={`/horoscope/${s}/${year}`}
                className='px-4 py-2 rounded-lg bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-sm'
              >
                {SIGN_SYMBOLS[s]} {SIGN_DISPLAY_NAMES[s]}
              </Link>
            ))}
          </div>
        </section>

        <section className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            Get Your Full {year} Forecast
          </h2>
          <p className='text-zinc-300 mb-4'>
            Want a personalized yearly forecast? Get insights tailored to your
            complete birth chart, not just your Sun sign.
          </p>
          <Link
            href='/welcome'
            className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
          >
            Get Personalized Forecast
          </Link>
        </section>
      </div>
    </div>
  );
}
