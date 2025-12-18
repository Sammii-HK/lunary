'use client';

import Link from 'next/link';
import { annualFullMoons } from '@/constants/moon/annualFullMoons';
import { monthlyMoonPhases } from '../../../../utils/moon/monthlyPhases';
import { MoonPhase } from '../../../../utils/moon/moonPhases';
import { months } from '../../../../utils/months';
import { stringToKebabCase } from '../../../../utils/string';
import { Moon as MoonIcon, Sun, Sparkles, Calendar, Star } from 'lucide-react';

const MOON_SECTIONS = [
  {
    title: 'Moon Phases',
    description: 'New Moon, Full Moon, and everything in between',
    href: '/grimoire/moon/phases/new-moon',
    icon: <MoonIcon className='w-6 h-6' />,
  },
  {
    title: 'Full Moon Names',
    description: "Traditional names for each month's full moon",
    href: '/grimoire/moon/full-moons/january',
    icon: <MoonIcon className='w-6 h-6' />,
  },
  {
    title: 'Moon Signs',
    description: 'How the Moon in each zodiac sign affects emotions',
    href: '/grimoire/moon/signs',
    icon: <Star className='w-6 h-6' />,
  },
  {
    title: 'Moon Rituals',
    description: 'Ceremonies and practices for lunar cycles',
    href: '/grimoire/moon/rituals',
    icon: <Sparkles className='w-6 h-6' />,
  },
  {
    title: 'Eclipses',
    description: 'Solar and lunar eclipse meanings',
    href: '/grimoire/eclipses/solar',
    icon: <Sun className='w-6 h-6' />,
  },
  {
    title: 'Moon in Signs',
    description: 'The Moon transiting through each zodiac sign',
    href: '/grimoire/moon-in/aries',
    icon: <Calendar className='w-6 h-6' />,
  },
];

const Moon = () => {
  const moonPhases = Object.keys(monthlyMoonPhases);
  const fullMoonNames = Object.keys(annualFullMoons);

  return (
    <div className='space-y-8'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Moon
        </h2>
        <p className='text-sm text-zinc-400'>
          Explore moon phases, full moon names, lunar wisdom, and moon rituals
        </p>
      </div>

      {/* Complete Guide Banner */}
      <Link
        href='/grimoire/guides/moon-phases-guide'
        className='block p-4 rounded-lg bg-gradient-to-r from-lunary-primary-900/30 to-lunary-rose-900/30 border border-lunary-primary-700 hover:border-lunary-primary-500 transition-colors group'
      >
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-medium text-lunary-primary-300 group-hover:text-lunary-primary-200 transition-colors'>
              📖 Read the Complete Moon Phases Guide
            </h3>
            <p className='text-sm text-zinc-400'>
              Deep dive into lunar cycles, rituals, and working with moon energy
            </p>
          </div>
          <span className='text-lunary-primary-400 group-hover:text-lunary-primary-300 transition-colors'>
            →
          </span>
        </div>
      </Link>

      {/* Main Sections */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {MOON_SECTIONS.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className='block p-5 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <div className='flex items-start gap-4'>
              <span className='text-zinc-400 group-hover:text-lunary-primary-400 transition-colors mt-1'>
                {section.icon}
              </span>
              <div className='flex-1'>
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors mb-1'>
                  {section.title}
                </h3>
                <p className='text-sm text-zinc-400'>{section.description}</p>
              </div>
              <span className='text-zinc-600 group-hover:text-lunary-primary-400 transition-colors'>
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Moon Phases Quick Reference */}
      <section className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>All Moon Phases</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          {moonPhases.map((phase: string) => {
            const phaseSlug = stringToKebabCase(phase);
            return (
              <Link
                key={phase}
                href={`/grimoire/moon/phases/${phaseSlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group text-center'
              >
                <span className='text-2xl block mb-1'>
                  {monthlyMoonPhases[phase as MoonPhase].symbol}
                </span>
                <span className='text-sm text-zinc-300 group-hover:text-lunary-primary-300 transition-colors'>
                  {phase}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Full Moon Names */}
      <section className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Full Moon Names by Month
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
          {fullMoonNames.map((moon, index) => {
            const monthSlug = months[index]?.toLowerCase() || 'january';
            return (
              <Link
                key={moon}
                href={`/grimoire/moon/full-moons/${monthSlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
              >
                <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-400 transition-colors'>
                  {annualFullMoons[moon as keyof typeof annualFullMoons].name}
                </h3>
                <p className='text-xs text-zinc-400'>{months[index]}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Moon;
