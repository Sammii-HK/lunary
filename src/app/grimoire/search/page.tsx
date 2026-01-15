import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import {
  searchGrimoireIndex,
  GRIMOIRE_SEARCH_INDEX,
  type GrimoireEntry,
} from '@/constants/seo/grimoire-search-index';
import { AskTheGrimoire } from '@/components/grimoire/AskTheGrimoire';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
export const metadata: Metadata = {
  title: 'Search the Grimoire | Lunary',
  description:
    'Search our cosmic knowledge base for astrology, tarot, crystals, and rituals. Find in-depth guides on zodiac signs, planets, birth charts, and more.',
  openGraph: {
    title: 'Ask the Grimoire | Lunary',
    description:
      'Search our cosmic knowledge base for astrology, tarot, crystals, and rituals.',
    images: ['/icons/og-grimoire.png'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/search',
  },
};

const CATEGORY_ICONS: Record<GrimoireEntry['category'], string> = {
  zodiac: '♈',
  planet: '🪐',
  tarot: '🎴',
  crystal: '💎',
  ritual: '🌙',
  concept: '✨',
  horoscope: '🔮',
  'chinese-zodiac': '🐉',
  season: '☀️',
  numerology: '🔢',
  birthday: '🎂',
  compatibility: '💕',
  glossary: '📖',
  archetype: '🔮',
};

const CATEGORY_COLORS: Record<GrimoireEntry['category'], string> = {
  zodiac:
    'bg-lunary-primary-900/20 text-lunary-primary-300 border-lunary-primary-700',
  planet:
    'bg-lunary-accent-900 text-lunary-accent-300 border-lunary-accent-700',
  tarot: 'bg-lunary-rose-900 text-lunary-rose-300 border-lunary-rose-700',
  crystal:
    'bg-lunary-secondary-900 text-lunary-secondary-300 border-lunary-secondary-700',
  ritual:
    'bg-lunary-primary-900 text-lunary-primary-300 border-lunary-primary-700',
  concept:
    'bg-lunary-success-900 text-lunary-success-300 border-lunary-success-700',
  horoscope:
    'bg-lunary-highlight-900 text-lunary-highlight-300 border-lunary-highlight-700',
  'chinese-zodiac':
    'bg-lunary-error-900 text-lunary-error-300 border-lunary-error-700',
  season: 'bg-lunary-rose-900 text-lunary-rose-300 border-lunary-rose-700',
  numerology:
    'bg-lunary-secondary-900 text-lunary-secondary-300 border-lunary-secondary-700',
  birthday: 'bg-lunary-rose-900 text-lunary-rose-300 border-lunary-rose-700',
  compatibility:
    'bg-lunary-highlight-900 text-lunary-highlight-300 border-lunary-highlight-700',
  glossary:
    'bg-lunary-secondary-900 text-lunary-secondary-300 border-lunary-secondary-700',
  archetype: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

interface SearchResultCardProps {
  entry: GrimoireEntry;
}

function SearchResultCard({ entry }: SearchResultCardProps) {
  return (
    <Link
      href={`/grimoire/${entry.slug}`}
      className={`
        block p-5 rounded-2xl border
        bg-black/30 backdrop-blur-sm
        hover:bg-lunary-primary-900/10 hover:border-lunary-primary-600
        transition-all duration-300 group
        ${CATEGORY_COLORS[entry.category].split(' ')[2]}
      `}
    >
      <div className='flex items-start gap-4'>
        <span
          className={`
            flex items-center justify-center 
            w-12 h-12 rounded-xl text-xl
            ${CATEGORY_COLORS[entry.category]}
          `}
        >
          {CATEGORY_ICONS[entry.category]}
        </span>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-3 mb-2'>
            <h3 className='text-lg font-medium text-white group-hover:text-lunary-primary-200 transition-colors'>
              {entry.title}
            </h3>
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full capitalize
                ${CATEGORY_COLORS[entry.category]}
              `}
            >
              {entry.category}
            </span>
          </div>

          <p className='text-sm text-lunary-primary-300/70 mb-3'>
            {entry.summary}
          </p>

          <div className='flex flex-wrap gap-2'>
            {entry.keywords.slice(0, 5).map((keyword) => (
              <span
                key={keyword}
                className='text-xs px-2 py-1 rounded-lg bg-white/5 text-lunary-primary-300/50'
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <ArrowRight className='h-5 w-5 text-lunary-primary-400/30 group-hover:text-lunary-primary-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
}

function SearchContent({ query }: { query: string }) {
  const results = query
    ? searchGrimoireIndex(query, 20)
    : GRIMOIRE_SEARCH_INDEX.slice(0, 12);

  const isDefaultView = !query;

  return (
    <div className='space-y-6'>
      {/* Results Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 text-lunary-primary-300/70'>
          <Sparkles className='h-4 w-4' />
          <span>
            {isDefaultView
              ? `Explore ${GRIMOIRE_SEARCH_INDEX.length} cosmic entries`
              : `Found ${results.length} ${results.length === 1 ? 'result' : 'results'} for "${query}"`}
          </span>
        </div>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className='grid gap-4'>
          {results.map((entry) => (
            <SearchResultCard key={entry.slug} entry={entry} />
          ))}
        </div>
      ) : (
        <div className='text-center py-16'>
          <Sparkles className='h-12 w-12 text-lunary-primary-400/30 mx-auto mb-4' />
          <h3 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            No cosmic insights found
          </h3>
          <p className='text-lunary-primary-300/60 max-w-md mx-auto'>
            Try searching for a zodiac sign, planet, tarot card, crystal, or
            astrological concept.
          </p>
        </div>
      )}

      {/* Browse by Category */}
      {isDefaultView && (
        <div className='mt-12 pt-8 border-t border-lunary-primary-700'>
          <h2 className='text-xl font-medium text-white mb-6'>
            Browse by Category
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {(
              [
                'zodiac',
                'planet',
                'tarot',
                'crystal',
                'ritual',
                'concept',
              ] as const
            ).map((category) => {
              const count = GRIMOIRE_SEARCH_INDEX.filter(
                (e) => e.category === category,
              ).length;
              return (
                <Link
                  key={category}
                  href={`/grimoire/${category === 'planet' ? 'astronomy' : category === 'concept' ? '' : category}${category === 'concept' ? '' : ''}`}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border
                    hover:bg-white/5 transition-colors
                    ${CATEGORY_COLORS[category].split(' ')[2]}
                  `}
                >
                  <span className='text-2xl'>{CATEGORY_ICONS[category]}</span>
                  <div>
                    <span className='text-white capitalize font-medium'>
                      {category}
                    </span>
                    <span className='text-lunary-primary-300/50 text-sm block'>
                      {count} {count === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function GrimoireSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  const tableOfContents = [
    { label: 'Search the Grimoire', href: '#grimoire-search-form' },
    { label: 'Results', href: '#grimoire-search-results' },
  ];

  const heroContent = (
    <div className='flex items-center gap-3 justify-center'>
      <BookOpen className='h-8 w-8 text-lunary-primary-400' />
      <p className='text-lg font-light text-zinc-100 max-w-3xl'>
        Search our cosmic knowledge base for astrology, tarot, crystals,
        rituals, and spiritual wisdom. Find the answers you seek across every
        Grimoire category.
      </p>
    </div>
  );

  const sections = (
    <>
      <section
        id='grimoire-search-form'
        className='border-b border-zinc-800 pb-8 mb-8'
      >
        <AskTheGrimoire
          variant='hero'
          placeholder='What cosmic wisdom do you seek?'
        />
      </section>

      <section id='grimoire-search-results' className='space-y-6 mb-12'>
        <Suspense
          fallback={
            <div className='flex items-center justify-center py-16'>
              <div className='animate-spin h-8 w-8 border-2 border-lunary-primary border-t-transparent rounded-full' />
            </div>
          }
        >
          <SearchContent query={query} />
        </Suspense>
      </section>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Lunary Grimoire',
            url: 'https://lunary.app/grimoire',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate:
                  'https://lunary.app/grimoire/search?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </>
  );

  return (
    <SEOContentTemplate
      title={metadata.title as string}
      h1='Ask the Grimoire'
      description={metadata.description as string}
      keywords={['grimoire search', 'cosmic search', 'lunar knowledge base']}
      canonicalUrl={
        (metadata.alternates?.canonical as string) ??
        'https://lunary.app/grimoire/search'
      }
      tableOfContents={tableOfContents}
      intro='Search our cosmic knowledge base for astrology, tarot, crystals, rituals, and celestial practice.'
      tldr='Use the search to find specific meanings, then explore related pages for deeper context.'
      meaning={`The Grimoire search helps you move quickly from a question to a focused answer. Start with a clear keyword, then follow the suggested links to expand your understanding.

If you are not sure what to look for, browse by category or try a general theme like "love," "career," or "healing." The best results come from simple, specific queries.

When you find a result that resonates, open related pages to see the wider pattern. Grimoire topics are designed to connect, so a single search can become a small study path.`}
      howToWorkWith={[
        'Start with one clear keyword.',
        'Open a result and follow the related links.',
        'Use categories to narrow your focus.',
      ]}
      rituals={[
        'Write one question before you search.',
        'Open two results and compare their themes.',
        'Save a short note about what stood out.',
      ]}
      tables={[
        {
          title: 'Search Tips',
          headers: ['If you want', 'Try searching'],
          rows: [
            ['Meaning of a symbol', 'Name of the card, rune, or sign'],
            ['Timing guidance', 'Moon phase or planetary day'],
            ['Practice ideas', 'Ritual, spell, or meditation'],
          ],
        },
      ]}
      journalPrompts={[
        'What question do I want answered today?',
        'Which topic keeps showing up for me?',
        'What is one page I want to explore deeper this week?',
      ]}
      internalLinks={[
        { text: 'Grimoire Home', href: '/grimoire' },
        { text: 'Zodiac', href: '/grimoire/zodiac' },
        { text: 'Tarot', href: '/grimoire/tarot' },
        { text: 'Numerology', href: '/grimoire/numerology' },
      ]}
      heroContent={heroContent}
    >
      {sections}
    </SEOContentTemplate>
  );
}
