import type { Metadata } from 'next';
import Link from 'next/link';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { generateBirthChartWithHouses } from '@utils/astrology/birthChart';
import { composeChartRulerResult } from '@/lib/quiz/engines/chart-ruler';

export const metadata: Metadata = {
  title: 'Preview your Chart Ruler | Lunary',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type SearchParams = {
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  birthTimezone?: string;
};

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  if (!params.birthDate) {
    return (
      <main className='min-h-screen'>
        <section className='mx-auto w-full max-w-2xl px-4 py-12'>
          <div className='border-lunary-primary-800/60 bg-layer-base rounded-2xl border p-8'>
            <Heading as='h1' variant='h2' className='mb-4'>
              Preview your full chart ruler reading
            </Heading>
            <p className='text-content-secondary mb-4 text-sm'>
              Pass your birth data as query params to render the full unlocked
              reading server-side.
            </p>
            <code className='text-content-primary bg-layer-raised block rounded p-3 text-xs'>
              ?birthDate=1994-01-20&birthTime=01:00&birthLocation=London, UK
            </code>
          </div>
        </section>
      </main>
    );
  }

  const chart = await generateBirthChartWithHouses(
    params.birthDate,
    params.birthTime,
    params.birthLocation,
    params.birthTimezone,
  );
  const result = composeChartRulerResult(chart, { unlocked: true });

  if (!result) {
    return (
      <main className='min-h-screen'>
        <section className='mx-auto w-full max-w-2xl px-4 py-12'>
          <div className='border-lunary-primary-800/60 bg-layer-base rounded-2xl border p-8 text-center'>
            <Heading as='h1' variant='h2' className='mb-4'>
              Could not compute your chart
            </Heading>
            <p className='text-content-secondary'>
              Check the birthDate (YYYY-MM-DD), birthTime (HH:MM), and
              birthLocation are valid.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className='min-h-screen'>
      <section className='mx-auto w-full max-w-3xl px-4 py-8'>
        <div className='flex flex-col gap-8 rounded-2xl border border-lunary-primary-800/60 bg-layer-base p-6 sm:p-10'>
          <div className='flex flex-col gap-4 text-center'>
            <span className='text-lunary-accent text-xs tracking-widest uppercase'>
              {result.hero.eyebrow}
            </span>
            {result.archetype && (
              <div className='flex flex-col gap-2'>
                <Heading
                  as='h1'
                  variant='h1'
                  className='text-lunary-primary-100'
                >
                  {result.archetype.label}
                </Heading>
                <p className='text-content-primary mx-auto max-w-xl text-base italic'>
                  {result.archetype.tagline}
                </p>
              </div>
            )}
            <p className='text-content-secondary mx-auto max-w-2xl text-sm sm:text-base'>
              {result.hero.headline}
            </p>
            <p className='text-content-secondary mx-auto max-w-xl text-sm'>
              {result.hero.subhead}
            </p>
            {result.archetype && (
              <p className='text-content-secondary mx-auto mt-2 max-w-2xl text-sm leading-relaxed'>
                {result.archetype.rationale}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-6'>
            {result.sections.map((section, i) => (
              <article
                key={i}
                className='border-lunary-primary-800/40 bg-layer-raised/40 rounded-xl border p-5'
              >
                <Heading as='h3' variant='h4' className='mb-2'>
                  {section.heading}
                </Heading>
                <p className='text-content-secondary text-sm leading-relaxed'>
                  {section.body}
                </p>
                {section.highlight && (
                  <p className='text-lunary-accent mt-3 text-xs'>
                    {section.highlight}
                  </p>
                )}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className='text-content-secondary mt-3 flex flex-col gap-1 text-sm'>
                    {section.bullets.map((b, bi) => (
                      <li key={bi} className='flex items-start gap-2'>
                        <Sparkles className='text-lunary-accent mt-1 size-3 shrink-0' />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>

          <div className='border-lunary-primary-700/60 bg-layer-raised flex flex-col gap-3 rounded-xl border p-6 text-center'>
            <p className='text-content-primary text-base'>{result.tease}</p>
            <Button asChild variant='lunary-solid' size='lg'>
              <Link href='/app'>
                Open Lunary <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
