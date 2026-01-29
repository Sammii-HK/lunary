'use client';

import Link from 'next/link';
import {
  Telescope,
  Sparkles,
  NotebookPen,
  LayoutDashboard,
  MessageCircle,
  BookOpen,
  Layers,
  Calendar,
  Map,
  MessagesSquare,
  X,
  Check,
  Gem,
} from 'lucide-react';
import { MarketingFooter } from '@/components/MarketingFooter';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { NewsletterSignupForm } from '@/components/NewsletterSignupForm';
import { renderJsonLd } from '@/lib/schema';
import { MarketingMiniApp } from '@/components/marketing/MarketingMiniApp';
import ctaExamples from '@/lib/cta-examples.json';
import { CTA_COPY } from '@/lib/cta-copy';
import { FAQAccordion } from '@/components/FAQ';
import { getHomepageFAQs } from '@/lib/faq-helpers';
import { useState } from 'react';

const moonPhaseIconMap: Record<string, string> = {
  'New Moon': '/icons/moon-phases/new-moon.svg',
  'Waxing Crescent': '/icons/moon-phases/waxing-cresent-moon.svg',
  'First Quarter': '/icons/moon-phases/first-quarter.svg',
  'Waxing Gibbous': '/icons/moon-phases/waxing-gibbous-moon.svg',
  'Full Moon': '/icons/moon-phases/full-moon.svg',
  'Waning Gibbous': '/icons/moon-phases/waning-gibbous-moon.svg',
  'Last Quarter': '/icons/moon-phases/last-quarter.svg',
  'Waning Crescent': '/icons/moon-phases/waning-cresent-moon.svg',
};

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

  return (
    <>
      {renderJsonLd(structuredData)}
      <div className='min-h-screen bg-zinc-950 text-zinc-50 flex flex-col px-4 md:px-6'>
        {/* Section 1: Hero */}
        <section className='relative px-4 md:px-6 mt-4 pb-10 md:pt-16 md:pb-16 bg-zinc-950'>
          <div className='max-w-3xl mx-auto text-center space-y-6'>
            <p className='text-xs uppercase tracking-[0.2em] text-zinc-400'>
              Personal astrology grounded in real astronomy
            </p>
            <h1 className='text-2xl md:text-3xl lg:text-4xl font-light text-zinc-100'>
              Personal astrology that
              <br />
              actually understands you
            </h1>
            <p className='text-xs md:text-sm text-zinc-400 leading-relaxed max-w-3xl mx-auto'>
              Built around your full birth chart.
              <br />
              Lunary connects astrology, tarot and lunar cycles through real
              astronomical timing.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center pt-2 pb-0 md:pb-6'>
              <Button variant='lunary-soft' asChild>
                <Link href='/auth?signup=true'>
                  {CTA_COPY.auth.createChart}
                </Link>
              </Button>
              <Button variant='lunary' asChild>
                <Link href='/pricing'>{CTA_COPY.pricing.viewPricing}</Link>
              </Button>
            </div>
          </div>

          {/* Hero Mini App */}
          <div className='mt-8 md:mt-[72px] flex justify-center'>
            <MarketingMiniApp />
          </div>
        </section>

        <section className='py-2 px-4 md:py-8 leading-relaxed max-w-3xl mx-auto text-center'>
          <p className='text-xs text-zinc-500 mb-4'>
            Chart calculations are based on real astronomy.
            <br />
            The Astral Guide chat helps interpret your chart, patterns and the
            current sky.
          </p>
          <p className='text-sm text-zinc-400'>
            Free access includes your birth chart and Grimoire tools.
            <br />
            <span className='text-lunary-primary-200'>
              Upgrade for personalised interpretation and deeper analysis.
            </span>
            <br />
            Personal Day and Personal Year numbers are free; Lunary+ Pro
            includes the interpretation.
          </p>
          <p className='text-sm text-zinc-400 pb-8'>
            No card required. Takes under 2 minutes.
          </p>
          <p className='text-zinc-400 leading-relaxed max-w-3xl mx-auto mt-4'>
            Lunary is designed for reflection rather than prediction. Instead of
            offering fixed meanings or one-size-fits-all readings, it helps you
            understand patterns, timing, and cycles as they unfold, so insight
            can adapt as you do.
          </p>
          <a
            href='#how-it-works'
            className='text-sm text-lunary-primary-400 hover:text-lunary-primary-200 transition-colors'
          >
            See how Lunary works
          </a>
        </section>

        {/* Section 2: Problem Recognition */}
        <section className='py-12 md:py-16 px-4 md:px-6 border-t border-zinc-800/30'>
          <div className='max-w-4xl mx-auto text-center space-y-6'>
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
              Why most astrology apps never quite land
            </h2>
            <div className='max-w-2xl mx-auto text-center md:text-center'>
              <ul className='space-y-2 text-zinc-400'>
                <li>They reduce you to a sun sign.</li>
                <li>They repeat generic predictions.</li>
                <li>
                  They tell you what will happen instead of helping you
                  understand yourself.
                </li>
              </ul>
            </div>
            <div className='pt-2'>
              <Button variant='lunary' asChild>
                <Link href='/auth?signup=true'>
                  {CTA_COPY.auth.createChart}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Section 3: Social Proof Strip */}
        <section className='border-t border-zinc-800/30 py-6 md:py-8'>
          <div className='max-w-4xl mx-auto px-4 md:px-6 text-center'>
            <p className='text-base md:text-lg text-lunary-primary-100 font-light'>
              A calm alternative to noisy horoscope apps
            </p>
            <p className='text-zinc-400 mt-2 max-w-2xl mx-auto'>
              Lunary is not about predictions, fear, or telling you what will
              happen.
              <br />
              It is about understanding patterns, cycles, and emotional themes
              so you can move through life with clarity.
            </p>
            <p className='text-sm text-zinc-400 mt-5'>
              Built for people who want depth, not drama.
            </p>
            <p className='text-xs text-zinc-500 mt-2'>
              Built on precise astronomical calculations. Zero fear-based
              predictions.
            </p>
            <Link
              href='/about/methodology'
              className='text-xs text-lunary-primary-300 hover:text-lunary-primary-200 transition-colors inline-block mt-2'
            >
              Read the methodology
            </Link>
          </div>
        </section>

        {/* Section 4: Differentiator Block */}
        <section className='py-12 md:py-20 px-4 md:px-6'>
          <div className='max-w-4xl mx-auto text-center space-y-5'>
            <h2 className='text-2xl md:text-3xl lg:text-4xl font-light text-zinc-100 leading-tight'>
              Most astrology apps entertain you.
              <br />
              <span className='text-lunary-primary-300/80'>
                Lunary helps you understand yourself.
              </span>
            </h2>
            <p className='text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
              Most apps give generic sun sign predictions. Lunary uses your full
              birth chart, real astronomical data and intelligent interpretation
              to offer meaningful insight you can actually use.
            </p>
          </div>
        </section>

        {/* Section 5: Who Lunary Is For */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-zinc-900/30'>
          <div className='max-w-5xl mx-auto'>
            <div className='text-center space-y-4 mb-10 md:mb-12'>
              <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
                Who Lunary is for
              </h2>
              <p className='md:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
                Designed for people who want personal astrology that feels
                grounded, gentle and useful.
              </p>
            </div>
            <div className='grid md:grid-cols-2 gap-6 md:gap-8 text-xs md:text-sm'>
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
                <p className='text-zinc-300'>
                  People who want astrology grounded in real astronomy
                </p>
              </div>
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
                <p className='text-zinc-300'>
                  People tired of generic horoscopes
                </p>
              </div>
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
                <p className='text-zinc-300'>
                  People building a reflective daily practice
                </p>
              </div>
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
                <p className='text-zinc-300'>
                  People who journal, explore tarot, and track emotional
                  patterns
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
                <h3 className='text-lg text-zinc-100'>
                  Based on real astronomy
                </h3>
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
                <h3 className='text-lg text-zinc-100'>
                  Interpreted intelligently
                </h3>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Tarot, transits, moods and lunar cycles connected into one
                  clear message.
                </p>
              </div>
              <div className='text-center space-y-3'>
                <NotebookPen
                  className='w-8 h-8 text-blue-400/70 mx-auto'
                  strokeWidth={1.5}
                />
                <h3 className='text-lg text-zinc-100'>
                  Designed as a daily practice
                </h3>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Calm and reflective guidance that supports self understanding
                  rather than predicting your fate.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Feature Spotlights */}
        <section className='py-12 md:py-20 px-4 md:px-6'>
          <div className='max-w-5xl mx-auto space-y-12 md:space-y-20'>
            {/* Feature 1: Daily Cosmic Dashboard */}
            <div className='grid md:grid-cols-2 gap-6 md:gap-10 items-center'>
              <div className='space-y-3'>
                <LayoutDashboard
                  className='w-7 h-7 text-lunary-primary-400'
                  strokeWidth={1.5}
                />
                <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
                  Daily Cosmic Dashboard
                </h3>
                <p className='text-sm md:text-base text-zinc-300 leading-relaxed'>
                  Your morning briefing: moon phase, recommended spells, crystal
                  guidance, planetary positions, and daily tarot
                </p>
                <p className='text-xs text-zinc-500'>
                  Your birth chart is created and saved to your account.
                  Chart-based interpretation included with Lunary+.
                </p>
              </div>
              <div className='space-y-2'>
                <div className='py-3 px-4 border border-zinc-800 rounded-lg'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Image
                      src={
                        moonPhaseIconMap[ctaExamples.marketing.moonPhase.phase]
                      }
                      alt={ctaExamples.marketing.moonPhase.phase}
                      width={20}
                      height={20}
                    />
                    <span className='text-sm font-medium text-zinc-200'>
                      {ctaExamples.marketing.moonPhase.phase}
                    </span>
                  </div>
                  <p className='text-xs text-zinc-400'>
                    in {ctaExamples.marketing.moonPhase.sign}
                  </p>
                  <p className='text-xs text-zinc-600 mt-1'>
                    {ctaExamples.marketing.moonPhase.daysUntilNext} days until{' '}
                    {ctaExamples.marketing.moonPhase.nextPhase}
                  </p>
                </div>
                <div className='py-3 px-4 border border-zinc-800 rounded-lg'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Layers className='w-4 h-4 text-lunary-accent-300' />
                    <span className='text-sm font-medium text-zinc-200'>
                      Daily Card
                    </span>
                    <span className='text-xs bg-lunary-primary-900/20 text-lunary-primary-300 px-1.5 py-0.5 rounded'>
                      Personal
                    </span>
                  </div>
                  <p className='text-sm text-lunary-primary-300'>
                    {ctaExamples.marketing.tarotCard.name}
                  </p>
                  <p className='text-xs text-zinc-400'>
                    {ctaExamples.marketing.tarotCard.keywords}
                  </p>
                </div>
                <div className='py-3 px-4 border border-zinc-800 rounded-lg'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Gem className='w-4 h-4 text-lunary-accent-200' />
                    <span className='text-sm font-medium text-zinc-200'>
                      {ctaExamples.marketing.crystal.name}
                    </span>
                    <span className='text-xs bg-lunary-primary-900/20 text-lunary-primary-300 px-1.5 py-0.5 rounded'>
                      For you
                    </span>
                  </div>
                  <p className='text-xs text-zinc-400'>
                    {ctaExamples.marketing.crystal.meaning}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2: Astral Guide Chat */}
            <div className='grid md:grid-cols-2 gap-6 md:gap-10 items-center'>
              <div className='order-2 md:order-1 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
                <div className='space-y-3'>
                  <div className='flex justify-end'>
                    <div className='max-w-[80%]'>
                      <div className='rounded-2xl bg-lunary-primary-900 border border-lunary-primary-700 px-3.5 py-2.5 text-white text-sm leading-relaxed'>
                        Why am I feeling so restless today?
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-start'>
                    <div className='max-w-[85%]'>
                      <div className='rounded-2xl bg-zinc-800/80 border border-zinc-700/40 px-3.5 py-2.5 text-zinc-100 text-sm leading-relaxed'>
                        With Mars currently transiting your 3rd house and the
                        Moon in Gemini, your mind is seeking stimulation. This
                        is a good day for movement and short conversations.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='order-1 md:order-2 space-y-3'>
                <MessageCircle
                  className='w-7 h-7 text-lunary-primary-400'
                  strokeWidth={1.5}
                />
                <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
                  Astral Guide Chat
                </h3>
                <p className='text-sm md:text-base text-zinc-300 leading-relaxed'>
                  Ask questions and get context-aware answers grounded in your
                  chart and the current sky
                </p>
                <p className='text-xs text-zinc-500'>
                  Optional chat grounded in your chart. Your chart itself is
                  always astronomy-based.
                </p>
              </div>
            </div>

            {/* Feature 3: Living Book of Shadows */}
            <div className='grid md:grid-cols-2 gap-6 md:gap-10 items-center'>
              <div className='space-y-3'>
                <BookOpen
                  className='w-7 h-7 text-lunary-primary-400'
                  strokeWidth={1.5}
                />
                <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
                  Living Book of Shadows
                </h3>
                <p className='text-sm md:text-base text-zinc-300 leading-relaxed'>
                  Record your insights and moods in one place. Lunary highlights
                  the threads between your entries, transits and tarot pulls
                  over time
                </p>
              </div>
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
                <div className='space-y-2.5'>
                  <div className='p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/30'>
                    <p className='text-xs text-zinc-400 mb-0.5'>Nov 28</p>
                    <p className='text-sm text-zinc-300'>
                      Feeling introspective. The Star appeared again.
                    </p>
                  </div>
                  <div className='p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/30'>
                    <p className='text-xs text-zinc-400 mb-0.5'>Nov 25</p>
                    <p className='text-sm text-zinc-300'>
                      New Moon intention: trust the process.
                    </p>
                  </div>
                  <div className='text-xs text-lunary-primary-400/80 pl-1'>
                    Pattern: Hope themes recurring during Sagittarius season
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Tarot and Transit Patterns */}
            <div className='grid md:grid-cols-2 gap-6 md:gap-10 items-center'>
              <div className='order-2 md:order-1 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-zinc-400'>
                      Recurring themes
                    </span>
                    <span className='text-xs text-zinc-400'>Last 30 days</span>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-3'>
                      <div className='w-2 h-2 rounded-full bg-lunary-primary-400'></div>
                      <span className='text-sm text-zinc-300'>
                        Transformation
                      </span>
                      <div className='flex-1 h-1.5 bg-zinc-800 rounded-full'>
                        <div className='w-3/4 h-full bg-lunary-primary-500/60 rounded-full'></div>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className='w-2 h-2 rounded-full bg-lunary-primary-400'></div>
                      <span className='text-sm text-zinc-300'>
                        New beginnings
                      </span>
                      <div className='flex-1 h-1.5 bg-zinc-800 rounded-full'>
                        <div className='w-1/2 h-full bg-lunary-primary-500/60 rounded-full'></div>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className='w-2 h-2 rounded-full bg-lunary-primary-400'></div>
                      <span className='text-sm text-zinc-300'>
                        Inner wisdom
                      </span>
                      <div className='flex-1 h-1.5 bg-zinc-800 rounded-full'>
                        <div className='w-2/5 h-full bg-lunary-primary-500/60 rounded-full'></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='order-1 md:order-2 space-y-3'>
                <Layers
                  className='w-7 h-7 text-lunary-primary-400'
                  strokeWidth={1.5}
                />
                <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
                  Tarot & Pattern Tracking
                </h3>
                <p className='text-sm md:text-base text-zinc-300 leading-relaxed'>
                  Daily cards, weekly guidance, spread library, and pattern
                  recognition across time
                </p>
              </div>
            </div>

            {/* Hint at More Features */}
            <div className='mt-12 md:mt-16 text-center space-y-6'>
              <p className='text-sm md:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto'>
                Your complete cosmic toolkit includes birth chart calculator,
                transit calendar, ritual library, wheel of the year, and more
              </p>
              <Button variant='lunary' asChild>
                <Link href='/features'>
                  {CTA_COPY.navigation.exploreFeatures}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Section 8: Learn & Explore */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-zinc-900/30'>
          <div className='max-w-5xl mx-auto'>
            <div className='text-center space-y-4 mb-10 md:mb-14'>
              <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
                Learn & explore the cosmos
              </h2>
              <p className='text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
                New to astrology or already deep in it, you can start here.
                Lunary’s Grimoire is free to explore, with clear, grounded
                guides on astrology, tarot, moon phases and symbolism so you can
                understand the patterns shaping your life.
              </p>
            </div>
            <div className='grid md:grid-cols-2 gap-6 md:gap-8'>
              <Link
                href='/grimoire/astrology'
                className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6 space-y-3'
              >
                <h3 className='text-md md:text-lg text-zinc-100'>
                  Astrology, explained properly
                </h3>
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
                <h3 className='text-md md:text-lg text-zinc-100'>
                  Tarot beyond single-card pulls
                </h3>
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
                <h3 className='text-md md:text-lg text-zinc-100'>
                  Moon phases & ritual timing
                </h3>
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
                <h3 className='text-md md:text-lg text-zinc-100'>
                  Crystals, runes & symbolic systems
                </h3>
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
                Learning gives context. When you’re ready, Lunary connects that
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
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100 text-center mb-10 md:mb-14'>
              How it works
            </h2>
            <div className='grid md:grid-cols-3 gap-8 md:gap-10'>
              <div className='text-center space-y-3'>
                <Calendar
                  className='w-8 h-8 text-lunary-primary-400 mx-auto'
                  strokeWidth={1.5}
                />
                <div className='text-sm text-lunary-primary-400 font-medium'>
                  1
                </div>
                <h3 className='text-base text-zinc-100'>
                  Enter your birth details
                </h3>
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
                <h3 className='text-base text-zinc-100'>
                  Explore your cosmic map
                </h3>
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
                <h3 className='text-base text-zinc-100'>
                  Talk to your astral guide
                </h3>
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
                      Generic horoscopes
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <X
                      className='w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-zinc-400'>Sun sign only</span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <X
                      className='w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-zinc-400'>
                      Drama and predictions
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <X
                      className='w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-zinc-400'>
                      Notification spam
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
                      Interpreted through your complete birth chart
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <Check
                      className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-zinc-200'>
                      Connected tarot and lunar insights
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <Check
                      className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-zinc-200'>
                      Calm and reflective
                    </span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <Check
                      className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0'
                      strokeWidth={2}
                    />
                    <span className='text-sm text-zinc-200'>
                      A daily practice, not a feed
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
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
              What’s included
            </h2>
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
                <Link href='/pricing'>View plans</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Section 12: Why Lunary Feels Different */}
        <section className='py-12 md:py-16 px-4 md:px-6'>
          <div className='max-w-2xl mx-auto text-center space-y-4'>
            <h3 className='text-lg md:text-xl text-zinc-200'>
              Why Lunary feels different
            </h3>
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
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100 text-center mb-12'>
              Common questions
            </h2>
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
          <div className='max-w-2xl mx-auto text-center space-y-5'>
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
              Understanding yourself changes everything.
            </h2>
            <p className='text-zinc-400 leading-relaxed'>
              Lunary is here to walk that with you.
            </p>
            <div className='pt-2 flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <Button variant='lunary-soft' asChild>
                <Link href='/auth?signup=true'>
                  {CTA_COPY.auth.createChart}
                </Link>
              </Button>
              <Button variant='lunary' asChild>
                <Link href='/pricing'>{CTA_COPY.pricing.viewPricing}</Link>
              </Button>
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
