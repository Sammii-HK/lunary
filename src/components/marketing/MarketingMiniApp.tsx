'use client';

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import {
  Home,
  Layers,
  Orbit,
  MessageCircle,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserProvider } from '@/context/UserContext';
import { AstronomyContextProvider } from '@/context/AstronomyContext';
import { AuthStatusProvider } from '@/components/AuthStatus';
import { TourProvider } from '@/context/TourContext';
import type { UserData } from '@/context/UserContext';
import referenceChartData from '@/lib/reference-chart-data.json';
import { DemoNavigationProvider } from './DemoNavigationProvider';
import { DemoModeProvider } from './DemoModeProvider';
import { ForceMobileLayout } from './ForceMobileLayout';
import { Button } from '@/components/ui/button';

// All static imports for instant loading (no spinners, better initial performance)
import AppDashboardClient from '@/app/(authenticated)/app/AppDashboardClient';
import { TarotView } from '@/app/(authenticated)/tarot/components/TarotView';
import { HoroscopeView } from '@/app/(authenticated)/horoscope/components/HoroscopeView';

type TabId = 'app' | 'tarot' | 'horoscope' | 'guide' | 'explore';

const tabs = [
  { id: 'app' as TabId, name: 'Home', icon: Home },
  { id: 'tarot' as TabId, name: 'Tarot', icon: Layers },
  { id: 'horoscope' as TabId, name: 'Horoscope', icon: Orbit },
  { id: 'guide' as TabId, name: 'Guide', icon: MessageCircle },
  { id: 'explore' as TabId, name: 'More', icon: MoreHorizontal },
];

// Only cycle through these tabs (exclude locked tabs)
const cyclableTabs: TabId[] = ['app', 'tarot', 'horoscope'];

// Skeleton loader for initial component load
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

