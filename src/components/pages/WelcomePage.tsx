'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import {
  Telescope,
  Sparkles,
  Calendar,
  Map,
  MessagesSquare,
  Check,
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
} from '@/hooks/useABTestTracking';
import { Heading } from '../ui/Heading';
import { Testimonials } from '@/components/marketing/Testimonials';

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Lunary',
  url: 'https://lunary.app',
  description:
    "A personal astrology companion for understanding why today feels the way it does. Lunary connects today's sky to your full birth chart with real astronomy, reflection, tarot, transits, moon phases and free astrology education.",
  publisher: {
    '@type': 'Organization',
    name: 'Lunary',
    url: 'https://lunary.app',
  },
};

function toPlainText(value: string) {
  return value
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function LazyTestimonials() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '400px 0px',
  });

  return (
    <div ref={ref}>
      {inView ? (
        <Reveal>
          <Testimonials />
        </Reveal>
      ) : (
        <div className='h-24' aria-hidden='true' />
      )}
    </div>
  );
}

function LazyNewsletter() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '400px 0px',
  });

  return (
    <div ref={ref}>
      {inView ? (
        <NewsletterSignupForm
          source='welcome_page'
          headline='Weekly cosmic recap, delivered'
          description='A calm weekly digest of the most meaningful sky events, written for people who want clarity without noise.'
          ctaLabel='Join the newsletter'
          successMessage='Check your inbox to confirm your subscription.'
          align='center'
        />
      ) : (
        <div className='h-40' aria-hidden='true' />
      )}
    </div>
  );
}

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

  // Track active A/B test exposures without inflating page_viewed.
  useABTestTracking('welcome', 'page_viewed', [
    'homepage-features-test',
    'cta-copy-test',
  ]);

  // Get conversion tracker with A/B test metadata
  const { trackConversion } = useABTestConversion();

  const homepageFaqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homepageFAQs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: toPlainText(faq.answer),
      },
    })),
  };

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
      {renderJsonLd(homepageFaqStructuredData)}
      <ScrollProgressBar />

      <div className='min-h-screen bg-surface-base text-content-primary flex flex-col'>
        {/* Offer Banner */}
        <div className='bg-gradient-to-r from-layer-base/40 to-layer-raised/40 border-b border-lunary-primary-700/30 py-2 px-4'>
          <p className='mx-auto max-w-xl text-center text-xs md:text-sm leading-relaxed text-content-secondary'>
            Once in a blue moon, 32% off Pro Annual until 31 July.{' '}
            <Link
              href='/pricing?promo=BLUEMOON#pricing-plans'
              onClick={() =>
                handleCtaClick(
                  'offer_banner',
                  'Once in a blue moon, 32% off Pro Annual',
                  '/pricing?promo=BLUEMOON#pricing-plans',
                )
              }
              className='font-medium text-content-brand-accent underline-offset-2 hover:underline'
            >
              See the offer
            </Link>
          </p>
        </div>

        {/* Section 1: Hero */}
        <section className='relative px-4 md:px-6 pt-4 md:pt-16 pb-10 md:pb-16 bg-surface-base'>
          <Reveal
            animate={false}
            className='max-w-3xl mx-auto text-center space-y-6'
          >
            <p className='text-xs uppercase tracking-[0.2em] text-content-muted'>
              Personal astrology grounded in real astronomy
            </p>
            <Heading
              as='h1'
              variant='h1'
              className='max-w-md md:max-w-2xl mx-auto'
            >
              Astrology that actually understands your life.
            </Heading>
            <p className='text-sm md:text-base text-content-secondary leading-relaxed max-w-xl mx-auto'>
              When you wonder why you feel like this, Lunary checks today&apos;s
              sky against your full birth chart, not just your zodiac sign.
            </p>
            <p className='text-xs md:text-sm text-content-muted leading-relaxed max-w-lg mx-auto mt-[0.25rem]'>
              Today&apos;s sky affects your chart differently than everyone
              else&apos;s. Lunary helps you notice those patterns, learn what
              they mean, and stop relying on generic horoscopes.
            </p>
            <div className='flex flex-col gap-3 justify-center items-center pt-2 pb-0 md:pb-6'>
              {/* Value-first primary CTA: show the real chart (no account) before
                  the registration wall. Signup stays one tap away below. */}
              <Button variant='lunary-soft' size='lg' asChild>
                <Link
                  href='/free-chart?source=home_hero'
                  onClick={() =>
                    handleCtaClick(
                      'hero',
                      CTA_COPY.freeChart.seeChart,
                      '/free-chart?source=home_hero',
                    )
                  }
                >
                  {CTA_COPY.freeChart.seeChart}
                </Link>
              </Button>
              <Button variant='outline' size='lg' asChild>
                <Link
                  href='/auth?signup=true'
                  onClick={() =>
                    handleCtaClick(
                      'hero_signup',
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
                No credit card required. 7 days of Pro included.
              </p>
            </div>
          </Reveal>

          {/* Hero Mini App */}
          <Reveal
            delayMs={120}
            className='mt-8 mx-3 md:mx-0 md:mt-[33px] flex justify-center'
          >
            <OptimizedDemoIframe loading='lazy' preload={false} />
          </Reveal>
        </section>

        <section className='py-2 px-4 md:py-8 leading-relaxed max-w-3xl mx-auto text-center'>
          <p className='text-sm text-content-muted mb-6'>
            See Lunary in action with today&apos;s actual planetary positions.
            <br />
            Everything updates daily because the sky keeps moving, and your
            chart receives that timing in its own way.
          </p>
          <p className='text-content-muted leading-relaxed max-w-3xl mx-auto'>
            Lunary is designed for reflection rather than prediction. It helps
            you understand patterns, timing, and cycles as they unfold in your
            actual life.
          </p>
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
            <div className='max-w-2xl mx-auto text-left md:text-center space-y-4'>
              <Reveal delayMs={0}>
                <p className='text-content-muted'>
                  <span className='text-content-muted'>Generic apps:</span> Tell
                  millions of people the same thing
                </p>
                <p className='text-content-secondary'>
                  <span className='text-lunary-primary-400'>Lunary:</span>{' '}
                  Checks today&apos;s sky against your full chart
                </p>
              </Reveal>
              <Reveal delayMs={80}>
                <p className='text-content-muted'>
                  <span className='text-content-muted'>Generic apps:</span> Keep
                  you dependent on daily predictions
                </p>
                <p className='text-content-secondary'>
                  <span className='text-lunary-primary-400'>Lunary:</span>{' '}
                  Teaches you to read your own chart
                </p>
              </Reveal>
              <Reveal delayMs={160}>
                <p className='text-content-muted'>
                  <span className='text-content-muted'>Generic apps:</span>{' '}
                  Flatten astrology into fate
                </p>
                <p className='text-content-secondary'>
                  <span className='text-lunary-primary-400'>Lunary:</span> Uses
                  astrology for reflection, timing, and pattern recognition
                </p>
              </Reveal>
            </div>
            <Reveal delayMs={100} className='pt-4'>
              <p className='text-xs text-content-muted mb-4'>
                Plus: 2,000+ free education articles
              </p>
              <div className='flex flex-col items-center gap-3'>
                <Button variant='lunary-soft' asChild>
                  <Link
                    href='/auth?signup=true'
                    onClick={() =>
                      handleCtaClick(
                        'differentiation',
                        CTA_COPY.auth.createChart,
                        '/auth?signup=true',
                      )
                    }
                  >
                    {CTA_COPY.auth.createChart}
                  </Link>
                </Button>
                <p className='text-xs text-content-muted'>
                  No credit card required. 7 days of Pro included.
                </p>
                <Link
                  href='/features'
                  className='text-xs text-content-brand hover:text-content-secondary transition-colors'
                >
                  See all features
                </Link>
              </div>
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
                Built by someone tired of shallow astrology apps
              </Heading>
            </Reveal>
            <Reveal delayMs={240}>
              <p className='text-sm text-content-muted leading-relaxed max-w-2xl mx-auto'>
                "I wanted astrology that could answer the question underneath
                the horoscope: why does this feel so specific right now? Lunary
                started from that frustration: a solo build blending real
                astronomy, chart literacy, tarot, journaling, and pattern
                tracking into something calmer and more useful."
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
              The sky data is real. The point is self-understanding.
            </Heading>
            <p className='text-sm text-content-muted leading-relaxed max-w-2xl mx-auto'>
              Lunary&apos;s calculations are powered by Astronomy Engine — the
              same models (VSOP87) used by NASA&apos;s JPL Horizons, tested to
              within ±1 arcminute of the US Naval Observatory&apos;s data.
            </p>
            <p className='text-sm text-content-muted leading-relaxed max-w-2xl mx-auto'>
              No simplified sun-sign algorithms. No vague cosmic weather. The
              current sky is interpreted through your complete birth chart so
              the guidance has context.
            </p>
          </Reveal>
        </section>

        {/* Section 4: Educational Empowerment */}
        <section className='border-t border-stroke-subtle/30 py-12 md:py-16'>
          <div className='max-w-4xl mx-auto px-4 md:px-6 text-center space-y-6'>
            <Reveal>
              <Heading as='h2' variant='h2' className='text-content-primary'>
                Learn astrology through your own life
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
                Open Lunary when the day feels unusually intense, clear, tender,
                restless, or strange. Then see what the sky is touching in your
                chart.
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

        {/* Section 5: Who Lunary Is For */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-surface-elevated/30'>
          <div className='max-w-5xl mx-auto'>
            <Reveal className='text-center space-y-4 mb-10 md:mb-12'>
              <Heading as='h2' variant='h2' className='text-content-primary'>
                Who Lunary is for
              </Heading>
              <p className='md:text-lg text-content-muted leading-relaxed max-w-2xl mx-auto'>
                For the moments when astrology is not entertainment. It is a way
                to make sense of what is moving through you.
              </p>
            </Reveal>
            <div className='grid md:grid-cols-2 gap-6 md:gap-8 text-sm'>
              <Reveal
                delayMs={0}
                className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 md:p-6 space-y-2 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
              >
                <p className='text-sm md:text-base text-content-brand'>
                  "Why am I feeling like this lately?"
                </p>
                <p className='text-content-muted text-sm'>
                  Track the transits, moon phases, and repeating themes that
                  actually touch your chart.
                </p>
              </Reveal>
              <Reveal
                delayMs={80}
                className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 md:p-6 space-y-2 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
              >
                <p className='text-sm md:text-base text-content-brand'>
                  "Why do some transits hit harder than others?"
                </p>
                <p className='text-content-muted text-sm'>
                  Learn which placements and houses are being activated, then
                  connect the symbolism to lived experience.
                </p>
              </Reveal>
              <Reveal
                delayMs={160}
                className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 md:p-6 space-y-2 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
              >
                <p className='text-sm md:text-base text-content-brand'>
                  "Generic horoscopes never feel accurate"
                </p>
                <p className='text-content-muted text-sm'>
                  Your full birth chart matters. Lunary reads context before it
                  offers meaning.
                </p>
              </Reveal>
              <Reveal
                delayMs={240}
                className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/40 p-5 md:p-6 space-y-2 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'
              >
                <p className='text-sm md:text-base text-content-brand'>
                  "I want a practice, not another feed"
                </p>
                <p className='text-content-muted text-sm'>
                  Connect reflection, tarot, lunar cycles, and personal timing
                  without turning self-discovery into noise.
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
                  See how your chart responds in love, friendship, family, and
                  creative partnerships without reducing connection to a simple
                  match score.
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
        <LazyTestimonials />

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

        {/* Section 11: Pricing Teaser */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-surface-elevated/30'>
          <div className='max-w-2xl mx-auto text-center space-y-5'>
            <Reveal>
              <p className='text-sm text-content-muted'>
                Create your free birth chart. <br /> Upgrade only if you want
                deeper, chart-specific insight.
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
              <Button variant='lunary-soft' asChild>
                <Link
                  href='/auth?signup=true'
                  onClick={() =>
                    handleCtaClick(
                      'pricing-teaser',
                      CTA_COPY.auth.createChart,
                      '/auth?signup=true',
                    )
                  }
                >
                  {CTA_COPY.auth.createChart}
                </Link>
              </Button>
              <p className='text-xs text-content-muted mt-3'>
                No credit card required.{' '}
                <Link
                  href='/pricing'
                  className='text-content-brand hover:text-content-secondary transition-colors'
                >
                  Explore plans
                </Link>
              </p>
            </Reveal>
          </div>
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
            <LazyNewsletter />
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
