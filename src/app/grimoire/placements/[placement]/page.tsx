import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { NavParamLink } from '@/components/NavParamLink';
import { Heading } from '@/components/ui/Heading';
import { Heart, Sparkles, Users, Star, AlertTriangle } from 'lucide-react';
import {
  generatePlanetSignContent,
  planetDescriptions,
  signDescriptions,
} from '@/constants/seo/planet-sign-content';
import {
  getCuratedPlacement,
  getPlacementSEOTitle,
  getPlacementSEODescription,
  type CuratedPlacement,
} from '@/lib/placements/getCuratedPlacement';

// 30-day ISR revalidation
export const revalidate = 2592000;

interface PageProps {
  params: Promise<{ placement: string }>;
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

  const curated = getCuratedPlacement(placement);
  const content = generatePlanetSignContent(parsed.planet, parsed.sign);

  // Use SEO-optimized title and description from curated data or fallback
  const seoTitle = getPlacementSEOTitle(parsed.planet, parsed.sign, curated);
  const seoDescription = getPlacementSEODescription(
    parsed.planet,
    parsed.sign,
    curated,
  );

  const title = `${seoTitle} - Lunary`;
  const description = seoDescription;

  // Generate keywords based on planet and sign
  const planetName = planetDescriptions[parsed.planet].name.toLowerCase();
  const signName = signDescriptions[parsed.sign].name.toLowerCase();
  const keywords = [
    `${planetName} in ${signName}`,
    `${planetName} ${signName}`,
    `${planetName} in ${signName} meaning`,
    `${planetName} in ${signName} personality`,
    `${signName} ${planetName}`,
  ];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://lunary.app/grimoire/placements/${placement}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
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

  const curated = getCuratedPlacement(placement);
  const content = generatePlanetSignContent(parsed.planet, parsed.sign);
  const planetInfo = planetDescriptions[parsed.planet];
  const signInfo = signDescriptions[parsed.sign];

  // Get related placements
  const relatedPlacements = Object.keys(signDescriptions)
    .filter((s) => s !== parsed.sign)
    .slice(0, 4)
    .map((s) => ({
      slug: `${parsed.planet}-in-${s}`,
      label: `${content.planet} in ${signDescriptions[s].name}`,
    }));

  const samePlanetRelated = Object.keys(planetDescriptions)
    .filter((p) => p !== parsed.planet)
    .slice(0, 4)
    .map((p) => ({
      slug: `${p}-in-${parsed.sign}`,
      label: `${planetDescriptions[p].name} in ${content.sign}`,
    }));

  // Build content based on whether we have curated data
  const pageTitle = curated
    ? `${content.planet} in ${curated.sign}`
    : `${content.planet} in ${content.sign}`;

  const pageSubtitle = curated
    ? curated.dignity
      ? `${curated.dignity} • ${signInfo.element} Sign`
      : `${signInfo.element} Sign • ${signInfo.modality}`
    : `${signInfo.element} Sign • ${signInfo.modality}`;

  // Get intro based on available fields
  const getIntro = (c: CuratedPlacement | null) => {
    if (!c) return content.description;
    // Try various intro fields in order of preference
    const introFields = [
      'overview',
      'emotionalNeeds',
      'lifeThemes',
      'communicationStyle',
      'actionStyle',
    ] as const;
    for (const field of introFields) {
      if (field in c && typeof c[field] === 'string') {
        return c[field] as string;
      }
    }
    return content.description;
  };

  const intro = getIntro(curated);

