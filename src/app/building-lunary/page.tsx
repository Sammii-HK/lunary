import type { Metadata } from 'next';
import Link from 'next/link';
import { LaunchSignupForm } from '@/components/launch/LaunchSignupForm';

export const metadata: Metadata = {
  title: 'Building Lunary · TikTok Series',
  description:
    'Follow the Building Lunary TikTok series for behind-the-scenes product updates, astronomy explainers, and launch prep.',
  openGraph: {
    title: 'Building Lunary · TikTok Series',
    description:
      'Watch the episode list, get BTS notes, and subscribe for new drops.',
    url: 'https://lunary.app/building-lunary',
  },
};

const episodes = [
  {
    title: 'Why Real Astronomical Data Matters',
    description:
      'Deep dive into astronomical-grade calculations and why Lunary refuses to ship generic horoscopes.',
    link: 'https://www.tiktok.com/@lunary/video/0001',
  },
  {
    title: 'How We Built AI-Powered Astrology',
    description:
      'A tour of the AI stack, prompts, and guardrails we use to keep insights grounded.',
    link: 'https://www.tiktok.com/@lunary/video/0002',
  },
  {
    title: 'The Tech Behind Personalized Guidance',
    description:
      'From astronomy-engine to tarot embeddings — here’s how the stack stays fast.',
    link: 'https://www.tiktok.com/@lunary/video/0003',
  },
  {
    title: 'Launch Day: What to Expect',
    description:
      'We map the Product Hunt schedule, cosmic report giveaway, and livestream.',
    link: 'https://www.tiktok.com/@lunary/video/0004',
  },
  {
    title: 'User Stories: Lunary Changed My Launch',
    description:
      'Spotlight on creators using Lunary to time launches and rituals.',
    link: 'https://www.tiktok.com/@lunary/video/0005',
  },
];

export default function BuildingLunaryPage() {
  return (
    <div className='w-full max-w-4xl space-y-10 px-4 py-10 text-white'>
      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/50 p-8'>
        <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200'>
          TikTok Series
        </p>
        <h1 className='text-4xl font-semibold'>Building Lunary</h1>
        <p className='text-lg text-zinc-200'>
          A weekly TikTok series documenting how we build the Product Hunt
          launch, cosmic report generator, and community rituals — in public.
        </p>
        <div className='flex gap-4 text-sm text-lunary-primary-100'>
          <Link
            href='https://www.tiktok.com/@lunary'
            target='_blank'
            className='rounded-full border border-white/10 px-4 py-2'
          >
            Follow on TikTok
          </Link>
          <Link
            href='https://www.instagram.com/'
            target='_blank'
            className='rounded-full border border-white/10 px-4 py-2'
          >
            Instagram Reels
          </Link>
          <Link
            href='/product-hunt'
            className='rounded-full border border-white/10 px-4 py-2'
          >
            Launch Plan
          </Link>
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <h2 className='text-2xl font-semibold'>Episode List</h2>
        <div className='space-y-4'>
          {episodes.map((episode, index) => (
            <div
              key={episode.title}
              className='rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex sm:items-center sm:justify-between'
            >
              <div>
                <p className='text-xs uppercase tracking-[0.3em] text-lunary-primary-200'>
                  Episode {index + 1}
                </p>
                <h3 className='text-xl font-semibold text-white'>
                  {episode.title}
                </h3>
                <p className='text-sm text-zinc-300'>{episode.description}</p>
              </div>
              <Link
                href={episode.link}
                target='_blank'
                className='mt-3 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-lunary-primary-400'
              >
                Watch
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className='grid gap-6 md:grid-cols-2'>
        <LaunchSignupForm source='tiktok' />
        <div className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200'>
            Behind the scenes
          </p>
          <h2 className='text-2xl font-semibold'>What we share</h2>
          <ul className='list-disc space-y-2 pl-5 text-sm text-zinc-300'>
            <li>Weekly build logs + rituals performed before shipping</li>
            <li>Product Hunt prep, ranging from copywriting to outreach</li>
            <li>Cosmic report sneak peeks, tarot spreads, and fails</li>
            <li>Live Q&A during lunations and TikTok streams</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
