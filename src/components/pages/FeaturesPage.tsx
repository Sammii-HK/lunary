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
  Users,
  Clock,
  Moon,
  Hash,
  Flame,
  Sunrise,
  Trophy,
  Target,
  MessageSquare,
  Gift,
} from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Heading';
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
          <Heading as='h1' variant='h1'>
            Your Complete Cosmic Toolkit
          </Heading>
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
              href='#connect'
              className='text-xs md:text-sm text-zinc-400 hover:text-lunary-primary-300 transition-colors whitespace-nowrap'
            >
              Connect
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
            <Heading as='h2' variant='h2'>
              Getting Started
            </Heading>
            <p className='text-sm md:text-base text-zinc-400 max-w-2xl mx-auto'>
              Everything begins with your birth chart
            </p>
          </div>

          {/* Birth Chart Calculator */}
          <FeatureCard
            icon={<Map className='w-5 h-5 md:w-6 md:h-6' />}
            title='Birth Chart Calculator'
            description='The most comprehensive free birth chart available - 24+ celestial bodies with educational interpretations'
            features={[
              'All 10 planets + 8 asteroids (Ceres, Pallas, Juno, Vesta, Hygiea, Pholus, Psyche, Eros)',
              'Planetary dignities (Rulership, Exaltation, Detriment, Fall)',
              'Chart ruler detection and analysis',
              'Chiron, Lilith, North & South Nodes',
              'Every placement explained in educational detail',
              'Visual chart wheel with all bodies',
              'Major aspects explained in plain language',
              '12 houses with Whole Sign system',
              'Elemental & modal balance analysis',
              'Saved to your account for personalized features',
            ]}
            freeTier='Complete birth chart with 24+ bodies - all features included'
            paidTier='Transit analysis + ongoing personalized interpretations'
            cta='Calculate my chart'
            ctaHref='/auth?signup=true'
          />

          {/* Personal Card */}
          <FeatureCard
            icon={<Layers className='w-5 h-5 md:w-6 md:h-6' />}
            title='Personal Card'
            description='Your tarot birth card - the archetype that represents your life path'
            features={[
              'Calculated from your birthdate',
              'Permanent card that represents your core energy',
              'Deeper understanding of your personal archetype',
              'Educational interpretation of your card',
              'See how it connects to your birth chart themes',
            ]}
            freeTier='Complete personal card with full interpretation'
            cta='Discover your card'
            ctaHref='/auth?signup=true'
          />

          {/* Numerology */}
          <FeatureCard
            icon={<Hash className='w-5 h-5 md:w-6 md:h-6' />}
            title='Life Path & Personal Year'
            description='Your numerology destiny - understand the numbers guiding your life'
            features={[
              'Life Path number - your core life purpose (e.g., "8")',
              'Personal Year - your current annual cycle (e.g., "4")',
              'Based on YOUR birth date, not the universal year',
              'Universal Day numbers for daily timing',
              'Understand your numerological journey',
            ]}
            freeTier='Complete numerology profile'
            cta='Calculate your numbers'
            ctaHref='/auth?signup=true'
          />
        </section>

        {/* Section 2: Daily Practice */}
        <section
          id='daily-practice'
          className='scroll-mt-20 space-y-8 md:space-y-12'
        >
          <div className='text-center space-y-3'>
            <Heading as='h2' variant='h2'>
              Daily Practice
            </Heading>
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
              "Today's ritual with completion tracking",
              'Recommended spells aligned to today',
              'Daily crystal guidance aligned to your chart',
              'Sky Now: real-time planetary positions',
              'Daily tarot card seeded from your chart',
              'Transit durations: "Mars in your 10th house = career focus for the next 6 weeks"',
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
            description='Not your sun sign. YOUR specific planetary movements based on your full chart—with exact timing.'
            features={[
              'Today\'s aspects to YOUR natal chart with duration: "15h left", "3w left", "2.3y left"',
              'Applying vs Separating status - know if energy is building or fading',
              'Orb precision to 0.1° - see exactly how strong each influence is',
              'Transit cycles: "This opposition recurs roughly every 84y"',
              'Theme connections: see how transits relate to your current life themes',
              'Shows which house is being activated and why it matters for YOU',
            ]}
            freeTier='2 major transits'
            paidTier='All daily transits with durations + applying/separating status'
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

          {/* Cosmic Score & Streaks */}
          <FeatureCard
            icon={<Flame className='w-5 h-5 md:w-6 md:h-6' />}
            title='Cosmic Score & Streaks'
            description='Your daily alignment score tracks how in tune you are with the cosmos — build streaks and unlock milestones'
            features={[
              'Daily score based on your chart, transits, and moon phase',
              'Build streaks by checking in every day',
              'Milestone celebrations at 7, 30, 60, 90, 180, and 365 days',
              'Share your achievements as beautiful social cards',
              'Leaderboard with your Cosmic Circle friends',
            ]}
            freeTier='Daily cosmic score + basic streaks'
            paidTier='Full score breakdown + milestone rewards'
            cta='Start your streak'
            ctaHref='/auth?signup=true'
          />

          {/* Morning & Evening Rituals */}
          <FeatureCard
            icon={<Sunrise className='w-5 h-5 md:w-6 md:h-6' />}
            title='Morning & Evening Rituals'
            description='Guided cosmic rituals to bookend your day — set intentions in the morning, reflect in the evening'
            features={[
              'Morning: set your daily intention aligned to current transits',
              'Morning: pull a guidance card + crystal color for the day',
              'Evening: gratitude reflection + mood tracking by moon phase',
              'Evening: review how your intention played out',
              'Dream intention setting for lunar dream work',
            ]}
            freeTier='Basic morning ritual'
            paidTier='Full morning + evening rituals with all features'
            cta='Try a ritual'
            ctaHref='/auth?signup=true'
          />
        </section>

        {/* Section 3: Weekly Guidance */}
        <section
          id='weekly-guidance'
          className='scroll-mt-20 space-y-8 md:space-y-12'
        >
          <div className='text-center space-y-3'>
            <Heading as='h2' variant='h2'>
              Weekly Guidance
            </Heading>
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
            description="See what's coming in YOUR chart - with exact durations and timing"
            features={[
              'Sky Now: every planet\'s position with time remaining: "Sun 14d left", "Moon 3h left"',
              'Your Next Transit: know exactly when the next shift happens',
              'Upcoming transits for next 30-90 days affecting YOUR natal planets',
              'Planet time in each zodiac sign: "Mars in Aquarius for 5w left"',
              'Retrograde periods with shadow phases',
              'Eclipse seasons and major aspects forming',
              '"Connects to your theme" - see how transits relate to your current patterns',
            ]}
            freeTier='2 transits (general descriptions only)'
            paidTier='All daily transits + Sky Now durations + 30-day calendar'
            proTier='90-day view + weekly email reports'
            cta="See what's ahead"
            ctaHref='/auth?signup=true'
          />

          {/* Weekly Cosmic Challenge */}
          <FeatureCard
            icon={<Trophy className='w-5 h-5 md:w-6 md:h-6' />}
            title='Weekly Cosmic Challenge'
            description='A new challenge every Monday based on current planetary transits — grow through cosmic practice'
            features={[
              'New challenge generated from active transits each week',
              'Daily check-ins with reflection prompts',
              'Earn XP for each day completed + bonus for a full week',
              'Build challenge streaks across weeks',
              'Community participation counter — practice together',
            ]}
            freeTier='Join weekly challenges + daily check-ins'
            paidTier='Full reflections + streak bonuses + XP rewards'
            cta="See this week's challenge"
            ctaHref='/auth?signup=true'
          />
        </section>

        {/* Section 4: Deep Exploration */}
        <section
          id='deep-exploration'
          className='scroll-mt-20 space-y-8 md:space-y-12'
        >
          <div className='text-center space-y-3'>
            <Heading as='h2' variant='h2'>
              Deep Exploration
            </Heading>
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

          {/* Astral Guide */}
          <FeatureCard
            icon={<MessageCircle className='w-5 h-5 md:w-6 md:h-6' />}
            title='Astral Guide - Your Personal Astrology Teacher'
            description='Like having an astrology teacher who knows your birth chart inside and out'
            features={[
              'Knows your complete birth chart - every placement, aspect, and house',
              'Aware of current transits affecting YOU specifically',
              'References your journal entries and patterns over time',
              'Example: "Why do I always feel anxious during Mercury retrograde?"',
              'Example: "What does Mars in my 10th house mean for my career?"',
              'Every answer is grounded in YOUR chart, not generic sun sign advice',
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
              'Example: "The Tower appeared 4 times during Mercury retrograde"',
              'Example: "Full Moon tends to bring reflective energy for you"',
              'Track your tarot cards over time and see what cosmic conditions were present',
              'View cosmic context for each card appearance (moon phase & planetary aspects)',
              'Personalized transit analysis for your frequently pulled cards',
              'This is personal proof astrology works for YOU specifically',
              'Your own data becomes your astrology education',
              'Suit distribution shows your elemental balance: "Cups appear in 40% of readings"',
            ]}
            freeTier='Tarot pattern tracking (last 7 days) + basic moon phase correlations'
            paidTier='Up to 6 months history + cosmic context for each card + personalized transit analysis'
            proTier='Up to 12 months + year-over-year analysis + advanced multi-dimensional pattern analysis'
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
              'Correlate your moods with moon phases over time',
              'Pro: Enhanced detection catches subtle emotions & implicit feelings',
            ]}
            freeTier='Basic journaling (3 entries/month) + smart mood detection'
            paidTier='Unlimited journaling + pattern detection + timeline view'
            proTier='Enhanced mood detection + extended history (12 months) + export'
            cta='Start journaling'
            ctaHref='/auth?signup=true'
          />

          {/* Manifestation Tracker */}
          <FeatureCard
            icon={<Target className='w-5 h-5 md:w-6 md:h-6' />}
            title='Manifestation Tracker'
            description='Set cosmic intentions aligned to planetary energy and track their progress through moon cycles'
            features={[
              'Set intentions with planetary alignment suggestions',
              'Track progress through new moon → full moon cycles',
              'Review intentions during your evening ritual',
              'Mark outcomes: manifested, in progress, released, or transformed',
              'See which cosmic conditions support your manifestations',
            ]}
            freeTier='Up to 3 active intentions'
            paidTier='Unlimited intentions + cosmic timing suggestions'
            cta='Set an intention'
            ctaHref='/auth?signup=true'
          />
        </section>

        {/* Section 5: Connect & Compare */}
        <section id='connect' className='scroll-mt-20 space-y-8 md:space-y-12'>
          <div className='text-center space-y-3'>
            <Heading as='h2' variant='h2'>
              Connect & Compare
            </Heading>
            <p className='text-sm md:text-base text-zinc-400 max-w-2xl mx-auto'>
              Friends, community spaces, and cosmic gifts
            </p>
          </div>

          {/* Circle + Synastry */}
          <FeatureCard
            icon={<Users className='w-5 h-5 md:w-6 md:h-6' />}
            title='Your Cosmic Circle'
            description='Connect with friends and see how your charts interact. Full synastry analysis shows exactly where you click—and where you clash.'
            features={[
              'Add friends and track compatibility percentages',
              'Full synastry analysis - all major aspects between your planets',
              'Element & modality balance comparisons',
              "View friends' complete birth charts",
              "Circle leaderboard showing who's staying consistent",
              'Activity feed: see when friends check in',
              'Celebrate milestones together',
            ]}
            freeTier='Add up to 5 friends with basic compatibility %'
            paidTier='Unlimited circle + full synastry analysis with all aspects'
            proTier='Best Times to Connect + Shared Cosmic Events'
            cta='Connect with friends'
            ctaHref='/auth?signup=true'
          />

          {/* Best Times to Connect */}
          <FeatureCard
            icon={<Clock className='w-5 h-5 md:w-6 md:h-6' />}
            title='Best Times to Connect'
            description='Know when cosmic timing supports connection. No more guessing when to reach out.'
            features={[
              "Analyzes BOTH people's transits simultaneously",
              'Shows optimal windows: "Feb 17-24: Great for deep conversations"',
              'Personalized timing for each relationship',
              'Know when to have important conversations',
              'Different from generic moon calendars—this is YOUR timing with THEM',
            ]}
            freeTier='Not included'
            paidTier='Not included'
            proTier='Full access to relationship timing windows'
            cta='See optimal timing'
            ctaHref='/pricing'
          />

          {/* Shared Cosmic Events */}
          <FeatureCard
            icon={<Moon className='w-5 h-5 md:w-6 md:h-6' />}
            title='Shared Cosmic Events'
            description='Moon phases that activate compatible houses for both of you'
            features={[
              'Example: "New Moon in Pisces activates your 5th and their 7th houses"',
              'Never miss cosmically significant moments together',
              'Relationship-specific lunar timing',
              'Great for planning dates, conversations, or projects together',
              'Shows upcoming shared events for each friend',
            ]}
            freeTier='Not included'
            paidTier='Not included'
            proTier='Full access to shared cosmic events'
            cta='Explore shared timing'
            ctaHref='/pricing'
          />

          {/* Community Spaces */}
          <FeatureCard
            icon={<MessageSquare className='w-5 h-5 md:w-6 md:h-6' />}
            title='Community Spaces'
            description='Anonymous discussion spaces that activate based on moon phases, retrogrades, and cosmic events'
            features={[
              'Moon phase circles — share during new moon, full moon, and more',
              'Retrograde survival spaces — tips and shared experiences',
              'Post anonymously or with your display name',
              'Share insights with others experiencing the same transits',
              'Auto-activated spaces based on current cosmic events',
            ]}
            freeTier='Join spaces + post insights'
            paidTier='All spaces + full community access'
            cta='Join the community'
            ctaHref='/auth?signup=true'
          />

          {/* Cosmic Gifting */}
          <FeatureCard
            icon={<Gift className='w-5 h-5 md:w-6 md:h-6' />}
            title='Cosmic Gifting'
            description='Send cosmic gifts to friends — tarot cards, crystal blessings, and celestial messages with a magical unwrap experience'
            features={[
              'Send tarot cards with personal messages',
              'Crystal energy blessings aligned to their chart',
              'Celestial messages with cosmic context',
              'Beautiful animated unwrap experience',
              'Gift history tracked in your Cosmic Circle',
            ]}
            freeTier='1 gift per week'
            paidTier='Unlimited gifting + exclusive gift types'
            cta='Send a gift'
            ctaHref='/auth?signup=true'
          />
        </section>

        {/* Section 6: Learning & Discovery */}
        <section id='learning' className='scroll-mt-20 space-y-8 md:space-y-12'>
          <div className='text-center space-y-3'>
            <Heading as='h2' variant='h2'>
              Learning & Discovery
            </Heading>
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
            <Heading as='h2' variant='h2'>
              Compare Plans
            </Heading>
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
              <Heading as='h2' variant='h2'>
                Which astrology app is right for you?
              </Heading>
              <p className='text-sm md:text-base text-zinc-400 max-w-2xl mx-auto'>
                Different tools for different needs
              </p>
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              {/* Lunary */}
              <div className='rounded-xl border border-lunary-primary-700/30 bg-lunary-primary-900/10 p-6 space-y-4'>
                <Heading as='h3' variant='h3'>
                  Choose Lunary if you want to:
                </Heading>
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

              {/* What Makes Lunary Different */}
              <div className='rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-6 space-y-4'>
                <Heading as='h3' variant='h3' className='text-zinc-300'>
                  What makes Lunary different:
                </Heading>
                <ul className='space-y-2 text-sm text-zinc-400'>
                  <li className='flex items-start gap-2'>
                    <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                    <span>
                      <span className='text-zinc-300'>Full synastry:</span> Most
                      apps show a basic % - we show every aspect between your
                      charts
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                    <span>
                      <span className='text-zinc-300'>
                        Real astronomical data:
                      </span>{' '}
                      24+ celestial bodies with precise calculations, not
                      simplified sun sign readings
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                    <span>
                      <span className='text-zinc-300'>
                        Pattern recognition:
                      </span>{' '}
                      Your data becomes your astrology textbook over time
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                    <span>
                      <span className='text-zinc-300'>Tarot + astrology:</span>{' '}
                      See cosmic context for every card you pull
                    </span>
                  </li>
                </ul>
                <p className='text-xs text-zinc-500 pt-2'>
                  Lunary teaches you to read your own chart - not just entertain
                  you
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
                  relationship timing
                </span>
                ,{' '}
                <span className='text-lunary-primary-300'>
                  educational depth
                </span>
                , and{' '}
                <span className='text-lunary-primary-300'>
                  tarot integration
                </span>
                . No other app combines all four.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className='py-12 md:py-20 px-4 md:px-6 bg-zinc-900/20 border-t border-zinc-800/30'>
          <div className='max-w-2xl mx-auto text-center space-y-6'>
            <Heading as='h2' variant='h2'>
              Ready to start your practice?
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
          <Heading as='h3' variant='h3' className='text-zinc-100'>
            {title}
          </Heading>
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
