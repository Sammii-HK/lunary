import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, ArrowRight, Star } from 'lucide-react';
import { ComparisonPageStructuredData } from '@/components/ComparisonPageStructuredData';

export const metadata: Metadata = {
  title: 'Lunary vs CHANI: Astronomical Precision vs Celebrity Astrology',
  description:
    'Compare Lunary vs CHANI app. Lunary offers real astronomical calculations and magical tools, while CHANI focuses on celebrity astrologer content. Find the best astrology app for you.',
  openGraph: {
    title: 'Lunary vs CHANI: Astronomical Precision vs Celebrity Astrology',
    description:
      'Compare Lunary vs CHANI. See which app offers better personalized astrological guidance.',
    url: 'https://lunary.app/comparison/lunary-vs-chani',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/comparison/lunary-vs-chani',
  },
};

export default function LunaryVsChaniPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <ComparisonPageStructuredData
        competitorName='CHANI'
        featuresCompared={[
          'Real astronomical calculations vs traditional astrology',
          'Magical tools (grimoire, tarot, rituals)',
          'AI-powered insights vs celebrity content',
          'Pricing and features',
        ]}
        conclusion='Lunary offers real astronomical calculations with magical tools and affordable pricing, while CHANI focuses on celebrity astrologer content. Lunary is better for users seeking data-driven personalization with magical practices.'
      />
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Lunary vs CHANI: Astronomical Precision vs Celebrity Astrology
          </h1>
          <p className='text-lg text-zinc-400'>
            A detailed comparison between real astronomical data with magical
            tools and celebrity astrologer content.
          </p>
        </div>

        <div className='mb-8 p-6 rounded-lg border border-purple-500/30 bg-purple-500/10'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            <strong>Note:</strong> This comparison is based on publicly
            available information and focuses on factual differences. We aim to
            be fair and accurate in our assessment of both apps.
          </p>
        </div>

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
                    <span className='text-xs text-zinc-500'>
                      How birth charts are calculated
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-green-400 font-medium text-sm'>
                      Real Astronomical Data
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>
                      Traditional Astrology
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Content Style</strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Tone and approach
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      Data-Driven + Mystical
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      Poetic + Spiritual
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Grimoire Included</strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Spells, rituals, correspondences
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-green-400 mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <X className='h-5 w-5 text-zinc-500 mx-auto' />
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Tarot Readings</strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Personalized to your chart
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
                    <strong className='text-zinc-100'>
                      Celebrity Astrologer
                    </strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Famous astrologer brand
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <X className='h-5 w-5 text-zinc-500 mx-auto' />
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-green-400 mx-auto' />
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Free Trial</strong>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-green-400 font-medium'>7 days</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>
                      Limited free tier
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Pricing</strong>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-100 font-medium'>$4.99/mo</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>~$12.99/mo</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

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
                    Lunary bases all charts and transits on actual astronomical
                    data—not simplified traditional astrology—providing more
                    precise and scientifically grounded insights.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Complete Magical Toolkit
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary includes tarot readings personalized to your chart, a
                    comprehensive grimoire with spells and rituals, and
                    correspondences for crystals, herbs, and more.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Better Value
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    At $4.99/month, Lunary offers more features at a lower price
                    than CHANI, making personalized cosmic guidance accessible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            When CHANI Might Be Better
          </h2>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              CHANI may be a better choice if you're a fan of Chani Nicholas'
              writing style and want content from a specific celebrity
              astrologer. Her poetic, spiritually-focused approach resonates
              with many users who prefer that tone.
            </p>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Conclusion
          </h2>
          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              For users seeking real astronomical precision, magical tools, and
              excellent value, Lunary is the superior choice. CHANI offers
              celebrity astrologer content for those who prefer that specific
              style and brand.
            </p>
          </div>
        </section>

        <section className='text-center mb-12'>
          <Link
            href='/pricing'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-medium text-lg transition-colors'
          >
            Start Your Free Trial
            <ArrowRight className='h-5 w-5' />
          </Link>
        </section>

        <section className='mt-12 pt-8 border-t border-zinc-800'>
          <p className='text-xs text-zinc-500 leading-relaxed'>
            <strong>Disclaimer:</strong> This comparison is based on publicly
            available information as of 2025. Features and pricing may change.
            CHANI is a registered trademark of its respective owner.
          </p>
        </section>
      </div>
    </div>
  );
}
