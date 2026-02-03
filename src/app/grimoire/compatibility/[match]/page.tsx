import { notFound } from 'next/navigation';
import { Heart, Users, Briefcase, Star, AlertTriangle } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { NavParamLink } from '@/components/NavParamLink';
import { Heading } from '@/components/ui/Heading';
import { signDescriptions } from '@/constants/seo/planet-sign-content';
import { generateCompatibilityContent } from '@/constants/seo/compatibility-content';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';

// 30-day ISR revalidation
export const revalidate = 2592000;

const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

interface PageProps {
  params: Promise<{ match: string }>;
}

function parseMatch(slug: string): { sign1: string; sign2: string } | null {
  const match = slug.match(/^([a-z]+)-and-([a-z]+)$/);
  if (!match) return null;

  const [, sign1, sign2] = match;
  if (!signDescriptions[sign1] || !signDescriptions[sign2]) {
    return null;
  }
  return { sign1, sign2 };
}

export async function generateMetadata({ params }: PageProps) {
  const { match } = await params;
  const parsed = parseMatch(match);

  if (!parsed) {
    return { title: 'Not Found' };
  }

  const content = generateCompatibilityContent(parsed.sign1, parsed.sign2);

  const metadata = createGrimoireMetadata({
    title: `${content.title} - Lunary`,
    description: content.description,
    keywords: content.keywords,
    url: `https://lunary.app/grimoire/compatibility/${content.slug}`,
    ogImagePath: '/api/og/grimoire/compatibility',
    ogImageAlt: content.title,
  });

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: `https://lunary.app/grimoire/compatibility/${match}`,
    },
  };
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className='space-y-1'>
      {label && (
        <div className='flex justify-between text-sm'>
          <span className='text-zinc-400'>{label}</span>
          <span className='text-zinc-300'>{score}/10</span>
        </div>
      )}
      <div className='h-2 bg-zinc-800 rounded-full overflow-hidden'>
        <div
          className={`h-full rounded-full ${
            score >= 8
              ? 'bg-lunary-success'
              : score >= 6
                ? 'bg-lunary-accent'
                : 'bg-lunary-error'
          }`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
}

