import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import {
  PLANETS,
  ASPECTS,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
  ASPECT_DATA,
} from '@/constants/seo/aspects';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title:
    'Astrological Aspects: Conjunct, Trine, Square, Sextile, Opposition | Lunary',
  description:
    'Complete guide to astrological aspects. Learn about conjunctions, trines, squares, sextiles, and oppositions between planets in your natal chart, transits, and synastry.',
  keywords: [
    'astrological aspects',
    'conjunction',
    'trine',
    'square',
    'sextile',
    'opposition',
    'natal aspects',
    'synastry aspects',
  ],
  openGraph: {
    title:
      'Astrological Aspects: Conjunct, Trine, Square, Sextile, Opposition | Lunary',
    description:
      'Complete guide to astrological aspects in natal charts, transits, and synastry.',
    url: 'https://lunary.app/grimoire/aspects',
    images: [
      {
        url: '/api/og/grimoire/aspects',
        width: 1200,
        height: 630,
        alt: 'Astrological Aspects Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrological Aspects Guide | Lunary',
    description: 'Complete guide to astrological aspects.',
    images: ['/api/og/grimoire/aspects'],
  },
  alternates: { canonical: 'https://lunary.app/grimoire/aspects' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const aspectsListSchema = createItemListSchema({
  name: 'Astrological Aspects',
  description:
    'Complete guide to astrological aspects including conjunctions, trines, squares, sextiles, and oppositions.',
  url: 'https://lunary.app/grimoire/aspects',
  items: ASPECTS.map((aspect) => ({
    name: ASPECT_DATA[aspect].displayName,
    url: `https://lunary.app/grimoire/aspects/types/${aspect}`,
    description: `${ASPECT_DATA[aspect].degrees}° - ${ASPECT_DATA[
      aspect
    ].keywords.join(', ')}`,
  })),
});

const tableOfContents = [
  { label: 'What Are Aspects?', href: '#what-are-aspects' },
  { label: 'The Five Major Aspects', href: '#major-aspects' },
  { label: 'Planet Combinations', href: '#planet-combinations' },
  { label: 'Chart Reference & CTA', href: '#chart-reference' },
  { label: 'Orbs & Aspect Strength', href: '#aspect-orbs' },
  { label: 'Aspect Cheat Sheet', href: '#cheat-sheet' },
  { label: 'Frequently Asked Questions', href: '#faq' },
];

const whatIs = {
  question: 'What are astrological aspects?',
  answer:
    'Aspects are the angles between planets in a chart. They reveal how planetary energies cooperate, clash, or flow, shaping the tone of each life area.',
};

const intro =
  'Astrological aspects describe how planets talk to one another through angular relationships. Harmonious aspects like trines support ease, while challenging ones like squares demand courage and growth.';

const tldr =
  'Aspects are the angles between planets. Conjunctions fuse energy, trines and sextiles create ease, while squares and oppositions create friction that leads to breakthroughs.';

const meaning = `Every planet in your chart expresses itself through the lens of other planets. A confident Mars looks different when it is square Saturn versus trine Jupiter. Understanding aspects reveals the inner dialogue of your chart, why certain traits feel effortless, and why others require conscious practice.

The same applies to transits and synastry. A transit square to your Moon may explain a pressure cooker week, while a Venus–Mars trine between partners highlights natural chemistry. Learning these patterns equips you to plan rituals, choose collaborators, and anticipate growth cycles.`;

const howToWorkWith = [
  'Start with conjunctions and oppositions—they set the stage for major themes.',
  'Use trines and sextiles to identify natural talents and effortless opportunities.',
  'Take squares as invitations to refine, adjust, and build resilience.',
  'Study synastry and transits to see how aspects color relationships and timing.',
];

const internalLinks = [
  {
    text: 'Birth Chart Guide',
    href: '/grimoire/guides/birth-chart-complete-guide',
  },
  { text: 'Transits Hub', href: '/grimoire/transits' },
  { text: 'Synastry Basics', href: '/grimoire/synastry' },
  { text: 'Calculate Birth Chart', href: '/birth-chart' },
];

const faqs = [
  {
    question: 'Which aspects are the most important in a natal chart?',
    answer:
      'Conjunctions, squares, trines, sextiles, and oppositions are the main five. Focus on aspects involving the Sun, Moon, and personal planets, then expand to outer planets.',
  },
  {
    question: 'How do transits change my birth chart aspects?',
    answer:
      'Transiting planets make aspects to your natal planets, activating the themes of those houses. Track when slow-moving bodies like Saturn or Pluto touch key points for growth cycles.',
  },
  {
    question: 'Can aspects change over time?',
    answer:
      'The natal chart is fixed, but progressions and current transits form dynamic aspects that layer on top of the natal configuration.',
  },
];

const relatedItems = [
  { name: 'Birth Chart', href: '/birth-chart', type: 'Chart reference' },
  { name: 'Transits', href: '/grimoire/transits', type: 'Timing' },
  { name: 'Synastry', href: '/grimoire/synastry', type: 'Relationships' },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Aspect Tools',
    links: [
      { label: 'Aspects Types', href: '/grimoire/aspects/types' },
      { label: 'Synastry Guide', href: '/grimoire/synastry' },
      { label: 'Transits', href: '/grimoire/transits' },
      { label: 'Birth Chart', href: '/birth-chart' },
    ],
  },
  {
    title: 'Related Practices',
    links: [
      { label: 'Tarot', href: '/grimoire/tarot' },
      { label: 'Manifestation', href: '/grimoire/manifestation' },
      { label: 'Numerology', href: '/grimoire/numerology' },
      { label: 'Shadow Work', href: '/grimoire/shadow-work' },
    ],
  },
];

export default function AspectsIndexPage() {
  return (
    <>
      {renderJsonLd(aspectsListSchema)}
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Astrological Aspects'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={metadata.alternates?.canonical as string}
        tableOfContents={tableOfContents}
        whatIs={whatIs}
        intro={intro}
        tldr={tldr}
        meaning={meaning}
        howToWorkWith={howToWorkWith}
        faqs={faqs}
        relatedItems={relatedItems}
        internalLinks={internalLinks}
        ctaText='View your personalized aspect breakdown'
        ctaHref='/birth-chart'
        cosmicConnections={
          <CosmicConnections
            entityType='hub-glossary'
            entityKey='aspects'
            title='Aspect Connections'
            sections={cosmicConnectionsSections}
          />
        }
      >
        <section id='what-are-aspects' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            1. What Are Aspects?
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-6'>
            Aspects are the geometric relationships between planets in your
            natal chart. They describe how planetary energies interact—whether
            they flow, challenge, or intensify each other.
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            Mastering aspect language unlocks the story of your chart’s
            dynamics, from effortless support to growth-producing tension.
          </p>
        </section>

        <section id='major-aspects' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            2. The Five Major Aspects
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {ASPECTS.map((aspect) => {
              const data = ASPECT_DATA[aspect];
              return (
                <div
                  key={aspect}
                  className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'
                >
                  <div className='flex items-center gap-3 mb-3'>
                    <span className='text-3xl'>{data.symbol}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        data.nature === 'harmonious'
                          ? 'bg-lunary-success-900 text-lunary-success-300'
                          : data.nature === 'challenging'
                            ? 'bg-lunary-error-900 text-lunary-error-300'
                            : 'bg-lunary-secondary-900 text-lunary-secondary-300'
                      }`}
                    >
                      {data.nature}
                    </span>
                  </div>
                  <h3 className='text-lg font-medium mb-1'>
                    {data.displayName}
                  </h3>
                  <p className='text-sm text-zinc-400 mb-2'>{data.degrees}°</p>
                  <p className='text-sm text-zinc-400'>
                    {data.keywords.join(', ')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section id='planet-combinations' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            3. Explore Planet Combinations
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {PLANETS.slice(0, 6).map((planet) => (
              <Link
                key={planet}
                href={`/grimoire/aspects/${planet}/conjunct/${
                  PLANETS.find((p) => p !== planet) || 'moon'
                }`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-lunary-primary-600'
              >
                <div className='text-3xl mb-2'>{PLANET_SYMBOLS[planet]}</div>
                <h3 className='text-lg font-medium group-hover:text-lunary-primary-300'>
                  {PLANET_DISPLAY[planet]} Aspects
                </h3>
                <p className='text-sm text-zinc-400'>
                  Explore how {PLANET_DISPLAY[planet]} blends with other
                  planets.
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section id='chart-reference' className='mb-16'>
          <div className='rounded-xl border border-lunary-primary-700 bg-lunary-primary-900/10 p-6'>
            <h2 className='text-2xl font-light text-lunary-primary-300 mb-3'>
              Find Aspects in Your Chart
            </h2>
            <p className='text-zinc-300 mb-4'>
              Locate every aspect in your natal chart to understand how the
              planets shape your drives, challenges, and relationships.
            </p>
            <Link
              href='/birth-chart'
              className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 px-6 py-3 text-sm text-lunary-primary-300 transition-colors hover:bg-lunary-primary-900/20'
            >
              View Your Birth Chart
            </Link>
          </div>
        </section>

        <section id='aspect-orbs' className='mb-16 space-y-4'>
          <h2 className='text-3xl font-light text-zinc-100'>
            4. Orbs & Aspect Strength
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            Not every angle hits with the same intensity. The <em>orb</em> (the
            number of degrees away from exact) tells you how loud an aspect is.
            A tight 1° square between Mars and the Sun will feel louder than a
            7° square. Harmonious aspects can handle a wider orb, while
            challenging ones demand precision.
          </p>
          <div className='grid md:grid-cols-2 gap-4 text-sm text-zinc-300'>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-4'>
              <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
                Suggested Orbs
              </h3>
              <ul className='space-y-1'>
                <li>Conjunctions: 0°–8° (tighter for outer planets)</li>
                <li>Oppositions: 0°–7°</li>
                <li>Trines: 0°–6°</li>
                <li>Squares: 0°–6°</li>
                <li>Sextiles: 0°–4°</li>
              </ul>
            </div>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-4'>
              <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
                How to Read Orbs
              </h3>
              <ul className='space-y-1'>
                <li>
                  Tight orb = the theme defines your life (think core
                  personality traits).
                </li>
                <li>
                  Mid orb = the aspect activates when transits trigger it or
                  when you focus on that area.
                </li>
                <li>
                  Wide orb = background influence—you can amplify it with
                  conscious work.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id='cheat-sheet' className='mb-16 space-y-4'>
          <h2 className='text-3xl font-light text-zinc-100'>
            5. Aspect Cheat Sheet
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            Keep this quick guide nearby when interpreting natal, synastry, or
            transit charts.
          </p>
          <div className='grid md:grid-cols-2 gap-4 text-sm text-zinc-300'>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1'>
              <h3 className='text-lg font-semibold text-zinc-100'>
                Harmonious
              </h3>
              <p>
                <strong>Trine:</strong> natural flow, talents, easy confidence.
              </p>
              <p>
                <strong>Sextile:</strong> opportunities that unlock with action,
                creative collaboration.
              </p>
            </div>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1'>
              <h3 className='text-lg font-semibold text-zinc-100'>
                Dynamic / Challenging
              </h3>
              <p>
                <strong>Square:</strong> friction leading to mastery; tension
                that sparks breakthroughs.
              </p>
              <p>
                <strong>Opposition:</strong> polarities begging for balance;
                projection and partnership lessons.
              </p>
              <p>
                <strong>Conjunction:</strong> fusion; louder if planets are very
                different in nature.
              </p>
            </div>
          </div>
        </section>

        <section className='mb-12'></section>
      </SEOContentTemplate>
    </>
  );
}
