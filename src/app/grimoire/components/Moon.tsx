'use client';

import { annualFullMoons, FullMoon } from '@/constants/moon/annualFullMoons';
import {
  MonthlyMoonPhase,
  monthlyMoonPhases,
} from '../../../../utils/moon/monthlyPhases';
import { MoonPhase } from '../../../../utils/moon/moonPhases';
import { months } from '../../../../utils/months';
import { useEffect } from 'react';

const Moon = () => {
  const moonPhases = Object.keys(monthlyMoonPhases);
  const fullMoonNames = Object.keys(annualFullMoons);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

  return (
    <div className='space-y-8 pb-20'>
      <div className='mb-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Moon
        </h1>
        <p className='text-sm text-zinc-400'>
          Explore moon phases, full moon names, lunar wisdom, and moon rituals
        </p>
      </div>

      <section id='phases' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Moon Phases</h2>
        <div className='space-y-3'>
          {moonPhases.map((phase: string) => (
            <div
              key={phase}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <div className='text-sm text-zinc-300 leading-relaxed'>
                <span className='text-lg mr-2'>
                  {monthlyMoonPhases[phase as MoonPhase].symbol}
                </span>
                {monthlyMoonPhases[phase as MoonPhase].information}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id='full-moon-names' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Annual Full Moons</h2>
        <div className='space-y-3'>
          {fullMoonNames.map((fullMoon: string, index: number) => {
            const moon: FullMoon =
              annualFullMoons[fullMoon as keyof typeof annualFullMoons];
            return (
              <div
                key={moon.name}
                className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                  {moon.name} -{' '}
                  <span className='font-normal'>{months[index]}</span>
                </h3>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  {moon.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section id='rituals' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Moon Rituals by Phase
        </h2>
        <p className='text-sm text-zinc-400 mb-4'>
          Each moon phase offers unique energy for different types of magical
          work. Align your rituals with the lunar cycle for enhanced
          effectiveness.
        </p>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              New Moon Ritual
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Set intentions, begin new projects, plant seeds for future growth.
              Write down goals, create vision boards, or perform manifestation
              rituals.
            </p>
            <p className='text-xs text-zinc-400'>
              Best for: New beginnings, intention setting, planning
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Waxing Moon Ritual
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Build momentum, attract abundance, and work toward goals. Perform
              prosperity spells, growth rituals, or action-oriented magic.
            </p>
            <p className='text-xs text-zinc-400'>
              Best for: Growth, attraction, building energy
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Full Moon Ritual
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Release what no longer serves, celebrate achievements, charge
              crystals and tools. Perform gratitude rituals, release ceremonies,
              or charging rituals.
            </p>
            <p className='text-xs text-zinc-400'>
              Best for: Release, gratitude, charging, manifestation
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Waning Moon Ritual
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Let go, banish negativity, break bad habits, and clear obstacles.
              Perform banishing spells, cleansing rituals, or removal magic.
            </p>
            <p className='text-xs text-zinc-400'>
              Best for: Release, banishing, breaking habits, clearing
            </p>
          </div>
        </div>
      </section>

      <section id='faq' className='space-y-6'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Frequently Asked Questions
        </h2>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              What is a void of course moon?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              A void of course moon occurs when the moon makes no major aspects
              before changing signs. It's best to avoid starting new projects,
              making important decisions, or signing contracts during this time.
              Focus on reflection and completion instead.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              How do moon signs affect daily life?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              The moon changes signs every 2-3 days, influencing emotional
              energy and daily moods. Fire signs (Aries, Leo, Sagittarius) bring
              passion; Earth signs (Taurus, Virgo, Capricorn) bring stability;
              Air signs (Gemini, Libra, Aquarius) bring communication; Water
              signs (Cancer, Scorpio, Pisces) bring intuition.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Can I do moon rituals if I can't see the moon?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Yes, moon rituals work based on the lunar phase, not visibility.
              The moon's energy is present regardless of clouds or weather.
              Indoor rituals are just as effective, and you can enhance them
              with moon water or lunar imagery.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Moon;
