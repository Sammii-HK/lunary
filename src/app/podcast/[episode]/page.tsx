import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Heading } from '@/components/ui/Heading';
import {
  createPodcastEpisodeSchema,
  createVideoObjectSchema,
  createBreadcrumbSchema,
  renderJsonLdMulti,
} from '@/lib/schema/index';
import { format } from 'date-fns';
import { Clock, Calendar, Headphones, BookOpen } from 'lucide-react';

export const revalidate = 3600; // 1 hour ISR

interface PodcastEpisodePageProps {
  params: Promise<{ episode: string }>;
}

async function getEpisode(slug: string) {
  const episode = await prisma.podcastEpisode.findUnique({
    where: { slug, status: 'published' },
  });
  return episode;
}

export async function generateMetadata({
  params,
}: PodcastEpisodePageProps): Promise<Metadata> {
  const { episode: slug } = await params;
  const episode = await getEpisode(slug);

  if (!episode) {
    return { title: 'Episode Not Found | Lunary Podcast' };
  }

  const title = `${episode.title} | The Grimoire by Lunary`;
  const description =
    episode.description.slice(0, 160) ||
    `Listen to episode ${episode.episodeNumber} of The Grimoire by Lunary.`;

  return {
    title,
    description,
    openGraph: {
      title: episode.title,
      description,
      type: 'article',
      url: `https://lunary.app/podcast/${episode.slug}`,
      siteName: 'Lunary',
      audio: episode.audioUrl,
    },
    twitter: {
      card: 'summary',
      title: episode.title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/podcast/${episode.slug}`,
    },
  };
}

function formatDuration(secs: number): string {
  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds} sec`;
}

function formatSlugTitle(slug: string): string {
  return slug
    .split('/')
    .pop()!
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function PodcastEpisodePage({
  params,
}: PodcastEpisodePageProps) {
  const { episode: slug } = await params;
  const episode = await getEpisode(slug);

  if (!episode) {
    notFound();
  }

  const transcript = episode.transcript as
    | { speaker: string; text: string }[]
    | null;
  const showNotes = episode.showNotes as {
    sections?: { title: string; content: string }[];
    grimoireLinks?: { slug: string; title: string; url: string }[];
    keyPoints?: string[];
  } | null;

  const publishedDate = format(new Date(episode.publishedAt), 'MMMM d, yyyy');

  const episodeSchema = createPodcastEpisodeSchema({
    name: episode.title,
    description: episode.description,
    url: `/podcast/${episode.slug}`,
    audioUrl: episode.audioUrl,
    datePublished: new Date(episode.publishedAt).toISOString(),
    durationSecs: episode.durationSecs,
    episodeNumber: episode.episodeNumber,
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Podcast', url: '/podcast' },
    { name: episode.title, url: `/podcast/${episode.slug}` },
  ]);

  const videoSchema = episode.youtubeVideoId
    ? createVideoObjectSchema({
        name: episode.title,
        description: episode.description.slice(0, 300),
        uploadDate: new Date(episode.publishedAt).toISOString(),
        embedUrl: `https://www.youtube.com/embed/${episode.youtubeVideoId}`,
        contentUrl: episode.youtubeVideoUrl || undefined,
        durationSecs: episode.durationSecs,
        episodeUrl: `/podcast/${episode.slug}`,
      })
    : null;

  return (
    <>
      {renderJsonLdMulti([episodeSchema, breadcrumbSchema, videoSchema])}

      <div className='mx-auto max-w-3xl px-4 py-12'>
        {/* Breadcrumbs */}
        <nav className='mb-6 text-sm text-lunary-primary-300/60'>
          <Link href='/' className='hover:text-lunary-primary-300'>
            Home
          </Link>
          <span className='mx-2'>/</span>
          <Link href='/podcast' className='hover:text-lunary-primary-300'>
            Podcast
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-lunary-primary-300/80'>
            Episode {episode.episodeNumber}
          </span>
        </nav>

        {/* Header */}
        <header className='mb-8'>
          <div className='mb-3 flex items-center gap-3 text-sm text-lunary-primary-300/60'>
            <span className='flex items-center gap-1'>
              <Calendar className='h-4 w-4' />
              {publishedDate}
            </span>
            <span className='flex items-center gap-1'>
              <Clock className='h-4 w-4' />
              {formatDuration(episode.durationSecs)}
            </span>
            <span className='flex items-center gap-1'>
              <Headphones className='h-4 w-4' />
              Episode {episode.episodeNumber}
            </span>
          </div>

          <Heading as='h1' variant='h1'>
            {episode.title}
          </Heading>

          <p className='mt-4 text-lg text-lunary-primary-300/70'>
            {episode.description}
          </p>
        </header>

        {/* Audio Player */}
        <section className='mb-10 rounded-xl border border-lunary-primary-300/20 bg-lunary-primary-300/5 p-6'>
          <audio
            controls
            preload='metadata'
            className='w-full'
            src={episode.audioUrl}
          >
            Your browser does not support the audio element.
          </audio>
        </section>

        {/* YouTube Video */}
        {episode.youtubeVideoId && (
          <section className='mb-10'>
            <Heading as='h2' variant='h2'>
              Watch on YouTube
            </Heading>
            <div className='mt-4 aspect-video w-full overflow-hidden rounded-xl'>
              <iframe
                src={`https://www.youtube.com/embed/${episode.youtubeVideoId}`}
                title={episode.title}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
                className='h-full w-full'
              />
            </div>
          </section>
        )}

        {/* Show Notes */}
        {showNotes?.sections && showNotes.sections.length > 0 && (
          <section className='mb-10'>
            <Heading as='h2' variant='h2'>
              Show Notes
            </Heading>
            <div className='mt-4 space-y-6'>
              {showNotes.sections.map((section, i) => (
                <div key={i}>
                  <Heading as='h3' variant='h3'>
                    {section.title}
                  </Heading>
                  <p className='mt-2 text-lunary-primary-300/70'>
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Key Points */}
        {showNotes?.keyPoints && showNotes.keyPoints.length > 0 && (
          <section className='mb-10'>
            <Heading as='h2' variant='h2'>
              Key Takeaways
            </Heading>
            <ul className='mt-4 space-y-2'>
              {showNotes.keyPoints.map((point, i) => (
                <li
                  key={i}
                  className='flex items-start gap-2 text-lunary-primary-300/70'
                >
                  <span className='mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-lunary-accent-300' />
                  {point}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Grimoire Links */}
        {episode.grimoireSlugs.length > 0 && (
          <section className='mb-10'>
            <Heading as='h2' variant='h2'>
              Explore in the Grimoire
            </Heading>
            <div className='mt-4 grid gap-3'>
              {episode.grimoireSlugs.map((grimoireSlug) => (
                <a
                  key={grimoireSlug}
                  href={`/grimoire/${grimoireSlug}`}
                  className='flex items-center gap-3 rounded-lg border border-lunary-primary-300/20 p-4 transition-colors hover:border-lunary-primary-300/40 hover:bg-lunary-primary-300/5'
                >
                  <BookOpen className='h-5 w-5 flex-shrink-0 text-lunary-accent-300' />
                  <span className='text-lunary-primary-300/80'>
                    {formatSlugTitle(grimoireSlug)}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Transcript */}
        {transcript && transcript.length > 0 && (
          <section className='mb-10'>
            <details className='group'>
              <summary className='cursor-pointer'>
                <Heading as='h2' variant='h2' className='inline'>
                  Transcript
                </Heading>
                <span className='ml-2 text-sm text-lunary-primary-300/50'>
                  (click to expand)
                </span>
              </summary>
              <div className='mt-4 space-y-4'>
                {transcript.map((line, i) => (
                  <div key={i} className='flex gap-3'>
                    <span className='flex-shrink-0 text-sm font-medium text-lunary-accent-300'>
                      {line.speaker === 'HOST_A' ? 'Luna' : 'Sol'}:
                    </span>
                    <p className='text-lunary-primary-300/70'>{line.text}</p>
                  </div>
                ))}
              </div>
            </details>
          </section>
        )}

        {/* Back to all episodes */}
        <div className='border-t border-lunary-primary-300/10 pt-8'>
          <Link
            href='/podcast'
            className='text-lunary-accent-300 transition-colors hover:text-lunary-accent-300/80'
          >
            &larr; All episodes
          </Link>
        </div>
      </div>
    </>
  );
}
