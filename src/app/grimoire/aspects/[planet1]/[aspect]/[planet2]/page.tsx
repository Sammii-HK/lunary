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
                  ? 'bg-lunary-primary-900/30 text-lunary-primary-200 border border-lunary-primary-600'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
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
