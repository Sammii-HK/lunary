'use client';

import Link from 'next/link';
import { Hash, Star, Clock, Sparkles, Calendar, Heart } from 'lucide-react';

const NUMEROLOGY_SECTIONS = [
  {
    title: 'Angel Numbers',
    description: 'Repeating number sequences carrying divine messages',
    href: '/grimoire/angel-numbers',
    icon: <Sparkles className='w-6 h-6' />,
    examples: '111, 222, 333, 444, 555...',
  },
  {
    title: 'Life Path Numbers',
    description: 'Your core numerology number from your birth date',
    href: '/grimoire/life-path',
    icon: <Star className='w-6 h-6' />,
    examples: '1-9, 11, 22, 33',
  },
  {
    title: 'Mirror Hours',
    description: 'Synchronistic times like 11:11 and 12:21',
    href: '/grimoire/mirror-hours',
    icon: <Clock className='w-6 h-6' />,
    examples: '11:11, 12:21, 21:12...',
  },
  {
    title: 'Double Hours',
    description: 'Matching hour and minute like 12:12',
    href: '/grimoire/double-hours',
    icon: <Clock className='w-6 h-6' />,
    examples: '12:12, 13:13, 21:21...',
  },
  {
    title: 'Core Numbers',
    description: 'The fundamental single-digit numbers 1-9',
    href: '/grimoire/numerology/core-numbers/1',
    icon: <Hash className='w-6 h-6' />,
    examples: '1, 2, 3, 4, 5, 6, 7, 8, 9',
  },
  {
    title: 'Master Numbers',
    description: 'Powerful double-digit numbers with special meaning',
    href: '/grimoire/numerology/master-numbers/11',
    icon: <Star className='w-6 h-6' />,
    examples: '11, 22, 33',
  },
  {
    title: 'Expression Numbers',
    description: 'Calculated from your full name at birth',
    href: '/grimoire/numerology/expression/1',
    icon: <Hash className='w-6 h-6' />,
    examples: 'Your talents and abilities',
  },
  {
    title: 'Soul Urge Numbers',
    description: 'Your inner desires from vowels in your name',
    href: '/grimoire/numerology/soul-urge/1',
    icon: <Heart className='w-6 h-6' />,
    examples: "Your heart's desire",
  },
  {
    title: 'Karmic Debt Numbers',
    description: 'Numbers indicating karmic lessons to learn',
    href: '/grimoire/numerology/karmic-debt/13',
    icon: <Sparkles className='w-6 h-6' />,
    examples: '13, 14, 16, 19',
  },
  {
    title: 'Planetary Days',
    description: 'Each day of the week has planetary energy',
    href: '/grimoire/numerology/planetary-days/sunday',
    icon: <Calendar className='w-6 h-6' />,
    examples: 'Sunday (Sun), Monday (Moon)...',
  },
];

const Numerology = () => {
  return (
    <div className='space-y-8'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Numerology
        </h2>
        <p className='text-sm text-zinc-400'>
          Explore the mystical meaning of numbers and their influence on your
          life
        </p>
      </div>

      {/* Main Sections Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {NUMEROLOGY_SECTIONS.map((section) => (
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
                <p className='text-sm text-zinc-400 mb-2'>
                  {section.description}
                </p>
                <p className='text-xs text-zinc-400'>{section.examples}</p>
              </div>
              <span className='text-zinc-600 group-hover:text-lunary-primary-400 transition-colors'>
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Reference */}
      <section className='mt-8 p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'>
        <h3 className='text-lg font-medium text-zinc-100 mb-4'>
          How to Calculate Your Numbers
        </h3>
        <div className='space-y-4 text-sm'>
          <div>
            <p className='text-zinc-300 font-medium'>Life Path Number</p>
            <p className='text-zinc-400'>
              Add all digits of your birth date until you get a single digit (or
              11, 22, 33)
            </p>
          </div>
          <div>
            <p className='text-zinc-300 font-medium'>Personal Day Number</p>
            <p className='text-zinc-400'>
              Add your life path number to the current day's universal number
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export { Numerology };
