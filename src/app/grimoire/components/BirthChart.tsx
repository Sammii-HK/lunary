'use client';

import { useEffect } from 'react';

const BirthChart = () => {
  const planets = [
    {
      symbol: '☉',
      name: 'Sun',
      keywords: 'Purpose, vitality, self-expression',
      transitTone: 'Focus, visibility, ego, life direction',
    },
    {
      symbol: '☽',
      name: 'Moon',
      keywords: 'Feelings, needs, rhythms',
      transitTone: 'Emotional fluctuations, home/family',
    },
    {
      symbol: '☿',
      name: 'Mercury',
      keywords: 'Thinking, communication, travel',
      transitTone: 'Learning, exchanging ideas, planning',
    },
    {
      symbol: '♀',
      name: 'Venus',
      keywords: 'Love, pleasure, values',
      transitTone: 'Relationships, harmony, money',
    },
    {
      symbol: '♂',
      name: 'Mars',
      keywords: 'Action, drive, competition',
      transitTone: 'Motivation, conflict, assertiveness',
    },
    {
      symbol: '♃',
      name: 'Jupiter',
      keywords: 'Growth, optimism, opportunity',
      transitTone: 'Expansion, luck, abundance',
    },
    {
      symbol: '♄',
      name: 'Saturn',
      keywords: 'Structure, limits, responsibility',
      transitTone: 'Discipline, lessons, long-term effort',
    },
    {
      symbol: '♅',
      name: 'Uranus',
      keywords: 'Change, awakening, innovation',
      transitTone: 'Disruption, liberation, experimentation',
    },
    {
      symbol: '♆',
      name: 'Neptune',
      keywords: 'Imagination, compassion, illusion',
      transitTone: 'Spirituality, confusion, idealism',
    },
    {
      symbol: '♇',
      name: 'Pluto',
      keywords: 'Power, transformation, regeneration',
      transitTone: 'Deep change, endings, rebirth',
    },
  ];

  const houses = [
    { number: '1st', area: 'Identity, confidence, how you present yourself' },
    { number: '2nd', area: 'Finances, self-worth, possessions' },
    { number: '3rd', area: 'Communication, learning, siblings' },
    { number: '4th', area: 'Home, family, inner foundation' },
    { number: '5th', area: 'Creativity, joy, romance, children' },
    { number: '6th', area: 'Health, habits, work environment' },
    { number: '7th', area: 'Partnerships, marriage, collaboration' },
    { number: '8th', area: 'Intimacy, shared money, transformation' },
    { number: '9th', area: 'Travel, philosophy, beliefs, education' },
    { number: '10th', area: 'Career, reputation, leadership' },
    { number: '11th', area: 'Community, friends, social causes' },
    { number: '12th', area: 'Subconscious, solitude, healing' },
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
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Birth Chart
        </h1>
        <p className='text-sm text-zinc-400'>
          Learn about planets, houses, and astrological components
        </p>
      </div>

      <section id='planets' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Planets — &quot;The What&quot;
        </h2>
        <div className='space-y-3'>
          {planets.map((planet) => (
            <div
              key={planet.name}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <div className='flex items-start gap-3'>
                <span className='text-2xl'>{planet.symbol}</span>
                <div className='flex-1'>
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    {planet.name}
                  </h3>
                  <p className='text-sm text-zinc-300 mb-1'>
                    <span className='font-medium'>Keywords:</span>{' '}
                    {planet.keywords}
                  </p>
                  <p className='text-sm text-zinc-400'>
                    <span className='font-medium'>In Transits:</span>{' '}
                    {planet.transitTone}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id='houses' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Houses — &quot;The Where&quot;
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {houses.map((house) => (
            <div
              key={house.number}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <div className='flex items-start gap-3'>
                <span className='font-medium text-zinc-100 text-sm'>
                  {house.number}
                </span>
                <p className='text-sm text-zinc-300 flex-1'>{house.area}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
        <h3 className='text-lg font-medium text-zinc-100 mb-3'>
          The Core Logic
        </h3>
        <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
          Each planet represents a type of energy or motivation, each house
          represents the life area affected, and the sign adds tone and style.
        </p>
        <div className='bg-zinc-900/50 rounded p-4 border border-zinc-800/50'>
          <p className='text-sm text-zinc-200 font-medium'>
            interpretation = planet.energy + sign.expression + house.context
          </p>
        </div>
      </div>
    </div>
  );
};

export default BirthChart;
