import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import {
  PLANETS,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
  Planet,
} from '@/constants/seo/aspects';

const ASPECTS = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];
const aspectSymbols: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
};

export async function generateStaticParams() {
  return PLANETS.map((planet) => ({ planet1: planet }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planet1: string }>;
}): Promise<Metadata> {
  const { planet1 } = await params;

  if (!PLANETS.includes(planet1 as Planet)) {
    return { title: 'Planet Not Found | Lunary' };
  }

  const planetName = PLANET_DISPLAY[planet1 as Planet];
  const title = `${planetName} Aspects: All Major Aspects | Lunary`;
  const description = `Explore all major aspects involving ${planetName}. Learn about ${planetName} conjunctions, oppositions, trines, squares, and sextiles.`;

  return {
    title,
    description,
    keywords: [
      `${planetName.toLowerCase()} aspects`,
      `${planetName.toLowerCase()} conjunction`,
      `${planetName.toLowerCase()} opposition`,
      `${planetName.toLowerCase()} astrology`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/aspects/${planet1}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/aspects/${planet1}`,
    },
  };
}

export default async function PlanetAspectsPage({
  params,
}: {
  params: Promise<{ planet1: string }>;
}) {
  const { planet1 } = await params;

  if (!PLANETS.includes(planet1 as Planet)) {
    notFound();
  }

  const planetName = PLANET_DISPLAY[planet1 as Planet];
  const symbol = PLANET_SYMBOLS[planet1 as Planet];

  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <span className='text-6xl'>{symbol}</span>
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        Explore how {planetName} interacts with other planets through the five
        major aspects in astrology.
      </p>
    </div>
  );

  const intro = `${planetName} aspects reveal how this planet merges, clashes, and collaborates with the rest of your chart. Use this hub to explore conjunctions, oppositions, trines, squares, and sextiles so you can interpret both natal and transit influences with confidence.`;

  const meaning = `${planetName} represents a distinct facet of your story—its nature, house placement, and aspects color how that theme expresses itself. When ${planetName} forms an aspect, it shares resources with another planet or highlights a growth edge. A trine to ${planetName} unlocks talents that arrive effortlessly, while a square can describe the exact pressure you need to evolve. Tracking these angular relationships gives you language for why certain drives feel smooth and others feel gritty.

In transits, ${planetName}'s aspects describe current plot twists. If Mars is activating your ${planetName} through a conjunction, expect a surge of motivation around the areas ruled by both planets. In synastry, aspects to ${planetName} tell the love story—how two charts stir one another's instincts, safety needs, or ambitions.`;

  const howToWorkWith = [
    `Study your natal chart to see which planets aspect ${planetName}. Note the element, modality, and houses involved.`,
    'Track current transits to watch when those natal aspects are activated in real time.',
    `Use the aspect interpretations below to translate each ${planetName} pairing into practical advice.`,
    'Bring the insight into daily rituals, journaling, or conversations with partners.',
  ];

  const faqs = [
    {
      question: `What does ${planetName} represent in astrology?`,
      answer: `${planetName} governs ${
        planetName === 'Sun'
          ? 'identity, vitality, and core purpose'
          : planetName === 'Moon'
            ? 'emotional needs and instinctive reactions'
            : 'a key drive in your chart'
      }. Aspects will describe how that drive collaborates with or challenges other parts of you.`,
    },
    {
      question: `How important are tight orbs for ${planetName} aspects?`,
      answer:
        'The closer the angle, the louder the theme. Keep orbs between 6–8° for major aspects and slightly tighter if outer planets are involved.',
    },
    {
      question: `Can I apply these meanings to synastry and transits?`,
      answer:
        'Yes. Natal aspects set the baseline, while synastry overlays another person’s planets onto yours, and transits show when the story is activated in real time.',
    },
  ];

  const relatedItems = [
    { name: 'Aspect Types', href: '/grimoire/aspects/types', type: 'Guide' },
    { name: 'Birth Chart Generator', href: '/birth-chart', type: 'Tool' },
    {
      name: 'Planet Meanings',
      href: '/grimoire/astronomy/planets',
      type: 'Reference',
    },
  ];

  const internalLinks = [
    { text: 'All Aspects', href: '/grimoire/aspects' },
    { text: 'Transits', href: '/grimoire/transits' },
    { text: 'Synastry Guide', href: '/grimoire/synastry' },
  ];

  const tableOfContents = [
    { label: `${planetName} Energy Overview`, href: '#planet-meaning' },
    { label: 'About These Aspects', href: '#about-aspects' },
    { label: 'Aspect Types', href: '#aspect-types' },
    { label: 'How to Work With This Energy', href: '#working-with' },
    { label: 'Reflection Prompts', href: '#journaling' },
    { label: 'Related Resources', href: '#related-aspects' },
    { label: 'Frequently Asked Questions', href: '#faq' },
  ];

  const cosmicConnectionsSections: CosmicConnectionSection[] = [
    {
      title: `${planetName} Essentials`,
      links: [
        {
          label: `${planetName} Meanings`,
          href: '/grimoire/astronomy/planets',
        },
        { label: 'Birth Chart', href: '/birth-chart' },
        { label: 'Transits', href: '/grimoire/transits' },
      ],
    },
    {
      title: 'Dive Deeper',
      links: [
        { label: 'Synastry', href: '/grimoire/synastry' },
        { label: 'Aspect Types', href: '/grimoire/aspects/types' },
        { label: 'Cosmic Index (A–Z)', href: '/grimoire/a-z' },
      ],
    },
  ];

  const sections = (
    <>
      <section id='planet-meaning' className='mb-12 space-y-4'>
        <h2 className='text-3xl font-light text-zinc-100'>
          {planetName} Energy Snapshot
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          {planetName} represents how you{' '}
          {planetName === 'Mars'
            ? 'pursue desire, assert yourself, and chase goals'
            : planetName === 'Venus'
              ? 'love, attract pleasure, and create harmony'
              : planetName === 'Mercury'
                ? 'think, learn, speak, and process information'
                : planetName === 'Jupiter'
                  ? 'expand, believe, and mentor'
                  : planetName === 'Saturn'
                    ? 'build structures, honor commitments, and master lessons'
                    : planetName === 'Uranus'
                      ? 'innovate, rebel, and spark awakenings'
                      : planetName === 'Neptune'
                        ? 'dream, heal, and dissolve boundaries'
                        : planetName === 'Pluto'
                          ? 'transform, empower, and face shadow work'
                          : 'express its signature energy'}
          . When you decode its aspects, you gain clarity on how that drive
          collaborates with your other planets.
        </p>
        <p className='text-zinc-300 leading-relaxed'>
          Use the aspect hub below to read both harmonious and challenging
          combinations. You&apos;ll spot repeating patterns that explain your
          default responses and the growth edges worth nurturing.
        </p>
      </section>

      <section
        id='about-aspects'
        className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
      >
        <h2 className='text-xl font-medium text-zinc-100 mb-3'>
          {planetName} in Aspect
        </h2>
        <p className='text-zinc-400'>
          Aspects are angular relationships between planets that describe how
          their energies interact. Select an aspect type to explore {planetName}
          &apos;s relationships with other planets.
        </p>
      </section>

      <section id='aspect-types' className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
          Aspect Types
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {ASPECTS.map((aspect) => (
            <Link
              key={aspect}
              href={`/grimoire/aspects/${planet1}/${aspect}`}
              className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
            >
              <div className='flex items-center gap-4 mb-2'>
                <span className='text-3xl'>{aspectSymbols[aspect]}</span>
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors capitalize'>
                  {planetName} {aspect}s
                </h3>
              </div>
              <p className='text-sm text-zinc-400'>
                View all {planetName} {aspect} aspects with other planets
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section
        id='working-with'
        className='mb-12 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-4'
      >
        <h2 className='text-2xl font-medium text-zinc-100'>
          How to Work with {planetName} Aspects
        </h2>
        <ol className='list-decimal list-inside text-zinc-300 space-y-2'>
          <li>
            <strong>Map your houses.</strong> Note which houses {planetName} and
            the other planet rule—this shows the life arenas activated.
          </li>
          <li>
            <strong>Blend elements.</strong> A fire–water square demands
            temperature regulation; an earth–earth trine delivers reliable
            momentum.
          </li>
          <li>
            <strong>Time it.</strong> Track when transiting planets repeat these
            aspects to anticipate energetic spikes.
          </li>
          <li>
            <strong>Anchor the message.</strong> Turn insights into
            rituals—write a sigil, plan a conversation, or reframe a belief
            connected to the aspect.
          </li>
        </ol>
      </section>

      <section
        id='journaling'
        className='mb-12 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-3'
      >
        <h2 className='text-2xl font-medium text-zinc-100'>
          Reflection Prompts
        </h2>
        <p className='text-zinc-300'>
          Use these prompts after a reading session or whenever a transit lights
          up your {planetName} aspects.
        </p>
        <ul className='space-y-2 text-zinc-300'>
          <li>Where do I feel {planetName} showing up strongest in my life?</li>
          <li>
            Which relationships or projects highlight the supportive facets of
            my
            {` ${planetName}`} aspects?
          </li>
          <li>
            When tension arises, which aspect story might be replaying, and how
            can I respond differently?
          </li>
        </ul>
      </section>

      <div id='related-aspects' className='border-t border-zinc-800 pt-8'>
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
            href='/grimoire/aspects/types'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Aspect Types
          </Link>
          <Link
            href='/grimoire/astronomy/planets'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            All Planets
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title={`${planetName} Aspects: All Major Aspects | Lunary`}
        h1={`${planetName} Aspects`}
        description={`Explore how ${planetName} interacts with other planets through the five major aspects in astrology.`}
        keywords={[
          `${planetName.toLowerCase()} aspects`,
          `${planetName.toLowerCase()} conjunction`,
          `${planetName.toLowerCase()} opposition`,
          `${planetName.toLowerCase()} astrology`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/aspects/${planet1}`}
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        intro={intro}
        meaning={meaning}
        howToWorkWith={howToWorkWith}
        faqs={faqs}
        relatedItems={relatedItems}
        internalLinks={internalLinks}
        journalPrompts={[
          `How does ${planetName} want to express itself in my life?`,
          `What triggers the challenging ${planetName} aspects, and how can I meet them with compassion?`,
          `Where can I intentionally lean into the supportive ${planetName} aspects right now?`,
        ]}
        ctaText='See your aspects inside the birth chart app'
        ctaHref='/birth-chart'
        cosmicConnections={
          <CosmicConnections
            entityType='hub-aspects'
            entityKey={planet1}
            title={`${planetName} Aspect Connections`}
            sections={cosmicConnectionsSections}
          />
        }
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
