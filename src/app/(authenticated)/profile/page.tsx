'use client';

import { useUser } from '@/context/UserContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useSubscription } from '../../../hooks/useSubscription';
import {
  canCollectBirthday,
  hasBirthChartAccess,
} from '../../../../utils/pricing';
import { betterAuthClient } from '@/lib/auth-client';
import { useAuthStatus } from '@/components/AuthStatus';
import { useIsNativeIOS } from '@/hooks/useNativePlatform';
import { conversionTracking } from '@/lib/analytics';
import { BirthdayInput } from '@/components/ui/birthday-input';
import { geocodeLocation, parseCoordinates } from '../../../../utils/location';
import { useModal } from '@/hooks/useModal';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/button';
import { formatIsoDateOnly } from '@/lib/date-only';
import { DailyCache } from '@/lib/cache/dailyCache';
import { ClientCache } from '@/lib/patterns/snapshot/cache';

// Profile components
import { ProfileTabs, type ProfileTab } from '@/components/profile/ProfileTabs';
import { CosmicProfileGrid } from '@/components/profile/CosmicProfileGrid';
import { PersonalCardModal } from '@/components/profile/PersonalCardModal';
import { JourneySection } from '@/components/profile/JourneySection';
import { SettingsTab } from '@/components/profile/SettingsTab';
import { CircleTab } from '@/components/profile/CircleTab';

const AuthComponent = dynamic(
  () => import('@/components/Auth').then((m) => ({ default: m.AuthComponent })),
  {
    loading: () => (
      <div className='h-48 bg-surface-card animate-pulse rounded-lg' />
    ),
  },
);

const SmartTrialButton = dynamic(
  () =>
    import('@/components/SmartTrialButton').then((m) => ({
      default: m.SmartTrialButton,
    })),
  { ssr: false },
);

const GuideNudge = dynamic(
  () =>
    import('@/components/GuideNudge').then((m) => ({
      default: m.GuideNudge,
    })),
  { ssr: false },
);

const LifeThemesCard = dynamic(
  () =>
    import('@/components/profile/LifeThemesCard').then((m) => ({
      default: m.LifeThemesCard,
    })),
  { ssr: false },
);

const DailyCosmicOverview = dynamic(
  () =>
    import('@/components/profile/DailyCosmicOverview').then((m) => ({
      default: m.DailyCosmicOverview,
    })),
  { ssr: false },
);

const normalizeProfileTab = (tab: string | null): ProfileTab => {
  if (tab === 'settings') return 'settings';
  if (tab === 'circle') return 'circle';
  return 'profile';
};

