import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';

import {
  PLANETS,
  ASPECTS,
  ASPECT_DATA,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
  Planet,
  Aspect,
} from '@/constants/seo/aspects';
import { GrimoireBreadcrumbs } from '@/components/grimoire/GrimoireBreadcrumbs';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const dynamicParams = false;

export function generateStaticParams() {
  return PLANETS.flatMap((planet1) =>
    ASPECTS.map((aspect) => ({ planet1, aspect })),
  );
}

const aspectReadMethods: Record<Aspect, string> = {
  conjunct:
    'A conjunction blends two planetary functions into one concentrated signature. Read it as intensity first, then look for the house and sign that give the intensity somewhere to go.',
  sextile:
    'A sextile links planets by opportunity. It is supportive, but it usually needs conscious action before the gift becomes visible.',
  square:
    'A square creates pressure between planets that want different responses. It is not a flaw; it is a growth engine that becomes useful when the tension is named directly.',
  trine:
    'A trine shows ease, fluency, and inherited competence. The risk is passivity, so the best reading asks how the person can actively use the gift.',
  opposite:
    'An opposition creates polarity and awareness through contrast. Read it through projection, relationship, balance, and the need to hold both ends of the axis.',
  quincunx:
    'A quincunx shows mismatch and adjustment. It asks for fine-tuning because the planets do not easily understand each other by sign relationship.',
  semisextile:
    'A semisextile is subtle and developmental. It often works through small repeated choices rather than dramatic turning points.',
};

const aspectTypeSlugs: Record<Aspect, string> = {
  conjunct: 'conjunction',
  sextile: 'sextile',
  square: 'square',
  trine: 'trine',
  opposite: 'opposition',
  quincunx: 'quincunx',
  semisextile: 'semisextile',
};

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
  const aspectData = ASPECT_DATA[aspect as Aspect];
  const title = `${planetName} ${aspectData.displayName}: All Combinations | Lunary`;
  const description = `Explore all ${planetName} ${aspectData.displayName.toLowerCase()} aspects with other planets. Learn the degrees, chart context, and natal, transit, and synastry meanings.`;

  return {
    title,
    description,
    keywords: [
      `${planetName.toLowerCase()} ${aspect}`,
      `${aspectData.displayName.toLowerCase()} aspects`,
      `${planetName.toLowerCase()} aspects`,
      `${planetName.toLowerCase()} aspect meanings`,
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
  const aspectData = ASPECT_DATA[aspect as Aspect];
  const aspectSymbol = aspectData.symbol;
  const aspectMethod = aspectReadMethods[aspect as Aspect];
  const otherPlanets = PLANETS.filter((p) => p !== planet1);

  const breadcrumbItems = [
    { name: 'Grimoire', url: '/grimoire' },
    { name: 'Aspects', url: '/grimoire/aspects' },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <GrimoireBreadcrumbs items={breadcrumbItems} />
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center items-center gap-4 mb-4'>
            <span className='text-5xl'>{symbol}</span>
            <span className='text-3xl text-content-muted'>{aspectSymbol}</span>
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-content-primary mb-4'>
            {planetName} {aspectData.displayName} Aspects
          </h1>
          <p className='text-lg text-content-muted max-w-2xl mx-auto'>
            Explore how {planetName} forms{' '}
            {aspectData.displayName.toLowerCase()} aspects with other planets at{' '}
            {aspectData.degrees} degrees, and how to read that geometry inside a
            full chart.
          </p>
        </div>

        <section className='mb-12 rounded-xl border border-stroke-subtle bg-surface-elevated/50 p-6'>
          <h2 className='text-xl font-medium text-content-primary mb-3'>
            How to Read a {planetName} {aspectData.displayName}
          </h2>
          <div className='space-y-4 text-content-muted'>
            <p>{aspectMethod}</p>
            <p>
              Lunary reads this as a measured angle, not a standalone keyword.
              First check the aspect degree and orb, then read the planets,
              signs, houses, and chart rulers. The same {planetName}{' '}
              {aspectData.displayName.toLowerCase()} can feel different in a
              natal chart, a transit, or synastry because the context changes
              what the aspect is acting on.
            </p>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-content-primary mb-6'>
            {planetName} {aspectData.displayName} Combinations
          </h2>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
            {otherPlanets.map((planet2) => (
              <Link
                key={planet2}
                href={`/grimoire/aspects/${planet1}/${aspect}/${planet2}`}
                className='group rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-4 hover:bg-surface-elevated/50 hover:border-lunary-primary-600 transition-all text-center'
              >
                <div className='flex items-center justify-center gap-2 mb-2'>
                  <span className='text-2xl'>{symbol}</span>
                  <span className='text-lg text-content-muted'>
                    {aspectSymbol}
                  </span>
                  <span className='text-2xl'>
                    {PLANET_SYMBOLS[planet2 as Planet]}
                  </span>
                </div>
                <h3 className='font-medium text-content-primary group-hover:text-content-brand transition-colors text-sm'>
                  {planetName} {aspectData.displayName}{' '}
                  {PLANET_DISPLAY[planet2 as Planet]}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        <section className='mb-12 grid gap-4 md:grid-cols-3'>
          {[
            [
              'Natal',
              `In a natal chart, ${planetName} ${aspectData.displayName.toLowerCase()} aspects describe a built-in pattern of expression and pressure.`,
            ],
            [
              'Transits',
              `In transits, the same aspect shows a temporary activation of ${planetName.toLowerCase()} themes against a natal planet.`,
            ],
            [
              'Synastry',
              `In synastry, it describes how one person's ${planetName.toLowerCase()} function contacts another person's planet.`,
            ],
          ].map(([label, text]) => (
            <div
              key={label}
              className='rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-5'
            >
              <h3 className='font-medium text-content-primary mb-2'>{label}</h3>
              <p className='text-sm text-content-muted'>{text}</p>
            </div>
          ))}
        </section>

        <div className='border-t border-stroke-subtle pt-8'>
          <h3 className='text-lg font-medium text-content-primary mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href={`/grimoire/aspects/${planet1}`}
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              All {planetName} Aspects
            </Link>
            <Link
              href={`/grimoire/aspects/types/${aspectTypeSlugs[aspect as Aspect]}`}
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              About {aspectData.displayName}s
            </Link>
            <Link
              href='/grimoire/aspects'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              All Aspects
            </Link>
          </div>
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
