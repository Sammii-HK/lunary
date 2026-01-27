'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Hook to handle deep links from push notifications
 *
 * Processes URL query parameters from notification clicks and
 * navigates to the appropriate content or opens modals.
 *
 * Example URLs:
 * - /app?event=retrograde&planet=Mercury
 * - /app?tab=transits
 * - /app?view=cosmic-changes
 *
 * Usage:
 * ```tsx
 * // In AppDashboardClient.tsx or any page that receives notification deep links
 * import { useNotificationDeepLink } from '@/hooks/useNotificationDeepLink';
 *
 * export default function AppDashboard() {
 *   useNotificationDeepLink(); // Automatically handles deep links
 *
 *   return (
 *     // ... your component
 *   );
 * }
 * ```
 */
export function useNotificationDeepLink() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Event-based deep links (cosmic events)
    const event = searchParams.get('event');
    if (event) {
      handleEventDeepLink(event, searchParams);
      return;
    }

    // Tab navigation
    const tab = searchParams.get('tab');
    if (tab) {
      handleTabDeepLink(tab);
      return;
    }

    // View navigation
    const view = searchParams.get('view');
    if (view) {
      handleViewDeepLink(view, searchParams);
      return;
    }
  }, [searchParams, router]);
}

/**
 * Handle event-based deep links (retrograde, ingress, aspect, etc.)
 */
function handleEventDeepLink(eventType: string, params: URLSearchParams) {
  const planet = params.get('planet');
  const sign = params.get('sign');
  const planetA = params.get('planetA');
  const planetB = params.get('planetB');
  const aspect = params.get('aspect');
  const phase = params.get('phase');
  const name = params.get('name');
  const type = params.get('type');

  console.log(
    `[NotificationDeepLink] Event deep link: ${eventType}`,
    Object.fromEntries(params.entries()),
  );

  switch (eventType) {
    case 'retrograde':
      if (planet) {
        // TODO: Open retrograde modal or navigate to retrograde page
        // Example: openRetrogradeModal(planet);
        console.log(`[NotificationDeepLink] Show retrograde for ${planet}`);
        // For now, scroll to transits section or horoscope
        scrollToSection('transits');
      }
      break;

    case 'ingress':
      if (planet && sign) {
        // TODO: Open ingress modal or navigate to ingress details
        // Example: openIngressModal(planet, sign);
        console.log(
          `[NotificationDeepLink] Show ingress: ${planet} in ${sign}`,
        );
        scrollToSection('transits');
      }
      break;

    case 'aspect':
      if (planetA && planetB && aspect) {
        // TODO: Open aspect modal or navigate to aspect details
        // Example: openAspectModal(planetA, planetB, aspect);
        console.log(
          `[NotificationDeepLink] Show aspect: ${planetA} ${aspect} ${planetB}`,
        );
        scrollToSection('transits');
      }
      break;

    case 'moon-phase':
      if (phase) {
        // TODO: Open moon phase modal or navigate to moon phase page
        // Example: openMoonPhaseModal(phase);
        console.log(`[NotificationDeepLink] Show moon phase: ${phase}`);
        scrollToSection('moon');
      }
      break;

    case 'sabbat':
      if (name) {
        // TODO: Open sabbat modal or navigate to sabbat page
        // Example: openSabbatModal(name);
        console.log(`[NotificationDeepLink] Show sabbat: ${name}`);
        scrollToSection('seasonal');
      }
      break;

    case 'eclipse':
      if (type) {
        // TODO: Open eclipse modal or navigate to eclipse page
        // Example: openEclipseModal(type);
        console.log(`[NotificationDeepLink] Show eclipse: ${type}`);
        scrollToSection('transits');
      }
      break;

    default:
      console.warn(
        `[NotificationDeepLink] Unknown event type: ${eventType}`,
        Object.fromEntries(params.entries()),
      );
  }

  // Clean up URL after handling (remove query params)
  // This prevents the deep link from triggering again on page reload
  setTimeout(() => {
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, '', url.toString());
  }, 1000);
}

/**
 * Handle tab-based deep links
 */
function handleTabDeepLink(tab: string) {
  console.log(`[NotificationDeepLink] Tab deep link: ${tab}`);

  switch (tab) {
    case 'transits':
      // TODO: Navigate to transits tab or scroll to transits section
      scrollToSection('transits');
      break;

    case 'chart':
      // TODO: Navigate to birth chart tab
      console.log('[NotificationDeepLink] Navigate to birth chart');
      // window.location.href = '/birth-chart';
      break;

    case 'moon-circles':
      // Navigate to moon circles page
      console.log('[NotificationDeepLink] Navigate to moon circles');
      window.location.href = '/moon-circles';
      break;

    case 'reports':
      // TODO: Navigate to reports section or page
      console.log('[NotificationDeepLink] Navigate to reports');
      scrollToSection('reports');
      break;

    default:
      console.warn(`[NotificationDeepLink] Unknown tab: ${tab}`);
  }

  // Clean up URL
  setTimeout(() => {
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, '', url.toString());
  }, 1000);
}

/**
 * Handle view-based deep links
 */
function handleViewDeepLink(view: string, params: URLSearchParams) {
  const date = params.get('date');

  console.log(
    `[NotificationDeepLink] View deep link: ${view}`,
    Object.fromEntries(params.entries()),
  );

  switch (view) {
    case 'transits':
      // TODO: Show transits view for specific date
      if (date) {
        console.log(`[NotificationDeepLink] Show transits for date: ${date}`);
      }
      scrollToSection('transits');
      break;

    case 'cosmic-changes':
      // TODO: Show cosmic changes view
      console.log('[NotificationDeepLink] Show cosmic changes');
      scrollToSection('horoscope');
      break;

    default:
      console.warn(`[NotificationDeepLink] Unknown view: ${view}`);
  }

  // Clean up URL
  setTimeout(() => {
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, '', url.toString());
  }, 1000);
}

/**
 * Scroll to a specific section on the page
 *
 * This is a simple implementation that scrolls to elements with matching IDs.
 * You can customize this based on your app's structure.
 */
function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    console.log(`[NotificationDeepLink] Scrolled to section: ${sectionId}`);
  } else {
    console.warn(
      `[NotificationDeepLink] Section not found: ${sectionId}. Consider adding id="${sectionId}" to the relevant section.`,
    );
  }
}

/**
 * TODO: Future enhancements
 *
 * 1. **Modal Support:**
 *    - Add modal state management (e.g., Zustand, Context)
 *    - Create modal components for each event type
 *    - Example: openRetrogradeModal(planet), openAspectModal(...)
 *
 * 2. **Better Navigation:**
 *    - Use Next.js router.push() instead of window.location.href
 *    - Add loading states during navigation
 *    - Handle 404s gracefully if destination doesn't exist
 *
 * 3. **Analytics:**
 *    - Track notification deep link clicks
 *    - Example: trackEvent('notification_deep_link_clicked', { event, params })
 *
 * 4. **Highlight Content:**
 *    - Add visual highlight to the target content
 *    - Example: Pulse animation, border color, background flash
 *
 * 5. **Query Param Persistence:**
 *    - Option to keep query params instead of cleaning up
 *    - Useful for debugging or sharing links
 */
