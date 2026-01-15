export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import BirthChart from '../components/BirthChart';
import { createQAPageSchema, renderJsonLd } from '@/lib/schema';
import {
  PeopleAlsoAsk,
  BIRTH_CHART_PAA,
} from '@/components/grimoire/PeopleAlsoAsk';

export const metadata: Metadata = {
  title: 'Birth Chart: Planets, Houses & Astrology Guide - Lunary',
  description:
    'Learn about planets, houses, and astrological components. Understand how birth charts are calculated and interpreted. Discover your astrological blueprint and how it influences your life.',
  keywords: [
    'birth chart',
    'natal chart',
    'astrological chart',
    'birth chart reading',
    'planets in astrology',
    'astrological houses',
    'birth chart interpretation',
    'how to read birth chart',
  ],
  openGraph: {
    title: 'Birth Chart: Planets, Houses & Astrology Guide - Lunary',
    description:
      'Learn about planets, houses, and astrological components. Understand how birth charts are calculated and interpreted.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Birth Chart: Planets, Houses & Astrology Guide - Lunary',
    description:
      'Learn about planets, houses, and astrological components. Understand how birth charts are calculated and interpreted.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/birth-chart',
  },
};

const tableOfContents = [
  { label: 'What Is a Birth Chart?', href: '#birth-chart' },
  { label: 'Reading the Components', href: '#components' },
  { label: 'Timing & Transits', href: '#timing' },
  { label: 'Reflection Prompts', href: '#reflection' },
  { label: 'Tools', href: '#tools' },
];

const relatedItems = [
  {
    name: 'Birth Chart Houses',
    href: '/grimoire/birth-chart/houses',
    type: 'Guide',
  },
  { name: 'Astrology Hub', href: '/grimoire/astrology', type: 'Reference' },
  { name: 'Transit Tracker', href: '/grimoire/transits', type: 'Timing' },
];

