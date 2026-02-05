'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
// lucide-react automatically tree-shakes with modern bundlers
import {
  Home,
  Layers,
  Orbit,
  MessageCircle,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserProvider } from '@/context/UserContext';
import { AstronomyContextProvider } from '@/context/AstronomyContext';
import { AuthStatusProvider } from '@/components/AuthStatus';
import { TourProvider } from '@/context/TourContext';
import { DEMO_USER_DATA } from '@/constants/demoData';
import { DemoNavigationProvider } from '@/components/marketing/DemoNavigationProvider';
import { DemoModeProvider } from '@/components/marketing/DemoModeProvider';

// Set demo mode IMMEDIATELY
if (typeof window !== 'undefined') {
  (window as any).__LUNARY_DEMO_MODE__ = true;
}

type TabId = 'app' | 'tarot' | 'horoscope' | 'guide' | 'explore';

const tabs = [
  { id: 'app' as TabId, name: 'Home', icon: Home },
  { id: 'tarot' as TabId, name: 'Tarot', icon: Layers },
  { id: 'horoscope' as TabId, name: 'Horoscope', icon: Orbit },
  { id: 'guide' as TabId, name: 'Guide', icon: MessageCircle },
  { id: 'explore' as TabId, name: 'More', icon: MoreHorizontal },
];

// Dynamic imports for code splitting
const AppDashboardClient = dynamic(
  () => import('@/app/(authenticated)/app/AppDashboardClient'),
  { ssr: false },
);

const TarotView = dynamic(
  () =>
    import('@/app/(authenticated)/tarot/components/TarotView').then((m) => ({
      default: m.TarotView,
    })),
  { ssr: false },
);

const HoroscopeView = dynamic(
  () =>
    import('@/app/(authenticated)/horoscope/components/HoroscopeView').then(
      (m) => ({ default: m.HoroscopeView }),
    ),
  { ssr: false },
);

