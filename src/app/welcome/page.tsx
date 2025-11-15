'use client';

import Link from 'next/link';
import { AuthButtons } from '@/components/AuthButtons';
import { NewsletterSignupForm } from '@/components/NewsletterSignupForm';
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
          <div className='flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm md:text-base text-zinc-500'>
            <div>© {new Date().getFullYear()} Lunary</div>
            <div className='flex gap-4 sm:gap-6 md:gap-8'>
              <Link
                href='/blog'
                className='hover:text-zinc-400 transition-colors'
              >
                Blog
              </Link>
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
