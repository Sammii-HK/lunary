import { Metadata } from 'next';
import Link from 'next/link';
import { Orbit } from 'lucide-react';
import {
  PLANETS,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
} from '@/constants/seo/aspects';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

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

  const planetsListSchema = createItemListSchema({
    name: 'Planets in Astrology',
    description:
      'Complete guide to all planets in astrology, their meanings, and influences in the birth chart.',
    url: 'https://lunary.app/grimoire/planets',
    items: PLANETS.map((planet) => ({
      name: PLANET_DISPLAY[planet],
      url: `https://lunary.app/grimoire/planets/${planet}`,
      description: planetInfo[planet]?.description || '',
    })),
  });

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
    <>
      {renderJsonLd(planetsListSchema)}
      <SEOContentTemplate
        title='Planets in Astrology: Complete Guide'
        h1='Planets in Astrology'
        description='Each planet represents a different aspect of your psyche and life experience. Together, they form the cosmic blueprint of your birth chart.'
        keywords={[
          'planets astrology',
          'astrological planets',
          'planet meanings',
          'birth chart planets',
          'planetary influences',
        ]}
        canonicalUrl='https://lunary.app/grimoire/planets'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Planets' },
        ]}
        whatIs={{
          question: 'What do planets represent in astrology?',
          answer:
            "In astrology, planets represent different aspects of your personality, drives, and life experiences. Personal planets (Sun, Moon, Mercury, Venus, Mars) shape your core traits and daily life. Social planets (Jupiter, Saturn) influence growth and structure. Transpersonal planets (Uranus, Neptune, Pluto) represent generational and transformative forces. Each planet's sign and house placement reveals how and where its energy expresses in your life.",
        }}
        tldr='10 planets shape your chart: Personal planets (Sun = identity, Moon = emotions, Mercury = mind, Venus = love, Mars = action) move fast and shape personality. Social planets (Jupiter = expansion, Saturn = structure) influence society role. Outer planets (Uranus, Neptune, Pluto) = generational transformation.'
        intro='In astrology, planets are divided into three categories: Personal planets (Sun through Mars) move quickly and shape your personality. Social planets (Jupiter and Saturn) influence your role in society. Transpersonal planets (Uranus, Neptune, Pluto) represent generational and transformative forces.'
        faqs={[
          {
            question: 'Which planets are most important in my birth chart?',
            answer:
              'The Sun, Moon, and Rising sign (the "Big Three") are most important for understanding your core personality. After that, planets in your 1st house or conjunct angles (ASC, MC) have strong influence. Personal planets (Mercury, Venus, Mars) shape daily experience.',
          },
          {
            question: 'What does it mean when a planet rules a sign?',
            answer:
              'Each zodiac sign has a planetary ruler that expresses naturally in that sign. For example, Mars rules Aries, so Mars energy (action, assertion) is at home in Aries. When a planet is in its ruling sign, its expression is strengthened.',
          },
          {
            question: 'Do outer planets affect me personally?',
            answer:
              'Outer planets (Uranus, Neptune, Pluto) move slowly and affect entire generations. However, they become personal when aspecting your natal planets or transiting sensitive chart points, triggering major life transformations.',
          },
        ]}
        relatedItems={[
          { name: 'Zodiac Signs', href: '/grimoire/zodiac', type: 'topic' },
          { name: 'Houses', href: '/grimoire/houses', type: 'topic' },
          { name: 'Aspects', href: '/grimoire/aspects', type: 'topic' },
          { name: 'Retrogrades', href: '/grimoire/retrogrades', type: 'topic' },
        ]}
      >
        <div className='space-y-12'>
          <section>
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

          <section>
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

          <section>
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

          <div className='flex flex-wrap gap-3 pt-4'>
            <Link
              href='/birth-chart'
              className='px-4 py-2 rounded-lg bg-lunary-primary-900/30 text-lunary-primary-300 hover:bg-lunary-primary-900/50 transition-colors'
            >
              Calculate Your Chart
            </Link>
          </div>
        </div>
      </SEOContentTemplate>
    </>
  );
}
