'use client';

import Link from 'next/link';
import { AuthButtons } from '@/components/AuthButtons';
import { NewsletterSignupForm } from '@/components/NewsletterSignupForm';
import { SOCIAL_HANDLES } from '@/constants/socialHandles';
import {
  Sparkles,
  BarChart3,
  Calendar,
  NotebookPen,
  Moon,
  Telescope,
  Heart,
  Sparkle,
  Smartphone,
  Bell,
  WifiOff,
  FileText,
  CircleDot,
  Store,
  FolderOpen,
  Globe,
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
      icon: NotebookPen,
      title: 'Book of Shadows Companion',
      description:
        'Have reflective conversations with Lunary’s calm AI—every reply grounded in your birth chart, tarot, and today’s moon.',
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
        "Real-time moon phases, lunar calendars, and guidance based on the moon's current position in your chart.",
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
    {
      icon: FileText,
      title: 'Cosmic Report Generator',
      description:
        'Generate personalized PDF reports with transits, moon phases, tarot insights, and rituals. Shareable reports for launches, birthdays, and special moments.',
    },
    {
      icon: CircleDot,
      title: 'Moon Circles',
      description:
        'Join New and Full Moon rituals with guided scripts, altar setups, and community prompts. Track your lunar journey over time.',
    },
    {
      icon: Store,
      title: 'Shop & Moon Packs',
      description:
        'Digital moon phase packs, calendars, crystal guides, and astrological resources. Downloadable content for your cosmic practice.',
    },
    {
      icon: FolderOpen,
      title: 'Collections',
      description:
        'Save and organize your favorite tarot readings, horoscopes, and cosmic insights in personalized collections.',
    },
    {
      icon: Globe,
      title: 'Cosmic State',
      description:
        'View and share your complete astrological snapshot—birth chart placements, current transits, and moon position—all in one place.',
    },
  ];

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {/* Navigation */}
      <nav className='z-10 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm sticky top-0'>
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
                href='/blog'
                className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
              >
                Blog
              </Link>
              <Link
                href='/pricing'
                className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
              >
                Pricing
              </Link>
              <Link
                href='/welcome'
                className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
              >
                Features
              </Link>
              <Link
                href='/'
                className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
              >
                Daily Insights
              </Link>
              <Link
                href='/help'
                className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='relative overflow-hidden border-b border-zinc-800/50'>
        <div className='absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-transparent to-transparent'></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32'>
          <div className='text-center max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8'>
            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-zinc-100 leading-[1.1] tracking-tight px-2'>
              Astrology you can{' '}
              <span className='font-normal text-purple-300/80'>talk</span> to
            </h1>

            <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light px-4'>
              Ask your Book of Shadows for guidance and receive calm, grounded
              answers powered by real astronomical data, your birth chart, and
              the day’s cosmic weather.
            </p>

            <div className='pt-2 sm:pt-4'>
              <AuthButtons variant='primary' />
            </div>

            <div className='pt-6 sm:pt-8 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-zinc-500'>
              <div className='flex items-center gap-2'>
                <div className='w-1 h-1 rounded-full bg-zinc-600'></div>
                <span>Credit card required but no payment taken</span>
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

            <div className='pt-8'>
              <NewsletterSignupForm
                align='center'
                source='welcome_page_hero'
                className='border-zinc-800/60 bg-zinc-950/60 shadow-none'
                headline='Prefer to start with cosmic updates?'
                description='Subscribe to our weekly newsletter to get lunar weather, curated rituals, and announcements before anyone else.'
                ctaLabel='Send me the newsletter'
                successMessage='You are all set! Check your inbox to confirm and start receiving our weekly cosmic digest.'
              />
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className='py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 border-b border-zinc-800/50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4'>
            <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 px-2'>
              What makes us different
            </h2>
            <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 leading-relaxed px-4'>
              While others offer generic horoscopes, we provide insights
              calculated from your complete birth chart. Every planet, every
              aspect, every transit matters.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8'>
            {features.slice(0, 4).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className='p-5 sm:p-6 md:p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors'
                >
                  <div className='w-10 h-10 sm:w-12 sm:h-12 mb-4 sm:mb-6 flex items-center justify-center'>
                    <Icon
                      className='w-6 h-6 sm:w-7 sm:h-7 text-zinc-400'
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className='text-base sm:text-lg md:text-xl font-medium text-zinc-100 mb-2 sm:mb-3'>
                    {feature.title}
                  </h3>
                  <p className='text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed'>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className='py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 border-b border-zinc-800/50 bg-zinc-900/20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4'>
            <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 px-2'>
              Everything you need for meaningful cosmic guidance
            </h2>
            <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 leading-relaxed px-4'>
              Built on real astronomical data. Calculated with precision.
              Presented with clarity and respect.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8'>
            {features.slice(4).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className='p-5 sm:p-6 md:p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors'
                >
                  <div className='w-10 h-10 sm:w-12 sm:h-12 mb-4 sm:mb-6 flex items-center justify-center'>
                    <Icon
                      className='w-6 h-6 sm:w-7 sm:h-7 text-zinc-400'
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className='text-base sm:text-lg md:text-xl font-medium text-zinc-100 mb-2 sm:mb-3'>
                    {feature.title}
                  </h3>
                  <p className='text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed'>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 border-b border-zinc-800/50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4'>
            <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 px-2'>
              How it works
            </h2>
            <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 leading-relaxed px-4'>
              Simple, straightforward, built on real data.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto'>
            <div className='text-center space-y-3 sm:space-y-4'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full border border-zinc-700 bg-zinc-900/50 flex items-center justify-center'>
                <span className='text-xl sm:text-2xl md:text-3xl font-light text-zinc-400'>
                  1
                </span>
              </div>
              <h3 className='text-base sm:text-lg md:text-xl font-medium text-zinc-100'>
                Enter your birth details
              </h3>
              <p className='text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed px-2'>
                Your exact birth time, date, and location. This creates your
                unique cosmic fingerprint.
              </p>
            </div>

            <div className='text-center space-y-3 sm:space-y-4'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full border border-zinc-700 bg-zinc-900/50 flex items-center justify-center'>
                <span className='text-xl sm:text-2xl md:text-3xl font-light text-zinc-400'>
                  2
                </span>
              </div>
              <h3 className='text-base sm:text-lg md:text-xl font-medium text-zinc-100'>
                We calculate your chart
              </h3>
              <p className='text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed px-2'>
                Using professional-grade astronomical algorithms, we map every
                planet, aspect, and house in your natal chart.
              </p>
            </div>

            <div className='text-center space-y-3 sm:space-y-4'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full border border-zinc-700 bg-zinc-900/50 flex items-center justify-center'>
                <span className='text-xl sm:text-2xl md:text-3xl font-light text-zinc-400'>
                  3
                </span>
              </div>
              <h3 className='text-base sm:text-lg md:text-xl font-medium text-zinc-100'>
                Receive personalized insights
              </h3>
              <p className='text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed px-2'>
                Daily guidance that considers your unique chart, current
                transits, and cosmic cycles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PWA Features */}
      <section className='py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 border-b border-zinc-800/50 bg-zinc-900/20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4'>
            <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 px-2'>
              Take Lunary with you
            </h2>
            <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 leading-relaxed px-4'>
              Install Lunary as a Progressive Web App for instant access,
              offline support, and push notifications.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto'>
            <div className='p-6 sm:p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors text-center'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center'>
                <Smartphone
                  className='w-8 h-8 sm:w-10 sm:h-10 text-purple-400'
                  strokeWidth={1.5}
                />
              </div>
              <h3 className='text-lg sm:text-xl md:text-2xl font-medium text-zinc-100 mb-2 sm:mb-3'>
                Progressive Web App
              </h3>
              <p className='text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed'>
                Install Lunary on your phone or tablet for instant access. Works
                like a native app with home screen icons and full-screen
                experience.
              </p>
            </div>

            <div className='p-6 sm:p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors text-center'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center'>
                <Bell
                  className='w-8 h-8 sm:w-10 sm:h-10 text-blue-400'
                  strokeWidth={1.5}
                />
              </div>
              <h3 className='text-lg sm:text-xl md:text-2xl font-medium text-zinc-100 mb-2 sm:mb-3'>
                Push Notifications
              </h3>
              <p className='text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed'>
                Get notified about significant cosmic events, daily insights,
                and important transits. Stay connected to your cosmic rhythm
                even when you're away.
              </p>
            </div>

            <div className='p-6 sm:p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors text-center'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center'>
                <WifiOff
                  className='w-8 h-8 sm:w-10 sm:h-10 text-green-400'
                  strokeWidth={1.5}
                />
              </div>
              <h3 className='text-lg sm:text-xl md:text-2xl font-medium text-zinc-100 mb-2 sm:mb-3'>
                Offline Support
              </h3>
              <p className='text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed'>
                Access your birth chart and saved insights even without an
                internet connection. Your cosmic data is always with you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className='py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 border-b border-zinc-800/50'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center space-y-6 sm:space-y-8'>
            <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 px-2'>
              Our approach
            </h2>

            <div className='space-y-6 sm:space-y-8 text-left max-w-3xl mx-auto'>
              <div className='space-y-2 sm:space-y-3'>
                <h3 className='text-lg sm:text-xl md:text-2xl font-medium text-zinc-200'>
                  We don't tell you what to do
                </h3>
                <p className='text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed'>
                  Astrology isn't about prescriptive advice or simplistic
                  predictions. We honor your intelligence and free will by
                  providing meaningful insights for reflection, not directives.
                </p>
              </div>

              <div className='space-y-2 sm:space-y-3'>
                <h3 className='text-lg sm:text-xl md:text-2xl font-medium text-zinc-200'>
                  Real data, not generalizations
                </h3>
                <p className='text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed'>
                  Every calculation uses your exact birth chart. We don't rely
                  on sun sign predictions or generic horoscopes. If you were
                  born at 2:47 PM instead of 2:48 PM, your chart is different.
                  We respect that.
                </p>
              </div>

              <div className='space-y-2 sm:space-y-3'>
                <h3 className='text-lg sm:text-xl md:text-2xl font-medium text-zinc-200'>
                  Ancient wisdom, modern precision
                </h3>
                <p className='text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed'>
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
      <section className='py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8'>
          <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 px-2'>
            Start your free trial
          </h2>
          <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed px-4'>
            Experience astrology that's actually about you. Credit card required
            but no payment taken during trial. Cancel anytime.
          </p>

          <div className='pt-2 sm:pt-4'>
            <AuthButtons variant='primary' />
          </div>

          <div className='pt-6 sm:pt-8'>
            <Link
              href='/book-of-shadows'
              className='text-xs sm:text-sm md:text-base text-zinc-500 hover:text-zinc-400 transition-colors inline-block'
            >
              Open the Book of Shadows →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-zinc-800/50 py-8 sm:py-10 md:py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col items-center gap-4'>
            <div className='flex items-center gap-4'>
              <a
                href={`https://instagram.com/${SOCIAL_HANDLES.instagram}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-zinc-400 hover:text-purple-400 transition-colors'
                aria-label='Instagram'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                </svg>
              </a>
              <a
                href={`https://twitter.com/${SOCIAL_HANDLES.twitter}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-zinc-400 hover:text-purple-400 transition-colors'
                aria-label='Twitter/X'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                </svg>
              </a>
              <a
                href={`https://www.threads.net/@${SOCIAL_HANDLES.threads}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-zinc-400 hover:text-purple-400 transition-colors'
                aria-label='Threads'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12.186 8.302c1.831 0 3.193.771 3.193 1.936 0 .844-.793 1.51-1.888 1.725l-.01.002c.01.06.016.122.016.185 0 1.165-1.362 1.936-3.193 1.936-1.831 0-3.193-.771-3.193-1.936 0-.063.006-.125.016-.185l-.01-.002c-1.095-.215-1.888-.881-1.888-1.725 0-1.165 1.362-1.936 3.193-1.936zm0-1.302C9.343 7 7.5 8.343 7.5 10.238c0 .844.793 1.51 1.888 1.725l.01.002c-.01.06-.016.122-.016.185 0 1.895 1.843 3.238 4.186 3.238 2.343 0 4.186-1.343 4.186-3.238 0-.063-.006-.125-.016-.185l.01-.002c1.095-.215 1.888-.881 1.888-1.725C16.686 8.343 14.843 7 12.186 7zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z' />
                </svg>
              </a>
              <a
                href={`https://bsky.app/profile/${SOCIAL_HANDLES.bluesky}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-zinc-400 hover:text-purple-400 transition-colors'
                aria-label='Bluesky'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z' />
                  <circle
                    cx='12'
                    cy='12'
                    r='8'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.5'
                  />
                  <path
                    d='M8 12h8M12 8v8'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                  />
                </svg>
              </a>
              <a
                href={`https://pinterest.com/${SOCIAL_HANDLES.pinterest}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-zinc-400 hover:text-purple-400 transition-colors'
                aria-label='Pinterest'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c5.084 0 9.426-3.05 11.174-7.396-.15-.832-.085-1.85.342-2.52 1.05-2.58 2.31-5.08 2.31-7.58 0-2.5-1.5-4.5-4-4.5-1.5 0-2.5.5-3.5 1.5-1.5 1.5-2 3.5-2.5 5.5-.5-1.5-1-3-2-4-1-1-2-1.5-3.5-1.5-2.5 0-4 2-4 4.5 0 2.5 1.26 5.08 2.31 7.58.427.67.492 1.688.342 2.52C2.574 18.95 6.916 22 12 22c6.627 0 12-5.373 12-12S18.627 0 12 0z' />
                </svg>
              </a>
            </div>
            <p className='text-sm text-zinc-500'>
              © {new Date().getFullYear()} Lunary. All rights reserved.
            </p>
            <div className='flex gap-4 sm:gap-6 md:gap-8 mt-2'>
              <Link
                href='/blog'
                className='text-xs sm:text-sm text-zinc-500 hover:text-zinc-400 transition-colors'
              >
                Blog
              </Link>
              <Link
                href='/pricing'
                className='text-xs sm:text-sm text-zinc-500 hover:text-zinc-400 transition-colors'
              >
                Pricing
              </Link>
              <Link
                href='/'
                className='text-xs sm:text-sm text-zinc-500 hover:text-zinc-400 transition-colors'
              >
                Daily Insights
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
