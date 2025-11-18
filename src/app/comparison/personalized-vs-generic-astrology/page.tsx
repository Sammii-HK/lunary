import { Metadata } from 'next';
import Link from 'next/link';
import { Check, ArrowRight, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Personalized Astrology vs Generic: Why It Matters',
  description:
    'Learn why personalized astrology based on your exact birth chart is more accurate than generic zodiac horoscopes. Discover the benefits of real astronomical calculations and chart-based insights.',
  openGraph: {
    title: 'Personalized Astrology vs Generic: Why It Matters',
    description:
      'Learn why personalized astrology based on your exact birth chart is more accurate than generic zodiac horoscopes.',
    url: 'https://lunary.app/comparison/personalized-vs-generic-astrology',
    siteName: 'Lunary',
  },
  alternates: {
    canonical:
      'https://lunary.app/comparison/personalized-vs-generic-astrology',
  },
};

export default function PersonalizedVsGenericAstrologyPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Personalized Astrology vs Generic: Why It Matters
          </h1>
          <p className='text-lg text-zinc-400'>
            Understanding the difference between personalized birth chart
            astrology and generic zodiac horoscopes.
          </p>
        </div>

        <div className='mb-8 p-6 rounded-lg border border-purple-500/30 bg-purple-500/10'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            <strong>Note:</strong> This educational content explains the
            differences between personalized and generic astrology approaches to
            help you make informed decisions about astrology apps.
          </p>
        </div>

        {/* What is Generic Astrology */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            What is Generic Astrology?
          </h2>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              Generic astrology, also known as sun sign astrology, provides
              horoscopes and insights based solely on your zodiac sign (the
              position of the sun at your birth). This approach assumes that
              everyone born under the same sun sign will have similar
              experiences and characteristics.
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Generic horoscopes are written for millions of people at once,
              based only on the sun's position. They don't account for your
              exact birth time, date, location, or the positions of other
              planets in your birth chart.
            </p>
          </div>
        </section>

        {/* What is Personalized Astrology */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            What is Personalized Astrology?
          </h2>
          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              Personalized astrology creates a unique birth chart based on your
              exact birth time, date, and location. This chart calculates the
              positions of all planets, the moon, and other celestial bodies at
              the moment you were born, creating a one-of-a-kind astrological
              profile.
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Personalized horoscopes and insights are based on YOUR specific
              birth chart, taking into account planetary aspects, house
              placements, and transits that affect your unique astrological
              profile. This provides much more accurate and relevant guidance
              than generic zodiac horoscopes.
            </p>
          </div>
        </section>

        {/* Key Differences */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Key Differences
          </h2>
          <div className='space-y-4'>
            <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
              <div className='flex items-start gap-3 mb-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Calculation Method
                  </h3>
                  <div className='space-y-2 text-sm text-zinc-300'>
                    <div className='flex items-start gap-2'>
                      <span className='text-green-400'>✓</span>
                      <span>
                        <strong>Personalized:</strong> Uses your exact birth
                        time, date, and location to calculate planetary
                        positions using real astronomical data
                      </span>
                    </div>
                    <div className='flex items-start gap-2'>
                      <span className='text-zinc-500'>✗</span>
                      <span>
                        <strong>Generic:</strong> Based only on sun sign
                        position, doesn't require birth time or location
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
              <div className='flex items-start gap-3 mb-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Accuracy
                  </h3>
                  <div className='space-y-2 text-sm text-zinc-300'>
                    <div className='flex items-start gap-2'>
                      <span className='text-green-400'>✓</span>
                      <span>
                        <strong>Personalized:</strong> Accounts for all planets,
                        aspects, houses, and transits specific to your chart
                      </span>
                    </div>
                    <div className='flex items-start gap-2'>
                      <span className='text-zinc-500'>✗</span>
                      <span>
                        <strong>Generic:</strong> Only considers sun sign,
                        ignores other planetary influences
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
              <div className='flex items-start gap-3 mb-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Relevance
                  </h3>
                  <div className='space-y-2 text-sm text-zinc-300'>
                    <div className='flex items-start gap-2'>
                      <span className='text-green-400'>✓</span>
                      <span>
                        <strong>Personalized:</strong> Insights tailored to YOUR
                        unique astrological profile and current transits
                      </span>
                    </div>
                    <div className='flex items-start gap-2'>
                      <span className='text-zinc-500'>✗</span>
                      <span>
                        <strong>Generic:</strong> Same horoscope for millions of
                        people, not specific to your situation
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
              <div className='flex items-start gap-3 mb-3'>
                <Star className='h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Astronomical Accuracy
                  </h3>
                  <div className='space-y-2 text-sm text-zinc-300'>
                    <div className='flex items-start gap-2'>
                      <span className='text-green-400'>✓</span>
                      <span>
                        <strong>Personalized:</strong> Uses real astronomical
                        calculations based on actual planetary positions
                      </span>
                    </div>
                    <div className='flex items-start gap-2'>
                      <span className='text-zinc-500'>✗</span>
                      <span>
                        <strong>Generic:</strong> Often uses simplified or
                        approximate positions, not real astronomy
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Personalized Matters */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Why Personalized Astrology Matters
          </h2>
          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <Check className='h-5 w-5 text-green-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    More Accurate Insights
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Your birth chart is unique - even people born on the same
                    day will have different charts if they were born at
                    different times or locations. Personalized astrology
                    accounts for these differences, providing more accurate
                    insights.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Check className='h-5 w-5 text-green-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Real Astronomical Data
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Personalized astrology uses real astronomical calculations
                    based on actual planetary positions at your birth. This
                    provides astronomically accurate birth charts, not
                    approximations or generalizations.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Check className='h-5 w-5 text-green-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Relevant Guidance
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Personalized horoscopes consider current planetary transits
                    and how they specifically affect YOUR chart. This provides
                    guidance that's relevant to your unique situation, not
                    generic advice for millions of people.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Check className='h-5 w-5 text-green-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    Complete Picture
                  </h3>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    Personalized astrology considers all planets, aspects,
                    houses, and transits in your chart. This provides a complete
                    picture of your astrological profile, not just your sun
                    sign.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How Lunary Provides Personalized Astrology */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            How Lunary Provides Personalized Astrology
          </h2>
          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              Lunary uses real astronomical calculations to create your unique
              birth chart based on your exact birth time, date, and location.
              Every horoscope, insight, and reading is personalized to YOUR
              specific chart, not generic zodiac signs.
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-green-400' />
                <span className='text-sm text-zinc-300'>
                  Real astronomical calculations from your exact birth data
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-green-400' />
                <span className='text-sm text-zinc-300'>
                  Personalized horoscopes based on YOUR birth chart
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-green-400' />
                <span className='text-sm text-zinc-300'>
                  Tarot readings personalized to your chart
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-green-400' />
                <span className='text-sm text-zinc-300'>
                  Insights based on current transits affecting your chart
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='h-4 w-4 text-green-400' />
                <span className='text-sm text-zinc-300'>
                  Complete grimoire with spells and rituals
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Conclusion
          </h2>
          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
              Personalized astrology provides more accurate, relevant, and
              meaningful insights than generic zodiac horoscopes. By using your
              exact birth chart with real astronomical calculations,
              personalized astrology accounts for your unique astrological
              profile and provides guidance tailored specifically to you.
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              If you're looking for astrology insights that are truly
              personalized to your birth chart, consider using an app like
              Lunary that uses real astronomical data and provides chart-based
              personalization.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className='text-center mb-12'>
          <Link
            href='/pricing'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-medium text-lg transition-colors'
          >
            Try Personalized Astrology Free
            <ArrowRight className='h-5 w-5' />
          </Link>
        </section>

        {/* Legal Disclaimer */}
        <section className='mt-12 pt-8 border-t border-zinc-800'>
          <p className='text-xs text-zinc-500 leading-relaxed'>
            <strong>Disclaimer:</strong> This educational content is for
            informational purposes only. Astrology is not a science and should
            not be used as a substitute for professional advice. This content
            explains the differences between personalized and generic astrology
            approaches to help users make informed decisions.
          </p>
        </section>
      </div>
    </div>
  );
}
