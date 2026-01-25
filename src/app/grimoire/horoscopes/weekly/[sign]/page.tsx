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

export const revalidate = 604800;

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

export async function generateStaticParams() {
  return signs.map((sign) => ({
    sign: sign.name.toLowerCase(),
  }));
}

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
    title: `${signData.name} Weekly Horoscope: This Week's Astrology | Lunary`,
    description: `This week's horoscope for ${signData.name} (${signData.dates}). Extended weekly forecast with insights on love, career, and personal growth.`,
    openGraph: {
      title: `${signData.name} Weekly Horoscope | Lunary`,
      description: `Weekly horoscope for ${signData.name}.`,
      url: `https://lunary.app/grimoire/horoscopes/weekly/${sign}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/horoscopes/weekly/${sign}`,
    },
  };
}

function getWeekRange(): string {
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(now.getDate() + mondayOffset);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };
  return `${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString('en-US', options)}, ${endOfWeek.getFullYear()}`;
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
      `${baseUrl}/api/gpt/horoscope?sign=${sign}&type=weekly`,
      { next: { revalidate: 604800 }, headers },
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.horoscope || null;
  } catch {
    return null;
  }
}

export default async function WeeklyHoroscopePage({
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
  const weekRange = getWeekRange();

  return (
    <SEOContentTemplate
      title={`${signData.name} Weekly Horoscope: This Week's Astrology | Lunary`}
      h1={`${signData.name} Weekly Horoscope`}
      description={`This week's horoscope for ${signData.name} (${signData.dates}). Extended weekly forecast with insights on love, career, and personal growth.`}
      keywords={[
        `${signData.name} weekly horoscope`,
        'weekly horoscope',
        'weekly astrology',
        'zodiac weekly forecast',
        'this week horoscope',
      ]}
      canonicalUrl={`https://lunary.app/grimoire/horoscopes/weekly/${sign}`}
      intro={`This week for ${signData.name} highlights the current lunar rhythm and the transits shaping your sign. Use the cues below as timing signals, then cross-check with your full chart if you want personal precision.`}
      heroContent={
        <div className='text-center space-y-2'>
          <div className='text-4xl md:text-5xl'>{signData.symbol}</div>
          <div className='text-lunary-primary-400 flex items-center justify-center gap-2 text-sm'>
            <Calendar className='w-4 h-4' />
            {weekRange}
          </div>
          <p className='text-zinc-500 text-xs'>{signData.dates}</p>
        </div>
      }
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Horoscopes', href: '/grimoire/horoscopes' },
        { label: 'Weekly', href: '/grimoire/horoscopes/weekly' },
        { label: signData.name },
      ]}
      cosmicConnections={
        <HoroscopeCosmicConnections
          variant='weekly-hub'
          sign={signKey}
          currentYear={currentYear}
        />
      }
      childrenPosition='after-description'
    >
      <section className='mb-12'>
        <div className='p-8 rounded-xl border border-zinc-800 bg-zinc-900/30'>
          {horoscope ? (
            <div className='text-zinc-200 leading-relaxed text-lg space-y-4'>
              {horoscope.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <div className='text-center'>
              <p className='text-zinc-400 mb-4'>
                Your weekly horoscope is being prepared. Check back soon or get
                a personalised reading.
              </p>
              <Link
                href='/grimoire/horoscopes/today'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                View daily horoscope →
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className='mb-12 grid gap-4 md:grid-cols-3'>
        <div className='rounded-lg border border-zinc-800 bg-zinc-900/40 p-5'>
          <h2 className='text-lg font-medium text-zinc-100 mb-2'>Love</h2>
          <p className='text-sm text-zinc-400'>
            Lean into steady communication. {signData.name} grows love through
            clarity and consistent effort this week.
          </p>
        </div>
        <div className='rounded-lg border border-zinc-800 bg-zinc-900/40 p-5'>
          <h2 className='text-lg font-medium text-zinc-100 mb-2'>Career</h2>
          <p className='text-sm text-zinc-400'>
            Keep priorities tight. Visible progress will open new opportunities
            for {signData.name}.
          </p>
        </div>
        <div className='rounded-lg border border-zinc-800 bg-zinc-900/40 p-5'>
          <h2 className='text-lg font-medium text-zinc-100 mb-2'>Year</h2>
          <p className='text-sm text-zinc-400'>
            This week supports long-range goals. Make one decision that moves
            your year forward.
          </p>
        </div>
      </section>

      <nav className='flex items-center justify-between mb-12'>
        <Link
          href={`/grimoire/horoscopes/weekly/${prevSign.name.toLowerCase()}`}
          className='flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
          <span>{prevSign.name}</span>
        </Link>
        <Link
          href='/grimoire/horoscopes/weekly'
          className='text-zinc-500 hover:text-zinc-400 text-sm'
        >
          All Signs
        </Link>
        <Link
          href={`/grimoire/horoscopes/weekly/${nextSign.name.toLowerCase()}`}
          className='flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors'
        >
          <span>{nextSign.name}</span>
          <ArrowRight className='w-4 h-4' />
        </Link>
      </nav>

      <section className='grid md:grid-cols-2 gap-4 mb-12'>
        <Link
          href={`/grimoire/horoscopes/today/${sign}`}
          className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
        >
          <h3 className='font-medium mb-1'>Daily Horoscope</h3>
          <p className='text-zinc-400 text-sm'>
            Quick daily insights for {signData.name}.
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