export default function BirthChartPage() {
  const qaSchema = createQAPageSchema({
    question: 'What is a birth chart?',
    answer:
      'A birth chart (also called a natal chart) is a map of the sky at the exact moment you were born. It shows the positions of all planets, the zodiac signs they were in, and the houses they occupied. Your birth chart reveals your personality, strengths, challenges, and life path. The most important elements are your Sun sign (core identity), Moon sign (emotional nature), and Rising sign (outer personality). To create an accurate birth chart, you need your exact birth time, date, and location.',
    url: 'https://lunary.app/grimoire/birth-chart',
  });

  const sections = (
    <div className='space-y-12'>
      <section id='birth-chart' className='space-y-4'>
        <h2 className='text-2xl font-light text-zinc-100'>
          What Is a Birth Chart?
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          A birth chart maps the sky at the exact moment you were born—down to
          the minute and location. It shows where planets were, which signs they
          occupied, and what houses they fell into. This mapping becomes a
          symbolic reference for personality, gifts, challenges, and timing.
        </p>
        <p className='text-zinc-300 leading-relaxed'>
          Imagine reading the sky like a story: Saturn in your first house
          describes how you show up, Jupiter in your tenth house reveals your
          public growth, and Mercury in the third house shows how you
          communicate. Together they tell the narrative of the soul’s purpose.
        </p>
      </section>

      <section id='components' className='space-y-4'>
        <h2 className='text-2xl font-light text-zinc-100'>
          Reading the Components
        </h2>
        <ul className='list-disc list-inside text-sm text-zinc-300 space-y-2'>
          <li>
            <strong>Planets:</strong> represent active forces—your drives,
            desires, emotions, and intuition.
          </li>
          <li>
            <strong>Signs:</strong> color those planets with tone: fiery Aries,
            grounded Taurus, curious Gemini, etc.
          </li>
          <li>
            <strong>Houses:</strong> show where in life those energies play
            out—self, resources, relationships, career.
          </li>
          <li>
            <strong>Aspects:</strong> describe the relationships between
            planets—flowing trines, tense squares, oppositions, etc.
          </li>
        </ul>
        <p className='text-zinc-400 text-sm'>
          The “Big Three” (Sun, Moon, Rising) give you a quick read: the Sun is
          your core identity, the Moon your emotions, and the Rising sign your
          outer mask. Layers of planets stacked in one sign or house amplify
          that theme, so notice clusters (stelliums) as magnifiers of power and
          focus.
        </p>
      </section>

      <section id='timing' className='space-y-4'>
        <h2 className='text-2xl font-light text-zinc-100'>Timing & Transits</h2>
        <p className='text-zinc-300 leading-relaxed'>
          Transits are current planets moving through your natal chart. When a
          slow planet (Saturn, Uranus, Neptune, Pluto) touches a natal point,
          you feel long-term pressure or evolution. Fast planets bring monthly
          to weekly influences. Track retrogrades, eclipses, and lunations to
          align your actions.
        </p>
        <div className='grid sm:grid-cols-2 gap-4 text-sm text-zinc-300'>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'>
            <p className='font-semibold text-zinc-100'>Retrograde snapshot</p>
            <p>
              Use retrogrades to review, revise, and integrate lessons rather
              than launch.
            </p>
          </div>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'>
            <p className='font-semibold text-zinc-100'>Eclipse & lunation</p>
            <p>
              Eclipses accelerate endings or beginnings. Track them by house for
              dramatic resets.
            </p>
          </div>
        </div>
      </section>

      <section id='reflection' className='space-y-4'>
        <h2 className='text-2xl font-light text-zinc-100'>
          Reflection Prompts
        </h2>
        <ul className='list-decimal list-inside text-sm text-zinc-300 space-y-2'>
          <li>
            Which house has the most planets, and what life area does it
            highlight?
          </li>
          <li>How do your Sun, Moon, and Rising signs agree or contrast?</li>
          <li>What recurring transits have shaped your recent seasons?</li>
        </ul>
        <p className='text-sm text-zinc-400 leading-relaxed'>
          Ask: What transit has been occurring during this season? How has it
          mirrored attempts to pivot or revisit an old lesson? Writing it down
          reveals the living story behind the chart.
        </p>
      </section>

      <section id='tools' className='space-y-4'>
        <h2 className='text-2xl font-light text-zinc-100'>Tools</h2>
        <p className='text-zinc-300 leading-relaxed'>
          Use calculators, avatars, and printable charts to explore your
          placements in depth.
        </p>
        <ul className='list-disc list-inside text-sm text-zinc-300 space-y-1'>
          <li>Check your house cusps for accurate timing.</li>
          <li>
            Match planet-sign combinations with tarot or journaling prompts.
          </li>
          <li>Layer astrology with numerology or magic for rituals.</li>
        </ul>
      </section>

      <section id='interpretation' className='space-y-4'>
        <h2 className='text-2xl font-light text-zinc-100'>
          Interpretation Workflow
        </h2>
        <p className='text-sm text-zinc-300 leading-relaxed'>
          Start with the planets in signs to understand style, then layer in
          houses to ground the expression. Next, trace aspects to see how
          planets talk to each other—these conversations reveal tension or
          harmony. Finally, fold in transits or progressions so you can apply
          the chart to a timeline. Repeat the sweep for each chart once you feel
          comfortable.
        </p>
      </section>

      <section id='faq' className='space-y-4'>
        <h2 className='text-2xl font-light text-zinc-100'>People Also Ask</h2>
        <PeopleAlsoAsk questions={BIRTH_CHART_PAA} />
      </section>
    </div>
  );

  return (
    <>
      {renderJsonLd(qaSchema)}
      <SEOContentTemplate
        title='Birth Chart: Planets, Houses & Astrology Guide - Lunary'
        h1='Birth Chart'
        description='Learn about planets, houses, and astrological components. Understand how birth charts are calculated and interpreted. Discover your astrological blueprint.'
        keywords={[
          'birth chart',
          'natal chart',
          'astrological chart',
          'birth chart reading',
          'planets in astrology',
          'astrological houses',
        ]}
        canonicalUrl='https://lunary.app/grimoire/birth-chart'
        tableOfContents={tableOfContents}
        intro='Your birth chart (natal chart) is a snapshot of the sky at the moment you were born. It reveals your astrological blueprint—the positions of planets, signs, houses, and aspects that influence your personality, life path, and potential. Understanding your birth chart helps you understand yourself deeply, recognize your strengths and challenges, and align with your true purpose. This comprehensive guide covers all components of birth charts and how to interpret them.'
        meaning={`A birth chart maps the positions of planets, signs, and houses at your exact moment of birth. Each component reveals different aspects of your personality and life experience. Planets represent different parts of your psyche and life areas. Signs show how those planets express themselves. Houses indicate where in your life these energies manifest. Aspects show how planets interact with each other.

The Big Three—Sun, Moon, and Rising (Ascendant)—form the foundation of your personality. Your Sun sign represents your core identity and ego. Your Moon sign shows your emotional nature and inner needs. Your Rising sign reveals how others see you and your outer personality.

Understanding your birth chart helps you recognize your natural talents, work with your challenges, and make choices aligned with your authentic self. It's a tool for self-discovery and personal growth.`}
        howToWorkWith={[
          'Calculate your birth chart with exact birth time and location',
          'Learn the meaning of each planet in your chart',
          'Understand your Sun, Moon, and Rising signs',
          'Study the houses and what they represent',
          'Learn about aspects between planets',
          'Understand planetary retrogrades in your chart',
          'Use your chart for timing important decisions',
          'Combine astrology with other divination methods',
        ]}
        faqs={[
          {
            question: 'Do I need my exact birth time for a birth chart?',
            answer:
              'Yes! Your exact birth time determines your Rising sign and house cusps, which are crucial for accurate chart interpretation. Without it, you can still see planet and sign positions, but houses will be approximate. Check your birth certificate or ask family members.',
          },
          {
            question:
              'What is the difference between Sun, Moon, and Rising signs?',
            answer:
              'Your Sun sign is your core identity—who you are at your essence. Your Moon sign is your emotional nature and inner needs—how you feel. Your Rising sign (Ascendant) is your outer personality and how others see you—your mask and first impression. All three work together to create your complete personality.',
          },
          {
            question: 'Can my birth chart change?',
            answer:
              "Your birth chart never changes—it's fixed at your moment of birth. However, transits (current planetary positions) aspect your natal chart, creating different influences over time. Progressions and solar returns also show how you evolve while your natal chart remains constant.",
          },
        ]}
        internalLinks={[
          { text: 'Astronomy & Astrology', href: '/grimoire/astronomy' },
          { text: 'Moon Phases', href: '/grimoire/moon' },
          { text: 'Numerology', href: '/grimoire/numerology' },
          { text: 'Birth Chart Houses', href: '/grimoire/birth-chart/houses' },
        ]}
        relatedItems={relatedItems}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-birth-chart'
            entityKey='birth-chart'
            title='Chart Connections'
          />
        }
        ctaText='Download your natal chart worksheet'
        ctaHref='/birth-chart'
      >
        {sections}
      </SEOContentTemplate>
      <div className='max-w-4xl mx-auto p-4'>
        <BirthChart />
      </div>
    </>
  );
}
