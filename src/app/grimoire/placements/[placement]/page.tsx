import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { ArrowRight, Star, AlertTriangle, Lightbulb } from 'lucide-react';
import {
  generatePlanetSignContent,
  getAllPlanetSignSlugs,
  planetDescriptions,
  signDescriptions,
} from '@/constants/seo/planet-sign-content';
import { createArticleSchema, renderJsonLd } from '@/lib/schema';

interface PageProps {
  params: Promise<{ placement: string }>;
}

// Generate static params for all planet-sign combinations
export async function generateStaticParams() {
  const slugs = getAllPlanetSignSlugs();
  return slugs.map((placement) => ({ placement }));
}

// Parse the placement slug to extract planet and sign
function parsePlacement(slug: string): { planet: string; sign: string } | null {
  const match = slug.match(/^([a-z-]+)-in-([a-z]+)$/);
  if (!match) return null;

  const [, planet, sign] = match;
  if (!planetDescriptions[planet] || !signDescriptions[sign]) {
    return null;
  }
  return { planet, sign };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { placement } = await params;
  const parsed = parsePlacement(placement);

  if (!parsed) {
    return { title: 'Not Found' };
  }

  const content = generatePlanetSignContent(parsed.planet, parsed.sign);

  return {
    title: `${content.title} - Lunary`,
    description: content.description,
    keywords: content.keywords,
    openGraph: {
      title: `${content.title} - Lunary`,
      description: content.description,
      type: 'article',
      url: `https://lunary.app/grimoire/placements/${placement}`,
    },
    twitter: {
      card: 'summary',
      title: `${content.title} - Lunary`,
      description: content.description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/placements/${placement}`,
    },
  };
}

export default async function PlacementPage({ params }: PageProps) {
  const { placement } = await params;
  const parsed = parsePlacement(placement);

  if (!parsed) {
    notFound();
  }

  const content = generatePlanetSignContent(parsed.planet, parsed.sign);
  const planetInfo = planetDescriptions[parsed.planet];
  const signInfo = signDescriptions[parsed.sign];

  // Get related placements (same planet, different signs)
  const relatedPlacements = Object.keys(signDescriptions)
    .filter((s) => s !== parsed.sign)
    .slice(0, 4)
    .map((s) => ({
      slug: `${parsed.planet}-in-${s}`,
      label: `${content.planet} in ${signDescriptions[s].name}`,
    }));

  // Get same sign, different planets
  const samePlaneRelated = Object.keys(planetDescriptions)
    .filter((p) => p !== parsed.planet)
    .slice(0, 4)
    .map((p) => ({
      slug: `${p}-in-${parsed.sign}`,
      label: `${planetDescriptions[p].name} in ${content.sign}`,
    }));

  const articleSchema = createArticleSchema({
    headline: content.title,
    description: content.description,
    keywords: content.keywords,
    url: `https://lunary.app/grimoire/placements/${placement}`,
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
  });

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(articleSchema)}

      <div className='max-w-4xl mx-auto px-4 py-12'>
        {/* Breadcrumbs */}
        <nav className='flex items-center gap-2 text-sm text-zinc-400 mb-8'>
          <Link href='/grimoire' className='hover:text-zinc-300'>
            Grimoire
          </Link>
          <span>/</span>
          <Link href='/grimoire/placements' className='hover:text-zinc-300'>
            Placements
          </Link>
          <span>/</span>
          <span className='text-zinc-400'>{content.title}</span>
        </nav>

        {/* Header */}
        <header className='mb-12'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='px-3 py-1 rounded-full bg-lunary-primary-900/20 text-lunary-primary-300 text-sm'>
              {signInfo.element} Sign
            </span>
            <span className='px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm'>
              {signInfo.modality}
            </span>
          </div>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            {content.planet} in {content.sign}
          </h1>
          <p className='text-lg text-zinc-400'>{content.description}</p>
        </header>

        {/* Quick Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-12'>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-2xl mb-1'>
              {signInfo.element === 'Fire'
                ? '🔥'
                : signInfo.element === 'Earth'
                  ? '🌍'
                  : signInfo.element === 'Air'
                    ? '💨'
                    : '💧'}
            </div>
            <div className='text-xs text-zinc-400'>Element</div>
            <div className='text-sm text-zinc-300'>{signInfo.element}</div>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-2xl mb-1'>⚡</div>
            <div className='text-xs text-zinc-400'>Modality</div>
            <div className='text-sm text-zinc-300'>{signInfo.modality}</div>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-2xl mb-1'>🌟</div>
            <div className='text-xs text-zinc-400'>Planet Rules</div>
            <div className='text-sm text-zinc-300'>{planetInfo.rules}</div>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-2xl mb-1'>♈</div>
            <div className='text-xs text-zinc-400'>Sign Ruler</div>
            <div className='text-sm text-zinc-300'>{signInfo.ruler}</div>
          </div>
        </div>

        {/* Main Content */}
        <article className='space-y-12'>
          {/* Meaning Section */}
          <section>
            <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
              What Does {content.planet} in {content.sign} Mean?
            </h2>
            <div className='prose prose-invert prose-zinc max-w-none'>
              {content.meaning.split('\n\n').map((paragraph, i) => (
                <p key={i} className='text-zinc-300 leading-relaxed mb-4'>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          {/* Strengths */}
          <section>
            <h2 className='text-2xl font-medium text-zinc-100 mb-4 flex items-center gap-2'>
              <Star className='h-6 w-6 text-lunary-accent' />
              Strengths of This Placement
            </h2>
            <div className='p-6 rounded-lg border border-lunary-success-700 bg-lunary-success-950'>
              <ul className='space-y-3'>
                {content.strengths.map((strength, i) => (
                  <li key={i} className='flex items-start gap-3 text-zinc-300'>
                    <span className='text-lunary-success mt-1'>✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Challenges */}
          <section>
            <h2 className='text-2xl font-medium text-zinc-100 mb-4 flex items-center gap-2'>
              <AlertTriangle className='h-6 w-6 text-lunary-accent' />
              Potential Challenges
            </h2>
            <div className='p-6 rounded-lg border border-lunary-accent-700 bg-lunary-accent-950'>
              <ul className='space-y-3'>
                {content.challenges.map((challenge, i) => (
                  <li key={i} className='flex items-start gap-3 text-zinc-300'>
                    <span className='text-lunary-accent mt-1'>!</span>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Advice */}
          <section>
            <h2 className='text-2xl font-medium text-zinc-100 mb-4 flex items-center gap-2'>
              <Lightbulb className='h-6 w-6 text-lunary-primary-400' />
              How to Work With This Placement
            </h2>
            <div className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
              <p className='text-zinc-300 leading-relaxed'>{content.advice}</p>
            </div>
          </section>
        </article>

        {/* Related Placements */}
        <section className='mt-12 pt-8 border-t border-zinc-800'>
          <h2 className='text-xl font-medium text-zinc-100 mb-6'>
            Explore Related Placements
          </h2>
          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <h3 className='text-sm text-zinc-400 mb-3'>
                {content.planet} in Other Signs
              </h3>
              <div className='flex flex-wrap gap-2'>
                {relatedPlacements.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/grimoire/placements/${p.slug}`}
                    className='px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className='text-sm text-zinc-400 mb-3'>
                Other Planets in {content.sign}
              </h3>
              <div className='flex flex-wrap gap-2'>
                {samePlaneRelated.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/grimoire/placements/${p.slug}`}
                    className='px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className='mt-12 text-center'>
          <div className='p-8 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
            <h2 className='text-xl font-medium text-zinc-100 mb-2'>
              Discover Your Full Birth Chart
            </h2>
            <p className='text-zinc-400 mb-6'>
              {content.planet} in {content.sign} is just one part of your cosmic
              story. Get your complete birth chart analysis.
            </p>
            <Link
              href='/birth-chart'
              className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
            >
              View Your Birth Chart
              <ArrowRight className='h-5 w-5' />
            </Link>
          </div>
        </section>

        {/* E-A-T Footer */}
        <footer className='mt-12 pt-8 border-t border-zinc-800 text-sm text-zinc-400'>
          <p>
            Written by Sammii, Founder of Lunary • Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className='mt-2'>
            Sources: Traditional astrological texts, modern psychological
            astrology interpretations
          </p>
        </footer>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
