import { Metadata } from 'next';
import Link from 'next/link';
import { Orbit } from 'lucide-react';
import {
  PLANETS,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
} from '@/constants/seo/aspects';

export const metadata: Metadata = {
  title: 'Planets in Astrology: Complete Guide | Lunary',
  description:
    'Explore all planets in astrology and their meanings. Learn how the Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto influence your birth chart.',
  keywords: [
    'planets astrology',
    'astrological planets',
    'planet meanings',
    'birth chart planets',
    'planetary influences',
    'astrology guide',
  ],
  openGraph: {
    title: 'Planets in Astrology | Lunary',
    description:
      'Explore all planets in astrology and their meanings in your birth chart.',
    url: 'https://lunary.app/grimoire/planets',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/planets',
  },
};

const planetInfo: Record<
  string,
  { description: string; rules: string; category: string }
> = {
  sun: {
    description: 'Your core identity, ego, and life purpose',
    rules: 'Leo',
    category: 'Personal',
  },
  moon: {
    description: 'Emotions, instincts, and subconscious patterns',
    rules: 'Cancer',
    category: 'Personal',
  },
  mercury: {
    description: 'Communication, thinking, and learning',
    rules: 'Gemini & Virgo',
    category: 'Personal',
  },
  venus: {
    description: 'Love, beauty, values, and pleasure',
    rules: 'Taurus & Libra',
    category: 'Personal',
  },
  mars: {
    description: 'Action, desire, energy, and assertion',
    rules: 'Aries',
    category: 'Personal',
  },
  jupiter: {
    description: 'Growth, expansion, luck, and wisdom',
    rules: 'Sagittarius',
    category: 'Social',
  },
  saturn: {
    description: 'Structure, discipline, responsibility, and lessons',
    rules: 'Capricorn',
    category: 'Social',
  },
  uranus: {
    description: 'Innovation, rebellion, sudden change',
    rules: 'Aquarius',
    category: 'Transpersonal',
  },
  neptune: {
    description: 'Dreams, intuition, spirituality, and illusion',
    rules: 'Pisces',
    category: 'Transpersonal',
  },
  pluto: {
    description: 'Transformation, power, death and rebirth',
    rules: 'Scorpio',
    category: 'Transpersonal',
  },
};

export default function PlanetsIndexPage() {
  const personalPlanets = PLANETS.filter(
    (p) => planetInfo[p]?.category === 'Personal',
  );
  const socialPlanets = PLANETS.filter(
    (p) => planetInfo[p]?.category === 'Social',
  );
  const transpersonalPlanets = PLANETS.filter(
    (p) => planetInfo[p]?.category === 'Transpersonal',
  );

  const renderPlanetCard = (planet: (typeof PLANETS)[number]) => (
    <Link
      key={planet}
      href={`/grimoire/planets/${planet}`}
      className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
    >
      <div className='flex items-center gap-3 mb-3'>
        <span className='text-3xl'>{PLANET_SYMBOLS[planet]}</span>
        <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
          {PLANET_DISPLAY[planet]}
        </h3>
      </div>
      <p className='text-sm text-zinc-400 mb-2'>
        {planetInfo[planet]?.description}
      </p>
      <p className='text-xs text-zinc-500'>
        Rules: {planetInfo[planet]?.rules}
      </p>
    </Link>
  );

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Orbit className='w-16 h-16 text-lunary-primary-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Planets in Astrology
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Each planet represents a different aspect of your psyche and life
            experience. Together, they form the cosmic blueprint of your birth
            chart.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Understanding Planetary Influence
          </h2>
          <p className='text-zinc-400'>
            In astrology, planets are divided into three categories: Personal
            planets (Sun through Mars) move quickly and shape your personality.
            Social planets (Jupiter and Saturn) influence your role in society.
            Transpersonal planets (Uranus, Neptune, Pluto) represent
            generational and transformative forces.
          </p>
        </div>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Personal Planets
          </h2>
          <p className='text-zinc-400 mb-6'>
            These fast-moving planets shape your core personality, daily
            experiences, and how you interact with the world.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {personalPlanets.map(renderPlanetCard)}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Social Planets
          </h2>
          <p className='text-zinc-400 mb-6'>
            Jupiter and Saturn influence how you grow within society and the
            lessons you learn over longer periods.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {socialPlanets.map(renderPlanetCard)}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Transpersonal Planets
          </h2>
          <p className='text-zinc-400 mb-6'>
            These slow-moving outer planets represent generational influences
            and deep transformative experiences.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {transpersonalPlanets.map(renderPlanetCard)}
          </div>
        </section>

        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/zodiac'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Zodiac Signs
            </Link>
            <Link
              href='/grimoire/houses'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Houses
            </Link>
            <Link
              href='/grimoire/aspects'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Aspects
            </Link>
            <Link
              href='/grimoire/retrogrades'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Retrogrades
            </Link>
            <Link
              href='/birth-chart'
              className='px-4 py-2 rounded-lg bg-lunary-primary-900/30 text-lunary-primary-300 hover:bg-lunary-primary-900/50 transition-colors'
            >
              Calculate Your Chart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
