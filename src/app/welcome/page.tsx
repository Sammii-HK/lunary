'use client';

import Link from 'next/link';
import { AuthButtons } from '@/components/AuthButtons';
import {
  Sparkles,
  BarChart3,
  Calendar,
  BookOpen,
  Moon,
  Telescope,
  Heart,
  Sparkle,
} from 'lucide-react';

export default function WelcomePage() {
  const features = [
    {
      icon: BarChart3,
      title: 'Complete Birth Chart Analysis',
      description:
        'Your exact planetary positions calculated from your precise birth time, date, and location. Every aspect, every degree matters.',
    },
    {
      icon: Sparkles,
      title: 'Personalized Daily Insights',
      description:
        'Daily guidance based on current planetary transits to your personal chart. No generic predictions—every insight is yours alone.',
    },
    {
      icon: BookOpen,
      title: 'Intelligent Tarot Patterns',
      description:
        'Discover recurring themes in your readings and understand how cosmic cycles influence your spiritual journey.',
    },
    {
      icon: Calendar,
      title: 'Transit Calendar',
      description:
        'Track significant planetary movements and understand how they interact with your natal chart over time.',
    },
    {
      icon: Moon,
      title: 'Lunar Wisdom',
      description:
        'Real-time moon phases, lunar calendars, and guidance based on the moon’s current position in your chart.',
    },
    {
      icon: Telescope,
      title: 'Astronomical Precision',
      description:
        'Built on accurate astronomical calculations using proven algorithms for planetary positions and celestial events.',
    },
    {
      icon: Heart,
      title: 'Crystal & Healing Guidance',
      description:
        'Personalized crystal recommendations aligned with your birth chart and current transits.',
    },
    {
      icon: Sparkle,
      title: 'Solar Returns & Cosmic Cycles',
      description:
        'Understand your annual solar return and discover patterns in your personal cosmic timeline.',
    },
  ];

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {/* Navigation */}
      <nav className='relative z-10 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <Link
              href='/'
              className='text-xl font-medium text-zinc-100 tracking-tight'
            >
              Lunary
            </Link>
            <div className='hidden sm:flex items-center gap-6'>
              <Link
                href='/pricing'
                className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
              >
                Pricing
              </Link>
              <Link
                href='/'
                className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
              >
                Daily Insights
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='relative overflow-hidden border-b border-zinc-800/50'>
        <div className='absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-transparent to-transparent'></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32'>
          <div className='text-center max-w-4xl mx-auto space-y-8'>
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-light text-zinc-100 leading-tight tracking-tight'>
              Astrology based on{' '}
              <span className='font-normal text-purple-300/80'>real data</span>,
              <br />
              not generic predictions
            </h1>

            <p className='text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light'>
              Your complete birth chart, calculated with astronomical precision.
              Daily insights that consider your unique cosmic signature. Real
              guidance, thoughtfully presented.
            </p>

            <div className='pt-4'>
              <AuthButtons variant='primary' />
            </div>

            <div className='pt-8 flex flex-wrap justify-center gap-6 text-sm text-zinc-500'>
              <div className='flex items-center gap-2'>
                <div className='w-1 h-1 rounded-full bg-zinc-600'></div>
                <span>No credit card required</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-1 h-1 rounded-full bg-zinc-600'></div>
                <span>7-day free trial</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-1 h-1 rounded-full bg-zinc-600'></div>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className='py-20 sm:py-24 lg:py-28 border-b border-zinc-800/50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center max-w-3xl mx-auto mb-16 space-y-4'>
            <h2 className='text-3xl sm:text-4xl font-light text-zinc-100'>
              What makes us different
            </h2>
            <p className='text-lg text-zinc-400 leading-relaxed'>
              While others offer generic horoscopes, we provide insights
              calculated from your complete birth chart. Every planet, every
              aspect, every transit matters.
            </p>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
            {features.slice(0, 4).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className='p-6 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors'
                >
                  <div className='w-10 h-10 mb-4 flex items-center justify-center'>
                    <Icon className='w-6 h-6 text-zinc-400' strokeWidth={1.5} />
                  </div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-sm text-zinc-400 leading-relaxed'>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className='py-20 sm:py-24 lg:py-28 border-b border-zinc-800/50 bg-zinc-900/20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center max-w-3xl mx-auto mb-16 space-y-4'>
            <h2 className='text-3xl sm:text-4xl font-light text-zinc-100'>
              Everything you need for meaningful cosmic guidance
            </h2>
            <p className='text-lg text-zinc-400 leading-relaxed'>
              Built on real astronomical data. Calculated with precision.
              Presented with clarity and respect.
            </p>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
            {features.slice(4).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className='p-6 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors'
                >
                  <div className='w-10 h-10 mb-4 flex items-center justify-center'>
                    <Icon className='w-6 h-6 text-zinc-400' strokeWidth={1.5} />
                  </div>
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-sm text-zinc-400 leading-relaxed'>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='py-20 sm:py-24 lg:py-28 border-b border-zinc-800/50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center max-w-3xl mx-auto mb-16 space-y-4'>
            <h2 className='text-3xl sm:text-4xl font-light text-zinc-100'>
              How it works
            </h2>
            <p className='text-lg text-zinc-400 leading-relaxed'>
              Simple, straightforward, built on real data.
            </p>
          </div>

          <div className='grid sm:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto'>
            <div className='text-center space-y-4'>
              <div className='w-12 h-12 mx-auto rounded-full border border-zinc-700 bg-zinc-900/50 flex items-center justify-center'>
                <span className='text-xl font-light text-zinc-400'>1</span>
              </div>
              <h3 className='text-lg font-medium text-zinc-100'>
                Enter your birth details
              </h3>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Your exact birth time, date, and location. This creates your
                unique cosmic fingerprint.
              </p>
            </div>

            <div className='text-center space-y-4'>
              <div className='w-12 h-12 mx-auto rounded-full border border-zinc-700 bg-zinc-900/50 flex items-center justify-center'>
                <span className='text-xl font-light text-zinc-400'>2</span>
              </div>
              <h3 className='text-lg font-medium text-zinc-100'>
                We calculate your chart
              </h3>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Using professional-grade astronomical algorithms, we map every
                planet, aspect, and house in your natal chart.
              </p>
            </div>

            <div className='text-center space-y-4'>
              <div className='w-12 h-12 mx-auto rounded-full border border-zinc-700 bg-zinc-900/50 flex items-center justify-center'>
                <span className='text-xl font-light text-zinc-400'>3</span>
              </div>
              <h3 className='text-lg font-medium text-zinc-100'>
                Receive personalized insights
              </h3>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Daily guidance that considers your unique chart, current
                transits, and cosmic cycles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className='py-20 sm:py-24 lg:py-28 border-b border-zinc-800/50 bg-zinc-900/20'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center space-y-8'>
            <h2 className='text-3xl sm:text-4xl font-light text-zinc-100'>
              Our approach
            </h2>

            <div className='space-y-6 text-left max-w-2xl mx-auto'>
              <div className='space-y-3'>
                <h3 className='text-lg font-medium text-zinc-200'>
                  We don't tell you what to do
                </h3>
                <p className='text-zinc-400 leading-relaxed'>
                  Astrology isn't about prescriptive advice or simplistic
                  predictions. We honor your intelligence and free will by
                  providing meaningful insights for reflection, not directives.
                </p>
              </div>

              <div className='space-y-3'>
                <h3 className='text-lg font-medium text-zinc-200'>
                  Real data, not generalizations
                </h3>
                <p className='text-zinc-400 leading-relaxed'>
                  Every calculation uses your exact birth chart. We don't rely
                  on sun sign predictions or generic horoscopes. If you were
                  born at 2:47 PM instead of 2:48 PM, your chart is different.
                  We respect that.
                </p>
              </div>

              <div className='space-y-3'>
                <h3 className='text-lg font-medium text-zinc-200'>
                  Ancient wisdom, modern precision
                </h3>
                <p className='text-zinc-400 leading-relaxed'>
                  We combine centuries of astrological knowledge with accurate
                  astronomical calculations. The depth of traditional astrology
                  meets the precision of modern astronomy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className='py-20 sm:py-24 lg:py-28'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8'>
          <h2 className='text-3xl sm:text-4xl font-light text-zinc-100'>
            Start your free trial
          </h2>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed'>
            Experience astrology that's actually about you. No credit card
            required. Cancel anytime.
          </p>

          <div className='pt-4'>
            <AuthButtons variant='primary' />
          </div>

          <div className='pt-8'>
            <Link
              href='/'
              className='text-sm text-zinc-500 hover:text-zinc-400 transition-colors inline-block'
            >
              Explore daily insights →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-zinc-800/50 py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-500'>
            <div>© {new Date().getFullYear()} Lunary</div>
            <div className='flex gap-6'>
              <Link
                href='/pricing'
                className='hover:text-zinc-400 transition-colors'
              >
                Pricing
              </Link>
              <Link href='/' className='hover:text-zinc-400 transition-colors'>
                Daily Insights
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