function DashboardSkeleton() {
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

// Demo user data from SSOT
// Only cycle through these tabs (skip guide/explore) - OUTSIDE component to avoid re-renders
const cyclableTabs: TabId[] = ['app', 'tarot', 'horoscope'];

export function DemoClient() {
  const [activeTab, setActiveTab] = useState<TabId>('app');
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [cycleProgress, setCycleProgress] = useState(0);
  const celesteUser = DEMO_USER_DATA;

  useEffect(() => {
    // Warm preload other tab components for instant switching
    const preloadTimer = setTimeout(() => {
      import('@/app/(authenticated)/tarot/components/TarotView');
      import('@/app/(authenticated)/horoscope/components/HoroscopeView');
    }, 2000); // Preload after 2 seconds

    // Performance tracking - defensive check for start mark existence
    if (typeof performance !== 'undefined') {
      performance.mark('demo-client-mounted');

      // Only measure if the start mark exists (may not in some loading scenarios)
      const startMarkExists =
        performance.getEntriesByName('demo-page-start', 'mark').length > 0;
      if (startMarkExists) {
        performance.measure(
          'demo-mount-time',
          'demo-page-start',
          'demo-client-mounted',
        );

        const measure = performance.getEntriesByName('demo-mount-time')[0];
        if (measure) {
          console.log(
            `[Demo Perf] Mounted in ${Math.round(measure.duration)}ms`,
          );

          // Send to analytics if available
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'timing_complete', {
              name: 'demo_mount',
              value: Math.round(measure.duration),
              event_category: 'Performance',
            });
          }
        }
      }
    }

    // Notify parent
    const notifyTimer = setTimeout(() => {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'DEMO_READY' }, '*');
      }
    }, 100);

    return () => {
      clearTimeout(preloadTimer);
      clearTimeout(notifyTimer);
    };
  }, []);

  // Auto-open moon card after 1 second to show interactivity, then close after 2 more seconds
  useEffect(() => {
    if (activeTab === 'app') {
      const openTimer = setTimeout(() => {
        // Target the expandable card toggle (div with role="button"), not the share button
        const moonCard = document.querySelector(
          '#moon-phase [data-component="expandable-card"] > [role="button"]',
        );
        if (moonCard instanceof HTMLElement) {
          moonCard.click();

          // Close it after 2 seconds
          const closeTimer = setTimeout(() => {
            const moonCardAgain = document.querySelector(
              '#moon-phase [data-component="expandable-card"] > [role="button"]',
            );
            if (moonCardAgain instanceof HTMLElement) {
              moonCardAgain.click();
            }
          }, 2000);

          return () => clearTimeout(closeTimer);
        }
      }, 1000);

      return () => clearTimeout(openTimer);
    } else if (activeTab === 'tarot') {
      // Auto-open tarot patterns section
      const timer = setTimeout(() => {
        const tarotSection = document.querySelector(
          '[data-collapsible="Tarot Patterns"] button',
        );
        if (tarotSection instanceof HTMLElement) {
          tarotSection.click();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [activeTab]); // Re-run when tab changes

  // Auto-cycle through tabs if user hasn't interacted
  useEffect(() => {
    if (userHasInteracted) {
      setCycleProgress(0);
      return;
    }

    const cycleDuration = 12000; // 12 seconds per tab
    const frameRate = 10; // 10fps for performance
    const incrementPerFrame = (100 / cycleDuration) * (1000 / frameRate);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += incrementPerFrame;
      if (progress >= 100) {
        progress = 0;
        // Move to next cyclable tab
        setActiveTab((current) => {
          const currentIndex = cyclableTabs.findIndex((t) => t === current);
          const nextIndex = (currentIndex + 1) % cyclableTabs.length;
          return cyclableTabs[nextIndex];
        });
      }
      setCycleProgress(progress);
    }, 1000 / frameRate);

    return () => clearInterval(progressInterval);
  }, [userHasInteracted]); // cyclableTabs is stable, no need in deps

  const handleTabClick = (tabId: TabId) => {
    setUserHasInteracted(true);
    setCycleProgress(0);
    setActiveTab(tabId);
  };

  const handleNavigation = (path: string) => {
    const routeToTabMap: Record<string, TabId> = {
      '/app': 'app',
      '/tarot': 'tarot',
      '/horoscope': 'horoscope',
      '/guide': 'guide',
      '/explore': 'explore',
      '/book-of-shadows/journal': 'explore',
      '/book-of-shadows/dreams': 'explore',
      '/profile': 'explore',
      '/birth-chart': 'explore',
      '/grimoire': 'explore',
      '/book-of-shadows': 'explore',
    };

    const targetTab = routeToTabMap[path];
    if (targetTab) {
      handleTabClick(targetTab);
    } else {
      // Trigger modal for unmapped routes
      window.dispatchEvent(
        new CustomEvent('demo-action-blocked', {
          detail: { action: 'Accessing this page' },
        }),
      );
    }
  };

  return (
    <div className='flex flex-col h-full w-full bg-zinc-950'>
      {/* Content area - Demo content area */}
      <div
        className='flex-1 overflow-y-auto demo-mobile-view'
        id='demo-preview-container'
        style={{
          containerType: 'inline-size',
          maxWidth: '100%',
          overscrollBehavior: 'contain',
        }}
      >
        <DemoModeProvider>
          <DemoNavigationProvider onNavigate={handleNavigation}>
            <AuthStatusProvider
              demoData={{
                isAuthenticated: true,
                user: celesteUser,
              }}
            >
              <UserProvider demoData={celesteUser}>
                <AstronomyContextProvider>
                  <TourProvider demoMode={true}>
                    <Suspense fallback={<DashboardSkeleton />}>
                      {activeTab === 'app' && <AppDashboardClient />}
                      {activeTab === 'tarot' && (
                        <TarotView
                          hasPaidAccess={celesteUser.isPaid}
                          userName={celesteUser.name}
                          userBirthday={celesteUser.birthday}
                          user={celesteUser}
                        />
                      )}
                      {activeTab === 'horoscope' && (
                        <HoroscopeView
                          hasPaidAccess={celesteUser.isPaid}
                          userName={celesteUser.name}
                          userBirthday={celesteUser.birthday}
                          profile={celesteUser}
                        />
                      )}
                    </Suspense>
                    {activeTab === 'guide' && (
                      <div className='relative h-full'>
                        <div
                          className='absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm cursor-not-allowed'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            alert('Chat not available in demo preview');
                          }}
                        >
                          <div className='text-center space-y-4 p-8'>
                            <MessageCircle className='w-12 h-12 mx-auto text-lunary-primary-400' />
                            <div>
                              <p className='text-sm text-zinc-300 mb-2'>
                                Astral Guide Chat
                              </p>
                              <p className='text-xs text-zinc-500 mb-4'>
                                Not available in demo - sign up to chat with
                                your personalized guide
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Break out of iframe and navigate to auth
                                  if (window.top) {
                                    window.top.location.href =
                                      '/auth?signup=true';
                                  } else {
                                    window.location.href = '/auth?signup=true';
                                  }
                                }}
                                className='px-4 py-2 bg-lunary-primary-600 hover:bg-lunary-primary-500 text-white text-xs rounded-md transition-colors'
                              >
                                Create your free account →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeTab === 'explore' && (
                      <div className='relative h-full'>
                        <div
                          className='absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm cursor-not-allowed'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            alert('Not available in demo preview');
                          }}
                        >
                          <div className='text-center space-y-4 p-8'>
                            <MoreHorizontal className='w-12 h-12 mx-auto text-zinc-600' />
                            <div>
                              <p className='text-sm text-zinc-300 mb-2'>
                                Profile & More
                              </p>
                              <p className='text-xs text-zinc-500 mb-4'>
                                Not available in demo - sign up to customize
                                your profile
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Break out of iframe and navigate to auth
                                  if (window.top) {
                                    window.top.location.href =
                                      '/auth?signup=true';
                                  } else {
                                    window.location.href = '/auth?signup=true';
                                  }
                                }}
                                className='px-4 py-2 bg-lunary-primary-600 hover:bg-lunary-primary-500 text-white text-xs rounded-md transition-colors'
                              >
                                Create your free account →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </TourProvider>
                </AstronomyContextProvider>
              </UserProvider>
            </AuthStatusProvider>
          </DemoNavigationProvider>
        </DemoModeProvider>
      </div>

      {/* Tab bar - EXACT same as MarketingMiniApp */}
      <nav className='border-t border-stone-800 bg-zinc-950/95 backdrop-blur-sm'>
        {/* Progress bar - show when auto-cycling */}
        {!userHasInteracted && (
          <div className='h-0.5 bg-zinc-800 relative overflow-hidden'>
            <div
              className='h-full bg-lunary-primary-400 transition-all duration-75'
              style={{ width: `${cycleProgress}%` }}
            />
          </div>
        )}

        <div className='flex w-full h-12 items-center justify-around px-2 py-2 text-white'>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            // Show pulse on next cyclable tab
            const currentCycleIndex = cyclableTabs.findIndex(
              (t) => t === activeTab,
            );
            const nextCyclableTab =
              cyclableTabs[(currentCycleIndex + 1) % cyclableTabs.length];
            const willBeNext = !userHasInteracted && tab.id === nextCyclableTab;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition',
                  isActive
                    ? 'text-lunary-secondary'
                    : 'text-zinc-400 hover:text-zinc-300',
                  willBeNext && 'animate-pulse',
                )}
              >
                <Icon className='h-4 w-4' strokeWidth={isActive ? 2 : 1.5} />
                <span className='text-[10px] uppercase tracking-wide'>
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
