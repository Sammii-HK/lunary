import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CountdownTimer } from '@/components/launch/CountdownTimer';
import { LaunchSignupForm } from '@/components/launch/LaunchSignupForm';
import { SocialShareButtons } from '@/components/SocialShareButtons';

export const metadata: Metadata = {
  title: 'Lunary AI · Product Hunt Launch',
  description:
    'Lunary AI blends astronomy data with AI rituals. Explore the Product Hunt launch plan, maker story, testimonials, and launch reminders.',
  openGraph: {
    title: 'Lunary AI on Product Hunt',
    description:
      'Join the launch squad, preview screenshots, and get notified on drop day.',
    url: 'https://lunary.app/product-hunt',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary AI Product Hunt Launch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunary AI · Product Hunt Launch',
    description:
      'AI + Astronomy for personalized cosmic guidance. Launching soon on PH.',
    images: ['/api/og/cosmic'],
  },
};

const features = [
  'Real astronomical calculations (not generic horoscopes)',
  'AI-powered personalized insights + rituals',
  'Daily cosmic pulse notifications with energy scores',
  'Moon Circles and grimoire library for every lunation',
  'Cosmic Report Generator with shareable PDFs',
];

const screenshots = [
  {
    src: '/press-kit/screenshot-dashboard.png',
    alt: 'Lunary dashboard',
    caption: 'Cosmic dashboard with daily widgets',
  },
  {
    src: '/press-kit/screenshot-report.png',
    alt: 'Cosmic report generator',
    caption: 'Generate PDF + shareable reports',
  },
  {
    src: '/press-kit/screenshot-mobile.png',
    alt: 'Mobile ritual flow',
    caption: 'Mobile-first ritual and tarot view',
  },
];

export default function ProductHuntPage() {
  return (
    <div className='w-full max-w-5xl space-y-12 px-4 py-10 text-white'>
      <section className='space-y-6 rounded-3xl border border-white/10 bg-black/50 p-8 shadow-2xl'>
        <p className='text-xs uppercase tracking-[0.4em] text-lunary-rose-200'>
          Product Hunt · Coming Soon
        </p>
        <h1 className='text-4xl font-semibold'>
          Lunary AI — Personalized Astrology Powered by Real Astronomical Data
        </h1>
        <p className='text-lg text-zinc-200'>
          AI meets astronomy for personalized cosmic guidance. We combine
          NASA-grade ephemeris with AI rituals, tarot archetypes, and mood
          intelligence so you can plan launches, rituals, and creative sprints
          with confidence.
        </p>
        <div className='flex flex-wrap gap-3 text-sm text-lunary-rose-100'>
          {features.map((feature) => (
            <span
              key={feature}
              className='rounded-full border border-lunary-rose-300/40 px-4 py-2 text-xs uppercase tracking-[0.3em]'
            >
              {feature}
            </span>
          ))}
        </div>
        <CountdownTimer label='Product Hunt Launch' />
      </section>

      <section className='grid gap-6 md:grid-cols-2'>
        <div className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
          <h2 className='text-2xl font-semibold'>Maker Comment</h2>
          <p className='text-sm text-zinc-300'>
            &ldquo;I built Lunary because astrology apps felt either too fluffy
            or too gatekept. We pair real astronomy with human language so
            modern mystics, founders, and ritual keepers can make confident
            decisions. Launching on Product Hunt lets us show that spirituality
            and data can co-exist beautifully.&rdquo;
          </p>
          <p className='text-xs uppercase tracking-[0.3em] text-zinc-400'>
            — [Founder Name], Builder of Lunary
          </p>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200'>
            <p className='font-semibold text-white'>Launch Schedule</p>
            <ul className='mt-2 space-y-1'>
              <li>9:00 AM PT · Product Hunt post goes live</li>
              <li>9:15 AM PT · TikTok live build session</li>
              <li>10:00 AM PT · Press kit + Cosmic Report giveaway</li>
            </ul>
          </div>
        </div>
        <LaunchSignupForm source='product_hunt' />
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200'>
            Screenshots
          </p>
          <h2 className='text-3xl font-semibold'>Peek inside Lunary</h2>
        </div>
        <div className='grid gap-4 sm:grid-cols-3'>
          {screenshots.map((shot) => (
            <div
              key={shot.src}
              className='rounded-2xl border border-white/10 bg-white/5 p-3 text-center text-sm text-zinc-300'
            >
              <div className='relative mb-3 h-48 w-full overflow-hidden rounded-xl bg-black/40'>
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes='300px'
                  className='object-contain p-4'
                />
              </div>
              <p>{shot.caption}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='space-y-3 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <h2 className='text-2xl font-semibold'>Spread the word</h2>
        <p className='text-sm text-zinc-300'>
          Tweets, LinkedIn posts, TikToks, and Product Hunt comments help us
          reach the Top 5 goal.
        </p>
        <SocialShareButtons
          url='https://lunary.app/product-hunt'
          title='Lunary AI is launching on Product Hunt — AI + Astronomy for personalized cosmic guidance.'
        />
        <Link
          href='https://www.producthunt.com/'
          target='_blank'
          className='inline-flex items-center gap-2 text-sm text-lunary-rose-200 underline'
        >
          Visit the Product Hunt preview →
        </Link>
      </section>
    </div>
  );
}
