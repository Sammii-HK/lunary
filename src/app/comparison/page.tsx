import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Astrology App Comparisons - Lunary',
  description:
    'Compare Lunary with other astrology apps. See why Lunary uses real astronomical data, personalized birth charts, and includes a complete grimoire. Free 7-day trial available.',
  openGraph: {
    title: 'Astrology App Comparisons - Lunary',
    description:
      'Compare Lunary with other astrology apps. See why Lunary stands out with real astronomical data and personalized insights.',
    url: 'https://lunary.app/comparison',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/comparison',
  },
};

export default function ComparisonHubPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Astrology App Comparisons
          </h1>
          <p className='text-lg text-zinc-400'>
            Fair, factual comparisons to help you choose the right astrology app
            for your cosmic journey.
          </p>
        </div>

        <div className='mb-8 p-6 rounded-lg border border-purple-500/30 bg-purple-500/10'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            <strong>Why Compare?</strong> Choosing the right astrology app
            matters. We believe in transparency and helping you make informed
            decisions. All comparisons are based on publicly available
            information and focus on factual differences.
          </p>
        </div>

        {/* Comparison Pages List */}
        <section className='space-y-6 mb-12'>
          <Link
            href='/comparison/lunary-vs-moonly'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all group'
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h2 className='text-2xl font-medium text-zinc-100 mb-2 group-hover:text-purple-300 transition-colors'>
                  Lunary vs Moonly
                </h2>
                <p className='text-sm text-zinc-400 mb-4'>
                  Compare Lunary's real astronomical calculations and
                  personalized horoscopes with Moonly's Vedic astrology
                  approach. See which app better fits your needs.
                </p>
                <div className='flex flex-wrap gap-2'>
                  <span className='px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30'>
                    Real Astronomy
                  </span>
                  <span className='px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30'>
                    Personalized Charts
                  </span>
                  <span className='px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30'>
                    Grimoire Included
                  </span>
                </div>
              </div>
              <ArrowRight className='h-6 w-6 text-zinc-400 group-hover:text-purple-300 transition-colors ml-4 flex-shrink-0' />
            </div>
          </Link>

          <Link
            href='/comparison/lunary-vs-lunar-guide'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all group'
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h2 className='text-2xl font-medium text-zinc-100 mb-2 group-hover:text-purple-300 transition-colors'>
                  Lunary vs Lunar Guide
                </h2>
                <p className='text-sm text-zinc-400 mb-4'>
                  Compare Lunary's real astronomical data with Lunar Guide's
                  AI-powered approach. See which method works better for
                  personalized astrology.
                </p>
                <div className='flex flex-wrap gap-2'>
                  <span className='px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30'>
                    Real Astronomy
                  </span>
                  <span className='px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30'>
                    AI Comparison
                  </span>
                  <span className='px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30'>
                    Personalized Charts
                  </span>
                </div>
              </div>
              <ArrowRight className='h-6 w-6 text-zinc-400 group-hover:text-purple-300 transition-colors ml-4 flex-shrink-0' />
            </div>
          </Link>

          <Link
            href='/comparison/best-personalized-astrology-apps'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all group'
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h2 className='text-2xl font-medium text-zinc-100 mb-2 group-hover:text-purple-300 transition-colors'>
                  Best Personalized Astrology Apps
                </h2>
                <p className='text-sm text-zinc-400 mb-4'>
                  Comprehensive comparison of top personalized astrology apps,
                  featuring Lunary, Moonly, Lunar Guide, and more. Find the
                  perfect app for your cosmic journey.
                </p>
                <div className='flex flex-wrap gap-2'>
                  <span className='px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30'>
                    Complete Guide
                  </span>
                  <span className='px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30'>
                    Top Apps Compared
                  </span>
                  <span className='px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30'>
                    Detailed Reviews
                  </span>
                </div>
              </div>
              <ArrowRight className='h-6 w-6 text-zinc-400 group-hover:text-purple-300 transition-colors ml-4 flex-shrink-0' />
            </div>
          </Link>
        </section>

        {/* Why Lunary Stands Out */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Why Lunary Stands Out
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
              <Star className='h-6 w-6 text-purple-400 mb-3' />
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                Real Astronomical Data
              </h3>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                Unlike generic astrology apps, Lunary uses actual astronomical
                calculations from your exact birth time, date, and location.
              </p>
            </div>
            <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
              <Star className='h-6 w-6 text-purple-400 mb-3' />
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                Truly Personalized
              </h3>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                Every horoscope and insight is based on YOUR exact birth chart,
                not generic zodiac signs.
              </p>
            </div>
            <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
              <Star className='h-6 w-6 text-purple-400 mb-3' />
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                Complete Grimoire
              </h3>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                Includes spells, rituals, correspondences, and magical knowledge
                - unique to Lunary.
              </p>
            </div>
            <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
              <Star className='h-6 w-6 text-purple-400 mb-3' />
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                Free Trial
              </h3>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                Try Lunary free for 7 days - credit card required but no payment
                taken during trial.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className='text-center'>
          <Link
            href='/pricing'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-medium text-lg transition-colors'
          >
            Start Your Free Trial
            <ArrowRight className='h-5 w-5' />
          </Link>
        </section>
      </div>
    </div>
  );
}
