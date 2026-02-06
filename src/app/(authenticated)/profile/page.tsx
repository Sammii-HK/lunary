'use client';

import { useUser } from '@/context/UserContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { HelpCircle } from 'lucide-react';
import { createBirthChartWithMetadata } from '../../../../utils/astrology/birthChartService';
import { useSubscription } from '../../../hooks/useSubscription';
import {
  canCollectBirthday,
  hasBirthChartAccess,
} from '../../../../utils/pricing';
import { betterAuthClient } from '@/lib/auth-client';
import { useAuthStatus } from '@/components/AuthStatus';
import { conversionTracking } from '@/lib/analytics';
import { BirthdayInput } from '@/components/ui/birthday-input';
import { geocodeLocation, parseCoordinates } from '../../../../utils/location';
import { useModal } from '@/hooks/useModal';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/button';
import { formatIsoDateOnly } from '@/lib/date-only';

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
      <div className='h-48 bg-zinc-800 animate-pulse rounded-lg' />
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

        // Auto-generate birth chart if missing
        if (profileBirthday && !user.hasBirthChart) {
          (async () => {
            const { birthChart, timezone, timezoneSource } =
              await createBirthChartWithMetadata({
                birthDate: profileBirthday,
                birthTime: profileBirthTime || undefined,
                birthLocation: profileBirthLocation || undefined,
                fallbackTimezone:
                  Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
              });
            await fetch('/api/profile/birth-chart', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ birthChart }),
            });

            if (
              profileBirthLocation &&
              timezoneSource === 'location' &&
              timezone
            ) {
              await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  location: {
                    ...location,
                    birthTime: profileBirthTime || undefined,
                    birthLocation: profileBirthLocation || undefined,
                    birthTimezone: timezone,
                  },
                }),
              });
            }
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
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
          const { birthChart, timezone, timezoneSource } =
            await createBirthChartWithMetadata({
              birthDate: birthday,
              birthTime: birthTime || undefined,
              birthLocation: birthLocation || undefined,
              fallbackTimezone:
                Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
            });

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

      await refetchUser();
      setIsEditing(false);

      if (birthday) {
        setShowBirthChartConfirmation(true);
        if (birthChartConfirmationTimeoutRef.current) {
          window.clearTimeout(birthChartConfirmationTimeoutRef.current);
        }
        birthChartConfirmationTimeoutRef.current = window.setTimeout(() => {
          setShowBirthChartConfirmation(false);
        }, 8000);
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
        <p className='text-zinc-400'>Loading your profile...</p>
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
            <div className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-4 shadow-lg sm:p-5'>
              <div className='space-y-4'>
                {canEditProfile && isEditing ? (
                  <div className='space-y-4'>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-2'>
                        <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                          Name
                          <span className='ml-2 text-[10px] font-normal text-lunary-accent'>
                            ✨ Personalised Feature
                          </span>
                        </label>
                        <input
                          type='text'
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className='w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
                          placeholder='Enter your name'
                        />
                      </div>
                      <div className='space-y-2'>
                        <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                          Birthday *
                          <span className='ml-2 text-[10px] font-normal text-lunary-accent'>
                            ✨ Personalised Feature
                          </span>
                        </label>
                        <BirthdayInput
                          value={birthday}
                          onChange={setBirthday}
                          className='rounded-md border-zinc-600 bg-zinc-700 px-3 py-2 text-sm'
                        />
                      </div>
                    </div>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-2'>
                        <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                          Birth Time (optional)
                          <span className='ml-2 text-[10px] font-normal text-zinc-400'>
                            More precise = more accurate
                          </span>
                        </label>
                        <input
                          type='time'
                          value={birthTime}
                          onChange={(e) => setBirthTime(e.target.value)}
                          className='w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
                        />
                      </div>
                      <div className='space-y-2'>
                        <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                          Birth Location (optional)
                          <span className='ml-2 text-[10px] font-normal text-zinc-400'>
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
                            className='w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
                            placeholder='e.g., London, UK or 51.4769, 0.0005'
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
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() =>
                                          handleLocationSuggestionSelect(
                                            suggestion,
                                          )
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
                        {isCheckingBirthLocation && (
                          <p className='text-xs text-zinc-500'>
                            Checking location...
                          </p>
                        )}
                        {showBirthLocationHint && !isCheckingBirthLocation && (
                          <p className='text-xs text-zinc-500'>
                            Tip: use a city name if your location is not found.
                          </p>
                        )}
                      </div>
                    </div>
                    <p className='text-xs text-zinc-400 sm:text-sm'>
                      Your birthday enables personalized birth chart analysis,
                      horoscopes, and cosmic insights.
                    </p>
                    {showBirthChartConfirmation && (
                      <p className='text-xs text-lime-300 font-medium'>
                        Your birth chart is now set. Lunary uses it to interpret
                        everything you explore.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white sm:text-base'>
                      <div className='flex items-center gap-2'>
                        <span className='text-[11px] uppercase tracking-wide text-zinc-400'>
                          {nameLabel}
                        </span>
                        <span
                          className={`font-medium ${isNamePlaceholder ? 'text-zinc-400' : ''}`}
                        >
                          {nameDisplay}
                        </span>
                      </div>
                      <span className='hidden text-zinc-600 sm:inline'>•</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-[11px] uppercase tracking-wide text-zinc-400'>
                          {birthdayLabel}
                        </span>
                        <span
                          className={`font-medium ${isBirthdayPlaceholder ? 'text-zinc-400' : ''}`}
                        >
                          {birthdayDisplay}
                        </span>
                      </div>
                      {birthTime && (
                        <>
                          <span className='hidden text-zinc-600 sm:inline'>
                            •
                          </span>
                          <div className='flex items-center gap-2'>
                            <span className='text-[11px] uppercase tracking-wide text-zinc-400'>
                              Time
                            </span>
                            <span className='font-medium text-zinc-300'>
                              {birthTime}
                            </span>
                          </div>
                        </>
                      )}
                      {birthLocation && (
                        <>
                          <span className='hidden text-zinc-600 sm:inline'>
                            •
                          </span>
                          <div className='flex items-center gap-2'>
                            <span className='text-[11px] uppercase tracking-wide text-zinc-400'>
                              Location
                            </span>
                            <span className='font-medium text-zinc-300'>
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
                      className='rounded-full border border-zinc-600 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white'
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!name}
                      className='rounded-full bg-lunary-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lunary-primary-400 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300'
                    >
                      Save Profile
                    </button>
                  </div>
                )}

                {authState.isAuthenticated && !canCollectBirthdayData && (
                  <div className='rounded-lg border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/40 to-lunary-highlight-900/40 p-4'>
                    <h4 className='mb-2 font-medium text-white'>
                      🌍 Birthday Collection
                    </h4>
                    <p className='mb-3 text-sm text-zinc-300'>
                      Unlock personalized astrology by providing your birthday.
                    </p>
                    <SmartTrialButton size='sm' />
                  </div>
                )}

                {!authState.isAuthenticated ? (
                  <div className='space-y-3 rounded-md border-2 border-dashed border-zinc-600 py-4 text-center'>
                    <p className='text-sm text-zinc-400'>
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
                        className='rounded-md border border-lunary-primary-700 px-4 py-2 text-sm font-medium text-lunary-accent-200 transition-colors hover:border-lunary-primary-500 hover:text-lunary-accent-100'
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                ) : !canCollectBirthdayData ? (
                  <div className='space-y-3 rounded-md border-2 border-dashed border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-highlight-900/20 py-4 text-center'>
                    <p className='text-sm text-zinc-300'>
                      👋 Welcome{' '}
                      {authState.user?.name ||
                        authState.profile?.name ||
                        'User'}
                      ! Upgrade to unlock Personalised Features
                    </p>
                    <div className='flex justify-center'>
                      <a
                        href='/pricing'
                        className='rounded-md bg-gradient-to-r from-lunary-primary to-lunary-highlight px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-lunary-primary-400 hover:to-lunary-highlight-400'
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
            <div className='text-center text-sm text-zinc-400'>
              <p>
                Your cosmic profile information is stored securely and
                encrypted.
              </p>
            </div>
            <div className='flex flex-col items-center gap-2 text-sm mt-4'>
              <span className='text-zinc-400'>Looking for more?</span>
              <div className='flex flex-wrap justify-center gap-3'>
                <Link
                  href='/shop'
                  className='rounded-full border border-zinc-700/70 px-4 py-1.5 text-zinc-300 transition hover:border-lunary-primary-600 hover:text-lunary-accent-200'
                >
                  Browse Shop
                </Link>
                <a
                  href='/blog'
                  className='rounded-full border border-zinc-700/70 px-4 py-1.5 text-zinc-300 transition hover:border-lunary-primary-600 hover:text-lunary-accent-200'
                >
                  Read the Blog
                </a>
              </div>
            </div>
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
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-zinc-900 rounded-lg p-6 w-full max-w-md relative'>
            <button
              onClick={() => setShowAuthModal(false)}
              className='absolute top-4 right-4 text-zinc-400 hover:text-white'
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

      {/* Help Link */}
      <div className='pt-3 border-t border-zinc-800/50'>
        <div className='flex justify-center'>
          <Link
            href='/help'
            className='inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-400 transition-colors'
          >
            <HelpCircle className='w-3.5 h-3.5' />
            Help & Support
          </Link>
        </div>
      </div>
    </div>
  );
}
