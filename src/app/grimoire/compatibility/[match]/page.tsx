import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { ArrowRight, Heart, Users, Briefcase, Star } from 'lucide-react';
import { signDescriptions } from '@/constants/seo/planet-sign-content';
import {
  generateCompatibilityContent,
  getAllCompatibilitySlugs,
} from '@/constants/seo/compatibility-content';
import {
  createArticleSchema,
  renderJsonLd,
  createBreadcrumbSchema,
} from '@/lib/schema';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';

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

export async function generateStaticParams() {
  const slugs = getAllCompatibilitySlugs();
  return slugs.map((match) => ({ match }));
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

  return createGrimoireMetadata({
    title: `${content.title} - Lunary`,
    description: content.description,
    keywords: content.keywords,
    url: `https://lunary.app/grimoire/compatibility/${content.slug}`,
    ogImagePath: '/api/og/grimoire/compatibility',
    ogImageAlt: content.title,
  });
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className='space-y-1'>
      <div className='flex justify-between text-sm'>
        <span className='text-zinc-400'>{label}</span>
        <span className='text-zinc-300'>{score}/10</span>
      </div>
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
        <ExploreGrimoire />
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

  const articleSchema = createArticleSchema({
    headline: content.title,
    description: content.description,
    keywords: content.keywords,
    url: `https://lunary.app/grimoire/compatibility/${content.slug}`,
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
  });

  // Get other compatibility matches for sign1
  const sign1Matches = Object.keys(signDescriptions)
    .filter((s) => s !== parsed.sign1 && s !== parsed.sign2)
    .slice(0, 4);

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Compatibility', url: '/grimoire/compatibility' },
        ]),
      )}

      <div className='max-w-4xl mx-auto px-4 py-12'>
        {/* Breadcrumbs */}
        <nav className='flex items-center gap-2 text-sm text-zinc-400 mb-8'>
          <Link href='/grimoire' className='hover:text-zinc-300'>
            Grimoire
          </Link>
          <span>/</span>
          <Link href='/grimoire/compatibility' className='hover:text-zinc-300'>
            Compatibility
          </Link>
          <span>/</span>
          <span className='text-zinc-400'>
            {content.sign1} & {content.sign2}
          </span>
        </nav>

        {/* Header */}
        <header className='mb-12 text-center'>
          <div className='flex items-center justify-center gap-6 mb-6'>
            <div className='text-center'>
              <div className='text-5xl mb-2'>
                {ZODIAC_SYMBOLS[parsed.sign1] || '⭐'}
              </div>
              <div className='text-xl font-medium text-zinc-100'>
                {content.sign1}
              </div>
              <div className='text-sm text-zinc-400'>{sign1Info.element}</div>
            </div>
            <Heart className='h-8 w-8 text-lunary-rose' />
            <div className='text-center'>
              <div className='text-5xl mb-2'>
                {ZODIAC_SYMBOLS[parsed.sign2] || '⭐'}
              </div>
              <div className='text-xl font-medium text-zinc-100'>
                {content.sign2}
              </div>
              <div className='text-sm text-zinc-400'>{sign2Info.element}</div>
            </div>
          </div>
          <h1 className='text-3xl font-light text-zinc-100 mb-4'>
            {content.sign1} and {content.sign2} Compatibility
          </h1>
          <p className='text-zinc-400 max-w-xl mx-auto'>
            {content.description}
          </p>
        </header>

        {/* Scores */}
        <section className='mb-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
          <h2 className='text-xl font-medium text-zinc-100 mb-6 text-center'>
            Compatibility Scores
          </h2>
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
            <div className='space-y-4'>
              <div className='flex items-center gap-2 text-lunary-rose'>
                <Heart className='h-4 w-4' />
                <span className='text-sm'>Love</span>
              </div>
              <ScoreBar score={content.loveScore} label='' />
            </div>
            <div className='space-y-4'>
              <div className='flex items-center gap-2 text-lunary-secondary'>
                <Users className='h-4 w-4' />
                <span className='text-sm'>Friendship</span>
              </div>
              <ScoreBar score={content.friendshipScore} label='' />
            </div>
            <div className='space-y-4'>
              <div className='flex items-center gap-2 text-lunary-accent'>
                <Briefcase className='h-4 w-4' />
                <span className='text-sm'>Work</span>
              </div>
              <ScoreBar score={content.workScore} label='' />
            </div>
          </div>
        </section>

        {/* Strengths */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4 flex items-center gap-2'>
            <Star className='h-6 w-6 text-lunary-success' />
            Relationship Strengths
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
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
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
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            Advice for This Pairing
          </h2>
          <div className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
            <p className='text-zinc-300 leading-relaxed'>{content.advice}</p>
          </div>
        </section>

        {/* Related Matches */}
        <section className='mb-12 pt-8 border-t border-zinc-800'>
          <h2 className='text-xl font-medium text-zinc-100 mb-6'>
            Explore More {content.sign1} Compatibility
          </h2>
          <div className='flex flex-wrap gap-3'>
            {sign1Matches.map((signKey) => {
              const sign = signDescriptions[signKey];
              const slug =
                parsed.sign1 <= signKey
                  ? `${parsed.sign1}-and-${signKey}`
                  : `${signKey}-and-${parsed.sign1}`;
              return (
                <Link
                  key={signKey}
                  href={`/grimoire/compatibility/${slug}`}
                  className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-lunary-primary-300 text-sm transition-colors'
                >
                  {content.sign1} & {sign.name}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Synastry CTA */}
        <section>
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
                  Go beyond Sun signs! Compare complete birth charts for deeper
                  compatibility insights
                </p>
              </div>
              <span className='text-lunary-rose-400 group-hover:text-lunary-rose-300 transition-colors text-2xl'>
                →
              </span>
            </div>
          </Link>
        </section>

        {/* Birth Chart CTA */}
        <section className='text-center'>
          <div className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'>
            <p className='text-zinc-400 mb-4'>
              Sun signs are just the beginning. View your complete birth chart.
            </p>
            <Link
              href='/birth-chart'
              className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors'
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
        </footer>
      </div>
    </div>
  );
}
