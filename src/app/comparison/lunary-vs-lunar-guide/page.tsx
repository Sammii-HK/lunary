import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, ArrowRight, Star } from 'lucide-react';
import { ComparisonPageStructuredData } from '@/components/ComparisonPageStructuredData';

export const metadata: Metadata = {
  title: 'Lunary vs Lunar Guide: Real Astronomy vs AI',
  description:
    'Compare Lunary vs Lunar Guide. Lunary uses real astronomical data for accurate birth charts, while Lunar Guide uses AI. See which astrology app offers true personalization.',
  openGraph: {
    title: 'Lunary vs Lunar Guide: Real Astronomy vs AI',
    description:
      'Compare Lunary vs Lunar Guide. See which app uses real astronomical calculations versus AI-powered insights.',
    url: 'https://lunary.app/comparison/lunary-vs-lunar-guide',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/comparison/lunary-vs-lunar-guide',
  },
};

export default function LunaryVsLunarGuidePage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <ComparisonPageStructuredData
        competitorName='Lunar Guide'
        featuresCompared={[
          'Real astronomical calculations vs AI',
          'Personalized birth charts',
          'Grimoire with spells and rituals',
          'Astronomical accuracy',
        ]}
        conclusion='Lunary uses real astronomical calculations for accurate birth charts, while Lunar Guide uses AI-powered insights. Lunary also includes a complete grimoire, making it the better choice for users seeking astronomical accuracy and magical tools.'
      />
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Lunary vs Lunar Guide: Real Astronomy vs AI
          </h1>
          <p className='text-lg text-zinc-400'>
            A detailed comparison between real astronomical calculations and
            AI-powered astrology insights.
          </p>
        </div>

        <div className='mb-8 p-6 rounded-lg border border-purple-500/30 bg-purple-500/10'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            <strong>Note:</strong> This comparison is based on publicly
            available information and focuses on factual differences. We aim to
            be fair and accurate in our assessment of both apps.
          </p>
        </div>

        {/* Feature Comparison Table */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Feature Comparison
          </h2>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse border border-zinc-800'>
              <thead>
                <tr className='bg-zinc-900'>
                  <th className='border border-zinc-800 p-4 text-left text-zinc-200'>
                    Feature
                  </th>
                  <th className='border border-zinc-800 p-4 text-center text-purple-300 font-medium'>
                    Lunary
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
                    <span className='text-xs text-zinc-500'>
                      How birth charts are calculated
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      Real Astronomical Data
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>AI-Powered</span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      Personalized Birth Chart
                    </strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Based on exact birth time, date, location
                    </span>
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
                    <span className='text-xs text-zinc-500'>
                      Based on YOUR chart vs generic zodiac
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      Chart-Based
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>AI-Generated</span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Grimoire Included</strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Spells, rituals, correspondences
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <X className='h-5 w-5 text-zinc-500 mx-auto' />
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Tarot Readings</strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Personalized to your chart
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>Limited</span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      Astronomical Accuracy
                    </strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Uses real planetary positions
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>
                      AI Interpretation
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Free Trial</strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Try before you buy
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-lunary-success font-medium'>
                      7 days
                    </span>
                    <br />
                    <span className='text-xs text-zinc-400'>
                      No payment during trial
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>
                      Limited free features
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Pricing</strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Monthly subscription
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-100 font-medium'>$4.99/mo</span>
                    <br />
                    <span className='text-xs text-zinc-400'>or $39.99/yr</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>
                      Varies by plan
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Lunary Advantages */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Why Choose Lunary?
          </h2>
          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Real Astronomical Calculations
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary uses actual astronomical calculations from your exact
                    birth time, date, and location. Unlike AI-powered apps that
                    interpret data, Lunary calculates planetary positions using
                    real astronomy for maximum accuracy.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Chart-Based Personalization
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Every horoscope and insight is based on YOUR exact birth
                    chart, calculated using real astronomical data. This
                    provides more accurate and personalized guidance than
                    AI-generated interpretations.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Complete Grimoire Included
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary includes a complete grimoire with spells, rituals,
                    correspondences, and magical knowledge - unique to Lunary
                    and not available in Lunar Guide.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Astronomical Precision
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    By using real planetary positions rather than AI
                    interpretation, Lunary provides astronomically accurate
                    birth charts and insights based on actual celestial
                    mechanics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* When Lunar Guide Might Be Better */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            When Lunar Guide Might Be Better
          </h2>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              Lunar Guide may be a better choice if you prefer AI-powered
              insights that adapt to your current thoughts and moods. Lunar
              Guide appears to use AI to generate personalized guidance based on
              your current state, which may appeal to users seeking adaptive,
              context-aware insights.
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              However, if you want real astronomical calculations, chart-based
              personalization, and a complete grimoire, Lunary is the better
              choice for astronomical accuracy and magical tools.
            </p>
          </div>
        </section>

        {/* Conclusion */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Conclusion
          </h2>
          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              The key difference between Lunary and Lunar Guide is the
              calculation method: Lunary uses real astronomical calculations
              while Lunar Guide uses AI-powered insights. Lunary's approach
              provides astronomically accurate birth charts based on actual
              planetary positions, while Lunar Guide uses AI to interpret and
              adapt insights.
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              If you're looking for an astrology app that uses real astronomy,
              provides chart-based personalization, and includes magical tools
              like a grimoire, Lunary is the better choice. If you prefer
              AI-powered adaptive insights, Lunar Guide may be worth
              considering.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className='text-center mb-12'>
          <Link
            href='/pricing'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-medium text-lg transition-colors'
          >
            Start Your Free Trial
            <ArrowRight className='h-5 w-5' />
          </Link>
        </section>

        {/* Legal Disclaimer */}
        <section className='mt-12 pt-8 border-t border-zinc-800'>
          <p className='text-xs text-zinc-500 leading-relaxed'>
            <strong>Disclaimer:</strong> This comparison is based on publicly
            available information as of 2025. Features and pricing may change.
            Lunar Guide is a registered trademark of its respective owner. This
            comparison is for informational purposes only and is not intended to
            disparage any competitor. We strive to be fair and accurate in our
            assessments.
          </p>
        </section>
      </div>
    </div>
  );
}
