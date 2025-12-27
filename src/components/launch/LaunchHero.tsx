import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface LaunchHeroProps {
  title?: string;
  subtitle?: string;
  ctaPrimary?: {
    label: string;
    href: string;
  };
  ctaSecondary?: {
    label: string;
    href: string;
  };
  stats?: Array<{ label: string; value: string }>;
}

const defaultStats = [
  { label: 'Beta Testers', value: '12,000+' },
  { label: 'Daily Reports Sent', value: '140k' },
  { label: 'Star Guides Online', value: '24/7' },
];

export function LaunchHero({
  title = 'Lunary AI: Your Personalized Cosmic Companion',
  subtitle = 'AI-powered astrology meets real astronomical data. Grounded in NASA-grade ephemeris, guided by modern mystics.',
  ctaPrimary = { label: 'Start Your Cosmic Journey', href: '/auth' },
  ctaSecondary = { label: 'Explore the Launch Plan', href: '#timeline' },
  stats = defaultStats,
}: LaunchHeroProps) {
  return (
    <section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-indigo-950 to-black p-6 md:p-10 shadow-2xl'>
      <div className='pointer-events-none absolute inset-0 opacity-40'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(147,51,234,0.25),_transparent_60%)]' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.15),_transparent_50%)]' />
      </div>

      <div className='relative flex flex-col gap-8 lg:flex-row lg:items-center'>
        <div className='flex-1 space-y-6'>
          <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.2em] text-lunary-primary-200 backdrop-blur'>
            <Sparkles className='h-4 w-4' />
            Official Launch Sequence · 2025
          </span>
          <h1 className='text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl'>
            {title}
          </h1>
          <p className='text-base text-zinc-200 sm:text-lg md:text-xl'>
            {subtitle}
          </p>

          <div className='flex flex-wrap gap-4'>
            <Link
              href={ctaPrimary.href}
              className='inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:scale-[1.01]'
            >
              {ctaPrimary.label}
            </Link>
            <Link
              href={ctaSecondary.href}
              className='inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-white/40'
            >
              {ctaSecondary.label}
            </Link>
          </div>

          <div className='grid gap-4 sm:grid-cols-3'>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className='rounded-2xl border border-white/10 bg-black/40 p-4 text-center'
              >
                <p className='text-xl md:text-2xl font-semibold text-white'>
                  {stat.value}
                </p>
                <p className='text-xs uppercase tracking-widest text-zinc-400'>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className='relative flex-1'>
          <div className='relative ml-auto h-[360px] w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-black/50 p-6 shadow-2xl'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_55%)] animate-pulse' />
            <div className='relative z-10 space-y-4'>
              <p className='text-sm uppercase tracking-[0.3em] text-lunary-primary-200'>
                Powered by Astronomy Engine
              </p>
              <h3 className='text-xl md:text-2xl font-semibold text-white'>
                Real stars. Real-time transits.
              </h3>
              <p className='text-sm text-zinc-300'>
                Lunary AI synchronizes NASA data, tarot archetypes, and mood
                journaling to deliver a daily cosmic companion that feels human.
              </p>

              <div className='grid grid-cols-2 gap-3 text-left text-sm'>
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-xs uppercase tracking-[0.3em] text-zinc-400'>
                    Next moon ritual
                  </p>
                  <p className='mt-2 text-base md:text-lg text-white'>
                    Full Moon in Virgo
                  </p>
                  <p className='text-xs text-zinc-400'>In 3 days 14h</p>
                </div>
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-xs uppercase tracking-[0.3em] text-zinc-400'>
                    Cosmic pulse
                  </p>
                  <p className='mt-2 text-base md:text-lg text-white'>
                    88% aligned
                  </p>
                  <p className='text-xs text-zinc-400'>
                    High creativity window
                  </p>
                </div>
              </div>

              <div className='rounded-3xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white'>
                <p className='font-medium'>Launch day · March 3, 2025</p>
                <p className='text-xs text-zinc-300'>
                  Product Hunt + Global Livestream
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
