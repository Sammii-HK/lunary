'use client';

import Link from 'next/link';
import {
  Telescope,
  Sparkles,
  NotebookPen,
  Calendar,
  Map,
  MessagesSquare,
  X,
  Check,
  Users,
  Heart,
  Moon,
} from 'lucide-react';
import { MarketingFooter } from '@/components/MarketingFooter';
import { Button } from '@/components/ui/button';
import { NewsletterSignupForm } from '@/components/NewsletterSignupForm';
import { renderJsonLd } from '@/lib/schema';
import { CTA_COPY } from '@/lib/cta-copy';
import { FAQAccordion } from '@/components/FAQ';
import { getHomepageFAQs } from '@/lib/faq-helpers';
import { useState } from 'react';
import { HomepageFeaturesTest } from '@/components/marketing/HomepageFeaturesTest';
import { OptimizedDemoIframe } from '@/components/marketing/OptimizedDemoIframe';
import {
  useABTestTracking,
  useABTestConversion,
} from '@/hooks/useABTestTracking';
import { Heading } from '../ui/Heading';

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Lunary',
  url: 'https://lunary.app',
  description:
    'A calm astrology companion grounded in real astronomy. Create your birth chart, explore today’s horoscopes, moon phase, tarot and transits, and learn through the Grimoire. Upgrade for personalised insights connected to your chart.',
  publisher: {
    '@type': 'Organization',
    name: 'Lunary',
    url: 'https://lunary.app',
  },
};

