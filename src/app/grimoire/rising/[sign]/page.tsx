import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { NavParamLink } from '@/components/NavParamLink';
import { Heading } from '@/components/ui/Heading';
import { Eye, Star, AlertTriangle, Users } from 'lucide-react';
import {
  getRisingSign,
  getAllRisingSignSlugs,
  getAllRisingSigns,
} from '@/lib/rising-signs/getRisingSign';

export const revalidate = 2592000; // 30 days

interface PageProps {
  params: Promise<{ sign: string }>;
}

export async function generateStaticParams() {
  return getAllRisingSignSlugs().map((slug) => ({ sign: slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { sign } = await params;
  const rising = getRisingSign(sign);

  if (!rising) {
    return { title: 'Not Found' };
  }

  return {
    title: `${rising.seoTitle} - Lunary`,
    description: rising.seoDescription,
    keywords: [
      `${rising.sign.toLowerCase()} rising`,
      `${rising.sign.toLowerCase()} ascendant`,
      `${rising.sign.toLowerCase()} rising sign`,
      `${rising.sign.toLowerCase()} rising appearance`,
      `${rising.sign.toLowerCase()} rising first impression`,
      'ascendant meaning',
      'rising sign meaning',
    ],
    openGraph: {
      title: `${rising.seoTitle} - Lunary`,
      description: rising.seoDescription,
      type: 'article',
      url: `https://lunary.app/grimoire/rising/${sign}`,
    },
    twitter: {
      card: 'summary',
      title: rising.seoTitle,
      description: rising.seoDescription,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/rising/${sign}`,
    },
  };
}

export default async function RisingSignPage({ params }: PageProps) {
  const { sign } = await params;
  const rising = getRisingSign(sign);

  if (!rising) {
    notFound();
  }

  const allRisings = getAllRisingSigns();
  const relatedRisings = allRisings.filter((r) => r.slug !== sign).slice(0, 4);

  const meaningContent = `### First Impressions

${rising.firstImpression}

### Physical Appearance & Style

${rising.physicalAppearance}

### Life Approach

${rising.lifeApproach}

### How Others See You

${rising.howOthersSeeYou}

### Compatibility with Other Rising Signs

${rising.compatibility}`;

  const faqs = [
    {
      question: `What does ${rising.sign} Rising mean?`,
      answer: rising.firstImpression,
    },
    {
      question: `What does ${rising.sign} Rising look like?`,
      answer: rising.physicalAppearance,
    },
    {
      question: `How do others perceive ${rising.sign} Rising?`,
      answer: rising.howOthersSeeYou,
    },
    {
      question: `What are ${rising.sign} Rising strengths?`,
      answer: rising.strengths.slice(0, 3).join('. ') + '.',
    },
  ];

  return (
    <SEOContentTemplate
      title={`${rising.sign} Rising - Lunary`}
      h1={`${rising.sign} Rising`}
      subtitle={`${rising.element} Ascendant • Ruled by ${rising.ruler}`}
      description={rising.seoDescription}
      keywords={[
        `${rising.sign.toLowerCase()} rising`,
        `${rising.sign.toLowerCase()} ascendant`,
        'rising sign',
        'ascendant',
        'first impression',
      ]}
      canonicalUrl={`https://lunary.app/grimoire/rising/${sign}`}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Rising Signs', href: '/grimoire/rising' },
        { label: `${rising.sign} Rising` },
      ]}
      whatIs={{
        question: `What is ${rising.sign} Rising?`,
        answer: `${rising.sign} Rising (or ${rising.sign} Ascendant) describes how you present yourself to the world, your first impressions, and your outward personality. ${rising.firstImpression}`,
      }}
      intro={`${rising.sign} Rising gives you a ${rising.element.toLowerCase()} sign ascendant, bringing ${rising.coreTraits[0].toLowerCase()} to your outer personality. Your rising sign shapes first impressions and how the world perceives you.`}
      tldr={`${rising.sign} Rising: ${rising.coreTraits.slice(0, 3).join(', ')}. Ruled by ${rising.ruler}.`}
      meaning={meaningContent}
      howToWorkWith={[
        `Embrace your ${rising.sign} Rising by leaning into your natural ${rising.coreTraits[0].toLowerCase()}.`,
        `Be aware of how your ${rising.element.toLowerCase()} energy affects first impressions.`,
        `Use your rising sign strengths consciously in new situations.`,
      ]}
      faqs={faqs}
      internalLinks={[
        { text: 'All Rising Signs', href: '/grimoire/rising' },
        {
          text: `${rising.sign} Sun Sign`,
          href: `/grimoire/zodiac/${rising.sign.toLowerCase()}`,
        },
        {
          text: 'Birth Chart Guide',
          href: '/grimoire/guides/birth-chart-complete-guide',
        },
        { text: 'Calculate Your Chart', href: '/birth-chart' },
      ]}
      ctaText='Discover Your Rising Sign'
      ctaHref='/birth-chart'
    >
      {/* Quick Stats */}
      <section className='mb-8'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-2xl mb-1'>
              {rising.element === 'Fire'
                ? '🔥'
                : rising.element === 'Earth'
                  ? '🌍'
                  : rising.element === 'Air'
                    ? '💨'
                    : '💧'}
            </div>
            <div className='text-xs text-zinc-400'>Element</div>
            <div className='text-sm text-zinc-300'>{rising.element}</div>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-2xl mb-1'>⚡</div>
            <div className='text-xs text-zinc-400'>Modality</div>
            <div className='text-sm text-zinc-300'>{rising.modality}</div>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-2xl mb-1'>🌟</div>
            <div className='text-xs text-zinc-400'>Ruler</div>
            <div className='text-sm text-zinc-300'>{rising.ruler}</div>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-2xl mb-1'>👁️</div>
            <div className='text-xs text-zinc-400'>Governs</div>
            <div className='text-sm text-zinc-300'>First Impressions</div>
          </div>
        </div>
      </section>

      {/* Core Traits */}
      <section className='mb-8'>
        <Heading as='h2' variant='h3'>
          <Eye className='h-5 w-5 inline mr-2 text-lunary-primary-400' />
          Core Rising Sign Traits
        </Heading>
        <div className='flex flex-wrap gap-2 mt-4'>
          {rising.coreTraits.map((trait) => (
            <span
              key={trait}
              className='px-3 py-1.5 rounded-lg bg-lunary-primary-900/20 border border-lunary-primary-700 text-lunary-primary-300 text-sm'
            >
              {trait}
            </span>
          ))}
        </div>
      </section>

      {/* Strengths */}
      <section className='mb-8'>
        <Heading as='h2' variant='h3'>
          <Star className='h-5 w-5 inline mr-2 text-lunary-success' />
          Rising Sign Strengths
        </Heading>
        <div className='p-5 rounded-lg border border-lunary-success-700 bg-lunary-success-950 mt-4'>
          <ul className='space-y-3'>
            {rising.strengths.map((strength, i) => (
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
            {rising.challenges.map((challenge, i) => (
              <li key={i} className='flex items-start gap-3 text-zinc-300'>
                <span className='text-lunary-accent mt-1'>!</span>
                {challenge}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Famous Examples */}
      {rising.famousExamples && (
        <section className='mb-8'>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30'>
            <div className='flex items-center gap-2 mb-2'>
              <Users className='h-4 w-4 text-lunary-primary-400' />
              <span className='text-sm font-medium text-zinc-300'>
                Famous {rising.sign} Risings
              </span>
            </div>
            <p className='text-sm text-zinc-400'>{rising.famousExamples}</p>
          </div>
        </section>
      )}

      {/* Related Rising Signs */}
      <section className='mb-8'>
        <Heading as='h2' variant='h3'>
          Explore Other Rising Signs
        </Heading>
        <div className='grid md:grid-cols-2 gap-3 mt-4'>
          {relatedRisings.map((related) => (
            <NavParamLink
              key={related.slug}
              href={`/grimoire/rising/${related.slug}`}
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
            >
              <div className='flex items-center justify-between'>
                <span className='text-zinc-200'>{related.sign} Rising</span>
                <span className='text-xs text-zinc-500'>{related.element}</span>
              </div>
              <div className='text-xs text-zinc-500 mt-1'>
                {related.coreTraits[0]}
              </div>
            </NavParamLink>
          ))}
        </div>
      </section>
    </SEOContentTemplate>
  );
}
