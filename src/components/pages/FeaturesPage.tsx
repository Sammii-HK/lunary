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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingFooter } from '@/components/MarketingFooter';
import { PricingComparisonTable } from '@/components/PricingComparisonTable';
import { CTA_COPY } from '@/lib/cta-copy';

export default function FeaturesPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-50'>
      {/* Header */}
      <header className='border-b border-zinc-800/30 py-4 px-4 md:px-6'>
        <div className='max-w-6xl mx-auto flex items-center justify-between'>
          <Link href='/' className='text-lg font-light text-zinc-100'>
            Lunary
          </Link>
          <div className='flex items-center gap-3'>
            <Button variant='ghost' asChild size='sm'>
              <Link href='/pricing'>Pricing</Link>
            </Button>
            <Button variant='lunary' asChild size='sm'>
              <Link href='/auth?signup=true'>Get started</Link>
            </Button>
          </div>
        </div>
      </header>

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
            title='Daily Cosmic Dashboard'
            description='Wake up knowing why today feels the way it does'
            features={[
              "Today's cosmic energy overview",
              'Moon phase with personal meaning',
              'Recommended spells aligned to today',
              'Crystal guidance for current energy',
              'Sky Now: real-time planetary positions',
              'Daily tarot card seeded from your chart',
            ]}
            freeTier='General cosmic energy + moon phase'
            paidTier='Full personalized dashboard'
            cta='See your dashboard'
            ctaHref='/auth?signup=true'
          />

          {/* Personal Horoscope */}
          <FeatureCard
            icon={<Sparkles className='w-5 h-5 md:w-6 md:h-6' />}
            title='Personal Daily Horoscope'
            description='Not your sun signNot includedYOUR specific planetary movements'
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
            title='Astral Guide'
            description='Ask questions, get context-aware answers'
            features={[
              'Knows your complete birth chart',
              'Aware of current transits',
              'Remembers your past tarot readings',
              'Understands current moon phase',
              'Example: "Why am I feeling restless today?"',
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
            title='Pattern Tracking & Insights'
            description='See recurring themes in your cosmic story'
            features={[
              'Analyzes your journal entries over time',
              'Connects patterns to transits and moon phases',
              'Shows themes like "Full Moons = relationship tension"',
              'Helps understand your personal cycles',
            ]}
            freeTier='Not included'
            paidTier='30-day pattern analysis'
            proTier='90-day deep pattern recognition'
            cta='Track your patterns'
            ctaHref='/pricing'
          />

          {/* Living Book of Shadows */}
          <FeatureCard
            icon={<BookOpen className='w-5 h-5 md:w-6 md:h-6' />}
            title='Living Book of Shadows'
            description='Your personal astrology journal'
            features={[
              'Record daily observations and reflections',
              'Track how transits affected you',
              'Note tarot insights and meanings',
              'Document moon phase experiences',
              'See "Last time Mars was here, you noted..."',
            ]}
            freeTier='Basic journaling'
            paidTier='Pattern detection + timeline view'
            proTier='Extended history (90 days) + export'
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
            title='The Grimoire'
            description='2,000+ free articles on astrology, tarot, and symbolism'
            features={[
              'Every planet in every sign',
              'All 12 houses explained',
              'Aspects and their meanings',
              'Complete tarot card library',
              'Moon phases and timing',
              'Crystals, herbs, correspondences',
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

        {/* Final CTA */}
        <section className='py-12 md:py-16 text-center space-y-6 border-t border-zinc-800/30'>
          <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
            Ready to begin?
          </h2>
          <p className='text-sm md:text-base text-zinc-400 max-w-xl mx-auto'>
            Start with your free birth chart and explore from there. Upgrade
            only when you're ready for deeper insights.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Button variant='lunary' asChild size='lg'>
              <Link href='/auth?signup=true'>{CTA_COPY.auth.createChart}</Link>
            </Button>
            <Button variant='outline' asChild size='lg'>
              <Link href='/pricing'>{CTA_COPY.pricing.comparePlans}</Link>
            </Button>
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
