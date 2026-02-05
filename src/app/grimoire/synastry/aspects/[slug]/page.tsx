import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  getSynastryAspect,
  aspectTypes,
  synastryAspects,
} from '@/constants/seo/synastry-aspects';
import {
  Heart,
  TrendingUp,
  MessageCircle,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { NavParamLink } from '@/components/NavParamLink';

export const revalidate = 86400;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 1-day revalidation

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const aspect = getSynastryAspect(slug);

  if (!aspect) {
    return { title: 'Not Found' };
  }

  const title = `${aspect.planet1} ${aspect.aspect} ${aspect.planet2} Synastry: Relationship Compatibility - Lunary`;
  const description = `Discover what ${aspect.planet1} ${aspect.aspect.toLowerCase()} ${aspect.planet2} means in synastry. Learn how this aspect affects love compatibility, emotional connection, and relationship dynamics.`;

  return {
    title,
    description,
    keywords: [
      `${aspect.planet1.toLowerCase()} ${aspect.aspect.toLowerCase()} ${aspect.planet2.toLowerCase()} synastry`,
      `${aspect.planet1.toLowerCase()} ${aspect.planet2.toLowerCase()} synastry`,
      'synastry aspects',
      'relationship compatibility',
      'astrological compatibility',
      ...aspect.keywords.map((k) => k.toLowerCase()),
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://lunary.app/grimoire/synastry/aspects/${slug}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/synastry/aspects/${slug}`,
    },
  };
}

function ScoreBar({
  score,
  label,
  icon: Icon,
}: {
  score: number;
  label: string;
  icon: typeof Heart;
}) {
  const colorClass =
    score >= 8
      ? 'bg-lunary-success'
      : score >= 6
        ? 'bg-lunary-accent'
        : 'bg-lunary-rose';
  const textColor =
    score >= 8
      ? 'text-lunary-success'
      : score >= 6
        ? 'text-lunary-accent'
        : 'text-lunary-rose';

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Icon className={`h-4 w-4 ${textColor}`} />
          <span className='text-sm text-zinc-300'>{label}</span>
        </div>
        <span className={`text-sm font-medium ${textColor}`}>{score}/10</span>
      </div>
      <div className='h-2 bg-zinc-800 rounded-full overflow-hidden'>
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
}

