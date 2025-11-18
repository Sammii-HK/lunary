'use client';

import { useAccount } from 'jazz-tools/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import {
  generateBirthChart,
  saveBirthChartToProfile,
  hasBirthChart,
  getBirthChartFromProfile,
} from '../../../utils/astrology/birthChart';
import {
  savePersonalCardToProfile,
  hasPersonalCard,
  getPersonalCardFromProfile,
} from '../../../utils/tarot/personalCard';
import { useSubscription } from '../../hooks/useSubscription';
import {
  canCollectBirthday,
  hasBirthChartAccess,
} from '../../../utils/pricing';
import SubscriptionManagement from '../../components/SubscriptionManagement';
import LocationRefresh from '../../components/LocationRefresh';
import { NotificationSettings } from '../../components/NotificationSettings';
import { EmailSubscriptionSettings } from '../../components/EmailSubscriptionSettings';
import { ReferralProgram } from '../../components/ReferralProgram';
import { AuthComponent } from '@/components/Auth';
import { betterAuthClient } from '@/lib/auth-client';
import { useAuthStatus } from '@/components/AuthStatus';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { TrialReminder } from '@/components/TrialReminder';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { conversionTracking } from '@/lib/analytics';
import { YearlyForecast } from '@/components/forecast/YearlyForecast';
import { Download } from 'lucide-react';

