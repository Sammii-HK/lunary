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

export default function WelcomePage() {
  return (
    <main className='min-h-screen bg-zinc-950 text-zinc-50 flex flex-col'>
      {/* Section 1: Hero */}
      <section className='relative px-4 md:px-6 pt-20 pb-10 md:pt-28 md:pb-16 bg-zinc-950'>
        <div className='max-w-3xl mx-auto text-center space-y-6'>
          <p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>
            A calm AI companion for cosmic self understanding
          </p>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 leading-tight tracking-tight'>
            Personalised astrology for clarity and self understanding
          </h1>
          <p className='text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
            Lunary brings together your birth chart, today's sky, tarot and
            lunar cycles to give you calm and personal daily guidance.
            Understand your emotions and patterns with insight that helps you
            move through your day with clarity.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center items-center pt-2'>
            <Button variant='lunary-solid' className='rounded-full' asChild>
              <Link href='/profile'>Start free trial</Link>
            </Button>
            <a
              href='#how-it-works'
              className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              See how it works
            </a>
          </div>
          <p className='text-sm text-zinc-500'>Free to begin. No commitment.</p>
        </div>

        {/* Hero Screenshot */}
        <div className='mt-[72px] flex justify-center'>
          <Image
            src='/lunary_hero.png'
            alt='Lunary app dashboard showing personalized cosmic insights'
            className='w-full max-w-[420px] md:max-w-[380px] h-auto rounded-2xl border border-zinc-700/50'
            width={380}
            height={827}
            style={{
              boxShadow:
                '0 18px 28px rgba(0, 0, 0, 0.28), 0 0 22px rgba(178, 126, 255, 0.18)',
            }}
          />
        </div>
      </section>

      {/* Section 2: Social Proof Strip */}
      <section className='border-t border-zinc-800/30 py-6 md:py-8'>
        <div className='max-w-4xl mx-auto px-4 md:px-6 text-center'>
          <p className='text-base md:text-lg text-zinc-300 font-light'>
            A calm alternative to noisy horoscope apps
          </p>
          <p className='text-sm text-zinc-500 mt-1.5'>
            Built for people who want depth, not drama.
          </p>
        </div>
      </section>

      {/* Section 3: Differentiator Block */}
      <section className='py-12 md:py-20 px-4 md:px-6'>
        <div className='max-w-4xl mx-auto text-center space-y-5'>
          <h2 className='text-2xl md:text-3xl lg:text-4xl font-light text-zinc-100 leading-tight'>
            Most astrology apps entertain you.
            <br />
            <span className='text-purple-300/80'>
              Lunary helps you understand yourself.
            </span>
          </h2>
          <p className='text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
            Most apps give generic sun sign predictions. Lunary uses your full
            birth chart, real astronomical data and intelligent interpretation
            to offer meaningful insight you can actually use.
          </p>
        </div>
      </section>

      {/* Section 4: Three Pillars */}
      <section className='py-12 md:py-20 px-4 md:px-6 bg-zinc-900/30'>
        <div className='max-w-5xl mx-auto'>
          <div className='grid md:grid-cols-3 gap-8 md:gap-10'>
            <div className='text-center space-y-3'>
              <Telescope
                className='w-8 h-8 text-purple-400 mx-auto'
                strokeWidth={1.5}
              />
              <h3 className='text-lg font-medium text-zinc-100'>
                Based on real astronomy
              </h3>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Every insight starts with the actual planetary positions and
                your precise chart.
              </p>
            </div>
            <div className='text-center space-y-3'>
              <Sparkles
                className='w-8 h-8 text-purple-400 mx-auto'
                strokeWidth={1.5}
              />
              <h3 className='text-lg font-medium text-zinc-100'>
                Interpreted intelligently
              </h3>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Tarot, transits, moods and lunar cycles connected into one clear
                message.
              </p>
            </div>
            <div className='text-center space-y-3'>
              <NotebookPen
                className='w-8 h-8 text-purple-400 mx-auto'
                strokeWidth={1.5}
              />
              <h3 className='text-lg font-medium text-zinc-100'>
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

      {/* Section 5: Feature Spotlights */}
      <section className='py-12 md:py-20 px-4 md:px-6'>
        <div className='max-w-5xl mx-auto space-y-12 md:space-y-20'>
          {/* Feature 1: Daily Cosmic Dashboard */}
          <div className='grid md:grid-cols-2 gap-6 md:gap-10 items-center'>
            <div className='space-y-3'>
              <LayoutDashboard
                className='w-7 h-7 text-purple-400'
                strokeWidth={1.5}
              />
              <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
                Daily Cosmic Dashboard
              </h3>
              <p className='text-base text-zinc-300'>
                Your whole sky, interpreted for you
              </p>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Today's transits, moon phase, tarot card and crystal, all
                personalised to your birth chart and current themes.
              </p>
            </div>
            <div className='space-y-2'>
              <div className='py-3 px-4 border border-zinc-800 rounded-lg'>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='text-lg'>🌘</span>
                  <span className='text-sm font-medium text-zinc-200'>
                    Waning Crescent
                  </span>
                </div>
                <p className='text-xs text-zinc-500'>in Scorpio</p>
                <p className='text-xs text-zinc-600 mt-1'>
                  3 days until New Moon
                </p>
              </div>
              <div className='py-3 px-4 border border-zinc-800 rounded-lg'>
                <div className='flex items-center gap-2 mb-1'>
                  <Layers className='w-4 h-4 text-purple-400' />
                  <span className='text-sm font-medium text-zinc-200'>
                    Daily Card
                  </span>
                  <span className='text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded'>
                    Personal
                  </span>
                </div>
                <p className='text-sm text-purple-300'>The Star</p>
                <p className='text-xs text-zinc-500'>
                  Hope • Renewal • Serenity
                </p>
              </div>
              <div className='py-3 px-4 border border-zinc-800 rounded-lg'>
                <div className='flex items-center gap-2 mb-1'>
                  <Gem className='w-4 h-4 text-purple-400' />
                  <span className='text-sm font-medium text-zinc-200'>
                    Amethyst
                  </span>
                  <span className='text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded'>
                    For you
                  </span>
                </div>
                <p className='text-xs text-zinc-500'>
                  Supports intuition during this reflective phase
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
                    <div className='rounded-2xl bg-purple-600/80 px-3.5 py-2.5 text-white text-sm leading-relaxed'>
                      Why am I feeling so restless today?
                    </div>
                  </div>
                </div>
                <div className='flex justify-start'>
                  <div className='max-w-[85%]'>
                    <div className='rounded-2xl bg-zinc-800/80 border border-zinc-700/40 px-3.5 py-2.5 text-zinc-100 text-sm leading-relaxed'>
                      With Mars currently transiting your 3rd house and the Moon
                      in Gemini, your mind is seeking stimulation. This is a
                      good day for movement and short conversations.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='order-1 md:order-2 space-y-3'>
              <MessageCircle
                className='w-7 h-7 text-purple-400'
                strokeWidth={1.5}
              />
              <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
                Astral Guide Chat
              </h3>
              <p className='text-base text-zinc-300'>
                Ask anything and receive personalised insight
              </p>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Ask about your emotions, energy, creativity or relationships.
                Lunary responds with context from your chart and the current
                sky.
              </p>
            </div>
          </div>

          {/* Feature 3: Living Book of Shadows */}
          <div className='grid md:grid-cols-2 gap-6 md:gap-10 items-center'>
            <div className='space-y-3'>
              <BookOpen className='w-7 h-7 text-purple-400' strokeWidth={1.5} />
              <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
                Living Book of Shadows
              </h3>
              <p className='text-base text-zinc-300'>
                Your reflections and patterns connected
              </p>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Record your insights and moods in one place. Lunary highlights
                the threads between your entries, transits and tarot pulls.
              </p>
            </div>
            <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
              <div className='space-y-2.5'>
                <div className='p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/30'>
                  <p className='text-xs text-zinc-500 mb-0.5'>Nov 28</p>
                  <p className='text-sm text-zinc-300'>
                    Feeling introspective. The Star appeared again.
                  </p>
                </div>
                <div className='p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/30'>
                  <p className='text-xs text-zinc-500 mb-0.5'>Nov 25</p>
                  <p className='text-sm text-zinc-300'>
                    New Moon intention: trust the process.
                  </p>
                </div>
                <div className='text-xs text-purple-400/80 pl-1'>
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
                  <span className='text-xs text-zinc-500'>Last 30 days</span>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 rounded-full bg-purple-400'></div>
                    <span className='text-sm text-zinc-300'>
                      Transformation
                    </span>
                    <div className='flex-1 h-1.5 bg-zinc-800 rounded-full'>
                      <div className='w-3/4 h-full bg-purple-500/60 rounded-full'></div>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 rounded-full bg-purple-400'></div>
                    <span className='text-sm text-zinc-300'>
                      New beginnings
                    </span>
                    <div className='flex-1 h-1.5 bg-zinc-800 rounded-full'>
                      <div className='w-1/2 h-full bg-purple-500/60 rounded-full'></div>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 rounded-full bg-purple-400'></div>
                    <span className='text-sm text-zinc-300'>Inner wisdom</span>
                    <div className='flex-1 h-1.5 bg-zinc-800 rounded-full'>
                      <div className='w-2/5 h-full bg-purple-500/60 rounded-full'></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='order-1 md:order-2 space-y-3'>
              <Layers className='w-7 h-7 text-purple-400' strokeWidth={1.5} />
              <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
                Tarot and Transit Patterns
              </h3>
              <p className='text-base text-zinc-300'>
                See the themes shaping your life
              </p>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Understand repeating cycles and ongoing lessons with clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: How It Works */}
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
                className='w-8 h-8 text-purple-400 mx-auto'
                strokeWidth={1.5}
              />
              <div className='text-sm text-purple-400 font-medium'>1</div>
              <h3 className='text-base font-medium text-zinc-100'>
                Enter your birth details
              </h3>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Lunary creates an accurate map of your chart.
              </p>
              <p className='text-xs text-zinc-500'>
                Sets the foundation for personalised insight.
              </p>
            </div>
            <div className='text-center space-y-3'>
              <Map
                className='w-8 h-8 text-purple-400 mx-auto'
                strokeWidth={1.5}
              />
              <div className='text-sm text-purple-400 font-medium'>2</div>
              <h3 className='text-base font-medium text-zinc-100'>
                Explore your cosmic map
              </h3>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Your personalised dashboard reveals today's themes and patterns.
              </p>
              <p className='text-xs text-zinc-500'>
                See what is influencing your day.
              </p>
            </div>
            <div className='text-center space-y-3'>
              <MessagesSquare
                className='w-8 h-8 text-purple-400 mx-auto'
                strokeWidth={1.5}
              />
              <div className='text-sm text-purple-400 font-medium'>3</div>
              <h3 className='text-base font-medium text-zinc-100'>
                Talk to your astral guide
              </h3>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Ask questions and receive grounded insight that supports your
                day.
              </p>
              <p className='text-xs text-zinc-500'>
                Your companion for clarity and reflection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Comparison */}
      <section className='py-12 md:py-20 px-4 md:px-6'>
        <div className='max-w-3xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-4 md:gap-6'>
            {/* Other Apps */}
            <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5 md:p-6'>
              <h3 className='text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5'>
                Other apps
              </h3>
              <ul className='space-y-3'>
                <li className='flex items-start gap-3'>
                  <X
                    className='w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0'
                    strokeWidth={2}
                  />
                  <span className='text-sm text-zinc-500'>
                    Generic horoscopes
                  </span>
                </li>
                <li className='flex items-start gap-3'>
                  <X
                    className='w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0'
                    strokeWidth={2}
                  />
                  <span className='text-sm text-zinc-500'>Sun sign only</span>
                </li>
                <li className='flex items-start gap-3'>
                  <X
                    className='w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0'
                    strokeWidth={2}
                  />
                  <span className='text-sm text-zinc-500'>
                    Drama and predictions
                  </span>
                </li>
                <li className='flex items-start gap-3'>
                  <X
                    className='w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0'
                    strokeWidth={2}
                  />
                  <span className='text-sm text-zinc-500'>
                    Notification spam
                  </span>
                </li>
              </ul>
            </div>

            {/* Lunary */}
            <div className='rounded-2xl border border-purple-500/30 bg-zinc-900/50 p-5 md:p-6'>
              <h3 className='text-sm font-medium text-purple-400 uppercase tracking-wider mb-5'>
                Lunary
              </h3>
              <ul className='space-y-3'>
                <li className='flex items-start gap-3'>
                  <Check
                    className='w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0'
                    strokeWidth={2}
                  />
                  <span className='text-sm text-zinc-200'>
                    Personalised to your complete birth chart
                  </span>
                </li>
                <li className='flex items-start gap-3'>
                  <Check
                    className='w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0'
                    strokeWidth={2}
                  />
                  <span className='text-sm text-zinc-200'>
                    Connected tarot and lunar insights
                  </span>
                </li>
                <li className='flex items-start gap-3'>
                  <Check
                    className='w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0'
                    strokeWidth={2}
                  />
                  <span className='text-sm text-zinc-200'>
                    Calm and reflective
                  </span>
                </li>
                <li className='flex items-start gap-3'>
                  <Check
                    className='w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0'
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

      {/* Section 8: Pricing Teaser */}
      <section className='py-12 md:py-20 px-4 md:px-6 bg-zinc-900/30'>
        <div className='max-w-2xl mx-auto text-center space-y-5'>
          <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
            Choose the depth that feels right for you
          </h2>
          <p className='text-base md:text-lg text-zinc-400 leading-relaxed'>
            Explore Lunary for free. Upgrade only if you want deeper
            interpretations and guided rituals.
          </p>
          <div className='pt-2'>
            <Link
              href='/pricing'
              className='inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-800/50 px-8 py-3.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600 transition-colors'
            >
              View plans
            </Link>
          </div>
        </div>
      </section>

      {/* Section 9: Why Lunary Feels Different */}
      <section className='py-12 md:py-16 px-4 md:px-6'>
        <div className='max-w-2xl mx-auto text-center space-y-4'>
          <h3 className='text-lg md:text-xl font-medium text-zinc-200'>
            Why Lunary feels different
          </h3>
          <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
            Lunary uses real astronomical data, your natal placements and the
            current sky to build a personalised understanding of your emotional
            landscape.
          </p>
        </div>
      </section>

      {/* Section 10: Final CTA */}
      <section className='py-12 md:py-20 px-4 md:px-6 bg-zinc-900/20'>
        <div className='max-w-2xl mx-auto text-center space-y-5'>
          <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
            Ready to understand yourself more deeply
          </h2>
          <p className='text-base md:text-lg text-zinc-400 leading-relaxed'>
            Begin your free trial and let Lunary translate the sky into clarity
            and personal meaning.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center items-center pt-2'>
            <Button variant='lunary-solid' className='rounded-full' asChild>
              <Link href='/profile'>Start free trial</Link>
            </Button>
            <Link
              href='/app'
              className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Open the app
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </main>
  );
}