  // Generate meaning content based on planet and available fields
  const getMeaningContent = (c: CuratedPlacement | null) => {
    if (!c) {
      return `### What Does ${content.planet} in ${content.sign} Mean?\n\n${content.meaning}`;
    }

    const sections: string[] = [];
    const sign = c.sign;

    // Planet-specific content sections
    if ('loveStyle' in c) {
      sections.push(
        `### How ${content.planet} in ${sign} Loves\n\n${c.loveStyle}`,
      );
    }
    if (
      'whatTheyreAttractedTo' in c &&
      Array.isArray(c.whatTheyreAttractedTo)
    ) {
      sections.push(
        `### What They're Attracted To\n\n${(c.whatTheyreAttractedTo as string[]).map((item) => `- ${item}`).join('\n')}`,
      );
    }
    if ('whatTheyValue' in c && Array.isArray(c.whatTheyValue)) {
      sections.push(
        `### What They Value\n\n${(c.whatTheyValue as string[]).map((item) => `- ${item}`).join('\n')}`,
      );
    }
    if ('emotionalNeeds' in c) {
      sections.push(`### Emotional Nature\n\n${c.emotionalNeeds}`);
    }
    if ('lifeThemes' in c) {
      sections.push(`### Life Themes\n\n${c.lifeThemes}`);
    }
    if ('communicationStyle' in c) {
      sections.push(`### Communication Style\n\n${c.communicationStyle}`);
    }
    if ('learningStyle' in c) {
      sections.push(`### Learning Style\n\n${c.learningStyle}`);
    }
    if ('actionStyle' in c) {
      sections.push(`### Action Style\n\n${c.actionStyle}`);
    }
    if ('driveAndMotivation' in c) {
      sections.push(`### Drive & Motivation\n\n${c.driveAndMotivation}`);
    }
    if ('inRelationships' in c) {
      sections.push(`### In Relationships\n\n${c.inRelationships}`);
    }
    if ('careerPaths' in c) {
      sections.push(`### Career Paths\n\n${c.careerPaths}`);
    }
    if ('selfCareAdvice' in c) {
      sections.push(`### Self-Care Advice\n\n${c.selfCareAdvice}`);
    }
    if ('growthPath' in c) {
      sections.push(`### Growth Path\n\n${c.growthPath}`);
    }

    return sections.length > 0
      ? sections.join('\n\n')
      : `### What Does ${content.planet} in ${content.sign} Mean?\n\n${content.meaning}`;
  };

  const meaningContent = getMeaningContent(curated);
  const strengths =
    curated?.strengths || curated?.coreTraits || content.strengths;
  const challenges = curated?.challenges || content.challenges;

  // Generate FAQs based on available curated data
  const generateFaqs = () => {
    const baseFaqs = [
      {
        question: `What does ${content.planet} in ${content.sign} mean?`,
        answer: intro.slice(0, 200) + (intro.length > 200 ? '...' : ''),
      },
      {
        question: `What are the strengths of ${content.planet} in ${content.sign}?`,
        answer: strengths.slice(0, 3).join(', ') + '.',
      },
      {
        question: `What are challenges for ${content.planet} in ${content.sign}?`,
        answer: challenges.slice(0, 2).join(' and ') + '.',
      },
    ];

    if (!curated) return baseFaqs;

    // Add planet-specific FAQ based on available fields
    if ('loveStyle' in curated && typeof curated.loveStyle === 'string') {
      baseFaqs.push({
        question: `How does ${content.planet} in ${curated.sign} love?`,
        answer: (curated.loveStyle as string).slice(0, 150) + '...',
      });
    }
    if ('bestMatches' in curated && Array.isArray(curated.bestMatches)) {
      baseFaqs.push({
        question: `What are the best matches for ${content.planet} in ${curated.sign}?`,
        answer: `Compatible with ${(curated.bestMatches as string[]).join(', ')}.`,
      });
    }
    if (
      'emotionalNeeds' in curated &&
      typeof curated.emotionalNeeds === 'string'
    ) {
      baseFaqs.push({
        question: `What does ${content.planet} in ${curated.sign} need emotionally?`,
        answer: (curated.emotionalNeeds as string).slice(0, 150) + '...',
      });
    }
    if ('careerPaths' in curated && typeof curated.careerPaths === 'string') {
      baseFaqs.push({
        question: `What careers suit ${content.planet} in ${curated.sign}?`,
        answer: curated.careerPaths as string,
      });
    }

    return baseFaqs.slice(0, 4); // Keep max 4 FAQs
  };

