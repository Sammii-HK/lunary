import { sql } from '@vercel/postgres';
import { Metadata } from 'next';
import Link from 'next/link';
import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  createArticleSchema,
  createFAQPageSchema,
  renderJsonLdMulti,
} from '@/lib/schema';

export const dynamic = 'force-dynamic';
export const revalidate = 43200; // 12 hours — transit blog index changes weekly at most

export const metadata: Metadata = {
  title: 'Transit guides: deep-dive astrology articles | Lunary',
  description:
    'In-depth transit guides with historical context, practical guidance, and sign-by-sign breakdowns. Written from our grimoire, grounded in real astronomical data.',
  alternates: {
    canonical: 'https://lunary.app/blog/transits',
  },
};

const RARITY_COLOURS: Record<string, string> = {
  CRITICAL: 'bg-red-500/20 text-red-300 border-red-500/30',
  HIGH: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  MEDIUM: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  LOW: 'bg-surface-overlay/20 text-slate-300 border-slate-500/30',
};

const PLANET_GLYPHS: Record<string, string> = {
  Jupiter: '\u2643',
  Saturn: '\u2644',
  Uranus: '\u2645',
  Neptune: '\u2646',
  Pluto: '\u2647',
};

const transitBlogFaqs = [
  {
    question: 'What are astrology transits?',
    answer:
      'Astrology transits compare current planetary positions with a birth chart to interpret timing, themes, and pressure points as planets move through signs, houses, and aspects.',
  },
  {
    question: 'Why do major planetary transits matter?',
    answer:
      'Major transits from Jupiter, Saturn, Uranus, Neptune, and Pluto often describe longer developmental periods because these planets move slowly and stay active for weeks, months, or years.',
  },
];

const tldr: string =
  'Astrology transits are the current movements of planets compared with a natal chart, used to interpret timing, themes, and practical periods of growth, challenge, release, or momentum.';

interface TransitPostCard {
  slug: string;
  title: string;
  subtitle: string | null;
  meta_description: string;
  planet: string;
  sign: string | null;
  transit_type: string;
  start_date: string | null;
  end_date: string | null;
  rarity: string | null;
  word_count: number | null;
  published_at: string;
}

export default async function TransitBlogIndexPage() {
  const result = await sql`
    SELECT slug, title, subtitle, meta_description, planet, sign,
           transit_type, start_date, end_date, rarity, word_count, published_at
    FROM transit_blog_posts
    WHERE status = 'published'
    ORDER BY start_date ASC NULLS LAST
  `;

  const posts = result.rows as TransitPostCard[];

  // Group by year
  const byYear = new Map<number, TransitPostCard[]>();
  for (const post of posts) {
    const year = post.start_date
      ? new Date(post.start_date).getFullYear()
      : new Date(post.published_at).getFullYear();
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(post);
  }

  const years = Array.from(byYear.keys()).sort((a, b) => a - b);

  return (
    <main className='min-h-screen bg-[#050505] text-content-secondary'>
      {renderJsonLdMulti([
        createArticleSchema({
          headline: 'Transit Guides: Deep-Dive Astrology Articles',
          description:
            'In-depth astrology transit guides covering dates, meanings, historical context, and chart interpretation for major planetary transits.',
          url: 'https://lunary.app/blog/transits',
          keywords: [
            'astrology transits',
            'planetary transits',
            'current sky astrology',
            'transit dates',
            'transit meanings',
          ],
          section: 'Astrology Transits',
        }),
        createFAQPageSchema(transitBlogFaqs),
      ])}
      <div className='mx-auto max-w-4xl px-4 py-16'>
        <Heading as='h1' variant='h1'>
          Transit guides
        </Heading>
        <p className='mt-4 text-lg text-content-brand/80 max-w-2xl'>
          Deep-dive articles on every major planetary transit. Historical
          context, exact dates, practical guidance, and what it means for your
          sign. Drawn from our grimoire, grounded in real astronomical data.
        </p>

        <section className='mt-8 rounded-xl border border-lunary-primary-800/40 bg-layer-deep/30 p-5'>
          <Heading as='h2' variant='h3'>
            What are astrology transits?
          </Heading>
          <p className='mt-3 text-sm leading-relaxed text-content-brand/75'>
            {tldr}
          </p>
        </section>

        {posts.length === 0 && (
          <p className='mt-12 text-lunary-primary-400'>
            Transit guides are being generated. Check back soon.
          </p>
        )}

        {years.map((year) => (
          <section key={year} className='mt-12'>
            <Heading as='h2' variant='h2' className='mb-6'>
              {year}
            </Heading>
            <div className='grid gap-4 sm:grid-cols-2'>
              {byYear.get(year)!.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/transits/${post.slug}`}
                  className={cn(
                    'block rounded-xl border border-lunary-primary-800/40 p-5',
                    'bg-layer-deep/30 hover:bg-layer-base/30',
                    'transition-colors group',
                  )}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-2'>
                      <span className='text-2xl text-lunary-accent-400'>
                        {PLANET_GLYPHS[post.planet] || ''}
                      </span>
                      <div>
                        <h3 className='font-semibold text-content-secondary group-hover:text-content-brand-accent transition-colors'>
                          {post.title}
                        </h3>
                        {post.subtitle && (
                          <p className='text-sm text-lunary-primary-400 mt-0.5'>
                            {post.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    {post.rarity && (
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full border whitespace-nowrap',
                          RARITY_COLOURS[post.rarity] || RARITY_COLOURS.LOW,
                        )}
                      >
                        {post.rarity}
                      </span>
                    )}
                  </div>

                  <p className='mt-3 text-sm text-content-brand/70 line-clamp-2'>
                    {post.meta_description}
                  </p>

                  <div className='mt-3 flex items-center gap-4 text-xs text-lunary-primary-400'>
                    {post.start_date && (
                      <span>
                        {format(new Date(post.start_date), 'MMM yyyy')}
                        {post.end_date &&
                          ` - ${format(new Date(post.end_date), 'MMM yyyy')}`}
                      </span>
                    )}
                    {post.word_count && (
                      <span>{Math.ceil(post.word_count / 200)} min read</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
