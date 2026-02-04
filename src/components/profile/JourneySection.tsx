'use client';

import dynamic from 'next/dynamic';

const SkeletonCard = () => (
  <div className='h-32 bg-zinc-800 animate-pulse rounded-xl' />
);

const StreakDisplay = dynamic(
  () =>
    import('@/components/StreakDisplay').then((m) => ({
      default: m.StreakDisplay,
    })),
  { loading: () => <SkeletonCard /> },
);

const CosmicProgress = dynamic(
  () =>
    import('@/components/progress').then((m) => ({
      default: m.CosmicProgress,
    })),
  {
    loading: () => (
      <div className='space-y-3'>
        <div className='h-8 w-48 bg-zinc-800 animate-pulse rounded' />
        <div className='grid gap-3 sm:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='h-32 bg-zinc-800 animate-pulse rounded-xl'
            />
          ))}
        </div>
      </div>
    ),
  },
);

const MonthlyInsights = dynamic(
  () =>
    import('@/components/MonthlyInsights').then((m) => ({
      default: m.MonthlyInsights,
    })),
  {
    loading: () => (
      <div className='h-64 bg-zinc-800 animate-pulse rounded-xl' />
    ),
  },
);

const Paywall = dynamic(
  () => import('@/components/Paywall').then((m) => ({ default: m.Paywall })),
  { ssr: false },
);

const PremiumPathway = dynamic(
  () =>
    import('@/components/PremiumPathway').then((m) => ({
      default: m.PremiumPathway,
    })),
  { ssr: false },
);

export function JourneySection() {
  return (
    <div className='w-full max-w-3xl space-y-4'>
      {/* Streak Display - Standalone */}
      <StreakDisplay />

      {/* Cosmic Progress - Skill Trees */}
      <CosmicProgress />

      {/* Monthly Insights */}
      <Paywall feature='monthly_insights'>
        <div id='monthly-insights'>
          <MonthlyInsights />
        </div>
      </Paywall>

      <PremiumPathway variant='guide' className='mt-4' />
    </div>
  );
}
