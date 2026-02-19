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
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
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
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Best Personalized Astrology Apps {currentYear}
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
                    <div className='flex items-center justify-center gap-2'>
                      Lunary
                      <Star className='h-4 w-4' />
                    </div>
                  </th>
                  <th className='border border-zinc-800 p-4 text-center text-zinc-300'>
                    Co-Star
                  </th>
                  <th className='border border-zinc-800 p-4 text-center text-zinc-300'>
                    CHANI
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
                      ±1 arcminute accuracy
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      Standard Astrology
                    </span>
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
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      Expert-Written
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      Grimoire (2000+ pages)
                    </strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      Spells, rituals, correspondences - 100% free
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
                    <span className='text-zinc-400'>—</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400'>—</span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      Tarot Pattern Analysis
                    </strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      Identifies themes across your readings
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
                    <strong className='text-zinc-100'>
                      Book of Shadows Journal
                    </strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      With archetype pattern recognition
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
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Astral Guide Chat</strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      AI with full chart context
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
                    <strong className='text-zinc-100'>Crystal Guidance</strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      Based on birth chart + current transits
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
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      Real-Time Transit Updates
                    </strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      Updates throughout the day
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
                    <strong className='text-zinc-100'>Ads</strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      Ad-free experience
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      None
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      Yes (free tier)
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      None
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Free Tier</strong>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      What's included free
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      Generous (No Ads)
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      Available (With Ads)
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>Limited</span>
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
                    <span className='text-lunary-success font-medium'>
                      Free + from $4.99/mo
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      Free + $2.99/mo
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>~$12.99/mo</span>
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
                  Lunary - Our Top Pick
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
                      Astral Guide chat with full chart context
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-zinc-300'>
                      Book of Shadows journal with pattern recognition
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-zinc-300'>
                      Tarot with pattern analysis & chart-based readings
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-zinc-300'>
                      Crystals personalized to transits + birth chart
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-zinc-300'>
                      Real-time transit updates throughout the day
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-lunary-success' />
                    <span className='text-sm text-zinc-300'>
                      Free tier with no ads · Paid tiers from $4.99/mo
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

          {/* Co-Star */}
          <div className='mb-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <h3 className='text-xl font-medium text-zinc-100 mb-2'>Co-Star</h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              Co-Star offers personalized horoscopes with a minimalist,
              text-based interface and social features. Popular for its unique
              aesthetic and push notifications.
            </p>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-lunary-success' />
                <span className='text-sm text-zinc-300'>
                  Personalized birth charts
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-lunary-success' />
                <span className='text-sm text-zinc-300'>
                  Social features for comparing charts
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-zinc-400'>—</span>
                <span className='text-sm text-zinc-400'>Ads in free tier</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-zinc-400'>—</span>
                <span className='text-sm text-zinc-400'>
                  No tarot, crystals, or magical tools
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-zinc-400'>—</span>
                <span className='text-sm text-zinc-400'>
                  No AI chat assistant or pattern recognition
                </span>
              </div>
            </div>
          </div>

          {/* CHANI */}
          <div className='mb-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <h3 className='text-xl font-medium text-zinc-100 mb-2'>CHANI</h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              CHANI offers premium curated content from professional astrologers
              with an editorial approach. Good for users who want expert-written
              astrology content, but at a higher price point.
            </p>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-lunary-success' />
                <span className='text-sm text-zinc-300'>
                  Expert-written content
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-lunary-success' />
                <span className='text-sm text-zinc-300'>
                  Editorial approach to astrology
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-zinc-400'>—</span>
                <span className='text-sm text-zinc-400'>
                  Higher pricing (~$12.99/mo)
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-zinc-400'>—</span>
                <span className='text-sm text-zinc-400'>
                  No tarot, crystals, Book of Shadows, or AI chat
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-4 w-4 text-zinc-400'>—</span>
                <span className='text-sm text-zinc-400'>
                  No magical tools or pattern recognition
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
              Lunary is the only astrology app that combines astronomical
              accuracy with a complete magical practice ecosystem:
            </p>
            <ol className='list-decimal list-inside space-y-3 text-sm text-zinc-300 ml-4'>
              <li>
                <strong className='text-zinc-100'>
                  Real Astronomical Data (±1 arcminute):
                </strong>{' '}
                NASA-level accuracy for planetary positions, not generic
                astrology
              </li>
              <li>
                <strong className='text-zinc-100'>Astral Guide Chat:</strong> AI
                assistant with complete knowledge of your birth chart, tarot
                patterns, and journal entries
              </li>
              <li>
                <strong className='text-zinc-100'>
                  Book of Shadows with Pattern Recognition:
                </strong>{' '}
                Personal magical journal that identifies archetypes and themes
                across your entries
              </li>
              <li>
                <strong className='text-zinc-100'>
                  Tarot Pattern Analysis:
                </strong>{' '}
                Personalized readings based on your chart, plus pattern tracking
                across all your readings
              </li>
              <li>
                <strong className='text-zinc-100'>
                  Crystals with Transit Context:
                </strong>{' '}
                Recommendations personalized to both your birth chart AND
                current transits
              </li>
              <li>
                <strong className='text-zinc-100'>
                  Real-Time Transit Updates:
                </strong>{' '}
                Updates throughout the day as planetary movements affect your
                chart
              </li>
              <li>
                <strong className='text-zinc-100'>
                  No Ads, Generous Free Tier:
                </strong>{' '}
                Unlike Co-Star, free tier has zero ads. Upgrade when you want
                full personalization.
              </li>
            </ol>
            <p className='text-sm text-zinc-300 leading-relaxed mt-4'>
              Start free today with no credit card required, upgrade when you
              want personalization to your specific chart.
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
