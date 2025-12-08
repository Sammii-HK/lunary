'use client';

import { useUser } from '@/context/UserContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { HelpCircle, Stars, Layers, X } from 'lucide-react';
import { generateBirthChart } from '../../../utils/astrology/birthChart';
import { useSubscription } from '../../hooks/useSubscription';
import {
  canCollectBirthday,
  hasBirthChartAccess,
} from '../../../utils/pricing';
import { betterAuthClient } from '@/lib/auth-client';
import { useAuthStatus } from '@/components/AuthStatus';
import { conversionTracking } from '@/lib/analytics';
import { BirthdayInput } from '@/components/ui/birthday-input';

const SkeletonCard = () => (
  <div className='h-32 bg-zinc-800 animate-pulse rounded-xl' />
);

const SubscriptionManagement = dynamic(
  () => import('../../components/SubscriptionManagement'),
  { loading: () => <SkeletonCard /> },
);
const LocationRefresh = dynamic(
  () => import('../../components/LocationRefresh'),
  { ssr: false },
);
const NotificationSettings = dynamic(
  () =>
    import('../../components/NotificationSettings').then((m) => ({
      default: m.NotificationSettings,
    })),
  { ssr: false },
);
const EmailSubscriptionSettings = dynamic(
  () =>
    import('../../components/EmailSubscriptionSettings').then((m) => ({
      default: m.EmailSubscriptionSettings,
    })),
  { ssr: false },
);
const ReferralProgram = dynamic(
  () =>
    import('../../components/ReferralProgram').then((m) => ({
      default: m.ReferralProgram,
    })),
  { ssr: false },
);
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
const StreakDisplay = dynamic(
  () =>
    import('@/components/StreakDisplay').then((m) => ({
      default: m.StreakDisplay,
    })),
  { loading: () => <SkeletonCard /> },
);
const RitualTracker = dynamic(
  () =>
    import('@/components/RitualTracker').then((m) => ({
      default: m.RitualTracker,
    })),
  { loading: () => <SkeletonCard /> },
);
const MonthlyInsights = dynamic(
  () =>
    import('@/components/MonthlyInsights').then((m) => ({
      default: m.MonthlyInsights,
    })),
  {
    loading: () => (
      <div className='h-64 bg-zinc-800 animate-pulse rounded-xl' />
    ),
  },
);
const Paywall = dynamic(
  () => import('@/components/Paywall').then((m) => ({ default: m.Paywall })),
  { ssr: false },
);

