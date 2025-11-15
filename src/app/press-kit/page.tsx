import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PressKitAssets } from '@/components/press-kit/PressKitAssets';

export const metadata: Metadata = {
  title: 'Lunary AI Press Kit',
  description:
    'Download Lunary logos, screenshots, founder bios, press release templates, and key stats for coverage.',
  openGraph: {
    title: 'Lunary AI Press Kit',
    description:
      'Company overview, founder bio, statistics, and assets for media partners.',
    url: 'https://lunary.app/press-kit',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary AI Press Kit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunary AI Press Kit',
    description:
      'Download logos, product screenshots, and press release template.',
    images: ['/api/og/cosmic'],
  },
};

const stats = [
  { label: 'Beta waitlist', value: '12,000+' },
  { label: 'Daily cosmic events', value: '140,000+' },
  { label: 'Moon circles hosted', value: '320' },
  { label: 'Push notifications sent', value: '4.5M' },
];

const screenshots = [
  {
    src: '/press-kit/screenshot-dashboard.png',
    title: 'Cosmic Dashboard',
    description: 'Daily astro + tarot widgets',
  },
  {
    src: '/press-kit/screenshot-report.png',
    title: 'Cosmic Report Generator',
    description: 'Shareable PDF + web reports',
  },
  {
    src: '/press-kit/screenshot-mobile.png',
    title: 'Mobile Ritual Flow',
    description: 'Moon rituals and tarot readings',
  },
];

export default function PressKitPage() {
  return (
    <div className='w-full max-w-5xl space-y-10 px-4 py-10 text-white'>
      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/50 p-8'>
        <p className='text-xs uppercase tracking-[0.4em] text-purple-200'>
          Press Center
        </p>
        <h1 className='text-4xl font-semibold'>Lunary AI · Company Overview</h1>
        <p className='text-lg text-zinc-200'>
          Lunary is your personalized cosmic companion. We combine NASA-grade
          astronomy with AI storytelling to deliver real-time rituals, tarot
          prompts, and cosmic status updates for modern mystics, founders, and
          community builders.
        </p>
        <div className='grid gap-4 sm:grid-cols-4'>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className='rounded-2xl border border-white/10 bg-white/5 p-4 text-center'
            >
              <p className='text-2xl font-semibold text-white'>{stat.value}</p>
              <p className='text-xs uppercase tracking-[0.3em] text-purple-200'>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className='grid gap-6 rounded-3xl border border-white/10 bg-black/40 p-6 md:grid-cols-2'>
        <div>
          <h2 className='text-2xl font-semibold'>Founder Bio</h2>
          <p className='text-sm text-zinc-300'>
            Lunary was founded by Nova Quinn, a product builder who previously
            led AI teams at mindful technology startups. She pairs a background
            in astronomy and ritual facilitation to make cosmic insights more
            accessible, accurate, and community-driven.
          </p>
          <ul className='mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-300'>
            <li>Built Lunary after hosting moon circles for over five years</li>
            <li>Graduate of NASA&apos;s community science programs</li>
            <li>
              Focused on ethical AI, transparency, and community storytelling
            </li>
          </ul>
          <Link
            href='/press-kit/founder-bio.pdf'
            className='mt-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-purple-400'
          >
            Download bio (.pdf)
          </Link>
        </div>
        <div className='space-y-4'>
          <p className='text-xs uppercase tracking-[0.3em] text-purple-300'>
            Contact
          </p>
          <p className='text-sm text-zinc-300'>
            press@lunary.app · Signal +1 (000) 000-0000 · Available for
            interviews, demos, and guest content.
          </p>
          <Link
            href='/press-kit/press-release-template.md'
            className='inline-flex items-center gap-2 text-sm text-purple-200 underline'
          >
            Press release template
          </Link>
          <Link
            href='/press-kit/lunary-press-kit.zip'
            className='inline-flex items-center gap-2 text-sm text-purple-200 underline'
          >
            Download all assets (.zip)
          </Link>
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <h2 className='text-2xl font-semibold'>Product Screenshots</h2>
        <div className='grid gap-4 md:grid-cols-3'>
          {screenshots.map((shot) => (
            <div
              key={shot.title}
              className='rounded-2xl border border-white/10 bg-white/5 p-3'
            >
              <div className='relative mb-3 h-48 w-full overflow-hidden rounded-xl bg-black/40'>
                <Image
                  src={shot.src}
                  alt={shot.title}
                  fill
                  sizes='300px'
                  className='object-contain p-4'
                />
              </div>
              <p className='text-sm font-semibold text-white'>{shot.title}</p>
              <p className='text-xs text-zinc-400'>{shot.description}</p>
            </div>
          ))}
        </div>
      </section>

      <PressKitAssets />
    </div>
  );
}
