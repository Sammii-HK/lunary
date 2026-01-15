import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { Heart, Lightbulb, Star } from 'lucide-react';
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

export async function generateStaticParams() {
  const slugs = getAllPlanetSignSlugs();
  return slugs.map((placement) => ({ placement }));
}

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

  const relatedPlacements = Object.keys(signDescriptions)
    .filter((s) => s !== parsed.sign)
    .slice(0, 4)
    .map((s) => ({
      slug: `${parsed.planet}-in-${s}`,
      label: `${content.planet} in ${signDescriptions[s].name}`,
    }));

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

  const iconMap: Record<string, string> = {
    Fire: '🔥',
    Earth: '🌍',
    Air: '💨',
    Water: '💧',
  };

  const tableOfContents = [
    { label: 'Meaning', href: '#meaning' },
    { label: 'Strengths', href: '#strengths' },
    { label: 'Challenges', href: '#challenges' },
    { label: 'Advice', href: '#advice' },
    { label: 'Related Placements', href: '#related' },
  ];

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(articleSchema)}
      <SEOContentTemplate
        title={`${content.title} - Lunary`}
        h1={`${content.planet} in ${content.sign}`}
        description={content.description}
        keywords={content.keywords}
        canonicalUrl={`https://lunary.app/grimoire/placements/${placement}`}
        tableOfContents={tableOfContents}
        intro={`This placement blends ${content.planet} themes with ${content.sign} traits. Use it as a practical guide for strengths, challenges, and daily expression.`}
        tldr={`${content.planet} in ${content.sign} blends ${planetInfo.themes.toLowerCase()} with ${signInfo.element.toLowerCase()} energy. Strengths grow with awareness and simple routines.`}
        symbolism={`${content.planet} represents ${planetInfo.themes.toLowerCase()}, while ${content.sign} expresses it through ${signInfo.element.toLowerCase()} energy and ${signInfo.modality.toLowerCase()} pace. Together, they describe a practical style you can observe in daily choices, relationships, and goals.

If the placement feels intense, look at balance: add grounding if it is fiery, add movement if it is earthy, add clarity if it is watery, and add feeling if it is airy.`}
        howToWorkWith={[
          `Name one strength of ${content.planet} in ${content.sign}.`,
          'Choose a daily habit that supports that strength.',
          'Notice when the placement overreacts and soften the response.',
          'Use reflection rather than judgment to guide change.',
        ]}
        rituals={[
          'Choose one strength and use it intentionally this week.',
          'Journal one example of the placement showing up each day.',
          'Practice a grounding routine when challenges appear.',
        ]}
        journalPrompts={[
          `How does ${content.planet} express through ${content.sign} in my daily life?`,
          `Where do I see this placement as a strength?`,
          `What challenge repeats most often for me?`,
          `What habit would support this placement?`,
        ]}
        tables={[
          {
            title: 'Placement Snapshot',
            headers: ['Focus', 'Details'],
            rows: [
              ['Planet', content.planet],
              ['Sign', content.sign],
              ['Element', signInfo.element],
              ['Modality', signInfo.modality],
            ],
          },
          {
            title: 'Balance Cues',
            headers: ['If this shows up', 'Try this'],
            rows: [
              ['Overactivity', 'Slow down and set one priority'],
              ['Avoidance', 'Take one small action today'],
              ['Emotional overwhelm', 'Name the feeling before reacting'],
            ],
          },
        ]}
        internalLinks={[
          { text: 'Placements Guide', href: '/grimoire/placements' },
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Planets', href: '/grimoire/astronomy/planets' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        heroContent={
          <div className='text-center'>
            <div className='flex items-center justify-center gap-3 mb-4'>
              <span className='px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm'>
                {signInfo.element} Sign
              </span>
              <span className='px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm'>
                {signInfo.modality}
              </span>
            </div>
            <p className='text-lg text-zinc-400'>{content.description}</p>
          </div>
        }
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Placements', href: '/grimoire/placements' },
          { label: content.title },
        ]}
        faqs={[
          {
            question: `Is ${content.planet} in ${content.sign} good or bad?`,
            answer:
              'No placement is purely good or bad. Each has strengths and growth edges. The goal is to work with the energy rather than fight it.',
          },
          {
            question: 'Do other placements change this meaning?',
            answer:
              'Yes. Aspects, houses, and other placements modify the expression. Start with the basic blend, then layer in context.',
          },
        ]}
        ctaText='Discover Your Placements'
        ctaHref='/birth-chart'
      >
        <section id='meaning' className='space-y-4'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            What Does {content.planet} in {content.sign} Mean?
          </h2>
          <div className='prose prose-invert prose-zinc max-w-none'>
            {content.meaning.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section id='strengths' className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4 flex items-center gap-2'>
            <Star className='h-6 w-6 text-lunary-accent' />
            Strengths
          </h2>
          <div className='grid md:grid-cols-2 gap-4'>
            {content.strengths.map((strength, index) => (
              <div
                key={index}
                className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'
              >
                <p className='text-sm text-zinc-400'>{strength}</p>
              </div>
            ))}
          </div>
        </section>

        <section id='challenges' className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            Challenges
          </h2>
          <div className='grid md:grid-cols-2 gap-4'>
            {content.challenges.map((challenge, index) => (
              <div
                key={index}
                className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'
              >
                <p className='text-sm text-zinc-400'>{challenge}</p>
              </div>
            ))}
          </div>
        </section>

        <section id='advice' className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4 flex items-center gap-2'>
            <Lightbulb className='h-5 w-5 text-lunary-primary-300' />
            Advice
          </h2>
          <p className='text-zinc-300 leading-relaxed'>{content.advice}</p>
        </section>

        <section id='related' className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            Related Placements
          </h2>
          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <h3 className='text-xl font-medium text-zinc-100 mb-2'>
                More {content.planet} Placements
              </h3>
              <div className='flex flex-wrap gap-2'>
                {relatedPlacements.map((placementItem) => (
                  <Link
                    key={placementItem.slug}
                    href={`/grimoire/placements/${placementItem.slug}`}
                    className='px-3 py-2 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors'
                  >
                    {placementItem.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className='text-xl font-medium text-zinc-100 mb-2'>
                Same Sign, Other Planets
              </h3>
              <div className='flex flex-wrap gap-2'>
                {samePlaneRelated.map((placementItem) => (
                  <Link
                    key={placementItem.slug}
                    href={`/grimoire/placements/${placementItem.slug}`}
                    className='px-3 py-2 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors'
                  >
                    {placementItem.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className='mb-12'>
          <Link
            href='/grimoire/synastry/generate'
            className='block p-6 rounded-lg bg-gradient-to-r from-lunary-rose-900/30 to-lunary-primary-900/30 border border-lunary-rose-700 hover:border-lunary-rose-500 transition-colors group'
          >
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-xl font-medium text-lunary-rose-300 group-hover:text-lunary-rose-200 transition-colors flex items-center gap-2'>
                  💕 Generate Your Synastry Chart
                </h3>
                <p className='text-zinc-400 mt-1'>
                  Compare complete birth charts for deeper compatibility
                  insights beyond Sun signs.
                </p>
              </div>
              <span className='text-lunary-rose-400 group-hover:text-lunary-rose-300 transition-colors text-2xl'>
                →
              </span>
            </div>
          </Link>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4 flex items-center gap-2'>
            <Heart className='h-5 w-5 text-lunary-rose' />
            Compatibility Scores
          </h2>
          <div className='grid md:grid-cols-4 gap-6'>
            {[
              { label: 'Element', value: signInfo.element },
              { label: 'Modality', value: signInfo.modality },
              { label: 'Planet Rules', value: planetInfo.rules },
              { label: 'Sign Ruler', value: signInfo.ruler },
            ].map((item) => (
              <div
                key={item.label}
                className='text-center p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'
              >
                <div className='text-sm text-zinc-400 mb-1'>{item.label}</div>
                <div className='text-lg text-zinc-100'>{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <div className='mt-8'>
          <CosmicConnections
            entityType='hub-placements'
            entityKey='placements'
            title='Placements Connections'
          />
        </div>
      </SEOContentTemplate>
    </div>
  );
}
