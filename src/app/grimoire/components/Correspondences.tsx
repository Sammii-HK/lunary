'use client';

import { useEffect } from 'react';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import Link from 'next/link';
import { stringToKebabCase } from '../../../../utils/string';

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
    <div className='space-y-8'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Complete Correspondence Guide
        </h2>
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
          {Object.entries(correspondencesData.colors).map(([color, data]) => {
            const colorSlug = stringToKebabCase(color);
            return (
              <Link
                key={color}
                href={`/grimoire/correspondences/colors/${colorSlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-400 transition-colors'>
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
              </Link>
            );
          })}
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
            ([pantheon, gods]) => {
              const pantheonSlug = stringToKebabCase(pantheon);
              return (
                <div key={pantheon}>
                  <Link
                    href={`/grimoire/correspondences/deities/${pantheonSlug}`}
                    className='block text-lg font-medium text-zinc-200 mb-3 hover:text-lunary-primary-400 transition-colors'
                  >
                    {pantheon}
                  </Link>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {Object.entries(gods).map(([name, data]) => {
                      const deitySlug = stringToKebabCase(name);
                      return (
                        <Link
                          key={name}
                          href={`/grimoire/correspondences/deities/${pantheonSlug}/${deitySlug}`}
                          className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
                        >
                          <h4 className='font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-400 transition-colors'>
                            {name}
                          </h4>
                          <div className='text-sm text-zinc-400'>
                            Domain: {data.domain.join(', ')}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            },
          )}
        </div>
      </section>

      {/* Flowers */}
      <section id='flowers' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Flowers</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Object.entries(correspondencesData.flowers).map(([flower, data]) => {
            const flowerSlug = stringToKebabCase(flower);
            return (
              <Link
                key={flower}
                href={`/grimoire/correspondences/flowers/${flowerSlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-400 transition-colors'>
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
              </Link>
            );
          })}
        </div>
      </section>

      {/* Numbers */}
      <section id='numbers' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Numbers</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Object.entries(correspondencesData.numbers).map(([num, data]) => {
            const numSlug = stringToKebabCase(num);
            return (
              <Link
                key={num}
                href={`/grimoire/correspondences/numbers/${numSlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-400 transition-colors'>
                  {num}
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
              </Link>
            );
          })}
        </div>
      </section>

      {/* Wood */}
      <section id='wood' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Wood</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Object.entries(correspondencesData.wood).map(([wood, data]) => {
            const woodSlug = stringToKebabCase(wood);
            return (
              <Link
                key={wood}
                href={`/grimoire/correspondences/wood/${woodSlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-400 transition-colors'>
                  {wood}
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
              </Link>
            );
          })}
        </div>
      </section>

      {/* Herbs */}
      <section id='herbs' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Herbs</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Object.entries(correspondencesData.herbs).map(([herb, data]) => {
            const herbSlug = stringToKebabCase(herb);
            return (
              <Link
                key={herb}
                href={`/grimoire/correspondences/herbs/${herbSlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-400 transition-colors'>
                  {herb}
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
              </Link>
            );
          })}
        </div>
      </section>

      {/* Animals */}
      <section id='animals' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Animals</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Object.entries(correspondencesData.animals).map(([animal, data]) => {
            const animalSlug = stringToKebabCase(animal);
            return (
              <Link
                key={animal}
                href={`/grimoire/correspondences/animals/${animalSlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-400 transition-colors'>
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
              </Link>
            );
          })}
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
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
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
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Herb Safety & Disclaimer
            </h3>
            <div className='space-y-3 text-sm text-zinc-300'>
              <p className='leading-relaxed'>
                The information provided here is for{' '}
                <strong>magical and spiritual purposes only</strong>. This
                content is not intended as medical advice, diagnosis, or
                treatment.
              </p>
              <div className='p-3 bg-lunary-error-950 border border-lunary-error-700 rounded'>
                <strong className='text-lunary-error-300'>
                  Important Disclaimer:
                </strong>
                <ul className='list-disc list-inside mt-2 space-y-1'>
                  <li>Always research herbs thoroughly before any use</li>
                  <li>
                    Consult qualified professionals for any health-related
                    questions
                  </li>
                  <li>
                    Never ingest herbs without proper knowledge and guidance
                  </li>
                  <li>Test small amounts first if using topically</li>
                  <li>Keep herbs away from children and pets</li>
                  <li>
                    Magical use (external, small amounts) differs from medicinal
                    use
                  </li>
                </ul>
              </div>
              <p className='text-xs text-zinc-400 italic'>
                For magical purposes, always use herbs responsibly and with
                respect for their power. When in doubt about safety, consult a
                qualified practitioner or avoid use.
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
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

      {/* Individual Herb Profiles */}
      <section id='individual-herbs' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Individual Herb Profiles
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Detailed profiles of common magical herbs, including their
            properties, uses, and safety information.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-success mb-2'>
              Sage
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Properties:</strong> Purification, wisdom, protection,
                longevity
              </p>
              <p>
                <strong>Magical Uses:</strong> Smudging for space cleansing,
                protection spells, wisdom rituals, memory enhancement
              </p>
              <p>
                <strong>Preparations:</strong> Burn dried leaves for smudging,
                make tea for purification, use in protection sachets
              </p>
              <p>
                <strong>Safety:</strong> For magical use only. White sage is
                endangered—use garden sage or other varieties. Always research
                before any use.
              </p>
              <p>
                <strong>Planet:</strong> Jupiter | <strong>Element:</strong> Air
              </p>
            </div>
          </div>

          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-accent mb-2'>
              Rosemary
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Properties:</strong> Memory, protection, purification,
                love, mental clarity
              </p>
              <p>
                <strong>Magical Uses:</strong> Memory spells, protection
                rituals, love magic, purification baths, study aids
              </p>
              <p>
                <strong>Preparations:</strong> Burn as incense, add to bath
                water, use in sachets, make tea for mental clarity
              </p>
              <p>
                <strong>Safety:</strong> For magical use only. Always research
                before any use. Use responsibly.
              </p>
              <p>
                <strong>Planet:</strong> Sun | <strong>Element:</strong> Fire
              </p>
            </div>
          </div>

          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-success mb-2'>
              Basil
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Properties:</strong> Protection, prosperity, love,
                peace, exorcism
              </p>
              <p>
                <strong>Magical Uses:</strong> Protection spells, money drawing,
                love magic, peace rituals, banishing negativity
              </p>
              <p>
                <strong>Preparations:</strong> Carry fresh leaves, add to
                prosperity sachets, use in protection oils, sprinkle around home
              </p>
              <p>
                <strong>Safety:</strong> For magical use only. Always research
                before any use. Use responsibly.
              </p>
              <p>
                <strong>Planet:</strong> Mars | <strong>Element:</strong> Fire
              </p>
            </div>
          </div>

          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-400 mb-2'>
              Lavender
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Properties:</strong> Peace, sleep, purification,
                protection, love, healing
              </p>
              <p>
                <strong>Magical Uses:</strong> Sleep spells, peace rituals,
                purification baths, love magic, protection sachets, dream work
              </p>
              <p>
                <strong>Preparations:</strong> Make tea for sleep, add to bath,
                use in sachets under pillow, burn as incense
              </p>
              <p>
                <strong>Safety:</strong> For magical use only. Always research
                before any use. Use responsibly.
              </p>
              <p>
                <strong>Planet:</strong> Mercury | <strong>Element:</strong> Air
              </p>
            </div>
          </div>

          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-rose mb-2'>
              Cinnamon
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Properties:</strong> Prosperity, protection, love,
                success, passion, psychic ability
              </p>
              <p>
                <strong>Magical Uses:</strong> Money spells, protection rituals,
                love magic, success spells, passion work, psychic development
              </p>
              <p>
                <strong>Preparations:</strong> Burn as incense, add to
                prosperity sachets, use in love oils, sprinkle on candles
              </p>
              <p>
                <strong>Safety:</strong> For magical use only. Always research
                before any use. May cause skin irritation when applied
                topically—test small amount first.
              </p>
              <p>
                <strong>Planet:</strong> Sun | <strong>Element:</strong> Fire
              </p>
            </div>
          </div>

          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-rose mb-2'>Rose</h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Properties:</strong> Love, beauty, healing, protection,
                psychic ability, heart chakra
              </p>
              <p>
                <strong>Magical Uses:</strong> Love spells, beauty rituals,
                emotional healing, protection, heart chakra work, divination
              </p>
              <p>
                <strong>Preparations:</strong> Use petals in baths, make rose
                water, add to love sachets, use in teas, anoint with rose oil
              </p>
              <p>
                <strong>Safety:</strong> For magical use only. Always research
                before any use. Use responsibly.
              </p>
              <p>
                <strong>Planet:</strong> Venus | <strong>Element:</strong> Water
              </p>
            </div>
          </div>

          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-success mb-2'>
              Mint
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Properties:</strong> Prosperity, protection, healing,
                travel, communication, money
              </p>
              <p>
                <strong>Magical Uses:</strong> Money spells, protection rituals,
                travel safety, healing work, communication spells
              </p>
              <p>
                <strong>Preparations:</strong> Carry fresh leaves, add to
                prosperity sachets, make tea, use in travel protection charms
              </p>
              <p>
                <strong>Safety:</strong> For magical use only. Always research
                before any use. Use responsibly.
              </p>
              <p>
                <strong>Planet:</strong> Venus | <strong>Element:</strong> Air
              </p>
            </div>
          </div>

          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-accent mb-2'>
              Chamomile
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Properties:</strong> Peace, sleep, healing, protection,
                prosperity, purification
              </p>
              <p>
                <strong>Magical Uses:</strong> Sleep spells, peace rituals,
                healing work, protection, money drawing, purification baths
              </p>
              <p>
                <strong>Preparations:</strong> Make tea for sleep, add to bath,
                use in sachets, burn as incense
              </p>
              <p>
                <strong>Safety:</strong> For magical use only. Always research
                before any use. Use responsibly.
              </p>
              <p>
                <strong>Planet:</strong> Sun | <strong>Element:</strong> Water
              </p>
            </div>
          </div>

          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-400 mb-2'>
              Mugwort
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Properties:</strong> Psychic ability, dreams,
                protection, astral travel, divination
              </p>
              <p>
                <strong>Magical Uses:</strong> Dream work, psychic development,
                astral travel, divination, protection, moon magic
              </p>
              <p>
                <strong>Preparations:</strong> Place under pillow for dreams,
                burn as incense, make tea (use caution), use in dream sachets
              </p>
              <p>
                <strong>Safety:</strong> For magical use only. Use in small
                amounts. Always research thoroughly before any use. Use
                responsibly.
              </p>
              <p>
                <strong>Planet:</strong> Venus, Moon | <strong>Element:</strong>{' '}
                Earth
              </p>
            </div>
          </div>

          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-success mb-2'>
              Thyme
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Properties:</strong> Courage, purification, health,
                sleep, psychic ability, healing
              </p>
              <p>
                <strong>Magical Uses:</strong> Courage spells, purification
                rituals, healing work, sleep magic, psychic development
              </p>
              <p>
                <strong>Preparations:</strong> Burn as incense, add to bath, use
                in sachets, make tea for courage
              </p>
              <p>
                <strong>Safety:</strong> For magical use only. Always research
                before any use. Use responsibly.
              </p>
              <p>
                <strong>Planet:</strong> Venus | <strong>Element:</strong> Water
              </p>
            </div>
          </div>

          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-secondary mb-2'>
              Eucalyptus
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Properties:</strong> Healing, protection, purification,
                clarity, spiritual cleansing
              </p>
              <p>
                <strong>Magical Uses:</strong> Healing spells, protection
                rituals, purification, mental clarity, spiritual cleansing
              </p>
              <p>
                <strong>Preparations:</strong> Burn leaves as incense, add to
                healing sachets, use in purification rituals
              </p>
              <p>
                <strong>Safety:</strong> For magical use only. Do not ingest
                eucalyptus oil. Keep away from children and pets. Always
                research before any use.
              </p>
              <p>
                <strong>Planet:</strong> Moon | <strong>Element:</strong> Water
              </p>
            </div>
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
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
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
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
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
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
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

      {/* Related Topics Section */}
      <section className='mt-12 pt-8 border-t border-zinc-800/50'>
        <h2 className='text-xl font-medium text-zinc-100 mb-4'>
          Related Topics
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <Link
            href='/grimoire/candle-magic/colors'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Candle Color Meanings
          </Link>
          <Link
            href='/grimoire/practices'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Spells & Rituals
          </Link>
          <Link
            href='/grimoire/crystals'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Crystal Correspondences
          </Link>
          <Link
            href='/grimoire/moon'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Moon & Timing
          </Link>
          <Link
            href='/grimoire/planets'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Planetary Influences
          </Link>
          <Link
            href='/grimoire/numerology'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Number Correspondences
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Correspondences;
