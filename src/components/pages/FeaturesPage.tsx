'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  MessageCircle,
  BookOpen,
  Sparkles,
  Map,
  Gem,
  BookText,
  Check,
} from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MarketingFooter } from '@/components/MarketingFooter';
import { PricingComparisonTable } from '@/components/PricingComparisonTable';
import { CTA_COPY } from '@/lib/cta-copy';
import { conversionTracking } from '@/lib/analytics';

export default function FeaturesPage() {
  // Track page view on mount
  useEffect(() => {
    conversionTracking.pageViewed('/features');
  }, []);

  // CTA click handler
  const handleCtaClick = (location: string, label: string, href: string) => {
    conversionTracking.ctaClicked({
      location,
      label,
      href,
      pagePath: '/features',
    });
  };

  return (
    <div className='min-h-fit bg-zinc-950 text-zinc-50'>
      {/* Hero */}
      <section className='py-12 md:py-16 px-4 md:px-6'>
        <div className='max-w-4xl mx-auto text-center space-y-4'>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100'>
            Your Complete Cosmic Toolkit
          </h1>
          <p className='text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
            From your daily morning briefing to deep pattern recognition,
            everything you need to understand yourself through the cosmos
          </p>
        </div>
      </section>

      {/* Quick Navigation */}
      <nav className='py-6 px-4 md:px-6 border-y border-zinc-800/30 sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-10'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex overflow-x-auto gap-4 pb-2 md:pb-0 md:justify-center scrollbar-hide'>
            <a
              href='#getting-started'
              className='text-xs md:text-sm text-zinc-400 hover:text-lunary-primary-300 transition-colors whitespace-nowrap'
            >
              Getting Started
            </a>
            <a
              href='#daily-practice'
              className='text-xs md:text-sm text-zinc-400 hover:text-lunary-primary-300 transition-colors whitespace-nowrap'
            >
              Daily Practice
            </a>
            <a
              href='#weekly-guidance'
              className='text-xs md:text-sm text-zinc-400 hover:text-lunary-primary-300 transition-colors whitespace-nowrap'
            >
              Weekly Guidance
            </a>
            <a
              href='#deep-exploration'
              className='text-xs md:text-sm text-zinc-400 hover:text-lunary-primary-300 transition-colors whitespace-nowrap'
            >
              Deep Exploration
            </a>
            <a
              href='#learning'
              className='text-xs md:text-sm text-zinc-400 hover:text-lunary-primary-300 transition-colors whitespace-nowrap'
            >
              Learning
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className='max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-20 md:space-y-24'>
        {/* Section 1: Getting Started */}
        <section
          id='getting-started'
          className='scroll-mt-20 space-y-8 md:space-y-12'
        >
          <div className='text-center space-y-3'>
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
              Getting Started
            </h2>
            <p className='text-sm md:text-base text-zinc-400 max-w-2xl mx-auto'>
              Everything begins with your birth chart
            </p>
          </div>

          {/* Birth Chart Calculator */}
          <FeatureCard
            icon={<Map className='w-5 h-5 md:w-6 md:h-6' />}
            title='Birth Chart Calculator'
            description='Create your complete natal chart with precise planetary positions'
            features={[
              'Visual chart wheel with all 10 planets',
              'Every planet in sign and house',
              'Major aspects explained in plain language',
              'Saved to your account for personalized features',
            ]}
            freeTier='Complete birth chart calculation'
            paidTier='Transit analysis + ongoing interpretations'
            cta='Calculate my chart'
            ctaHref='/auth?signup=true'
          />
        </section>

        {/* Section 2: Daily Practice */}
        <section
          id='daily-practice'
          className='scroll-mt-20 space-y-8 md:space-y-12'
        >
          <div className='text-center space-y-3'>
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
              Daily Practice
            </h2>
            <p className='text-sm md:text-base text-zinc-400 max-w-2xl mx-auto'>
              Your morning cosmic weather report
            </p>
          </div>

          {/* Daily Cosmic Dashboard */}
          <FeatureCard
            icon={<LayoutDashboard className='w-5 h-5 md:w-6 md:h-6' />}
            title='Your Daily 2-Minute Check-In'
            description='Know what cosmic energy is available today. Check-in takes 2 minutes.'
            features={[
              "Today's cosmic energy overview",
              'Moon phase with personal meaning',
              'Recommended spells aligned to today',
              'Crystal guidance for current energy',
              'Sky Now: real-time planetary positions',
              'Daily tarot card seeded from your chart',
              'Example: "Mars in your 10th house = career focus for the next 6 weeks"',
            ]}
            freeTier='General cosmic energy + moon phase'
            paidTier='Full personalized dashboard with interpretations'
            cta='See your dashboard'
            ctaHref='/auth?signup=true'
          />

          {/* Personal Horoscope */}
          <FeatureCard
            icon={<Sparkles className='w-5 h-5 md:w-6 md:h-6' />}
            title='Personal Daily Horoscope'
            description='Not your sun sign. YOUR specific planetary movements based on your full chart.'
            features={[
              'Based on current planets transiting YOUR natal chart',
              'Updates daily with real astronomical data',
              'Shows which house is being activated',
              'Explains what this means for YOUR life',
              'Universal vs Personal day numbers',
            ]}
            freeTier='2 major transits'
            paidTier='All 5-10 daily transits with full interpretations'
            cta="See today's transits"
            ctaHref='/auth?signup=true'
          />

          {/* Daily Tarot */}
          <FeatureCard
            icon={<Layers className='w-5 h-5 md:w-6 md:h-6' />}
            title='Daily Tarot Card'
            description='One card to reflect on each day'
            features={[
              'Card seeded from your Sun, Moon, Ascendant',
              'Changes daily at sunrise',
              'Keywords and interpretation',
              'Connected to current transits',
            ]}
            freeTier='Daily card with basic meaning'
            paidTier='Full interpretation + chart connections'
            cta='Draw your daily card'
            ctaHref='/auth?signup=true'
          />
        </section>

        {/* Section 3: Weekly Guidance */}
        <section
          id='weekly-guidance'
          className='scroll-mt-20 space-y-8 md:space-y-12'
        >
          <div className='text-center space-y-3'>
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
              Weekly Guidance
            </h2>
            <p className='text-sm md:text-base text-zinc-400 max-w-2xl mx-auto'>
              Deeper themes and upcoming shifts
            </p>
          </div>

          {/* Weekly Tarot */}
          <FeatureCard
            icon={<Layers className='w-5 h-5 md:w-6 md:h-6' />}
            title='Weekly Tarot Card'
            description='A deeper theme to work with all week'
            features={[
              'One card for the entire week',
              'More detailed interpretation',
              'Reflects broader energy patterns',
              'Updates every Monday',
            ]}
            freeTier='Not included'
            paidTier='Weekly card with full interpretation'
            cta='Get your weekly card'
            ctaHref='/pricing'
          />

          {/* Transit Calendar */}
          <FeatureCard
            icon={<Calendar className='w-5 h-5 md:w-6 md:h-6' />}
            title='Transit Calendar'
            description="See what's coming in YOUR chart"
            features={[
              'Upcoming transits for next 30 days',
              'Which ones affect YOUR natal planets',
              'Retrograde periods',
              'Eclipse seasons',
              'Major aspects forming',
            ]}
            freeTier='Next 3 upcoming transits'
            paidTier='30-day calendar view + alerts'
            cta="See what's ahead"
            ctaHref='/auth?signup=true'
          />
        </section>

        {/* Section 4: Deep Exploration */}
        <section
          id='deep-exploration'
          className='scroll-mt-20 space-y-8 md:space-y-12'
        >
          <div className='text-center space-y-3'>
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
              Deep Exploration
            </h2>
            <p className='text-sm md:text-base text-zinc-400 max-w-2xl mx-auto'>
              When you need more than daily guidance
            </p>
          </div>

          {/* Tarot Spreads */}
          <FeatureCard
            icon={<Layers className='w-5 h-5 md:w-6 md:h-6' />}
            title='Tarot Spread Library'
            description='Guided spreads for specific questions'
            features={[
              'Past/Present/Future spread',
              'Celtic Cross',
              'Relationship guidance',
              'Career decisions',
              'Moon phase reading',
              'Save your spreads for future reference',
            ]}
            freeTier='1 spread per month'
            paidTier='10 spreads per month'
            proTier='Unlimited spreads'
            cta='Pull a spread'
            ctaHref='/auth?signup=true'
          />

          {/* Astral Guide Chat */}
          <FeatureCard
            icon={<MessageCircle className='w-5 h-5 md:w-6 md:h-6' />}
            title='Your Personal Astrology Teacher (Pro)'
            description='Like having an astrology teacher who knows your birth chart'
            features={[
              'Knows your complete birth chart',
              'Aware of current transits affecting YOU',
              'References your journal entries and patterns',
              'Example: "Why do I always feel anxious during Mercury retrograde?"',
              'Example: "What does Mars in my 10th house mean for my career?"',
              'Different from ChatGPT: answers are specific to YOUR astrology, not generic',
            ]}
            freeTier='3 messages per day'
            paidTier='50 messages per day'
            proTier='300 messages per day'
            cta='Ask a question'
            ctaHref='/auth?signup=true'
          />

          {/* Pattern Tracking */}
          <FeatureCard
            icon={<Sparkles className='w-5 h-5 md:w-6 md:h-6' />}
            title='Your Personal Astrology Textbook'
            description="This is Lunary's unique feature. No other app tracks patterns from YOUR experience."
            features={[
              'After 6-8 weeks, patterns emerge from your data',
              'Example: "You always pull The Tower during Pluto transits"',
              'Example: "During the last 6 Full Moons, you journaled about relationships"',
              'NEW: Moon phase pattern detection (e.g., "creative energy during New Moon")',
              'NEW: Transit correlation tracking (how you respond to specific planetary movements)',
              'NEW: House activation patterns (life areas you focus on)',
              'This is personal proof astrology works for YOU specifically',
              'Your own data becomes your astrology education',
              'Next time that transit happens, you get a heads up based on YOUR history',
            ]}
            freeTier='Basic moon phase patterns (7 days)'
            paidTier='Enhanced pattern analysis (moon, transits, houses - 30 days)'
            proTier='Lifetime pattern history + AI insights + advanced correlations'
            cta='Track your patterns'
            ctaHref='/pricing'
          />

          {/* Living Book of Shadows */}
          <FeatureCard
            icon={<BookOpen className='w-5 h-5 md:w-6 md:h-6' />}
            title='Living Book of Shadows'
            description='Your personal astrology journal with intelligent mood tracking'
            features={[
              'Record daily observations and reflections',
              'NEW: Smart auto-mood tagging (instantly detects emotions from your writing)',
              'Track how transits affected you',
              'Note tarot insights and meanings',
              'Document moon phase experiences',
              'See "Last time Mars was here, you noted..."',
              'Pro: Enhanced detection catches subtle emotions & implicit feelings',
            ]}
            freeTier='Basic journaling (3 entries/month) + smart mood detection'
            paidTier='Unlimited journaling + pattern detection + timeline view'
            proTier='Enhanced mood detection + extended history (12 months) + export'
            cta='Start journaling'
            ctaHref='/auth?signup=true'
          />
        </section>

        {/* Section 5: Learning & Discovery */}
        <section id='learning' className='scroll-mt-20 space-y-8 md:space-y-12'>
          <div className='text-center space-y-3'>
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
              Learning & Discovery
            </h2>
            <p className='text-sm md:text-base text-zinc-400 max-w-2xl mx-auto'>
              Free education, always
            </p>
          </div>

          {/* Grimoire */}
          <FeatureCard
            icon={<BookText className='w-5 h-5 md:w-6 md:h-6' />}
            title='Your Free Astrology Education: 2,000+ Articles'
            description='100% free for everyone. This is our commitment to education. No paywall. No upsells.'
            features={[
              'Every planet in every sign',
              'All 12 houses explained',
              'Aspects and their meanings',
              'Complete tarot card library',
              'Moon phases and timing',
              'Crystals, herbs, correspondences',
              'After 6 months of daily practice + reading, most users can confidently read their own transits',
            ]}
            freeTier='100% Free - All educational content, no paywall'
            cta='Explore the Grimoire'
            ctaHref='/grimoire'
          />

          {/* Rituals & Spells */}
          <FeatureCard
            icon={<Gem className='w-5 h-5 md:w-6 md:h-6' />}
            title='Rituals & Cosmic Practices'
            description='Practical ways to work with cosmic energy'
            features={[
              'New Moon & Full Moon ceremonies',
              'Planetary day correspondences',
              'Crystal recommendations',
              'Herbal magic aligned to planets',
              'Personalized to YOUR chart and transits',
            ]}
            freeTier='Daily suggestions'
            paidTier='Personalized rituals + detailed instructions'
            proTier='Custom rituals'
            cta="Get today's ritual"
            ctaHref='/auth?signup=true'
          />
        </section>

        {/* Comparison Table */}
        <section className='py-12 md:py-20 border-t border-zinc-800/30'>
          <div className='text-center space-y-3 mb-12'>
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
              Compare Plans
            </h2>
            <p className='text-sm md:text-base text-zinc-400 max-w-2xl mx-auto'>
              See what's included at each tier
            </p>
          </div>
          <PricingComparisonTable />
        </section>

        {/* How Lunary Compares */}
        <section className='py-12 md:py-20 border-t border-zinc-800/30'>
          <div className='max-w-4xl mx-auto space-y-8'>
            <div className='text-center space-y-3'>
              <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
                Which astrology app is right for you?
              </h2>
              <p className='text-sm md:text-base text-zinc-400 max-w-2xl mx-auto'>
                Different tools for different needs
              </p>
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              {/* Lunary */}
              <div className='rounded-xl border border-lunary-primary-700/30 bg-lunary-primary-900/10 p-6 space-y-4'>
                <h3 className='text-lg font-medium text-lunary-primary-300'>
                  Choose Lunary if you want to:
                </h3>
                <ul className='space-y-2 text-sm text-zinc-300'>
                  <li className='flex items-start gap-2'>
                    <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                    <span>
                      Learn astrology through daily practice with your own chart
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                    <span>
                      Track patterns over time and see personal proof astrology
                      works for you
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                    <span>
                      Access 2,000+ free educational articles explaining every
                      concept
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                    <span>Integrate tarot with your astrological practice</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                    <span>
                      Build self-awareness through reflection and journaling
                    </span>
                  </li>
                </ul>
              </div>

              {/* Other Apps */}
              <div className='rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-6 space-y-4'>
                <h3 className='text-lg font-medium text-zinc-300'>
                  Other apps might be better if you want:
                </h3>
                <ul className='space-y-2 text-sm text-zinc-400'>
                  <li className='flex items-start gap-2'>
                    <span className='text-zinc-600 mt-0.5 flex-shrink-0'>
                      •
                    </span>
                    <span>
                      <span className='text-zinc-300'>Social features:</span>{' '}
                      Co-Star has friend compatibility and social sharing
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-zinc-600 mt-0.5 flex-shrink-0'>
                      •
                    </span>
                    <span>
                      <span className='text-zinc-300'>Technical analysis:</span>{' '}
                      TimePassages offers advanced chart calculations for
                      astrologers
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-zinc-600 mt-0.5 flex-shrink-0'>
                      •
                    </span>
                    <span>
                      <span className='text-zinc-300'>
                        Quick entertainment:
                      </span>{' '}
                      Many apps focus on bite-sized daily horoscopes
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-zinc-600 mt-0.5 flex-shrink-0'>
                      •
                    </span>
                    <span>
                      <span className='text-zinc-300'>Relationship focus:</span>{' '}
                      Some apps specialize in compatibility readings
                    </span>
                  </li>
                </ul>
                <p className='text-xs text-zinc-500 pt-2'>
                  Many people use multiple apps for different purposes
                </p>
              </div>
            </div>

            <div className='text-center pt-4'>
              <p className='text-sm text-zinc-400'>
                Lunary stands out for{' '}
                <span className='text-lunary-primary-300'>
                  pattern recognition
                </span>
                ,{' '}
                <span className='text-lunary-primary-300'>
                  educational depth
                </span>
                , and{' '}
                <span className='text-lunary-primary-300'>
                  tarot integration
                </span>
                . No other app combines these three.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-zinc-900/20 border-t border-zinc-800/30'>
          <div className='max-w-2xl mx-auto text-center space-y-6'>
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
              Ready to start your practice?
            </h2>

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
              <Button variant='lunary' asChild size='lg'>
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
              <p className='text-xs text-zinc-500'>
                Want to see pricing first?{' '}
                <Link
                  href='/pricing'
                  className='text-lunary-primary-400 hover:text-lunary-primary-200'
                  onClick={() =>
                    handleCtaClick(
                      'final-cta-secondary',
                      'Compare plans',
                      '/pricing',
                    )
                  }
                >
                  Compare plans
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>

      <MarketingFooter />
    </div>
  );
}

