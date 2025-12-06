import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, ArrowRight, Star } from 'lucide-react';
import { ComparisonPageStructuredData } from '@/components/ComparisonPageStructuredData';

export const metadata: Metadata = {
  title: 'Lunary vs Labyrinthos: Complete Cosmic Tools vs Tarot Focus',
  description:
    'Compare Lunary vs Labyrinthos tarot app. Lunary offers astrology + tarot with magical tools, while Labyrinthos focuses on tarot learning. Find the best app for your practice.',
  openGraph: {
    title: 'Lunary vs Labyrinthos: Complete Cosmic Tools vs Tarot Focus',
    description:
      'Compare Lunary vs Labyrinthos. See which offers better spiritual tools.',
    url: 'https://lunary.app/comparison/lunary-vs-labyrinthos',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/comparison/lunary-vs-labyrinthos',
  },
};

export default function LunaryVsLabyrinthosPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <ComparisonPageStructuredData
        competitorName='Labyrinthos'
        featuresCompared={[
          'Astrology + Tarot integration vs Tarot-only',
          'Grimoire with rituals and correspondences',
          'Real astronomical calculations',
          'AI-powered personalization',
        ]}
        conclusion='Lunary offers a complete cosmic toolkit combining astrology, tarot, and magical practices, while Labyrinthos focuses specifically on tarot education. Lunary is better for those seeking an integrated spiritual practice.'
      />
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Lunary vs Labyrinthos: Complete Cosmic Tools vs Tarot Focus
          </h1>
          <p className='text-lg text-zinc-400'>
            A detailed comparison between a complete magical toolkit and a
            tarot-focused learning app.
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
                    Labyrinthos
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Astrology</strong>
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
                    <strong className='text-zinc-100'>Tarot Education</strong>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>Grimoire</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-green-400 font-medium text-sm'>
                      Comprehensive
                    </span>
                  </td>
                </tr>
                <tr className='bg-zinc-900/30'>
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
                <tr className='bg-zinc-900/50'>
                  <td className='border border-zinc-800 p-4 text-zinc-300'>
                    <strong className='text-zinc-100'>Birth Chart</strong>
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
                    <strong className='text-zinc-100'>
                      Chart-Personalized Tarot
                    </strong>
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
                    <strong className='text-zinc-100'>Pricing</strong>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-100 font-medium'>$4.99/mo</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>Free + IAP</span>
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
                    Complete Cosmic Integration
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary combines astrology and tarot in one app, with tarot
                    readings personalized to your birth chart for deeper
                    insights.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Full Magical Practice
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Beyond tarot, Lunary includes a grimoire with spells,
                    rituals, correspondences, and crystals—everything for your
                    spiritual practice.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Real Astronomical Data
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Your birth chart and transits are based on actual
                    astronomical calculations, not simplified astrology.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            When Labyrinthos Might Be Better
          </h2>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Labyrinthos is excellent if you want to deeply study tarot with
              structured lessons, flashcards, and quizzes. It's focused
              specifically on tarot education and has beautiful card artwork.
            </p>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Conclusion
          </h2>
          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Lunary is ideal for users who want a complete magical practice
              combining astrology and tarot with personalization. Labyrinthos
              suits those who specifically want to learn tarot in depth.
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
            available information as of 2025. Labyrinthos is a registered
            trademark of its respective owner.
          </p>
        </section>
      </div>
    </div>
  );
}