export default async function CompatibilityPage({ params }: PageProps) {
  const { match } = await params;
  const parsed = parseMatch(match);

  if (!parsed) {
    notFound();
  }

  const content = generateCompatibilityContent(parsed.sign1, parsed.sign2);
  const sign1Info = signDescriptions[parsed.sign1];
  const sign2Info = signDescriptions[parsed.sign2];

  // Get other compatibility matches for sign1
  const sign1Matches = Object.keys(signDescriptions)
    .filter((s) => s !== parsed.sign1 && s !== parsed.sign2)
    .slice(0, 4);

  const faqs = [
    {
      question: `What is ${content.sign1} and ${content.sign2} compatibility?`,
      answer: `${content.sign1} and ${content.sign2} have a ${content.overallScore}/10 compatibility score. ${content.description.slice(0, 100)}...`,
    },
    {
      question: `How compatible are ${content.sign1} and ${content.sign2} in love?`,
      answer: `${content.sign1} and ${content.sign2} have a ${content.loveScore}/10 love compatibility. ${content.strengths.slice(0, 1).join(' ')}`,
    },
    {
      question: `Are ${content.sign1} and ${content.sign2} good friends?`,
      answer: `${content.sign1} and ${content.sign2} have a ${content.friendshipScore}/10 friendship compatibility.`,
    },
    {
      question: `Can ${content.sign1} and ${content.sign2} work well together?`,
      answer: `${content.sign1} and ${content.sign2} have a ${content.workScore}/10 work compatibility.`,
    },
    {
      question: `What are the main challenges for ${content.sign1} and ${content.sign2}?`,
      answer: `The main challenges include ${content.challenges.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
  ];

  const tldr = content.summary
    ? `${content.summary} Overall compatibility: ${content.overallScore}/10.`
    : `${content.sign1} and ${content.sign2} have ${content.overallScore}/10 overall compatibility. Love: ${content.loveScore}/10. Friendship: ${content.friendshipScore}/10. Work: ${content.workScore}/10.`;

  return (
    <SEOContentTemplate
      title={`${content.title} - Lunary`}
      h1={`${content.sign1} and ${content.sign2} Compatibility`}
      subtitle={`${sign1Info.element} × ${sign2Info.element}`}
      description={content.description}
      keywords={content.keywords}
      canonicalUrl={`https://lunary.app/grimoire/compatibility/${content.slug}`}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Compatibility', href: '/grimoire/compatibility' },
        { label: `${content.sign1} & ${content.sign2}` },
      ]}
      whatIs={{
        question: `Are ${content.sign1} and ${content.sign2} compatible?`,
        answer: content.description,
      }}
      tldr={tldr}
      faqs={faqs}
      internalLinks={[
        { text: 'All Compatibility', href: '/grimoire/compatibility' },
        {
          text: `${content.sign1} Sign`,
          href: `/grimoire/zodiac/${parsed.sign1}`,
        },
        {
          text: `${content.sign2} Sign`,
          href: `/grimoire/zodiac/${parsed.sign2}`,
        },
        { text: 'Synastry Calculator', href: '/grimoire/synastry/generate' },
      ]}
      ctaText='Generate Your Synastry Chart'
      ctaHref='/grimoire/synastry/generate'
    >
      {/* Zodiac Symbol Header */}
      <section className='mb-8'>
        <div className='flex items-center justify-center gap-6 mb-6'>
          <NavParamLink
            href={`/grimoire/zodiac/${parsed.sign1}`}
            className='text-center hover:scale-105 transition-transform'
          >
            <div className='text-5xl mb-2'>
              {ZODIAC_SYMBOLS[parsed.sign1] || '⭐'}
            </div>
            <div className='text-xl font-medium text-zinc-100'>
              {content.sign1}
            </div>
            <div className='text-sm text-zinc-400'>{sign1Info.element}</div>
          </NavParamLink>
          <Heart className='h-8 w-8 text-lunary-rose' />
          <NavParamLink
            href={`/grimoire/zodiac/${parsed.sign2}`}
            className='text-center hover:scale-105 transition-transform'
          >
            <div className='text-5xl mb-2'>
              {ZODIAC_SYMBOLS[parsed.sign2] || '⭐'}
            </div>
            <div className='text-xl font-medium text-zinc-100'>
              {content.sign2}
            </div>
            <div className='text-sm text-zinc-400'>{sign2Info.element}</div>
          </NavParamLink>
        </div>
      </section>

      {/* Compatibility Scores */}
      <section className='mb-8 p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
        <Heading as='h2' variant='h3' className='text-center mb-6'>
          Compatibility Scores
        </Heading>
        <div className='grid md:grid-cols-4 gap-6'>
          <div className='text-center'>
            <div
              className={`text-4xl font-light mb-1 ${
                content.overallScore >= 8
                  ? 'text-lunary-success'
                  : content.overallScore >= 6
                    ? 'text-lunary-accent'
                    : 'text-lunary-error'
              }`}
            >
              {content.overallScore}/10
            </div>
            <div className='text-sm text-zinc-400'>Overall</div>
          </div>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-lunary-rose'>
              <Heart className='h-4 w-4' />
              <span className='text-sm'>Love</span>
              <span className='ml-auto text-zinc-300 text-sm'>
                {content.loveScore}/10
              </span>
            </div>
            <ScoreBar score={content.loveScore} label='' />
          </div>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-lunary-secondary'>
              <Users className='h-4 w-4' />
              <span className='text-sm'>Friendship</span>
              <span className='ml-auto text-zinc-300 text-sm'>
                {content.friendshipScore}/10
              </span>
            </div>
            <ScoreBar score={content.friendshipScore} label='' />
          </div>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-lunary-accent'>
              <Briefcase className='h-4 w-4' />
              <span className='text-sm'>Work</span>
              <span className='ml-auto text-zinc-300 text-sm'>
                {content.workScore}/10
              </span>
            </div>
            <ScoreBar score={content.workScore} label='' />
          </div>
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
      <section className='mb-8'>
        <Heading as='h2' variant='h3'>
          <AlertTriangle className='h-5 w-5 inline mr-2 text-lunary-accent' />
          Potential Challenges
        </Heading>
        <div className='p-5 rounded-lg border border-lunary-accent-700 bg-lunary-accent-950 mt-4'>
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
      <section className='mb-8'>
        <Heading as='h2' variant='h3'>
          Advice for This Pairing
        </Heading>
        <div className='p-5 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 mt-4'>
          <p className='text-zinc-300 leading-relaxed'>{content.advice}</p>
        </div>
      </section>

      {/* Related Matches */}
      <section className='mb-8'>
        <Heading as='h2' variant='h3'>
          Explore More {content.sign1} Compatibility
        </Heading>
        <div className='flex flex-wrap gap-3 mt-4'>
          {sign1Matches.map((signKey) => {
            const sign = signDescriptions[signKey];
            const slug =
              parsed.sign1 <= signKey
                ? `${parsed.sign1}-and-${signKey}`
                : `${signKey}-and-${parsed.sign1}`;
            return (
              <NavParamLink
                key={signKey}
                href={`/grimoire/compatibility/${slug}`}
                className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-lunary-primary-300 text-sm transition-colors'
              >
                {content.sign1} & {sign.name}
              </NavParamLink>
            );
          })}
        </div>
      </section>
    </SEOContentTemplate>
  );
}
