import { Metadata } from 'next';
import Link from 'next/link';
import { Circle } from 'lucide-react';

import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

const aspectTypes = [
  {
    slug: 'conjunction',
    name: 'Conjunction',
    symbol: '☌',
    degrees: '0°',
    nature: 'Neutral/Powerful',
    description:
      'Planets merge their energies, creating intensity and new beginnings',
  },
  {
    slug: 'opposition',
    name: 'Opposition',
    symbol: '☍',
    degrees: '180°',
    nature: 'Challenging',
    description:
      'Creates tension and awareness, requiring balance between opposing forces',
  },
  {
    slug: 'trine',
    name: 'Trine',
    symbol: '△',
    degrees: '120°',
    nature: 'Harmonious',
    description:
      'Natural talent and ease, gifts that flow effortlessly between planets',
  },
  {
    slug: 'square',
    name: 'Square',
    symbol: '□',
    degrees: '90°',
    nature: 'Challenging',
    description:
      'Creates friction and motivation, pushing for growth through obstacles',
  },
  {
    slug: 'sextile',
    name: 'Sextile',
    symbol: '⚹',
    degrees: '60°',
    nature: 'Harmonious',
    description:
      'Opportunities and cooperation, requiring effort to activate the potential',
  },
];

export const metadata: Metadata = {
  title: 'Astrological Aspects: Types & Meanings | Lunary',
  description:
    'Learn about the five major aspects in astrology: Conjunction, Opposition, Trine, Square, and Sextile. Understand how planetary relationships shape your chart.',
  keywords: [
    'astrological aspects',
    'conjunction',
    'opposition',
    'trine',
    'square',
    'sextile',
    'aspect meanings',
  ],
  openGraph: {
    title: 'Astrological Aspects | Lunary',
    description:
      'Learn about the five major aspects and how planetary relationships work.',
    url: 'https://lunary.app/grimoire/aspects/types',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/aspects/types',
  },
};

const intro =
  'Aspect types are the grammar of astrology—they describe how planets hold conversation inside your chart. Understanding the five major aspects helps you translate dynamics like tension, chemistry, and creative sparks.';

const meaning = `Each aspect divides the 360° zodiac circle into repeating patterns, signalling how two planets relate. Challenging (dynamic) aspects—squares and oppositions—demand action and highlight growth edges. Harmonious aspects—trines and sextiles—describe gifts, talents, or opportunities that flow when you show up. Conjunctions intensify everything, fusing two archetypes into one louder storyline.

When you learn these patterns you can interpret natal placements, time transits, and read synastry with nuance. Notice the modality (cardinal, fixed, mutable) and element (fire, earth, air, water) involved. They colour how each aspect behaves and suggest the best rituals, conversations, or boundaries to emphasize when the cosmos applies pressure.`;

const tldr =
  'Five major aspects—conjunction, opposition, square, trine, sextile—describe the angles between planets. Squares/oppositions stir growth, trines/sextiles unlock ease, and conjunctions amplify both planets at once.';

const whatIs = {
  question: 'What are aspect types in astrology?',
  answer:
    'Aspect types are the standard angular relationships (0°, 60°, 90°, 120°, 180°) between planets. They show how two archetypes communicate: Do they blend, clash, or complement one another?',
};

const howToWorkWith = [
  'Track which houses and life areas the two planets rule before judging the aspect.',
  'Observe element + modality combinations to understand the tone of tension or harmony.',
  'Use exact degree (orb) to see how loudly the aspect will speak in daily life.',
  'Return to this list whenever a transit reactivates the same aspect in your chart.',
  'Journal how each aspect feels in real time to build a personal reference.',
];

const faqs = [
  {
    question: 'Are squares always bad?',
    answer:
      'Squares signal friction, not failure. They highlight places where effort leads to mastery. When you meet a square with action, it becomes the engine for long-term growth.',
  },
  {
    question: 'How tight should an orb be for major aspects?',
    answer:
      'Stay within 6° for most natal aspects (tighter for sextiles). The tighter the orb, the louder the theme. Transiting outer planets can use slightly wider orbs because they move slowly.',
  },
  {
    question: 'Do conjunctions count as harmonious or challenging?',
    answer:
      'Conjunctions are neutral—they amplify whatever two planets naturally represent. The sign, house, and planets involved determine whether it feels supportive or intense.',
  },
];

const internalLinks = [
  { text: 'All Aspects', href: '/grimoire/aspects' },
  {
    text: 'Birth Chart Guide',
    href: '/grimoire/guides/birth-chart-complete-guide',
  },
  { text: 'Synastry Guide', href: '/grimoire/synastry' },
  { text: 'Transits Hub', href: '/grimoire/transits' },
];

const relatedItems = [
  { name: 'Birth Chart Generator', href: '/birth-chart', type: 'Tool' },
  {
    name: 'Planets in Astrology',
    href: '/grimoire/astronomy/planets',
    type: 'Reference',
  },
  { name: 'Houses Overview', href: '/grimoire/houses', type: 'Guide' },
];

const tableOfContents = [
  { label: 'Understanding Aspects', href: '#understanding-aspects' },
  { label: 'Aspect Types', href: '#aspect-list' },
  { label: 'Aspect Geometry', href: '#aspect-geometry' },
  { label: 'How to Apply Aspect Types', href: '#apply-aspects' },
  { label: 'Reflection Prompts', href: '#reflection' },
  { label: 'Related Resources', href: '#related-resources' },
  { label: 'Frequently Asked Questions', href: '#faq' },
];