export default function ProfilePage() {
  // Hooks must be called unconditionally - handle errors inside the hook or in the component
  const accountResult = useAccount();
  const me = accountResult?.me || null;

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
    if (me?.profile) {
      try {
        let profileName = (me.profile as any)?.name || '';
        const profileBirthday = (me.profile as any)?.birthday || '';
        const profileBirthTime = (me.profile as any)?.birthTime || '';
        const profileBirthLocation = (me.profile as any)?.birthLocation || '';

        setName(profileName);
        setBirthday(profileBirthday);
        setBirthTime(profileBirthTime);
        setBirthLocation(profileBirthLocation);
        setIsEditing(!profileName && !profileBirthday);

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
  }, [me?.profile]);

  useEffect(() => {
    if (!canEditProfile && isEditing) {
      setIsEditing(false);
    }
  }, [canEditProfile, isEditing]);

  const handleSave = async () => {
    if (me?.profile) {
      try {
        // Actually save to Jazz profile using correct API
        me.profile.$jazz.set('name', name);
        (me.profile as any).$jazz.set('birthday', birthday);
        if (birthTime) {
          (me.profile as any).$jazz.set('birthTime', birthTime);
        } else {
          (me.profile as any).$jazz.set('birthTime', undefined);
        }
        if (birthLocation) {
          (me.profile as any).$jazz.set('birthLocation', birthLocation);
        } else {
          (me.profile as any).$jazz.set('birthLocation', undefined);
        }

        // Generate and save cosmic data if birthday is provided
        if (birthday) {
          console.log('Profile before cosmic data generation:', me.profile);

          const hasExistingChart = hasBirthChart(me.profile);
          const hasExistingPersonalCard = hasPersonalCard(me.profile);

          console.log('Cosmic data check:', {
            hasChart: hasExistingChart,
            hasPersonalCard: hasExistingPersonalCard,
            birthday,
            birthTime,
            birthLocation,
            name,
          });

          // Regenerate chart if birthday, time, or location changed
          const shouldRegenerateChart =
            !hasExistingChart ||
            (birthTime && birthTime !== (me.profile as any)?.birthTime) ||
            (birthLocation &&
              birthLocation !== (me.profile as any)?.birthLocation);

          if (shouldRegenerateChart) {
            console.log('Generating birth chart with time/location...');
            const birthChart = await generateBirthChart(
              birthday,
              birthTime || undefined,
              birthLocation || undefined,
            );
            await saveBirthChartToProfile(me.profile, birthChart);
          }

          if (!hasExistingPersonalCard) {
            console.log('Generating personal card for:', name, birthday);
            await savePersonalCardToProfile(me.profile, birthday, name);
            console.log('Personal card generation completed');
            console.log('Profile after personal card save:', me.profile);
          } else {
            console.log('Personal card already exists, skipping generation');
          }
        }

        setIsEditing(false);

        if (birthday) {
          conversionTracking.birthdayEntered(authState.user?.id);
        }
        if (name && birthday) {
          conversionTracking.profileCompleted(authState.user?.id);
        }
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await betterAuthClient.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
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
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400'></div>
        <p className='text-zinc-400'>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center gap-6 py-8'>
      <TrialReminder variant='banner' className='w-full max-w-3xl' />

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
                        <span className='ml-2 text-[10px] font-normal text-purple-400'>
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
                        <span className='ml-2 text-[10px] font-normal text-purple-400'>
                          ✨ Personalised Feature
                        </span>
                      </label>
                      <input
                        type='date'
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className='w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
              <div className='rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-4'>
                <h4 className='mb-2 font-medium text-white'>
                  🎂 Birthday Collection
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
                  className='rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700'
                >
                  Sign In or Create Account
                </button>
              </div>
            ) : !canCollectBirthdayData ? (
              <div className='space-y-3 rounded-md border-2 border-dashed border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20 py-4 text-center'>
                <p className='text-sm text-zinc-300'>
                  👋 Welcome{' '}
                  {authState.user?.name || authState.profile?.name || 'User'}!
                  Upgrade to unlock Personalised Features
                </p>
                <div className='flex justify-center'>
                  <a
                    href='/pricing'
                    className='rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-purple-700 hover:to-pink-700'
                  >
                    Upgrade to Premium
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {authState.isAuthenticated &&
        !isEditing &&
        birthday &&
        hasBirthChartAccessData && (
          <>
            <div className='w-full max-w-3xl rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/80 via-zinc-900 to-blue-950/60 p-6 shadow-xl'>
              <div className='flex flex-col gap-5'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div>
                    <h3 className='text-2xl font-semibold text-white'>
                      Your Birth Chart
                    </h3>
                    <p className='text-sm text-purple-200/80'>
                      Expanded highlights of your cosmic fingerprint.
                    </p>
                  </div>
                  <a
                    href='/birth-chart'
                    className='inline-flex items-center gap-2 rounded-full border border-purple-400/40 px-4 py-2 text-sm font-medium text-purple-100 transition-colors hover:bg-purple-500/10'
                  >
                    View full chart
                  </a>
                </div>
                {(() => {
                  const hasBirthChartData = hasBirthChart(me?.profile);
                  const birthChartData = hasBirthChartData
                    ? getBirthChartFromProfile(me?.profile)
                    : null;

                  if (birthChartData && birthChartData.length > 0) {
                    const prioritizedBodies = [
                      'Sun',
                      'Moon',
                      'Ascendant',
                      'Rising',
                      'Mercury',
                      'Venus',
                      'Mars',
                      'Jupiter',
                      'Saturn',
                    ];

                    const prioritizedPlacements = prioritizedBodies
                      .map((bodyName) =>
                        birthChartData.find(
                          (planet) =>
                            planet.body.toLowerCase() ===
                            bodyName.toLowerCase(),
                        ),
                      )
                      .filter(
                        (
                          planet,
                        ): planet is NonNullable<
                          (typeof birthChartData)[number]
                        > => Boolean(planet),
                      );

                    const remainingPlacements = birthChartData
                      .filter(
                        (planet) =>
                          !prioritizedPlacements.some(
                            (prioritized) =>
                              prioritized.body.toLowerCase() ===
                              planet.body.toLowerCase(),
                          ),
                      )
                      .sort((a, b) => a.body.localeCompare(b.body));

                    const displayPlacements = [
                      ...prioritizedPlacements,
                      ...remainingPlacements,
                    ];

                    return (
                      <>
                        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                          {displayPlacements.map((planet) => (
                            <div
                              key={`${planet.body}-${planet.sign}`}
                              className='rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm'
                            >
                              <div className='flex items-start justify-between gap-4'>
                                <div>
                                  <p className='text-sm font-semibold text-white'>
                                    {planet.body}
                                  </p>
                                  <p className='text-xs text-purple-200/80'>
                                    {planet.degree}° {planet.minute}'
                                  </p>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <span className='text-lg font-medium text-purple-100'>
                                    {planet.sign}
                                  </span>
                                  {planet.retrograde && (
                                    <span className='rounded-full border border-amber-300/60 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide text-amber-200'>
                                      Retrograde
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm text-purple-100'>
                          Ground yourself in these placements to understand the
                          themes shaping your journey.
                        </div>
                      </>
                    );
                  }

                  return (
                    <div className='text-center text-purple-100/80'>
                      <p className='mb-3 text-sm'>
                        Generate your complete birth chart with planetary
                        positions and cosmic insights.
                      </p>
                      <button
                        onClick={handleSave}
                        className='rounded-md bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700'
                      >
                        Generate Birth Chart
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className='w-full max-w-3xl rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6 shadow-lg'>
              <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
                <h3 className='text-xl font-semibold text-purple-300'>
                  Your Personal Card
                </h3>
                <span className='text-xs uppercase tracking-[0.2em] text-zinc-500'>
                  Tarot Signature
                </span>
              </div>
              {(() => {
                const personalCard = getPersonalCardFromProfile(me?.profile);

                if (personalCard) {
                  return (
                    <div className='space-y-3'>
                      <div className='text-center'>
                        <h4 className='text-lg font-bold text-white'>
                          {personalCard.name}
                        </h4>
                        <p className='text-sm text-purple-300'>
                          {personalCard.keywords.slice(0, 3).join(' • ')}
                        </p>
                      </div>
                      <p className='text-sm text-zinc-300'>
                        {personalCard.information}
                      </p>
                      <p className='text-xs italic text-zinc-500'>
                        {personalCard.reason}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className='text-center text-zinc-400'>
                    <p className='mb-3 text-sm'>
                      Generate your personalized tarot card based on your
                      birthday and name.
                    </p>
                    <button
                      onClick={handleSave}
                      className='rounded-md bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700'
                    >
                      Generate Personal Card
                    </button>
                  </div>
                );
              })()}
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
                  <span className='text-lg font-semibold text-purple-200'>
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
            customerId={
              (me?.profile as any)?.stripeCustomerId ||
              (me?.profile as any)?.subscription?.stripeCustomerId
            }
            subscriptionId={
              (me?.profile as any)?.subscription?.stripeSubscriptionId
            }
          />

          {subscription.hasAccess('yearly_forecast') && (
            <div className='rounded-xl border border-zinc-700 bg-zinc-900/70 shadow-lg p-6'>
              <YearlyForecast />
            </div>
          )}

          {subscription.hasAccess('data_export') && (
            <div className='rounded-xl border border-zinc-700 bg-zinc-900/70 shadow-lg p-6'>
              <h2 className='text-lg font-semibold text-white mb-2'>
                Export Your Data
              </h2>
              <p className='text-sm text-zinc-400 mb-4'>
                Download all your cosmic data including birth chart, tarot
                readings, collections, and more.
              </p>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/export/data');
                    if (!response.ok) {
                      if (response.status === 403) {
                        alert(
                          'Upgrade to Lunary+ AI Annual to export your data',
                        );
                      } else {
                        alert('Failed to export data');
                      }
                      return;
                    }
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    const contentDisposition = response.headers.get(
                      'Content-Disposition',
                    );
                    const filename = contentDisposition
                      ? contentDisposition
                          .split('filename=')[1]
                          ?.replace(/"/g, '')
                      : `lunary-export-${new Date().toISOString().split('T')[0]}.json`;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    alert('Failed to export data');
                  }
                }}
                className='inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700'
              >
                <Download className='w-4 h-4' />
                Export Data (JSON)
              </button>
            </div>
          )}
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
              className='rounded-full border border-zinc-700/70 px-4 py-1.5 text-zinc-300 transition hover:border-purple-500/60 hover:text-purple-200'
            >
              Browse Shop
            </a>
            <a
              href='/blog'
              className='rounded-full border border-zinc-700/70 px-4 py-1.5 text-zinc-300 transition hover:border-purple-500/60 hover:text-purple-200'
            >
              Read the Blog
            </a>
          </div>
        </div>
      </div>

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
