import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  MONTHS,
  MONTH_DISPLAY_NAMES,
  ZodiacSign,
} from '@/constants/seo/monthly-horoscope';
import { HoroscopeCosmicConnections } from '@/components/grimoire/HoroscopeCosmicConnections';

export const revalidate = 86400;

const signs = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water' },
  {
    name: 'Sagittarius',
    symbol: '♐',
    dates: 'Nov 22 - Dec 21',
    element: 'Fire',
  },
  {
    name: 'Capricorn',
    symbol: '♑',
    dates: 'Dec 22 - Jan 19',
    element: 'Earth',
  },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water' },
];

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 1-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string }>;
}): Promise<Metadata> {
  const { sign } = await params;
  const signData = signs.find((s) => s.name.toLowerCase() === sign);

  if (!signData) {
    return { title: 'Horoscope Not Found' };
  }

  return {
    title: `${signData.name} Horoscope Today: Daily Astrology | Lunary`,
    description: `Today's horoscope for ${signData.name} (${signData.dates}). Daily astrology insights, cosmic guidance, and what the stars have in store for you.`,
    openGraph: {
      title: `${signData.name} Horoscope Today | Lunary`,
      description: `Daily horoscope for ${signData.name}.`,
      url: `https://lunary.app/grimoire/horoscopes/today/${sign}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/horoscopes/today/${sign}`,
    },
  };
}

async function getHoroscope(sign: string): Promise<string | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://lunary.app';
    const gptSecret = process.env.LUNARY_GPT_SECRET;
    const headers: Record<string, string> = {};
    if (gptSecret) {
      headers.authorization = `Bearer ${gptSecret}`;
    }
    const response = await fetch(
      `${baseUrl}/api/gpt/horoscope?sign=${sign}&type=daily`,
      { next: { revalidate: 86400 }, headers },
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.horoscope || null;
  } catch {
    return null;
  }
}

export default async function DailyHoroscopePage({
  params,
}: {
  params: Promise<{ sign: string }>;
}) {
  const { sign } = await params;
  const signData = signs.find((s) => s.name.toLowerCase() === sign);
  const signKey = sign.toLowerCase() as ZodiacSign;

  if (!signData) {
    notFound();
  }

  const signIndex = signs.findIndex((s) => s.name.toLowerCase() === sign);
  const prevSign = signs[(signIndex - 1 + 12) % 12];
  const nextSign = signs[(signIndex + 1) % 12];

  const currentDate = new Date();
  const currentMonth = MONTHS[currentDate.getMonth()];
  const currentMonthName = MONTH_DISPLAY_NAMES[currentMonth];
  const currentYear = currentDate.getFullYear();

  const horoscope = await getHoroscope(sign);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SEOContentTemplate
      title={`${signData.name} Horoscope Today: Daily Astrology | Lunary`}
      h1={`${signData.name} Horoscope Today`}
      description={`Today's horoscope for ${signData.name} (${signData.dates}). Daily astrology insights, cosmic guidance, and what the stars have in store for you.`}
      keywords={[
        `${signData.name} daily horoscope`,
        'horoscope today',
        'daily horoscope',
        'today horoscope',
        'zodiac daily forecast',
      ]}
      canonicalUrl={`https://lunary.app/grimoire/horoscopes/today/${sign}`}
      intro={`Today for ${signData.name} reflects the current Moon and the most active transits. Use this daily pulse as a quick check-in, then go deeper inside the app for your birth-chart timing.`}
      heroContent={
        <div className='text-center space-y-2'>
          <div className='text-4xl md:text-5xl'>{signData.symbol}</div>
          <div className='text-lunary-primary-400 flex items-center justify-center gap-2 text-sm'>
            <Calendar className='w-4 h-4' />
            {today}
          </div>
          <p className='text-zinc-500 text-xs'>{signData.dates}</p>
        </div>
      }
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Horoscopes', href: '/grimoire/horoscopes' },
        { label: 'Today', href: '/grimoire/horoscopes/today' },
        { label: signData.name },
      ]}
      cosmicConnections={
        <HoroscopeCosmicConnections
          variant='daily-hub'
          sign={signKey}
          currentYear={currentYear}
        />
      }
      childrenPosition='after-description'
    >
      <section className='mb-12 grid gap-4 md:grid-cols-3'>
        <div className='rounded-lg border border-zinc-800 bg-zinc-900/40 p-5'>
          <h2 className='text-lg font-medium text-zinc-100 mb-2'>Love</h2>
          <p className='text-sm text-zinc-400'>
            Keep love simple today. {signData.name} benefits from honest signals
            and gentle pacing.
          </p>
        </div>
        <div className='rounded-lg border border-zinc-800 bg-zinc-900/40 p-5'>
          <h2 className='text-lg font-medium text-zinc-100 mb-2'>Career</h2>
          <p className='text-sm text-zinc-400'>
            Focus on one visible task. Small wins build momentum for
            {signData.name}.
          </p>
        </div>
        <div className='rounded-lg border border-zinc-800 bg-zinc-900/40 p-5'>
          <h2 className='text-lg font-medium text-zinc-100 mb-2'>Year</h2>
          <p className='text-sm text-zinc-400'>
            Today&apos;s choices set a tone. Stay aligned with what you want to
            be known for this year.
          </p>
        </div>
      </section>

      <nav className='flex items-center justify-between mb-12'>
        <Link
          href={`/grimoire/horoscopes/today/${prevSign.name.toLowerCase()}`}
          className='flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
          <span>{prevSign.name}</span>
        </Link>
        <Link
          href='/grimoire/horoscopes/today'
          className='text-zinc-500 hover:text-zinc-400 text-sm'
        >
          All Signs
        </Link>
        <Link
          href={`/grimoire/horoscopes/today/${nextSign.name.toLowerCase()}`}
          className='flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors'
        >
          <span>{nextSign.name}</span>
          <ArrowRight className='w-4 h-4' />
        </Link>
      </nav>

      <section className='grid md:grid-cols-2 gap-4 mb-12'>
        <Link
          href={`/grimoire/horoscopes/weekly/${sign}`}
          className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
        >
          <h3 className='font-medium mb-1'>Weekly Forecast</h3>
          <p className='text-zinc-400 text-sm'>
            Extended {signData.name} horoscope for this week.
          </p>
        </Link>
        <Link
          href={`/grimoire/horoscopes/${sign}/${currentYear}/${currentMonth}`}
          className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
        >
          <h3 className='font-medium mb-1'>Monthly Forecast</h3>
          <p className='text-zinc-400 text-sm'>
            Full {signData.name} outlook for {currentMonthName} {currentYear}.
          </p>
        </Link>
      </section>
    </SEOContentTemplate>
  );
}
