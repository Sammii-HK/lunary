export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import Astronomy from '../components/Astronomy';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import { ZODIAC_SIGNS } from '../../../../utils/zodiac/zodiac';

export const metadata: Metadata = {
  title: 'Astronomy & Astrology: Planets & Zodiac Signs - Lunary',
  description:
    'Learn about planets, zodiac signs, and astronomical knowledge. Understand the cosmic forces that shape our world and influence magical practice. Comprehensive guide to planetary magic, zodiac sign meanings, and astrological correspondences.',
  keywords: [
    'astronomy',
    'planets',
    'zodiac signs',
    'astronomical data',
    'celestial bodies',
    'astronomical calculations',
    'planetary magic',
    'astrology guide',
    'zodiac meanings',
  ],
  openGraph: {
    title: 'Astronomy & Astrology: Planets & Zodiac Signs - Lunary',
    description:
      'Learn about planets, zodiac signs, and astronomical knowledge. Understand the cosmic forces that shape our world.',
    type: 'article',
    images: [
      {
        url: '/api/og/grimoire/astronomy',
        width: 1200,
        height: 630,
        alt: 'Astronomy & Astrology Guide - Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astronomy & Astrology: Planets & Zodiac Signs - Lunary',
    description:
      'Learn about planets, zodiac signs, and astronomical knowledge. Understand the cosmic forces that shape our world.',
    images: ['/api/og/grimoire/astronomy'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/astronomy',
  },
};

const PLANETARY_HIGHLIGHTS = [
  {
    planet: 'Sun',
    focus: 'core identity',
    tooltip: 'Ego, vitality, purpose, and the conscious self.',
  },
  {
    planet: 'Moon',
    focus: 'emotional body',
    tooltip: 'Feelings, instincts, memory, and rhythm.',
  },
  {
    planet: 'Mercury',
    focus: 'communication',
    tooltip: 'Thought, travel, storytelling, and commerce.',
  },
  {
    planet: 'Venus',
    focus: 'relationships',
    tooltip: 'Love, beauty, money, and pleasure.',
  },
  {
    planet: 'Mars',
    focus: 'action',
    tooltip: 'Drive, courage, assertiveness, and passion.',
  },
  {
    planet: 'Jupiter',
    focus: 'expansion',
    tooltip: 'Growth, abundance, wisdom, and teaching.',
  },
  {
    planet: 'Saturn',
    focus: 'structure',
    tooltip: 'Discipline, boundaries, and karmic lessons.',
  },
  {
    planet: 'Uranus',
    focus: 'innovation',
    tooltip: 'Change, rebellion, genius flashes, and technology.',
  },
  {
    planet: 'Neptune',
    focus: 'mystery',
    tooltip: 'Dreams, imagination, healing, and dissolving limits.',
  },
  {
    planet: 'Pluto',
    focus: 'transformation',
    tooltip: 'Power, regeneration, shadow, and rebirth cycles.',
  },
];

const ELEMENTS = [
  {
    element: 'Fire',
    signs: ['Aries', 'Leo', 'Sagittarius'],
    tone: 'action, will, courage',
  },
  {
    element: 'Earth',
    signs: ['Taurus', 'Virgo', 'Capricorn'],
    tone: 'stability, prosperity, grounding',
  },
  {
    element: 'Air',
    signs: ['Gemini', 'Libra', 'Aquarius'],
    tone: 'ideas, communication, relationships',
  },
  {
    element: 'Water',
    signs: ['Cancer', 'Scorpio', 'Pisces'],
    tone: 'emotion, intuition, healing',
  },
];

const tableOfContents = [
  { label: 'Understanding the Planets', href: '#planets' },
  { label: 'Zodiac Signs & Elements', href: '#zodiac' },
  { label: 'Planetary Days & Timing', href: '#timing' },
  { label: 'Transits & Retrogrades', href: '#transits' },
  { label: 'Sky to Altar Workflow', href: '#workflow' },
  { label: 'Astronomy Explorer', href: '#astronomy-explorer' },
];

const relatedItems = [
  {
    name: 'Zodiac Signs',
    href: '/grimoire/zodiac',
    type: 'Meanings, glyphs, and elemental qualities',
  },
  {
    name: 'Planets & Houses',
    href: '/grimoire/astronomy/planets',
    type: 'Deep planetary correspondences and placements',
  },
  {
    name: 'Transits',
    href: '/grimoire/transits',
    type: 'Understand current cycles and timing',
  },
];

const planetaryFAQs = [
  {
    question: 'How do planets influence magic?',
    answer:
      'Each planet rules specific areas of life and carries unique energy. For example, Venus rules love and beauty, so love spells work best on Venus day (Friday) or when Venus is strong. Understanding planetary influences helps you time spells optimally.',
  },
  {
    question: 'What are planetary correspondences?',
    answer:
      'Planetary correspondences link planets to colors, herbs, crystals, days, and magical purposes. For example, Mercury corresponds to yellow, communication herbs, Wednesday, and mental work. Using these correspondences aligns your magic with planetary energy.',
  },
  {
    question: 'How do zodiac signs affect daily magic?',
    answer:
      'The moon moves through zodiac signs every 2-3 days, influencing emotional energy. Moon in Fire signs supports action and passion. Moon in Water signs enhances intuition and emotions. Aligning your practice with moon signs adds another layer of power.',
  },
];

export default function AstronomyPage() {
  const zodiacListSchema = createItemListSchema({
    name: 'Complete Zodiac Signs Guide',
    description:
      'Learn about all 12 zodiac signs, their meanings, traits, and astrological correspondences.',
    url: 'https://lunary.app/grimoire/astronomy',
    items: ZODIAC_SIGNS.map((sign) => ({
      name: `${sign} Zodiac Sign`,
      url: `https://lunary.app/grimoire/zodiac/${sign.toLowerCase()}`,
      description: `Complete guide to ${sign} zodiac sign traits, meaning, and correspondences.`,
    })),
  });

  const planetsListSchema = createItemListSchema({
    name: 'Planets in Astrology',
    description:
      'Explore the astrological meanings and influences of all planets.',
    url: 'https://lunary.app/grimoire/astronomy',
    items: [
      {
        name: 'Sun',
        url: 'https://lunary.app/grimoire/astronomy/planets/sun',
        description: 'The Sun represents ego, identity, and vitality.',
      },
      {
        name: 'Moon',
        url: 'https://lunary.app/grimoire/astronomy/planets/moon',
        description:
          'The Moon governs emotions, intuition, and the subconscious.',
      },
      {
        name: 'Mercury',
        url: 'https://lunary.app/grimoire/astronomy/planets/mercury',
        description: 'Mercury rules communication, intellect, and travel.',
      },
      {
        name: 'Venus',
        url: 'https://lunary.app/grimoire/astronomy/planets/venus',
        description: 'Venus governs love, beauty, and relationships.',
      },
      {
        name: 'Mars',
        url: 'https://lunary.app/grimoire/astronomy/planets/mars',
        description: 'Mars represents action, passion, and drive.',
      },
      {
        name: 'Jupiter',
        url: 'https://lunary.app/grimoire/astronomy/planets/jupiter',
        description: 'Jupiter brings expansion, luck, and wisdom.',
      },
      {
        name: 'Saturn',
        url: 'https://lunary.app/grimoire/astronomy/planets/saturn',
        description: 'Saturn represents discipline, structure, and karma.',
      },
      {
        name: 'Uranus',
        url: 'https://lunary.app/grimoire/astronomy/planets/uranus',
        description: 'Uranus brings innovation, rebellion, and sudden change.',
      },
      {
        name: 'Neptune',
        url: 'https://lunary.app/grimoire/astronomy/planets/neptune',
        description: 'Neptune governs dreams, spirituality, and illusion.',
      },
      {
        name: 'Pluto',
        url: 'https://lunary.app/grimoire/astronomy/planets/pluto',
        description: 'Pluto represents transformation, power, and rebirth.',
      },
    ],
  });

  return (
    <>
      {renderJsonLd(zodiacListSchema)}
      {renderJsonLd(planetsListSchema)}
      <SEOContentTemplate
        title='Astronomy & Astrology: Planets & Zodiac Signs - Lunary'
        h1='Astronomy & Astrology'
        description='Learn about planets, zodiac signs, and astronomical knowledge. Understand the cosmic forces that shape our world and influence magical practice.'
        keywords={metadata.keywords as string[]}
        canonicalUrl={metadata.alternates?.canonical as string}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Astronomy & Astrology', href: '/grimoire/astronomy' },
        ]}
        intro='Astronomy and astrology connect us to the cosmos. Understanding planetary movements, zodiac signs, and celestial correspondences helps you align your magic with cosmic energies and deepen your connection to the universe.'
        tldr='Blend astronomy (observable sky data) with astrology (symbolic meaning) to time rituals, understand planetary moods, and align daily practice with cosmic cycles.'
        meaning='Astronomy studies the precise motions of planets, while astrology applies those motions to map archetypal energies onto questions of meaning and timing. Use both to read the sky and your inner world with equal clarity.'
        tableOfContents={tableOfContents}
        whatIs={{
          question: 'How do astronomy and astrology work together?',
          answer:
            'Astronomy tracks planetary and stellar positions to the second. Astrology translates that precision into symbolic meaning so you can craft rituals, timing, and personal growth around living cycles.',
        }}
        howToWorkWith={[
          'Tag each spell with a planetary ruler for extra clarity',
          'Match zodiac elements to your intention (Fire for courage, Water for healing)',
          'Use planetary days for timing (Venus Friday for love, Mars Tuesday for action)',
          'Watch retrogrades as review periods before pushing forward',
          'Combine planetary and zodiac correspondences in herb, crystal, and color choices',
        ]}
        faqs={planetaryFAQs}
        relatedItems={relatedItems}
        internalLinks={[
          { text: 'Birth Chart Guide', href: '/grimoire/birth-chart' },
          { text: 'Moon Phases', href: '/grimoire/moon' },
          { text: 'Transits', href: '/grimoire/transits' },
        ]}
        cosmicConnectionsParams={{
          entityType: 'hub-astronomy',
          entityKey: 'astronomy',
        }}
        ctaText='Explore your personalized cosmic dashboard'
        ctaHref='/forecast'
      >
        <section id='planets' className='mb-12'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            Understanding the Planets
          </h2>
          <p className='text-zinc-300 mb-4'>
            Each planet rules a distinct slice of the psyche. These highlights
            help you match energy with intention when planning rituals.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {PLANETARY_HIGHLIGHTS.map((item) => (
              <article
                key={item.planet}
                className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'
              >
                <h3 className='text-xl text-zinc-100 font-semibold'>
                  {item.planet}
                </h3>
                <p className='text-zinc-400 text-sm mb-2'>
                  Focus: {item.focus}
                </p>
                <p className='text-zinc-300 text-sm'>{item.tooltip}</p>
              </article>
            ))}
          </div>
        </section>

        <section id='zodiac' className='mb-12'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            Zodiac Signs & Elements
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-6'>
            The zodiac blends twelve archetypes with four elements. Fire for
            courage, Earth for stability, Air for thought, and Water for
            feeling. Layer these qualities into your spells.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {ELEMENTS.map((item) => (
              <div
                key={item.element}
                className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'
              >
                <h3 className='text-xl text-zinc-100 font-semibold'>
                  {item.element}
                </h3>
                <p className='text-zinc-400 text-sm mb-2'>
                  Signs: {item.signs.join(', ')}
                </p>
                <p className='text-zinc-300 text-sm'>{item.tone}</p>
              </div>
            ))}
          </div>
        </section>

        <section id='timing' className='mb-12'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            Planetary Days & Timing
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            Each day of the week carries a planetary ruler. Align rituals to
            that energy for stronger resonance.
          </p>
          <ul className='list-disc list-inside text-zinc-300 space-y-2'>
            <li>Sunday → Sun: vitality, healing, leadership</li>
            <li>Monday → Moon: intuition, emotions, home</li>
            <li>Tuesday → Mars: courage, action, boundary-setting</li>
            <li>Wednesday → Mercury: communication, commerce, study</li>
            <li>Thursday → Jupiter: luck, learning, generosity</li>
            <li>Friday → Venus: love, beauty, pleasure</li>
            <li>Saturday → Saturn: protection, structure, release</li>
          </ul>
          <p className='text-zinc-400 text-sm mt-4'>
            Layer planetary hours on top of the day ruler for even deeper timing
            precision.
          </p>
        </section>

        <section id='transits' className='mb-12'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            Transits & Retrogrades
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            Transits are the current movements of planets over your natal chart.
            Retrogrades pull energy inward—use them for review, not big
            launches.
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            Track Lunary's transit coverage so you know when Mercury slows your
            tech, Venus asks for tenderness, or Saturn tests boundaries. Every
            transit colors the narrative you can incorporate into ritual
            planning.
          </p>
        </section>

        <section
          id='workflow'
          className='mb-12 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-4'
        >
          <h2 className='text-3xl font-light text-zinc-100'>
            From Sky to Altar Workflow
          </h2>
          <ol className='list-decimal list-inside text-zinc-300 space-y-2'>
            <li>
              <strong>Check the sky.</strong> Note current transits, moon phase,
              and any retrogrades. Screenshot or jot the planetary degrees.
            </li>
            <li>
              <strong>Match correspondences.</strong> Choose colors, herbs,
              crystals, and tarot keys that echo the ruling planet or sign.
            </li>
            <li>
              <strong>Set intention.</strong> Write a sentence that combines the
              planetary lesson (e.g., Saturn discipline) with your practical
              goal.
            </li>
            <li>
              <strong>Anchor action.</strong> Schedule a tangible task—ritual
              bath, journal session, or focused work sprint—during the aligned
              planetary hour.
            </li>
            <li>
              <strong>Reflect.</strong> After the ritual, note results and
              sensations so you can fine tune timing for the next cycle.
            </li>
          </ol>
          <p className='text-zinc-400 text-sm'>
            Repeating this loop turns cosmic theory into lived experience and
            keeps your Book of Shadows grounded in direct observation.
          </p>
        </section>

        <section id='astronomy-explorer'>
          <div className='rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950/60 p-6'>
            <h2 className='text-3xl font-light text-zinc-100 mb-6'>
              Astronomy Explorer
            </h2>
            <p className='text-zinc-300 mb-6'>
              Dive into the interactive component for planetary visuals, zodiac
              anchors, and curated layouts that reinforce what you just learned.
            </p>
            <Astronomy />
          </div>
        </section>
      </SEOContentTemplate>
    </>
  );
}
