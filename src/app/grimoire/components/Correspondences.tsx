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

      {/* Herb Profiles */}
      <section id='herb-profiles' className='space-y-6'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Herb Profiles & Preparations
        </h2>
        <p className='text-sm text-zinc-400 mb-4'>
          Detailed information about working with herbs, including preparations,
          safety, and magical uses.
        </p>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Herb Preparations
            </h3>
            <div className='space-y-3 text-sm text-zinc-300'>
              <div>
                <strong>Teas:</strong> Steep 1-2 tsp dried herbs in hot water
                for 5-10 minutes. Strain and drink. Best for gentle, daily
                magical work.
              </div>
              <div>
                <strong>Tinctures:</strong> Soak herbs in alcohol (vodka,
                brandy) for 4-6 weeks. Strain and store in dark bottles. More
                potent than teas.
              </div>
              <div>
                <strong>Oils:</strong> Infuse herbs in carrier oils (olive,
                jojoba) for 2-4 weeks. Use for anointing, massage, or ritual
                work.
              </div>
              <div>
                <strong>Salves:</strong> Combine infused oils with beeswax for
                topical healing applications. Great for skin healing and
                protection work.
              </div>
              <div>
                <strong>Incense:</strong> Burn dried herbs or use resin incense.
                Smudging involves burning herbs like sage for cleansing.
              </div>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Herb Safety
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Always research herbs before use, especially if pregnant, nursing,
              or taking medications. Some herbs have contraindications:
            </p>
            <div className='space-y-2 text-sm text-zinc-300'>
              <div>
                <strong>Pregnancy:</strong> Avoid mugwort, pennyroyal, rue,
                tansy
              </div>
              <div>
                <strong>Blood Pressure:</strong> Use caution with licorice,
                hawthorn
              </div>
              <div>
                <strong>Medications:</strong> St. John's Wort interacts with
                many medications
              </div>
              <div>
                <strong>Allergies:</strong> Test a small amount first if
                sensitive
              </div>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Wildcrafting Ethics
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              When harvesting wild herbs, follow ethical practices: only take
              what you need, never take more than 10% of a plant population,
              harvest away from roads and pollution, obtain permission on
              private land, and leave some for wildlife and future growth.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id='faq' className='space-y-6'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Frequently Asked Questions
        </h2>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              How do I store herbs?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Store dried herbs in airtight containers away from light, heat,
              and moisture. Glass jars with tight lids work best. Label with
              name and date. Most herbs keep potency for 1-2 years when stored
              properly.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Can I grow my own magical herbs?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Yes! Many magical herbs are easy to grow. Start with common
              varieties like basil, rosemary, mint, and sage. These are hardy,
              fast-growing, and versatile. Consider your climate and growing
              space. Even a windowsill herb garden works for small spaces.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              What's the difference between culinary and magical herbs?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Many herbs serve both purposes. Culinary herbs are safe for
              consumption and often used in cooking magic. Magical herbs are
              used for their energetic properties and correspondences. Most
              culinary herbs also have magical properties, making them perfect
              for kitchen witchcraft.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Correspondences;
