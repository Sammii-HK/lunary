import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, ArrowRight, Star } from 'lucide-react';
import { ComparisonPageStructuredData } from '@/components/ComparisonPageStructuredData';

export const metadata: Metadata = {
  title: 'Lunary vs Pattern: Magical Ecosystem vs Psychology',
  description:
    'Compare Lunary vs Pattern. Lunary offers a complete magical and astrological ecosystem with grimoire and rituals, while Pattern focuses on psychology-based pattern analysis. See which app fits your needs.',
  openGraph: {
    title: 'Lunary vs Pattern: Magical Ecosystem vs Psychology',
    description:
      'Compare Lunary vs Pattern. See which app offers a complete magical ecosystem versus psychology-based pattern analysis.',
    url: 'https://lunary.app/comparison/lunary-vs-pattern',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/comparison/lunary-vs-pattern',
  },
};

export default function LunaryVsPatternPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <ComparisonPageStructuredData
        competitorName='Pattern'
        featuresCompared={[
          'Complete magical ecosystem',
          'Astrological pattern analysis',
          'Grimoire with spells and rituals',
          'Psychology vs astrology focus',
        ]}
        conclusion='Lunary provides a complete magical and astrological ecosystem with grimoire, rituals, and spells, while Pattern focuses on psychology-based pattern analysis. Lunary is better for users seeking a full magical and astrological experience.'
      />
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Lunary vs Pattern: Magical Ecosystem vs Psychology
          </h1>
          <p className='text-lg text-zinc-400'>
            A detailed comparison between a complete magical ecosystem and
            psychology-based pattern analysis.
          </p>
        </div>

        <div className='mb-8 p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
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
                  <th className='border border-zinc-800 p-4 text-center text-lunary-primary-300 font-medium'>
                    Lunary
                  </th>
                  <th className='border border-zinc-800 p-4 text-center text-zinc-300'>
                    Pattern
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Focus Area</strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Primary approach to insights
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      Astrology & Magic
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>
                      Psychology-Based
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Pattern Analysis</strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Analysis of patterns in your life
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      Astrological Patterns
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      Behavioral Patterns
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
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
                    <span className='text-zinc-500 text-sm'>Limited</span>
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
                    <X className='h-5 w-5 text-zinc-500 mx-auto' />
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Rituals & Spells</strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Magical practices and rituals
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
                    <strong className='text-zinc-100'>
                      Behavioral Insights
                    </strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Psychology-based pattern analysis
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>Limited</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
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
                      Varies by plan
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
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
          <div className='rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 p-6'>
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-lunary-primary-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Complete Magical Ecosystem
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary provides a full magical and astrological ecosystem
                    with a complete grimoire, spells, rituals, correspondences,
                    personalized tarot readings, and magical practices - all in
                    one platform.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-lunary-primary-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Astrological Pattern Analysis
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary offers astrological pattern analysis based on your
                    exact birth chart, calculated using real astronomical data.
                    This provides insights into astrological patterns in your
                    life based on planetary positions and transits.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-lunary-primary-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Tarot Pattern Insights
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary includes personalized tarot readings that provide
                    pattern insights based on your birth chart, combining
                    astrological patterns with tarot wisdom for deeper
                    understanding.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-lunary-primary-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    AI-Powered Astral Guide
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary includes an AI-powered astral guide that provides
                    personalized insights based on your exact birth chart,
                    combining real astronomy with intelligent pattern
                    recognition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* When Pattern Might Be Better */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            When Pattern Might Be Better
          </h2>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              Pattern may be a better choice if you're specifically interested
              in psychology-based pattern analysis and behavioral insights.
              Pattern appears to focus on identifying patterns in behavior and
              psychology, which may appeal to users seeking a more
              psychology-focused approach to self-understanding.
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              However, if you want a complete magical and astrological ecosystem
              with grimoire, rituals, spells, and astrological pattern analysis,
              Lunary is the better choice for a full magical and astrological
              experience.
            </p>
          </div>
        </section>

        {/* Conclusion */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Conclusion
          </h2>
          <div className='rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              The key difference between Lunary and Pattern is the focus: Lunary
              provides a complete magical and astrological ecosystem with
              grimoire, rituals, spells, and astrological pattern analysis,
              while Pattern focuses on psychology-based pattern analysis and
              behavioral insights.
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              If you're looking for an astrology app that provides a complete
              magical ecosystem with grimoire, tarot, rituals, and astrological
              pattern analysis, Lunary is the better choice. If you prefer
              psychology-based behavioral pattern analysis, Pattern may be worth
              considering.
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

        {/* Legal Disclaimer */}
        <section className='mt-12 pt-8 border-t border-zinc-800'>
          <p className='text-xs text-zinc-500 leading-relaxed'>
            <strong>Disclaimer:</strong> This comparison is based on publicly
            available information as of 2025. Features and pricing may change.
            Pattern is a registered trademark of its respective owner. This
            comparison is for informational purposes only and is not intended to
            disparage any competitor. We strive to be fair and accurate in our
            assessments.
          </p>
        </section>
      </div>
    </div>
  );
}
