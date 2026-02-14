import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Heading } from '@/components/ui/Heading';
import {
  createPodcastSeriesSchema,
  createBreadcrumbSchema,
  renderJsonLdMulti,
} from '@/lib/schema/index';
import { format } from 'date-fns';
import { Clock, Headphones } from 'lucide-react';

export const revalidate = 3600; // 1 hour ISR

export const metadata: Metadata = {
  title: 'Cosmic Insights Podcast | Lunary',
  description:
    'Weekly explorations of astrology, tarot, crystals, numerology, and cosmic wisdom. Listen to the Lunary Cosmic Insights podcast.',
  openGraph: {
    title: 'Cosmic Insights Podcast | Lunary',
    description:
      'Weekly explorations of astrology, tarot, crystals, numerology, and cosmic wisdom.',
    url: 'https://lunary.app/podcast',
    siteName: 'Lunary',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lunary.app/podcast',
  },
};

function formatDuration(secs: number): string {
  const minutes = Math.floor(secs / 60);
  return `${minutes} min`;
}

function formatSlugTitle(slug: string): string {
  return slug
    .split('/')
    .pop()!
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function PodcastIndexPage() {
  const episodes = await prisma.podcastEpisode.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: {
      slug: true,
      title: true,
      description: true,
      durationSecs: true,
      publishedAt: true,
      episodeNumber: true,
      grimoireSlugs: true,
    },
  });

  const seriesSchema = createPodcastSeriesSchema();
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Podcast', url: '/podcast' },
  ]);

  return (
    <>
      {renderJsonLdMulti([seriesSchema, breadcrumbSchema])}

      <div className='mx-auto max-w-3xl px-4 py-12'>
        {/* Breadcrumbs */}
        <nav className='mb-6 text-sm text-lunary-primary-300/60'>
          <Link href='/' className='hover:text-lunary-primary-300'>
            Home
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-lunary-primary-300/80'>Podcast</span>
        </nav>

        <header className='mb-10'>
          <Heading as='h1' variant='h1'>
            Cosmic Insights Podcast
          </Heading>
          <p className='mt-4 text-lg text-lunary-primary-300/70'>
            Weekly explorations of astrology, tarot, crystals, numerology, and
            cosmic wisdom from the Lunary grimoire.
          </p>
        </header>

        {episodes.length === 0 ? (
          <div className='rounded-xl border border-lunary-primary-300/20 p-8 text-center'>
            <Headphones className='mx-auto h-12 w-12 text-lunary-primary-300/30' />
            <p className='mt-4 text-lunary-primary-300/60'>
              New episodes coming soon. Stay tuned for weekly cosmic insights.
            </p>
          </div>
        ) : (
          <div className='space-y-6'>
            {episodes.map((episode) => (
              <Link
                key={episode.slug}
                href={`/podcast/${episode.slug}`}
                className='block rounded-xl border border-lunary-primary-300/20 p-6 transition-colors hover:border-lunary-primary-300/40 hover:bg-lunary-primary-300/5'
              >
                <div className='mb-2 flex items-center gap-3 text-sm text-lunary-primary-300/50'>
                  <span>Episode {episode.episodeNumber}</span>
                  <span className='flex items-center gap-1'>
                    <Clock className='h-3.5 w-3.5' />
                    {formatDuration(episode.durationSecs)}
                  </span>
                  <span>
                    {format(new Date(episode.publishedAt), 'MMM d, yyyy')}
                  </span>
                </div>

                <Heading as='h2' variant='h3'>
                  {episode.title}
                </Heading>

                <p className='mt-2 line-clamp-2 text-lunary-primary-300/60'>
                  {episode.description}
                </p>

                {episode.grimoireSlugs.length > 0 && (
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {episode.grimoireSlugs.slice(0, 3).map((slug) => (
                      <span
                        key={slug}
                        className='rounded-full bg-lunary-primary-300/10 px-2.5 py-0.5 text-xs text-lunary-primary-300/60'
                      >
                        {formatSlugTitle(slug)}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
