'use client';

import { useEffect } from 'react';

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
    <div className='space-y-8 pb-20'>
      <div className='mb-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Birth Chart
        </h1>
        <p className='text-sm text-zinc-400'>
          Learn about planets, houses, aspects, retrogrades, and astrological
          components
        </p>
      </div>

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
          {planets.map((planet) => (
            <div
              key={planet.name}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 transition-colors'
            >
              <div className='flex items-start gap-3 mb-3'>
                <span className='text-2xl flex-shrink-0'>{planet.symbol}</span>
                <div className='flex-1 min-w-0'>
                  <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                    {planet.name}
                  </h3>
                  <div className='flex flex-wrap gap-1 mb-2'>
                    <span className='text-xs px-2 py-0.5 rounded bg-purple-900/20 text-purple-300'>
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
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-green-400 mb-2'>
              Conjunction (0°)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Planets merge their energies, intensifying their influence. Can be
              harmonious or challenging depending on the planets involved.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-red-400 mb-2'>
              Opposition (180°)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Planets face each other, creating tension and balance. Often
              represents internal conflict or complementary forces needing
              integration.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-blue-400 mb-2'>
              Trine (120°)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Harmonious flow between planets. Natural talents and ease, but can
              lead to complacency if not actively developed.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-yellow-400 mb-2'>
              Square (90°)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Creates friction and challenges that force growth. While
              difficult, squares build strength, resilience, and determination.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-400 mb-2'>
              Sextile (60°)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Opportunities and ease between planets. Less intense than trines,
              requiring some effort to activate. Good for creative
              opportunities.
            </p>
          </div>
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
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-zinc-100 mb-2'>
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
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-zinc-100 mb-2'>
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
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-zinc-100 mb-2'>
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
          </div>
        </div>
      </section>

      <section id='transits' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Transits — Current Planetary Movements
        </h2>
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
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Saturn Return (Age 27-30, 57-60)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              A major life transition marking adulthood and responsibility. A
              time of restructuring, facing reality, and building lasting
              foundations. Often brings challenges that lead to maturity.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-yellow-400 mb-2'>
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

      <section id='faq' className='space-y-6'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Frequently Asked Questions
        </h2>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              What is a rising sign (Ascendant)?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Your rising sign is the zodiac sign that was rising on the eastern
              horizon at your exact time of birth. It represents how you present
              yourself to the world, your outward personality, and your first
              impressions. It's calculated using your birth time and location.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              How do I find my birth chart?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              You need your exact birth date, time, and location. Use online
              birth chart calculators or astrology software. The more accurate
              your birth time, the more precise your chart will be, especially
              for houses and rising sign.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
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
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
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
