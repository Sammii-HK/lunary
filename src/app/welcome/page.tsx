'use client';

import Link from 'next/link';
import { AuthButtons } from '@/components/AuthButtons';
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
  Brain,
  Wand2,
  ArrowRight,
} from 'lucide-react';

export default function WelcomePage() {
  // Outcome-based features
  const outcomeFeatures = [
    {
      icon: Brain,
      title: "Understand today's energy based on your birth chart",
      description:
        'Get personalized daily insights that consider your exact planetary positions, not generic sun sign predictions.',
    },
    {
      icon: Sparkles,
      title: 'See tarot patterns that reflect your emotional cycles',
      description:
        'Your AI guide recognizes patterns in your tarot readings and connects them to your astrological transits.',
    },
    {
      icon: NotebookPen,
      title: 'Let your AI guide interpret cosmic events for you',
      description:
        'Ask questions and receive thoughtful answers grounded in your birth chart, tarot history, and current moon phase.',
    },
    {
      icon: Moon,
      title: 'Track your moods, rituals, and reflections in your Book of Shadows',
      description:
        'Build a living record of your cosmic journey with AI-powered insights and personalized ritual suggestions.',
    },
  ];

  // Why Lunary differentiators
  const differentiators = [
    {
      icon: Brain,
      title: 'Personal AI astral guide',
      description:
        'Your guide knows your chart, your emotions, your tarot, and your patterns—not generic horoscopes.',
    },
    {
      icon: Sparkles,
      title: 'Deeply personalized readings',
      description:
        'Every insight is calculated from your exact birth time, date, and location. No generalizations.',
    },
    {
      icon: Wand2,
      title: 'Tarot + astrology + emotions combined',
      description:
        'See how your tarot patterns align with astrological transits and emotional cycles.',
    },
    {
      icon: NotebookPen,
      title: 'Living Book of Shadows',
      description:
        'Your personal grimoire that grows with you, powered by AI insights and ritual generation.',
    },
    {
      icon: Sparkle,
      title: 'Cosmic visuals and custom OG images',
      description:
        'Share beautiful, personalized cosmic visuals that reflect your unique astrological signature.',
    },
    {
      icon: Calendar,
      title: 'Daily + weekly + monthly personalized cycles',
      description:
        'Understand your patterns across all time scales—from daily transits to annual solar returns.',
    },
    {
      icon: Heart,
      title: 'Built by a real practitioner, not a corporation',
      description:
        'Created with deep respect for astrological tradition and modern astronomical precision.',
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
                href='/'
                className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
              >
                Daily Insights
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* AI Hero Section - Front and Center */}
      <section className='relative overflow-hidden border-b border-zinc-800/50'>
        <div className='absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent'></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32'>
          <div className='text-center max-w-4xl mx-auto space-y-6 sm:space-y-8 md:space-y-10'>
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm sm:text-base mb-4'>
              <Brain className='w-4 h-4 sm:w-5 sm:h-5' />
              <span>AI-Powered Cosmic Guidance</span>
            </div>

            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-zinc-100 leading-[1.1] tracking-tight px-2'>
              Your personal{' '}
              <span className='font-normal text-purple-300/90'>AI-powered</span>{' '}
              cosmic guide
            </h1>

            <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light px-4'>
              Personalised daily insights, tarot interpretation, emotional
              patterns, and birth chart analysis — all based on{' '}
              <span className='text-purple-300/80'>you</span>.
            </p>

            <div className='pt-4 sm:pt-6'>
              <Link
                href='/profile'
                className='inline-flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/15 text-purple-300/90 border border-purple-500/20 hover:border-purple-500/30 px-8 py-4 text-lg rounded-full font-medium transition-all group'
              >
                Meet Your Astral Guide
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </Link>
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
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className='py-8 sm:py-12 border-b border-zinc-800/50 bg-zinc-900/20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center space-y-4'>
            <p className='text-sm sm:text-base text-zinc-400'>
              Trusted by thousands of cosmic seekers
            </p>
            <p className='text-xs sm:text-sm text-zinc-500'>
              Backed by advanced astrology + AI models
            </p>
          </div>
        </div>
      </section>

      {/* Why Lunary is Different */}
      <section className='py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 border-b border-zinc-800/50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4'>
            <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 px-2'>
              Why Lunary is Different
            </h2>
            <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 leading-relaxed px-4'>
              Unlike generic horoscope apps, Lunary combines AI, astrology, tarot,
              and your personal patterns into one deeply personalized experience.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8'>
            {differentiators.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className='p-5 sm:p-6 md:p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors'
                >
                  <div className='w-10 h-10 sm:w-12 sm:h-12 mb-4 sm:mb-6 flex items-center justify-center'>
                    <Icon
                      className='w-6 h-6 sm:w-7 sm:h-7 text-purple-400'
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className='text-base sm:text-lg md:text-xl font-medium text-zinc-100 mb-2 sm:mb-3'>
                    {item.title}
                  </h3>
                  <p className='text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed'>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Outcome-Based Features */}
      <section className='py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 border-b border-zinc-800/50 bg-zinc-900/20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4'>
            <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 px-2'>
              What you'll experience
            </h2>
            <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 leading-relaxed px-4'>
              Real outcomes, not generic features. Every insight is tailored to
              your unique cosmic signature.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8'>
            {outcomeFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className='p-5 sm:p-6 md:p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors'
                >
                  <div className='w-10 h-10 sm:w-12 sm:h-12 mb-4 sm:mb-6 flex items-center justify-center'>
                    <Icon
                      className='w-6 h-6 sm:w-7 sm:h-7 text-purple-400'
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

      {/* What You'll Get After Signup Preview */}
      <section className='py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 border-b border-zinc-800/50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4'>
            <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 px-2'>
              What you'll unlock
            </h2>
            <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 leading-relaxed px-4'>
              See what awaits you after signup. Every feature is personalized to
              your birth chart and cosmic patterns.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
            {/* Preview Card 1: Personalized Horoscope */}
            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden'>
              <div className='aspect-video bg-gradient-to-br from-purple-900/30 to-zinc-900/50 flex items-center justify-center'>
                <div className='text-center p-6'>
                  <BarChart3 className='w-12 h-12 text-purple-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Personalized Horoscope
                  </h3>
                  <p className='text-sm text-zinc-400'>
                    Daily insights based on your exact birth chart
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Card 2: AI Chat */}
            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden'>
              <div className='aspect-video bg-gradient-to-br from-purple-900/30 to-zinc-900/50 flex items-center justify-center'>
                <div className='text-center p-6'>
                  <Brain className='w-12 h-12 text-purple-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    AI Astral Guide
                  </h3>
                  <p className='text-sm text-zinc-400'>
                    Ask questions and get answers grounded in your chart
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Card 3: Tarot Patterns */}
            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden'>
              <div className='aspect-video bg-gradient-to-br from-purple-900/30 to-zinc-900/50 flex items-center justify-center'>
                <div className='text-center p-6'>
                  <Sparkles className='w-12 h-12 text-purple-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Tarot Pattern Recognition
                  </h3>
                  <p className='text-sm text-zinc-400'>
                    See patterns that reflect your emotional cycles
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Card 4: Book of Shadows */}
            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden'>
              <div className='aspect-video bg-gradient-to-br from-purple-900/30 to-zinc-900/50 flex items-center justify-center'>
                <div className='text-center p-6'>
                  <NotebookPen className='w-12 h-12 text-purple-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Book of Shadows
                  </h3>
                  <p className='text-sm text-zinc-400'>
                    Track moods, rituals, and reflections
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Card 5: Lunar Rituals */}
            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden'>
              <div className='aspect-video bg-gradient-to-br from-purple-900/30 to-zinc-900/50 flex items-center justify-center'>
                <div className='text-center p-6'>
                  <Moon className='w-12 h-12 text-purple-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Lunar Rituals
                  </h3>
                  <p className='text-sm text-zinc-400'>
                    Personalized ritual suggestions for each moon phase
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Card 6: Birth Chart Analysis */}
            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden'>
              <div className='aspect-video bg-gradient-to-br from-purple-900/30 to-zinc-900/50 flex items-center justify-center'>
                <div className='text-center p-6'>
                  <Telescope className='w-12 h-12 text-purple-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Complete Birth Chart
                  </h3>
                  <p className='text-sm text-zinc-400'>
                    Detailed analysis of your cosmic fingerprint
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tease */}
      <section className='py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 border-b border-zinc-800/50 bg-zinc-900/20'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8'>
          <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 px-2'>
            Start exploring for free
          </h2>
          <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed px-4'>
            Upgrade only if you want deeper, personalised insights. No pressure,
            no commitment—just cosmic guidance when you need it.
          </p>
          <div className='pt-4'>
            <Link
              href='/pricing'
              className='inline-flex items-center gap-2 text-purple-300/90 hover:text-purple-200 transition-colors text-sm sm:text-base'
            >
              View pricing
              <ArrowRight className='w-4 h-4' />
            </Link>
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
                Meet your AI guide
              </h3>
              <p className='text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed px-2'>
                Start asking questions and receive personalized insights based on
                your chart, tarot patterns, and cosmic cycles.
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
            Ready to meet your AI astral guide?
          </h2>
          <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed px-4'>
            Start your free trial and experience astrology that's actually about
            you. Credit card required but no payment taken during trial. Cancel
            anytime.
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