export default async function SynastryAspectPage({ params }: PageProps) {
  const { slug } = await params;
  const aspect = getSynastryAspect(slug);

  if (!aspect) {
    notFound();
  }

  const aspectType = aspectTypes[aspect.aspectType];
  const relatedAspects = synastryAspects
    .filter((a) => a.slug !== slug)
    .slice(0, 4);

  const meaningContent = `### ${aspect.planet1} ${aspect.aspect} ${aspect.planet2} Overview

${aspect.overview}

### Energy Dynamic

${aspect.energyDynamic}

### Emotional Connection

${aspect.emotionalConnection}

### Romantic Attraction

${aspect.romanticAttraction}

### Communication Patterns

${aspect.communication}

### Growth Potential

${aspect.growthPotential}`;

  return (
    <SEOContentTemplate
      title={`${aspect.planet1} ${aspect.aspect} ${aspect.planet2} Synastry - Lunary`}
      h1={`${aspect.planet1} ${aspect.aspect} ${aspect.planet2}`}
      subtitle='Synastry Aspect'
      description={`Discover what ${aspect.planet1} ${aspect.aspect.toLowerCase()} ${aspect.planet2} means in synastry and how this aspect affects relationship compatibility, emotional connection, and romantic dynamics.`}
      keywords={[
        `${aspect.planet1.toLowerCase()} ${aspect.aspect.toLowerCase()} ${aspect.planet2.toLowerCase()} synastry`,
        'synastry aspects',
        'relationship compatibility',
        ...aspect.keywords.map((k) => k.toLowerCase()),
      ]}
      canonicalUrl={`https://lunary.app/grimoire/synastry/aspects/${slug}`}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Synastry', href: '/grimoire/synastry' },
        { label: 'Aspects', href: '/grimoire/synastry/aspects' },
        { label: `${aspect.planet1} ${aspect.aspect} ${aspect.planet2}` },
      ]}
      whatIs={{
        question: `What does ${aspect.planet1} ${aspect.aspect.toLowerCase()} ${aspect.planet2} mean in synastry?`,
        answer: aspect.overview,
      }}
      intro={`${aspect.planet1} ${aspect.aspect.toLowerCase()} ${aspect.planet2} in synastry creates ${aspectType.nature === 'harmonious' ? 'a harmonious, flowing connection' : aspectType.nature === 'challenging' ? 'dynamic tension and growth potential' : 'an intense, focused bond'} between two people. This aspect reveals important dynamics about ${aspect.planet1.toLowerCase() === 'venus' || aspect.planet2.toLowerCase() === 'venus' ? 'romantic attraction and values' : aspect.planet1.toLowerCase() === 'moon' || aspect.planet2.toLowerCase() === 'moon' ? 'emotional compatibility and nurturing' : 'how these planetary energies interact in relationship'}.`}
      tldr={`${aspect.planet1} ${aspect.aspect} ${aspect.planet2} has an overall compatibility score of ${aspect.scores.overall}/10. ${aspect.keywords.slice(0, 2).join(' and ')} define this aspect.`}
      meaning={meaningContent}
      howToWorkWith={aspect.practicalAdvice}
      faqs={aspect.faq}
      internalLinks={[
        { text: 'Synastry Overview', href: '/grimoire/synastry' },
        { text: 'All Synastry Aspects', href: '/grimoire/synastry/aspects' },
        {
          text: 'Generate Synastry Chart',
          href: '/grimoire/synastry/generate',
        },
        { text: 'Zodiac Compatibility', href: '/grimoire/compatibility' },
      ]}
      ctaText='Generate Your Synastry Chart'
      ctaHref='/grimoire/synastry/generate'
    >
      {/* Compatibility Scores */}
      <section className='mb-8'>
        <div className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
          <div className='flex items-center gap-3 mb-6'>
            <span className='text-3xl font-astro text-lunary-primary-400'>
              {aspectType.symbol}
            </span>
            <div>
              <div className='font-medium text-zinc-100 capitalize'>
                {aspect.aspectType}
              </div>
              <div className='text-sm text-zinc-500'>
                {aspectType.degrees}° • {aspectType.nature}
              </div>
            </div>
          </div>
          <div className='grid md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <ScoreBar
                score={aspect.scores.overall}
                label='Overall Compatibility'
                icon={Star}
              />
              <ScoreBar
                score={aspect.scores.love}
                label='Love & Romance'
                icon={Heart}
              />
            </div>
            <div className='space-y-4'>
              <ScoreBar
                score={aspect.scores.emotional}
                label='Emotional Connection'
                icon={TrendingUp}
              />
              <ScoreBar
                score={aspect.scores.communication}
                label='Communication'
                icon={MessageCircle}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Keywords */}
      <section className='mb-8'>
        <Heading as='h2' variant='h3'>
          Key Themes
        </Heading>
        <div className='flex flex-wrap gap-2 mt-4'>
          {aspect.keywords.map((keyword) => (
            <span
              key={keyword}
              className='px-3 py-1.5 rounded-lg bg-lunary-primary-900/20 border border-lunary-primary-700 text-lunary-primary-300 text-sm'
            >
              {keyword}
            </span>
          ))}
        </div>
      </section>

      {/* Strengths */}
      <section className='mb-8'>
        <Heading as='h2' variant='h3'>
          <Star className='h-5 w-5 inline mr-2 text-lunary-success' />
          Relationship Strengths
        </Heading>
        <div className='p-5 rounded-lg border border-lunary-success-700 bg-lunary-success-950 mt-4'>
          <ul className='space-y-3'>
            {aspect.strengths.map((strength, i) => (
              <li key={i} className='flex items-start gap-3 text-zinc-300'>
                <span className='text-lunary-success mt-1'>✓</span>
                {strength}
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
            {aspect.challenges.map((challenge, i) => (
              <li key={i} className='flex items-start gap-3 text-zinc-300'>
                <span className='text-lunary-accent mt-1'>!</span>
                {challenge}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Related Aspects */}
      <section className='mb-8'>
        <Heading as='h2' variant='h3'>
          Explore More Synastry Aspects
        </Heading>
        <div className='grid md:grid-cols-2 gap-3 mt-4'>
          {relatedAspects.map((related) => (
            <NavParamLink
              key={related.slug}
              href={`/grimoire/synastry/aspects/${related.slug}`}
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
            >
              <div className='flex items-center gap-2'>
                <span className='font-astro text-lunary-primary-400'>
                  {aspectTypes[related.aspectType].symbol}
                </span>
                <span className='text-zinc-200'>
                  {related.planet1} {related.aspect} {related.planet2}
                </span>
              </div>
              <div className='text-xs text-zinc-500 mt-1'>
                {related.scores.overall}/10 compatibility
              </div>
            </NavParamLink>
          ))}
        </div>
      </section>
    </SEOContentTemplate>
  );
}
