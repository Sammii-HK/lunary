import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, ArrowRight, Star } from 'lucide-react';
import { ComparisonPageStructuredData } from '@/components/ComparisonPageStructuredData';

export const metadata: Metadata = {
  title: 'Lunary vs Astro.com: Modern Magic vs Classic Calculator',
  description:
    'Compare Lunary vs Astro.com. Lunary offers modern design with magical tools, while Astro.com provides classic free chart calculations. Find the best astrology tool for you.',
  openGraph: {
    title: 'Lunary vs Astro.com: Modern Magic vs Classic Calculator',
    description:
      'Compare Lunary vs Astro.com. See which offers better astrological tools.',
    url: 'https://lunary.app/comparison/lunary-vs-astro-com',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/comparison/lunary-vs-astro-com',
  },
};

export default function LunaryVsAstroComPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <ComparisonPageStructuredData
        competitorName='Astro.com'
        featuresCompared={[
          'Modern app experience vs website',
          'Magical tools (grimoire, tarot, rituals)',
          'AI-powered insights vs manual interpretation',
          'User-friendly design vs technical interface',
        ]}
        conclusion='Lunary offers a modern, accessible experience with magical tools and AI insights, while Astro.com provides free professional-grade calculations for experienced astrologers. Lunary is better for those seeking an integrated magical practice.'
      />
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Lunary vs Astro.com: Modern Magic vs Classic Calculator
          </h1>
          <p className='text-lg text-zinc-400'>
            A detailed comparison between a modern magical app and the classic
            astrology calculation website.
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
                    Astro.com
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Ease of Use</strong>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-green-400 font-medium text-sm'>
                      Beginner-Friendly
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>
                      Steep Learning Curve
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      Calculation Quality
                    </strong>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-green-400 font-medium text-sm'>
                      Astronomical Data
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-green-400 font-medium text-sm'>
                      Professional Grade
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>
                      Grimoire & Rituals
                    </strong>
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
                    <strong className='text-zinc-100'>Tarot Integration</strong>
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
                    <strong className='text-zinc-100'>AI Interpretation</strong>
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
                    <strong className='text-zinc-100'>Pricing</strong>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-100 font-medium'>$4.99/mo</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-green-400 font-medium text-sm'>
                      Free (basic)
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
                    Instant Understanding
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary's AI explains your chart in plain language—no
                    astrology degree required to understand your cosmic profile.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Integrated Magical Practice
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Combine astrology with tarot, rituals, and grimoire content
                    for a complete spiritual toolkit.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Beautiful Mobile Experience
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Access your cosmic insights anywhere with a modern,
                    mobile-optimized design.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            When Astro.com Might Be Better
          </h2>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Astro.com is the gold standard for professional astrologers who
              need highly accurate calculations, extensive options, and detailed
              technical data. It's free for basic charts and trusted by
              professionals worldwide.
            </p>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Conclusion
          </h2>
          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Lunary is perfect for users who want accessible, personalized
              astrology with magical tools. Astro.com serves professional
              astrologers who need technical calculations and can interpret
              charts themselves.
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
            available information as of 2025. Astro.com is a registered
            trademark of Astrodienst AG.
          </p>
        </section>
      </div>
    </div>
  );
}
