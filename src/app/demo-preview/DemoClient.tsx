'use client';

import { useEffect, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { UserProvider } from '@/context/UserContext';
import { AstronomyContextProvider } from '@/context/AstronomyContext';
import { AuthStatusProvider } from '@/components/AuthStatus';
import { TourProvider } from '@/context/TourContext';
import { SimpleDemoModeProvider } from '@/components/marketing/SimpleDemoModeProvider';
import referenceChartData from '@/lib/reference-chart-data.json';
import type { UserData } from '@/context/UserContext';

// Dynamic imports with loading states
const AppDashboardClient = dynamic(
  () => import('@/app/(authenticated)/app/AppDashboardClient'),
  {
    ssr: false,
    loading: () => <DemoSkeleton />,
  },
);

function DemoSkeleton() {
  return (
    <div className='p-4 space-y-4 animate-pulse'>
      <div className='h-8 bg-zinc-800/50 rounded w-48' />
      <div className='h-4 bg-zinc-800/30 rounded w-64' />
      <div className='space-y-3 mt-6'>
        <div className='h-32 bg-zinc-800/30 rounded-xl' />
        <div className='h-32 bg-zinc-800/30 rounded-xl' />
        <div className='h-32 bg-zinc-800/30 rounded-xl' />
      </div>
    </div>
  );
}

// Set demo mode IMMEDIATELY (before any rendering)
if (typeof window !== 'undefined') {
  (window as any).__LUNARY_DEMO_MODE__ = true;
}

export function DemoClient() {
  // Create demo user data
  const demoUser = useMemo(
    (): UserData => ({
      id: 'celeste-demo',
      email: 'celeste@lunary.app',
      name: referenceChartData.persona.name,
      birthday: referenceChartData.persona.birthDate,
      birthChart: referenceChartData.planets as any,
      hasBirthChart: true,
      hasPersonalCard: true,
      isPaid: true,
      subscriptionStatus: 'active',
      subscriptionPlan: 'pro',
      location: {
        latitude: 51.5074,
        longitude: -0.1278,
        city: 'London',
        country: 'UK',
        timezone: 'Europe/London',
        birthTime: referenceChartData.persona.birthTime,
        birthLocation: referenceChartData.persona.birthLocation,
        birthTimezone: 'Europe/London',
      },
    }),
    [],
  );

  useEffect(() => {
    // Notify parent that iframe is ready (for performance tracking)
    const timer = setTimeout(() => {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'DEMO_READY' }, '*');
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      id='demo-preview-container'
      className='h-full w-full overflow-auto bg-zinc-950'
    >
      <SimpleDemoModeProvider>
        <AuthStatusProvider
          demoData={{
            isAuthenticated: true,
            user: demoUser,
          }}
        >
          <UserProvider demoData={demoUser}>
            <AstronomyContextProvider>
              <TourProvider demoMode={true}>
                <Suspense fallback={<DemoSkeleton />}>
                  <AppDashboardClient />
                </Suspense>
              </TourProvider>
            </AstronomyContextProvider>
          </UserProvider>
        </AuthStatusProvider>
      </SimpleDemoModeProvider>
    </div>
  );
}
