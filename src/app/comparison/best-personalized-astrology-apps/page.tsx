import { Metadata } from 'next';
import Link from 'next/link';
import { Check, Star, ArrowRight } from 'lucide-react';
import { ComparisonPageStructuredData } from '@/components/ComparisonPageStructuredData';

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: `Best Personalized Astrology Apps ${currentYear}: Real Comparison`,
  description: `Co-Star vs CHANI vs Lunary: which app uses real astronomical data, offers free birth charts & has no ads? Side-by-side feature breakdown.`,
  keywords: [
    'best astrology apps',
    'personalized astrology apps',
    'astrology app comparison',
    'Lunary vs Co-Star',
    'Lunary vs CHANI',
    'Lunary vs Pattern',
    'best birth chart app',
    'astrology app review',
    'personalized horoscope app',
    `astrology app ${currentYear}`,
  ],
  authors: [{ name: 'Lunary' }],
  creator: 'Lunary',
  publisher: 'Lunary',
  openGraph: {
    title: `Best Personalized Astrology Apps ${currentYear}: Lunary vs Co-Star vs CHANI`,
    description:
      'Compare Lunary vs Co-Star vs CHANI, and more. See which app uses real astronomical data and offers the most personalized insights with no ads.',
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
    title: `Best Personalized Astrology Apps ${currentYear}: Real Comparison`,
    description: `Co-Star vs CHANI vs Lunary: which app uses real astronomical data, offers free birth charts & has no ads?`,
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
    <div className='min-h-screen bg-surface-base text-content-primary'>
      <ComparisonPageStructuredData
        competitorName='Co-Star and CHANI'
        featuresCompared={[
          'Real astronomical calculations',
          'Personalized birth charts',
          'Grimoire with spells and rituals',
          'Free tier with no ads',
          'Astronomical accuracy',
        ]}
        conclusion='Lunary stands out as the best personalized astrology app for using real astronomical calculations (±1 arcminute accuracy), providing chart-based personalization with no ads in the free tier, and including a complete 2000+ page grimoire with spells, rituals, and correspondences.'
      />
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-content-primary mb-4'>
            Best Personalized Astrology Apps {currentYear}
          </h1>
          <p className='text-lg text-content-muted'>
            A comprehensive comparison of the top personalized astrology apps to
            help you find the perfect cosmic companion.
          </p>
        </div>

        <div className='mb-8 p-6 rounded-lg border border-lunary-primary-700 bg-layer-base/10'>
          <p className='text-sm text-content-secondary leading-relaxed'>
            <strong>Note:</strong> This comparison is based on publicly
            available information and focuses on factual differences. We aim to
            be fair and accurate in our assessment of all apps.
          </p>
        </div>

        {/* Comprehensive Comparison Table */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-content-primary mb-6'>
            Complete Feature Comparison
          </h2>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse border border-stroke-subtle'>
              <thead>
                <tr className='bg-surface-elevated'>
                  <th className='border border-stroke-subtle p-4 text-left text-content-primary'>
                    Feature
                  </th>
                  <th className='border border-stroke-subtle p-4 text-center text-content-brand font-medium'>
                    <div className='flex items-center justify-center gap-2'>
                      Lunary
                      <Star className='h-4 w-4' />
                    </div>
                  </th>
                  <th className='border border-stroke-subtle p-4 text-center text-content-secondary'>
                    Co-Star
                  </th>
                  <th className='border border-stroke-subtle p-4 text-center text-content-secondary'>
                    CHANI
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className='bg-surface-elevated/50'>
                  <td className='border border-stroke-subtle p-4 text-content-secondary'>
                    <strong className='text-content-primary'>
                      Calculation Method
                    </strong>
                    <br />
                    <span className='text-xs text-content-muted'>
                      How birth charts are calculated
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      ±1 arcminute accuracy
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted text-sm'>
                      Standard Astrology
                    </span>
                  </td>
                </tr>
                <tr className='bg-surface-elevated/30'>
                  <td className='border border-stroke-subtle p-4 text-content-secondary'>
                    <strong className='text-content-primary'>
                      Personalized Birth Chart
                    </strong>
                    <br />
                    <span className='text-xs text-content-muted'>
                      Based on exact birth time, date, location
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                </tr>
                <tr className='bg-surface-elevated/50'>
                  <td className='border border-stroke-subtle p-4 text-content-secondary'>
                    <strong className='text-content-primary'>
                      Personalized Horoscopes
                    </strong>
                    <br />
                    <span className='text-xs text-content-muted'>
                      Based on YOUR chart vs generic zodiac
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      Chart-Based
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted text-sm'>
                      Expert-Written
                    </span>
                  </td>
                </tr>
                <tr className='bg-surface-elevated/30'>
                  <td className='border border-stroke-subtle p-4 text-content-secondary'>
                    <strong className='text-content-primary'>
                      Grimoire (2000+ pages)
                    </strong>
                    <br />
                    <span className='text-xs text-content-muted'>
                      Spells, rituals, correspondences - 100% free
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted'>—</span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted'>—</span>
                  </td>
                </tr>
                <tr className='bg-surface-elevated/50'>
                  <td className='border border-stroke-subtle p-4 text-content-secondary'>
                    <strong className='text-content-primary'>
                      Tarot Readings
                    </strong>
                    <br />
                    <span className='text-xs text-content-muted'>
                      Personalized to your chart
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted'>—</span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted'>—</span>
                  </td>
                </tr>
                <tr className='bg-surface-elevated/30'>
                  <td className='border border-stroke-subtle p-4 text-content-secondary'>
                    <strong className='text-content-primary'>
                      Tarot Pattern Analysis
                    </strong>
                    <br />
                    <span className='text-xs text-content-muted'>
                      Identifies themes across your readings
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted'>—</span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted'>—</span>
                  </td>
                </tr>
                <tr className='bg-surface-elevated/50'>
                  <td className='border border-stroke-subtle p-4 text-content-secondary'>
                    <strong className='text-content-primary'>
                      Book of Shadows Journal
                    </strong>
                    <br />
                    <span className='text-xs text-content-muted'>
                      With archetype pattern recognition
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted'>—</span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted'>—</span>
                  </td>
                </tr>
                <tr className='bg-surface-elevated/30'>
                  <td className='border border-stroke-subtle p-4 text-content-secondary'>
                    <strong className='text-content-primary'>
                      Astral Guide Chat
                    </strong>
                    <br />
                    <span className='text-xs text-content-muted'>
                      AI with full chart context
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted'>—</span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted'>—</span>
                  </td>
                </tr>
                <tr className='bg-surface-elevated/50'>
                  <td className='border border-stroke-subtle p-4 text-content-secondary'>
                    <strong className='text-content-primary'>
                      Crystal Guidance
                    </strong>
                    <br />
                    <span className='text-xs text-content-muted'>
                      Based on birth chart + current transits
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted'>—</span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted'>—</span>
                  </td>
                </tr>
                <tr className='bg-surface-elevated/30'>
                  <td className='border border-stroke-subtle p-4 text-content-secondary'>
                    <strong className='text-content-primary'>
                      Real-Time Transit Updates
                    </strong>
                    <br />
                    <span className='text-xs text-content-muted'>
                      Updates throughout the day
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted'>—</span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted'>—</span>
                  </td>
                </tr>
                <tr className='bg-surface-elevated/50'>
                  <td className='border border-stroke-subtle p-4 text-content-secondary'>
                    <strong className='text-content-primary'>Ads</strong>
                    <br />
                    <span className='text-xs text-content-muted'>
                      Ad-free experience
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      None
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted text-sm'>
                      Yes (free tier)
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      None
                    </span>
                  </td>
                </tr>
                <tr className='bg-surface-elevated/50'>
                  <td className='border border-stroke-subtle p-4 text-content-secondary'>
                    <strong className='text-content-primary'>Free Tier</strong>
                    <br />
                    <span className='text-xs text-content-muted'>
                      What's included free
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      Generous (No Ads)
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted text-sm'>
                      Available (With Ads)
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted text-sm'>Limited</span>
                  </td>
                </tr>
                <tr className='bg-surface-elevated/30'>
                  <td className='border border-stroke-subtle p-4 text-content-secondary'>
                    <strong className='text-content-primary'>Pricing</strong>
                    <br />
                    <span className='text-xs text-content-muted'>
                      Monthly subscription
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-lunary-success font-medium'>
                      Free + from $4.99/mo
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted text-sm'>
                      Free + $2.99/mo
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <span className='text-content-muted text-sm'>
                      ~$12.99/mo
                    </span>
                  </td>
                </tr>
                <tr className='bg-surface-elevated/50'>
                  <td className='border border-stroke-subtle p-4 text-content-secondary'>
                    <strong className='text-content-primary'>
                      Cross-Device Sync
                    </strong>
                    <br />
                    <span className='text-xs text-content-muted'>
                      Access your chart anywhere
                    </span>
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-stroke-subtle p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed Reviews */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-content-primary mb-6'>
            Detailed App Reviews
          </h2>

          {/* Lunary */}
          <div className='mb-8 rounded-lg border border-lunary-primary-700 bg-layer-base/10 p-6'>
            <div className='flex items-start gap-4 mb-4'>
              <Star className='h-6 w-6 text-lunary-primary-400 flex-shrink-0 mt-1' />
              <div className='flex-1'>
                <h3 className='text-2xl font-medium text-content-primary mb-2'>
                  Lunary - Our Top Pick
                </h3>
                <p className='text-sm text-content-secondary leading-relaxed mb-4'>
                  Lunary stands out for using real astronomical calculations to
                  create truly personalized birth charts and horoscopes. Unlike
                  generic astrology apps, Lunary calculates planetary positions
                  from your exact birth time, date, and location using actual
                  astronomy.
                </p>
                <div className='space-y-2 mb-4'>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-content-secondary'>
                      Real astronomical calculations (not generic astrology)
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-content-secondary'>
                      Horoscopes personalized to YOUR exact birth chart
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-content-secondary'>
                      Astral Guide chat with full chart context
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-content-secondary'>
                      Book of Shadows journal with pattern recognition
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-content-secondary'>
                      Tarot with pattern analysis & chart-based readings
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-content-secondary'>
                      Crystals personalized to transits + birth chart
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-content-secondary'>
                      Real-time transit updates throughout the day
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-content-secondary'>
                      Free tier with no ads · Paid tiers from $4.99/mo
                    </span>
                  </div>
                </div>
                <Link
                  href='/pricing'
                  className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-layer-base/20 hover:bg-layer-base/30 border border-lunary-primary-700 text-content-brand font-medium transition-colors text-sm'
                >
                  Try Lunary Free
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </div>
            </div>
          </div>

          {/* Co-Star */}
          <div className='mb-8 rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-6'>
            <h3 className='text-xl font-medium text-content-primary mb-2'>
              Co-Star
            </h3>
            <p className='text-sm text-content-secondary leading-relaxed mb-4'>
              Co-Star offers personalized horoscopes with a minimalist,
              text-based interface and social features. Popular for its unique
              aesthetic and push notifications.
            </p>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-lunary-success' />
                <span className='text-sm text-content-secondary'>
                  Personalized birth charts
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-lunary-success' />
                <span className='text-sm text-content-secondary'>
                  Social features for comparing charts
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-content-muted'>—</span>
                <span className='text-sm text-content-muted'>
                  Ads in free tier
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-content-muted'>—</span>
                <span className='text-sm text-content-muted'>
                  No tarot, crystals, or magical tools
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-content-muted'>—</span>
                <span className='text-sm text-content-muted'>
                  No AI chat assistant or pattern recognition
                </span>
              </div>
            </div>
          </div>

          {/* CHANI */}
          <div className='mb-8 rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-6'>
            <h3 className='text-xl font-medium text-content-primary mb-2'>
              CHANI
            </h3>
            <p className='text-sm text-content-secondary leading-relaxed mb-4'>
              CHANI offers premium curated content from professional astrologers
              with an editorial approach. Good for users who want expert-written
              astrology content, but at a higher price point.
            </p>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-lunary-success' />
                <span className='text-sm text-content-secondary'>
                  Expert-written content
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-lunary-success' />
                <span className='text-sm text-content-secondary'>
                  Editorial approach to astrology
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-content-muted'>—</span>
                <span className='text-sm text-content-muted'>
                  Higher pricing (~$12.99/mo)
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-content-muted'>—</span>
                <span className='text-sm text-content-muted'>
                  No tarot, crystals, Book of Shadows, or AI chat
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-content-muted'>—</span>
                <span className='text-sm text-content-muted'>
                  No magical tools or pattern recognition
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Lunary Wins */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-content-primary mb-6'>
            Why Lunary is Our Top Pick
          </h2>
          <div className='rounded-lg border border-lunary-primary-700 bg-layer-base/10 p-6'>
            <p className='text-sm text-content-secondary leading-relaxed mb-4'>
              Lunary is the only astrology app that combines astronomical
              accuracy with a complete magical practice ecosystem:
            </p>
            <ol className='list-decimal list-inside space-y-3 text-sm text-content-secondary ml-4'>
              <li>
                <strong className='text-content-primary'>
                  Real Astronomical Data (±1 arcminute):
                </strong>{' '}
                NASA-level accuracy for planetary positions, not generic
                astrology
              </li>
              <li>
                <strong className='text-content-primary'>
                  Astral Guide Chat:
                </strong>{' '}
                AI assistant with complete knowledge of your birth chart, tarot
                patterns, and journal entries
              </li>
              <li>
                <strong className='text-content-primary'>
                  Book of Shadows with Pattern Recognition:
                </strong>{' '}
                Personal magical journal that identifies archetypes and themes
                across your entries
              </li>
              <li>
                <strong className='text-content-primary'>
                  Tarot Pattern Analysis:
                </strong>{' '}
                Personalized readings based on your chart, plus pattern tracking
                across all your readings
              </li>
              <li>
                <strong className='text-content-primary'>
                  Crystals with Transit Context:
                </strong>{' '}
                Recommendations personalized to both your birth chart AND
                current transits
              </li>
              <li>
                <strong className='text-content-primary'>
                  Real-Time Transit Updates:
                </strong>{' '}
                Updates throughout the day as planetary movements affect your
                chart
              </li>
              <li>
                <strong className='text-content-primary'>
                  No Ads, Free Trial:
                </strong>{' '}
                Unlike Co-Star, trial has zero ads. Upgrade when you want full
                personalization.
              </li>
            </ol>
            <p className='text-sm text-content-secondary leading-relaxed mt-4'>
              Start your free trial today with no credit card required, upgrade
              when you want personalization to your specific chart.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className='text-center mb-12'>
          <Link
            href='/pricing'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-layer-base/20 hover:bg-layer-base/30 border border-lunary-primary-700 text-content-brand font-medium text-lg transition-colors'
          >
            Start Your Free Trial
            <ArrowRight className='h-5 w-5' />
          </Link>
        </section>

        {/* Explore Grimoire */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-content-primary mb-6'>
            Explore the Lunary Grimoire
          </h2>
          <p className='text-sm text-content-muted mb-6'>
            Discover our comprehensive knowledge library that sets Lunary apart.
          </p>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            <Link
              href='/grimoire/guides/birth-chart-complete-guide'
              className='p-4 bg-surface-elevated/50 border border-stroke-subtle rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-content-secondary font-medium'>
                Birth Chart Guide
              </span>
              <p className='text-xs text-content-muted mt-1'>
                Complete guide to reading your chart
              </p>
            </Link>
            <Link
              href='/grimoire/astronomy/planets'
              className='p-4 bg-surface-elevated/50 border border-stroke-subtle rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-content-secondary font-medium'>
                Planetary Meanings
              </span>
              <p className='text-xs text-content-muted mt-1'>
                Understand astrological planets
              </p>
            </Link>
            <Link
              href='/grimoire/tarot'
              className='p-4 bg-surface-elevated/50 border border-stroke-subtle rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-content-secondary font-medium'>
                78 Tarot Cards
              </span>
              <p className='text-xs text-content-muted mt-1'>
                Major & Minor Arcana meanings
              </p>
            </Link>
            <Link
              href='/grimoire/crystals'
              className='p-4 bg-surface-elevated/50 border border-stroke-subtle rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-content-secondary font-medium'>
                Crystal Guide
              </span>
              <p className='text-xs text-content-muted mt-1'>
                Properties and correspondences
              </p>
            </Link>
            <Link
              href='/grimoire/zodiac'
              className='p-4 bg-surface-elevated/50 border border-stroke-subtle rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-content-secondary font-medium'>
                12 Zodiac Signs
              </span>
              <p className='text-xs text-content-muted mt-1'>
                Traits, dates, and compatibility
              </p>
            </Link>
            <Link
              href='/grimoire'
              className='p-4 bg-surface-elevated/50 border border-stroke-subtle rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-content-secondary font-medium'>
                Full Grimoire
              </span>
              <p className='text-xs text-content-muted mt-1'>
                500+ pages of cosmic wisdom
              </p>
            </Link>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className='pt-8 border-t border-stroke-subtle pb-8'>
          <p className='text-xs text-content-muted leading-relaxed'>
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
