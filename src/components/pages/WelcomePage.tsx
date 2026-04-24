'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
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
import { useRouter } from 'next/navigation';
import { HomepageFeaturesTest } from '@/components/marketing/HomepageFeaturesTest';
import { OptimizedDemoIframe } from '@/components/marketing/OptimizedDemoIframe';
import { Reveal } from '@/components/marketing/Reveal';
import { ScrollProgressBar } from '@/components/marketing/ScrollProgressBar';
import {
  useABTestTracking,
  useABTestConversion,
  useABTestVariants,
} from '@/hooks/useABTestTracking';
import { Heading } from '../ui/Heading';
import { Testimonials } from '@/components/marketing/Testimonials';

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
  const router = useRouter();

  // Native iOS app should never see the marketing page — redirect to /auth
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      router.replace('/auth');
    }
  }, [router]);

  const [openFAQId, setOpenFAQId] = useState<string | null>(null);
  const homepageFAQs = getHomepageFAQs();

  // Track page view with A/B test data
  useABTestTracking('welcome', 'page_viewed', [
    'homepage-features-test',
    'cta-copy-test',
    'hero-subhead-test',
    'hero_value_stack_v1',
    'sticky_free_card_v1',
  ]);

  // Get conversion tracker with A/B test metadata
  const { trackConversion } = useABTestConversion();

  const { heroSubhead, heroValueStack, stickyFreeCard } = useABTestVariants();
  const isCondensedHero = heroSubhead === 'condensed';
  const showFullProductStack = heroValueStack === 'full-product';
  const showStickyFreeCard = stickyFreeCard === 'sticky-card';

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
      <ScrollProgressBar />

      <div className='min-h-screen bg-surface-base text-content-primary flex flex-col'>
        {/* Referral Banner */}
        <div className='bg-gradient-to-r from-layer-base/40 to-layer-raised/40 border-b border-lunary-primary-700/30 py-2 px-4'>
          <div className='flex items-center justify-center gap-2'>
            <Users className='w-4 h-4 text-content-secondary' />
            <p className='text-xs md:text-sm text-content-secondary'>
              Give a friend{' '}
              <span className='font-semibold text-content-secondary'>
                30 days of Pro free
              </span>{' '}
              — earn a bonus week for every referral
            </p>
          </div>
        </div>

        {/* Section 1: Hero */}
        <section className='relative px-4 md:px-6 pt-4 md:pt-16 pb-10 md:pb-16 bg-surface-base'>
          <Reveal className='max-w-3xl mx-auto text-center space-y-6'>
            <p className='text-xs uppercase tracking-[0.2em] text-content-muted'>
              Personal astrology grounded in real astronomy
            </p>
            <Heading
              as='h1'
              variant='h1'
              className='max-w-md md:max-w-2xl mx-auto'
            >
              Unlock the Secrets of the Stars with Lunary
            </Heading>
            <p className='text-xs md:text-sm text-content-muted leading-relaxed max-w-md mx-auto'>
              Track how planets affect YOU specifically.
            </p>
            <p className='text-xs md:text-sm text-content-muted leading-relaxed max-w-lg mx-auto mt-[0.25rem]'>
              After 2-3 months, you'll recognize patterns and interpret transits
              without depending on generic predictions.
            </p>
            {showFullProductStack && (
              <ul className='mx-auto max-w-md text-left text-xs md:text-sm text-content-secondary space-y-1.5 pt-2'>
                <li className='flex gap-2 items-start'>
                  <Check className='w-4 h-4 text-lunary-primary-400 shrink-0 mt-0.5' />
                  <span>Your full birth chart with every placement</span>
                </li>
                <li className='flex gap-2 items-start'>
                  <Check className='w-4 h-4 text-lunary-primary-400 shrink-0 mt-0.5' />
                  <span>Compatibility with anyone you care about</span>
                </li>
                <li className='flex gap-2 items-start'>
                  <Check className='w-4 h-4 text-lunary-primary-400 shrink-0 mt-0.5' />
                  <span>Daily tarot and today's horoscope — always free</span>
                </li>
                <li className='flex gap-2 items-start'>
                  <Check className='w-4 h-4 text-lunary-primary-400 shrink-0 mt-0.5' />
                  <span>Real-time transits and moon phase for your chart</span>
                </li>
                <li className='flex gap-2 items-start'>
                  <Check className='w-4 h-4 text-lunary-primary-400 shrink-0 mt-0.5' />
                  <span>Astral Guide — ask questions about your chart</span>
                </li>
              </ul>
            )}
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
              <p className='text-xs text-content-muted'>
                Already have an account?{' '}
                <Link
                  href='/auth'
                  className='text-lunary-primary-400 hover:text-content-secondary transition-colors'
                >
                  Sign in
                </Link>
              </p>
              <p className='text-xs text-content-muted mt-2'>
                Start with 7 days free • Give a friend 30 days of Pro, earn a
                bonus week
              </p>
            </div>
          </Reveal>

          {/* Hero Mini App */}
          <Reveal
            delayMs={120}
            className='mt-8 mx-3 md:mx-0 md:mt-[33px] flex justify-center'
          >
            <OptimizedDemoIframe
              loading='eager' // Above-the-fold
              preload={true} // Max performance
            />
          </Reveal>

          {showStickyFreeCard && (
            <Reveal delayMs={180} className='mt-8 max-w-md mx-auto'>
              <div className='rounded-xl border border-lunary-primary-700/40 bg-layer-raised/60 backdrop-blur-sm px-4 py-3 flex items-center gap-3 shadow-[0_8px_20px_rgba(178,126,255,0.12)]'>
                <Sparkles className='w-5 h-5 text-lunary-primary-400 shrink-0' />
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-content-primary'>
                    Daily tarot + today's horoscope, always free
                  </p>
                  <p className='text-xs text-content-muted mt-0.5'>
                    Start with 7 days of Pro free for the personalised version.
                  </p>
                </div>
                <Button variant='lunary-soft' size='sm' asChild>
                  <Link
                    href='/auth?signup=true'
                    onClick={() =>
                      handleCtaClick(
                        'sticky_free_card',
                        'Start free',
                        '/auth?signup=true',
                      )
                    }
                  >
                    Start free
                  </Link>
                </Button>
              </div>
            </Reveal>
          )}
        </section>

        <section className='py-2 px-4 md:py-8 leading-relaxed max-w-3xl mx-auto text-center'>
          <p className='text-sm text-content-muted mb-6'>
            See Lunary in action with today's actual planetary positions.
            <br />
            This demo uses real cosmic data. Everything updates daily based on
            current transits and moon phases.
          </p>
          {!isCondensedHero && (
            <p className='text-content-muted leading-relaxed max-w-3xl mx-auto'>
              Lunary is designed for reflection rather than prediction. Instead
              of offering fixed meanings or one-size-fits-all readings, it helps
              you understand patterns, timing, and cycles as they unfold.
            </p>
          )}
          <Link
            href='/features'
            className='text-sm text-lunary-primary-400 hover:text-content-secondary transition-colors inline-block mt-4'
          >
            See all features
          </Link>
        </section>

        {/* Section 2: Differentiation */}
        <section className='py-12 md:py-16 px-4 md:px-6 border-t border-stroke-subtle/30'>
          <div className='max-w-4xl mx-auto text-center space-y-6'>
            <Reveal>
              <Heading
                as='h2'
                variant='h1'
                className='max-w-md md:max-w-2xl mx-auto text-content-primary'
              >
                Most apps entertain you.
                <br />
                <span className='text-content-brand/80'>
                  Lunary helps you understand yourself.
                </span>
              </Heading>
            </Reveal>
            <div className='max-w-2xl mx-auto text-left md:text-center space-y-3'>
              <Reveal delayMs={0}>
                <p className='text-content-muted'>
                  <span className='text-content-muted'>Generic apps:</span> Sun
                  sign horoscopes for millions
                </p>
                <p className='text-content-secondary'>
                  <span className='text-lunary-primary-400'>Lunary:</span> Your
                  full chart analyzed daily
                </p>
              </Reveal>
              <Reveal delayMs={80}>
                <p className='text-content-muted'>
                  <span className='text-content-muted'>Generic apps:</span>{' '}
                  Predict what will happen
                </p>
                <p className='text-content-secondary'>
                  <span className='text-lunary-primary-400'>Lunary:</span> Track
                  your own patterns over time
                </p>
              </Reveal>
              <Reveal delayMs={160}>
                <p className='text-content-muted'>
                  <span className='text-content-muted'>Generic apps:</span>{' '}
                  Built for virality
                </p>
                <p className='text-content-secondary'>
                  <span className='text-lunary-primary-400'>Lunary:</span> Built
                  for depth and learning
                </p>
              </Reveal>
              <Reveal delayMs={240}>
                <p className='text-content-muted'>
                  <span className='text-content-muted'>Generic apps:</span>{' '}
                  Basic sun sign compatibility
                </p>
                <p className='text-content-secondary'>
                  <span className='text-lunary-primary-400'>Lunary:</span> Full
                  synastry analysis + Best Times to Connect
                </p>
              </Reveal>
              <Reveal delayMs={320}>
                <p className='text-content-muted'>
                  <span className='text-content-muted'>Generic apps:</span> Tell
                  you what transits mean
                </p>
                <p className='text-content-secondary'>
                  <span className='text-lunary-primary-400'>Lunary:</span> Show
                  you YOUR patterns over time so you become the expert
                </p>
              </Reveal>
            </div>
            <Reveal delayMs={100} className='pt-4'>
              <p className='text-xs text-content-muted mb-4'>
                Plus: 2,000+ free education articles
              </p>
              <Button variant='outline' asChild>
                <Link href='/features'>See all features</Link>
              </Button>
            </Reveal>
          </div>
        </section>

        {/* Section 3: Founder Story */}
        <section className='py-12 md:py-16 px-4 md:px-6 bg-surface-elevated/20'>
          <div className='max-w-3xl mx-auto text-center space-y-6'>
            <Reveal delayMs={0}>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-card'>
                <Sparkles
                  className='w-8 h-8 text-lunary-primary-400'
                  strokeWidth={1.5}
                />
              </div>
            </Reveal>
            <Reveal delayMs={120}>
              <Heading
                as='h2'
                variant='h1'
                className='text-lg text-content-primary'
              >
                Built by someone who wanted better astrology tools
              </Heading>
            </Reveal>
            <Reveal delayMs={240}>
              <p className='text-sm text-content-muted leading-relaxed max-w-2xl mx-auto'>
                "I got tired of generic sun sign horoscopes. So I built Lunary:
                personal astrology that actually uses your full chart and tracks
                your patterns over time. Small team, focused on quality over
                scale."
              </p>
            </Reveal>
            <Reveal delayMs={360}>
              <p className='text-xs text-content-muted'>Sammii, Founder</p>
            </Reveal>
          </div>
        </section>

        {/* Section 3b: Technical Trust */}
        <section className='py-12 md:py-16 px-4 md:px-6 border-t border-stroke-subtle/30'>
          <Reveal className='max-w-3xl mx-auto text-center space-y-6'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-card mb-4'>
              <Telescope
                className='w-8 h-8 text-lunary-primary-400'
                strokeWidth={1.5}
              />
            </div>
            <Heading as='h2' variant='h2' className='text-content-primary'>
              Real astronomy, not guesswork
            </Heading>
            <p className='text-sm text-content-muted leading-relaxed max-w-2xl mx-auto'>
              Lunary&apos;s calculations are powered by Astronomy Engine — the
              same models (VSOP87) used by NASA&apos;s JPL Horizons, tested to
              within ±1 arcminute of the US Naval Observatory&apos;s data.
            </p>
            <p className='text-sm text-content-muted leading-relaxed max-w-2xl mx-auto'>
              No AI-generated predictions. No simplified sun-sign algorithms.
              Real astronomical calculations, applied to your complete birth
              chart.
            </p>
          </Reveal>
        </section>

        {/* Section 4: Educational Empowerment */}
        <section className='border-t border-stroke-subtle/30 py-12 md:py-16'>
          <div className='max-w-4xl mx-auto px-4 md:px-6 text-center space-y-6'>
            <Reveal>
              <Heading as='h2' variant='h2' className='text-content-primary'>
                Learn astrology through your own experience
              </Heading>
              <p className='text-content-muted max-w-2xl mx-auto leading-relaxed mt-4'>
                Most apps keep you dependent on daily horoscopes.
                <br />
                Lunary teaches you to read your own chart.
              </p>
            </Reveal>

            <div className='max-w-2xl mx-auto text-left space-y-3 pt-4'>
              <Reveal delayMs={0} className='flex items-start gap-3'>
                <Check className='w-5 h-5 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm text-content-primary'>
                    How your natal chart shapes your patterns
                  </p>
                </div>
              </Reveal>
              <Reveal delayMs={80} className='flex items-start gap-3'>
                <Check className='w-5 h-5 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm text-content-primary'>
                    Which transits affect you most (and how to work with them)
                  </p>
                </div>
              </Reveal>
              <Reveal delayMs={160} className='flex items-start gap-3'>
                <Check className='w-5 h-5 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm text-content-primary'>
                    Reading tarot in context of your chart
                  </p>
                </div>
              </Reveal>
              <Reveal delayMs={240} className='flex items-start gap-3'>
                <Check className='w-5 h-5 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm text-content-primary'>
                    When to expect emotional intensity vs. ease
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal delayMs={120} className='pt-6'>
              <p className='text-sm text-content-muted mb-2'>
                After 3-6 months of daily practice, most users can confidently
                interpret their own transits.
              </p>
              <p className='text-xs text-content-brand font-medium'>
                Free grimoire: 2,000+ articles explaining everything
              </p>
              <div className='pt-6'>
                <Button variant='lunary' asChild>
                  <Link href='/grimoire'>Start learning</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Section 4b: Connect with Your Cosmic Circle */}
        <section className='py-12 md:py-16 px-4 md:px-6 bg-surface-elevated/20'>
          <div className='max-w-4xl mx-auto'>
            <Reveal className='text-center space-y-4 mb-8'>
              <div className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-layer-raised/50 mb-2'>
                <Users className='w-7 h-7 text-content-brand-accent' />
              </div>
              <Heading as='h2' variant='h2' className='text-content-primary'>
                Connect with Your Cosmic Circle
              </Heading>
              <p className='text-content-muted max-w-2xl mx-auto leading-relaxed'>
                See how your charts interact. Track compatibility. Get alerts
                when cosmic timing is perfect for connection.
              </p>
            </Reveal>

            <div className='grid md:grid-cols-3 gap-4 mb-8'>
              <Reveal
                delayMs={0}
                className='rounded-xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 space-y-3 transition-transform duration-300 hover:-translate-y-0.5'
              >
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
                <p className='text-sm text-content-muted'>
                  See exactly how your charts interact with full aspect
                  analysis. Element and modality balance comparisons.
                </p>
              </Reveal>
              <Reveal
                delayMs={100}
                className='rounded-xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 space-y-3 transition-transform duration-300 hover:-translate-y-0.5'
              >
                <div className='flex items-center gap-2 align-middle'>
                  <Calendar className='w-5 h-5 text-content-brand' />
                  <Heading as='h3' variant='h3' className='mb-0 ml-2'>
                    Best Times to Connect
                  </Heading>
                </div>
                <p className='text-sm text-content-muted'>
                  Know when cosmic timing supports connection. Analyzes BOTH
                  charts to find optimal windows.
                </p>
              </Reveal>
              <Reveal
                delayMs={200}
                className='rounded-xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 space-y-3 transition-transform duration-300 hover:-translate-y-0.5'
              >
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
                <p className='text-sm text-content-muted'>
                  Moon phases that activate compatible houses for both of you.
                  Never miss cosmically significant moments together.
                </p>
              </Reveal>
            </div>

            <Reveal delayMs={120} className='text-center space-y-3'>
              <div className='flex flex-wrap justify-center gap-4 text-xs text-content-muted mb-2'>
                <span>Free: 5 friends with basic compatibility</span>
                <span className='text-content-muted hidden md:inline'>•</span>
                <span>Lunary+: Unlimited + full synastry</span>
                <span className='text-content-muted hidden md:inline'>•</span>
                <span>Pro: Best Times + Shared Events</span>
              </div>
              <Button variant='outline' asChild>
                <Link href='/circle'>Explore Circle features</Link>
              </Button>
            </Reveal>
          </div>
        </section>

        {/* Section 5: Who Lunary Is For */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-surface-elevated/30'>
          <div className='max-w-5xl mx-auto'>
            <Reveal className='text-center space-y-4 mb-10 md:mb-12'>
              <Heading as='h2' variant='h2' className='text-content-primary'>
                Who Lunary is for
              </Heading>
              <p className='md:text-lg text-content-muted leading-relaxed max-w-2xl mx-auto'>
                Designed for people who want personal astrology that feels
                grounded, gentle and useful.
              </p>
            </Reveal>
            <div className='grid md:grid-cols-2 gap-6 md:gap-8 text-sm'>
              <Reveal
                delayMs={0}
                className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 md:p-6 space-y-2 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
              >
                <p className='text-sm md:text-base text-content-brand'>
                  "I want to understand myself better"
                </p>
                <p className='text-content-muted text-sm'>
                  Track patterns across time. Notice which transits affect you.
                  Build self-awareness through cosmic timing.
                </p>
              </Reveal>
              <Reveal
                delayMs={80}
                className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 md:p-6 space-y-2 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
              >
                <p className='text-sm md:text-base text-content-brand'>
                  "I'm learning astrology"
                </p>
                <p className='text-content-muted text-sm'>
                  2,000+ free articles. Daily practice with your own chart.
                  Hands-on education, not theory.
                </p>
              </Reveal>
              <Reveal
                delayMs={160}
                className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 md:p-6 space-y-2 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
              >
                <p className='text-sm md:text-base text-content-brand'>
                  "I'm tired of generic horoscopes"
                </p>
                <p className='text-content-muted text-sm'>
                  Your full birth chart matters. Personal insights, not sun sign
                  predictions. See what's actually happening in YOUR life.
                </p>
              </Reveal>
              <Reveal
                delayMs={240}
                className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 md:p-6 space-y-2 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
              >
                <p className='text-sm md:text-base text-content-brand'>
                  "I journal and track my cycles"
                </p>
                <p className='text-content-muted text-sm'>
                  Connect reflections to moon phases. Track patterns over time.
                  Your journal becomes your astrology textbook.
                </p>
              </Reveal>
              <Reveal
                delayMs={320}
                className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 md:p-6 space-y-2 md:col-span-2 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
              >
                <p className='text-sm md:text-base text-content-brand'>
                  "I want to understand my relationships better"
                </p>
                <p className='text-content-muted text-sm'>
                  Connect with friends who get it. See how your charts interact
                  with full synastry. Get alerts when cosmic timing supports
                  connection—like "New Moon in Pisces activates your 5th and
                  their 7th houses: great for starting new creative projects
                  together."
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Section 6: Three Pillars */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-surface-elevated/30'>
          <div className='max-w-5xl mx-auto'>
            <div className='grid md:grid-cols-3 gap-8 md:gap-10'>
              <Reveal delayMs={0} className='text-center space-y-3'>
                <Telescope
                  className='w-8 h-8 text-lunary-primary-400 mx-auto'
                  strokeWidth={1.5}
                />
                <Heading as='h2' variant='h2'>
                  Based on real astronomy
                </Heading>
                <p className='text-sm text-content-muted leading-relaxed'>
                  Every insight starts with the actual planetary positions and
                  your precise chart.
                </p>
                <p className='text-xs text-content-muted leading-relaxed'>
                  Every insight is interpreted through your full chart, not
                  isolated meanings.
                </p>
              </Reveal>
              <Reveal delayMs={120} className='text-center space-y-3'>
                <Sparkles
                  className='w-8 h-8 text-content-brand mx-auto'
                  strokeWidth={1.5}
                />
                <Heading as='h2' variant='h2'>
                  Connected & Contextual
                </Heading>
                <p className='text-sm text-content-muted leading-relaxed'>
                  Tarot, transits, and moon cycles work together. Each insight
                  connects to your full chart and current timing.
                </p>
              </Reveal>
              <Reveal delayMs={240} className='text-center space-y-3'>
                <NotebookPen
                  className='w-8 h-8 text-blue-400/70 mx-auto'
                  strokeWidth={1.5}
                />
                <Heading as='h2' variant='h2'>
                  Designed as a daily practice
                </Heading>
                <p className='text-sm text-content-muted leading-relaxed'>
                  Calm and reflective guidance that supports self understanding
                  rather than predicting your fate.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Section 7: Feature Spotlights (A/B Test) */}
        <section className='py-12 md:py-20 px-4 md:px-6'>
          <HomepageFeaturesTest />
        </section>

        {/* Testimonials */}
        <Reveal>
          <Testimonials />
        </Reveal>

        {/* Section 8: Learn & Explore */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-surface-elevated/30'>
          <div className='max-w-5xl mx-auto'>
            <Reveal className='text-center space-y-4 mb-10 md:mb-14'>
              <Heading as='h2' variant='h2'>
                Free astrology education: 2,000+ articles
              </Heading>
              <p className='text-content-muted leading-relaxed max-w-2xl mx-auto'>
                Learn astrology by doing: study your own chart while
                understanding the concepts behind it.
                <br />
                <br />
                <span className='text-content-brand'>
                  100% free. No paywall. No upsells.
                </span>
              </p>
            </Reveal>
            <div className='grid md:grid-cols-2 gap-6 md:gap-8'>
              <Reveal delayMs={0}>
                <Link
                  href='/grimoire/astrology'
                  className='block rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 md:p-6 space-y-3 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
                >
                  <Heading
                    as='h3'
                    variant='h3'
                    className='text-content-primary'
                  >
                    Astrology, explained properly
                  </Heading>
                  <p className='text-xs text-content-muted leading-relaxed'>
                    Explore planets, houses, aspects, and transits with clarity.
                    Learn how the sky works and how it connects to lived
                    experience.
                  </p>
                  <div className='text-xs text-content-brand hover:text-content-secondary transition-colors'>
                    Explore astrology
                  </div>
                </Link>
              </Reveal>
              <Reveal delayMs={100}>
                <Link
                  href='/grimoire/tarot'
                  className='block rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 md:p-6 space-y-3 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
                >
                  <Heading
                    as='h3'
                    variant='h3'
                    className='text-content-primary'
                  >
                    Tarot beyond single-card pulls
                  </Heading>
                  <p className='text-xs text-content-muted leading-relaxed'>
                    Understand archetypes, symbolism, and recurring themes
                    across time. Tarot becomes meaningful when you see the
                    patterns, not just the card of the day.
                  </p>
                  <div className='text-xs text-content-brand hover:text-content-secondary transition-colors'>
                    Explore tarot
                  </div>
                </Link>
              </Reveal>
              <Reveal delayMs={200}>
                <Link
                  href='/grimoire/moon'
                  className='block rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 md:p-6 space-y-3 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
                >
                  <Heading
                    as='h3'
                    variant='h3'
                    className='text-content-primary'
                  >
                    Moon phases & ritual timing
                  </Heading>
                  <p className='text-xs text-content-muted leading-relaxed'>
                    Learn how lunar cycles influence reflection, release, and
                    intention. From new moons to eclipses, timing becomes
                    intuitive rather than overwhelming.
                  </p>
                  <div className='text-xs text-content-brand hover:text-content-secondary transition-colors'>
                    Explore moon phases
                  </div>
                </Link>
              </Reveal>
              <Reveal delayMs={300}>
                <Link
                  href='/grimoire/correspondences'
                  className='block rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 md:p-6 space-y-3 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
                >
                  <Heading
                    as='h3'
                    variant='h3'
                    className='text-content-primary'
                  >
                    Crystals, runes & symbolic systems
                  </Heading>
                  <p className='text-xs text-content-muted leading-relaxed'>
                    Discover how different symbolic systems connect through
                    meaning and correspondence, presented with clarity and
                    respect rather than superstition.
                  </p>
                  <div className='text-xs text-content-brand hover:text-content-secondary transition-colors'>
                    Explore correspondences
                  </div>
                </Link>
              </Reveal>
            </div>
            <Reveal delayMs={120} className='text-center mt-10 md:mt-14'>
              <p className='text-sm md:text-base text-content-muted leading-relaxed max-w-2xl mx-auto'>
                Learning gives context. When you're ready, Lunary connects that
                understanding to your birth chart and current timing for deeper
                personal insight.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Section 9: How It Works */}
        <section
          id='how-it-works'
          className='py-12 md:py-20 px-4 md:px-6 bg-surface-elevated/30 scroll-mt-16'
        >
          <div className='max-w-5xl mx-auto'>
            <Reveal>
              <Heading
                as='h2'
                variant='h2'
                className='text-center mb-10 md:mb-14'
              >
                How it works
              </Heading>
            </Reveal>
            <div className='grid md:grid-cols-3 gap-8 md:gap-10'>
              <Reveal delayMs={0} className='text-center space-y-3'>
                <Calendar
                  className='w-8 h-8 text-lunary-primary-400 mx-auto'
                  strokeWidth={1.5}
                />
                <div className='text-sm text-lunary-primary-400 font-medium'>
                  1
                </div>
                <Heading as='h3' variant='h3' className='text-content-primary'>
                  Enter your birth details
                </Heading>
                <p className='text-sm text-content-muted leading-relaxed'>
                  Lunary creates an accurate map of your chart.
                </p>
                <p className='text-xs text-content-muted'>
                  Sets the foundation for personalised insight.
                </p>
              </Reveal>
              <Reveal delayMs={140} className='text-center space-y-3'>
                <Map
                  className='w-8 h-8 text-content-brand mx-auto'
                  strokeWidth={1.5}
                />
                <div className='text-sm text-content-brand'>2</div>
                <Heading as='h3' variant='h3' className='text-content-primary'>
                  Explore your cosmic map
                </Heading>
                <p className='text-sm text-content-muted leading-relaxed'>
                  Your dashboard brings today’s sky together with your birth
                  chart for personalised themes and patterns.
                </p>
                <p className='text-xs text-content-muted'>
                  See what is influencing your day.
                </p>
              </Reveal>
              <Reveal delayMs={280} className='text-center space-y-3'>
                <MessagesSquare
                  className='w-8 h-8 text-blue-400/70 mx-auto'
                  strokeWidth={1.5}
                />
                <div className='text-sm text-blue-400/70'>3</div>
                <Heading as='h3' variant='h3' className='text-content-primary'>
                  Talk to your astral guide
                </Heading>
                <p className='text-sm text-content-muted leading-relaxed'>
                  Ask questions and receive grounded insight that supports your
                  day.
                </p>
                <p className='text-xs text-content-muted'>
                  Your companion for clarity and reflection.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Section 10: Comparison */}
        <section className='py-12 md:py-20 px-4 md:px-6'>
          <div className='max-w-3xl mx-auto'>
            <div className='grid md:grid-cols-2 gap-4 md:gap-6'>
              {/* Other Apps */}
              <Reveal
                delayMs={0}
                className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/30 p-5 md:p-6'
              >
                <h3 className='text-sm font-medium text-content-muted uppercase tracking-wider mb-5'>
                  Other apps
                </h3>
                <ul className='space-y-3'>
                  <li className='flex items-start gap-3'>
                    <X
                      className='w-4 h-4 text-content-muted mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-content-muted'>
                      AI-generated or simplified calculations
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <X
                      className='w-4 h-4 text-content-muted mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-content-muted'>
                      Sun sign horoscopes for millions
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <X
                      className='w-4 h-4 text-content-muted mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-content-muted'>
                      Paywalled basics, limited free content
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <X
                      className='w-4 h-4 text-content-muted mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-content-muted'>
                      Notification spam and aggressive upsells
                    </span>
                  </li>
                </ul>
              </Reveal>

              {/* Lunary */}
              <Reveal
                delayMs={120}
                className='rounded-2xl border border-lunary-primary-700 bg-surface-elevated/50 p-5 md:p-6'
              >
                <h3 className='text-sm font-medium text-lunary-primary-400 uppercase tracking-wider mb-5'>
                  Lunary
                </h3>
                <ul className='space-y-3'>
                  <li className='flex items-start gap-3'>
                    <Check
                      className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-content-primary'>
                      Accurate calculations, not AI guesswork
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <Check
                      className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-content-primary'>
                      Your complete birth chart, not just your sun sign
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <Check
                      className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-content-primary'>
                      2,000+ free educational articles
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <Check
                      className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-content-primary'>
                      A daily practice, not a notification machine
                    </span>
                  </li>
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Section 11: Pricing Teaser */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-surface-elevated/30'>
          <div className='max-w-2xl mx-auto text-center space-y-5'>
            <Reveal>
              <p className='text-sm text-content-muted'>
                Free to begin. <br /> Upgrade only if you want deeper,
                chart-specific insight.
              </p>
              <Heading
                as='h2'
                variant='h2'
                className='text-content-primary mt-4'
              >
                What’s included
              </Heading>
            </Reveal>
            <div className='grid md:grid-cols-2 gap-4 text-left text-sm text-content-muted'>
              <Reveal
                delayMs={0}
                className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-4 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
              >
                <p className='text-xs uppercase tracking-[0.2em] text-content-muted'>
                  Free includes
                </p>
                <ul className='mt-2 space-y-3'>
                  <li>
                    <p className='text-sm text-content-primary'>
                      Your complete birth chart
                    </p>
                    <p className='text-xs text-content-muted'>
                      See your core placements and foundational themes.
                    </p>
                  </li>
                  <li>
                    <p className='text-sm text-content-primary'>
                      Daily cosmic dashboard
                    </p>
                    <p className='text-xs text-content-muted'>
                      Today's transits, moon phase, tarot and crystal guidance,
                      grounded in the current sky.
                    </p>
                    <p className='text-[9px] text-content-muted mt-1'>
                      Interpreted at a general level. Chart-specific insight
                      included with Lunary+.
                    </p>
                  </li>
                  <li>
                    <p className='text-sm text-content-primary'>
                      Astral Guide chat
                    </p>
                    <p className='text-xs text-content-muted'>
                      Ask a few questions and receive context-aware guidance
                      grounded in your chart and the current sky.
                    </p>
                  </li>
                </ul>
              </Reveal>
              <Reveal
                delayMs={120}
                className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-4 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
              >
                <p className='text-xs uppercase tracking-[0.2em] text-content-muted'>
                  Your Personal Insight
                </p>
                <ul className='mt-2 space-y-3'>
                  <li>
                    <p className='text-sm text-content-primary'>
                      Personalised interpretations, not generic meanings
                    </p>
                    <p className='text-xs text-content-muted'>
                      Transits, tarot and lunar cycles interpreted through your
                      placements and ongoing themes.
                    </p>
                  </li>
                  <li>
                    <p className='text-sm text-content-primary'>
                      Guided rituals aligned to your chart and timing
                    </p>
                    <p className='text-xs text-content-muted'>
                      Practices shaped around your current transits and lunar
                      phases.
                    </p>
                  </li>
                  <li>
                    <p className='text-sm text-content-primary'>
                      Pattern tracking across time
                    </p>
                    <p className='text-xs text-content-muted'>
                      See recurring emotional themes, cycles, and lessons as
                      they unfold.
                    </p>
                  </li>
                </ul>
              </Reveal>
            </div>
            <Reveal delayMs={120} className='pt-2'>
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
            </Reveal>
          </div>
        </section>

        {/* Section 12: Why Lunary Feels Different */}
        <section className='py-12 md:py-16 px-4 md:px-6'>
          <Reveal className='max-w-2xl mx-auto text-center space-y-4'>
            <Heading as='h2' variant='h2'>
              Why Lunary feels different
            </Heading>
            <p className='text-sm md:text-base text-content-muted leading-relaxed'>
              Lunary uses real astronomical data, your natal placements and the
              current sky to build a deeper, personalised understanding over
              time.
            </p>
          </Reveal>
        </section>

        {/* Section 13: FAQs */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-surface-elevated/20'>
          <div className='max-w-3xl mx-auto'>
            <Reveal>
              <Heading
                as='h2'
                variant='h2'
                className='text-center mb-6 md:mb-12'
              >
                Common questions
              </Heading>
            </Reveal>
            <div className='space-y-3'>
              {homepageFAQs.map((faq, index) => (
                <Reveal key={faq.id} delayMs={index * 60}>
                  <FAQAccordion
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFAQId === faq.id}
                    onToggle={() =>
                      setOpenFAQId(openFAQId === faq.id ? null : faq.id)
                    }
                  />
                </Reveal>
              ))}
            </div>
            <Reveal delayMs={120} className='text-center mt-8'>
              <Link
                href='/faq'
                className='text-sm text-content-brand hover:text-content-secondary transition-colors inline-flex items-center gap-2'
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
            </Reveal>
          </div>
        </section>

        {/* Section 14: Final CTA */}
        <section className='py-12 md:py-20 px-4 md:px-6 border-t border-stroke-subtle/30'>
          <div className='max-w-2xl mx-auto text-center space-y-6'>
            <Reveal>
              <Heading as='h2' variant='h2'>
                Start understanding yourself better
              </Heading>
            </Reveal>

            <div className='max-w-md mx-auto text-left space-y-2'>
              <Reveal delayMs={0} className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-lunary-primary-400 flex-shrink-0' />
                <span className='text-sm text-content-muted'>
                  Complete birth chart in 60 seconds
                </span>
              </Reveal>
              <Reveal delayMs={60} className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-lunary-primary-400 flex-shrink-0' />
                <span className='text-sm text-content-muted'>
                  Daily guidance based on YOUR chart
                </span>
              </Reveal>
              <Reveal delayMs={120} className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-lunary-primary-400 flex-shrink-0' />
                <span className='text-sm text-content-muted'>
                  2,000+ free grimoire articles
                </span>
              </Reveal>
              <Reveal delayMs={180} className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-lunary-primary-400 flex-shrink-0' />
                <span className='text-sm text-content-muted'>
                  Pattern tracking over time
                </span>
              </Reveal>
              <Reveal delayMs={240} className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-lunary-primary-400 flex-shrink-0' />
                <span className='text-sm text-content-muted'>
                  No credit card required
                </span>
              </Reveal>
            </div>

            <Reveal
              delayMs={180}
              className='pt-4 flex flex-col gap-3 items-center'
            >
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
              <p className='text-xs text-content-muted mt-2'>
                Want to see features first? <br />
                <Link
                  href='/pricing'
                  className='text-lunary-primary-400 hover:text-content-secondary transition-colors'
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
            </Reveal>
          </div>
        </section>

        {/* Section 15: Newsletter */}
        <section className='py-12 md:py-20 px-4 md:px-6'>
          <Reveal className='max-w-4xl mx-auto'>
            <NewsletterSignupForm
              source='welcome_page'
              headline='Weekly cosmic recap, delivered'
              description='A calm weekly digest of the most meaningful sky events, written for people who want clarity without noise.'
              ctaLabel='Join the newsletter'
              successMessage='Check your inbox to confirm your subscription.'
              align='center'
            />
          </Reveal>
        </section>

        {/* Footer */}
        <div className='mt-auto'>
          <MarketingFooter />
        </div>
      </div>
    </>
  );
}
