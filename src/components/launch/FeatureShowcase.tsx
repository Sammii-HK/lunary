import {
  Compass,
  Sparkles,
  Waves,
  Zap,
  Orbit,
  BookOpenCheck,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';
import type { ComponentType } from 'react';

interface Feature {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  tag?: string;
}

interface FeatureShowcaseProps {
  heading?: string;
  subheading?: string;
  features?: Feature[];
  layout?: 'grid' | 'list';
}

const defaultFeatures: Feature[] = [
  {
    title: 'Real Astronomical Data',
    description:
      'Powered by Astronomy Engine, accurate to within 1 arcminute of NOVAS for to-the-minute transits.',
    icon: Orbit,
    tag: 'Verified',
  },
  {
    title: 'Astral Guide Chat (Optional)',
    description:
      'Optional AI chat grounded in your chart and the current sky for deeper questions.',
    icon: Sparkles,
    tag: 'Optional',
  },
  {
    title: 'Daily Cosmic Pulse',
    description:
      'Push notifications for energy spikes, caution windows, and moon-aligned rituals.',
    icon: Zap,
  },
  {
    title: 'Moon Circles & Rituals',
    description:
      'New + Full Moon experiences with scripts, altar setups, and community prompts.',
    icon: Waves,
  },
  {
    title: 'Cosmic Report Generator',
    description:
      'One-click PDF + shareable reports for launches, birthdays, and content drops.',
    icon: Compass,
  },
  {
    title: 'Grimoire Library',
    description:
      'Curated spells, tarot spreads, and astro-lesson packs updated weekly.',
    icon: BookOpenCheck,
  },
  {
    title: '2026 Forecast',
    description:
      'Comprehensive yearly cosmic forecast with major transits, eclipses, retrograde periods, and seasonal transitions.',
    icon: TrendingUp,
    tag: 'Annual',
  },
  {
    title: 'Calendar Download',
    description:
      'Download your personalized cosmic calendar (ICS format) with all major astrological events for seamless integration.',
    icon: Calendar,
  },
];

export function FeatureShowcase({
  heading = 'Key Launch Highlights',
  subheading = 'Every feature is mapped to our launch narrative: credibility, creativity, community.',
  features = defaultFeatures,
  layout = 'grid',
}: FeatureShowcaseProps) {
  return (
    <section className='space-y-8'>
      <div className='space-y-3 text-center'>
        <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary'>
          Launch Feature Stack
        </p>
        <h2 className='text-3xl font-semibold text-white sm:text-4xl'>
          {heading}
        </h2>
        <p className='text-base text-zinc-300 sm:text-lg'>{subheading}</p>
      </div>

      <div
        className={clsx('gap-4', {
          'grid grid-cols-1 md:grid-cols-2': layout === 'grid',
          'flex flex-col': layout === 'list',
        })}
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className='group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 transition hover:border-lunary-primary-600'
            >
              <div className='absolute inset-0 opacity-0 transition group-hover:opacity-20'>
                <div className='h-full w-full bg-[radial-gradient(circle,_rgba(147,51,234,0.4)_0%,_transparent_60%)]' />
              </div>
              <div className='relative flex items-start gap-4'>
                <div className='rounded-2xl border border-white/10 bg-white/5 p-3'>
                  <Icon className='h-6 w-6 text-lunary-accent-300' />
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-3'>
                    <h3 className='text-xl font-semibold text-white'>
                      {feature.title}
                    </h3>
                    {feature.tag && (
                      <span className='rounded-full bg-lunary-highlight-900 px-3 py-1 text-xs uppercase tracking-wider text-lunary-highlight'>
                        {feature.tag}
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-zinc-300'>{feature.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
