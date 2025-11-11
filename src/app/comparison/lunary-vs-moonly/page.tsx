import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, Star, Moon, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Lunary vs Moonly: Which Astrology App is Better?',
  description:
    'Compare Lunary and Moonly astrology apps. See how Lunary uses real astronomical data, personalized birth charts, and includes a complete grimoire. Free 7-day trial available.',
  openGraph: {
    title: 'Lunary vs Moonly: Which Astrology App is Better?',
    description:
      'Compare Lunary and Moonly astrology apps. See how Lunary uses real astronomical data and personalized birth charts.',
    url: 'https://lunary.app/comparison/lunary-vs-moonly',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/comparison/lunary-vs-moonly',
  },
};

export default function LunaryVsMoonlyPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Lunary vs Moonly: Which Astrology App is Better?
          </h1>
          <p className='text-lg text-zinc-400'>
            A fair comparison of two popular astrology apps to help you choose
            the right one for your cosmic journey.
          </p>
        </div>

        <div className='mb-8 p-6 rounded-lg border border-purple-500/30 bg-purple-500/10'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            <strong>Note:</strong> This comparison is based on publicly
            available information and focuses on factual differences. We aim to
            be fair and accurate in our assessment.
          </p>
        </div>

        {/* Key Differences Table */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Key Differences
          </h2>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse border border-zinc-800'>
              <thead>
                <tr className='bg-zinc-900'>
                  <th className='border border-zinc-800 p-4 text-left text-zinc-200'>
                    Feature
                  </th>
                  <th className='border border-zinc-800 p-4 text-center text-purple-300'>
                    Lunary
                  </th>
                  <th className='border border-zinc-800 p-4 text-center text-zinc-300'>
                    Moonly
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Astronomical Data</strong>
                    <br />
                    <span className='text-sm'>
                      Uses real astronomical calculations
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-green-400 mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>
                      Generic astrology
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      Personalized Birth Chart
                    </strong>
                    <br />
                    <span className='text-sm'>
                      Based on exact birth time, date, location
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-green-400 mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-green-400 mx-auto' />
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      Personalized Horoscopes
                    </strong>
                    <br />
                    <span className='text-sm'>
                      Based on YOUR birth chart, not generic zodiac
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-green-400 mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>
                      Generic zodiac
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Grimoire Included</strong>
                    <br />
                    <span className='text-sm'>
                      Spells, rituals, correspondences, guides
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-green-400 mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <X className='h-5 w-5 text-zinc-500 mx-auto' />
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Free Trial</strong>
                    <br />
                    <span className='text-sm'>Try before you buy</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-green-400 font-medium'>7 days</span>
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
                    <span className='text-sm'>Monthly subscription</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-100 font-medium'>$4.99/mo</span>
                    <br />
                    <span className='text-sm text-zinc-400'>or $39.99/yr</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>
                      Varies by plan
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Cross-Device Sync</strong>
                    <br />
                    <span className='text-sm'>Access your chart anywhere</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-green-400 mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-green-400 mx-auto' />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Why Choose Lunary */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Why Choose Lunary?
          </h2>
          <div className='space-y-4'>
            <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
              <div className='flex items-start gap-4'>
                <Star className='h-6 w-6 text-purple-400 flex-shrink-0 mt-1' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Real Astronomical Calculations
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary uses actual astronomical data to calculate your birth
                    chart. We don't use generic astrology - we calculate
                    planetary positions from your exact birth time, date, and
                    location using real astronomy.
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
              <div className='flex items-start gap-4'>
                <Moon className='h-6 w-6 text-purple-400 flex-shrink-0 mt-1' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Truly Personalized Horoscopes
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Unlike generic zodiac horoscopes, Lunary creates daily
                    horoscopes based on YOUR exact birth chart. Every insight is
                    personalized to your unique cosmic signature, not just your
                    sun sign.
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
              <div className='flex items-start gap-4'>
                <Sparkles className='h-6 w-6 text-purple-400 flex-shrink-0 mt-1' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Complete Grimoire Included
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary includes a comprehensive digital grimoire with
                    spells, rituals, correspondences, crystal guides, and
                    magical knowledge. This is unique to Lunary and not
                    available in other astrology apps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* When Moonly Might Be Better */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            When Moonly Might Be Better For You
          </h2>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              Moonly offers Vedic astrology, which may appeal to users
              interested in that specific tradition. If you're looking for
              Vedic-specific calculations and interpretations, Moonly might be a
              better fit.
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              However, if you want Western astrology based on real astronomical
              data with personalized insights and a complete grimoire, Lunary is
              the better choice.
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
              Both apps have their strengths, but Lunary stands out for:
            </p>
            <ul className='list-disc list-inside space-y-2 text-sm text-zinc-300 mb-6 ml-4'>
              <li>Real astronomical calculations (not generic astrology)</li>
              <li>
                Truly personalized horoscopes based on your exact birth chart
              </li>
              <li>Complete grimoire with spells, rituals, and guides</li>
              <li>Transparent pricing with free trial</li>
              <li>Focus on Western astrology with scientific accuracy</li>
            </ul>
            <div className='flex gap-4'>
              <Link
                href='/pricing'
                className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-medium transition-colors'
              >
                Try Lunary Free
              </Link>
              <Link
                href='/welcome'
                className='inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 font-medium transition-colors'
              >
                Learn More About Lunary
              </Link>
            </div>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className='mt-12 pt-8 border-t border-zinc-800'>
          <p className='text-xs text-zinc-500 leading-relaxed'>
            <strong>Disclaimer:</strong> This comparison is based on publicly
            available information as of 2025. Features and pricing may change.
            Moonly is a registered trademark of its respective owner. This
            comparison is for informational purposes only and is not intended to
            disparage any competitor. We strive to be fair and accurate in our
            assessments.
          </p>
        </section>
      </div>
    </div>
  );
}
