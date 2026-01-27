'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { conversionTracking } from '@/lib/analytics';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity ends session
const SESSION_PING_INTERVAL_MS = 5 * 60 * 1000; // Ping every 5 minutes

export default function SessionTracker() {
  const { user } = useUser();
  const pathname = usePathname();
  const sessionStartRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const currentFeatureRef = useRef<string | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extract feature from pathname
  const getFeatureFromPath = (path: string): string => {
    if (path.startsWith('/app')) return 'dashboard';
    if (path.startsWith('/horoscope')) return 'horoscope';
    if (path.startsWith('/tarot')) return 'tarot';
    if (path.startsWith('/guide')) return 'astral_chat';
    if (path.startsWith('/forecast')) return 'forecast';
    if (path.startsWith('/birth-chart')) return 'birth_chart';
    if (path.startsWith('/book-of-shadows')) return 'journal';
    if (path.startsWith('/collections')) return 'collections';
    if (path.startsWith('/grimoire')) return 'grimoire';
    if (path.startsWith('/profile')) return 'profile';
    return 'unknown';
  };

  // Start new session
  const startSession = (feature: string) => {
    sessionStartRef.current = Date.now();
    currentFeatureRef.current = feature;
    lastActivityRef.current = Date.now();

    conversionTracking.sessionStarted(user?.id, feature);

    // Set up ping interval to keep session alive
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    pingIntervalRef.current = setInterval(() => {
      lastActivityRef.current = Date.now();
    }, SESSION_PING_INTERVAL_MS);
  };

  // End current session
  const endSession = () => {
    if (!sessionStartRef.current || !currentFeatureRef.current) return;

    const durationMs = Date.now() - sessionStartRef.current;
    conversionTracking.sessionEnded(
      user?.id,
      currentFeatureRef.current,
      durationMs,
    );

    sessionStartRef.current = null;
    currentFeatureRef.current = null;

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  };

  // Check for session timeout
  const checkSessionTimeout = () => {
    if (!sessionStartRef.current) return;

    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    if (timeSinceLastActivity > SESSION_TIMEOUT_MS) {
      endSession();
    }
  };

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();

      // Start session if not already started
      if (!sessionStartRef.current && user?.id) {
        const feature = getFeatureFromPath(pathname);
        startSession(feature);
      }
    };

    // Activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Check for timeout periodically
    const timeoutCheckInterval = setInterval(checkSessionTimeout, 60000); // Check every minute

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(timeoutCheckInterval);
    };
  }, [user?.id, pathname]);

  // Handle page navigation (feature change)
  useEffect(() => {
    if (!user?.id) return;

    const newFeature = getFeatureFromPath(pathname);

    // If feature changed, end current session and start new one
    if (
      currentFeatureRef.current &&
      currentFeatureRef.current !== newFeature
    ) {
      endSession();
      startSession(newFeature);
    } else if (!sessionStartRef.current) {
      // Start new session if none exists
      startSession(newFeature);
    }
  }, [pathname, user?.id]);

  // Handle page unload/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endSession();
    };
  }, []);

  return null; // This component doesn't render anything
}
