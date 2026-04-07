import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

const year = new Date().getFullYear();

export const metadata: Metadata = {
  title: `Best Astrology Apps ${year}: Honest Comparison & Rankings`,
  description: `We compared Co-Star, CHANI, Pattern, Sanctuary & 12 more. See which apps use real astronomical data, which are ad-free, and our pick for ${year}.`,
  keywords: [
    `best astrology app ${year}`,
    'astrology app comparison',
    'lunary vs costar',
    'astrology app reviews',
    'personalized astrology apps',
  ],
  openGraph: {
    title: `Best Astrology Apps ${year}: Honest Comparison & Rankings`,
    description: `We compared Co-Star, CHANI, Pattern, Sanctuary & 12 more. See which apps use real astronomical data and our pick for ${year}.`,
    url: 'https://lunary.app/comparison',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/comparison',
  },
};

export default function ComparisonHubPage() {
  return (
    <div className='min-h-screen bg-surface-base text-content-primary'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-content-primary mb-4'>
            Astrology App Comparisons
          </h1>
          <p className='text-lg text-content-muted'>
            Fair, factual comparisons to help you choose the right astrology app
            for your cosmic journey.
          </p>
        </div>

        <div className='mb-8 p-6 rounded-lg border border-lunary-primary-700 bg-layer-base/10'>
          <p className='text-sm text-content-secondary leading-relaxed'>
            <strong>Why Compare?</strong> Choosing the right astrology app
            matters. We believe in transparency and helping you make informed
            decisions. All comparisons are based on publicly available
            information and focus on factual differences.
          </p>
        </div>

        {/* Comparison Page Links */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-content-primary mb-6'>
            Detailed Comparisons
          </h2>
          <div className='space-y-4'>
            {/* Complete Comparison */}
            <Link
              href='/comparison/best-personalized-astrology-apps'
              className='block rounded-lg border border-lunary-primary-700 bg-layer-base/10 p-6 hover:border-lunary-primary-600 hover:bg-layer-base/15 transition-all group'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='text-xl font-medium text-content-primary mb-2 group-hover:text-content-brand transition-colors'>
                    Complete Comparison: Lunary vs Moonly vs Lunar Guide
                  </h3>
                  <p className='text-sm text-content-muted mb-3'>
                    Comprehensive side-by-side comparison of the top
                    personalized astrology apps with detailed feature charts.
                  </p>
                </div>
                <ArrowRight className='h-5 w-5 text-content-brand group-hover:text-content-secondary transition-colors ml-4 flex-shrink-0' />
              </div>
            </Link>

            {/* Individual Comparisons */}
            <Link
              href='/comparison/lunary-vs-moonly'
              className='block rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-5 hover:border-lunary-primary-700 hover:bg-surface-elevated/50 transition-all group'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='text-lg font-medium text-content-primary mb-1 group-hover:text-content-brand transition-colors'>
                    Lunary vs Moonly
                  </h3>
                  <p className='text-sm text-content-muted'>
                    Compare real astronomical data vs generic astrology, and see
                    why Lunary's personalized charts and grimoire stand out.
                  </p>
                </div>
                <ArrowRight className='h-5 w-5 text-content-muted group-hover:text-content-brand transition-colors ml-4 flex-shrink-0' />
              </div>
            </Link>

            <Link
              href='/comparison/lunary-vs-lunar-guide'
              className='block rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-5 hover:border-lunary-primary-700 hover:bg-surface-elevated/50 transition-all group'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='text-lg font-medium text-content-primary mb-1 group-hover:text-content-brand transition-colors'>
                    Lunary vs Lunar Guide
                  </h3>
                  <p className='text-sm text-content-muted'>
                    Real astronomical calculations vs automated text insights.
                    See which approach provides more accurate birth charts.
                  </p>
                </div>
                <ArrowRight className='h-5 w-5 text-content-muted group-hover:text-content-brand transition-colors ml-4 flex-shrink-0' />
              </div>
            </Link>

            <Link
              href='/comparison/lunary-vs-arcarae'
              className='block rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-5 hover:border-lunary-primary-700 hover:bg-surface-elevated/50 transition-all group'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='text-lg font-medium text-content-primary mb-1 group-hover:text-content-brand transition-colors'>
                    Lunary vs Arcarae
                  </h3>
                  <p className='text-sm text-content-muted'>
                    Personalized chart-based insights vs community-driven
                    content. Compare magical tools ecosystem vs social features.
                  </p>
                </div>
                <ArrowRight className='h-5 w-5 text-content-muted group-hover:text-content-brand transition-colors ml-4 flex-shrink-0' />
              </div>
            </Link>

            <Link
              href='/comparison/lunary-vs-costar'
              className='block rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-5 hover:border-lunary-primary-700 hover:bg-surface-elevated/50 transition-all group'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='text-lg font-medium text-content-primary mb-1 group-hover:text-content-brand transition-colors'>
                    Lunary vs Co-Star
                  </h3>
                  <p className='text-sm text-content-muted'>
                    True personalization with magical tools vs aesthetic design.
                    Compare real astronomical data vs generic astrology.
                  </p>
                </div>
                <ArrowRight className='h-5 w-5 text-content-muted group-hover:text-content-brand transition-colors ml-4 flex-shrink-0' />
              </div>
            </Link>

            <Link
              href='/comparison/lunary-vs-pattern'
              className='block rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-5 hover:border-lunary-primary-700 hover:bg-surface-elevated/50 transition-all group'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='text-lg font-medium text-content-primary mb-1 group-hover:text-content-brand transition-colors'>
                    Lunary vs Pattern
                  </h3>
                  <p className='text-sm text-content-muted'>
                    Complete magical ecosystem vs psychology-based analysis.
                    Compare astrological patterns vs behavioral insights.
                  </p>
                </div>
                <ArrowRight className='h-5 w-5 text-content-muted group-hover:text-content-brand transition-colors ml-4 flex-shrink-0' />
              </div>
            </Link>

            <Link
              href='/comparison/personalized-vs-generic-astrology'
              className='block rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-5 hover:border-lunary-primary-700 hover:bg-surface-elevated/50 transition-all group'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='text-lg font-medium text-content-primary mb-1 group-hover:text-content-brand transition-colors'>
                    Personalized vs Generic Astrology
                  </h3>
                  <p className='text-sm text-content-muted'>
                    Learn why personalized birth chart astrology is more
                    accurate than generic zodiac horoscopes. Educational guide.
                  </p>
                </div>
                <ArrowRight className='h-5 w-5 text-content-muted group-hover:text-content-brand transition-colors ml-4 flex-shrink-0' />
              </div>
            </Link>
          </div>
        </section>

        {/* Why Lunary Stands Out */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-content-primary mb-6'>
            Why Lunary Stands Out
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='rounded-lg border border-lunary-primary-700 bg-layer-base/10 p-6'>
              <Star className='h-6 w-6 text-lunary-primary-400 mb-3' />
              <h3 className='text-lg font-medium text-content-primary mb-2'>
                Real Astronomical Data
              </h3>
              <p className='text-sm text-content-secondary leading-relaxed'>
                Unlike generic astrology apps, Lunary uses actual astronomical
                calculations from your exact birth time, date, and location.
              </p>
            </div>
            <div className='rounded-lg border border-lunary-primary-700 bg-layer-base/10 p-6'>
              <Star className='h-6 w-6 text-lunary-primary-400 mb-3' />
              <h3 className='text-lg font-medium text-content-primary mb-2'>
                Truly Personalized
              </h3>
              <p className='text-sm text-content-secondary leading-relaxed'>
                Every horoscope and insight is based on YOUR exact birth chart,
                not generic zodiac signs.
              </p>
            </div>
            <div className='rounded-lg border border-lunary-primary-700 bg-layer-base/10 p-6'>
              <Star className='h-6 w-6 text-lunary-primary-400 mb-3' />
              <h3 className='text-lg font-medium text-content-primary mb-2'>
                Complete Grimoire
              </h3>
              <p className='text-sm text-content-secondary leading-relaxed'>
                Includes spells, rituals, correspondences, and magical knowledge
                - unique to Lunary.
              </p>
            </div>
            <div className='rounded-lg border border-lunary-primary-700 bg-layer-base/10 p-6'>
              <Star className='h-6 w-6 text-lunary-primary-400 mb-3' />
              <h3 className='text-lg font-medium text-content-primary mb-2'>
                Free Trial
              </h3>
              <p className='text-sm text-content-secondary leading-relaxed'>
                Try Lunary free with a 7-day monthly or 14-day annual trial - no
                card required during the trial.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className='text-center'>
          <Link
            href='/pricing'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-layer-base/20 hover:bg-layer-base/30 border border-lunary-primary-700 text-content-brand font-medium text-lg transition-colors'
          >
            Start Your Free Trial
            <ArrowRight className='h-5 w-5' />
          </Link>
        </section>
      </div>
    </div>
  );
}
