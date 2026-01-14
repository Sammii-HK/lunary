import { Metadata } from 'next';
import Link from 'next/link';
import { Check, Star, ArrowRight } from 'lucide-react';
import { ComparisonPageStructuredData } from '@/components/ComparisonPageStructuredData';

export const metadata: Metadata = {
  title:
    'Best Personalized Astrology Apps 2025: Lunary vs Moonly vs Lunar Guide',
  description:
    'Compare Lunary vs Moonly vs Lunar Guide. See which astrology app uses real astronomical data, offers personalized birth charts, and includes a complete grimoire. Free monthly or annual trial available.',
  keywords: [
    'best astrology apps',
    'personalized astrology apps',
    'astrology app comparison',
    'Lunary vs Moonly',
    'Lunary vs Lunar Guide',
    'best birth chart app',
    'astrology app review',
    'personalized horoscope app',
    'astrology app 2025',
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  openGraph: {
    title:
      'Best Personalized Astrology Apps 2025: Lunary vs Moonly vs Lunar Guide',
    description:
      'Compare Lunary vs Moonly vs Lunar Guide. See which app uses real astronomical data and offers the most personalized insights.',
    url: 'https://lunary.app/comparison/best-personalized-astrology-apps',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Best Personalized Astrology Apps Comparison',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Best Personalized Astrology Apps 2025: Lunary vs Moonly vs Lunar Guide',
    description:
      'Compare Lunary vs Moonly vs Lunar Guide. See which app uses real astronomical data and offers the most personalized insights.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/comparison/best-personalized-astrology-apps',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function BestPersonalizedAstrologyAppsPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <ComparisonPageStructuredData
        competitorName='Moonly and Lunar Guide'
        featuresCompared={[
          'Real astronomical calculations',
          'Personalized birth charts',
          'Grimoire with spells and rituals',
          'Free trial availability',
          'Astronomical accuracy',
        ]}
        conclusion='Lunary stands out as the best personalized astrology app for using real astronomical calculations, providing chart-based personalization, and including a complete grimoire with spells, rituals, and correspondences.'
      />
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Best Personalized Astrology Apps 2025
          </h1>
          <p className='text-lg text-zinc-400'>
            A comprehensive comparison of the top personalized astrology apps to
            help you find the perfect cosmic companion.
          </p>
        </div>

        <div className='mb-8 p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            <strong>Note:</strong> This comparison is based on publicly
            available information and focuses on factual differences. We aim to
            be fair and accurate in our assessment of all apps.
          </p>
        </div>

        {/* Comprehensive Comparison Table */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Complete Feature Comparison
          </h2>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse border border-zinc-800'>
              <thead>
                <tr className='bg-zinc-900'>
                  <th className='border border-zinc-800 p-4 text-left text-zinc-200'>
                    Feature
                  </th>
                  <th className='border border-zinc-800 p-4 text-center text-lunary-primary-300 font-medium'>
                    Lunary ⭐
                  </th>
                  <th className='border border-zinc-800 p-4 text-center text-zinc-300'>
                    Moonly
                  </th>
                  <th className='border border-zinc-800 p-4 text-center text-zinc-300'>
                    Lunar Guide
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      Calculation Method
                    </strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      How birth charts are calculated
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      Real Astronomical Data
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      Generic Astrology
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>AI-Powered</span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      Personalized Birth Chart
                    </strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      Based on exact birth time, date, location
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      Personalized Horoscopes
                    </strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      Based on YOUR chart vs generic zodiac
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      Chart-Based
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      Generic Zodiac
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>AI-Generated</span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Grimoire Included</strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      Spells, rituals, correspondences
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400'>—</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400'>—</span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Tarot Readings</strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      Personalized to your chart
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>Limited</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>Limited</span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      Astronomical Accuracy
                    </strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      Uses real planetary positions
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>Generic</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      AI Interpretation
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Free Trial</strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      Try before you buy
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-lunary-success font-medium'>
                      7 days (monthly) / 14 days (annual)
                    </span>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      No payment during trial
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      Limited free features
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      Limited free features
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Pricing</strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      Monthly subscription
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-100 font-medium'>$4.99/mo</span>
                    <br />
                    <span className='text-xs text-zinc-400'>or $39.99/yr</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      Varies by plan
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      Varies by plan
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Cross-Device Sync</strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      Access your chart anywhere
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed Reviews */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Detailed App Reviews
          </h2>

          {/* Lunary */}
          <div className='mb-8 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 p-6'>
            <div className='flex items-start gap-4 mb-4'>
              <Star className='h-6 w-6 text-lunary-primary-400 flex-shrink-0 mt-1' />
              <div className='flex-1'>
                <h3 className='text-2xl font-medium text-zinc-100 mb-2'>
                  Lunary ⭐ Our Top Pick
                </h3>
                <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
                  Lunary stands out for using real astronomical calculations to
                  create truly personalized birth charts and horoscopes. Unlike
                  generic astrology apps, Lunary calculates planetary positions
                  from your exact birth time, date, and location using actual
                  astronomy.
                </p>
                <div className='space-y-2 mb-4'>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-zinc-300'>
                      Real astronomical calculations (not generic astrology)
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-zinc-300'>
                      Horoscopes personalized to YOUR exact birth chart
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-zinc-300'>
                      Complete grimoire with spells, rituals, correspondences
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-zinc-300'>
                      7-day free trial - no card required during the trial
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-zinc-300'>
                      Transparent pricing: $4.99/mo or $39.99/yr
                    </span>
                  </div>
                </div>
                <Link
                  href='/pricing'
                  className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors text-sm'
                >
                  Try Lunary Free
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </div>
            </div>
          </div>

          {/* Moonly */}
          <div className='mb-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <h3 className='text-xl font-medium text-zinc-100 mb-2'>Moonly</h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              Moonly offers Vedic astrology with lunar calendar tracking. Good
              for users interested in Vedic traditions, but uses generic
              astrology rather than real astronomical calculations.
            </p>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-lunary-success' />
                <span className='text-sm text-zinc-300'>
                  Vedic astrology focus
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-lunary-success' />
                <span className='text-sm text-zinc-300'>
                  Lunar calendar tracking
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-zinc-400'>—</span>
                <span className='text-sm text-zinc-400'>
                  Uses generic astrology (not real astronomy)
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-zinc-400'>—</span>
                <span className='text-sm text-zinc-400'>
                  No grimoire included
                </span>
              </div>
            </div>
          </div>

          {/* Lunar Guide */}
          <div className='mb-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <h3 className='text-xl font-medium text-zinc-100 mb-2'>
              Lunar Guide
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              Lunar Guide uses AI to generate personalized guidance based on
              your thoughts and moods. Good for users who want adaptive
              insights, but doesn't use real astronomical calculations.
            </p>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-lunary-success' />
                <span className='text-sm text-zinc-300'>
                  AI-assisted insights
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-lunary-success' />
                <span className='text-sm text-zinc-300'>
                  Adapts to your current state
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-zinc-400'>—</span>
                <span className='text-sm text-zinc-400'>
                  AI-generated (not real astronomy)
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-zinc-400'>—</span>
                <span className='text-sm text-zinc-400'>
                  No grimoire included
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Lunary Wins */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Why Lunary is Our Top Pick
          </h2>
          <div className='rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              Lunary wins because it combines three unique advantages:
            </p>
            <ol className='list-decimal list-inside space-y-3 text-sm text-zinc-300 ml-4'>
              <li>
                <strong className='text-zinc-100'>
                  Real Astronomical Data:
                </strong>{' '}
                Uses actual planetary positions, not generic astrology or AI
                interpretation
              </li>
              <li>
                <strong className='text-zinc-100'>True Personalization:</strong>{' '}
                Every horoscope is based on YOUR exact birth chart, not generic
                zodiac signs
              </li>
              <li>
                <strong className='text-zinc-100'>Complete Grimoire:</strong>{' '}
                Includes spells, rituals, correspondences, and magical knowledge
                - unique to Lunary
              </li>
            </ol>
            <p className='text-sm text-zinc-300 leading-relaxed mt-4'>
              Plus, Lunary offers a transparent 7-day free trial with no card
              required, making it easy to try risk-free.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className='text-center mb-12'>
          <Link
            href='/pricing'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium text-lg transition-colors'
          >
            Start Your Free Trial
            <ArrowRight className='h-5 w-5' />
          </Link>
        </section>

        {/* Explore Grimoire */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Explore the Lunary Grimoire
          </h2>
          <p className='text-sm text-zinc-400 mb-6'>
            Discover our comprehensive knowledge library that sets Lunary apart.
          </p>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            <Link
              href='/grimoire/guides/birth-chart-complete-guide'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>
                Birth Chart Guide
              </span>
              <p className='text-xs text-zinc-500 mt-1'>
                Complete guide to reading your chart
              </p>
            </Link>
            <Link
              href='/grimoire/astronomy/planets'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>
                Planetary Meanings
              </span>
              <p className='text-xs text-zinc-500 mt-1'>
                Understand astrological planets
              </p>
            </Link>
            <Link
              href='/grimoire/tarot'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>78 Tarot Cards</span>
              <p className='text-xs text-zinc-500 mt-1'>
                Major & Minor Arcana meanings
              </p>
            </Link>
            <Link
              href='/grimoire/crystals'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>Crystal Guide</span>
              <p className='text-xs text-zinc-500 mt-1'>
                Properties and correspondences
              </p>
            </Link>
            <Link
              href='/grimoire/zodiac'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>12 Zodiac Signs</span>
              <p className='text-xs text-zinc-500 mt-1'>
                Traits, dates, and compatibility
              </p>
            </Link>
            <Link
              href='/grimoire'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>Full Grimoire</span>
              <p className='text-xs text-zinc-500 mt-1'>
                500+ pages of cosmic wisdom
              </p>
            </Link>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className='pt-8 border-t border-zinc-800 pb-8'>
          <p className='text-xs text-zinc-400 leading-relaxed'>
            <strong>Disclaimer:</strong> This comparison is based on publicly
            available information as of 2025. Features and pricing may change.
            All competitor names are registered trademarks of their respective
            owners. This comparison is for informational purposes only and is
            not intended to disparage any competitor. We strive to be fair and
            accurate in our assessments.
          </p>
        </section>
      </div>
    </div>
  );
}
