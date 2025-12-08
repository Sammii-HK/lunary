import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, ArrowRight, Star } from 'lucide-react';
import { ComparisonPageStructuredData } from '@/components/ComparisonPageStructuredData';

export const metadata: Metadata = {
  title: 'Lunary vs TimePassages: Modern Magic vs Traditional Software',
  description:
    'Compare Lunary vs TimePassages astrology software. Lunary offers modern design with magical tools, while TimePassages provides traditional desktop astrology. Find the best option for you.',
  openGraph: {
    title: 'Lunary vs TimePassages: Modern Magic vs Traditional Software',
    description:
      'Compare Lunary vs TimePassages. See which offers better astrological tools for your needs.',
    url: 'https://lunary.app/comparison/lunary-vs-timepassages',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/comparison/lunary-vs-timepassages',
  },
};

export default function LunaryVsTimePassagesPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <ComparisonPageStructuredData
        competitorName='TimePassages'
        featuresCompared={[
          'Modern mobile-first design vs traditional software',
          'Magical tools (grimoire, tarot) vs pure astrology',
          'Subscription vs one-time purchase',
          'AI-powered insights vs manual interpretation',
        ]}
        conclusion='Lunary offers a modern, mobile-first experience with magical tools and AI-powered insights, while TimePassages provides traditional desktop astrology software. Lunary is better for users seeking an integrated magical practice with modern design.'
      />
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Lunary vs TimePassages: Modern Magic vs Traditional Software
          </h1>
          <p className='text-lg text-zinc-400'>
            A detailed comparison between modern magical tools and traditional
            astrology software.
          </p>
        </div>

        <div className='mb-8 p-6 rounded-lg border border-purple-500/30 bg-purple-500/10'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            <strong>Note:</strong> This comparison is based on publicly
            available information and focuses on factual differences.
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
                    TimePassages
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Platform</strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Where you can use it
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      Web + Mobile
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>
                      Desktop + Mobile
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Design</strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      User interface approach
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-lunary-success font-medium text-sm'>
                      Modern, Minimal
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>Traditional</span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      Grimoire & Rituals
                    </strong>
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
                    <strong className='text-zinc-100'>Tarot Integration</strong>
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
                      Advanced Chart Features
                    </strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Synastry, progressions, etc.
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>Basic</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      AI-Powered Insights
                    </strong>
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
                    <strong className='text-zinc-100'>Pricing Model</strong>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-100 font-medium'>$4.99/mo</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>
                      One-time ~$15-50
                    </span>
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
                    Modern, Beautiful Design
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary offers a sleek, modern interface designed for today's
                    users—unlike TimePassages' traditional software aesthetic.
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
                    Beyond charts, Lunary includes tarot, grimoire, rituals, and
                    correspondences—tools TimePassages doesn't offer.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    AI-Powered Personalization
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary's AI provides personalized insights based on your
                    chart, making interpretation accessible without years of
                    study.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            When TimePassages Might Be Better
          </h2>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              TimePassages may be better if you're an experienced astrologer who
              needs advanced chart features like detailed synastry, secondary
              progressions, and solar arc directions. It's also a one-time
              purchase rather than a subscription.
            </p>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Conclusion
          </h2>
          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Lunary is ideal for users who want a modern, integrated magical
              practice with astrology, tarot, and rituals in a beautiful
              interface. TimePassages suits experienced astrologers who need
              advanced technical features.
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
            available information as of 2025. TimePassages is a registered
            trademark of its respective owner.
          </p>
        </section>
      </div>
    </div>
  );
}
