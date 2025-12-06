import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, ArrowRight, Star } from 'lucide-react';
import { ComparisonPageStructuredData } from '@/components/ComparisonPageStructuredData';

export const metadata: Metadata = {
  title: 'Lunary vs Sanctuary: Real Astronomy vs Premium Content',
  description:
    'Compare Lunary vs Sanctuary. Lunary offers real astronomical calculations and magical tools, while Sanctuary focuses on premium astrologer content. See which app is right for you.',
  openGraph: {
    title: 'Lunary vs Sanctuary: Real Astronomy vs Premium Content',
    description:
      'Compare Lunary vs Sanctuary. See which app offers better personalized astrological guidance.',
    url: 'https://lunary.app/comparison/lunary-vs-sanctuary',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/comparison/lunary-vs-sanctuary',
  },
};

export default function LunaryVsSanctuaryPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <ComparisonPageStructuredData
        competitorName='Sanctuary'
        featuresCompared={[
          'Real astronomical calculations',
          'Magical tools (grimoire, tarot, rituals)',
          'Premium astrologer content vs AI-powered insights',
          'Pricing and value',
        ]}
        conclusion='Lunary offers real astronomical calculations with magical tools and AI-powered personalization, while Sanctuary focuses on premium human astrologer content. Lunary is better for users seeking personalized, data-driven astrological guidance with magical practices.'
      />
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Lunary vs Sanctuary: Real Astronomy vs Premium Content
          </h1>
          <p className='text-lg text-zinc-400'>
            A detailed comparison between astronomical accuracy with magical
            tools and premium astrologer content.
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
                    Sanctuary
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
                      Standard Astrology
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Content Source</strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Who creates the insights
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-green-400 font-medium text-sm'>
                      AI + Astronomical Data
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-400 text-sm'>
                      Human Astrologers
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
                    <strong className='text-zinc-100'>Live Readings</strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      One-on-one with astrologers
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
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Try before you buy
                    </span>
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
                    <span className='text-zinc-500 text-sm'>~$19.99/mo</span>
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
                    Lunary uses actual astronomical data and calculations from
                    your exact birth time, date, and location for precise,
                    science-backed astrological insights.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Complete Magical Ecosystem
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Beyond astrology, Lunary includes tarot readings, a
                    comprehensive grimoire with spells and rituals, and magical
                    correspondences—all personalized to your chart.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Affordable Pricing
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    At $4.99/month, Lunary offers significantly more value
                    compared to Sanctuary's premium pricing, making personalized
                    cosmic guidance accessible to everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            When Sanctuary Might Be Better
          </h2>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Sanctuary may be a better choice if you specifically want live,
              one-on-one readings with human astrologers and prefer premium,
              hand-crafted content over AI-powered insights. However, this comes
              at a significantly higher price point.
            </p>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Conclusion
          </h2>
          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Lunary offers a comprehensive, affordable alternative to Sanctuary
              with real astronomical calculations, magical tools, and AI-powered
              personalization. For users seeking accurate, data-driven astrology
              with additional magical practices, Lunary provides exceptional
              value at a fraction of the cost.
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
            Sanctuary is a registered trademark of its respective owner.
          </p>
        </section>
      </div>
    </div>
  );
}
