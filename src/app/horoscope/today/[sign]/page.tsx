import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { renderJsonLd } from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';

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
    title: `${signData.name} Horoscope Today: Daily Astrology | Lunary`,
    description: `Today's horoscope for ${signData.name} (${signData.dates}). Daily astrology insights, cosmic guidance, and what the stars have in store for you.`,
    openGraph: {
      title: `${signData.name} Horoscope Today | Lunary`,
      description: `Daily horoscope for ${signData.name}.`,
      url: `https://lunary.app/horoscope/today/${sign}`,
    },
    alternates: {
      canonical: `https://lunary.app/horoscope/today/${sign}`,
    },
  };
}

async function getHoroscope(sign: string): Promise<string | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://lunary.app';
    const response = await fetch(
      `${baseUrl}/api/gpt/horoscope?sign=${sign}&type=daily`,
      { next: { revalidate: 86400 } },
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

  if (!signData) {
    notFound();
  }

  const signIndex = signs.findIndex((s) => s.name.toLowerCase() === sign);
  const prevSign = signs[(signIndex - 1 + 12) % 12];
  const nextSign = signs[(signIndex + 1) % 12];

  const horoscope = await getHoroscope(sign);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${signData.name} Horoscope Today`,
    datePublished: new Date().toISOString().split('T')[0],
    dateModified: new Date().toISOString().split('T')[0],
    author: {
      '@type': 'Organization',
      name: 'Lunary',
      url: 'https://lunary.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lunary',
      url: 'https://lunary.app',
    },
    description: `Today's horoscope for ${signData.name}.`,
    mainEntityOfPage: `https://lunary.app/horoscope/today/${sign}`,
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(articleSchema)}
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Horoscope', href: '/horoscope' },
            { label: 'Today', href: '/horoscope/today' },
            { label: signData.name },
          ]}
        />

        <header className='mb-8 text-center'>
          <div className='text-5xl mb-4'>{signData.symbol}</div>
          <h1 className='text-4xl md:text-5xl font-light mb-2'>
            {signData.name} Horoscope
          </h1>
          <p className='text-lunary-primary-400 flex items-center justify-center gap-2'>
            <Calendar className='w-4 h-4' />
            {today}
          </p>
          <p className='text-zinc-500 text-sm mt-1'>{signData.dates}</p>
        </header>

        <article className='mb-12'>
          <div className='p-8 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            {horoscope ? (
              <p className='text-zinc-200 leading-relaxed text-lg'>
                {horoscope}
              </p>
            ) : (
              <div className='text-center'>
                <p className='text-zinc-400 mb-4'>
                  Your daily horoscope is being prepared. Check back soon or get
                  a personalised reading.
                </p>
                <Link
                  href='/horoscope'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  View personalised horoscope →
                </Link>
              </div>
            )}
          </div>
        </article>

        <nav className='flex items-center justify-between mb-12'>
          <Link
            href={`/horoscope/today/${prevSign.name.toLowerCase()}`}
            className='flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            <span>{prevSign.name}</span>
          </Link>
          <Link
            href='/horoscope/today'
            className='text-zinc-500 hover:text-zinc-400 text-sm'
          >
            All Signs
          </Link>
          <Link
            href={`/horoscope/today/${nextSign.name.toLowerCase()}`}
            className='flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors'
          >
            <span>{nextSign.name}</span>
            <ArrowRight className='w-4 h-4' />
          </Link>
        </nav>

        <section className='grid md:grid-cols-2 gap-4 mb-12'>
          <Link
            href={`/horoscope/weekly/${sign}`}
            className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium mb-1'>Weekly Forecast</h3>
            <p className='text-zinc-400 text-sm'>
              Extended {signData.name} horoscope for this week.
            </p>
          </Link>
          <Link
            href={`/grimoire/zodiac/${sign}`}
            className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium mb-1'>About {signData.name}</h3>
            <p className='text-zinc-400 text-sm'>
              Deep dive into {signData.name} traits and characteristics.
            </p>
          </Link>
        </section>

        <section className='p-6 rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-rose-900/20 text-center'>
          <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            Get Personalised Insights
          </h2>
          <p className='text-zinc-300 mb-4'>
            Your daily horoscope, tailored to your exact birth chart placements.
          </p>
          <Link
            href='/birth-chart'
            className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/30 hover:bg-lunary-primary-900/50 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
          >
            Calculate Your Birth Chart
          </Link>
        </section>
      </div>
    </div>
  );
}
