import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, ArrowRight, Star } from 'lucide-react';
import { ComparisonPageStructuredData } from '@/components/ComparisonPageStructuredData';

export const metadata: Metadata = {
  title: 'Lunary vs Arcarae: Personalized Charts vs Community',
  description:
    'Compare Lunary vs Arcarae. Lunary offers personalized birth chart insights and a complete grimoire, while Arcarae focuses on community content. See which astrology app fits your needs.',
  openGraph: {
    title: 'Lunary vs Arcarae: Personalized Charts vs Community',
    description:
      'Compare Lunary vs Arcarae. See which app offers personalized birth chart insights versus community-driven content.',
    url: 'https://lunary.app/comparison/lunary-vs-arcarae',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/comparison/lunary-vs-arcarae',
  },
};

export default function LunaryVsArcaraePage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <ComparisonPageStructuredData
        competitorName='Arcarae'
        featuresCompared={[
          'Personalized birth chart insights',
          'Community vs individual focus',
          'Grimoire with spells and rituals',
          'Real astronomical calculations',
        ]}
        conclusion='Lunary provides deeply personalized, chart-based insights with a complete magical tools ecosystem, while Arcarae focuses on community-driven generic content. Lunary is better for users seeking personalized astrological guidance.'
      />
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Lunary vs Arcarae: Personalized Charts vs Community
          </h1>
          <p className='text-lg text-zinc-400'>
            A detailed comparison between personalized birth chart insights and
            community-driven spiritual content.
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
                    Arcarae
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
                    <span className='text-zinc-500 text-sm'>
                      Community Content
                    </span>
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
                    <span className='text-zinc-500 text-sm'>Limited</span>
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
                    <span className='text-zinc-500 text-sm'>
                      Generic/Community
                    </span>
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
                      Community Features
                    </strong>
                    <br />
                    <span className='text-xs text-zinc-500'>
                      Social sharing, community content
                    </span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <span className='text-zinc-500 text-sm'>Limited</span>
                  </td>
                  <td className='border border-zinc-800 p-4 text-center'>
                    <Check className='h-5 w-5 text-lunary-success mx-auto' />
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
                      Varies by plan
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
          <div className='rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 p-6'>
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-lunary-primary-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Deeply Personalized Insights
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary provides deeply personalized analysis based on your
                    exact birth chart, calculated using real astronomical data.
                    Every horoscope and insight is tailored to YOUR unique
                    astrological profile, not generic community content.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-lunary-primary-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Complete Magical Tools Ecosystem
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary includes a complete grimoire with spells, rituals,
                    correspondences, personalized tarot readings, and magical
                    knowledge - creating a full magical tools ecosystem not
                    available in Arcarae.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-lunary-primary-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Real Astronomical Calculations
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Lunary uses actual astronomical calculations from your exact
                    birth time, date, and location. This provides astronomically
                    accurate birth charts based on real planetary positions.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-lunary-primary-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Individual-Focused Experience
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    While Arcarae focuses on community content, Lunary provides
                    an individual-focused experience with insights personalized
                    specifically to your birth chart and astrological profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* When Arcarae Might Be Better */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            When Arcarae Might Be Better
          </h2>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              Arcarae may be a better choice if you're looking for a
              community-focused platform with social features and shared
              spiritual content. Arcarae appears to offer community features,
              angel numbers content, and social sharing capabilities that may
              appeal to users seeking a more social, community-driven
              experience.
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              However, if you want deeply personalized, chart-based insights
              with a complete magical tools ecosystem, Lunary is the better
              choice for individual-focused astrological guidance.
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
              The key difference between Lunary and Arcarae is the focus: Lunary
              provides deeply personalized, chart-based insights with a complete
              magical tools ecosystem, while Arcarae focuses on community-driven
              generic content and social features.
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              If you're looking for an astrology app that provides personalized
              insights based on your exact birth chart, includes a complete
              grimoire, and offers magical tools like tarot and rituals, Lunary
              is the better choice. If you prefer community features and shared
              spiritual content, Arcarae may be worth considering.
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
            Arcarae is a registered trademark of its respective owner. This
            comparison is for informational purposes only and is not intended to
            disparage any competitor. We strive to be fair and accurate in our
            assessments.
          </p>
        </section>
      </div>
    </div>
  );
}
