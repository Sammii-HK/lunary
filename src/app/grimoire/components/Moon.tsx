'use client';

import Link from 'next/link';
import { MoonPhaseIcon } from '@/components/MoonPhaseIcon';
import { annualFullMoons } from '@/constants/moon/annualFullMoons';
import {
  monthlyMoonPhases,
  MonthlyMoonPhaseKey,
} from '../../../../utils/moon/monthlyPhases';
import { months } from '../../../../utils/months';
import { stringToKebabCase } from '../../../../utils/string';
import {
  Moon as MoonIcon,
  Sun,
  Sparkles,
  Calendar,
  Star,
  BookOpenIcon,
  ArrowRight,
} from 'lucide-react';
import { Heading } from '@/components/ui/Heading';

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
        <Heading as='h2' variant='h2'>
          Moon Guides & Resources
        </Heading>
        <p className='text-sm text-content-muted'>
          Explore moon phases, full moon names, lunar wisdom, and moon rituals
        </p>
      </div>

      {/* Complete Guide Banner */}
      <Link
        href='/grimoire/guides/moon-phases-guide'
        className='block p-4 rounded-lg bg-gradient-to-r from-layer-base/30 to-lunary-rose-900/30 border border-lunary-primary-700 hover:border-lunary-primary-500 transition-colors group'
      >
        <div className='flex items-center justify-between'>
          <div>
            <Heading
              as='h3'
              variant='h4'
              className='flex items-center gap-2 text-content-brand group-hover:text-content-secondary'
            >
              <BookOpenIcon className='w-4 h-4 mr-2 text-content-brand' />
              Read the Complete Moon Phases Guide
            </Heading>
            <p className='text-sm text-content-muted'>
              Deep dive into lunar cycles, rituals, and working with moon energy
            </p>
          </div>
          <ArrowRight className='w-4 h-4 text-lunary-primary-400 group-hover:text-content-brand transition-colors' />
        </div>
      </Link>

      {/* Main Sections */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {MOON_SECTIONS.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className='block p-5 rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 hover:bg-surface-elevated/50 hover:border-lunary-primary-600 transition-all group'
          >
            <div className='flex items-start gap-4'>
              <span className='text-content-muted group-hover:text-lunary-primary-400 transition-colors mt-1'>
                {section.icon}
              </span>
              <div className='flex-1'>
                <Heading
                  as='h3'
                  variant='h4'
                  className='text-content-brand-secondary group-hover:text-content-brand-secondary'
                >
                  {section.title}
                </Heading>
                <p className='text-sm text-content-muted'>
                  {section.description}
                </p>
              </div>
              <span className='text-content-muted group-hover:text-lunary-primary-400 transition-colors'>
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Moon Phases Quick Reference */}
      <section className='space-y-4'>
        <Heading as='h2' variant='h2'>
          All Moon Phases
        </Heading>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          {moonPhases.map((phase) => {
            const phaseSlug = stringToKebabCase(phase);
            return (
              <Link
                key={phase}
                href={`/grimoire/moon/phases/${phaseSlug}`}
                className='block rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-3 hover:bg-surface-elevated/50 hover:border-lunary-primary-600 transition-all group text-center'
              >
                <div className='flex justify-center mb-1'>
                  <div className='w-12 h-12 rounded-full bg-surface-base/60 flex items-center justify-center'>
                    <MoonPhaseIcon
                      phase={phase as MonthlyMoonPhaseKey}
                      size={32}
                    />
                  </div>
                </div>
                <span className='text-sm text-content-secondary group-hover:text-content-brand transition-colors'>
                  {phase}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Full Moon Names */}
      <section className='space-y-4'>
        <Heading as='h2' variant='h2'>
          Full Moon Names by Month
        </Heading>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
          {fullMoonNames.map((moon, index) => {
            const monthSlug = months[index]?.toLowerCase() || 'january';
            return (
              <Link
                key={moon}
                href={`/grimoire/moon/full-moons/${monthSlug}`}
                className='block rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-3 hover:bg-surface-elevated/50 hover:border-lunary-primary-600 transition-all group'
              >
                <Heading
                  as='h3'
                  variant='h4'
                  className='text-content-primary group-hover:text-lunary-primary-400 mb-2'
                >
                  {annualFullMoons[moon as keyof typeof annualFullMoons].name}
                </Heading>
                <p className='text-xs text-content-muted'>{months[index]}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Moon;
