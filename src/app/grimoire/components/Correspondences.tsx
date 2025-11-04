'use client';

import { useEffect } from 'react';
import { correspondencesData } from '@/constants/grimoire/correspondences';

const Correspondences = () => {
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
          Magical Correspondences
        </h1>
        <p className='text-sm text-zinc-400'>
          Explore the symbolic connections between elements, colors, planets,
          and magical practices
        </p>
      </div>

      {/* Elements */}
      <section id='elements' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Elements</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {Object.entries(correspondencesData.elements).map(
            ([element, data]) => (
              <div
                key={element}
                className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-3'>
                  {element}
                </h3>
                <div className='space-y-2 text-sm text-zinc-300'>
                  <div>
                    <span className='text-zinc-400'>Colors: </span>
                    {data.colors.join(', ')}
                  </div>
                  <div>
                    <span className='text-zinc-400'>Crystals: </span>
                    {data.crystals.join(', ')}
                  </div>
                  <div>
                    <span className='text-zinc-400'>Herbs: </span>
                    {data.herbs.join(', ')}
                  </div>
                  <div>
                    <span className='text-zinc-400'>Planets: </span>
                    {data.planets.join(', ')}
                  </div>
                  <div>
                    <span className='text-zinc-400'>Direction: </span>
                    {data.directions}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* Colors */}
      <section id='colors' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Colors</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Object.entries(correspondencesData.colors).map(([color, data]) => (
            <div
              key={color}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                {color}
              </h3>
              <div className='space-y-2 text-sm text-zinc-300'>
                <div>
                  <span className='text-zinc-400'>Uses: </span>
                  {data.uses.join(', ')}
                </div>
                <div>
                  <span className='text-zinc-400'>Planets: </span>
                  {data.planets.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Days */}
      <section id='days' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Planetary Days</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Object.entries(correspondencesData.days).map(([day, data]) => (
            <div
              key={day}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>{day}</h3>
              <div className='space-y-2 text-sm text-zinc-300'>
                <div>
                  <span className='text-zinc-400'>Planet: </span>
                  {data.planet}
                </div>
                <div>
                  <span className='text-zinc-400'>Element: </span>
                  {data.element}
                </div>
                <div>
                  <span className='text-zinc-400'>Uses: </span>
                  {data.uses.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deities */}
      <section id='deities' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Deities</h2>
        <div className='space-y-6'>
          {Object.entries(correspondencesData.deities).map(
            ([pantheon, gods]) => (
              <div key={pantheon}>
                <h3 className='text-lg font-medium text-zinc-200 mb-3'>
                  {pantheon}
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {Object.entries(gods).map(([name, data]) => (
                    <div
                      key={name}
                      className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
                    >
                      <h4 className='font-medium text-zinc-100 mb-2'>{name}</h4>
                      <div className='text-sm text-zinc-400'>
                        Domain: {data.domain.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* Flowers */}
      <section id='flowers' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Flowers</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Object.entries(correspondencesData.flowers).map(([flower, data]) => (
            <div
              key={flower}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                {flower}
              </h3>
              <div className='space-y-2 text-sm text-zinc-300'>
                <div>
                  <span className='text-zinc-400'>Uses: </span>
                  {data.uses.join(', ')}
                </div>
                <div>
                  <span className='text-zinc-400'>Planets: </span>
                  {data.planets.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section id='numbers' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Numbers</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Object.entries(correspondencesData.numbers).map(([num, data]) => (
            <div
              key={num}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>{num}</h3>
              <div className='space-y-2 text-sm text-zinc-300'>
                <div>
                  <span className='text-zinc-400'>Uses: </span>
                  {data.uses.join(', ')}
                </div>
                <div>
                  <span className='text-zinc-400'>Planet: </span>
                  {data.planets[0]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wood */}
      <section id='wood' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Wood</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Object.entries(correspondencesData.wood).map(([wood, data]) => (
            <div
              key={wood}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>{wood}</h3>
              <div className='space-y-2 text-sm text-zinc-300'>
                <div>
                  <span className='text-zinc-400'>Uses: </span>
                  {data.uses.join(', ')}
                </div>
                <div>
                  <span className='text-zinc-400'>Planets: </span>
                  {data.planets.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Herbs */}
      <section id='herbs' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Herbs</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Object.entries(correspondencesData.herbs).map(([herb, data]) => (
            <div
              key={herb}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>{herb}</h3>
              <div className='space-y-2 text-sm text-zinc-300'>
                <div>
                  <span className='text-zinc-400'>Uses: </span>
                  {data.uses.join(', ')}
                </div>
                <div>
                  <span className='text-zinc-400'>Planet: </span>
                  {data.planets[0]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Animals */}
      <section id='animals' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Animals</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Object.entries(correspondencesData.animals).map(([animal, data]) => (
            <div
              key={animal}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                {animal}
              </h3>
              <div className='space-y-2 text-sm text-zinc-300'>
                <div>
                  <span className='text-zinc-400'>Uses: </span>
                  {data.uses.join(', ')}
                </div>
                <div>
                  <span className='text-zinc-400'>Planet: </span>
                  {data.planets[0]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Correspondences;
