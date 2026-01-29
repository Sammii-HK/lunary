'use client';

import { ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from './AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { PRICING_PLANS, normalizePlanType } from '../../utils/pricing';
import {
  X,
  Sparkles,
  Calendar,
  Star,
  NotebookPen,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBirthChartWithMetadata } from '../../utils/astrology/birthChartService';
import { conversionTracking } from '@/lib/analytics';
import { BirthdayInput } from './ui/birthday-input';
import {
  clearOnboardingPrefill,
  getOnboardingPrefill,
} from '@/lib/onboarding/prefill';
import { parseCoordinates } from '../../utils/location';
import { Button } from './ui/button';

interface OnboardingFlowProps {
  overridePlanId?:
    | 'free'
    | 'lunary_plus'
    | 'lunary_plus_ai'
    | 'lunary_plus_ai_annual';
  forceOpen?: boolean;
  simulateSubscribed?: boolean;
  previewMode?: boolean;
  previewHeader?: ReactNode;
  previewStep?: 'welcome' | 'birthday' | 'complete';
}

type LocationSuggestion = {
  label: string;
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
};

export function OnboardingFlow({
  overridePlanId,
  forceOpen = false,
  simulateSubscribed = false,
  previewMode = false,
  previewHeader,
  previewStep,
}: OnboardingFlowProps = {}) {
  const { user, refetch, loading: userLoading } = useUser();
  const authState = useAuthStatus();
  const subscription = useSubscription();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    'welcome' | 'birthday' | 'complete'
  >('welcome');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [birthday, setBirthday] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [isLoadingLocationSuggestions, setIsLoadingLocationSuggestions] =
    useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestionError, setLocationSuggestionError] = useState<
    string | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [showBirthChartConfirmation, setShowBirthChartConfirmation] =
    useState(false);
  const [prefillLoaded, setPrefillLoaded] = useState(false);
  const [autoSavePrefill, setAutoSavePrefill] = useState(false);
  const [expandedHighlights, setExpandedHighlights] = useState<string | null>(
    null,
  );
  const [skipOrigin, setSkipOrigin] = useState<'modal' | 'step' | null>(null);
  const [pendingSkipStep, setPendingSkipStep] = useState<
    'welcome' | 'birthday' | 'complete' | null
  >(null);
  const locationSuggestionsAbortRef = useRef<AbortController | null>(null);
  const lastLocationQueryRef = useRef<string | null>(null);
  const locationSuggestionBlurTimeoutRef = useRef<number | null>(null);
  const lastLocationSelectionRef = useRef<string | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState({
    loading: true,
    completed: false,
  });
  const subscriptionActive = previewMode
    ? false
    : subscription.isSubscribed || subscription.isTrialActive;
  const isSubscribedOrTrial = simulateSubscribed || subscriptionActive;
  const normalizedPlan =
    overridePlanId || normalizePlanType(subscription.planName || 'free');
  const activePlan =
    PRICING_PLANS.find((plan) => plan.id === normalizedPlan) ||
    PRICING_PLANS[0];
  const stepOrder: Array<'welcome' | 'birthday' | 'complete'> = [
    'welcome',
    'birthday',
    'complete',
  ];
  const moonPhases = [
    {
      label: 'New Moon',
      src: '/icons/moon-phases/new-moon.svg',
    },
    {
      label: 'Half Moon',
      src: '/icons/moon-phases/first-quarter.svg',
    },
    {
      label: 'Full Moon',
      src: '/icons/moon-phases/full-moon.svg',
    },
  ];
  const basePlanHighlights = [
    'Complete birth chart analysis + personal transits',
    'Personalized daily horoscopes and tarot guidance',
    'Moon Circles for new + full moons',
    'Ritual generator, collections, and monthly insights',
    'Personalized crystal recommendations + cosmic state',
  ];

  const planHighlights = (() => {
    if (!isSubscribedOrTrial) {
      return [
        {
          title: 'Included with your account',
          items: [
            'Your personal birth chart overview and key placements',
            'Daily moon phase insights + general horoscope',
            'Tarot card of the day + basic lunar calendar',
            'Grimoire library for astrology, tarot, and rituals',
            'Weekly AI ritual or reading to get started',
          ],
        },
      ];
    }

    if (normalizedPlan === 'lunary_plus') {
      return [{ title: 'Lunary+ includes', items: basePlanHighlights }];
    }

    if (normalizedPlan === 'lunary_plus_ai') {
      return [
        { title: 'Everything in Lunary+', items: basePlanHighlights },
        {
          title: 'Plus Pro Features',
          items: [
            'Up to 300 messages/day with the Astral Guide chat',
            'Personalized weekly reports + deeper readings',
            'Advanced pattern analysis + downloadable PDFs',
            'Astral Guide ritual generation + extended context memory',
            'Collections & saved insights',
          ],
        },
      ];
    }

    return [
      { title: 'Everything in Lunary+', items: basePlanHighlights },
      {
        title: 'Everything in Lunary+ Pro',
        items: [
          'Up to 300 messages/day with the Astral Guide chat',
          'Personalized weekly reports + deeper readings',
          'Advanced pattern analysis + downloadable PDFs',
          'Astral Guide ritual generation + extended context memory',
        ],
      },
      {
        title: 'Annual extras',
        items: [
          'Unlimited tarot spreads + annual deep dives',
          'Yearly forecast + extended timeline analysis',
          'Calendar download (ICS format)',
          'Priority support + premium annual benefits',
        ],
      },
    ];
  })();

  useEffect(() => {
    // Skip onboarding in demo mode
    const isDemoMode =
      typeof window !== 'undefined' && (window as any).__LUNARY_DEMO_MODE__;

    if (!authState.isAuthenticated || !user?.id || previewMode || isDemoMode) {
      setOnboardingStatus({ loading: false, completed: true });
      return;
    }

    if (user?.birthday) {
      setOnboardingStatus({ loading: false, completed: true });
      return;
    }

    let cancelled = false;

    const fetchOnboardingStatus = async () => {
      try {
        setOnboardingStatus((prev) => ({ ...prev, loading: true }));
        const response = await fetch('/api/onboarding/complete', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to load onboarding status');
        }

        const data = await response.json();
        if (!cancelled) {
          setOnboardingStatus({
            loading: false,
            completed: !!data.completed || !!data.skipped,
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('[Onboarding] Failed to load status:', error);
          setOnboardingStatus({ loading: false, completed: false });
        }
      }
    };

    fetchOnboardingStatus();

    return () => {
      cancelled = true;
    };
  }, [authState.isAuthenticated, user?.id, user?.birthday, previewMode]);

  useEffect(() => {
    const needsBirthDetails = !user?.birthday;
    const isDemoMode =
      typeof window !== 'undefined' && (window as any).__LUNARY_DEMO_MODE__;

    // Never show onboarding in demo mode
    if (isDemoMode && !forceOpen) {
      setShowOnboarding(false);
      return;
    }

    if (forceOpen && previewMode) {
      setShowOnboarding(true);
      return;
    }

    if (forceOpen && !authState.loading && authState.isAuthenticated) {
      setShowOnboarding(true);
      return;
    }

    if (
      authState.isAuthenticated &&
      !authState.loading &&
      !userLoading &&
      !onboardingStatus.loading &&
      needsBirthDetails &&
      !onboardingStatus.completed
    ) {
      setShowOnboarding(true);
      return;
    }

    setShowOnboarding(false);
  }, [
    authState.isAuthenticated,
    authState.loading,
    onboardingStatus.completed,
    onboardingStatus.loading,
    user?.birthday,
    userLoading,
    forceOpen,
    previewMode,
    previewStep,
  ]);

  const resolveOnboarding = () => {
    setOnboardingStatus({ loading: false, completed: true });
    setShowOnboarding(false);
  };

  useEffect(() => {
    if (previewMode && previewStep) {
      setCurrentStep(previewStep);
    }
  }, [previewMode, previewStep]);

  useEffect(() => {
    if (!showOnboarding || prefillLoaded || previewMode) {
      return;
    }

    const prefill = getOnboardingPrefill();
    if (prefill) {
      if (prefill.birthday) {
        setBirthday(prefill.birthday);
      }
      if (prefill.birthTime) {
        setBirthTime(prefill.birthTime);
      }
      if (prefill.birthLocation) {
        setBirthLocation(prefill.birthLocation);
      }
      if (prefill.birthTime || prefill.birthLocation) {
        setShowOptionalDetails(true);
      }
      if (prefill.autoAdvance && prefill.birthday) {
        setCurrentStep('birthday');
        setAutoSavePrefill(true);
      }
      clearOnboardingPrefill();
    }
    setPrefillLoaded(true);
  }, [showOnboarding, prefillLoaded, previewMode]);

  const cancelLocationSuggestionBlur = useCallback(() => {
    if (locationSuggestionBlurTimeoutRef.current !== null) {
      window.clearTimeout(locationSuggestionBlurTimeoutRef.current);
      locationSuggestionBlurTimeoutRef.current = null;
    }
  }, []);

  const scheduleCloseLocationSuggestions = useCallback(() => {
    cancelLocationSuggestionBlur();
    locationSuggestionBlurTimeoutRef.current = window.setTimeout(() => {
      setShowLocationSuggestions(false);
    }, 150);
  }, [cancelLocationSuggestionBlur]);

  const handleLocationSuggestionSelect = useCallback(
    (suggestion: LocationSuggestion) => {
      cancelLocationSuggestionBlur();
      setBirthLocation(suggestion.label);
      lastLocationQueryRef.current = suggestion.label;
      lastLocationSelectionRef.current = suggestion.label;
      setShowLocationSuggestions(false);
      setLocationSuggestions([]);
    },
    [cancelLocationSuggestionBlur],
  );

  useEffect(() => {
    if (!showOptionalDetails) {
      setShowLocationSuggestions(false);
      setLocationSuggestions([]);
      setLocationSuggestionError(null);
      return;
    }

    const query = birthLocation.trim();
    if (
      query.length < 3 ||
      parseCoordinates(query) ||
      query === lastLocationSelectionRef.current
    ) {
      setShowLocationSuggestions(false);
      setLocationSuggestions([]);
      setLocationSuggestionError(null);
      return;
    }

    if (lastLocationQueryRef.current === query && locationSuggestions.length) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      if (locationSuggestionsAbortRef.current) {
        locationSuggestionsAbortRef.current.abort();
      }
      const controller = new AbortController();
      locationSuggestionsAbortRef.current = controller;
      lastLocationQueryRef.current = query;

      setIsLoadingLocationSuggestions(true);
      setLocationSuggestionError(null);

      try {
        const response = await fetch(
          `/api/location/suggest?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error('Location suggestions unavailable');
        }

        const data = (await response.json()) as {
          results?: LocationSuggestion[];
        };

        const results = Array.isArray(data.results) ? data.results : [];
        setLocationSuggestions(results);
        setShowLocationSuggestions(true);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setLocationSuggestionError('Could not load suggestions');
          setLocationSuggestions([]);
          setShowLocationSuggestions(true);
        }
      } finally {
        setIsLoadingLocationSuggestions(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [birthLocation, locationSuggestions.length, showOptionalDetails]);

  const handleSaveBirthday = useCallback(async () => {
    if (!birthday) return;

    setSaving(true);
    try {
      if (previewMode) {
        setCurrentStep('complete');
        return;
      }
      const existingLocation = (user as any)?.location || {};
      const locationPayload =
        birthTime || birthLocation
          ? {
              ...existingLocation,
              ...(birthTime ? { birthTime } : {}),
              ...(birthLocation ? { birthLocation } : {}),
            }
          : undefined;

      // Save to Postgres
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ birthday, location: locationPayload }),
      });

      // Track birth data submission
      if (user?.id) {
        conversionTracking.birthDataSubmitted(user.id);
      }

      // Generate birth chart immediately after birthday is saved
      try {
        const { birthChart, timezone, timezoneSource } =
          await createBirthChartWithMetadata({
            birthDate: birthday,
            birthTime: birthTime || undefined,
            birthLocation: birthLocation || undefined,
            fallbackTimezone:
              Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
          });
        if (birthChart) {
          await fetch('/api/profile/birth-chart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ birthChart }),
          });
          if (
            birthLocation &&
            timezoneSource === 'location' &&
            timezone &&
            timezone !== existingLocation?.birthTimezone
          ) {
            await fetch('/api/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                location: {
                  ...existingLocation,
                  ...(birthTime ? { birthTime } : {}),
                  birthLocation,
                  birthTimezone: timezone,
                },
              }),
            });
          }
          console.log('✅ Birth chart generated and saved to Postgres');
        }
      } catch (chartError) {
        console.error('Failed to generate birth chart:', chartError);
      }

      // Sync birthday to push subscription for server-side notifications
      try {
        await fetch('/api/notifications/sync-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            birthday,
            name: authState.user?.name || null,
            email: authState.user?.email || null,
          }),
        });
        console.log('✅ Birthday synced to push subscription');
      } catch (syncError) {
        console.error(
          'Failed to sync birthday to push subscription:',
          syncError,
        );
      }

      // Refresh user data in context so widgets update immediately
      await refetch();
      setShowBirthChartConfirmation(true);

      setCurrentStep('complete');
    } catch (error) {
      console.error('Failed to save birthday:', error);
      alert('Failed to save birthday. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [
    authState.user?.email,
    authState.user?.name,
    birthday,
    birthLocation,
    birthTime,
    previewMode,
    refetch,
    user,
  ]);

  useEffect(() => {
    if (!autoSavePrefill || currentStep !== 'birthday' || saving) {
      return;
    }
    if (!birthday) {
      setAutoSavePrefill(false);
      return;
    }
    void handleSaveBirthday();
    setAutoSavePrefill(false);
  }, [autoSavePrefill, birthday, currentStep, handleSaveBirthday, saving]);

  useEffect(() => {
    if (currentStep !== 'complete') {
      setShowBirthChartConfirmation(false);
    }
  }, [currentStep]);

  const trackStepCompletion = async (
    step: string,
    skipped: boolean = false,
  ) => {
    try {
      if (previewMode) {
        return;
      }
      const newCompletedSteps = [...completedSteps, step];
      setCompletedSteps(newCompletedSteps);

      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          stepsCompleted: newCompletedSteps,
          skipped,
        }),
      });
    } catch (error) {
      console.error('[Onboarding] Failed to track completion:', error);
    }
  };

  const handleSkip = () => {
    setSkipOrigin('modal');
    setPendingSkipStep(null);
    setShowSkipWarning(true);
  };

  const cancelSkip = () => {
    setShowSkipWarning(false);
    setSkipOrigin(null);
    setPendingSkipStep(null);
  };

  const skipStep = async (step: 'welcome' | 'birthday' | 'complete') => {
    await trackStepCompletion(step, true);
    if (step === 'welcome') {
      setCurrentStep('birthday');
      return;
    }
    if (step === 'birthday') {
      setCurrentStep('complete');
      return;
    }
    handleComplete();
  };

  const handleConfirmSkip = async (redirectPath?: string) => {
    if (skipOrigin === 'step' && pendingSkipStep) {
      await skipStep(pendingSkipStep);
      setPendingSkipStep(null);
      setSkipOrigin(null);
      setShowSkipWarning(false);
      if (redirectPath && !previewMode) {
        router.push(redirectPath);
      }
      return;
    }

    await trackStepCompletion('complete', true);
    resolveOnboarding();
    setShowSkipWarning(false);
    setCurrentStep('complete');
    setSkipOrigin(null);
    if (redirectPath && !previewMode) {
      router.push(redirectPath);
    }
  };

  const handleStepSkip = () => {
    setSkipOrigin('step');
    setPendingSkipStep(currentStep);
    setShowSkipWarning(true);
  };

  const handleComplete = async () => {
    await trackStepCompletion(currentStep, false);
    resolveOnboarding();
    if (!previewMode) {
      // User already has subscription, send them to personalized content
      router.push('/app');
    }
  };

  if (!showOnboarding) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4'>
      <div className='relative bg-zinc-900 border border-zinc-700 rounded-lg p-6 md:p-8 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto'>
        <button
          onClick={handleSkip}
          className='absolute top-4 right-4 min-h-[48px] min-w-[48px] flex items-center justify-center text-zinc-400 hover:text-white transition-colors'
          aria-label='Skip onboarding'
        >
          <X className='w-5 h-5' />
        </button>

        {showSkipWarning && (
          <div className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/70 py-4 px-6'>
            <div className='w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-left shadow-lg'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <h3 className='text-sm font-semibold text-white mb-2'>
                    Skip setup?
                  </h3>
                  <p className='text-xs text-zinc-300'>
                    Personalised insights and your birth chart won&apos;t be
                    available until you add your birthday in your profile.
                  </p>
                </div>
                <button
                  onClick={cancelSkip}
                  className='text-zinc-400 hover:text-white'
                  aria-label='Cancel'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>

              <div className='mt-4 flex flex-col gap-3 py-3'>
                <Button
                  onClick={cancelSkip}
                  variant='lunary-soft'
                  className='w-full'
                >
                  Continue
                </Button>
                <Button
                  onClick={() => handleConfirmSkip('/profile')}
                  variant='lunary'
                  className='w-full'
                >
                  Go to profile
                </Button>
                <Button
                  onClick={() => handleConfirmSkip()}
                  variant='ghost'
                  className='w-full'
                >
                  Skip for now
                </Button>
              </div>
            </div>
          </div>
        )}

        {previewHeader && (
          <div className='mb-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3'>
            {previewHeader}
          </div>
        )}

        <div className='mb-6 flex items-center justify-center gap-2'>
          {stepOrder.map((step, index) => {
            const phase = moonPhases[index];
            const isActive = step === currentStep;
            return (
              <div
                key={step}
                className={`flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/60 ${isActive ? 'ring-2 ring-lunary-primary-500' : ''}`}
                aria-label={phase.label}
                title={phase.label}
              >
                <img
                  src={phase.src}
                  alt={phase.label}
                  width={16}
                  height={16}
                  className='h-4 w-4 object-contain'
                  loading='lazy'
                  decoding='async'
                />
              </div>
            );
          })}
        </div>

        {currentStep === 'welcome' && (
          <div className='space-y-6'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-16 h-16 mb-2'>
                <img
                  src='/icons/moon-phases/full-moon.svg'
                  alt='Full Moon'
                  width={64}
                  height={64}
                  className='h-16 w-16 object-contain'
                  loading='eager'
                  decoding='async'
                />
              </div>
              <h2 className='text-base font-semibold text-white mb-2 md:text-lg'>
                Welcome to Lunary
              </h2>
              <p className='text-sm text-zinc-300'>
                We&apos;ll build your birth chart and tailor your daily guidance
                in just a moment.
              </p>
            </div>

            <div className='space-y-4'>
              <div className='p-4 bg-gradient-to-br from-lunary-primary-900/20 to-lunary-highlight-900/20 rounded-lg border border-lunary-primary-800'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-sm font-semibold text-white flex items-center gap-2'>
                    <Sparkles className='w-4 h-4 text-lunary-accent-300' />
                    {isSubscribedOrTrial
                      ? `You’ve got ${activePlan.name}`
                      : 'What’s waiting for you'}
                  </h3>
                  {isSubscribedOrTrial && (
                    <span className='text-[10px] uppercase tracking-wide text-lunary-accent-200/80'>
                      Premium features included
                    </span>
                  )}
                </div>
                <p className='text-xs text-zinc-300 mb-3'>
                  {isSubscribedOrTrial
                    ? 'Thanks for joining. Here’s everything now available in your plan.'
                    : 'Here’s what you can explore right away with a free account.'}
                </p>
                <div className='space-y-3 text-xs text-zinc-300'>
                  {planHighlights.map((section) => {
                    const isExpanded = expandedHighlights === section.title;
                    const visibleItems = isExpanded
                      ? section.items
                      : section.items.slice(0, 1);

                    return (
                      <div key={section.title} className='space-y-2'>
                        <div className='text-[11px] font-semibold uppercase tracking-wide text-zinc-400 flex items-center justify-between'>
                          {section.title}
                          {section.items.length > 1 && (
                            <button
                              type='button'
                              onClick={() =>
                                setExpandedHighlights((prev) =>
                                  prev === section.title ? null : section.title,
                                )
                              }
                              className='inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-lunary-accent-200/80 hover:text-lunary-accent-100 transition-colors'
                            >
                              {isExpanded ? 'Show fewer' : 'View all'}
                              <ChevronDown
                                className={`h-3 w-3 text-current transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>
                        <ul className='space-y-2'>
                          {visibleItems.map((feature) => (
                            <li
                              key={feature}
                              className='flex items-start gap-2'
                            >
                              <span className='text-lunary-accent-300 mt-0.5'>
                                •
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className='pt-4'>
              <Button
                onClick={() => setCurrentStep('birthday')}
                variant='lunary-soft'
                className='w-full'
              >
                Get Started
              </Button>
              <Button
                onClick={handleSkip}
                variant='ghost'
                className='w-full mt-3'
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'birthday' && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h2 className='text-base font-semibold text-white mb-2 md:text-lg'>
                When Were You Born?
              </h2>
              <p className='text-zinc-300 text-sm'>
                Your birthday lets us calculate your birth chart and personalise
                your daily guidance.
              </p>
            </div>

            <div className='space-y-4'>
              <div className='grid gap-3'>
                <div className='flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3'>
                  <div className='flex-shrink-0 w-9 h-9 rounded-full bg-lunary-primary-900 flex items-center justify-center'>
                    <Calendar className='w-4 h-4 text-lunary-accent-300' />
                  </div>
                  <div>
                    <h3 className='text-xs font-semibold text-white mb-1'>
                      Your Birth Chart
                    </h3>
                    <p className='text-xs text-zinc-400'>
                      Discover your unique planetary positions and cosmic
                      blueprint.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3'>
                  <div className='flex-shrink-0 w-9 h-9 rounded-full bg-lunary-primary-900 flex items-center justify-center'>
                    <Star className='w-4 h-4 text-lunary-accent-300' />
                  </div>
                  <div>
                    <h3 className='text-xs font-semibold text-white mb-1'>
                      Daily Guidance
                    </h3>
                    <p className='text-xs text-zinc-400'>
                      Insights aligned to your chart and today&apos;s sky.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3'>
                  <div className='flex-shrink-0 w-9 h-9 rounded-full bg-lunary-primary-900 flex items-center justify-center'>
                    <NotebookPen className='w-4 h-4 text-lunary-accent-300' />
                  </div>
                  <div>
                    <h3 className='text-xs font-semibold text-white mb-1'>
                      Tarot + Rituals
                    </h3>
                    <p className='text-xs text-zinc-400'>
                      Daily tarot guidance and ritual prompts to reflect.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-zinc-300 mb-2'>
                  Birthday (recommended)
                </label>
                <BirthdayInput value={birthday} onChange={setBirthday} />
              </div>

              <button
                type='button'
                onClick={() => setShowOptionalDetails((prev) => !prev)}
                className='flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/40 px-4 py-3 text-xs text-zinc-300 transition hover:border-zinc-600'
              >
                <span>
                  Optional: add birth time &amp; location for accuracy
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-400 transition-transform ${showOptionalDetails ? 'rotate-180' : ''}`}
                />
              </button>

              {showOptionalDetails && (
                <div className='space-y-4 rounded-lg border border-zinc-700 bg-zinc-900/40 p-4'>
                  <div>
                    <label className='block text-sm font-medium text-zinc-300 mb-2'>
                      Birth Time (optional)
                    </label>
                    <input
                      type='time'
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lunary-primary'
                    />
                    <p className='text-xs text-zinc-400 mt-1'>
                      More precise time = more accurate chart
                    </p>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-zinc-300 mb-2'>
                      Birth Location (optional)
                    </label>
                    <div className='relative'>
                      <input
                        type='text'
                        value={birthLocation}
                        onChange={(e) => {
                          setBirthLocation(e.target.value);
                          setLocationSuggestionError(null);
                          lastLocationQueryRef.current = null;
                          lastLocationSelectionRef.current = null;
                        }}
                        onFocus={cancelLocationSuggestionBlur}
                        onBlur={scheduleCloseLocationSuggestions}
                        placeholder='City, Country or coordinates'
                        className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
                      />
                      {showLocationSuggestions && (
                        <div className='absolute z-20 mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl'>
                          {isLoadingLocationSuggestions ? (
                            <div className='px-4 py-3 text-xs text-zinc-400'>
                              Loading suggestions...
                            </div>
                          ) : locationSuggestionError ? (
                            <div className='px-4 py-3 text-xs text-zinc-400'>
                              {locationSuggestionError}
                            </div>
                          ) : locationSuggestions.length === 0 ? (
                            <div className='px-4 py-3 text-xs text-zinc-400'>
                              No matches found. Try adding a country or use
                              coordinates.
                            </div>
                          ) : (
                            <ul className='max-h-56 overflow-y-auto py-1 text-sm text-zinc-200'>
                              {locationSuggestions.map((suggestion) => (
                                <li key={suggestion.label}>
                                  <button
                                    type='button'
                                    onMouseDown={(event) =>
                                      event.preventDefault()
                                    }
                                    onClick={() =>
                                      handleLocationSuggestionSelect(suggestion)
                                    }
                                    className='w-full px-4 py-2 text-left hover:bg-zinc-800/70 transition-colors'
                                  >
                                    {suggestion.label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <p className='text-xs text-zinc-400'>
                We use this to calculate your birth chart and planetary
                positions. Birth time and location can improve accuracy.
              </p>
            </div>

            <div className='pt-4 space-y-3'>
              <Button
                onClick={handleSaveBirthday}
                disabled={!birthday || saving}
                variant='lunary-soft'
                className='w-full'
              >
                {saving ? 'Saving...' : 'Continue'}
              </Button>
              <div className='flex items-center justify-between'>
                <Button
                  onClick={() => setCurrentStep('welcome')}
                  variant='ghost'
                >
                  Back
                </Button>
                <Button onClick={handleStepSkip} variant='ghost'>
                  Skip
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className='space-y-6 text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 mb-4'>
              <img
                src='/icons/moon-phases/full-moon.svg'
                alt='Full Moon'
                width={64}
                height={64}
                className='h-16 w-16 object-contain'
                loading='eager'
                decoding='async'
              />
            </div>
            <h2 className='text-base font-semibold text-white mb-2 md:text-lg'>
              Where would you like to go?
            </h2>
            <p className='text-zinc-300 mb-6 text-sm'>
              Jump into your daily overview or explore a specific area.
            </p>

            <div className='grid gap-3 text-left sm:grid-cols-2'>
              <Link
                href='/app'
                onClick={handleComplete}
                className='rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white transition hover:border-lunary-primary-700'
              >
                Daily overview
              </Link>
              <Link
                href='/tarot'
                onClick={handleComplete}
                className='rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white transition hover:border-lunary-primary-700'
              >
                Tarot
              </Link>
              <Link
                href='/horoscope'
                onClick={handleComplete}
                className='rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white transition hover:border-lunary-primary-700'
              >
                Horoscope
              </Link>
              <Link
                href='/profile'
                onClick={handleComplete}
                className='rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white transition hover:border-lunary-primary-700'
              >
                Profile
              </Link>
              <Link
                href='/birth-chart'
                onClick={handleComplete}
                className='rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white transition hover:border-lunary-primary-700'
              >
                Birth chart
              </Link>
              <Link
                href='/grimoire'
                onClick={handleComplete}
                className='rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white transition hover:border-lunary-primary-700'
              >
                Grimoire
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
