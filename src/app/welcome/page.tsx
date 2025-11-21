import Link from 'next/link';
import { Calendar, Sparkles, MessageSquare } from 'lucide-react';
import { MarketingFooter } from '@/components/MarketingFooter';

export default function WelcomePage() {
  return (
    <main className='min-h-screen bg-zinc-950 text-zinc-50 flex flex-col'>
      <div className='max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-16 flex-1'>
        {/* Hero Section */}
        <section className='grid gap-10 md:grid-cols-2 items-center'>
          {/* Left: Text */}
          <div className='space-y-6'>
            <p className='text-sm text-zinc-400 uppercase tracking-wider'>
              A calm AI companion for cosmic self-reflection
            </p>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-light text-zinc-100 leading-tight'>
              Your AI-powered astral guide
            </h1>
            <p className='text-lg md:text-xl text-zinc-400 leading-relaxed'>
              Lunary blends real astronomy, birth chart astrology, tarot and
              lunar cycles into a personalised guide that learns your patterns
              and helps you understand how the sky mirrors your inner world.
            </p>
            <ul className='space-y-3 text-zinc-300'>
              <li className='flex items-start'>
                <span className='mr-3 text-purple-400'>•</span>
                <span>Daily energy insights based on your birth chart</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-3 text-purple-400'>•</span>
                <span>AI interpretations of transits, tarot and moods</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-3 text-purple-400'>•</span>
                <span>A living Book of Shadows that grows with you</span>
              </li>
            </ul>
            <div className='flex flex-col sm:flex-row gap-4 pt-4'>
              <Link
                href='/profile'
                className='inline-flex items-center justify-center rounded-full bg-purple-500 px-6 py-3 text-sm font-medium text-white hover:bg-purple-400 transition-colors'
              >
                Start free trial
              </Link>
              <Link
                href='/book-of-shadows'
                className='inline-flex items-center justify-center text-sm text-zinc-300 underline underline-offset-4 hover:text-zinc-100 transition-colors'
              >
                Meet your astral guide
              </Link>
              <Link
                href='/help'
                className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
              >
                Help
              </Link>
            </div>
          </div>

          {/* Right: Preview Card */}
          <div className='relative'>
            <div className='rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur p-6 shadow-[0_0_40px_rgba(139,92,246,0.2)]'>
              <div className='mb-4'>
                <h3 className='text-lg font-medium text-zinc-100 mb-3'>
                  Astral Guide
                </h3>
                <div className='space-y-4'>
                  {/* User message */}
                  <div className='flex justify-end'>
                    <div className='max-w-[80%]'>
                      <div className='rounded-2xl bg-purple-600/90 px-4 py-3 text-white text-sm leading-relaxed shadow-sm'>
                        How is today's energy affecting my creativity?
                      </div>
                    </div>
                  </div>
                  {/* Assistant messages */}
                  <div className='flex justify-start'>
                    <div className='max-w-[80%]'>
                      <div className='rounded-2xl bg-zinc-800/80 border border-zinc-700/40 px-4 py-3 text-zinc-100 text-sm leading-relaxed shadow-sm'>
                        Today's waning crescent in Scorpio invites you to
                        release what no longer serves you. With your Sun in
                        Scorpio, this is a powerful moment for deep
                        transformation.
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-start'>
                    <div className='max-w-[80%]'>
                      <div className='rounded-2xl bg-zinc-800/80 border border-zinc-700/40 px-4 py-3 text-zinc-100 text-sm leading-relaxed shadow-sm'>
                        The Two of Wands suggests you're at a crossroads. Trust
                        your intuition—your chart shows strong water placements
                        that guide you well.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex flex-wrap gap-2 pt-4 border-t border-zinc-800'>
                <span className='px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs'>
                  ☀ Sun in Scorpio
                </span>
                <span className='px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs'>
                  🌙 Waning Crescent in Scorpio
                </span>
                <span className='px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs'>
                  🃏 Two of Wands
                </span>
                <span className='px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs'>
                  💎 Cacoxenite Quartz
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* What you get inside Lunary */}
        <section className='space-y-6'>
          <div className='text-center max-w-3xl mx-auto mb-8'>
            <p className='text-lg text-zinc-400'>
              Everything in Lunary is built around your birth chart, current sky
              and emotional landscape. Here's what you unlock once you sign in.
            </p>
          </div>
          <div className='grid md:grid-cols-3 gap-6'>
            {/* Card 1 */}
            <div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-6 hover:border-purple-500/30 transition-colors'>
              <div className='mb-4'>
                <span className='inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs mb-3'>
                  Personalised
                </span>
                <h3 className='text-xl font-medium text-zinc-100 mb-2'>
                  Daily cosmic dashboard
                </h3>
                <p className='text-zinc-400 text-sm leading-relaxed'>
                  See today's moon phase, transits, tarot card and crystal – all
                  interpreted through your chart and current themes.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-6 hover:border-purple-500/30 transition-colors shadow-[0_0_40px_rgba(139,92,246,0.2)]'>
              <div className='mb-4'>
                <span className='inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs mb-3'>
                  AI-assisted
                </span>
                <h3 className='text-xl font-medium text-zinc-100 mb-2'>
                  Living Book of Shadows
                </h3>
                <p className='text-zinc-400 text-sm leading-relaxed'>
                  Save rituals, reflections and AI insights in one place. Let
                  Lunary weave patterns between your entries, transits and
                  tarot.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-6 hover:border-purple-500/30 transition-colors'>
              <div className='mb-4'>
                <span className='inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs mb-3'>
                  AI-powered
                </span>
                <h3 className='text-xl font-medium text-zinc-100 mb-2'>
                  Astral Guide chat
                </h3>
                <p className='text-zinc-400 text-sm leading-relaxed'>
                  Ask questions about how you're feeling, today's sky, your
                  relationships or creative energy – and get context-aware
                  answers grounded in your chart.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How Lunary works */}
        <section className='space-y-6'>
          <div className='grid md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
            {/* Step 1 */}
            <div className='text-center space-y-4'>
              <div className='w-16 h-16 mx-auto rounded-full border border-zinc-700 bg-zinc-900/50 flex items-center justify-center'>
                <Calendar
                  className='w-8 h-8 text-purple-400'
                  strokeWidth={1.5}
                />
              </div>
              <div className='space-y-2'>
                <div className='text-sm text-purple-400 font-medium'>
                  Step 1
                </div>
                <h3 className='text-lg font-medium text-zinc-100'>
                  Share your details
                </h3>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Enter your birth date, time and location so Lunary can
                  calculate your chart.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className='text-center space-y-4'>
              <div className='w-16 h-16 mx-auto rounded-full border border-zinc-700 bg-zinc-900/50 flex items-center justify-center'>
                <Sparkles
                  className='w-8 h-8 text-purple-400'
                  strokeWidth={1.5}
                />
              </div>
              <div className='space-y-2'>
                <div className='text-sm text-purple-400 font-medium'>
                  Step 2
                </div>
                <h3 className='text-lg font-medium text-zinc-100'>
                  Explore your cosmic map
                </h3>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Lunary maps your natal placements, current transits, tarot and
                  moon phases into a single view.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className='text-center space-y-4'>
              <div className='w-16 h-16 mx-auto rounded-full border border-zinc-700 bg-zinc-900/50 flex items-center justify-center'>
                <MessageSquare
                  className='w-8 h-8 text-purple-400'
                  strokeWidth={1.5}
                />
              </div>
              <div className='space-y-2'>
                <div className='text-sm text-purple-400 font-medium'>
                  Step 3
                </div>
                <h3 className='text-lg font-medium text-zinc-100'>
                  Talk to your astral guide
                </h3>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  Ask questions, explore patterns and receive gentle prompts and
                  rituals tailored to your energy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Lunary is different */}
        <section className='space-y-6 md:grid md:grid-cols-2 md:gap-10 md:items-start'>
          <div className='space-y-6'>
            <h2 className='text-3xl md:text-4xl font-light text-zinc-100'>
              Why Lunary is different from generic astrology apps
            </h2>
            <ul className='space-y-4 text-zinc-300'>
              <li className='flex items-start'>
                <span className='mr-3 text-purple-400'>•</span>
                <span>
                  Astrology, tarot and lunar cycles interpreted together – not
                  in isolation.
                </span>
              </li>
              <li className='flex items-start'>
                <span className='mr-3 text-purple-400'>•</span>
                <span>
                  An AI guide that responds to your birth chart, not random sun
                  sign content.
                </span>
              </li>
              <li className='flex items-start'>
                <span className='mr-3 text-purple-400'>•</span>
                <span>
                  A focus on calm reflection, not doom, drama or fatalistic
                  predictions.
                </span>
              </li>
              <li className='flex items-start'>
                <span className='mr-3 text-purple-400'>•</span>
                <span>
                  A living archive of your own cosmic patterns, moods and
                  rituals.
                </span>
              </li>
            </ul>
          </div>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-6'>
            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-medium text-zinc-400 mb-2'>
                  Most apps:
                </h3>
                <p className='text-sm text-zinc-500'>
                  Generic horoscopes, daily notifications, no context.
                </p>
              </div>
              <div>
                <h3 className='text-sm font-medium text-purple-400 mb-2'>
                  Lunary:
                </h3>
                <p className='text-sm text-zinc-300'>
                  A personalised, evolving practice grounded in the real sky
                  above you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Plans teaser */}
        <section className='space-y-4 text-center max-w-2xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-light text-zinc-100'>
            Choose the depth that feels right for you
          </h2>
          <p className='text-lg text-zinc-400'>
            Start exploring Lunary for free, then upgrade if you'd like deeper
            daily insights, AI-guided rituals and advanced readings.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center pt-4'>
            <Link
              href='/pricing'
              className='inline-flex items-center justify-center rounded-full bg-purple-500 px-6 py-3 text-sm font-medium text-white hover:bg-purple-400 transition-colors'
            >
              View plans
            </Link>
            <p className='text-sm text-zinc-500'>
              No commitment. Cancel any time.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className='py-10 text-center space-y-4 max-w-2xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-light text-zinc-100'>
            Ready to meet your astral guide?
          </h2>
          <p className='text-lg text-zinc-400'>
            Begin your free trial and let Lunary translate the sky into language
            your heart understands.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center pt-4'>
            <Link
              href='/profile'
              className='inline-flex items-center justify-center rounded-full bg-purple-500 px-6 py-3 text-sm font-medium text-white hover:bg-purple-400 transition-colors'
            >
              Start free trial
            </Link>
            <Link
              href='/'
              className='text-sm text-zinc-300 underline underline-offset-4 hover:text-zinc-100 transition-colors'
            >
              Open Lunary app
            </Link>
          </div>
        </section>
      </div>
      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </main>
  );
}