  const faqs = generateFaqs();

  return (
    <SEOContentTemplate
      title={`${pageTitle} - Lunary`}
      h1={pageTitle}
      subtitle={pageSubtitle}
      description={intro}
      keywords={[
        `${parsed.planet} in ${parsed.sign}`,
        `${parsed.planet} ${parsed.sign}`,
        `${parsed.planet} in ${parsed.sign} meaning`,
        `${parsed.sign} ${parsed.planet}`,
        ...content.keywords,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/placements/${placement}`}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Placements', href: '/grimoire/placements' },
        { label: pageTitle },
      ]}
      whatIs={{
        question: `What does ${pageTitle} mean?`,
        answer: intro,
      }}
      intro={intro}
      tldr={
        curated && curated.coreTraits
          ? `${content.planet} in ${curated.sign}${curated.dignity ? ` (${curated.dignity})` : ''}: ${curated.coreTraits.slice(0, 3).join(', ')}.`
          : `${content.planet} in ${content.sign}: ${content.strengths.slice(0, 2).join(', ')}.`
      }
      meaning={meaningContent}
      howToWorkWith={
        curated && 'growthPath' in curated
          ? [curated.growthPath as string]
          : curated && 'selfCareAdvice' in curated
            ? [curated.selfCareAdvice as string]
            : [content.advice]
      }
      faqs={faqs}
      internalLinks={[
        { text: 'All Placements', href: '/grimoire/placements' },
        {
          text: `About ${content.planet}`,
          href: `/grimoire/astronomy/planets/${parsed.planet}`,
        },
        {
          text: `${content.sign} Sign`,
          href: `/grimoire/zodiac/${parsed.sign}`,
        },
        {
          text: 'Birth Chart Guide',
          href: '/grimoire/guides/birth-chart-complete-guide',
        },
      ]}
      ctaText='Discover Your Placements'
      ctaHref='/birth-chart'
      cosmicConnections={
        <CosmicConnections
          entityType='placement'
          entityKey={placement}
          title={`${pageTitle} Cosmic Web`}
        />
      }
    >
      {/* Quick Stats */}
      <section className='mb-8'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
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
          {curated?.dignity ? (
            <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
              <div className='text-2xl mb-1'>✨</div>
              <div className='text-xs text-zinc-400'>Dignity</div>
              <div className='text-sm text-zinc-300'>{curated.dignity}</div>
            </div>
          ) : (
            <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
              <div className='text-2xl mb-1'>♈</div>
              <div className='text-xs text-zinc-400'>Sign Ruler</div>
              <div className='text-sm text-zinc-300'>{signInfo.ruler}</div>
            </div>
          )}
        </div>
      </section>

      {/* Compatibility (for planets with match data) */}
      {curated &&
        'bestMatches' in curated &&
        Array.isArray(curated.bestMatches) && (
          <section className='mb-8'>
            <Heading as='h2' variant='h3'>
              <Heart className='h-5 w-5 inline mr-2 text-lunary-rose' />
              {content.planet} Sign Compatibility
            </Heading>
            <div className='grid md:grid-cols-2 gap-4 mt-4'>
              <div className='p-5 rounded-lg border border-lunary-success-700 bg-lunary-success-950'>
                <div className='flex items-center gap-2 mb-3'>
                  <Sparkles className='h-4 w-4 text-lunary-success' />
                  <span className='font-medium text-zinc-100'>
                    Best Matches
                  </span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {(curated.bestMatches as string[]).map((match) => (
                    <NavParamLink
                      key={match}
                      href={`/grimoire/placements/${parsed.planet}-in-${match.replace(`${content.planet} in `, '').toLowerCase()}`}
                      className='px-3 py-1.5 rounded-lg bg-lunary-success-900/30 text-lunary-success-300 text-sm hover:bg-lunary-success-900/50 transition-colors'
                    >
                      {match}
                    </NavParamLink>
                  ))}
                </div>
              </div>
              {'difficultMatches' in curated &&
                Array.isArray(curated.difficultMatches) && (
                  <div className='p-5 rounded-lg border border-lunary-accent-700 bg-lunary-accent-950'>
                    <div className='flex items-center gap-2 mb-3'>
                      <AlertTriangle className='h-4 w-4 text-lunary-accent' />
                      <span className='font-medium text-zinc-100'>
                        Challenging Matches
                      </span>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {(curated.difficultMatches as string[]).map((match) => (
                        <NavParamLink
                          key={match}
                          href={`/grimoire/placements/${parsed.planet}-in-${match.replace(`${content.planet} in `, '').toLowerCase()}`}
                          className='px-3 py-1.5 rounded-lg bg-lunary-accent-900/30 text-lunary-accent-300 text-sm hover:bg-lunary-accent-900/50 transition-colors'
                        >
                          {match}
                        </NavParamLink>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            {curated.famousExamples && (
              <div className='mt-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900/30'>
                <div className='flex items-center gap-2 mb-2'>
                  <Users className='h-4 w-4 text-lunary-primary-400' />
                  <span className='text-sm font-medium text-zinc-300'>
                    Famous Examples
                  </span>
                </div>
                <p className='text-sm text-zinc-400'>
                  {curated.famousExamples}
                </p>
              </div>
            )}
          </section>
        )}

      {/* Famous Examples (for planets without match data) */}
      {curated && curated.famousExamples && !('bestMatches' in curated) && (
        <section className='mb-8'>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30'>
            <div className='flex items-center gap-2 mb-2'>
              <Users className='h-4 w-4 text-lunary-primary-400' />
              <span className='text-sm font-medium text-zinc-300'>
                Famous Examples
              </span>
            </div>
            <p className='text-sm text-zinc-400'>{curated.famousExamples}</p>
          </div>
        </section>
      )}

      {/* Strengths/Core Traits */}
      <section className='mb-8'>
        <Heading as='h2' variant='h3'>
          <Star className='h-5 w-5 inline mr-2 text-lunary-success' />
          {curated?.coreTraits ? 'Core Traits' : 'Strengths'}
        </Heading>
        <div className='p-5 rounded-lg border border-lunary-success-700 bg-lunary-success-950 mt-4'>
          <ul className='space-y-3'>
            {strengths.map((item, i) => (
              <li key={i} className='flex items-start gap-3 text-zinc-300'>
                <span className='text-lunary-success mt-1'>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Challenges */}
      <section className='mb-8'>
        <Heading as='h2' variant='h3'>
          <AlertTriangle className='h-5 w-5 inline mr-2 text-lunary-accent' />
          Potential Challenges
        </Heading>
        <div className='p-5 rounded-lg border border-lunary-accent-700 bg-lunary-accent-950 mt-4'>
          <ul className='space-y-3'>
            {challenges.map((item, i) => (
              <li key={i} className='flex items-start gap-3 text-zinc-300'>
                <span className='text-lunary-accent mt-1'>!</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Related Placements */}
      <section className='mb-8'>
        <Heading as='h2' variant='h3'>
          Explore Related Placements
        </Heading>
        <div className='grid md:grid-cols-2 gap-4 mt-4'>
          <div>
            <h3 className='text-sm text-zinc-400 mb-3'>
              {content.planet} in Other Signs
            </h3>
            <div className='flex flex-wrap gap-2'>
              {relatedPlacements.map((p) => (
                <NavParamLink
                  key={p.slug}
                  href={`/grimoire/placements/${p.slug}`}
                  className='px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
                >
                  {p.label}
                </NavParamLink>
              ))}
            </div>
          </div>
          <div>
            <h3 className='text-sm text-zinc-400 mb-3'>
              Other Planets in {content.sign}
            </h3>
            <div className='flex flex-wrap gap-2'>
              {samePlanetRelated.map((p) => (
                <NavParamLink
                  key={p.slug}
                  href={`/grimoire/placements/${p.slug}`}
                  className='px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
                >
                  {p.label}
                </NavParamLink>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SEOContentTemplate>
  );
}