export default function AspectTypesIndexPage() {
  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <Circle className='w-16 h-16 text-lunary-primary-400' />
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        Aspects describe the angular relationships between planets. They reveal
        how different parts of your chart interact and influence each other.
      </p>
    </div>
  );

  const sections = (
    <>
      <section
        id='understanding-aspects'
        className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
      >
        <h2 className='text-xl font-medium text-zinc-100 mb-3'>
          Understanding Aspects
        </h2>
        <p className='text-zinc-400'>
          The five major aspects are based on geometric divisions of the circle.
          Hard aspects (Square, Opposition) create tension and drive change.
          Soft aspects (Trine, Sextile) bring harmony and ease. Conjunctions
          intensify and merge energies.
        </p>
      </section>

      <section id='aspect-list' className='mb-12'>
        <div className='space-y-4'>
          {aspectTypes.map((aspect) => (
            <Link
              key={aspect.slug}
              href={`/grimoire/aspects/types/${aspect.slug}`}
              className='group block rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
            >
              <div className='flex items-center gap-4 mb-3'>
                <span className='text-3xl'>{aspect.symbol}</span>
                <div>
                  <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                    {aspect.name}
                  </h3>
                  <div className='flex items-center gap-3 text-sm text-zinc-400'>
                    <span>{aspect.degrees}</span>
                    <span>•</span>
                    <span>{aspect.nature}</span>
                  </div>
                </div>
              </div>
              <p className='text-sm text-zinc-400'>{aspect.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section
        id='aspect-geometry'
        className='mb-12 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-4'
      >
        <h2 className='text-2xl font-medium text-zinc-100'>Aspect Geometry</h2>
        <p className='text-zinc-300 leading-relaxed'>
          Each aspect splits the zodiac circle into equal slices. Conjunctions
          are 0°, sextiles 60°, squares 90°, trines 120°, and oppositions 180°.
          These divisions mirror sacred geometry and musical harmonics—another
          reason aspects feel visceral. Tight angles act like shortcuts for
          planetary energy, helping you trace exactly where a storyline travels
          in your chart.
        </p>
        <div className='grid sm:grid-cols-2 gap-4 text-sm text-zinc-300'>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-4'>
            <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
              Hard/Dynamic
            </h3>
            <ul className='space-y-1'>
              <li>Square (90°): friction + momentum</li>
              <li>Opposition (180°): mirrors + polarity</li>
              <li>Conjunction (0°): fusion that can overwhelm</li>
            </ul>
          </div>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-4'>
            <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
              Soft/Harmonious
            </h3>
            <ul className='space-y-1'>
              <li>Trine (120°): natural gifts and synergy</li>
              <li>Sextile (60°): opportunities that need a nudge</li>
            </ul>
          </div>
        </div>
      </section>

      <section
        id='apply-aspects'
        className='mb-12 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-4'
      >
        <h2 className='text-2xl font-medium text-zinc-100'>
          How to Apply Aspect Types
        </h2>
        <ol className='list-decimal list-inside text-zinc-300 space-y-2'>
          <li>
            <strong>Identify the players.</strong> Note each planet, the sign it
            sits in, and the houses ruled. That tells you which life areas are
            involved.
          </li>
          <li>
            <strong>Gauge the orb.</strong> A 1° square screams louder than a 7°
            square. Tight orbs are life-long signatures.
          </li>
          <li>
            <strong>Add timing.</strong> Track transits or progressions that
            recreate the same aspect to anticipate key weeks.
          </li>
          <li>
            <strong>Translate into action.</strong> Choose spells,
            conversations, or boundaries that mirror the aspect’s nature.
          </li>
        </ol>
      </section>

      <section
        id='reflection'
        className='mb-12 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-3'
      >
        <h2 className='text-2xl font-medium text-zinc-100'>
          Reflection Prompts
        </h2>
        <p className='text-zinc-300'>
          Capture your own evidence for how each aspect shows up.
        </p>
        <ul className='space-y-2 text-zinc-300'>
          <li>Which aspect type feels most familiar in my chart and why?</li>
          <li>
            How do I typically respond when a challenging aspect flares up?
          </li>
          <li>
            Where can I leverage harmonious aspects to balance current stress?
          </li>
        </ul>
      </section>

      <div id='related-resources' className='border-t border-zinc-800 pt-8'>
        <h3 className='text-lg font-medium text-zinc-100 mb-4'>
          Related Resources
        </h3>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/grimoire/aspects'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            All Aspects
          </Link>
          <Link
            href='/grimoire/astronomy/planets'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Planets
          </Link>
          <Link
            href='/grimoire/houses'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Houses
          </Link>
          <Link
            href='/birth-chart'
            className='px-4 py-2 rounded-lg bg-lunary-primary-900/30 text-lunary-primary-300 hover:bg-lunary-primary-900/50 transition-colors'
          >
            Calculate Your Chart
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title='Astrological Aspects: Types & Meanings | Lunary'
        h1='Astrological Aspects'
        description='Learn about the five major aspects in astrology and how planetary relationships shape your chart.'
        keywords={[
          'astrological aspects',
          'conjunction',
          'opposition',
          'trine',
          'square',
          'sextile',
          'aspect meanings',
        ]}
        canonicalUrl='https://lunary.app/grimoire/aspects/types'
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        intro={intro}
        tldr={tldr}
        meaning={meaning}
        whatIs={whatIs}
        howToWorkWith={howToWorkWith}
        faqs={faqs}
        internalLinks={internalLinks}
        relatedItems={relatedItems}
        cosmicConnectionsParams={{
          entityType: 'hub-aspects',
          entityKey: 'types',
        }}
        ctaText='See these aspects in your birth chart'
        ctaHref='/birth-chart'
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
