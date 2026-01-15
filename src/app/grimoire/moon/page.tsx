export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import Moon from '../components/Moon';

export const metadata: Metadata = {
  title: 'Moon Phases: New, Full, Waxing & Waning Meanings - Lunary',
  description:
    "Explore moon phases, full moon names, and lunar wisdom. Learn about the moon's influence on magic and daily life. Discover moon rituals, moon signs, eclipses, and how to work with lunar energy for manifestation and spiritual growth.",
  keywords: [
    'moon phases',
    'lunar cycles',
    'full moon',
    'new moon',
    'moon signs',
    'lunar calendar',
    'moon magic',
    'moon rituals',
    'lunar eclipse',
    'moon in signs',
  ],
  openGraph: {
    title: 'Moon Phases: New, Full, Waxing & Waning Meanings - Lunary',
    description:
      "Explore moon phases, full moon names, and lunar wisdom. Learn about the moon's influence on magic and daily life.",
    type: 'article',
    images: [
      {
        url: '/api/og/grimoire/moon',
        width: 1200,
        height: 630,
        alt: 'Moon Phases Guide - Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moon Phases: New, Full, Waxing & Waning Meanings - Lunary',
    description:
      "Explore moon phases, full moon names, and lunar wisdom. Learn about the moon's influence on magic and daily life.",
    images: ['/api/og/grimoire/moon'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/moon',
  },
};

const phases = [
  {
    name: 'New Moon',
    focus: 'Intentions & fresh starts',
    description:
      'The dark moon invites you to plant seeds, set intentions, and imagine potential. Keep rituals simple and inward.',
  },
  {
    name: 'Waxing Crescent',
    focus: 'Growth & attraction',
    description:
      'Light grows. Focus on action, creative momentum, and drawing energy toward your goals.',
  },
  {
    name: 'First Quarter',
    focus: 'Decision-making',
    description:
      'Obstacles surface. Choose, course-correct, and reinforce commitment before reaching the peak energy.',
  },
  {
    name: 'Waxing Gibbous',
    focus: 'Refinement',
    description:
      'Tweak, troubleshoot, and prepare your intention for fullness. Call in helpers and reflect on feedback.',
  },
  {
    name: 'Full Moon',
    focus: 'Culmination & power',
    description:
      'Energy peaks. Celebrate, manifest, release, and charge tools under luminous brilliance.',
  },
  {
    name: 'Waning Gibbous',
    focus: 'Reflection',
    description:
      'Share, teach, and integrate insights. Keep gratitude journals to honor the harvest.',
  },
  {
    name: 'Last Quarter',
    focus: 'Banishing',
    description:
      'Let go. Cleanse yourself and your space. Remove what no longer serves.',
  },
  {
    name: 'Waning Crescent',
    focus: 'Surrender',
    description:
      'Rest, recuperate, and keep quiet. Prepare for the new cycle with gentle self-care.',
  },
];

const ELEMENTS = [
  {
    element: 'Fire',
    signs: ['Aries', 'Leo', 'Sagittarius'],
    tone: 'Action, courage, willpower',
  },
  {
    element: 'Earth',
    signs: ['Taurus', 'Virgo', 'Capricorn'],
    tone: 'Stability, abundance, grounding',
  },
  {
    element: 'Air',
    signs: ['Gemini', 'Libra', 'Aquarius'],
    tone: 'Ideas, communication, connection',
  },
  {
    element: 'Water',
    signs: ['Cancer', 'Scorpio', 'Pisces'],
    tone: 'Emotion, intuition, healing',
  },
];

const moonTableOfContents = [
  { label: 'Moon Phases & Magic', href: '#phases' },
  { label: 'Moon Signs & Emotions', href: '#signs' },
  { label: 'Rituals & Tools', href: '#rituals' },
  { label: 'Lunar Rhythm Practices', href: '#rhythms' },
  { label: 'Moon Explorer', href: '#moon-explorer' },
];

const relatedItems = [
  {
    name: 'Moon Phases',
    href: '/grimoire/moon/phases',
    type: 'New Moon, Full Moon, and everything in between',
  },
  {
    name: 'Full Moon Names',
    href: '/grimoire/moon/full-moons',
    type: "Traditional names for each month's full moon",
  },
  {
    name: 'Moon Signs',
    href: '/grimoire/moon/signs',
    type: 'Track the daily moon',
  },
  {
    name: 'Moon Rituals',
    href: '/grimoire/moon/rituals',
    type: 'Phase-specific ceremonies',
  },
  {
    name: 'Eclipses',
    href: '/grimoire/eclipses',
    type: 'Hand the reins to destiny',
  },
];

const moonFAQs = [
  {
    question: 'What moon phase is best for love spells?',
    answer:
      'Waxing Moon as it builds toward Full, since it strengthens attraction. New Moon supports new beginnings while Full Moon amplifies everything you set in motion.',
  },
  {
    question: 'How do moon signs affect daily life?',
    answer:
      'The moon spends 2-3 days in each zodiac sign. Fire moons spark action, Earth moons steady, Air moons inspire ideas, and Water moons deepen feeling. Journal your mood vs the current moon sign to see patterns.',
  },
  {
    question: 'What should I do during a Full Moon?',
    answer:
      'Charge crystals, perform gratitude rituals, release what is ready to go, and celebrate your progress. Full Moons widen your focus, so keep intentions clear.',
  },
];

export default function MoonPage() {
  return (
    <>
      <SEOContentTemplate
        title='Moon Phases: New, Full, Waxing & Waning Meanings - Lunary'
        h1='Moon Phases & Lunar Wisdom'
        description="Explore moon phases, full moon names, and lunar wisdom. Learn about the moon's influence on magic and daily life. Discover moon rituals, moon signs, and how to work with lunar energy."
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/moon'
        }
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Moon Phases', href: '/grimoire/moon' },
        ]}
        intro="The moon has been a source of wonder, magic, and guidance for millennia. Its cycles influence tides, emotions, and magical work. Understanding moon phases, full moon names, and lunar correspondences helps you align your practice with natural rhythms and harness the moon's powerful energy. This comprehensive guide covers all aspects of lunar magic, from basic moon phases to advanced moon sign work and eclipse magic."
        meaning='The moon represents the feminine principle, intuition, emotions, and the subconscious. Its 29.5-day cycle mirrors natural rhythms of growth, release, and renewal. Each phase carries distinct energy that powers different kinds of magic.'
        tableOfContents={moonTableOfContents}
        whatIs={{
          question: 'What does the moon symbolize in magic?',
          answer:
            'The moon mirrors the subconscious, cycles of change, and radiant intuition. It governs emotional tides and offers reliable timing markers for planting, releasing, and healing work.',
        }}
        howToWorkWith={[
          'Set intentions at New Moon and grow momentum through Waxing phases',
          'Charge tools and celebrate achievements under Full Moon light',
          'Release blockages and clear energy during Waning Moon',
          'Track the current moon sign to tune emotions into spells',
          'Honor eclipses as portals for transformation and release',
          'Pair lunar phases with corresponding crystals, herbs, and colors',
        ]}
        faqs={moonFAQs}
        relatedItems={relatedItems}
        internalLinks={[
          { text: 'Moon Rituals', href: '/grimoire/moon/rituals' },
          { text: 'Moon Signs', href: '/grimoire/moon/signs' },
          { text: 'Spells & Rituals', href: '/grimoire/spells' },
          { text: 'Birth Chart', href: '/grimoire/birth-chart' },
        ]}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-moon'
            entityKey='moon'
            title='Moon Cosmic Connections'
          />
        }
      >
        <section id='phases' className='mb-12 space-y-6'>
          <h2 className='text-3xl font-light text-zinc-100'>
            Moon Phases & Magic
          </h2>
          <div className='grid gap-4 md:grid-cols-2'>
            {phases.map((phase) => (
              <article
                key={phase.name}
                className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-5'
              >
                <h3 className='text-xl text-zinc-100 font-semibold'>
                  {phase.name}
                </h3>
                <p className='text-zinc-400 text-sm mb-2'>
                  {phase.description}
                </p>
                <p className='text-zinc-300 text-xs uppercase tracking-wide'>
                  Focus: {phase.focus}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id='signs' className='mb-12'>
          <h2 className='text-3xl font-light text-zinc-100'>
            Moon Signs & Emotional Vibes
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            The moon spends 2-3 days in each zodiac sign, tinting your emotions
            and instincts. Fire boosts courage, Earth steadies the heart, Air
            opens your mind, and Water deepens empathy.
          </p>
          <div className='grid gap-4 md:grid-cols-2'>
            {ELEMENTS.map((element) => (
              <div
                key={element.element}
                className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'
              >
                <h3 className='text-xl text-zinc-100 font-semibold'>
                  {element.element}
                </h3>
                <p className='text-zinc-400 text-sm mb-2'>
                  Signs: {element.signs.join(', ')}
                </p>
                <p className='text-zinc-300 text-sm'>{element.tone}</p>
              </div>
            ))}
          </div>
        </section>

        <section id='rituals' className='mb-12 grid gap-4 md:grid-cols-2'>
          <article className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-5'>
            <h2 className='text-2xl font-light text-zinc-100 mb-3'>
              Rituals & Tools
            </h2>
            <ul className='list-disc list-inside space-y-2 text-zinc-300'>
              <li>Craft moon water under the Full or New Moon for charging.</li>
              <li>
                Write intentions during the New Moon and review them often.
              </li>
              <li>Use silver or white candles to honor lunar illumination.</li>
              <li>
                Charge crystals on moonlit sills or place them in moonlight
                jars.
              </li>
              <li>
                Blend lunar herbs like mugwort, jasmine, or chamomile into teas
                and baths.
              </li>
            </ul>
          </article>
          <article className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-5'>
            <h2 className='text-2xl font-light text-zinc-100 mb-3'>
              Lunar Rhythm Practices
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              Journal the moon's mood, intensity, and dreams. Track when the
              moon touches key natal points to reveal repeating themes. Repeat
              breathwork, movement, or intention-led art on the same phase each
              month to build ritual muscle memory.
            </p>
            <p className='text-zinc-400 text-sm mt-3'>
              Pair lunar tracking with shadow work and gratitude to stay
              balanced across each phase.
            </p>
          </article>
        </section>

        <section id='moon-explorer'>
          <div className='rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950/60 p-6'>
            <h2 className='text-3xl font-light text-zinc-100 mb-4'>
              Moon Explorer
            </h2>
            <p className='text-zinc-300 mb-6'>
              Scroll the interactive lunar visual below to see current and
              upcoming phases, names, and energies.
            </p>
            <Moon />
          </div>
        </section>
      </SEOContentTemplate>
    </>
  );
}