export default function ProfilePage() {
  const { user, updateProfile, refetch: refetchUser } = useUser();
  const subscription = useSubscription();
  const authState = useAuthStatus();
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [openSettingsSections, setOpenSettingsSections] = useState<string[]>(
    [],
  );
  const [showPersonalCardModal, setShowPersonalCardModal] = useState(false);

  // Check if user can collect birthday data
  const canCollectBirthdayData = canCollectBirthday(subscription.status);
  const hasBirthChartAccessData = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );
  const canEditProfile = authState.isAuthenticated && canCollectBirthdayData;

  // Simplified authentication check
  useEffect(() => {
    // The authState hook handles all authentication logic
    if (!authState.loading) {
      setIsLoading(false);
    }
  }, [authState.loading]);

  // ESC key handler for auth modal
  useEffect(() => {
    if (!showAuthModal) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAuthModal(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showAuthModal]);

  // Load existing profile data when component mounts
  useEffect(() => {
    if (user) {
      try {
        let profileName = user.name || '';
        const profileBirthday = user.birthday || '';
        const profileBirthTime = (user as any)?.birthTime || '';
        const profileBirthLocation = (user as any)?.birthLocation || '';

        setName(profileName);
        setBirthday(profileBirthday);
        setBirthTime(profileBirthTime);
        setBirthLocation(profileBirthLocation);
        setIsEditing(!profileName && !profileBirthday);

        // Auto-generate birth chart if missing but birthday exists
        if (profileBirthday && !user.hasBirthChart) {
          (async () => {
            console.log('[Profile] Auto-generating missing birth chart...');
            const birthChart = await generateBirthChart(
              profileBirthday,
              profileBirthTime || undefined,
              profileBirthLocation || undefined,
            );
            await fetch('/api/profile/birth-chart', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ birthChart }),
            });
            console.log('[Profile] Birth chart generated and saved!');
            // Refetch user data
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          })();
        }

        // // Check if we have migrated profile data to restore
        // if (typeof window !== 'undefined') {
        //   const migrationDataStr = localStorage.getItem('migration_profile_data');
        //   if (migrationDataStr && (!profileName || profileName === 'New User')) {
        //     try {
        //       const migrationData = JSON.parse(migrationDataStr);
        //       console.log('Restoring complete migrated profile data:', migrationData);

        //       // Restore all profile fields using correct Jazz API
        //       if (migrationData.name) {
        //         profileName = migrationData.name;
        //         me.profile.$jazz.set('name', migrationData.name);
        //       }

        //       if (migrationData.birthday) {
        //         me.profile.$jazz.set('birthday', migrationData.birthday);
        //         setBirthday(migrationData.birthday);
        //       }

        //       if (migrationData.birthChart) {
        //         me.profile.$jazz.set('birthChart', migrationData.birthChart);
        //       }

        //       if (migrationData.personalCard) {
        //         me.profile.$jazz.set('personalCard', migrationData.personalCard);
        //       }

        //       if (migrationData.location) {
        //         me.profile.$jazz.set('location', migrationData.location);
        //       }

        //       if (migrationData.subscriptionData) {
        //         me.profile.$jazz.set('subscription', migrationData.subscriptionData);
        //       }

        //       if (migrationData.stripeCustomerId) {
        //         me.profile.$jazz.set('stripeCustomerId', migrationData.stripeCustomerId);
        //       }

        //       console.log('✅ Profile data fully restored from migration');

        //       // Clean up the temporary storage
        //       localStorage.removeItem('migration_profile_data');
        //       localStorage.removeItem('migration_data'); // Clean up old format too

        //     } catch (error) {
        //       console.error('Error restoring migration data:', error);
        //     }
        //   }
        // }

        setIsLoading(false);
      } catch (error) {
        console.log('Error loading profile:', error);
        setIsLoading(false);
        setIsEditing(true);
      }
    } else {
      // If no profile exists, allow editing
      setIsLoading(false);
      setIsEditing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!canEditProfile && isEditing) {
      setIsEditing(false);
    }
  }, [canEditProfile, isEditing]);

  const handleSave = async () => {
    try {
      // Save basic profile to Postgres
      const profileResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, birthday }),
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to save profile');
      }

      // Generate and save cosmic data if birthday is provided
      if (birthday) {
        const hasExistingChart = user?.hasBirthChart || false;
        const hasExistingPersonalCard = user?.personalCard ? true : false;

        const shouldRegenerateChart =
          !hasExistingChart ||
          (birthTime && birthTime !== (user as any)?.birthTime) ||
          (birthLocation && birthLocation !== (user as any)?.birthLocation);

        if (shouldRegenerateChart) {
          console.log('Generating birth chart...');
          const birthChart = await generateBirthChart(
            birthday,
            birthTime || undefined,
            birthLocation || undefined,
          );

          await fetch('/api/profile/birth-chart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ birthChart }),
          });
        }

        if (!hasExistingPersonalCard) {
          console.log('Generating personal card...');
          const { calculatePersonalCard } = await import(
            '../../../utils/tarot/personalCard'
          );
          const personalCard = calculatePersonalCard(birthday, name);

          await fetch('/api/profile/personal-card', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ personalCard }),
          });
        }
      }

      // Refresh user data in context so widgets update immediately
      await refetchUser();

      setIsEditing(false);

      // Refresh user data to update UI with saved changes
      await refetchUser();

      if (birthday) {
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
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies
      document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0].trim();
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });

      // Sign out from server
      await betterAuthClient.signOut();

      // Hard reload to update UI
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
      // Still reload even if error
      window.location.href = '/';
    }
  };

  const toggleSettingsSection = (sectionId: string) => {
    setOpenSettingsSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const isSettingsSectionOpen = (sectionId: string) =>
    openSettingsSections.includes(sectionId);

  const nameDisplay = canCollectBirthdayData
    ? name || 'Add your name'
    : authState.isAuthenticated
      ? name || 'Locked until upgrade'
      : 'Sign in to personalise';

  const nameLabel = name ? 'Preferred Name' : 'Name';
  const isNamePlaceholder = !name;

  const birthdayDisplay = birthday
    ? new Date(birthday).toLocaleDateString()
    : canCollectBirthdayData
      ? 'Add your birthday'
      : authState.isAuthenticated
        ? 'Premium feature'
        : 'Sign in to personalise';

  const birthdayLabel = birthday ? 'Birthdate' : 'DOB';
  const isBirthdayPlaceholder = !birthday;

  const settingsSections = [
    {
      id: 'location',
      title: 'Location',
      description: 'Keep your coordinates current for precise readings.',
      content: <LocationRefresh variant='settings' />,
    },
    {
      id: 'email',
      title: 'Email Preferences',
      description: 'Manage horoscope updates and product news.',
      content: <EmailSubscriptionSettings />,
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      description: 'Control reminders and device alerts.',
      content: <NotificationSettings />,
    },
    {
      id: 'referrals',
      title: 'Referral Program',
      description: 'Share the magic and unlock rewards.',
      content: <ReferralProgram />,
    },
  ];

  // Show loading state while checking auth or if me is loading
  if (authState.loading || isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lunary-primary'></div>
        <p className='text-zinc-400'>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center gap-6 p-4'>
      <div className='flex items-center justify-between w-full max-w-3xl'>
        <h1 className='text-2xl font-bold text-white text-center md:text-left'>
          Your Profile
        </h1>
      </div>

      <div className='w-full max-w-3xl'>
        <div className='rounded-xl border border-zinc-700/70 bg-zinc-800/90 p-4 shadow-lg sm:p-5'>
          <div className='space-y-4'>
            {canEditProfile && isEditing ? (
              <>
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
                        className='w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                        <span className='ml-2 text-[10px] font-normal text-zinc-500'>
                          More precise = more accurate
                        </span>
                      </label>
                      <input
                        type='time'
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className='w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                        Birth Location (optional)
                        <span className='ml-2 text-[10px] font-normal text-zinc-500'>
                          City, Country or coordinates
                        </span>
                      </label>
                      <input
                        type='text'
                        value={birthLocation}
                        onChange={(e) => setBirthLocation(e.target.value)}
                        className='w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='e.g., London, UK or 51.4769, 0.0005'
                      />
                    </div>
                  </div>
                  <p className='text-xs text-zinc-400 sm:text-sm'>
                    Your birthday enables personalized birth chart analysis,
                    horoscopes, and cosmic insights. Adding birth time and
                    location makes your chart more accurate.
                  </p>
                </div>
              </>
            ) : (
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white sm:text-base'>
                  <div className='flex items-center gap-2'>
                    <span className='text-[11px] uppercase tracking-wide text-zinc-500'>
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
                    <span className='text-[11px] uppercase tracking-wide text-zinc-500'>
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
                      <span className='hidden text-zinc-600 sm:inline'>•</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-[11px] uppercase tracking-wide text-zinc-500'>
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
                      <span className='hidden text-zinc-600 sm:inline'>•</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-[11px] uppercase tracking-wide text-zinc-500'>
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
                    <button
                      onClick={() => setIsEditing(true)}
                      className='rounded-full bg-blue-600/90 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500'
                    >
                      Edit details
                    </button>
                  )}
                  {authState.isAuthenticated && (
                    <button
                      onClick={handleSignOut}
                      className='rounded-full border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white'
                    >
                      Sign out
                    </button>
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
                  className='rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300'
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
                  Unlock personalized astrology by providing your birthday. Get
                  your birth chart, personalized horoscopes, and cosmic insights
                  tailored specifically to you.
                </p>
                <SmartTrialButton size='sm' />
              </div>
            )}

            {!authState.isAuthenticated ? (
              <div className='space-y-3 rounded-md border-2 border-dashed border-zinc-600 py-4 text-center'>
                <p className='text-sm text-zinc-400'>
                  Sign in to save your profile and unlock cosmic insights
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className='rounded-md bg-lunary-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lunary-primary-400'
                >
                  Sign In or Create Account
                </button>
              </div>
            ) : !canCollectBirthdayData ? (
              <div className='space-y-3 rounded-md border-2 border-dashed border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-highlight-900/20 py-4 text-center'>
                <p className='text-sm text-zinc-300'>
                  👋 Welcome{' '}
                  {authState.user?.name || authState.profile?.name || 'User'}!
                  Upgrade to unlock Personalised Features
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

      {authState.isAuthenticated && !isEditing && (
        <div className='w-full max-w-3xl space-y-4'>
          <div className='rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 shadow-lg'>
            <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-wide mb-3'>
              Your Journey
            </h2>
            <div className='grid grid-cols-2 gap-3'>
              <StreakDisplay />
              <RitualTracker />
            </div>
            <Paywall feature='monthly_insights'>
              <div className='mt-3 pt-3 border-t border-zinc-800'>
                <button
                  onClick={() =>
                    document
                      .getElementById('monthly-insights')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className='text-sm text-lunary-accent hover:text-lunary-accent-300 transition-colors'
                >
                  View Monthly Insights →
                </button>
              </div>
            </Paywall>
          </div>
          <Paywall feature='monthly_insights'>
            <div id='monthly-insights'>
              <MonthlyInsights />
            </div>
          </Paywall>
        </div>
      )}

      {authState.isAuthenticated &&
        !isEditing &&
        birthday &&
        hasBirthChartAccessData && (
          <>
            <div className='w-full max-w-3xl'>
              <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-wide mb-3'>
                Cosmic Profile
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <Link
                  href='/birth-chart'
                  className='group rounded-xl border border-lunary-primary-700 bg-gradient-to-br from-lunary-primary-950/60 to-zinc-900 p-4 shadow-lg hover:border-lunary-primary-600 transition-colors'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-medium text-white group-hover:text-lunary-accent-300 transition-colors'>
                        Birth Chart
                      </h3>
                      <p className='text-xs text-lunary-accent-200/70'>
                        View your cosmic fingerprint
                      </p>
                    </div>
                    <Stars className='w-6 h-6 text-lunary-accent' />
                  </div>
                </Link>

                {(() => {
                  const personalCard = user?.personalCard;
                  return (
                    <button
                      onClick={() => setShowPersonalCardModal(true)}
                      className='group rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 shadow-lg hover:border-lunary-primary-700 transition-colors text-left w-full'
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <h3 className='text-lg font-medium text-white group-hover:text-lunary-accent-300 transition-colors'>
                            Personal Card
                          </h3>
                          <p className='text-xs text-zinc-400'>
                            {personalCard
                              ? personalCard.name
                              : 'Your tarot signature'}
                          </p>
                        </div>
                        <Layers className='w-6 h-6 text-lunary-accent' />
                      </div>
                    </button>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      {authState.isAuthenticated && !isEditing && (
        <div className='w-full max-w-3xl space-y-3'>
          <h2 className='text-lg font-semibold text-white'>Settings</h2>
          {settingsSections.map((section) => {
            const open = isSettingsSectionOpen(section.id);
            return (
              <div
                key={section.id}
                className='rounded-xl border border-zinc-700 bg-zinc-900/70 shadow-lg'
              >
                <button
                  onClick={() => toggleSettingsSection(section.id)}
                  className='flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:bg-zinc-800/80'
                >
                  <div>
                    <p>{section.title}</p>
                    {section.description && (
                      <p className='text-xs font-normal text-zinc-400'>
                        {section.description}
                      </p>
                    )}
                  </div>
                  <span className='text-lg font-semibold text-lunary-accent-200'>
                    {open ? '-' : '+'}
                  </span>
                </button>
                {open && (
                  <div className='border-t border-zinc-700/60 px-4 py-4 text-sm text-zinc-200'>
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {authState.isAuthenticated && (
        <div className='w-full max-w-3xl space-y-6'>
          <SubscriptionManagement
            customerId={user?.stripeCustomerId || undefined}
            subscriptionId={subscription.subscriptionId}
          />
        </div>
      )}

      <div className='w-full max-w-3xl'>
        <div className='text-center text-sm text-zinc-400'>
          <p>
            Your cosmic profile information is stored securely and encrypted.
            This includes your personal tarot card and birth chart data, which
            create a personalized spiritual experience with custom readings and
            insights.
          </p>
        </div>

        <div className='flex flex-col items-center gap-2 text-sm'>
          <span className='text-zinc-500'>Looking for more?</span>
          <div className='flex flex-wrap justify-center gap-3'>
            <a
              href='/shop'
              className='rounded-full border border-zinc-700/70 px-4 py-1.5 text-zinc-300 transition hover:border-lunary-primary-600 hover:text-lunary-accent-200'
            >
              Browse Shop
            </a>
            <a
              href='/blog'
              className='rounded-full border border-zinc-700/70 px-4 py-1.5 text-zinc-300 transition hover:border-lunary-primary-600 hover:text-lunary-accent-200'
            >
              Read the Blog
            </a>
          </div>
        </div>
      </div>

      {/* Personal Card Modal */}
      {showPersonalCardModal &&
        (() => {
          const personalCard = user?.personalCard;
          return (
            <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
              <div className='bg-zinc-900 rounded-lg p-6 w-full max-w-md relative border border-zinc-700'>
                <button
                  onClick={() => setShowPersonalCardModal(false)}
                  className='absolute top-4 right-4 text-zinc-400 hover:text-white'
                >
                  <X size={20} />
                </button>
                {personalCard ? (
                  <>
                    <div className='text-center mb-4'>
                      <Layers className='w-12 h-12 text-lunary-accent mx-auto mb-3' />
                      <h3 className='text-xl font-bold text-white'>
                        {personalCard.name}
                      </h3>
                      <p className='text-sm text-lunary-accent-300'>
                        Your Personal Card
                      </p>
                    </div>
                    <div className='space-y-4 text-sm text-zinc-300'>
                      {personalCard.keywords &&
                        personalCard.keywords.length > 0 && (
                          <div className='flex flex-wrap gap-2 justify-center'>
                            {personalCard.keywords.map(
                              (keyword: string, i: number) => (
                                <span
                                  key={i}
                                  className='px-2 py-1 bg-lunary-primary-900 text-lunary-accent-300 rounded text-xs'
                                >
                                  {keyword}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      {personalCard.information && (
                        <p className='leading-relaxed'>
                          {personalCard.information}
                        </p>
                      )}
                      {personalCard.reason && (
                        <div>
                          <h4 className='text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1'>
                            Why This Card
                          </h4>
                          <p className='leading-relaxed'>
                            {personalCard.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className='text-center py-8'>
                    <Layers className='w-12 h-12 text-zinc-600 mx-auto mb-3' />
                    <p className='text-zinc-400'>
                      Add your birthday to discover your personal tarot card
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

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

            <div className='text-center mb-6'>
              <h3 className='text-xl font-bold text-white mb-2'>
                Create Your Account
              </h3>
              <p className='text-zinc-300 text-sm'>
                Sign up to save your profile. Upgrade to premium after creating
                your account.
              </p>
            </div>

            <AuthComponent
              onSuccess={() => {
                console.log('🎉 Auth success callback triggered');
                setShowAuthModal(false);
                // Don't redirect - let React state handle the change
                // The AuthStatus hook should automatically detect the new session
              }}
            />
          </div>
        </div>
      )}

      {/* Data & Privacy Section */}
      {authState.isAuthenticated && (
        <div className='w-full max-w-3xl mt-8'>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-4'>
              Data & Privacy
            </h3>

            <div className='space-y-4'>
              {/* Export Data */}
              <div className='flex items-center justify-between p-4 rounded-lg bg-zinc-800/50'>
                <div>
                  <h4 className='text-sm font-medium text-zinc-200'>
                    Export Your Data
                  </h4>
                  <p className='text-xs text-zinc-500'>
                    Download all your Lunary data as JSON
                  </p>
                </div>
                <a
                  href='/api/account/export'
                  download
                  className='px-4 py-2 text-sm font-medium text-lunary-accent hover:text-lunary-accent-300 border border-lunary-primary-700 rounded-lg hover:bg-lunary-primary-950 transition-colors'
                >
                  Download
                </a>
              </div>

              {/* Delete Account */}
              <div className='flex items-center justify-between p-4 rounded-lg bg-red-900/10 border border-red-500/20'>
                <div>
                  <h4 className='text-sm font-medium text-red-300'>
                    Delete Account
                  </h4>
                  <p className='text-xs text-zinc-500'>
                    Permanently delete your account and all data (30-day grace
                    period)
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (
                      !confirm(
                        'Are you sure you want to delete your account? This will schedule your account for deletion in 30 days. You can cancel during this period.',
                      )
                    ) {
                      return;
                    }

                    try {
                      const response = await fetch('/api/account/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          reason: 'User requested deletion from profile',
                        }),
                      });

                      const data = await response.json();

                      if (!response.ok) {
                        alert(data.error || 'Failed to request deletion');
                        return;
                      }

                      alert(
                        `Account deletion scheduled for ${new Date(data.scheduledFor).toLocaleDateString()}. You can cancel this from your profile within 30 days.`,
                      );
                    } catch (error) {
                      alert('Failed to request account deletion');
                    }
                  }}
                  className='px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='mt-12 pt-8 border-t border-zinc-800/50'>
        <div className='flex justify-center'>
          <Link
            href='/help'
            className='inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-400 transition-colors'
          >
            <HelpCircle className='w-3.5 h-3.5' />
            Help & Support
          </Link>
        </div>
      </div>
    </div>
  );
}