// Reusable Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  features,
  freeTier,
  paidTier,
  proTier,
  cta,
  ctaHref,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  freeTier: string;
  paidTier?: string;
  proTier?: string;
  cta: string;
  ctaHref: string;
}) {
  return (
    <div className='rounded-xl md:rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6'>
      {/* Header */}
      <div className='flex items-start gap-3 md:gap-4'>
        <div className='p-2 rounded-lg bg-lunary-primary-900/20 text-lunary-primary-300 flex-shrink-0'>
          {icon}
        </div>
        <div className='flex-1 min-w-0'>
          <h3 className='text-base md:text-lg lg:text-xl font-light text-zinc-100 mb-1.5 md:mb-2'>
            {title}
          </h3>
          <p className='text-xs md:text-sm lg:text-base text-zinc-300 leading-relaxed'>
            {description}
          </p>
        </div>
      </div>

      {/* Features List */}
      <ul className='space-y-1.5 md:space-y-2'>
        {features.map((feature, index) => (
          <li
            key={index}
            className='flex items-start gap-2 text-xs md:text-sm text-zinc-400'
          >
            <span className='text-lunary-primary-400 mt-0.5 flex-shrink-0'>
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* Pricing Tiers */}
      <div className='pt-3 md:pt-4 border-t border-zinc-800/30 space-y-1.5 md:space-y-2'>
        <div className='text-xs md:text-sm'>
          <span className='text-zinc-500'>Free:</span>{' '}
          <span className='text-zinc-300'>{freeTier}</span>
        </div>
        {paidTier && (
          <div className='text-xs md:text-sm'>
            <span className='text-zinc-500'>Lunary+:</span>{' '}
            <span className='text-zinc-300'>{paidTier}</span>
          </div>
        )}
        {proTier && (
          <div className='text-xs md:text-sm'>
            <span className='text-zinc-500'>Lunary+ Pro:</span>{' '}
            <span className='text-zinc-300'>{proTier}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <Button
        variant='lunary-soft'
        asChild
        className='w-full sm:w-auto'
        size='sm'
      >
        <Link href={ctaHref}>{cta}</Link>
      </Button>
    </div>
  );
}
