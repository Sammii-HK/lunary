'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { stringToKebabCase } from '../../../../utils/string';

const BirthChart = () => {
  // Enhanced planet data with unique, detailed information
  const planets = [
    {
      symbol: '☉',
      name: 'Sun',
      element: 'Fire',
      rulingSign: 'Leo',
      house: '5th',
      keywords: 'Purpose, vitality, self-expression',
      inBirthChart:
        'Your core identity, ego, and life purpose. Shows how you shine and express yourself.',
      inTransits: 'Focus, visibility, ego, life direction',
      characteristics: 'Conscious self, willpower, creativity',
      retrograde:
        'Rare. Deepens self-reflection, re-evaluation of identity and purpose.',
    },
    {
      symbol: '☽',
      name: 'Moon',
      element: 'Water',
      rulingSign: 'Cancer',
      house: '4th',
      keywords: 'Feelings, needs, rhythms',
      inBirthChart:
        'Your emotional nature, instincts, and subconscious patterns. Shows how you nurture and feel secure.',
      inTransits: 'Emotional fluctuations, home/family, inner needs',
      characteristics: 'Unconscious, habits, memory, intuition',
      retrograde:
        'Rare. Emotional processing, healing childhood patterns, reconnecting with inner self.',
    },
    {
      symbol: '☿',
      name: 'Mercury',
      element: 'Air',
      rulingSign: 'Gemini & Virgo',
      house: '3rd & 6th',
      keywords: 'Thinking, communication, travel',
      inBirthChart:
        'How you think, communicate, and process information. Your learning style and mental approach.',
      inTransits: 'Learning, exchanging ideas, planning, communication',
      characteristics: 'Intellect, logic, reasoning, short trips',
      retrograde:
        '3-4 times/year, 3 weeks. Review, reflection, reconnection. Communication delays, tech issues.',
    },
    {
      symbol: '♀',
      name: 'Venus',
      element: 'Earth',
      rulingSign: 'Libra & Taurus',
      house: '7th & 2nd',
      keywords: 'Love, pleasure, values',
      inBirthChart:
        'What you value, how you love, and what brings you pleasure. Your relationship style and aesthetic.',
      inTransits: 'Relationships, harmony, money, beauty, creativity',
      characteristics: 'Attraction, finances, art, luxury',
      retrograde:
        'Every 18 months, 6 weeks. Re-evaluate relationships, values, spending. Not ideal for new commitments.',
    },
    {
      symbol: '♂',
      name: 'Mars',
      element: 'Fire',
      rulingSign: 'Aries & Scorpio',
      house: '1st & 8th',
      keywords: 'Action, drive, competition',
      inBirthChart:
        'How you take action, assert yourself, and pursue desires. Your energy, drive, and passion.',
      inTransits: 'Motivation, conflict, assertiveness, sexual energy',
      characteristics: 'Will, courage, aggression, physical drive',
      retrograde:
        'Every 2 years, 2-3 months. Internal work, suppressed anger, re-evaluating goals. Avoid starting new projects.',
    },
    {
      symbol: '♃',
      name: 'Jupiter',
      element: 'Fire',
      rulingSign: 'Sagittarius & Pisces',
      house: '9th & 12th',
      keywords: 'Growth, optimism, opportunity',
      inBirthChart:
        'Where you expand, find luck, and seek meaning. Your philosophy, beliefs, and areas of abundance.',
      inTransits: 'Expansion, luck, abundance, opportunities, growth',
      characteristics: 'Wisdom, generosity, faith, higher learning',
      retrograde:
        'Once/year, 4 months. Inner growth, spiritual development, re-evaluating beliefs and expansion.',
    },
    {
      symbol: '♄',
      name: 'Saturn',
      element: 'Earth',
      rulingSign: 'Capricorn & Aquarius',
      house: '10th & 11th',
      keywords: 'Structure, limits, responsibility',
      inBirthChart:
        'Where you face challenges, build discipline, and learn life lessons. Your responsibilities and boundaries.',
      inTransits: 'Discipline, lessons, long-term effort, restrictions',
      characteristics: 'Time, karma, authority, structure, maturity',
      retrograde:
        'Once/year, 4.5 months. Inner discipline, reassessing responsibilities, facing fears and limitations.',
    },
    {
      symbol: '♅',
      name: 'Uranus',
      element: 'Air',
      rulingSign: 'Aquarius',
      house: '11th',
      keywords: 'Change, awakening, innovation',
      inBirthChart:
        'Where you seek freedom, innovation, and break from tradition. Your uniqueness and rebellious streak.',
      inTransits: 'Disruption, liberation, experimentation, sudden change',
      characteristics: 'Revolution, technology, independence, originality',
      retrograde:
        'Once/year, 5 months. Internal revolution, breaking free from constraints, authentic self-expression.',
    },
    {
      symbol: '♆',
      name: 'Neptune',
      element: 'Water',
      rulingSign: 'Pisces',
      house: '12th',
      keywords: 'Imagination, compassion, illusion',
      inBirthChart:
        'Where you connect with spirituality, dreams, and the collective unconscious. Your intuition and idealism.',
      inTransits: 'Spirituality, confusion, idealism, dreams, deception',
      characteristics: 'Mysticism, compassion, creativity, illusion',
      retrograde:
        'Once/year, 5 months. Deep spiritual work, artistic inspiration, confronting illusions and delusions.',
    },
    {
      symbol: '♇',
      name: 'Pluto',
      element: 'Water',
      rulingSign: 'Scorpio',
      house: '8th',
      keywords: 'Power, transformation, regeneration',
      inBirthChart:
        'Where you experience deep transformation, power dynamics, and rebirth. Your shadow and regeneration.',
      inTransits:
        'Deep change, endings, rebirth, power struggles, transformation',
      characteristics: 'Death, rebirth, intensity, hidden power',
      retrograde:
        '5 months/year. Inner transformation, releasing control, healing deep wounds, personal power.',
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
    <div className='space-y-8'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Complete Birth Chart Guide
        </h2>
        <p className='text-sm text-zinc-400'>
          Learn about planets, houses, aspects, retrogrades, and astrological
          components
        </p>
      </div>

      {/* Complete Guide Banner */}
      <Link
        href='/grimoire/guides/birth-chart-complete-guide'
        className='block p-4 rounded-lg bg-gradient-to-r from-lunary-primary-900/30 to-lunary-rose-900/30 border border-lunary-primary-700 hover:border-lunary-primary-500 transition-colors group'
      >
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-medium text-lunary-primary-300 group-hover:text-lunary-primary-200 transition-colors'>
              📖 Read the Complete Birth Chart Guide
            </h3>
            <p className='text-sm text-zinc-400'>
              In-depth tutorial on reading and interpreting your natal chart
            </p>
          </div>
          <span className='text-lunary-primary-400 group-hover:text-lunary-primary-300 transition-colors'>
            →
          </span>
        </div>
      </Link>

      <section id='planets' className='space-y-4'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Planets — &quot;The What&quot;
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Each planet represents a different type of energy and motivation in
            your birth chart. Understanding their meanings helps you interpret
            how they influence different areas of your life.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {planets.map((planet) => {
            const planetSlug = stringToKebabCase(planet.name);
            return (
              <Link
                key={planet.name}
                href={`/grimoire/astronomy/planets/${planetSlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
              >
                <div className='flex items-start gap-3 mb-3'>
                  <span className='text-2xl flex-shrink-0'>
                    {planet.symbol}
                  </span>
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                      {planet.name}
                    </h3>
                    <div className='flex flex-wrap gap-1 mb-2'>
                      <span className='text-xs px-2 py-0.5 rounded bg-lunary-primary-900/20 text-lunary-primary-300'>
                        {planet.element}
                      </span>
                      <span className='text-xs px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-300'>
                        {planet.rulingSign}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <div>
                    <p className='text-xs text-zinc-400 mb-1 font-medium'>
                      In Your Birth Chart:
                    </p>
                    <p className='text-sm text-zinc-300 leading-relaxed'>
                      {planet.inBirthChart}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-zinc-400 mb-1 font-medium'>
                      Characteristics:
                    </p>
                    <p className='text-sm text-zinc-300 leading-relaxed'>
                      {planet.characteristics}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-zinc-400 mb-1 font-medium'>
                      In Transits:
                    </p>
                    <p className='text-sm text-zinc-300 leading-relaxed'>
                      {planet.inTransits}
                    </p>
                  </div>

                  <div className='pt-2 border-t border-zinc-700'>
                    <p className='text-xs text-zinc-400 mb-1 font-medium'>
                      Retrograde:
                    </p>
                    <p className='text-xs text-zinc-400 leading-relaxed'>
                      {planet.retrograde}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id='houses' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Houses — &quot;The Where&quot;
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {houses.map((house) => {
            const houseNumber = house.number
              .replace('st', '')
              .replace('nd', '')
              .replace('rd', '')
              .replace('th', '');
            const houseMap: Record<string, string> = {
              '1': 'first',
              '2': 'second',
              '3': 'third',
              '4': 'fourth',
              '5': 'fifth',
              '6': 'sixth',
              '7': 'seventh',
              '8': 'eighth',
              '9': 'ninth',
              '10': 'tenth',
              '11': 'eleventh',
              '12': 'twelfth',
            };
            const houseSlug =
              houseMap[houseNumber] || house.number.toLowerCase();
            return (
              <Link
                key={house.number}
                href={`/grimoire/houses/overview/${houseSlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
              >
                <div className='flex items-start gap-3'>
                  <span className='font-medium text-zinc-100 text-sm group-hover:text-lunary-primary-400 transition-colors'>
                    {house.number}
                  </span>
                  <p className='text-sm text-zinc-300 flex-1'>{house.area}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id='aspects' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Aspects — Planetary Relationships
        </h2>
        <p className='text-sm text-zinc-400 mb-4'>
          Aspects are angles between planets that show how planetary energies
          interact in your chart. They reveal strengths, challenges, and dynamic
          interactions.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <Link
            href='/grimoire/aspects/types/conjunction'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <h3 className='text-lg font-medium text-lunary-success mb-2 group-hover:text-lunary-success-300 transition-colors'>
              Conjunction (0°)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Planets merge their energies, intensifying their influence. Can be
              harmonious or challenging depending on the planets involved.
            </p>
          </Link>
          <Link
            href='/grimoire/aspects/types/opposition'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <h3 className='text-lg font-medium text-lunary-error mb-2 group-hover:text-lunary-error-300 transition-colors'>
              Opposition (180°)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Planets face each other, creating tension and balance. Often
              represents internal conflict or complementary forces needing
              integration.
            </p>
          </Link>
          <Link
            href='/grimoire/aspects/types/trine'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <h3 className='text-lg font-medium text-lunary-secondary mb-2 group-hover:text-lunary-secondary-300 transition-colors'>
              Trine (120°)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Harmonious flow between planets. Natural talents and ease, but can
              lead to complacency if not actively developed.
            </p>
          </Link>
          <Link
            href='/grimoire/aspects/types/square'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <h3 className='text-lg font-medium text-lunary-accent mb-2 group-hover:text-lunary-accent-300 transition-colors'>
              Square (90°)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Creates friction and challenges that force growth. While
              difficult, squares build strength, resilience, and determination.
            </p>
          </Link>
          <Link
            href='/grimoire/aspects/types/sextile'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <h3 className='text-lg font-medium text-lunary-primary-400 mb-2 group-hover:text-lunary-primary-300 transition-colors'>
              Sextile (60°)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Opportunities and ease between planets. Less intense than trines,
              requiring some effort to activate. Good for creative
              opportunities.
            </p>
          </Link>
        </div>
      </section>

      <section id='retrogrades' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Retrogrades — Inner Reflection
        </h2>
        <p className='text-sm text-zinc-400 mb-4'>
          When planets appear to move backward, their energy turns inward. This
          is a time for review, reflection, and reconnection rather than forward
          action.
        </p>
        <div className='space-y-3'>
          <Link
            href='/grimoire/astronomy/retrogrades/mercury'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-400 transition-colors'>
              Mercury Retrograde
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Occurs 3-4 times per year for about 3 weeks. Affects
              communication, technology, travel, and decision-making. Focus on
              review, finish projects, back up data, and be patient with
              communication delays.
            </p>
            <p className='text-xs text-zinc-400'>
              Best for: Reflection, reconnection, editing, planning
            </p>
          </Link>
          <Link
            href='/grimoire/astronomy/retrogrades/venus'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-400 transition-colors'>
              Venus Retrograde
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Occurs every 18 months for about 6 weeks. Affects relationships,
              values, finances, and aesthetics. Re-evaluate relationships,
              spending, and what you truly value.
            </p>
            <p className='text-xs text-zinc-400'>
              Best for: Relationship review, value clarification, financial
              planning
            </p>
          </Link>
          <Link
            href='/grimoire/astronomy/retrogrades/mars'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-400 transition-colors'>
              Mars Retrograde
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Occurs every 2 years for about 2-3 months. Affects action,
              motivation, and assertiveness. Energy turns inward, focus on
              internal work rather than external action.
            </p>
            <p className='text-xs text-zinc-400'>
              Best for: Internal reflection, building energy, planning rather
              than action
            </p>
          </Link>
        </div>
      </section>

      <section id='transits' className='space-y-4'>
        <Link
          href='/grimoire/transits'
          className='block text-xl font-medium text-zinc-100 hover:text-lunary-primary-400 transition-colors'
        >
          Transits — Current Planetary Movements
        </Link>
        <p className='text-sm text-zinc-400 mb-4'>
          Transits are current planetary positions in relation to your birth
          chart. They show current influences and timing for events and personal
          growth.
        </p>
        <div className='space-y-3'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-zinc-100 mb-2'>
              Understanding Transits
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Transits activate different parts of your chart at different
              times. Major transits (like Saturn Return, Jupiter Return) mark
              significant life periods. Daily transits show day-to-day
              influences and opportunities.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Saturn Return (Age 27-30, 57-60)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              A major life transition marking adulthood and responsibility. A
              time of restructuring, facing reality, and building lasting
              foundations. Often brings challenges that lead to maturity.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-accent mb-2'>
              Jupiter Return (Every 12 years)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              A period of expansion, growth, and opportunity. New opportunities
              emerge, and you may feel more optimistic and adventurous. A good
              time to take risks and expand horizons.
            </p>
          </div>
        </div>
      </section>

      {/* Rising Sign Section */}
      <section id='rising-sign' className='space-y-6'>
        <div>
          <Link
            href='/grimoire/rising-sign'
            className='block text-xl font-medium text-zinc-100 mb-2 hover:text-lunary-primary-400 transition-colors'
          >
            Rising Sign (Ascendant)
          </Link>
          <p className='text-sm text-zinc-400 mb-4'>
            Your rising sign, also called the Ascendant, is the zodiac sign that
            was rising on the eastern horizon at your exact moment of birth. It
            represents your outer personality, how others see you, and your
            approach to life.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              What Is the Rising Sign?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
              The rising sign changes approximately every 2 hours, making it the
              most time-sensitive part of your chart. It's calculated using:
            </p>
            <ul className='list-disc list-inside text-sm text-zinc-300 space-y-1 ml-4'>
              <li>Your exact birth time (most important)</li>
              <li>Your birth location (latitude/longitude)</li>
              <li>Your birth date</li>
            </ul>
            <p className='text-sm text-zinc-300 leading-relaxed mt-3'>
              If you don't know your exact birth time, you can use noon as a
              placeholder, but your rising sign may be inaccurate.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Rising Sign Meanings
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
              Your rising sign influences:
            </p>
            <ul className='list-disc list-inside text-sm text-zinc-300 space-y-1 ml-4'>
              <li>
                <strong>First impressions:</strong> How others initially
                perceive you
              </li>
              <li>
                <strong>Outward personality:</strong> Your social mask and
                presentation
              </li>
              <li>
                <strong>Physical appearance:</strong> Body type, features, and
                style
              </li>
              <li>
                <strong>Approach to life:</strong> How you navigate new
                situations
              </li>
              <li>
                <strong>First house themes:</strong> Self-image, identity, and
                personal expression
              </li>
            </ul>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              How Rising Sign Differs from Sun Sign
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Sun Sign:</strong> Your core identity, ego, and life
                purpose (who you are at your core)
              </p>
              <p>
                <strong>Rising Sign:</strong> Your outer personality and how you
                present yourself (how others see you)
              </p>
              <p className='mt-2'>
                Think of it this way: Your Sun sign is your true self, while
                your Rising sign is the mask you wear in the world. Both are
                authentic parts of you, but serve different purposes.
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Rising Sign by Element
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='text-sm font-medium text-zinc-200 mb-1'>
                  Fire Rising (Aries, Leo, Sagittarius)
                </p>
                <p className='text-xs text-zinc-400'>
                  Energetic, confident, action-oriented first impression
                </p>
              </div>
              <div>
                <p className='text-sm font-medium text-zinc-200 mb-1'>
                  Earth Rising (Taurus, Virgo, Capricorn)
                </p>
                <p className='text-xs text-zinc-400'>
                  Grounded, practical, reliable first impression
                </p>
              </div>
              <div>
                <p className='text-sm font-medium text-zinc-200 mb-1'>
                  Air Rising (Gemini, Libra, Aquarius)
                </p>
                <p className='text-xs text-zinc-400'>
                  Communicative, social, intellectual first impression
                </p>
              </div>
              <div>
                <p className='text-sm font-medium text-zinc-200 mb-1'>
                  Water Rising (Cancer, Scorpio, Pisces)
                </p>
                <p className='text-xs text-zinc-400'>
                  Intuitive, emotional, sensitive first impression
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Synastry Section */}
      <section id='synastry' className='space-y-6'>
        <div>
          <Link
            href='/grimoire/synastry'
            className='block text-xl font-medium text-zinc-100 mb-2 hover:text-lunary-primary-400 transition-colors'
          >
            Synastry: Relationship Compatibility
          </Link>
          <p className='text-sm text-zinc-400 mb-4'>
            Synastry is the comparison of two birth charts to understand
            relationship dynamics, compatibility, and how two people interact.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Understanding Synastry
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
              Synastry looks at how planets in one person's chart interact with
              planets in another's chart. Key areas to examine:
            </p>
            <ul className='list-disc list-inside text-sm text-zinc-300 space-y-1 ml-4'>
              <li>
                <strong>Sun-Moon aspects:</strong> Emotional compatibility and
                understanding
              </li>
              <li>
                <strong>Venus-Mars aspects:</strong> Romantic and sexual
                attraction
              </li>
              <li>
                <strong>Mercury aspects:</strong> Communication style and mental
                connection
              </li>
              <li>
                <strong>Saturn aspects:</strong> Long-term stability and
                commitment
              </li>
              <li>
                <strong>Jupiter aspects:</strong> Growth, expansion, and shared
                values
              </li>
            </ul>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Compatible Aspects
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Trines (120°):</strong> Easy, harmonious connection.
                Natural understanding.
              </p>
              <p>
                <strong>Sextiles (60°):</strong> Supportive, friendly energy.
                Growth opportunities.
              </p>
              <p>
                <strong>Conjunctions (0°):</strong> Intense connection. Can be
                harmonious or challenging.
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Challenging Aspects
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Squares (90°):</strong> Tension and friction, but also
                growth through challenge.
              </p>
              <p>
                <strong>Oppositions (180°):</strong> Attraction and repulsion.
                Balance needed.
              </p>
              <p className='mt-2'>
                Remember: Challenging aspects don't mean incompatibility. They
                often create the most dynamic and growth-oriented relationships.
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              How to Read Synastry
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>1. Compare both charts side by side</p>
              <p>
                2. Look for aspects between planets (especially personal
                planets)
              </p>
              <p>
                3. Note which houses each person's planets fall into in the
                other's chart
              </p>
              <p>
                4. Consider the overall balance of harmonious vs challenging
                aspects
              </p>
              <p>
                5. Remember: No relationship is perfect—challenges create growth
              </p>
            </div>
          </div>
          <Link
            href='/grimoire/synastry/generate'
            className='block p-4 rounded-lg bg-gradient-to-r from-lunary-rose-900/30 to-lunary-primary-900/30 border border-lunary-rose-700 hover:border-lunary-rose-500 transition-colors group'
          >
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-medium text-lunary-rose-300 group-hover:text-lunary-rose-200 transition-colors'>
                  💕 Generate Synastry Chart
                </h3>
                <p className='text-sm text-zinc-400'>
                  Compare two birth charts to discover relationship
                  compatibility
                </p>
              </div>
              <span className='text-lunary-rose-400 group-hover:text-lunary-rose-300 transition-colors'>
                →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section id='faq' className='space-y-6'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Frequently Asked Questions
        </h2>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              What is a rising sign (Ascendant)?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Your rising sign is the zodiac sign that was rising on the eastern
              horizon at your exact time of birth. It represents how you present
              yourself to the world, your outward personality, and your first
              impressions. It's calculated using your birth time and location.
              See the Rising Sign section above for detailed information.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              How do I find my birth chart?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Lunary automatically generates your birth chart from your profile
              information. You can view your complete birth chart at{' '}
              <a
                href='/birth-chart'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 underline'
              >
                /birth-chart
              </a>{' '}
              or complete your birth details in your{' '}
              <a
                href='/profile'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 underline'
              >
                profile
              </a>
              . The more accurate your birth time, the more precise your chart
              will be, especially for houses and rising sign.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              What should I do during Mercury Retrograde?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Focus on review, reflection, and reconnection. Back up important
              data, review contracts carefully, avoid major purchases if
              possible, and be patient with communication. This is a good time
              to finish projects rather than start new ones.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Are square aspects always bad?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              No, squares create tension that forces growth. They show where you
              need to develop strength and overcome challenges. Many successful
              people have prominent squares in their charts. The friction
              creates motivation and resilience.
            </p>
          </div>
        </div>
      </section>

      <div className='rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 p-6'>
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

      {/* Related Topics Section */}
      <section className='mt-12 pt-8 border-t border-zinc-800/50'>
        <h2 className='text-xl font-medium text-zinc-100 mb-4'>
          Related Topics
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <Link
            href='/grimoire/moon'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Moon Phases & Influences
          </Link>
          <Link
            href='/grimoire/astronomy'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Astronomy & Zodiac
          </Link>
          <Link
            href='/grimoire/tarot'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Tarot Readings
          </Link>
          <Link
            href='/grimoire/astronomy/planets'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Planetary Correspondences
          </Link>
        </div>
      </section>
    </div>
  );
};

export default BirthChart;