export default function ProfilePage() {
  const { user, refetch: refetchUser } = useUser();
  const subscription = useSubscription();
  const authState = useAuthStatus();
  const router = useRouter();
  const isNativeIOS = useIsNativeIOS();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab');

  // Form state
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');

  // Location suggestions state
  const [locationSuggestions, setLocationSuggestions] = useState<
    Array<{
      label: string;
      latitude: number;
      longitude: number;
    }>
  >([]);
  const [isLoadingLocationSuggestions, setIsLoadingLocationSuggestions] =
    useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestionError, setLocationSuggestionError] = useState<
    string | null
  >(null);
  const [showBirthLocationHint, setShowBirthLocationHint] = useState(false);
  const [isCheckingBirthLocation, setIsCheckingBirthLocation] = useState(false);
  const [showBirthChartConfirmation, setShowBirthChartConfirmation] =
    useState(false);

  // Refs for location handling
  const lastBirthLocationCheck = useRef<string | null>(null);
  const locationSuggestionsAbortRef = useRef<AbortController | null>(null);
  const lastLocationQueryRef = useRef<string | null>(null);
  const locationSuggestionBlurTimeoutRef = useRef<number | null>(null);
  const lastLocationSelectionRef = useRef<string | null>(null);
  const birthChartConfirmationTimeoutRef = useRef<number | null>(null);

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');
  const [activeTab, setActiveTab] = useState<ProfileTab>(() =>
    normalizeProfileTab(queryTab),
  );
  const [showPersonalCardModal, setShowPersonalCardModal] = useState(false);

  // Sync tab state with URL
  useEffect(() => {
    if (!queryTab) return;
    setActiveTab((current) => {
      const requested = normalizeProfileTab(queryTab);
      return current === requested ? current : requested;
    });
  }, [queryTab]);

  const handleTabChange = useCallback(
    (tab: ProfileTab) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'profile') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const queryString = params.toString();
      router.replace(`/profile${queryString ? `?${queryString}` : ''}`, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  // Computed values
  const canCollectBirthdayData = canCollectBirthday(subscription.status);
  const hasBirthChartAccessData = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );
  const canEditProfile = authState.isAuthenticated && canCollectBirthdayData;

  // Auth loading effect
  useEffect(() => {
    if (!authState.loading) {
      setIsLoading(false);
    }
  }, [authState.loading]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (birthChartConfirmationTimeoutRef.current) {
        window.clearTimeout(birthChartConfirmationTimeoutRef.current);
      }
    };
  }, []);

  // ESC key handler for auth modal
  useModal({
    isOpen: showAuthModal,
    onClose: () => setShowAuthModal(false),
    closeOnClickOutside: false,
  });

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
    (suggestion: { label: string }) => {
      cancelLocationSuggestionBlur();
      setBirthLocation(suggestion.label);
      lastLocationQueryRef.current = suggestion.label;
      lastLocationSelectionRef.current = suggestion.label;
      setShowLocationSuggestions(false);
      setLocationSuggestions([]);
      setShowBirthLocationHint(false);
    },
    [cancelLocationSuggestionBlur],
  );

  // Load existing profile data
  useEffect(() => {
    if (user) {
      try {
        const profileName = user.name || '';
        const profileBirthday = user.birthday || '';
        const location = (user as any)?.location || {};
        const profileBirthTime = location?.birthTime || '';
        const profileBirthLocation = location?.birthLocation || '';

        setName(profileName);
        setBirthday(profileBirthday);
        setBirthTime(profileBirthTime);
        setBirthLocation(profileBirthLocation);
        setIsEditing(!profileName && !profileBirthday);

        // Auto-generate birth chart if missing (server-side)
        if (profileBirthday && !user.hasBirthChart) {
          (async () => {
            const response = await fetch('/api/profile/birth-chart/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                birthDate: profileBirthday,
                birthTime: profileBirthTime || undefined,
                birthLocation: profileBirthLocation || undefined,
                fallbackTimezone:
                  Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
              }),
            });

            if (response.ok) {
              DailyCache.clear();
              if (user?.id) ClientCache.clearAll(user.id);
            }
            await refetchUser(true);
          })();
        }

        setIsLoading(false);
      } catch (error) {
        console.log('Error loading profile:', error);
        setIsLoading(false);
        setIsEditing(true);
      }
    } else {
      setIsLoading(false);
      setIsEditing(false);
    }
  }, [user]);

  // Location suggestions effect
  useEffect(() => {
    if (!isEditing) {
      setShowLocationSuggestions(false);
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

        const data = await response.json();
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
  }, [birthLocation, isEditing, locationSuggestions.length]);

  useEffect(() => {
    if (!canEditProfile && isEditing) {
      setIsEditing(false);
    }
  }, [canEditProfile, isEditing]);

  const handleSave = async () => {
    try {
      const trimmedBirthLocation = birthLocation.trim();
      if (trimmedBirthLocation) {
        if (lastBirthLocationCheck.current !== trimmedBirthLocation) {
          setIsCheckingBirthLocation(true);
          lastBirthLocationCheck.current = trimmedBirthLocation;
          const coords = await geocodeLocation(trimmedBirthLocation);
          setShowBirthLocationHint(!coords);
          setIsCheckingBirthLocation(false);
          if (!coords) return;
        } else if (showBirthLocationHint) {
          return;
        }
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

      const profileResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, birthday, location: locationPayload }),
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to save profile');
      }

      if (birthday) {
        const hasExistingChart = user?.hasBirthChart || false;
        const hasExistingPersonalCard = user?.personalCard ? true : false;
        const userLocation = (user as any)?.location || {};
        const shouldRegenerateChart =
          !hasExistingChart ||
          (birthTime && birthTime !== userLocation?.birthTime) ||
          (birthLocation && birthLocation !== userLocation?.birthLocation);

        if (shouldRegenerateChart) {
          const generateResponse = await fetch(
            '/api/profile/birth-chart/generate',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                birthDate: birthday,
                birthTime: birthTime || undefined,
                birthLocation: birthLocation || undefined,
                fallbackTimezone:
                  Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
              }),
            },
          );

          if (generateResponse.ok) {
            // Clear all client-side caches so stale horoscopes/insights aren't displayed
            DailyCache.clear();
            if (user?.id) ClientCache.clearAll(user.id);
          }
        }

        if (!hasExistingPersonalCard) {
          const { calculatePersonalCard } =
            await import('../../../../utils/tarot/personalCard');
          const personalCard = calculatePersonalCard(birthday, name);

          await fetch('/api/profile/personal-card', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ personalCard }),
          });
        }
      }

      await refetchUser(true);
      setIsEditing(false);

      if (birthday) {
        setShowBirthChartConfirmation(true);
        if (birthChartConfirmationTimeoutRef.current) {
          window.clearTimeout(birthChartConfirmationTimeoutRef.current);
        }
        birthChartConfirmationTimeoutRef.current = window.setTimeout(() => {
          setShowBirthChartConfirmation(false);
        }, 20000);
        conversionTracking.birthdayEntered(authState.user?.id);
      }
      if (name && birthday) {
        conversionTracking.profileCompleted(authState.user?.id);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(';').forEach((c) => {
        const cookieName = c.split('=')[0].trim();
        if (cookieName) {
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
      await betterAuthClient.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
      window.location.href = '/';
    }
  };

  // Display values
  const nameDisplay = canCollectBirthdayData
    ? name || 'Add your name'
    : authState.isAuthenticated
      ? name || 'Locked until upgrade'
      : 'Sign in to personalise';

  const nameLabel = name ? 'Preferred Name' : 'Name';
  const isNamePlaceholder = !name;

  const birthdayDisplay = birthday
    ? formatIsoDateOnly(birthday)
    : canCollectBirthdayData
      ? 'Add your birthday'
      : authState.isAuthenticated
        ? 'Premium feature'
        : 'Sign in to personalise';

  const birthdayLabel = birthday ? 'Birthdate' : 'DOB';
  const isBirthdayPlaceholder = !birthday;

  if (authState.loading || isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lunary-primary'></div>
        <p className='text-content-muted'>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div
      className='flex flex-col items-center gap-6 p-4'
      data-testid='profile-page'
    >
      <div className='flex items-center justify-between w-full max-w-3xl'>
        <Heading as='h1' variant='h1' className='text-center md:text-left'>
          Your Profile
        </Heading>
      </div>

      {/* Tab Navigation */}
      {authState.isAuthenticated && (
        <div data-testid='profile-tabs'>
          <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      )}

      {/* Profile Tab Content */}
      {(activeTab === 'profile' || !authState.isAuthenticated) && (
        <>
          {/* Profile Header Card */}
          <div className='w-full max-w-3xl'>
            <div className='rounded-xl border border-stroke-default/70 bg-surface-base/90 p-4 shadow-lg sm:p-5'>
              <div className='space-y-4'>
                {canEditProfile && isEditing ? (
                  <div className='space-y-4'>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-2'>
                        <label className='text-xs font-semibold uppercase tracking-wide text-content-muted'>
                          Name
                          <span className='ml-2 text-[10px] font-normal text-lunary-accent'>
                            ✨ Personalised Feature
                          </span>
                        </label>
                        <input
                          type='text'
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className='w-full rounded-md border border-stroke-strong bg-surface-overlay px-3 py-2 text-sm text-content-primary placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
                          placeholder='Enter your name'
                        />
                      </div>
                      <div className='space-y-2'>
                        <label className='text-xs font-semibold uppercase tracking-wide text-content-muted'>
                          Birthday *
                          <span className='ml-2 text-[10px] font-normal text-lunary-accent'>
                            ✨ Personalised Feature
                          </span>
                        </label>
                        <BirthdayInput
                          value={birthday}
                          onChange={setBirthday}
                          className='rounded-md border-stroke-strong bg-surface-overlay px-3 py-2 text-sm'
                        />
                      </div>
                    </div>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-2'>
                        <label className='text-xs font-semibold uppercase tracking-wide text-content-muted'>
                          Birth Time (optional)
                          <span className='ml-2 text-[10px] font-normal text-content-muted'>
                            More precise = more accurate
                          </span>
                        </label>
                        <input
                          type='time'
                          value={birthTime}
                          onChange={(e) => setBirthTime(e.target.value)}
                          className='w-full rounded-md border border-stroke-strong bg-surface-overlay px-3 py-2 text-sm text-content-primary placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
                        />
                      </div>
                      <div className='space-y-2'>
                        <label className='text-xs font-semibold uppercase tracking-wide text-content-muted'>
                          Birth Location (optional)
                          <span className='ml-2 text-[10px] font-normal text-content-muted'>
                            City, Country or coordinates
                          </span>
                        </label>
                        <div className='relative'>
                          <input
                            type='text'
                            value={birthLocation}
                            onChange={(e) => {
                              setBirthLocation(e.target.value);
                              setShowBirthLocationHint(false);
                              setLocationSuggestionError(null);
                              lastLocationQueryRef.current = null;
                              lastLocationSelectionRef.current = null;
                            }}
                            onFocus={cancelLocationSuggestionBlur}
                            onBlur={async () => {
                              scheduleCloseLocationSuggestions();
                              const trimmed = birthLocation.trim();
                              if (!trimmed) return;
                              if (lastBirthLocationCheck.current === trimmed)
                                return;
                              setIsCheckingBirthLocation(true);
                              lastBirthLocationCheck.current = trimmed;
                              const coords = await geocodeLocation(trimmed);
                              setShowBirthLocationHint(!coords);
                              setIsCheckingBirthLocation(false);
                            }}
                            className='w-full rounded-md border border-stroke-strong bg-surface-overlay px-3 py-2 text-sm text-content-primary placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
                            placeholder='e.g., London, UK or 51.4769, 0.0005'
                          />
                          {showLocationSuggestions && (
                            <div className='absolute z-20 mt-2 w-full rounded-lg border border-stroke-default bg-surface-elevated shadow-xl'>
                              {isLoadingLocationSuggestions ? (
                                <div className='px-4 py-3 text-xs text-content-muted'>
                                  Loading suggestions...
                                </div>
                              ) : locationSuggestionError ? (
                                <div className='px-4 py-3 text-xs text-content-muted'>
                                  {locationSuggestionError}
                                </div>
                              ) : locationSuggestions.length === 0 ? (
                                <div className='px-4 py-3 text-xs text-content-muted'>
                                  No matches found. Try adding a country or use
                                  coordinates.
                                </div>
                              ) : (
                                <ul className='max-h-56 overflow-y-auto py-1 text-sm text-content-primary'>
                                  {locationSuggestions.map((suggestion) => (
                                    <li key={suggestion.label}>
                                      <button
                                        type='button'
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() =>
                                          handleLocationSuggestionSelect(
                                            suggestion,
                                          )
                                        }
                                        className='w-full px-4 py-2 text-left hover:bg-surface-card/70 transition-colors'
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
                        {isCheckingBirthLocation && (
                          <p className='text-xs text-content-muted'>
                            Checking location...
                          </p>
                        )}
                        {showBirthLocationHint && !isCheckingBirthLocation && (
                          <p className='text-xs text-content-muted'>
                            Tip: use a city name if your location is not found.
                          </p>
                        )}
                      </div>
                    </div>
                    <p className='text-xs text-content-muted sm:text-sm'>
                      Your birthday enables personalized birth chart analysis,
                      horoscopes, and cosmic insights.
                    </p>
                    {showBirthChartConfirmation &&
                      (() => {
                        const chart = user?.birthChart ?? [];
                        const sun = chart.find((p) => p.body === 'Sun')?.sign;
                        const moon = chart.find((p) => p.body === 'Moon')?.sign;
                        const rising = chart.find(
                          (p) => p.body === 'Ascendant',
                        )?.sign;
                        return (
                          <div className='rounded-xl border border-lime-900/60 bg-lime-950/40 p-3 space-y-2.5'>
                            <div className='flex items-center gap-2'>
                              <CheckCircle2 className='h-4 w-4 text-lime-400 shrink-0' />
                              <p className='text-xs font-medium text-lime-300'>
                                Your chart is live — everything in Lunary is now
                                personal to you.
                              </p>
                            </div>

                            {(sun || moon || rising) && (
                              <div className='flex flex-wrap gap-2'>
                                {sun && (
                                  <span className='rounded-full border border-stroke-default bg-surface-elevated px-2.5 py-0.5 text-[0.65rem] text-content-secondary'>
                                    ☀️ Sun · {sun}
                                  </span>
                                )}
                                {moon && (
                                  <span className='rounded-full border border-stroke-default bg-surface-elevated px-2.5 py-0.5 text-[0.65rem] text-content-secondary'>
                                    🌙 Moon · {moon}
                                  </span>
                                )}
                                {rising && (
                                  <span className='rounded-full border border-stroke-default bg-surface-elevated px-2.5 py-0.5 text-[0.65rem] text-content-secondary'>
                                    ⬆️ Rising · {rising}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className='flex flex-wrap gap-3'>
                              <Link
                                href='/app/birth-chart'
                                className='flex items-center gap-1 text-[0.65rem] text-content-brand-accent hover:text-content-brand-accent transition-colors'
                              >
                                View your birth chart{' '}
                                <ArrowRight className='h-3 w-3' />
                              </Link>
                              <Link
                                href='/horoscope'
                                className='flex items-center gap-1 text-[0.65rem] text-content-brand hover:text-content-secondary transition-colors'
                              >
                                Read today&apos;s horoscope{' '}
                                <ArrowRight className='h-3 w-3' />
                              </Link>
                            </div>
                          </div>
                        );
                      })()}
                  </div>
                ) : (
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-content-primary sm:text-base'>
                      <div className='flex items-center gap-2'>
                        <span className='text-[11px] uppercase tracking-wide text-content-muted'>
                          {nameLabel}
                        </span>
                        <span
                          className={`font-medium ${isNamePlaceholder ? 'text-content-muted' : ''}`}
                        >
                          {nameDisplay}
                        </span>
                      </div>
                      <span className='hidden text-content-muted sm:inline'>
                        •
                      </span>
                      <div className='flex items-center gap-2'>
                        <span className='text-[11px] uppercase tracking-wide text-content-muted'>
                          {birthdayLabel}
                        </span>
                        <span
                          className={`font-medium ${isBirthdayPlaceholder ? 'text-content-muted' : ''}`}
                        >
                          {birthdayDisplay}
                        </span>
                      </div>
                      {birthTime && (
                        <>
                          <span className='hidden text-content-muted sm:inline'>
                            •
                          </span>
                          <div className='flex items-center gap-2'>
                            <span className='text-[11px] uppercase tracking-wide text-content-muted'>
                              Time
                            </span>
                            <span className='font-medium text-content-secondary'>
                              {birthTime}
                            </span>
                          </div>
                        </>
                      )}
                      {birthLocation && (
                        <>
                          <span className='hidden text-content-muted sm:inline'>
                            •
                          </span>
                          <div className='flex items-center gap-2'>
                            <span className='text-[11px] uppercase tracking-wide text-content-muted'>
                              Location
                            </span>
                            <span className='font-medium text-content-secondary'>
                              {birthLocation}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      {canEditProfile && (
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant='lunary'
                          size='sm'
                        >
                          Edit details
                        </Button>
                      )}
                      {authState.isAuthenticated && (
                        <Button
                          onClick={handleSignOut}
                          variant='outline'
                          size='sm'
                        >
                          Sign out
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {canEditProfile && isEditing && (
                  <div className='flex flex-wrap items-center justify-end gap-2'>
                    <button
                      onClick={() => setIsEditing(false)}
                      className='rounded-full border border-stroke-strong px-4 py-2 text-sm text-content-secondary transition-colors hover:border-stroke-strong hover:text-content-primary'
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!name}
                      className='rounded-full bg-lunary-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lunary-primary-400 disabled:cursor-not-allowed disabled:bg-surface-overlay disabled:text-content-secondary'
                    >
                      Save Profile
                    </button>
                  </div>
                )}

                {authState.isAuthenticated && !canCollectBirthdayData && (
                  <div className='rounded-lg border border-lunary-primary-700 bg-gradient-to-r from-layer-base/40 to-lunary-highlight-900/40 p-4'>
                    <h4 className='mb-2 font-medium text-content-primary'>
                      🌍 Birthday Collection
                    </h4>
                    <p className='mb-3 text-sm text-content-secondary'>
                      Unlock personalized astrology by providing your birthday.
                    </p>
                    <SmartTrialButton size='sm' />
                  </div>
                )}

                {!authState.isAuthenticated ? (
                  <div className='space-y-3 rounded-md border-2 border-dashed border-stroke-strong py-4 text-center'>
                    <p className='text-sm text-content-muted'>
                      Sign in to save your profile and unlock cosmic insights
                    </p>
                    <div className='flex flex-col items-center gap-2 sm:flex-row sm:justify-center'>
                      <button
                        onClick={() => {
                          setAuthMode('signIn');
                          setShowAuthModal(true);
                        }}
                        className='rounded-md bg-lunary-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lunary-primary-400'
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          setAuthMode('signUp');
                          setShowAuthModal(true);
                        }}
                        className='rounded-md border border-lunary-primary-700 px-4 py-2 text-sm font-medium text-content-brand-accent transition-colors hover:border-lunary-primary-500 hover:text-content-brand-accent'
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                ) : !canCollectBirthdayData ? (
                  <div className='space-y-3 rounded-md border-2 border-dashed border-lunary-primary-700 bg-gradient-to-r from-layer-base/20 to-lunary-highlight-900/20 py-4 text-center'>
                    <p className='text-sm text-content-secondary'>
                      👋 Welcome{' '}
                      {authState.user?.name ||
                        authState.profile?.name ||
                        'User'}
                      ! Upgrade to unlock Personalised Features
                    </p>
                    <div className='flex justify-center'>
                      <a
                        href='/pricing?nav=app'
                        className='rounded-md bg-gradient-to-r from-lunary-primary to-lunary-highlight px-4 py-2 text-sm font-medium text-content-primary transition-all duration-300 hover:from-lunary-primary-400 hover:to-lunary-highlight-400'
                      >
                        Upgrade to Premium
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Cosmic Profile Grid */}
          {authState.isAuthenticated &&
            !isEditing &&
            birthday &&
            hasBirthChartAccessData && (
              <div data-testid='cosmic-profile-grid'>
                <CosmicProfileGrid
                  birthday={birthday}
                  personalCard={user?.personalCard}
                  onPersonalCardClick={() => setShowPersonalCardModal(true)}
                />
              </div>
            )}

          {/* Daily Cosmic Overview & Life Themes */}
          <div className='w-full max-w-3xl space-y-4'>
            <DailyCosmicOverview className='w-full' />
            <LifeThemesCard className='w-full' />
            <GuideNudge location='profile' className='w-full' />
          </div>

          {/* Journey Section (Streak + Insights) */}
          {authState.isAuthenticated && !isEditing && <JourneySection />}

          {/* Footer Links */}
          <div className='w-full max-w-3xl'>
            <div className='text-center text-sm text-content-muted'>
              <p>
                Your cosmic profile information is stored securely and
                encrypted.
              </p>
            </div>
            {!isNativeIOS && (
              <div className='flex flex-col items-center gap-2 text-sm mt-4'>
                <span className='text-content-muted'>Looking for more?</span>
                <div className='flex flex-wrap justify-center gap-3'>
                  <Link
                    href='/shop'
                    className='rounded-full border border-stroke-default/70 px-4 py-1.5 text-content-secondary transition hover:border-lunary-primary-600 hover:text-content-brand-accent'
                  >
                    Browse Shop
                  </Link>
                  <Link
                    href='/blog?from=explore'
                    className='rounded-full border border-stroke-default/70 px-4 py-1.5 text-content-secondary transition hover:border-lunary-primary-600 hover:text-content-brand-accent'
                  >
                    Read the Blog
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Circle Tab Content */}
      {activeTab === 'circle' && authState.isAuthenticated && (
        <div data-testid='circle-section'>
          <CircleTab />
        </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === 'settings' && authState.isAuthenticated && (
        <SettingsTab
          stripeCustomerId={user?.stripeCustomerId || undefined}
          subscriptionId={subscription.subscriptionId}
        />
      )}

      {/* Personal Card Modal */}
      {showPersonalCardModal && (
        <PersonalCardModal
          personalCard={user?.personalCard}
          onClose={() => setShowPersonalCardModal(false)}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className='fixed inset-0 bg-surface-base/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-surface-elevated rounded-lg p-6 w-full max-w-md relative'>
            <button
              onClick={() => setShowAuthModal(false)}
              className='absolute top-4 right-4 text-content-muted hover:text-content-primary'
            >
              ✕
            </button>
            <AuthComponent
              defaultToSignUp={authMode === 'signUp'}
              onSuccess={() => {
                setShowAuthModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Quick links: Referrals & Compatibility */}
      <div className='flex gap-3 pt-3 border-t border-stroke-subtle/50'>
        <Link
          href='/referrals'
          className='flex-1 text-center px-3 py-2 text-xs text-content-muted hover:text-content-primary border border-stroke-subtle rounded-lg hover:border-stroke-default transition-colors'
        >
          Your Referrals
        </Link>
        <Link
          href='/compatibility'
          className='flex-1 text-center px-3 py-2 text-xs text-content-muted hover:text-content-primary border border-stroke-subtle rounded-lg hover:border-stroke-default transition-colors'
        >
          Compatibility Invite
        </Link>
      </div>

      {/* Help Link */}
      <div className='pt-3 border-t border-stroke-subtle/50'>
        <div className='flex justify-center'>
          <Link
            href='/help'
            className='inline-flex items-center gap-1.5 text-xs text-content-muted hover:text-content-muted transition-colors'
          >
            <HelpCircle className='w-3.5 h-3.5' />
            Help & Support
          </Link>
        </div>
      </div>
    </div>
  );
}