export default function WelcomePage() {
  const [openFAQId, setOpenFAQId] = useState<string | null>(null);
  const homepageFAQs = getHomepageFAQs();

  // Track page view with A/B test data (homepage-features-test, cta-copy-test)
  useABTestTracking('welcome', 'page_viewed', [
    'homepage-features-test',
    'cta-copy-test',
  ]);

  // Get conversion tracker with A/B test metadata
  const { trackConversion } = useABTestConversion();

  // CTA click handler with A/B tracking
  const handleCtaClick = (location: string, label: string, href: string) => {
    trackConversion('cta_clicked', {
      featureName: `homepage_${location}`,
      pagePath: '/welcome',
      metadata: {
        cta_location: location,
        cta_label: label,
        cta_href: href,
      },
    });
  };

  return (
    <>
      {renderJsonLd(structuredData)}
      <div className='min-h-screen bg-zinc-950 text-zinc-50 flex flex-col'>
        {/* Referral Banner */}
        <div className='bg-gradient-to-r from-lunary-primary-900/40 to-lunary-primary-800/40 border-b border-lunary-primary-700/30 py-2 px-4'>
          <div className='flex items-center justify-center gap-2'>
            <Users className='w-4 h-4 text-lunary-primary-200' />
            <p className='text-xs md:text-sm text-lunary-primary-100'>
              Give a friend{' '}
              <span className='font-semibold text-lunary-primary-200'>
                30 days of Pro free
              </span>{' '}
              — earn a bonus week for every referral
            </p>
          </div>
        </div>

        {/* Section 1: Hero */}
        <section className='relative px-4 md:px-6 pt-4 md:pt-16 pb-10 md:pb-16 bg-zinc-950'>
          <div className='max-w-3xl mx-auto text-center space-y-6'>
            <p className='text-xs uppercase tracking-[0.2em] text-zinc-400'>
              Personal astrology grounded in real astronomy
            </p>
            <Heading
              as='h1'
              variant='h1'
              className='max-w-md md:max-w-2xl mx-auto'
            >
              The astrology app that teaches you to read your own chart
            </Heading>
            <p className='text-xs md:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto'>
              Track how planets affect YOU specifically.
            </p>
            <p className='text-xs md:text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto mt-[0.25rem]'>
              After 2-3 months, you'll recognize patterns and interpret transits
              without depending on generic predictions.
            </p>
            <div className='flex flex-col gap-3 justify-center items-center pt-2 pb-0 md:pb-6'>
              <Button variant='lunary-soft' size='lg' asChild>
                <Link
                  href='/auth?signup=true'
                  onClick={() =>
                    handleCtaClick(
                      'hero',
                      CTA_COPY.auth.createChart,
                      '/auth?signup=true',
                    )
                  }
                >
                  {CTA_COPY.auth.createChart}
                </Link>
              </Button>
              <p className='text-xs text-zinc-500'>
                Already have an account?{' '}
                <Link
                  href='/auth'
                  className='text-lunary-primary-400 hover:text-lunary-primary-200 transition-colors'
                >
                  Sign in
                </Link>
              </p>
              <p className='text-xs text-zinc-500 mt-2'>
                Start free • Give a friend 30 days of Pro, earn a bonus week
              </p>
            </div>
          </div>

          {/* Hero Mini App */}
          <div className='mt-8 mx-3 md:mx-0 md:mt-[33px] flex justify-center'>
            <OptimizedDemoIframe
              loading='eager' // Above-the-fold
              preload={true} // Max performance
            />
          </div>
        </section>

        <section className='py-2 px-4 md:py-8 leading-relaxed max-w-3xl mx-auto text-center'>
          <p className='text-sm text-zinc-400 mb-6'>
            See Lunary in action with today's actual planetary positions.
            <br />
            This demo uses real cosmic data. Everything updates daily based on
            current transits and moon phases.
          </p>
          <p className='text-zinc-400 leading-relaxed max-w-3xl mx-auto'>
            Lunary is designed for reflection rather than prediction. Instead of
            offering fixed meanings or one-size-fits-all readings, it helps you
            understand patterns, timing, and cycles as they unfold.
          </p>
          <Link
            href='/features'
            className='text-sm text-lunary-primary-400 hover:text-lunary-primary-200 transition-colors inline-block mt-4'
          >
            See all features
          </Link>
        </section>

        {/* Section 2: Differentiation */}
        <section className='py-12 md:py-16 px-4 md:px-6 border-t border-zinc-800/30'>
          <div className='max-w-4xl mx-auto text-center space-y-6'>
            <Heading
              as='h2'
              variant='h1'
              className='max-w-md md:max-w-2xl mx-auto text-zinc-100'
            >
              Most apps entertain you.
              <br />
              <span className='text-lunary-primary-300/80'>
                Lunary helps you understand yourself.
              </span>
            </Heading>
            <div className='max-w-2xl mx-auto text-left md:text-center space-y-3'>
              <p className='text-zinc-400'>
                <span className='text-zinc-500'>Generic apps:</span> Sun sign
                horoscopes for millions
              </p>
              <p className='text-zinc-300'>
                <span className='text-lunary-primary-400'>Lunary:</span> Your
                full chart analyzed daily
              </p>
              <p className='text-zinc-400'>
                <span className='text-zinc-500'>Generic apps:</span> Predict
                what will happen
              </p>
              <p className='text-zinc-300'>
                <span className='text-lunary-primary-400'>Lunary:</span> Track
                your own patterns over time
              </p>
              <p className='text-zinc-400'>
                <span className='text-zinc-500'>Generic apps:</span> Built for
                virality
              </p>
              <p className='text-zinc-300'>
                <span className='text-lunary-primary-400'>Lunary:</span> Built
                for depth and learning
              </p>
              <p className='text-zinc-400'>
                <span className='text-zinc-500'>Generic apps:</span> Basic sun
                sign compatibility
              </p>
              <p className='text-zinc-300'>
                <span className='text-lunary-primary-400'>Lunary:</span> Full
                synastry analysis + Best Times to Connect
              </p>
              <p className='text-zinc-400'>
                <span className='text-zinc-500'>Generic apps:</span> Tell you
                what transits mean
              </p>
              <p className='text-zinc-300'>
                <span className='text-lunary-primary-400'>Lunary:</span> Show
                you YOUR patterns over time so you become the expert
              </p>
            </div>
            <div className='pt-4'>
              <p className='text-xs text-zinc-500 mb-4'>
                Plus: 2,000+ free education articles
              </p>
              <Button variant='outline' asChild>
                <Link href='/features'>See all features</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Section 3: Founder Story */}
        <section className='py-12 md:py-16 px-4 md:px-6 bg-zinc-900/20'>
          <div className='max-w-3xl mx-auto text-center space-y-6'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 mb-4'>
              <Sparkles
                className='w-8 h-8 text-lunary-primary-400'
                strokeWidth={1.5}
              />
            </div>
            <Heading as='h2' variant='h1' className='text-lg text-zinc-200'>
              Built by someone who wanted better astrology tools
            </Heading>
            <p className='text-sm text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
              "I got tired of generic sun sign horoscopes. So I built Lunary:
              personal astrology that actually uses your full chart and tracks
              your patterns over time. Small team, focused on quality over
              scale."
            </p>
            <p className='text-xs text-zinc-500'>Sammii, Founder</p>
          </div>
        </section>

        {/* Section 3b: Technical Trust */}
        <section className='py-12 md:py-16 px-4 md:px-6 border-t border-zinc-800/30'>
          <div className='max-w-3xl mx-auto text-center space-y-6'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 mb-4'>
              <Telescope
                className='w-8 h-8 text-lunary-primary-400'
                strokeWidth={1.5}
              />
            </div>
            <Heading as='h2' variant='h2' className='text-zinc-100'>
              Real astronomy, not guesswork
            </Heading>
            <p className='text-sm text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
              Lunary&apos;s calculations are powered by Astronomy Engine — the
              same models (VSOP87) used by NASA&apos;s JPL Horizons, tested to
              within ±1 arcminute of the US Naval Observatory&apos;s data.
            </p>
            <p className='text-sm text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
              No AI-generated predictions. No simplified sun-sign algorithms.
              Real astronomical calculations, applied to your complete birth
              chart.
            </p>
          </div>
        </section>

        {/* Section 4: Educational Empowerment */}
        <section className='border-t border-zinc-800/30 py-12 md:py-16'>
          <div className='max-w-4xl mx-auto px-4 md:px-6 text-center space-y-6'>
            <Heading as='h2' variant='h2' className='text-zinc-100'>
              Learn astrology through your own experience
            </Heading>
            <p className='text-zinc-400 max-w-2xl mx-auto leading-relaxed'>
              Most apps keep you dependent on daily horoscopes.
              <br />
              Lunary teaches you to read your own chart.
            </p>

            <div className='max-w-2xl mx-auto text-left space-y-3 pt-4'>
              <div className='flex items-start gap-3'>
                <Check className='w-5 h-5 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm text-zinc-200'>
                    How your natal chart shapes your patterns
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Check className='w-5 h-5 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm text-zinc-200'>
                    Which transits affect you most (and how to work with them)
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Check className='w-5 h-5 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm text-zinc-200'>
                    Reading tarot in context of your chart
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Check className='w-5 h-5 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm text-zinc-200'>
                    When to expect emotional intensity vs. ease
                  </p>
                </div>
              </div>
            </div>

            <div className='pt-6'>
              <p className='text-sm text-zinc-400 mb-2'>
                After 3-6 months of daily practice, most users can confidently
                interpret their own transits.
              </p>
              <p className='text-xs text-lunary-primary-300 font-medium'>
                Free grimoire: 2,000+ articles explaining everything
              </p>
            </div>

            <div className='pt-2'>
              <Button variant='lunary' asChild>
                <Link href='/grimoire'>Start learning</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Section 4b: Connect with Your Cosmic Circle */}
        <section className='py-12 md:py-16 px-4 md:px-6 bg-zinc-900/20'>
          <div className='max-w-4xl mx-auto'>
            <div className='text-center space-y-4 mb-8'>
              <div className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-lunary-primary-800/50 mb-2'>
                <Users className='w-7 h-7 text-lunary-accent-200' />
              </div>
              <Heading as='h2' variant='h2' className='text-zinc-100'>
                Connect with Your Cosmic Circle
              </Heading>
              <p className='text-zinc-400 max-w-2xl mx-auto leading-relaxed'>
                See how your charts interact. Track compatibility. Get alerts
                when cosmic timing is perfect for connection.
              </p>
            </div>

            <div className='grid md:grid-cols-3 gap-4 mb-8'>
              <div className='rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 space-y-3'>
                <div className='flex items-center gap-2 align-middle'>
                  <Heart className='w-5 h-5 text-lunary-primary-400' />
                  <Heading
                    as='h3'
                    variant='h3'
                    className='mb-0 ml-2 text-lunary-primary-400'
                  >
                    Full Synastry Analysis
                  </Heading>
                </div>
                <p className='text-sm text-zinc-400'>
                  See exactly how your charts interact with full aspect
                  analysis. Element and modality balance comparisons.
                </p>
              </div>
              <div className='rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 space-y-3'>
                <div className='flex items-center gap-2 align-middle'>
                  <Calendar className='w-5 h-5 text-lunary-primary-300' />
                  <Heading as='h3' variant='h3' className='mb-0 ml-2'>
                    Best Times to Connect
                  </Heading>
                </div>
                <p className='text-sm text-zinc-400'>
                  Know when cosmic timing supports connection. Analyzes BOTH
                  charts to find optimal windows.
                </p>
              </div>
              <div className='rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 space-y-3'>
                <div className='flex items-center gap-2 align-middle'>
                  <Moon className='w-5 h-5 text-blue-400/70' />
                  <Heading
                    as='h3'
                    variant='h3'
                    className='mb-0 ml-2 text-blue-400/70'
                  >
                    Shared Cosmic Events
                  </Heading>
                </div>
                <p className='text-sm text-zinc-400'>
                  Moon phases that activate compatible houses for both of you.
                  Never miss cosmically significant moments together.
                </p>
              </div>
            </div>

            <div className='text-center space-y-3'>
              <div className='flex flex-wrap justify-center gap-4 text-xs text-zinc-400 mb-2'>
                <span>Free: 5 friends with basic compatibility</span>
                <span className='text-zinc-600 hidden md:inline'>•</span>
                <span>Lunary+: Unlimited + full synastry</span>
                <span className='text-zinc-600 hidden md:inline'>•</span>
                <span>Pro: Best Times + Shared Events</span>
              </div>
              <Button variant='outline' asChild>
                <Link href='/circle'>Explore Circle features</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Section 5: Who Lunary Is For */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-zinc-900/30'>
          <div className='max-w-5xl mx-auto'>
            <div className='text-center space-y-4 mb-10 md:mb-12'>
              <Heading as='h2' variant='h2' className='text-zinc-100'>
                Who Lunary is for
              </Heading>
              <p className='md:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
                Designed for people who want personal astrology that feels
                grounded, gentle and useful.
              </p>
            </div>
            <div className='grid md:grid-cols-2 gap-6 md:gap-8 text-sm'>
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6 space-y-2'>
                <p className='text-sm md:text-base text-lunary-primary-300'>
                  "I want to understand myself better"
                </p>
                <p className='text-zinc-400 text-sm'>
                  Track patterns across time. Notice which transits affect you.
                  Build self-awareness through cosmic timing.
                </p>
              </div>
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6 space-y-2'>
                <p className='text-sm md:text-base text-lunary-primary-300'>
                  "I'm learning astrology"
                </p>
                <p className='text-zinc-400 text-sm'>
                  2,000+ free articles. Daily practice with your own chart.
                  Hands-on education, not theory.
                </p>
              </div>
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6 space-y-2'>
                <p className='text-sm md:text-base text-lunary-primary-300'>
                  "I'm tired of generic horoscopes"
                </p>
                <p className='text-zinc-400 text-sm'>
                  Your full birth chart matters. Personal insights, not sun sign
                  predictions. See what's actually happening in YOUR life.
                </p>
              </div>
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6 space-y-2'>
                <p className='text-sm md:text-base text-lunary-primary-300'>
                  "I journal and track my cycles"
                </p>
                <p className='text-zinc-400 text-sm'>
                  Connect reflections to moon phases. Track patterns over time.
                  Your journal becomes your astrology textbook.
                </p>
              </div>
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6 space-y-2 md:col-span-2'>
                <p className='text-sm md:text-base text-lunary-primary-300'>
                  "I want to understand my relationships better"
                </p>
                <p className='text-zinc-400 text-sm'>
                  Connect with friends who get it. See how your charts interact
                  with full synastry. Get alerts when cosmic timing supports
                  connection—like "New Moon in Pisces activates your 5th and
                  their 7th houses: great for starting new creative projects
                  together."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Three Pillars */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-zinc-900/30'>
          <div className='max-w-5xl mx-auto'>
            <div className='grid md:grid-cols-3 gap-8 md:gap-10'>
              <div className='text-center space-y-3'>
                <Telescope
                  className='w-8 h-8 text-lunary-primary-400 mx-auto'
                  strokeWidth={1.5}
                />
                <Heading as='h2' variant='h2'>
                  Based on real astronomy
                </Heading>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Every insight starts with the actual planetary positions and
                  your precise chart.
                </p>
                <p className='text-xs text-zinc-500 leading-relaxed'>
                  Every insight is interpreted through your full chart, not
                  isolated meanings.
                </p>
              </div>
              <div className='text-center space-y-3'>
                <Sparkles
                  className='w-8 h-8 text-lunary-primary-300 mx-auto'
                  strokeWidth={1.5}
                />
                <Heading as='h2' variant='h2'>
                  Connected & Contextual
                </Heading>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Tarot, transits, and moon cycles work together. Each insight
                  connects to your full chart and current timing.
                </p>
              </div>
              <div className='text-center space-y-3'>
                <NotebookPen
                  className='w-8 h-8 text-blue-400/70 mx-auto'
                  strokeWidth={1.5}
                />
                <Heading as='h2' variant='h2'>
                  Designed as a daily practice
                </Heading>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Calm and reflective guidance that supports self understanding
                  rather than predicting your fate.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Feature Spotlights (A/B Test) */}
        <section className='py-12 md:py-20 px-4 md:px-6'>
          <HomepageFeaturesTest />
        </section>

        {/* Section 8: Learn & Explore */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-zinc-900/30'>
          <div className='max-w-5xl mx-auto'>
            <div className='text-center space-y-4 mb-10 md:mb-14'>
              <Heading as='h2' variant='h2'>
                Free astrology education: 2,000+ articles
              </Heading>
              <p className='text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
                Learn astrology by doing: study your own chart while
                understanding the concepts behind it.
                <br />
                <br />
                <span className='text-lunary-primary-300'>
                  100% free. No paywall. No upsells.
                </span>
              </p>
            </div>
            <div className='grid md:grid-cols-2 gap-6 md:gap-8'>
              <Link
                href='/grimoire/astrology'
                className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6 space-y-3'
              >
                <Heading as='h3' variant='h3' className='text-zinc-100'>
                  Astrology, explained properly
                </Heading>
                <p className='text-xs text-zinc-400 leading-relaxed'>
                  Explore planets, houses, aspects, and transits with clarity.
                  Learn how the sky works and how it connects to lived
                  experience.
                </p>
                <div className='text-xs text-lunary-primary-300 hover:text-lunary-primary-200 transition-colors'>
                  Explore astrology
                </div>
              </Link>
              <Link
                href='/grimoire/tarot'
                className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6 space-y-3'
              >
                <Heading as='h3' variant='h3' className='text-zinc-100'>
                  Tarot beyond single-card pulls
                </Heading>
                <p className='text-xs text-zinc-400 leading-relaxed'>
                  Understand archetypes, symbolism, and recurring themes across
                  time. Tarot becomes meaningful when you see the patterns, not
                  just the card of the day.
                </p>
                <div className='text-xs text-lunary-primary-300 hover:text-lunary-primary-200 transition-colors'>
                  Explore tarot
                </div>
              </Link>
              <Link
                href='/grimoire/moon'
                className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6 space-y-3'
              >
                <Heading as='h3' variant='h3' className='text-zinc-100'>
                  Moon phases & ritual timing
                </Heading>
                <p className='text-xs text-zinc-400 leading-relaxed'>
                  Learn how lunar cycles influence reflection, release, and
                  intention. From new moons to eclipses, timing becomes
                  intuitive rather than overwhelming.
                </p>
                <div className='text-xs text-lunary-primary-300 hover:text-lunary-primary-200 transition-colors'>
                  Explore moon phases
                </div>
              </Link>
              <Link
                href='/grimoire/correspondences'
                className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6 space-y-3'
              >
                <Heading as='h3' variant='h3' className='text-zinc-100'>
                  Crystals, runes & symbolic systems
                </Heading>
                <p className='text-xs text-zinc-400 leading-relaxed'>
                  Discover how different symbolic systems connect through
                  meaning and correspondence, presented with clarity and respect
                  rather than superstition.
                </p>
                <div className='text-xs text-lunary-primary-300 hover:text-lunary-primary-200 transition-colors'>
                  Explore correspondences
                </div>
              </Link>
            </div>
            <div className='text-center mt-10 md:mt-14'>
              <p className='text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
                Learning gives context. When you're ready, Lunary connects that
                understanding to your birth chart and current timing for deeper
                personal insight.
              </p>
            </div>
          </div>
        </section>

        {/* Section 9: How It Works */}
        <section
          id='how-it-works'
          className='py-12 md:py-20 px-4 md:px-6 bg-zinc-900/30 scroll-mt-16'
        >
          <div className='max-w-5xl mx-auto'>
            <Heading
              as='h2'
              variant='h2'
              className='text-center mb-10 md:mb-14'
            >
              How it works
            </Heading>
            <div className='grid md:grid-cols-3 gap-8 md:gap-10'>
              <div className='text-center space-y-3'>
                <Calendar
                  className='w-8 h-8 text-lunary-primary-400 mx-auto'
                  strokeWidth={1.5}
                />
                <div className='text-sm text-lunary-primary-400 font-medium'>
                  1
                </div>
                <Heading as='h3' variant='h3' className='text-zinc-100'>
                  Enter your birth details
                </Heading>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Lunary creates an accurate map of your chart.
                </p>
                <p className='text-xs text-zinc-400'>
                  Sets the foundation for personalised insight.
                </p>
              </div>
              <div className='text-center space-y-3'>
                <Map
                  className='w-8 h-8 text-lunary-primary-300 mx-auto'
                  strokeWidth={1.5}
                />
                <div className='text-sm text-lunary-primary-300'>2</div>
                <Heading as='h3' variant='h3' className='text-zinc-100'>
                  Explore your cosmic map
                </Heading>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Your dashboard brings today’s sky together with your birth
                  chart for personalised themes and patterns.
                </p>
                <p className='text-xs text-zinc-400'>
                  See what is influencing your day.
                </p>
              </div>
              <div className='text-center space-y-3'>
                <MessagesSquare
                  className='w-8 h-8 text-blue-400/70 mx-auto'
                  strokeWidth={1.5}
                />
                <div className='text-sm text-blue-400/70'>3</div>
                <Heading as='h3' variant='h3' className='text-zinc-100'>
                  Talk to your astral guide
                </Heading>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Ask questions and receive grounded insight that supports your
                  day.
                </p>
                <p className='text-xs text-zinc-400'>
                  Your companion for clarity and reflection.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 10: Comparison */}
        <section className='py-12 md:py-20 px-4 md:px-6'>
          <div className='max-w-3xl mx-auto'>
            <div className='grid md:grid-cols-2 gap-4 md:gap-6'>
              {/* Other Apps */}
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5 md:p-6'>
                <h3 className='text-sm font-medium text-zinc-400 uppercase tracking-wider mb-5'>
                  Other apps
                </h3>
                <ul className='space-y-3'>
                  <li className='flex items-start gap-3'>
                    <X
                      className='w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-zinc-400'>
                      AI-generated or simplified calculations
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <X
                      className='w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-zinc-400'>
                      Sun sign horoscopes for millions
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <X
                      className='w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-zinc-400'>
                      Paywalled basics, limited free content
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <X
                      className='w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-zinc-400'>
                      Notification spam and aggressive upsells
                    </span>
                  </li>
                </ul>
              </div>

              {/* Lunary */}
              <div className='rounded-2xl border border-lunary-primary-700 bg-zinc-900/50 p-5 md:p-6'>
                <h3 className='text-sm font-medium text-lunary-primary-400 uppercase tracking-wider mb-5'>
                  Lunary
                </h3>
                <ul className='space-y-3'>
                  <li className='flex items-start gap-3'>
                    <Check
                      className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-zinc-200'>
                      Accurate calculations, not AI guesswork
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <Check
                      className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-zinc-200'>
                      Your complete birth chart, not just your sun sign
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <Check
                      className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-zinc-200'>
                      2,000+ free educational articles
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <Check
                      className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-zinc-200'>
                      A daily practice, not a notification machine
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 11: Pricing Teaser */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-zinc-900/30'>
          <div className='max-w-2xl mx-auto text-center space-y-5'>
            <p className='text-sm text-zinc-400'>
              Free to begin. <br /> Upgrade only if you want deeper,
              chart-specific insight.
            </p>
            <Heading as='h2' variant='h2' className='text-zinc-100'>
              What’s included
            </Heading>
            <div className='grid md:grid-cols-2 gap-4 text-left text-sm text-zinc-400'>
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4'>
                <p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>
                  Free includes
                </p>
                <ul className='mt-2 space-y-3'>
                  <li>
                    <p className='text-sm text-zinc-200'>
                      Your complete birth chart
                    </p>
                    <p className='text-xs text-zinc-500'>
                      See your core placements and foundational themes.
                    </p>
                  </li>
                  <li>
                    <p className='text-sm text-zinc-200'>
                      Daily cosmic dashboard
                    </p>
                    <p className='text-xs text-zinc-500'>
                      Today's transits, moon phase, tarot and crystal guidance,
                      grounded in the current sky.
                    </p>
                    <p className='text-[9px] text-zinc-500 mt-1'>
                      Interpreted at a general level. Chart-specific insight
                      included with Lunary+.
                    </p>
                  </li>
                  <li>
                    <p className='text-sm text-zinc-200'>Astral Guide chat</p>
                    <p className='text-xs text-zinc-500'>
                      Ask a few questions and receive context-aware guidance
                      grounded in your chart and the current sky.
                    </p>
                  </li>
                </ul>
              </div>
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4'>
                <p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>
                  Your Personal Insight
                </p>
                <ul className='mt-2 space-y-3'>
                  <li>
                    <p className='text-sm text-zinc-200'>
                      Personalised interpretations, not generic meanings
                    </p>
                    <p className='text-xs text-zinc-500'>
                      Transits, tarot and lunar cycles interpreted through your
                      placements and ongoing themes.
                    </p>
                  </li>
                  <li>
                    <p className='text-sm text-zinc-200'>
                      Guided rituals aligned to your chart and timing
                    </p>
                    <p className='text-xs text-zinc-500'>
                      Practices shaped around your current transits and lunar
                      phases.
                    </p>
                  </li>
                  <li>
                    <p className='text-sm text-zinc-200'>
                      Pattern tracking across time
                    </p>
                    <p className='text-xs text-zinc-500'>
                      See recurring emotional themes, cycles, and lessons as
                      they unfold.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            <div className='pt-2'>
              <Button variant='outline' asChild>
                <Link
                  href='/pricing'
                  onClick={() =>
                    handleCtaClick('promo-banner', 'View plans', '/pricing')
                  }
                >
                  View plans
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Section 12: Why Lunary Feels Different */}
        <section className='py-12 md:py-16 px-4 md:px-6'>
          <div className='max-w-2xl mx-auto text-center space-y-4'>
            <Heading as='h2' variant='h2'>
              Why Lunary feels different
            </Heading>
            <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
              Lunary uses real astronomical data, your natal placements and the
              current sky to build a deeper, personalised understanding over
              time.
            </p>
          </div>
        </section>

        {/* Section 13: FAQs */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-zinc-900/20'>
          <div className='max-w-3xl mx-auto'>
            <Heading as='h2' variant='h2' className='text-center mb-6 md:mb-12'>
              Common questions
            </Heading>
            <div className='space-y-3'>
              {homepageFAQs.map((faq) => (
                <FAQAccordion
                  key={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQId === faq.id}
                  onToggle={() =>
                    setOpenFAQId(openFAQId === faq.id ? null : faq.id)
                  }
                />
              ))}
            </div>
            <div className='text-center mt-8'>
              <Link
                href='/faq'
                className='text-sm text-lunary-primary-300 hover:text-lunary-primary-200 transition-colors inline-flex items-center gap-2'
              >
                View all FAQs
                <svg
                  className='w-4 h-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 14: Final CTA */}
        <section className='py-12 md:py-20 px-4 md:px-6 border-t border-zinc-800/30'>
          <div className='max-w-2xl mx-auto text-center space-y-6'>
            <Heading as='h2' variant='h2'>
              Start understanding yourself better
            </Heading>

            <div className='max-w-md mx-auto text-left space-y-2'>
              <div className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-lunary-primary-400 flex-shrink-0' />
                <span className='text-sm text-zinc-400'>
                  Complete birth chart in 60 seconds
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-lunary-primary-400 flex-shrink-0' />
                <span className='text-sm text-zinc-400'>
                  Daily guidance based on YOUR chart
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-lunary-primary-400 flex-shrink-0' />
                <span className='text-sm text-zinc-400'>
                  2,000+ free grimoire articles
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-lunary-primary-400 flex-shrink-0' />
                <span className='text-sm text-zinc-400'>
                  Pattern tracking over time
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-lunary-primary-400 flex-shrink-0' />
                <span className='text-sm text-zinc-400'>
                  No credit card required
                </span>
              </div>
            </div>

            <div className='pt-4 flex flex-col gap-3 items-center'>
              <Button variant='lunary-soft' size='default' asChild>
                <Link
                  href='/auth?signup=true'
                  onClick={() =>
                    handleCtaClick(
                      'final-cta',
                      CTA_COPY.auth.createChart,
                      '/auth?signup=true',
                    )
                  }
                >
                  {CTA_COPY.auth.createChart}
                </Link>
              </Button>
              <p className='text-xs text-zinc-500 mt-2'>
                Want to see features first? <br />
                <Link
                  href='/pricing'
                  className='text-lunary-primary-400 hover:text-lunary-primary-200 transition-colors'
                  onClick={() =>
                    handleCtaClick(
                      'final-cta-secondary',
                      'View pricing',
                      '/pricing',
                    )
                  }
                >
                  Explore what's included
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Section 15: Newsletter */}
        <section className='py-12 md:py-20 px-4 md:px-6'>
          <div className='max-w-4xl mx-auto'>
            <NewsletterSignupForm
              source='welcome_page'
              headline='Weekly cosmic recap, delivered'
              description='A calm weekly digest of the most meaningful sky events, written for people who want clarity without noise.'
              ctaLabel='Join the newsletter'
              successMessage='Check your inbox to confirm your subscription.'
              align='center'
            />
          </div>
        </section>

        {/* Footer */}
        <div className='mt-auto'>
          <MarketingFooter />
        </div>
      </div>
    </>
  );
}
