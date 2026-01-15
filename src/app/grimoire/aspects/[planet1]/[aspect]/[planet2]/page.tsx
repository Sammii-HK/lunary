import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  PLANETS,
  ASPECTS,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
  ASPECT_DATA,
  getAspectInterpretation,
  generateAllAspectParams,
  Planet,
  Aspect,
} from '@/constants/seo/aspects';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { Sparkles } from 'lucide-react';

interface PageParams {
  planet1: string;
  aspect: string;
  planet2: string;
}

export async function generateStaticParams() {
  return generateAllAspectParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { planet1, aspect, planet2 } = await params;

  if (
    !PLANETS.includes(planet1 as Planet) ||
    !ASPECTS.includes(aspect as Aspect) ||
    !PLANETS.includes(planet2 as Planet)
  ) {
    return { title: 'Aspect Not Found | Lunary' };
  }

  const p1 = PLANET_DISPLAY[planet1 as Planet];
  const p2 = PLANET_DISPLAY[planet2 as Planet];
  const aspectData = ASPECT_DATA[aspect as Aspect];

  const title = `${p1} ${aspectData.displayName} ${p2}: Meaning in Astrology | Lunary`;
  const description = `${p1} ${aspectData.displayName.toLowerCase()} ${p2} meaning in natal charts, transits, and synastry. Learn how this ${aspectData.nature} aspect affects your life.`;

  return {
    title,
    description,
    keywords: [
      `${p1.toLowerCase()} ${aspect} ${p2.toLowerCase()}`,
      `${p1.toLowerCase()} ${aspectData.displayName.toLowerCase()} ${p2.toLowerCase()}`,
      `${aspect} aspect`,
      'natal chart aspects',
      'transit aspects',
      'synastry aspects',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/aspects/${planet1}/${aspect}/${planet2}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/aspects/${planet1}/${aspect}/${planet2}`,
    },
  };
}

export default async function AspectPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { planet1, aspect, planet2 } = await params;

  if (
    !PLANETS.includes(planet1 as Planet) ||
    !ASPECTS.includes(aspect as Aspect) ||
    !PLANETS.includes(planet2 as Planet)
  ) {
    notFound();
  }

  const p1 = planet1 as Planet;
  const p2 = planet2 as Planet;
  const asp = aspect as Aspect;

  const interp = getAspectInterpretation(p1, asp, p2);
  const aspectData = ASPECT_DATA[asp];

  const p1Name = PLANET_DISPLAY[p1];
  const p2Name = PLANET_DISPLAY[p2];

  const heroContent = (
    <div className='text-center space-y-3'>
      <div className='flex justify-center items-center gap-4 text-4xl text-zinc-200'>
        <span>{PLANET_SYMBOLS[p1]}</span>
        <span className='text-2xl text-zinc-500'>{aspectData.symbol}</span>
        <span>{PLANET_SYMBOLS[p2]}</span>
      </div>
      <p className='text-zinc-400 max-w-2xl mx-auto'>
        {p1Name} {aspectData.displayName.toLowerCase()} {p2Name} brings{' '}
        {aspectData.nature} {aspectData.description.toLowerCase()}.
      </p>
    </div>
  );

  const intro = `${p1Name} ${aspectData.displayName.toLowerCase()} ${p2Name} is a ${aspectData.nature} aspect that becomes a main storyline in your chart. It colors how these two archetypes collaborate in natal interpretations, synastry readings, and transits.`;

  const howToWorkWith = [
    `Track which houses ${p1Name} and ${p2Name} rule to understand the life areas this aspect influences.`,
    'Journal how the aspect feels when it is triggered so you can recognize the pattern quickly.',
    'During challenging transits, schedule grounding rituals or body work that match the planets involved.',
    'When the aspect feels harmonious, plan launches, conversations, or spellwork that need that energy.',
    'In synastry, share the meaning with partners or collaborators so everyone knows the growth edge.',
  ];

  const journalPrompts = [
    `Where does the ${p1Name} ${aspectData.displayName.toLowerCase()} ${p2Name} pattern appear in my daily life?`,
    `What helps me rebalance when this aspect feels overwhelming?`,
    `How can I intentionally leverage this aspect during the next transit that activates it?`,
  ];

  const faqs = [
    {
      question: `What does ${p1Name} ${aspectData.displayName.toLowerCase()} ${p2Name} mean in my natal chart?`,
      answer: interp.inNatal,
    },
    {
      question: `How does this aspect influence current transits?`,
      answer: interp.inTransit,
    },
    {
      question: `What does this aspect look like in relationships or synastry?`,
      answer: interp.inSynastry,
    },
  ];

  const internalLinks = [
    { text: 'Aspect Types Overview', href: '/grimoire/aspects/types' },
    { text: 'All Planetary Aspects', href: '/grimoire/aspects' },
    {
      text: 'Birth Chart Guide',
      href: '/grimoire/guides/birth-chart-complete-guide',
    },
    { text: 'Calculate Birth Chart', href: '/birth-chart' },
  ];

  const relatedItems = [
    {
      name: `${p1Name} Meaning`,
      href: `/grimoire/astronomy/planets/${p1}`,
      type: 'Planet',
    },
    {
      name: `${p2Name} Meaning`,
      href: `/grimoire/astronomy/planets/${p2}`,
      type: 'Planet',
    },
    { name: 'Transits Hub', href: '/grimoire/transits', type: 'Timing' },
    {
      name: 'Synastry Guide',
      href: '/grimoire/synastry',
      type: 'Relationships',
    },
  ];

  const tableOfContents = [
    { label: 'Aspect Dynamics', href: '#aspect-dynamics' },
    { label: 'Timing & Forecasting', href: '#aspect-timing' },
    { label: 'Integration Rituals', href: '#aspect-integration' },
    { label: 'Case Study & Reflection', href: '#aspect-case-study' },
    { label: 'Other Aspect Options', href: '#other-aspects' },
    { label: 'Frequently Asked Questions', href: '#faq' },
  ];

  const sections = (
    <div className='space-y-10'>
      <section
        id='aspect-dynamics'
        className='bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-3'
      >
        <h2 className='text-2xl font-light text-zinc-100'>Aspect Dynamics</h2>
        <p className='text-zinc-300'>
          {interp.summary} Use this quick snapshot to remember how the planets
          influence each other.
        </p>
        <div className='grid sm:grid-cols-3 gap-4 text-sm text-zinc-300'>
          <div className='rounded-lg border border-zinc-800/60 p-4'>
            <p className='font-semibold text-zinc-100 mb-1'>Natal Focus</p>
            <p>{interp.inNatal}</p>
          </div>
          <div className='rounded-lg border border-zinc-800/60 p-4'>
            <p className='font-semibold text-zinc-100 mb-1'>Transit Focus</p>
            <p>{interp.inTransit}</p>
          </div>
          <div className='rounded-lg border border-zinc-800/60 p-4'>
            <p className='font-semibold text-zinc-100 mb-1'>Synastry Focus</p>
            <p>{interp.inSynastry}</p>
          </div>
        </div>
      </section>

      <section
        id='aspect-case-study'
        className='bg-zinc-900/35 border border-zinc-800 rounded-xl p-6 space-y-3'
      >
        <h2 className='text-2xl font-light text-zinc-100'>
          Case Study & Reflection
        </h2>
        <p className='text-zinc-300'>
          Imagine {p1Name} in the 10th house{' '}
          {aspectData.displayName.toLowerCase()} {p2Name} in the 7th. Career
          (10th) and partnerships (7th) feed each other, so every professional
          leap ripples through close relationships. During a Mars transit
          activating this aspect, the native might feel pressure to choose
          between public success and private harmony.
        </p>
        <p className='text-zinc-300'>
          Working consciously with the aspect means naming both needs aloud: “I
          want to lead boldly <em>and</em> co-create agreements that keep my
          relationships nourished.” Use this template to map your own chart—swap
          the houses and planets for your configuration and write a short
          paragraph on how the tension or flow appears.
        </p>
        <p className='text-zinc-300'>
          Add sensory cues to the practice: what colors, scents, or songs remind
          you of {p1Name}? Which ones evoke {p2Name}? Building a playlist or
          altar that features both signatures helps your nervous system register
          the alliance you are crafting between the two planets.
        </p>
      </section>

      <section
        id='aspect-timing'
        className='bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-4'
      >
        <h2 className='text-2xl font-light text-zinc-100'>
          Timing & Forecasting
        </h2>
        <ol className='list-decimal list-inside text-zinc-300 space-y-2'>
          <li>
            Note exact degrees of {p1Name} and {p2Name} in your chart; transits
            to those degrees reactivate the aspect.
          </li>
          <li>
            Watch eclipses, retrogrades, or lunations that hit those houses for
            extra emphasis.
          </li>
          <li>
            Use the planetary cycle (e.g., Mars every ~2 years) to plan when to
            revisit the lesson.
          </li>
        </ol>
      </section>

      <section
        id='aspect-integration'
        className='bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-3'
      >
        <h2 className='text-2xl font-light text-zinc-100 flex items-center gap-2'>
          <Sparkles className='h-5 w-5 text-lunary-primary-400' />
          Integration Rituals
        </h2>
        <ul className='space-y-2 text-zinc-300'>
          <li>
            Build an altar with symbols for both planets and the aspect element
            to harmonize the energy.
          </li>
          <li>
            Use breathwork or movement practices that mirror the aspect—e.g.,
            dynamic HIIT for squares, yin stretching for trines.
          </li>
          <li>
            Pull a tarot card whenever this aspect is prominent to receive
            narrative guidance.
          </li>
          <li>
            Close transit windows with gratitude journaling; note how the
            experience strengthened your resilience so future activations feel
            less jarring.
          </li>
        </ul>
      </section>

      <section id='other-aspects' className='space-y-4'>
        <h2 className='text-2xl font-light text-zinc-100'>
          Compare Other Aspects
        </h2>
        <p className='text-zinc-300'>
          Toggle through every possible angle between {p1Name} and {p2Name} to
          see how the story changes.
        </p>
        <div className='flex flex-wrap gap-2'>
          {ASPECTS.map((a) => (
            <Link
              key={a}
              href={`/grimoire/aspects/${planet1}/${a}/${planet2}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                a === asp
                  ? 'bg-lunary-primary-900/30 text-lunary-primary-200 border border-lunary-primary-600'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {ASPECT_DATA[a].symbol} {ASPECT_DATA[a].displayName}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <SEOContentTemplate
      title={interp.title}
      h1={`${PLANET_SYMBOLS[p1]} ${PLANET_DISPLAY[p1]} ${aspectData.symbol} ${aspectData.displayName} ${PLANET_DISPLAY[p2]} ${PLANET_SYMBOLS[p2]}`}
      description={interp.summary}
      keywords={interp.keywords}
      canonicalUrl={`https://lunary.app/grimoire/aspects/${planet1}/${aspect}/${planet2}`}
      datePublished='2025-01-01'
      dateModified={new Date().toISOString().split('T')[0]}
      articleSection='Astrological Aspects'
      whatIs={{
        question: `What does ${PLANET_DISPLAY[p1]} ${aspectData.displayName.toLowerCase()} ${PLANET_DISPLAY[p2]} mean?`,
        answer: interp.summary,
      }}
      tldr={`${interp.title} is a ${aspectData.nature} aspect at ${aspectData.degrees}°. Nature: ${aspectData.nature}. Keywords: ${aspectData.keywords.join(', ')}.`}
      meaning={`
## Understanding ${interp.title}

${aspectData.description}

### In the Natal Chart

${interp.inNatal}

### In Transits

${interp.inTransit}

### In Synastry (Relationship Astrology)

${interp.inSynastry}
      `}
      emotionalThemes={aspectData.keywords.map(
        (k) => k.charAt(0).toUpperCase() + k.slice(1),
      )}
      signsMostAffected={['All Signs']}
      heroContent={heroContent}
      intro={intro}
      tableOfContents={tableOfContents}
      howToWorkWith={howToWorkWith}
      journalPrompts={journalPrompts}
      tables={[
        {
          title: 'Aspect Overview',
          headers: ['Property', 'Value'],
          rows: [
            ['Aspect', `${aspectData.displayName} ${aspectData.symbol}`],
            ['Degrees', `${aspectData.degrees}°`],
            [
              'Nature',
              aspectData.nature.charAt(0).toUpperCase() +
                aspectData.nature.slice(1),
            ],
            ['Planets', `${PLANET_DISPLAY[p1]} & ${PLANET_DISPLAY[p2]}`],
          ],
        },
      ]}
      relatedItems={relatedItems}
      ctaText='Discover aspects in your chart'
      ctaHref='/birth-chart'
      sources={[{ name: 'Traditional astrological aspects' }]}
      faqs={faqs}
      internalLinks={internalLinks}
      cosmicConnections={
        <CosmicConnections
          entityType='aspect'
          entityKey={`${planet1}-${aspect}-${planet2}`}
          title={`${interp.title} Connections`}
          extraParams={{ planet1, aspect, planet2 }}
        />
      }
    >
      {sections}
    </SEOContentTemplate>
  );
}
