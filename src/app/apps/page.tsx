import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingNavbar } from '@/components/MarketingNavbar';

export const metadata: Metadata = {
  title: 'iOS Apps | Lunar Computing',
  description:
    'iOS apps from Lunar Computing — interview prep, astrology, divination, and more. Privacy-first apps that keep your data on your device.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://lunary.app/apps',
  },
};

const apps = [
  {
    slug: 'iprep',
    name: 'iPrep',
    tagline: 'AI interview coach in your pocket',
    description:
      'Practice answers to behavioural, technical, and system design questions. Get AI-powered feedback on every answer. Your data stays on your device.',
    category: 'Productivity',
    badge: 'New',
    available: true,
  },
  {
    slug: 'spellbook',
    name: 'Spell Book',
    tagline: 'A digital Book of Shadows',
    description:
      'Browse spells, correspondences, and rituals. Save favourites and build your personal collection. Syncs privately via iCloud.',
    category: 'Lifestyle',
    available: true,
  },
  {
    slug: 'yesnooracle',
    name: 'Yes/No Oracle',
    tagline: 'Quick clarity when you need it',
    description:
      'Ask a question, receive an answer. Simple, intentional, private. No account required.',
    category: 'Lifestyle',
    available: true,
  },
  {
    slug: 'ephemeris',
    name: "Astrologer's Ephemeris",
    tagline: 'Planetary positions for every day',
    description:
      'Daily planetary positions, aspects, and void of course Moon times. Built for astrology students and practitioners.',
    category: 'Reference',
    available: true,
  },
  {
    slug: 'mercury',
    name: 'Is Mercury Retrograde?',
    tagline: 'The one question everyone asks',
    description:
      'Find out instantly. Includes upcoming retrograde dates and a plain-English explanation of what it means.',
    category: 'Reference',
    available: true,
  },
];

export default function AppsIndexPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col'>
      <MarketingNavbar />

      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full'>
        <div className='mb-14'>
          <p className='text-lunary-primary-400 text-sm font-medium uppercase tracking-widest mb-3'>
            Lunar Computing
          </p>
          <h1 className='text-3xl md:text-5xl font-semibold text-white mb-4'>
            iOS Apps
          </h1>
          <p className='text-zinc-400 text-lg max-w-xl'>
            Privacy-first apps for interview prep, astrology, and everyday
            clarity. Your data stays on your device — no accounts required
            unless you want iCloud sync.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {apps.map((app) => (
            <Link
              key={app.slug}
              href={`/apps/${app.slug}`}
              className='group block p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-lunary-primary-700 hover:bg-zinc-900/70 transition-all duration-200'
            >
              <div className='flex items-start justify-between mb-3'>
                <div>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='text-lg font-semibold text-white group-hover:text-lunary-primary-300 transition-colors'>
                      {app.name}
                    </span>
                    {app.badge && (
                      <span className='text-xs font-medium px-2 py-0.5 rounded-full bg-lunary-primary-900/50 text-lunary-primary-300 border border-lunary-primary-800'>
                        {app.badge}
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-zinc-400'>{app.category}</p>
                </div>
                <span className='text-zinc-600 group-hover:text-lunary-primary-400 transition-colors mt-1'>
                  →
                </span>
              </div>
              <p className='text-zinc-300 text-sm leading-relaxed mb-2'>
                {app.tagline}
              </p>
              <p className='text-zinc-500 text-xs leading-relaxed'>
                {app.description}
              </p>
            </Link>
          ))}
        </div>

        <div className='mt-14 pt-10 border-t border-zinc-800'>
          <p className='text-zinc-500 text-sm mb-4'>Legal</p>
          <div className='flex flex-wrap gap-6'>
            <Link
              href='/apps/terms'
              className='text-zinc-400 hover:text-lunary-primary-300 text-sm transition-colors'
            >
              Terms of Service
            </Link>
            <Link
              href='/apps/iprep/privacy'
              className='text-zinc-400 hover:text-lunary-primary-300 text-sm transition-colors'
            >
              iPrep Privacy
            </Link>
            <Link
              href='/apps/spellbook/privacy'
              className='text-zinc-400 hover:text-lunary-primary-300 text-sm transition-colors'
            >
              Spell Book Privacy
            </Link>
            <Link
              href='/apps/yesnooracle/privacy'
              className='text-zinc-400 hover:text-lunary-primary-300 text-sm transition-colors'
            >
              Yes/No Oracle Privacy
            </Link>
            <Link
              href='/apps/ephemeris/privacy'
              className='text-zinc-400 hover:text-lunary-primary-300 text-sm transition-colors'
            >
              Ephemeris Privacy
            </Link>
            <Link
              href='/apps/mercury/privacy'
              className='text-zinc-400 hover:text-lunary-primary-300 text-sm transition-colors'
            >
              Mercury Privacy
            </Link>
          </div>
        </div>
      </div>

      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </div>
  );
}
