'use client';

import dynamic from 'next/dynamic';
import { CosmicSkeleton } from '@/components/states/CosmicSkeleton';

const SkeletonCard = () => <CosmicSkeleton height={128} radius={12} />;

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
        <CosmicSkeleton variant='text' width={192} height={32} />
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {[1, 2, 3, 4].map((i) => (
            <CosmicSkeleton key={i} height={128} radius={12} />
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
    loading: () => <CosmicSkeleton height={256} radius={12} />,
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
