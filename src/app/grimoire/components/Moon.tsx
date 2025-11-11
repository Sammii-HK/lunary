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

      {/* Moon Signs Section */}
      <section id='moon-signs' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Moon Signs & Daily Influence
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            The moon changes signs every 2-3 days, influencing emotional energy,
            moods, and daily experiences. Understanding moon signs helps you
            align with cosmic rhythms.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Fire Moon Signs
            </h3>
            <p className='text-xs text-zinc-400 mb-2'>
              Aries, Leo, Sagittarius
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Passionate, energetic, and action-oriented. Good for starting
              projects, taking risks, and expressing creativity. Emotions run
              hot and direct.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Earth Moon Signs
            </h3>
            <p className='text-xs text-zinc-400 mb-2'>
              Taurus, Virgo, Capricorn
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Grounded, practical, and stable. Ideal for building, organizing,
              and making tangible progress. Emotions are steady and reliable.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Air Moon Signs
            </h3>
            <p className='text-xs text-zinc-400 mb-2'>
              Gemini, Libra, Aquarius
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Communicative, social, and intellectual. Perfect for discussions,
              learning, and connecting with others. Emotions are expressed
              through words and ideas.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Water Moon Signs
            </h3>
            <p className='text-xs text-zinc-400 mb-2'>
              Cancer, Scorpio, Pisces
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Intuitive, emotional, and deeply feeling. Best for emotional work,
              healing, and connecting with intuition. Emotions run deep and
              sensitive.
            </p>
          </div>
        </div>
      </section>

      {/* Void of Course Moon Section */}
      <section id='void-of-course' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Void of Course Moon
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            A void of course moon occurs when the moon makes no major aspects
            before changing signs. This is a time of "cosmic pause" when actions
            may not have expected results.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              What It Means
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
              When the moon is void of course, it's disconnected from other
              planetary energies. This creates a period where:
            </p>
            <ul className='list-disc list-inside text-sm text-zinc-300 space-y-1 ml-4'>
              <li>Actions may not have expected outcomes</li>
              <li>Plans may change or be delayed</li>
              <li>Communication can be unclear or misunderstood</li>
              <li>Energy feels scattered or unfocused</li>
            </ul>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              What to Avoid
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>Avoid during void of course moon:</p>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <li>Starting new projects or ventures</li>
                <li>Signing contracts or making commitments</li>
                <li>Making important decisions</li>
                <li>Major purchases or investments</li>
                <li>Sending important emails or messages</li>
              </ul>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              What to Do Instead
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>Void of course moon is perfect for:</p>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <li>Reflection and introspection</li>
                <li>Completing existing projects</li>
                <li>Rest and self-care</li>
                <li>Creative activities without deadlines</li>
                <li>Cleaning and organizing</li>
                <li>Meditation and spiritual practice</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Eclipses Section */}
      <section id='eclipses' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Solar & Lunar Eclipses
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Eclipses are powerful cosmic events that mark significant turning
            points. They bring sudden changes, revelations, and opportunities
            for transformation.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Solar Eclipses (New Moon)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
              Solar eclipses occur during new moons when the moon blocks the
              sun. They represent new beginnings, fresh starts, and
              opportunities to set powerful intentions.
            </p>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Meaning:</strong> New chapters, fresh starts, powerful
                new beginnings
              </p>
              <p>
                <strong>Energy:</strong> Manifestation, planting seeds,
                initiating change
              </p>
              <p>
                <strong>Best for:</strong> Setting intentions, starting new
                projects, making commitments
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Lunar Eclipses (Full Moon)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
              Lunar eclipses occur during full moons when the earth's shadow
              covers the moon. They bring endings, completions, and revelations
              that have been building.
            </p>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Meaning:</strong> Endings, completions, revelations,
                letting go
              </p>
              <p>
                <strong>Energy:</strong> Release, closure, emotional processing
              </p>
              <p>
                <strong>Best for:</strong> Releasing what no longer serves,
                completing cycles, emotional healing
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Eclipse Season
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Eclipses come in pairs (solar and lunar) about every 6 months,
              creating an "eclipse season" of intense change. Events set in
              motion during eclipse season often unfold over the following 6
              months. Pay attention to themes that emerge during this time.
            </p>
          </div>
        </div>
      </section>

      {/* Moon Gardening Section */}
      <section id='moon-gardening' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Moon Gardening
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Align your gardening with lunar phases for optimal growth. The
            moon's gravitational pull affects water in soil and plants, just as
            it affects ocean tides.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              New Moon to First Quarter
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Plant above-ground crops with seeds outside (lettuce, spinach,
              grains). Good for planting, grafting, and transplanting.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              First Quarter to Full Moon
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Plant above-ground crops with seeds inside (beans, tomatoes,
              peppers). Best time for fertilizing and watering.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Full Moon to Last Quarter
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Plant root crops (carrots, potatoes, onions). Good for harvesting,
              pruning, and pest control.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Last Quarter to New Moon
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Rest period. Focus on weeding, maintenance, and preparing soil.
              Avoid planting during this phase.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
              Focus on reflection and completion instead. See the Void of Course
              Moon section above for detailed information.
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
              signs (Cancer, Scorpio, Pisces) bring intuition. See the Moon
              Signs section above for detailed information.
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

      {/* Related Topics Section */}
      <section className='mt-12 pt-8 border-t border-zinc-800/50'>
        <h2 className='text-xl font-medium text-zinc-100 mb-4'>
          Related Topics
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <a
            href='/grimoire/practices#spellcraft-fundamentals'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Moon Magic & Spellcraft
          </a>
          <a
            href='/grimoire/candle-magic'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Candle Magic
          </a>
          <a
            href='/grimoire/birth-chart#planets'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Planetary Influences
          </a>
          <a
            href='/grimoire/astronomy'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Astronomy & Zodiac
          </a>
        </div>
      </section>
    </div>
  );
};

export default Moon;
