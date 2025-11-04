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
          Explore moon phases, full moon names, and lunar wisdom
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
    </div>
  );
};

export default Moon;
