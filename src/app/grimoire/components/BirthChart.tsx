'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { stringToKebabCase } from '../../../../utils/string';
import { Heading } from '@/components/ui/Heading';
import { BookOpenIcon, HeartIcon } from 'lucide-react';
import symbols from '@/data/symbols.json';
import { cn } from '@/lib/utils';
import { elementColors } from '@/constants/elements';
import { houseMap, housesData } from '@/constants/seo/houses';
import birthChartPlanets from '@/data/birth-chart-planets.json';

type BirthChartPlanet = {
  symbol: string;
  name: string;
  element: string;
  rulingSign: string;
  house: string;
  keywords: string;
  inBirthChart: string;
  inTransits: string;
  characteristics: string;
  retrograde: string;
};

const planets = birthChartPlanets as BirthChartPlanet[];

const houses = Object.values(housesData.houseData).map((house) => ({
  number: house.number,
  area: house.lifeArea,
  name: house.name,
}));

const BirthChart = () => {
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
        <Heading as='h2' variant='h2'>
          Birth Chart Guide
        </Heading>
        <p className='text-xs md:text:sm text-zinc-400'>
          Learn about planets, houses, aspects, retrogrades, and astrological
          components
        </p>
      </div>

      {/* Complete Guide Banner */}
      <Link
        href='/grimoire/guides/birth-chart-complete-guide'
        className='block p-4 rounded-lg bg-gradient-to-r from-lunary-primary-900/30 to-lunary-rose-900/30 border border-lunary-primary-700 hover:border-lunary-primary-500 group'
      >
        <div className='flex items-center justify-between'>
          <div>
            <Heading
              as='h3'
              variant='h4'
              className='text-lunary-primary-300 group-hover:text-lunary-primary-200 flex gap-2 items-center'
            >
              <BookOpenIcon className='w-4 h-4 mr-2 text-lunary-primary-300' />{' '}
              Read the Complete Birth Chart Guide
            </Heading>
            <p className='text-xs md:text:sm text-zinc-400'>
              In-depth tutorial on reading and interpreting your natal chart
            </p>
          </div>
          <span className='text-lunary-primary-400 group-hover:text-lunary-primary-300'>
            →
          </span>
        </div>
      </Link>

      <section id='planets' className='space-y-4'>
        <div>
          <Heading as='h2' variant='h2'>
            Planets — &quot;The What&quot;
          </Heading>
          <p className='text-xs md:text:sm text-zinc-400 mb-4'>
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
                <div className='flex gap-3 mb-3 items-center'>
                  <span className='text-3xl text-zinc-500 font-astro flex-shrink-0'>
                    {
                      symbols.bodies[
                        planet.name.toLowerCase() as keyof typeof symbols.bodies
                      ]
                    }
                  </span>
                  <div className='min-w-0 flex items-center align-middle justify-between flex-1'>
                    <Heading
                      as='h3'
                      variant='h2'
                      className='text-zinc-100 mb-0'
                    >
                      {planet.name}
                    </Heading>
                    <div className='flex flex-wrap gap-1 mb-2'>
                      <span
                        className={cn(
                          'text-xs pr-2 py-0.5 rounded',
                          elementColors[
                            planet.element as keyof typeof elementColors
                          ],
                        )}
                      >
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
                    <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
                      {planet.inBirthChart}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-zinc-400 mb-1 font-medium'>
                      Characteristics:
                    </p>
                    <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
                      {planet.characteristics}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-zinc-400 mb-1 font-medium'>
                      In Transits:
                    </p>
                    <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
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
        <Heading as='h2' variant='h2'>
          Houses — &quot;The Where&quot;
        </Heading>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {houses.map((house) => {
            const houseNumber = house.number;
            const houseSlug = houseMap[houseNumber] || house.name;
            return (
              <Link
                key={house.number}
                href={`/grimoire/houses/overview/${houseSlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
              >
                <div className='flex items-start gap-3'>
                  <span className='font-medium text-zinc-100 text-xs md:text:sm group-hover:text-lunary-primary-400'>
                    {house.number}
                  </span>
                  <p className='text-xs md:text:sm text-zinc-300 flex-1'>
                    {house.area}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id='aspects' className='space-y-4'>
        <Heading as='h2' variant='h2'>
          Aspects — Planetary Relationships
        </Heading>
        <p className='text-xs md:text:sm text-zinc-400 mb-4'>
          Aspects are angles between planets that show how planetary energies
          interact in your chart. They reveal strengths, challenges, and dynamic
          interactions.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <Link
            href='/grimoire/aspects/types/conjunction'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <Heading
              as='h3'
              variant='h3'
              className=' text-lunary-success group-hover:text-lunary-success-300'
            >
              Conjunction (0°)
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
              Planets merge their energies, intensifying their influence. Can be
              harmonious or challenging depending on the planets involved.
            </p>
          </Link>
          <Link
            href='/grimoire/aspects/types/opposition'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <Heading
              as='h3'
              variant='h3'
              className=' text-lunary-rose group-hover:text-lunary-rose-300'
            >
              Opposition (180°)
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
              Planets face each other, creating tension and balance. Often
              represents internal conflict or complementary forces needing
              integration.
            </p>
          </Link>
          <Link
            href='/grimoire/aspects/types/trine'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <Heading
              as='h3'
              variant='h3'
              className=' text-lunary-secondary group-hover:text-lunary-secondary-300'
            >
              Trine (120°)
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
              Harmonious flow between planets. Natural talents and ease, but can
              lead to complacency if not actively developed.
            </p>
          </Link>
          <Link
            href='/grimoire/aspects/types/square'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <Heading
              as='h3'
              variant='h3'
              className=' text-lunary-accent group-hover:text-lunary-accent-300'
            >
              Square (90°)
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
              Creates friction and challenges that force growth. While
              difficult, squares build strength, resilience, and determination.
            </p>
          </Link>
          <Link
            href='/grimoire/aspects/types/sextile'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <Heading
              as='h3'
              variant='h3'
              className=' text-lunary-primary-400 group-hover:text-lunary-primary-300'
            >
              Sextile (60°)
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
              Opportunities and ease between planets. Less intense than trines,
              requiring some effort to activate. Good for creative
              opportunities.
            </p>
          </Link>
        </div>
      </section>

      <section id='retrogrades' className='space-y-4'>
        <Heading as='h2' variant='h2'>
          Retrogrades — Inner Reflection
        </Heading>
        <p className='text-xs md:text:sm text-zinc-400 mb-4'>
          When planets appear to move backward, their energy turns inward. This
          is a time for review, reflection, and reconnection rather than forward
          action.
        </p>
        <div className='space-y-3'>
          <Link
            href='/grimoire/astronomy/retrogrades/mercury'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <Heading
              as='h3'
              variant='h3'
              className='mb-2 group-hover:text-lunary-primary-400'
            >
              Mercury Retrograde
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed mb-2'>
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
            <Heading
              as='h3'
              variant='h3'
              className='mb-2 group-hover:text-lunary-primary-400'
            >
              Venus Retrograde
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed mb-2'>
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
            <Heading
              as='h3'
              variant='h3'
              className='mb-2 group-hover:text-lunary-primary-400'
            >
              Mars Retrograde
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed mb-2'>
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
          className='block text-xl font-medium text-zinc-100 hover:text-lunary-primary-400'
        >
          <Heading as='h2' variant='h2'>
            Transits — Current Planetary Movements
          </Heading>
        </Link>
        <p className='text-xs md:text:sm text-zinc-400 mb-4'>
          Transits are current planetary positions in relation to your birth
          chart. They show current influences and timing for events and personal
          growth.
        </p>
        <div className='space-y-3'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <Heading as='h3' variant='h3' className='mb-2'>
              Understanding Transits
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
              Transits activate different parts of your chart at different
              times. Major transits (like Saturn Return, Jupiter Return) mark
              significant life periods. Daily transits show day-to-day
              influences and opportunities.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <Heading as='h3' variant='h3'>
              Saturn Return (Age 27-30, 57-60)
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
              A major life transition marking adulthood and responsibility. A
              time of restructuring, facing reality, and building lasting
              foundations. Often brings challenges that lead to maturity.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <Heading as='h3' variant='h3' className='text-lunary-accent mb-2'>
              Jupiter Return (Every 12 years)
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
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
            className='block text-xl font-medium text-zinc-100 mb-2 hover:text-lunary-primary-400'
          >
            <Heading as='h2' variant='h2'>
              Rising Sign (Ascendant)
            </Heading>
          </Link>
          <p className='text-xs md:text:sm text-zinc-400 mb-4'>
            Your rising sign, also called the Ascendant, is the zodiac sign that
            was rising on the eastern horizon at your exact moment of birth. It
            represents your outer personality, how others see you, and your
            approach to life.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <Heading as='h3' variant='h3'>
              What Is the Rising Sign?
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed mb-3'>
              The rising sign changes approximately every 2 hours, making it the
              most time-sensitive part of your chart. It's calculated using:
            </p>
            <ul className='list-disc list-inside text-xs md:text:sm text-zinc-300 space-y-1 ml-4'>
              <li>Your exact birth time (most important)</li>
              <li>Your birth location (latitude/longitude)</li>
              <li>Your birth date</li>
            </ul>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed mt-3'>
              If you don't know your exact birth time, you can use noon as a
              placeholder, but your rising sign may be inaccurate.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <Heading as='h3' variant='h3'>
              Rising Sign Meanings
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed mb-3'>
              Your rising sign influences:
            </p>
            <ul className='list-disc list-inside text-xs md:text:sm text-zinc-300 space-y-1 ml-4'>
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
            <Heading as='h3' variant='h3'>
              How Rising Sign Differs from Sun Sign
            </Heading>
            <div className='space-y-2 text-xs md:text:sm text-zinc-300'>
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
            <Heading as='h3' variant='h3'>
              Rising Sign by Element
            </Heading>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='text-xs md:text:sm font-medium text-zinc-200 mb-1'>
                  Fire Rising (Aries, Leo, Sagittarius)
                </p>
                <p className='text-xs text-zinc-400'>
                  Energetic, confident, action-oriented first impression
                </p>
              </div>
              <div>
                <p className='text-xs md:text:sm font-medium text-zinc-200 mb-1'>
                  Earth Rising (Taurus, Virgo, Capricorn)
                </p>
                <p className='text-xs text-zinc-400'>
                  Grounded, practical, reliable first impression
                </p>
              </div>
              <div>
                <p className='text-xs md:text:sm font-medium text-zinc-200 mb-1'>
                  Air Rising (Gemini, Libra, Aquarius)
                </p>
                <p className='text-xs text-zinc-400'>
                  Communicative, social, intellectual first impression
                </p>
              </div>
              <div>
                <p className='text-xs md:text:sm font-medium text-zinc-200 mb-1'>
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
            className='block text-xl font-medium text-zinc-100 mb-2 hover:text-lunary-primary-400'
          >
            <Heading as='h2' variant='h2'>
              Synastry: Relationship Compatibility
            </Heading>
          </Link>
          <p className='text-xs md:text:sm text-zinc-400 mb-4'>
            Synastry is the comparison of two birth charts to understand
            relationship dynamics, compatibility, and how two people interact.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <Heading as='h3' variant='h3'>
              Understanding Synastry
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed mb-3'>
              Synastry looks at how planets in one person's chart interact with
              planets in another's chart. Key areas to examine:
            </p>
            <ul className='list-disc list-inside text-xs md:text:sm text-zinc-300 space-y-1 ml-4'>
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
            <Heading as='h3' variant='h3'>
              Compatible Aspects
            </Heading>
            <div className='space-y-2 text-xs md:text:sm text-zinc-300'>
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
            <Heading as='h3' variant='h3'>
              Challenging Aspects
            </Heading>
            <div className='space-y-2 text-xs md:text:sm text-zinc-300'>
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
            <Heading as='h3' variant='h3'>
              How to Read Synastry
            </Heading>
            <div className='space-y-2 text-xs md:text:sm text-zinc-300'>
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
            className='block p-4 rounded-lg bg-gradient-to-r from-lunary-rose-900/30 to-lunary-primary-900/30 border border-lunary-rose-700 hover:border-lunary-rose-500 group'
          >
            <div className='flex items-center justify-between'>
              <div>
                <Heading
                  as='h3'
                  variant='h3'
                  className='text-lunary-rose-300 group-hover:text-lunary-rose-200 flex gap-2 items-center'
                >
                  <HeartIcon className='w-5 h-5' />
                  <span>Generate Your Synastry Chart</span>
                </Heading>
                <p className='text-xs md:text:sm text-zinc-400'>
                  Compare two birth charts to discover relationship
                  compatibility
                </p>
              </div>
              <span className='text-lunary-rose-400 group-hover:text-lunary-rose-300'>
                →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section id='faq' className='space-y-6'>
        <Heading as='h2' variant='h2'>
          Frequently Asked Questions
        </Heading>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <Heading as='h3' variant='h3'>
              What is a rising sign (Ascendant)?
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
              Your rising sign is the zodiac sign that was rising on the eastern
              horizon at your exact time of birth. It represents how you present
              yourself to the world, your outward personality, and your first
              impressions. It's calculated using your birth time and location.
              See the Rising Sign section above for detailed information.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <Heading as='h3' variant='h3'>
              How do I find my birth chart?
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
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
            <Heading as='h3' variant='h3'>
              What should I do during Mercury Retrograde?
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
              Focus on review, reflection, and reconnection. Back up important
              data, review contracts carefully, avoid major purchases if
              possible, and be patient with communication. This is a good time
              to finish projects rather than start new ones.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <Heading as='h3' variant='h3'>
              Are square aspects always bad?
            </Heading>
            <p className='text-xs md:text:sm text-zinc-300 leading-relaxed'>
              No, squares create tension that forces growth. They show where you
              need to develop strength and overcome challenges. Many successful
              people have prominent squares in their charts. The friction
              creates motivation and resilience.
            </p>
          </div>
        </div>
      </section>

      <div className='rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 p-6'>
        <Heading as='h3' variant='h3' className='text-zinc-100 mb-3'>
          The Core Logic
        </Heading>
        <p className='text-xs md:text:sm text-zinc-300 leading-relaxed mb-4'>
          Each planet represents a type of energy or motivation, each house
          represents the life area affected, and the sign adds tone and style.
        </p>
        <div className='bg-zinc-900/50 rounded p-4 border border-zinc-800/50'>
          <p className='text-xs md:text:sm text-zinc-200 font-medium'>
            interpretation = planet.energy + sign.expression + house.context
          </p>
        </div>
      </div>
    </div>
  );
};

export default BirthChart;
