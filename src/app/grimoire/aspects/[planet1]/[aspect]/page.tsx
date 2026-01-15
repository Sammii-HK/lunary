import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  PLANETS,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
  Planet,
} from '@/constants/seo/aspects';

const ASPECTS = [
  'conjunction',
  'opposition',
  'trine',
  'square',
  'sextile',
] as const;
type Aspect = (typeof ASPECTS)[number];

const aspectSymbols: Record<Aspect, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
};

const aspectDescriptions: Record<Aspect, string> = {
  conjunction: 'merging and intensifying',
  opposition: 'balancing and polarizing',
  trine: 'harmonizing and flowing',
  square: 'challenging and motivating',
  sextile: 'opportunistic and cooperative',
};

export async function generateStaticParams() {
  const params: { planet1: string; aspect: string }[] = [];
  for (const planet of PLANETS) {
    for (const aspect of ASPECTS) {
      params.push({ planet1: planet, aspect });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planet1: string; aspect: string }>;
}): Promise<Metadata> {
  const { planet1, aspect } = await params;

  if (
    !PLANETS.includes(planet1 as Planet) ||
    !ASPECTS.includes(aspect as Aspect)
  ) {
    return { title: 'Aspect Not Found | Lunary' };
  }

  const planetName = PLANET_DISPLAY[planet1 as Planet];
  const title = `${planetName} ${aspect.charAt(0).toUpperCase() + aspect.slice(1)}: All Combinations | Lunary`;
  const description = `Explore all ${planetName} ${aspect} aspects with other planets. Learn how ${planetName}'s ${aspectDescriptions[aspect as Aspect]} energy works.`;

  return {
    title,
    description,
    keywords: [
      `${planetName.toLowerCase()} ${aspect}`,
      `${aspect} aspects`,
      `${planetName.toLowerCase()} aspects`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/aspects/${planet1}/${aspect}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/aspects/${planet1}/${aspect}`,
    },
  };
}

export default async function PlanetAspectTypePage({
  params,
}: {
  params: Promise<{ planet1: string; aspect: string }>;
}) {
  const { planet1, aspect } = await params;

  if (
    !PLANETS.includes(planet1 as Planet) ||
    !ASPECTS.includes(aspect as Aspect)
  ) {
    notFound();
  }

  const planetName = PLANET_DISPLAY[planet1 as Planet];
  const symbol = PLANET_SYMBOLS[planet1 as Planet];
  const aspectSymbol = aspectSymbols[aspect as Aspect];
  const aspectLabel = aspect.charAt(0).toUpperCase() + aspect.slice(1);
  const otherPlanets = PLANETS.filter((p) => p !== planet1);

  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center items-center gap-4 mb-4'>
        <span className='text-5xl'>{symbol}</span>
        <span className='text-3xl text-zinc-400'>{aspectSymbol}</span>
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        Explore how {planetName} forms {aspect} aspects with other planets,
        creating {aspectDescriptions[aspect as Aspect]} energy in the natal
        chart.
      </p>
    </div>
  );

  const intro = `${planetName} ${aspectLabel.toLowerCase()} aspects describe how this planet collaborates or clashes with every other body in your chart. Studying the whole set helps you see repeating patterns in confidence, desire, communication, or discipline.`;

  const meaning = `${planetName} represents ${
    planetName === 'Sun'
      ? 'identity and vitality'
      : planetName === 'Moon'
        ? 'emotions and instinct'
        : planetName === 'Mercury'
          ? 'thinking and communication'
          : planetName === 'Venus'
            ? 'love, magnetism, and pleasure'
            : planetName === 'Mars'
              ? 'drive and desire'
              : planetName === 'Jupiter'
                ? 'growth and faith'
                : planetName === 'Saturn'
                  ? 'mastery, responsibility, and structure'
                  : planetName === 'Uranus'
                    ? 'innovation and disruption'
                    : planetName === 'Neptune'
                      ? 'mysticism and imagination'
                      : 'transformation, power, and rebirth'
  }. When it forms a ${aspectLabel.toLowerCase()}, that storyline is filtered through ${aspectDescriptions[aspect as Aspect]} energy. Mapping every pairing lets you anticipate how this archetype cooperates with the rest of your psyche—and which transits will feel the loudest.`;

  const tldr = `${planetName} ${aspectLabel} aspects show how ${planetName} interacts with every other planet via the ${aspectLabel.toLowerCase()} angle (${aspectSymbol}). Use this hub to explore each combination.`;

  const howToWorkWith = [
    `List every ${planetName} ${aspectLabel.toLowerCase()} in your birth chart to notice repeating house themes.`,
    'Pair challenging combos with grounding rituals, and leverage harmonious ones for launches or conversations.',
    'Track transits that recreate the same aspect to anticipate when the story peaks.',
    'Compare with a partner’s chart for synastry insights.',
    'Use tarot or journaling to dialogue with both planets whenever tension rises.',
  ];

  const faqs = [
    {
      question: `What does ${planetName} ${aspectLabel.toLowerCase()} mean in my chart?`,
      answer: `It describes how ${planetName}'s core energy interacts with whichever planet it aspects at that angle, highlighting ${aspectDescriptions[aspect as Aspect]} themes.`,
    },
    {
      question: `How wide can the orb be for ${aspectLabel.toLowerCase()} aspects?`,
      answer:
        'Stay within 6–8° for the major aspects listed here (slightly tighter for sextiles). Tighter orbs speak louder in everyday life.',
    },
    {
      question: 'How do I apply this to transits?',
      answer:
        'When a transiting planet hits the same aspect to your natal planet, expect a temporary replay of the story. Review the relevant combination page for guidance.',
    },
  ];

  const internalLinks = [
    { text: `${planetName} Overview`, href: `/grimoire/aspects/${planet1}` },
    { text: 'All Planetary Aspects', href: '/grimoire/aspects' },
    { text: 'Aspect Types', href: '/grimoire/aspects/types' },
    {
      text: 'Birth Chart Guide',
      href: '/grimoire/guides/birth-chart-complete-guide',
    },
  ];

  const relatedItems = [
    {
      name: 'Aspect Types Overview',
      href: '/grimoire/aspects/types',
      type: 'Guide',
    },
    { name: 'Transits Hub', href: '/grimoire/transits', type: 'Timing' },
    { name: 'Synastry', href: '/grimoire/synastry', type: 'Relationships' },
  ];

  const tableOfContents = [
    {
      label: `${planetName} ${aspectLabel} Overview`,
      href: '#aspect-overview',
    },
    { label: 'Alignment Checklist', href: '#aspect-checklist' },
    { label: 'Timing & Transits', href: '#timing-tips' },
    { label: 'Combinations', href: '#combinations' },
    { label: 'Related Resources', href: '#related-resources' },
    { label: 'Frequently Asked Questions', href: '#faq' },
  ];

  const sections = (
    <>
      <section
        id='aspect-overview'
        className='mb-12 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-3'
      >
        <h2 className='text-2xl font-light text-zinc-100'>
          {planetName} {aspectLabel} Overview
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          {planetName} brings its signature drive into every relationship. When
          it forms a {aspectLabel.toLowerCase()}, notice where the energy{' '}
          {aspectDescriptions[aspect as Aspect]}. Understanding the full matrix
          of combinations helps you see where to lean in gently versus take
          decisive action.
        </p>
      </section>

      <section
        id='timing-tips'
        className='mb-12 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-4'
      >
        <h2 className='text-2xl font-light text-zinc-100'>Timing & Transits</h2>
        <p className='text-zinc-300 leading-relaxed'>
          Transits that recreate this aspect tend to spotlight {planetName}
          motivations. Plot the exact natal degrees in your planner so you can
          anticipate when outer planets or lunations hit those points.
        </p>
        <ul className='space-y-2 text-zinc-300'>
          <li>
            Track the faster planet in the pair—every time it moves through the
            chart, it reawakens this combo.
          </li>
          <li>
            When eclipses or retrogrades activate these degrees, expand your
            ritual work and double down on nervous-system support.
          </li>
          <li>
            Build micro-intentions for each transit (e.g., “During the next
            square, I practice fierce boundaries”).
          </li>
        </ul>
        <p className='text-zinc-300'>
          Keep a running log of dates when this aspect lights up. Over a season
          or two you will spot rhythm patterns—maybe every time Mars hits these
          degrees you crave reinvention, or whenever Venus forms the same aspect
          you need extra rest. Use that intel to pre-plan boundaries, rituals,
          and creative sprints.
        </p>
      </section>

      <section
        id='aspect-checklist'
        className='mb-12 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-4'
      >
        <h2 className='text-2xl font-light text-zinc-100'>
          Alignment Checklist
        </h2>
        <ul className='space-y-2 text-zinc-300'>
          <li>Note the houses ruled by {planetName} and the partner planet.</li>
          <li>Check elemental combinations for clues on tone and pacing.</li>
          <li>
            Decide what support practices help when tension peaks—movement,
            journaling, conversation, ritual?
          </li>
          <li>
            For harmonious combos, plan launches, pitches, or spells during
            matching transits.
          </li>
        </ul>
      </section>

      <section id='combinations' className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
          {planetName} {aspectLabel} Combinations
        </h2>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
          {otherPlanets.map((planet2) => (
            <Link
              key={planet2}
              href={`/grimoire/aspects/${planet1}/${aspect}/${planet2}`}
              className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all text-center'
            >
              <div className='flex items-center justify-center gap-2 mb-2'>
                <span className='text-2xl'>{symbol}</span>
                <span className='text-lg text-zinc-400'>{aspectSymbol}</span>
                <span className='text-2xl'>
                  {PLANET_SYMBOLS[planet2 as Planet]}
                </span>
              </div>
              <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors text-sm'>
                {planetName} {aspectLabel} {PLANET_DISPLAY[planet2 as Planet]}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      <div id='related-resources' className='border-t border-zinc-800 pt-8'>
        <h3 className='text-lg font-medium text-zinc-100 mb-4'>
          Related Resources
        </h3>
        <div className='flex flex-wrap gap-3'>
          <Link
            href={`/grimoire/aspects/${planet1}`}
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            All {planetName} Aspects
          </Link>
          <Link
            href={`/grimoire/aspects/types/${aspect}`}
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            About {aspectLabel}s
          </Link>
          <Link
            href='/grimoire/aspects'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            All Aspects
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title={`${planetName} ${aspectLabel}: All Combinations | Lunary`}
        h1={`${planetName} ${aspectLabel} Aspects`}
        description={`Explore how ${planetName} forms ${aspect} aspects with other planets, highlighting ${aspectDescriptions[aspect as Aspect]} energy.`}
        keywords={[
          `${planetName.toLowerCase()} ${aspect}`,
          `${aspect} aspects`,
          `${planetName.toLowerCase()} aspects`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/aspects/${planet1}/${aspect}`}
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        intro={intro}
        tldr={tldr}
        meaning={meaning}
        howToWorkWith={howToWorkWith}
        faqs={faqs}
        internalLinks={internalLinks}
        relatedItems={relatedItems}
        cosmicConnectionsParams={{
          entityType: 'hub-aspects',
          entityKey: planet1,
        }}
        ctaText='See your personalized aspect report'
        ctaHref='/birth-chart'
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
