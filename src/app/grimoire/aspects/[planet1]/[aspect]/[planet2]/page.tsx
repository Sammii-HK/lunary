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
  Planet,
  Aspect,
} from '@/constants/seo/aspects';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';

// 30-day ISR revalidation
export const revalidate = 2592000;
interface PageParams {
  planet1: string;
  aspect: string;
  planet2: string;
}

const PLANET_THEME_MAP: Record<Planet, string> = {
  sun: 'identity, vitality, and conscious direction',
  moon: 'emotional needs, instinct, and security',
  mercury: 'thinking, speech, and interpretation',
  venus: 'love, desire, values, and receptivity',
  mars: 'drive, conflict, libido, and initiative',
  jupiter: 'growth, belief, luck, and expansion',
  saturn: 'pressure, discipline, maturity, and timing',
  uranus: 'change, breakthrough, rebellion, and surprise',
  neptune: 'imagination, faith, fantasy, and surrender',
  pluto: 'power, transformation, fear, and rebirth',
};

const ASPECT_FOCUS_MAP: Record<
  Aspect,
  { pressure: string; gift: string; advice: string }
> = {
  conjunct: {
    pressure: 'intensity and over-identification',
    gift: 'focus, concentration, and raw potency',
    advice: 'watch for overwhelm and give the combined energy a clear outlet',
  },
  sextile: {
    pressure: 'untapped potential through passivity',
    gift: 'useful opportunities and easy cooperation',
    advice:
      'take action, because sextiles help most when you actually engage them',
  },
  square: {
    pressure: 'friction, urgency, and unresolved conflict',
    gift: 'growth through action and honest adjustment',
    advice:
      'name the tension early and work with it instead of trying to bypass it',
  },
  trine: {
    pressure: 'coasting or underusing natural gifts',
    gift: 'flow, fluency, and effortless support',
    advice: 'treat the ease as a resource to develop, not something to waste',
  },
  opposite: {
    pressure: 'projection, polarity, and either-or thinking',
    gift: 'awareness through contrast and relationship',
    advice:
      'look for balance rather than choosing one side and rejecting the other',
  },
  quincunx: {
    pressure: 'irritation, mismatch, and awkward adaptation',
    gift: 'fine-tuning and unusual integration',
    advice: 'make small repeated adjustments instead of forcing a perfect fix',
  },
  semisextile: {
    pressure: 'subtle disconnect or overlooked growth',
    gift: 'small openings that compound over time',
    advice:
      'pay attention to the quiet signal because this aspect works through gradual development',
  },
};

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

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
  const p1Theme = PLANET_THEME_MAP[p1];
  const p2Theme = PLANET_THEME_MAP[p2];
  const aspectFocus = ASPECT_FOCUS_MAP[asp];
  const intro = `${PLANET_DISPLAY[p1]} ${aspectData.displayName.toLowerCase()} ${PLANET_DISPLAY[p2]} describes how ${p1Theme} interacts with ${p2Theme}. This page breaks down what the aspect means in a natal chart, what it does in transits, and how it behaves in synastry so the interpretation is specific instead of hand-wavy.`;
  const faqs = [
    {
      question: `Is ${PLANET_DISPLAY[p1]} ${aspectData.displayName.toLowerCase()} ${PLANET_DISPLAY[p2]} good or bad?`,
      answer: `${interp.title} is not simply good or bad. It is a ${aspectData.nature} aspect, which means its gift is ${aspectFocus.gift} and its pressure point is ${aspectFocus.pressure}.`,
    },
    {
      question: `How does ${interp.title} show up in a natal chart?`,
      answer: interp.inNatal,
    },
    {
      question: `How does ${interp.title} work in transits or synastry?`,
      answer: `${interp.inTransit} ${interp.inSynastry}`,
    },
  ];

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
      intro={intro}
      whatIs={{
        question: `What does ${PLANET_DISPLAY[p1]} ${aspectData.displayName.toLowerCase()} ${PLANET_DISPLAY[p2]} mean?`,
        answer: `${interp.summary} In practice, it blends ${p1Theme} with ${p2Theme}, so the real question is whether you are using the aspect consciously or letting it run on autopilot.`,
      }}
      tldr={`${interp.title} is a ${aspectData.nature} aspect at ${aspectData.degrees}° between ${PLANET_DISPLAY[p1]} (${p1Theme}) and ${PLANET_DISPLAY[p2]} (${p2Theme}). Main gift: ${aspectFocus.gift}. Main pressure point: ${aspectFocus.pressure}.`}
      meaning={`
## Understanding ${interp.title}

${aspectData.description} In real chart work, this aspect is about how ${PLANET_DISPLAY[p1].toLowerCase()} handles ${p1Theme} when it meets ${PLANET_DISPLAY[p2].toLowerCase()} themes of ${p2Theme}.

### Core dynamic

- **Main gift:** ${aspectFocus.gift}
- **Main pressure point:** ${aspectFocus.pressure}
- **Best way to work with it:** ${aspectFocus.advice}

### In the Natal Chart

${interp.inNatal}

### In Transits

${interp.inTransit}

### In Synastry (Relationship Astrology)

${interp.inSynastry}
      `}
      faqs={faqs}
      emotionalThemes={aspectData.keywords.map(
        (k) => k.charAt(0).toUpperCase() + k.slice(1),
      )}
      signsMostAffected={['All Signs']}
      rituals={[
        `Journal where ${PLANET_DISPLAY[p1].toLowerCase()} themes and ${PLANET_DISPLAY[p2].toLowerCase()} themes already support each other.`,
        `Notice where this aspect tends to produce ${aspectFocus.pressure} and name the trigger before reacting.`,
        `Use the aspect's strongest gift — ${aspectFocus.gift} — as the conscious practice point.`,
      ]}
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
            ['Main Gift', aspectFocus.gift],
            ['Pressure Point', aspectFocus.pressure],
          ],
        },
      ]}
      relatedItems={[
        {
          name: PLANET_DISPLAY[p1],
          href: `/grimoire/astronomy/planets/${p1}`,
          type: 'Planet',
        },
        {
          name: PLANET_DISPLAY[p2],
          href: `/grimoire/astronomy/planets/${p2}`,
          type: 'Planet',
        },
        { name: 'Aspects Overview', href: '/grimoire/aspects', type: 'Guide' },
      ]}
      ctaText='Discover aspects in your chart'
      ctaHref='/birth-chart'
      sources={[{ name: 'Traditional astrological aspects' }]}
      cosmicConnections={
        <CosmicConnections
          entityType='aspect'
          entityKey={`${planet1}-${aspect}-${planet2}`}
          title={`${interp.title} Connections`}
          extraParams={{ planet1, aspect, planet2 }}
        />
      }
    >
      <div className='mt-8'>
        <h3 className='text-lg font-medium mb-4'>Other Aspects</h3>
        <div className='flex flex-wrap gap-2'>
          {ASPECTS.map((a) => (
            <Link
              key={a}
              href={`/grimoire/aspects/${planet1}/${a}/${planet2}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                a === asp
                  ? 'bg-layer-base/30 text-content-secondary border border-lunary-primary-600'
                  : 'bg-surface-card/50 text-content-muted hover:bg-surface-card hover:text-content-primary'
              }`}
            >
              {ASPECT_DATA[a].symbol} {ASPECT_DATA[a].displayName}
            </Link>
          ))}
        </div>
      </div>
    </SEOContentTemplate>
  );
}