export function MarketingMiniApp() {
  const [activeTab, setActiveTab] = useState<TabId>('app');
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [cycleProgress, setCycleProgress] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const autoCycleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use static fallback data for demo (no API calls)
  const celesteUser = useMemo(() => createFallbackUser(), []);

  // Track visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.3 },
    );

    if (previewRef.current) {
      observer.observe(previewRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Collapse cards and force dashboard grid to single column
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const forceMobileLayout = () => {
      // Collapse expandable cards
      const expandableCards = contentEl.querySelectorAll(
        '[data-component="expandable-card"]',
      );
      expandableCards.forEach((card) => {
        const button = card.querySelector('[role="button"]');
        if (button?.getAttribute('aria-expanded') === 'true') {
          (button as HTMLElement).click();
        }
      });

      // Force dashboard grid with inline style (highest specificity)
      const dashboardGrid = contentEl.querySelector('#dashboard-main-grid');
      if (dashboardGrid instanceof HTMLElement) {
        dashboardGrid.style.gridTemplateColumns = 'repeat(1, minmax(0, 1fr))';
      }
    };

    forceMobileLayout();
    const timer = setTimeout(forceMobileLayout, 100);

    return () => clearTimeout(timer);
  }, [activeTab]);

  // Intercept modals and keep them inside the preview
  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-demo-mobile-overrides', 'true');
    style.textContent = `
      /* Scope all modals to the demo preview container */
      #demo-preview-container [role="dialog"],
      #demo-preview-container [data-radix-portal],
      #demo-preview-container .modal,
      #demo-preview-container [class*="Modal"] {
        position: absolute !important;
        position: fixed !important;
      }

      /* Ensure modal overlays stay within the preview */
      #demo-preview-container [data-radix-dialog-overlay],
      #demo-preview-container [class*="overlay"] {
        position: absolute !important;
      }

      /*
       * Force mobile-only layout - override all responsive breakpoints
       * The mini app is 393px wide (mobile), but Tailwind's md: breakpoint (768px)
       * will apply based on the browser viewport, not the container size.
       * These rules force mobile styling regardless of browser size.
       */

      /* Create an isolation layer - prevent viewport-based responsive classes */
      #demo-preview-container.demo-mobile-view {
        container-type: inline-size;
        container-name: demo-mobile;
        max-width: 100% !important;
      }

      /* Remove side margins */
      #demo-preview-container.demo-mobile-view .dashboard-container {
        margin-left: 0 !important;
        margin-right: 0 !important;
      }

      /*
       * NUCLEAR OPTION: Override ALL responsive breakpoints with maximum specificity
       * This creates a complete responsive class blacklist for sm:, md:, lg:, xl:, 2xl:
       */
      /* Target dashboard grid by ID for maximum specificity */
      @media (min-width: 640px) {
        #demo-preview-container #dashboard-main-grid {
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
        }

        #demo-preview-container .grid:not(.grid-cols-4):not(.grid-cols-10) {
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
        }
      }

      @media (min-width: 768px) {
        #demo-preview-container #dashboard-main-grid {
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
        }

        #demo-preview-container .grid:not(.grid-cols-4):not(.grid-cols-10) {
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
        }

        #demo-preview-container .md\\:max-w-4xl,
        #demo-preview-container .md\\:max-w-3xl,
        #demo-preview-container .md\\:max-w-2xl {
          max-width: 100% !important;
        }
      }

      @media (min-width: 1024px) {
        #demo-preview-container #dashboard-main-grid {
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
        }

        #demo-preview-container .grid:not(.grid-cols-4):not(.grid-cols-10) {
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
        }
      }

      @media (min-width: 1280px) {
        #demo-preview-container #dashboard-main-grid {
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
        }

        #demo-preview-container .grid:not(.grid-cols-4):not(.grid-cols-10) {
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
        }
      }

      /* Preserve symbol grids at all sizes */
      #demo-preview-container .grid.grid-cols-4 {
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      }

      #demo-preview-container .grid.grid-cols-10 {
        grid-template-columns: repeat(10, minmax(0, 1fr)) !important;
      }


        /* Exception: Restore content grids (icons, symbols, planets) */
        #demo-preview-container.demo-mobile-view .grid.grid-cols-10 {
          grid-template-columns: repeat(10, minmax(0, 1fr)) !important;
        }

        #demo-preview-container.demo-mobile-view .grid.grid-cols-4:not([class*="md:grid-cols"]) {
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        }

        #demo-preview-container.demo-mobile-view .grid.grid-cols-3:not([class*="md:grid-cols"]) {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }

        #demo-preview-container.demo-mobile-view .grid.grid-cols-2:not([class*="md:grid-cols"]) {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
      }

      /* Hide desktop-only responsive text (e.g., Share button label) */
      @media (min-width: 640px) {
        #demo-preview-container .hidden.sm\\:inline {
          display: none !important;
        }
      }

      @media (min-width: 768px) {
        #demo-preview-container .hidden.md\\:block {
          display: none !important;
        }
      }

      /* Let expandable cards render naturally - no height overrides */
      /* They will collapse/expand based on their internal React state */

      /* Padding & Spacing - force mobile values to prevent layout issues */
      @media (min-width: 640px) {
        /* Padding overrides for sm: */
        #demo-preview-container .sm\\:p-8 { padding: 1.5rem !important; }
        #demo-preview-container .sm\\:p-6 { padding: 1rem !important; }
        #demo-preview-container .sm\\:px-8 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
        #demo-preview-container .sm\\:py-8 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
        #demo-preview-container .sm\\:gap-6 { gap: 1.25rem !important; }
        #demo-preview-container .sm\\:gap-4 { gap: 1rem !important; }
      }

      @media (min-width: 768px) {
        /* Padding overrides for md: - critical for compact widgets */
        #demo-preview-container .md\\:p-8 { padding: 1rem !important; }
        #demo-preview-container .md\\:p-6 { padding: 1rem !important; }
        #demo-preview-container .md\\:p-5 { padding: 1rem !important; }
        #demo-preview-container .md\\:px-8 { padding-left: 1rem !important; padding-right: 1rem !important; }
        #demo-preview-container .md\\:px-6 { padding-left: 1rem !important; padding-right: 1rem !important; }
        #demo-preview-container .md\\:py-8 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
        #demo-preview-container .md\\:py-6 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
        #demo-preview-container .md\\:py-24 { padding-top: 4rem !important; padding-bottom: 4rem !important; }

        /* Gap overrides */
        #demo-preview-container .md\\:gap-6 { gap: 1.25rem !important; }
        #demo-preview-container .md\\:gap-5 { gap: 1.25rem !important; }
        #demo-preview-container .md\\:gap-4 { gap: 1rem !important; }

        /* Margin overrides */
        #demo-preview-container .md\\:mx-8 { margin-left: 1rem !important; margin-right: 1rem !important; }
        #demo-preview-container .md\\:my-8 { margin-top: 1rem !important; margin-bottom: 1rem !important; }
      }

      /*
       * Text sizing - force mobile sizes by overriding ALL responsive text classes
       * Critical for compact widgets like moon card where titles/body text have md: variants
       */
      @media (min-width: 640px) {
        /* Override sm: text size variants */
        #demo-preview-container .sm\\:text-5xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
        #demo-preview-container .sm\\:text-4xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
        #demo-preview-container .sm\\:text-3xl { font-size: 1.5rem !important; line-height: 2rem !important; }
        #demo-preview-container .sm\\:text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
        #demo-preview-container .sm\\:text-xl { font-size: 1.125rem !important; line-height: 1.75rem !important; }
        #demo-preview-container .sm\\:text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
        #demo-preview-container .sm\\:text-base { font-size: 1rem !important; line-height: 1.5rem !important; }
        #demo-preview-container .sm\\:text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
        #demo-preview-container .sm\\:text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
      }

      @media (min-width: 768px) {
        /* Override md: text size variants - main culprits for layout issues */
        #demo-preview-container .md\\:text-5xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
        #demo-preview-container .md\\:text-4xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
        #demo-preview-container .md\\:text-3xl { font-size: 1.5rem !important; line-height: 2rem !important; }
        #demo-preview-container .md\\:text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
        #demo-preview-container .md\\:text-xl { font-size: 1.125rem !important; line-height: 1.75rem !important; }
        #demo-preview-container .md\\:text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
        #demo-preview-container .md\\:text-base { font-size: 1rem !important; line-height: 1.5rem !important; }
        #demo-preview-container .md\\:text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
        #demo-preview-container .md\\:text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
      }

      @media (min-width: 1024px) {
        /* Override lg: text size variants */
        #demo-preview-container .lg\\:text-5xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
        #demo-preview-container .lg\\:text-4xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
        #demo-preview-container .lg\\:text-3xl { font-size: 1.5rem !important; line-height: 2rem !important; }
        #demo-preview-container .lg\\:text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
        #demo-preview-container .lg\\:text-xl { font-size: 1.125rem !important; line-height: 1.75rem !important; }
        #demo-preview-container .lg\\:text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
      }

      @media (min-width: 1280px) {
        /* Override xl: text size variants */
        #demo-preview-container .xl\\:text-5xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
        #demo-preview-container .xl\\:text-4xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
        #demo-preview-container .xl\\:text-3xl { font-size: 1.5rem !important; line-height: 2rem !important; }
        #demo-preview-container .xl\\:text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
      }

      /*
       * Force base text classes to maintain mobile sizes at ALL viewport widths
       * Prevents browser/CSS from scaling text-sm, text-xs, etc. on larger screens
       */
      #demo-preview-container .text-5xl { font-size: 3rem !important; line-height: 1 !important; }
      #demo-preview-container .text-4xl { font-size: 2.25rem !important; line-height: 2.5rem !important; }
      #demo-preview-container .text-3xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
      #demo-preview-container .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
      #demo-preview-container .text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
      #demo-preview-container .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
      #demo-preview-container .text-base { font-size: 1rem !important; line-height: 1.5rem !important; }
      #demo-preview-container .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
      #demo-preview-container .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }

      /* Padding - force mobile padding */
      @media (min-width: 768px) {
        #demo-preview-container [class*="pb-16"] {
          padding-bottom: 4rem !important; /* pb-16, not md:pb-20 */
        }
      }

      /* Navigation height - keep mobile compact */
      @media (min-width: 768px) {
        #demo-preview-container nav[class*="h-12"] {
          height: 3rem !important; /* h-12, not md:h-14 */
        }
      }

      /* Pulse glow animation for scroll hint */
      @keyframes pulseGlow {
        0%, 100% {
          border-color: rgb(126, 86, 194);
          box-shadow: 0 0 8px rgba(126, 86, 194, 0.4);
        }
        50% {
          border-color: rgb(156, 116, 224);
          box-shadow: 0 0 16px rgba(126, 86, 194, 0.6), 0 0 24px rgba(126, 86, 194, 0.3);
        }
      }
      .animate-pulse-glow {
        animation: pulseGlow 4s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Show scroll hint after 3 seconds if user hasn't scrolled
  useEffect(() => {
    if (hasScrolled || !isVisible) return;

    const timer = setTimeout(() => {
      setShowScrollHint(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasScrolled, isVisible]);

  // Detect scroll and user interaction
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const handleScroll = () => {
      setHasScrolled(true);
      setShowScrollHint(false);
      setUserHasInteracted(true);
      setCycleProgress(0);
      if (autoCycleIntervalRef.current) {
        clearInterval(autoCycleIntervalRef.current);
        autoCycleIntervalRef.current = null;
      }
    };

    const handleTouch = () => {
      setHasScrolled(true);
      setShowScrollHint(false);
    };

    contentEl.addEventListener('scroll', handleScroll);
    contentEl.addEventListener('touchstart', handleTouch);
    contentEl.addEventListener('mousedown', handleTouch);

    return () => {
      contentEl.removeEventListener('scroll', handleScroll);
      contentEl.removeEventListener('touchstart', handleTouch);
      contentEl.removeEventListener('mousedown', handleTouch);
    };
  }, []);

  // Auto-cycle through tabs (only cyclable tabs, not locked ones)
  useEffect(() => {
    if (!isVisible || userHasInteracted) {
      setCycleProgress(0);
      return;
    }

    const cycleDuration = 12000; // 12 seconds per tab
    const frameRate = 10; // Reduced from 60 to 10fps for performance
    const incrementPerFrame = (100 / cycleDuration) * (1000 / frameRate);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += incrementPerFrame;
      if (progress >= 100) {
        progress = 0;
        // Move to next cyclable tab only (skip locked tabs)
        setActiveTab((current) => {
          const currentIndex = cyclableTabs.findIndex((t) => t === current);
          const nextIndex = (currentIndex + 1) % cyclableTabs.length;
          return cyclableTabs[nextIndex];
        });
      }
      setCycleProgress(progress);
    }, 1000 / frameRate);

    autoCycleIntervalRef.current = progressInterval;

    return () => {
      clearInterval(progressInterval);
      autoCycleIntervalRef.current = null;
    };
  }, [isVisible, userHasInteracted]); // Removed activeTab - interval continues across tab changes

  const handleTabClick = (tabId: TabId) => {
    setUserHasInteracted(true);
    setActiveTab(tabId);
    setCycleProgress(0);
  };

  // Handle navigation attempts within the mini app
  const handleNavigation = (path: string) => {
    // Map routes to tabs
    const routeToTabMap: Record<string, TabId> = {
      '/app': 'app',
      '/tarot': 'tarot',
      '/horoscope': 'horoscope',
      '/guide': 'guide',
      '/explore': 'explore',
      '/profile': 'explore',
      '/birth-chart': 'explore',
      '/grimoire': 'explore',
      '/book-of-shadows': 'explore',
    };

    // Check if we can map this route to a tab
    const targetTab = routeToTabMap[path];
    if (targetTab) {
      handleTabClick(targetTab);
    } else {
      // For unmapped routes, show alert
      alert('This feature is not available in the demo preview');
    }
  };

  return (
    <div
      ref={previewRef}
      className='relative w-full max-w-[393px] mx-auto'
      style={{ height: '750px' }}
    >
      {/* Click to explore hint */}
      {/* {showClickHint && !userHasInteracted && isVisible && (
        <div className='absolute -top-8 left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-top-2 duration-500'>
          <p className='text-xs text-lunary-primary-300 whitespace-nowrap'>
            Click tabs to explore ✨
          </p>
        </div>
      )} */}

      {/* iPhone frame */}
      <div
        className='relative w-full h-full bg-zinc-950 rounded-[2.5rem] border border-zinc-800 overflow-hidden flex flex-col'
        style={{
          boxShadow:
            '0 18px 28px rgba(0, 0, 0, 0.28), 0 0 22px rgba(178, 126, 255, 0.18)',
        }}
      >
        {/* Content area - Render REAL app with demo data */}
        <div
          ref={contentRef}
          className='flex-1 overflow-y-auto demo-mobile-view'
          id='demo-preview-container'
          style={{
            // Inline styles for maximum specificity
            containerType: 'inline-size',
            maxWidth: '100%',
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
                        {activeTab === 'app' && (
                          <ForceMobileLayout>
                            <AppDashboardClient />
                          </ForceMobileLayout>
                        )}
                        {activeTab === 'tarot' && (
                          <ForceMobileLayout>
                            <TarotView
                              hasPaidAccess={celesteUser.isPaid}
                              userName={celesteUser.name}
                              userBirthday={celesteUser.birthday}
                              user={celesteUser}
                            />
                          </ForceMobileLayout>
                        )}
                        {activeTab === 'horoscope' && (
                          <ForceMobileLayout>
                            <HoroscopeView
                              hasPaidAccess={celesteUser.isPaid}
                              userName={celesteUser.name}
                              userBirthday={celesteUser.birthday}
                              profile={celesteUser}
                            />
                          </ForceMobileLayout>
                        )}
                      </Suspense>
                      {activeTab === 'guide' && (
                        <div className='relative h-full'>
                          {/* Demo blocker overlay */}
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
                                    window.open('/auth?signup=true', '_blank');
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
                          {/* Demo blocker overlay */}
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
                                    window.open('/auth?signup=true', '_blank');
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

        {/* Interactive demo hint */}
        {showScrollHint && !hasScrolled && isVisible && !userHasInteracted && (
          <div
            className='absolute left-0 right-0 flex justify-center pointer-events-none z-20'
            style={{ bottom: '64px' }}
          >
            <Button
              variant='outline'
              size='xs'
              className='animate-pulse-glow pointer-events-none bg-lunary-primary-900/90'
            >
              <ChevronDown className='w-3.5 h-3.5' />
              Fully interactive
            </Button>
          </div>
        )}

        {/* Tab bar - matching real Navbar styling */}
        <nav className='border-t border-stone-800 bg-zinc-950/95 backdrop-blur-sm'>
          {/* Progress bar (only show when auto-cycling) */}
          {!userHasInteracted && isVisible && (
            <div className='h-0.5 bg-zinc-800 relative overflow-hidden'>
              <div
                className='h-full bg-lunary-primary-400 transition-all duration-75'
                style={{ width: `${cycleProgress}%` }}
              />
            </div>
          )}

          {/* Tabs */}
          <div className='flex w-full h-12 md:h-14 items-center justify-around px-2 py-2 text-white'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              // Only show "next" indicator for cyclable tabs
              const currentCycleIndex = cyclableTabs.findIndex(
                (t) => t === activeTab,
              );
              const nextCyclableTab =
                cyclableTabs[(currentCycleIndex + 1) % cyclableTabs.length];
              const willBeNext =
                !userHasInteracted && tab.id === nextCyclableTab;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition',
                    isActive
                      ? 'text-lunary-secondary'
                      : 'text-zinc-400 hover:text-zinc-300',
                    willBeNext && !userHasInteracted && 'animate-pulse',
                  )}
                >
                  <Icon
                    className='h-4 w-4 md:h-5 md:w-5'
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span className='text-[10px] uppercase tracking-wide'>
                    {tab.name}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Caption below */}
      <div className='mt-4 text-center space-y-1'>
        {!userHasInteracted && isVisible && (
          <p className='text-xs text-zinc-500 animate-in fade-in duration-500'>
            Auto-cycling through live features • Click any tab to explore
          </p>
        )}
        <p className='text-xs text-zinc-400'>
          Live preview using real cosmic data for today
        </p>
      </div>
    </div>
  );
}

// Fallback user data if API fetch fails
function createFallbackUser(): UserData {
  return {
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
  };
}
