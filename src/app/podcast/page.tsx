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

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The Grimoire Podcast | Lunary',
  description:
    'Weekly explorations of astrology, tarot, crystals, numerology, and cosmic wisdom. Listen to The Grimoire by Lunary.',
  openGraph: {
    title: 'The Grimoire Podcast | Lunary',
    description:
      'Weekly explorations of astrology, tarot, crystals, numerology, and cosmic wisdom.',
    url: 'https://lunary.app/podcast',
    siteName: 'Lunary',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lunary.app/podcast',
    types: {
      'application/rss+xml': 'https://lunary.app/podcast/feed.xml',
    },
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
            The Grimoire Podcast
          </Heading>
          <p className='mt-4 text-lg text-lunary-primary-300/70'>
            Weekly explorations of astrology, tarot, crystals, numerology, and
            cosmic wisdom from the Lunary grimoire.
          </p>

          {/* Listen on platforms */}
          <div className='mt-6 flex flex-wrap items-center gap-3'>
            <a
              href='https://open.spotify.com/show/2m6J9KAemy6o26xqpXebsP'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-300/20 bg-lunary-primary-300/5 px-4 py-2 text-sm text-lunary-primary-300/80 transition-colors hover:border-lunary-primary-300/40 hover:text-lunary-primary-300'
            >
              <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z' />
              </svg>
              Spotify
            </a>
            <a
              href='https://www.youtube.com/playlist?list=PL062Em90MtYbXlu8Ah1dHa_WrmIyd_UYH'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-300/20 bg-lunary-primary-300/5 px-4 py-2 text-sm text-lunary-primary-300/80 transition-colors hover:border-lunary-primary-300/40 hover:text-lunary-primary-300'
            >
              <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
              </svg>
              YouTube
            </a>
            <a
              href='/podcast/feed.xml'
              className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-300/20 bg-lunary-primary-300/5 px-4 py-2 text-sm text-lunary-primary-300/80 transition-colors hover:border-lunary-primary-300/40 hover:text-lunary-primary-300'
            >
              <svg
                className='h-5 w-5'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 0 1 7 7m-6 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z'
                />
              </svg>
              RSS Feed
            </a>
          </div>

          {/* Spotify embed */}
          <div className='mt-6 rounded-xl overflow-hidden'>
            <iframe
              src='https://open.spotify.com/embed/show/2m6J9KAemy6o26xqpXebsP?utm_source=generator&theme=0'
              width='100%'
              height='352'
              frameBorder='0'
              allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
              loading='lazy'
              className='rounded-xl'
              title='The Grimoire Podcast on Spotify'
            />
          </div>
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
