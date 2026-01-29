'use client';

import { ReactNode, createContext, useContext } from 'react';
import ctaExamples from '@/lib/cta-examples.json';
import { DEMO_USER_DATA } from '@/constants/demoData';

// Create marketing-specific contexts that mirror the real ones

// Mock user data for Celeste (imported from single source of truth)
const mockUser = DEMO_USER_DATA;

// Marketing User Context
const MarketingUserContext = createContext({
  user: mockUser,
  loading: false,
  error: null as Error | null,
  refetch: async () => {},
  updateProfile: async () => true,
});

// Marketing Auth Context
const MarketingAuthContext = createContext({
  isAuthenticated: true,
  loading: false,
  user: mockUser,
});

// Marketing Subscription Context
const MarketingSubscriptionContext = createContext({
  status: 'active' as const,
  plan: 'pro' as const,
  loading: false,
  trialEndsAt: null as string | null,
  isTrialing: false,
  cancelAtPeriodEnd: false,
});

// Marketing Astronomy Context - using live data
const MarketingAstronomyContext = createContext({
  currentDate: new Date(),
  currentDateTime: new Date(),
  currentMoonPhase: ctaExamples.marketing.moonPhase.phase,
  currentMoonConstellationPosition: ctaExamples.marketing.moonPhase.sign,
  moonIllumination: 0,
  moonAge: 0,
  currentTarotCard: ctaExamples.marketing.tarotCard,
  currentAstrologicalChart: null as any,
  setCurrentDate: () => {},
  setCurrentDateTime: () => {},
});

interface MarketingContextProviderProps {
  children: ReactNode;
}

/**
 * Provides mock context data for marketing preview
 * Injects Celeste's persona data so real app components work
 */
export function MarketingContextProvider({
  children,
}: MarketingContextProviderProps) {
  return (
    <div className='marketing-preview-wrapper' data-marketing-mode='true'>
      <MarketingAuthContext.Provider
        value={{
          isAuthenticated: true,
          loading: false,
          user: mockUser,
        }}
      >
        <MarketingUserContext.Provider
          value={{
            user: mockUser,
            loading: false,
            error: null,
            refetch: async () => {},
            updateProfile: async () => true,
          }}
        >
          <MarketingSubscriptionContext.Provider
            value={{
              status: 'active',
              plan: 'pro',
              loading: false,
              trialEndsAt: null,
              isTrialing: false,
              cancelAtPeriodEnd: false,
            }}
          >
            <MarketingAstronomyContext.Provider
              value={{
                currentDate: new Date(),
                currentDateTime: new Date(),
                currentMoonPhase: ctaExamples.marketing.moonPhase.phase,
                currentMoonConstellationPosition:
                  ctaExamples.marketing.moonPhase.sign,
                moonIllumination: 0,
                moonAge: 0,
                currentTarotCard: ctaExamples.marketing.tarotCard as any,
                currentAstrologicalChart: null,
                setCurrentDate: () => {},
                setCurrentDateTime: () => {},
              }}
            >
              {children}
            </MarketingAstronomyContext.Provider>
          </MarketingSubscriptionContext.Provider>
        </MarketingUserContext.Provider>
      </MarketingAuthContext.Provider>
    </div>
  );
}

// Export hooks that check for marketing mode first
export function useMarketingAwareUser() {
  const marketingContext = useContext(MarketingUserContext);
  if (marketingContext.user?.id === 'celeste-demo') {
    return marketingContext;
  }
  // Fall back to real context if not in marketing mode
  // This would need the real useUser hook imported
  throw new Error('Not in marketing mode');
}

export function useMarketingAwareAuth() {
  const marketingContext = useContext(MarketingAuthContext);
  if (marketingContext.user?.id === 'celeste-demo') {
    return marketingContext;
  }
  throw new Error('Not in marketing mode');
}

export function useMarketingAwareSubscription() {
  return useContext(MarketingSubscriptionContext);
}

export function useMarketingAwareAstronomy() {
  return useContext(MarketingAstronomyContext);
}
