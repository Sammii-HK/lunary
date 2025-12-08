import { Metadata } from 'next';
import Link from 'next/link';
import { ZODIAC_SEASONS, getSeasonDates } from '@/constants/seo/zodiac-seasons';

export const metadata: Metadata = {
  title: 'Zodiac Seasons 2025-2026: Astrological Calendar & Dates | Lunary',
  description:
    'Complete guide to zodiac seasons. Learn when each astrological season begins, its meaning, and how to work with the cosmic energy. All 12 zodiac seasons explained.',
  keywords: [
    'zodiac seasons',
    'astrological seasons',
    'aries season',
    'taurus season',
    'gemini season',
    'cancer season',
    'leo season',
    'virgo season',
    'libra season',
    'scorpio season',
    'sagittarius season',
    'capricorn season',
    'aquarius season',
    'pisces season',
  ],
  openGraph: {
    title: 'Zodiac Seasons 2025-2026: Astrological Calendar & Dates',
    description:
      'Complete guide to all 12 zodiac seasons with dates, meanings, and cosmic energies.',
    url: 'https://lunary.app/grimoire/seasons',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/seasons',
  },
};

const currentYear = new Date().getFullYear();

export default function SeasonsIndexPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <nav className='text-sm text-zinc-500 mb-8'>
          <Link href='/grimoire' className='hover:text-zinc-300'>
            Grimoire
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-zinc-300'>Seasons</span>
        </nav>

        <h1 className='text-4xl font-light mb-4'>Zodiac Seasons</h1>
        <p className='text-lg text-zinc-400 mb-8 max-w-3xl'>
          Throughout the year, the Sun moves through each of the 12 zodiac
          signs, creating &quot;seasons&quot; of cosmic energy that affect
          everyone. Understanding these seasons helps you align with natural
          rhythms and make the most of each period.
        </p>

        <div className='grid md:grid-cols-2 gap-8 mb-12'>
          {[currentYear, currentYear + 1].map((year) => (
            <div
              key={year}
              className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
            >
              <h2 className='text-2xl font-light mb-6'>
                {year} Zodiac Seasons
              </h2>
              <div className='space-y-3'>
                {ZODIAC_SEASONS.map((s) => {
                  const dates = getSeasonDates(s.sign, year);
                  return (
                    <Link
                      key={s.sign}
                      href={`/grimoire/seasons/${year}/${s.sign}`}
                      className='flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors group'
                    >
                      <div className='flex items-center gap-3'>
                        <span className='text-xl'>{s.symbol}</span>
                        <span className='font-medium group-hover:text-lunary-primary-300 transition-colors'>
                          {s.displayName} Season
                        </span>
                      </div>
                      <span className='text-sm text-zinc-500'>
                        {dates.start.split(',')[0]}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            Personalized Season Forecasts
          </h2>
          <p className='text-zinc-300 mb-4'>
            Each zodiac season affects your personal chart differently based on
            where it falls in your houses. Get personalized insights for how
            each season impacts you.
          </p>
          <Link
            href='/welcome'
            className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
          >
            Get Your Seasonal Forecast
          </Link>
        </div>
      </div>
    </div>
  );
}
