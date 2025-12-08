import type { Metadata } from 'next';
import Link from 'next/link';
import { LaunchHero } from '@/components/launch/LaunchHero';
import { FeatureShowcase } from '@/components/launch/FeatureShowcase';
import { CountdownTimer } from '@/components/launch/CountdownTimer';
import { LaunchSignupForm } from '@/components/launch/LaunchSignupForm';
import { SocialShareButtons } from '@/components/SocialShareButtons';

export const metadata: Metadata = {
  title: 'Lunary AI Launch Campaign',
  description:
    'Lunary AI is launching on Product Hunt with real astronomical data, AI guidance, and a full press kit. Join the waitlist for launch-day perks.',
  openGraph: {
    title: 'Lunary AI Launch Campaign',
    description:
      'Discover the launch roadmap, Product Hunt plans, press kit, and cosmic report generator.',
    url: 'https://lunary.app/launch',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary AI Launch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunary AI Launch Campaign',
    description:
      'Countdown, Product Hunt prep, press kit, and cosmic launch activations in one place.',
    images: ['/api/og/cosmic'],
  },
};

const timeline = [
  {
    date: 'Now',
    title: 'Launch prep & community seeding',
    details:
      'Collect waitlist signups, ship press kit, publish TikTok builder series.',
  },
  {
    date: 'T-7 days',
    title: 'Press + newsletter outreach',
    details:
      'Send press release template, cosmic report preview, and secure coverage commitments.',
  },
  {
    date: 'Launch Day · Mar 3 · 9 AM PT',
    title: 'Product Hunt + Livestream',
    details:
      'Publish Product Hunt listing, activate TikTok live, drop limited cosmic report templates.',
  },
  {
    date: 'Post-launch week',
    title: 'Thank-yous & retros',
    details:
      'Share results, feature early supporters, and expand the cosmic report generator.',
  },
];

const testimonials = [
  {
    quote:
      'Lunary’s beta saved me hours creating moon rituals for my membership. Real data + AI prompts are unmatched.',
    author: 'Mara — Ritual Host',
  },
  {
    quote:
      'As a founder I need clarity fast. The cosmic report generator gives me a strategic view of the energetic weather.',
    author: 'Jordan — Startup CEO',
  },
];

export default function LaunchPage() {
  return (
    <div className='w-full max-w-6xl space-y-12 px-4 py-10 text-white'>
      <LaunchHero />

      <CountdownTimer />

      <FeatureShowcase />

      <section className='grid gap-6 rounded-3xl border border-white/10 bg-black/40 p-6 md:grid-cols-2'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200'>
            Social Proof
          </p>
          <h3 className='text-3xl font-semibold text-white'>
            12k beta users · 140k daily cosmic events tracked
          </h3>
          <p className='mt-2 text-sm text-zinc-300'>
            Powered by NASA-grade data, verified by mystics, and loved by ritual
            keepers, founders, and cosmic hobbyists alike.
          </p>
          <div className='mt-6 space-y-4'>
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className='rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200'
              >
                <p className='italic'>&ldquo;{testimonial.quote}&rdquo;</p>
                <p className='mt-3 text-xs uppercase tracking-[0.3em] text-lunary-primary-200'>
                  {testimonial.author}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200'>
            Launch Pricing
          </p>
          <div className='mt-4 rounded-3xl border border-lunary-primary-400/20 bg-gradient-to-b from-lunary-primary-900/30 to-black/60 p-6'>
            <h4 className='text-2xl font-semibold'>Founding Moon Circle</h4>
            <p className='text-sm text-lunary-primary-100'>
              $29/mo · includes cosmic report generator, Moon Circle templates,
              and full grimoire access. Annual plan includes a personalized PDF
              drop.
            </p>
            <ul className='mt-4 space-y-2 text-sm text-lunary-primary-50'>
              <li>✷ Product Hunt launch-only perks</li>
              <li>✷ Invite to live TikTok build session</li>
              <li>✷ Priority cosmic report credits</li>
            </ul>
            <Link
              href='/pricing'
              className='mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]'
            >
              Explore pricing
            </Link>
          </div>
        </div>
      </section>

      <section
        id='timeline'
        className='space-y-6 rounded-3xl border border-white/10 bg-black/40 p-6'
      >
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200'>
            Launch Timeline
          </p>
          <h3 className='text-3xl font-semibold text-white'>Mission Control</h3>
        </div>
        <div className='space-y-4'>
          {timeline.map((event) => (
            <div
              key={event.title}
              className='rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex sm:items-center sm:justify-between'
            >
              <div>
                <p className='text-sm uppercase tracking-[0.3em] text-lunary-primary-300'>
                  {event.date}
                </p>
                <h4 className='text-xl font-semibold text-white'>
                  {event.title}
                </h4>
                <p className='text-sm text-zinc-300'>{event.details}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='grid gap-6 md:grid-cols-2'>
        <LaunchSignupForm />
        <div className='rounded-3xl border border-white/10 bg-black/40 p-6'>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200'>
            Share the launch
          </p>
          <h3 className='text-2xl font-semibold text-white'>
            Rally your cosmic group chat
          </h3>
          <p className='text-sm text-zinc-300'>
            Invite fellow builders, astrologers, and ritual keepers to the
            Product Hunt launch. Every share helps us reach the Top 5 goal.
          </p>
          <div className='mt-6'>
            <SocialShareButtons
              url='https://lunary.app/launch'
              title='Join me in launching Lunary AI on Product Hunt! 🚀✨'
            />
          </div>
        </div>
      </section>
    </div>
  );
}
