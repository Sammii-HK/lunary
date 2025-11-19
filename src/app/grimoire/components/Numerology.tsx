'use client';

import Link from 'next/link';
import { useEffect } from 'react';

const Numerology = () => {
  const coreNumbers = [
    {
      number: 1,
      meaning: 'Leadership & New Beginnings',
      traits: 'Independent, pioneering, ambitious',
      day: 'Starting projects, taking initiative, leadership activities',
    },
    {
      number: 2,
      meaning: 'Cooperation & Balance',
      traits: 'Diplomatic, sensitive, cooperative',
      day: 'Partnerships, teamwork, diplomatic approaches',
    },
    {
      number: 3,
      meaning: 'Creativity & Communication',
      traits: 'Creative, expressive, optimistic',
      day: 'Artistic endeavors, social activities, communication',
    },
    {
      number: 4,
      meaning: 'Stability & Foundation',
      traits: 'Practical, organized, reliable',
      day: 'Planning, organizing, building foundations',
    },
    {
      number: 5,
      meaning: 'Freedom & Adventure',
      traits: 'Adventurous, curious, versatile',
      day: 'Travel, new experiences, embracing change',
    },
    {
      number: 6,
      meaning: 'Nurturing & Responsibility',
      traits: 'Caring, responsible, family-oriented',
      day: 'Family matters, healing, acts of service',
    },
    {
      number: 7,
      meaning: 'Spiritual Insight & Wisdom',
      traits: 'Intuitive, analytical, mystical',
      day: 'Meditation, study, spiritual pursuits',
    },
    {
      number: 8,
      meaning: 'Material Success & Power',
      traits: 'Ambitious, authoritative, business-minded',
      day: 'Business decisions, financial matters, leadership',
    },
    {
      number: 9,
      meaning: 'Completion & Universal Love',
      traits: 'Compassionate, humanitarian, wise',
      day: 'Completion, letting go, humanitarian efforts',
    },
  ];

  const masterNumbers = [
    {
      number: 11,
      meaning: 'Master Intuition',
      description:
        'Spiritual illumination, heightened intuition, and psychic abilities',
    },
    {
      number: 22,
      meaning: 'Master Builder',
      description: 'The ability to turn dreams into reality on a large scale',
    },
    {
      number: 33,
      meaning: 'Master Teacher',
      description:
        'Selfless service to humanity, teaching, and healing on a universal level',
    },
  ];

  const dayEnergies = [
    {
      day: 'Sunday',
      planet: 'Sun ☉',
      energy: 'Solar vitality, confidence, self-expression',
    },
    {
      day: 'Monday',
      planet: 'Moon ☽',
      energy: 'Lunar intuition, emotional sensitivity',
    },
    {
      day: 'Tuesday',
      planet: 'Mars ♂',
      energy: 'Martial action, assertive drive',
    },
    {
      day: 'Wednesday',
      planet: 'Mercury ☿',
      energy: 'Communication, mental agility',
    },
    {
      day: 'Thursday',
      planet: 'Jupiter ♃',
      energy: 'Expansion, philosophical thinking',
    },
    {
      day: 'Friday',
      planet: 'Venus ♀',
      energy: 'Love, beauty, social harmony',
    },
    {
      day: 'Saturday',
      planet: 'Saturn ♄',
      energy: 'Structure, discipline, reflection',
    },
  ];

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
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Complete Numerology Guide
        </h2>
        <p className='text-sm text-zinc-400'>
          Discover core numbers, master numbers, planetary days, and
          numerological calculations
        </p>
      </div>

      <section id='core-numbers' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Core Numbers</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {coreNumbers.map((number) => (
            <Link
              key={number.number}
              href={`/grimoire/life-path/${number.number}`}
              className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-purple-500/50 transition-all group'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-purple-400 transition-colors'>
                {number.number} - {number.meaning}
              </h3>
              <p className='text-sm text-zinc-300 mb-2'>{number.traits}</p>
              <p className='text-sm text-zinc-400'>Best for: {number.day}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id='master-numbers' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Master Numbers</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {masterNumbers.map((master) => (
            <Link
              key={master.number}
              href={`/grimoire/life-path/${master.number}`}
              className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-purple-500/50 transition-all group'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-purple-400 transition-colors'>
                {master.number} - {master.meaning}
              </h3>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                {master.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section id='planetary-days' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Planetary Days</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {dayEnergies.map((day) => (
            <div
              key={day.day}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                {day.day} - {day.planet}
              </h3>
              <p className='text-sm text-zinc-300'>{day.energy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id='calculations' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Calculations</h2>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-zinc-100 mb-2'>
              Daily Universal Number
            </h3>
            <p className='text-sm text-zinc-300 mb-2'>
              Add all digits of today&apos;s date and reduce to single digit
              (except 11, 22, 33)
            </p>
            <p className='text-sm text-zinc-400 mb-1'>
              <strong>Example:</strong> December 15, 2024
            </p>
            <p className='text-sm text-zinc-300'>
              1+5+1+2+2+0+2+4 = 17 → 1+7 = 8
            </p>
          </div>

          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-zinc-100 mb-2'>
              Personal Day Number
            </h3>
            <p className='text-sm text-zinc-300 mb-2'>
              Birth month + birth day + current year + current month + current
              day
            </p>
            <p className='text-sm text-zinc-400 mb-1'>
              <strong>Example:</strong> Born June 10, today Dec 15, 2024
            </p>
            <p className='text-sm text-zinc-300'>
              6+10+2024+12+15 = 2067 → 2+0+6+7 = 15 → 1+5 = 6
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export { Numerology };
