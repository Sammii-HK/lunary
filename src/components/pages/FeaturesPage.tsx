import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingBirthChart } from '@/components/marketing/MarketingBirthChart';
import ctaExamples from '@/lib/cta-examples.json';
import Image from 'next/image';
import { Layers, Gem } from 'lucide-react';

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

export default function FeaturesPage() {
  const { marketing } = ctaExamples;

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-50 flex flex-col px-4 md:px-6'>
      {/* Page Header */}
      <section className='relative px-4 md:px-6 mt-8 pb-10 md:pt-8 md:pb-16'>
        <div className='max-w-4xl mx-auto text-center space-y-4'>
          <h1 className='text-2xl md:text-3xl lg:text-4xl font-light text-zinc-100'>
            Explore the Features
          </h1>
          <p className='text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
            See how Lunary connects your birth chart with real astronomical data
            to create personalised insights that evolve with you.
          </p>
        </div>
      </section>

      {/* Meet Celeste Section */}
      <section className='py-12 md:py-16 px-4 md:px-6 border-t border-zinc-800/30'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center space-y-4 mb-10 md:mb-12'>
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
              Meet Celeste
            </h2>
            <p className='text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
              {marketing.persona.name} is our reference persona, born on{' '}
              {new Date(marketing.persona.birthDate).toLocaleDateString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                },
              )}{' '}
              at {marketing.persona.birthTime} in{' '}
              {marketing.persona.birthLocation}.
            </p>
            <p className='text-sm text-lunary-primary-300'>
              Sun in {marketing.persona.sunSign} • Moon in{' '}
              {marketing.persona.moonSign} • {marketing.persona.risingSign}{' '}
              Rising
            </p>
          </div>

          {/* Two-column layout: cosmic data + birth chart */}
          <div className='grid md:grid-cols-2 gap-8 md:gap-12 items-start'>
            {/* Left: Cosmic data cards */}
            <div className='space-y-3'>
              <h3 className='text-lg text-zinc-200 mb-4'>
                Today's Cosmic Climate
              </h3>

              {/* Moon Phase card */}
              <div className='py-3 px-4 border border-zinc-800 rounded-lg bg-zinc-900/40'>
                <div className='flex items-center gap-2 mb-1'>
                  <Image
                    src={moonPhaseIconMap[marketing.moonPhase.phase]}
                    alt={marketing.moonPhase.phase}
                    width={20}
                    height={20}
                  />
                  <span className='text-sm font-medium text-zinc-200'>
                    {marketing.moonPhase.phase}
                  </span>
                </div>
                <p className='text-xs text-zinc-400'>
                  in {marketing.moonPhase.sign}
                </p>
                <p className='text-xs text-zinc-600 mt-1'>
                  {marketing.moonPhase.daysUntilNext} days until{' '}
                  {marketing.moonPhase.nextPhase}
                </p>
                <div className='mt-2 pt-2 border-t border-zinc-800/50'>
                  <p className='text-xs text-zinc-500'>
                    {marketing.moonPhase.element} •{' '}
                    {marketing.moonPhase.modality} • Ruled by{' '}
                    {marketing.moonPhase.rulingPlanet}
                  </p>
                </div>
              </div>

              {/* Tarot card */}
              <div className='py-3 px-4 border border-zinc-800 rounded-lg bg-zinc-900/40'>
                <div className='flex items-center gap-2 mb-1'>
                  <Layers className='w-4 h-4 text-lunary-accent-300' />
                  <span className='text-sm font-medium text-zinc-200'>
                    Today's Card
                  </span>
                </div>
                <p className='text-sm text-lunary-primary-300'>
                  {marketing.tarotCard.name}
                </p>
                <p className='text-xs text-zinc-400'>
                  {marketing.tarotCard.keywords}
                </p>
              </div>

              {/* Crystal card */}
              <div className='py-3 px-4 border border-zinc-800 rounded-lg bg-zinc-900/40'>
                <div className='flex items-center gap-2 mb-1'>
                  <Gem className='w-4 h-4 text-lunary-accent-200' />
                  <span className='text-sm font-medium text-zinc-200'>
                    Crystal Focus
                  </span>
                </div>
                <p className='text-sm text-zinc-300'>
                  {marketing.crystal.name}
                </p>
                <p className='text-xs text-zinc-400'>
                  {marketing.crystal.meaning}
                </p>
              </div>

              {/* Today's theme */}
              <div className='py-3 px-4 border border-zinc-800 rounded-lg bg-zinc-900/40'>
                <p className='text-xs text-zinc-500 mb-1'>Today's Theme</p>
                <p className='text-sm text-zinc-300'>{marketing.todayTheme}</p>
              </div>
            </div>

            {/* Right: Birth chart */}
            <div>
              <h3 className='text-lg text-zinc-200 mb-4'>Birth Chart</h3>
              <div className='border border-zinc-800 rounded-lg bg-zinc-900/40 p-4'>
                <MarketingBirthChart />
              </div>
              <p className='text-xs text-zinc-500 mt-3 text-center'>
                Every insight Lunary generates is grounded in{' '}
                {marketing.persona.name}'s unique chart placements and current
                astronomical positions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it updates section */}
      <section className='py-12 md:py-16 px-4 md:px-6 bg-zinc-900/30'>
        <div className='max-w-3xl mx-auto text-center space-y-4'>
          <h2 className='text-xl md:text-2xl font-light text-zinc-100'>
            Live data, updated monthly
          </h2>
          <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
            The cosmic data you see above is generated from real astronomical
            calculations. Around the 20th of each month, when the Sun typically
            changes signs, Lunary recalculates transits, moon phases, and
            personalised interpretations. No generic horoscopes — just real
            astronomy connected to your chart.
          </p>
          <p className='text-xs text-zinc-500'>
            Data last generated:{' '}
            {new Date(ctaExamples.generatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-12 md:py-20 px-4 md:px-6'>
        <div className='max-w-2xl mx-auto text-center space-y-5'>
          <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
            Ready to explore your own chart?
          </h2>
          <p className='text-zinc-400 leading-relaxed'>
            Create your birth chart in under 2 minutes and start receiving
            personalised cosmic insights grounded in real astronomy.
          </p>
          <div className='pt-2 flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Button variant='lunary-soft' asChild>
              <Link href='/auth?signup=true'>Create your birth chart</Link>
            </Button>
            <Button variant='lunary' asChild>
              <Link href='/pricing'>See what Lunary+ unlocks</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </div>
  );
}
