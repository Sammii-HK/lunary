'use client';

import { useAccount } from 'jazz-tools/react';
import { useState, useEffect } from 'react';
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
import { AuthComponent } from '@/components/Auth';
import { betterAuthClient } from '@/lib/auth-client';

export default function ProfilePage() {
  const { me } = useAccount();
  const subscription = useSubscription();
  const [authUser, setAuthUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check if user can collect birthday data
  const canCollectBirthdayData = canCollectBirthday(subscription.status);
  const hasBirthChartAccessData = hasBirthChartAccess(subscription.status);

  // Check Better Auth session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await betterAuthClient.getSession();
        setAuthUser(session && 'user' in session ? session.user : null);
      } catch (error) {
        setAuthUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Load existing profile data when component mounts
  useEffect(() => {
    if (me?.profile) {
      try {
        const profileName = (me.profile as any).name || '';
        const profileBirthday = (me.profile as any).birthday || '';

        setName(profileName);
        setBirthday(profileBirthday);

        // If profile is empty, start in editing mode
        setIsEditing(!profileName && !profileBirthday);
        setIsLoading(false);
      } catch (error) {
        console.log('Error loading profile:', error);
        setIsLoading(false);
        setIsEditing(true);
      }
    }
  }, [me?.profile]);

  const handleSave = async () => {
    if (me?.profile) {
      try {
        // Actually save to Jazz profile
        (me.profile as any).name = name;
        (me.profile as any).birthday = birthday;

        // Generate and save cosmic data if birthday is provided
        if (birthday) {
          console.log('Profile before cosmic data generation:', me.profile);

          const hasExistingChart = hasBirthChart(me.profile);
          const hasExistingPersonalCard = hasPersonalCard(me.profile);

          console.log('Cosmic data check:', {
            hasChart: hasExistingChart,
            hasPersonalCard: hasExistingPersonalCard,
            birthday,
            name,
          });

          if (!hasExistingChart) {
            console.log('Generating birth chart...');
            const birthChart = generateBirthChart(birthday);
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
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400'></div>
        <p className='text-zinc-400'>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center gap-6 py-8'>
      <h1 className='text-2xl font-bold text-white text-center'>
        Your Profile
      </h1>

      <div className='bg-zinc-800 rounded-lg p-6 w-full max-w-md'>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-zinc-300 mb-2'>
              Name
              {canCollectBirthdayData && (
                <span className='text-purple-400 text-xs ml-2'>
                  ✨ Premium Feature
                </span>
              )}
            </label>
            {isEditing && authUser && canCollectBirthdayData ? (
              <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter your name'
              />
            ) : (
              <div className='w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white min-h-[2.5rem] flex items-center'>
                {canCollectBirthdayData
                  ? name || 'Your name will appear here'
                  : 'Premium feature - upgrade to customize'}
              </div>
            )}
          </div>

          {canCollectBirthdayData ? (
            <div>
              <label className='block text-sm font-medium text-zinc-300 mb-2'>
                Birthday
                <span className='text-purple-400 text-xs ml-2'>
                  ✨ Premium Feature
                </span>
              </label>
              {isEditing && authUser ? (
                <input
                  type='date'
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className='w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              ) : (
                <div className='w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white min-h-[2.5rem] flex items-center'>
                  {birthday
                    ? new Date(birthday).toLocaleDateString()
                    : 'Your birthday will appear here'}
                </div>
              )}
              {isEditing && authUser && (
                <p className='text-xs text-zinc-400 mt-1'>
                  Your birthday enables personalized birth chart analysis,
                  horoscopes, and cosmic insights.
                </p>
              )}
            </div>
          ) : (
            <div className='bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg p-4 border border-purple-500/30'>
              <h4 className='text-white font-medium mb-2'>
                🎂 Birthday Collection
              </h4>
              <p className='text-zinc-300 text-sm mb-3'>
                Unlock personalized astrology by providing your birthday. Get
                your birth chart, personalized horoscopes, and cosmic insights
                tailored specifically to you.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className='inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300'
              >
                Start Free Trial
              </button>
            </div>
          )}

          {/* Show edit/save button only when authenticated */}
          {authUser && (
            <>
              {isEditing ? (
                <button
                  onClick={handleSave}
                  disabled={!name || (!canCollectBirthdayData && !birthday)}
                  className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors'
                >
                  Save Profile
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors'
                >
                  Edit Profile
                </button>
              )}
            </>
          )}

          {/* Authentication and Subscription Controls */}
          {!authUser ? (
            /* Not authenticated - show sign in */
            <div className='text-center py-4 border-2 border-dashed border-zinc-600 rounded-md space-y-3'>
              <p className='text-zinc-400 text-sm'>
                Sign in to save your profile and unlock cosmic insights
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors'
              >
                Sign In or Create Account
              </button>
            </div>
          ) : !canCollectBirthdayData ? (
            /* Authenticated but no premium - show upgrade */
            <div className='text-center py-4 border-2 border-dashed border-purple-500/30 rounded-md space-y-3 bg-gradient-to-r from-purple-900/20 to-pink-900/20'>
              <p className='text-zinc-300 text-sm'>
                👋 Welcome {authUser.name}! Upgrade to unlock premium features
              </p>
              <div className='flex gap-2 justify-center'>
                <a
                  href='/pricing'
                  className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300'
                >
                  Upgrade to Premium
                </a>
                <button
                  onClick={async () => {
                    try {
                      await betterAuthClient.signOut();
                      window.location.reload();
                    } catch (error) {
                      console.error('Sign out failed:', error);
                    }
                  }}
                  className='text-red-400 hover:text-red-300 px-4 py-2 text-sm transition-colors'
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Authenticated with premium - show edit controls */
            <>
              {isEditing ? (
                <button
                  onClick={handleSave}
                  disabled={!name || (!canCollectBirthdayData && !birthday)}
                  className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors'
                >
                  Save Profile
                </button>
              ) : (
                <div className='flex gap-2'>
                  <button
                    onClick={() => setIsEditing(true)}
                    className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors'
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await betterAuthClient.signOut();
                        window.location.reload();
                      } catch (error) {
                        console.error('Sign out failed:', error);
                      }
                    }}
                    className='text-red-400 hover:text-red-300 px-4 py-2 text-sm transition-colors'
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Cosmic Data Sections - only show for authenticated users */}
      {authUser && !isEditing && birthday && hasBirthChartAccessData && (
        <>
          {/* Personal Card Section */}
          <div className='w-full max-w-md p-4 bg-zinc-800 rounded-lg border border-zinc-700'>
            <h3 className='text-lg font-semibold text-purple-400 mb-3'>
              Your Personal Card
            </h3>
            {(() => {
              console.log('Checking personal card in profile render...');
              const personalCard = getPersonalCardFromProfile(me?.profile);
              console.log('Personal card retrieved:', personalCard);
              if (personalCard) {
                return (
                  <div className='space-y-3'>
                    <div className='text-center'>
                      <h4 className='font-bold text-white text-lg'>
                        {personalCard.name}
                      </h4>
                      <p className='text-sm text-purple-300'>
                        {personalCard.keywords.slice(0, 3).join(' • ')}
                      </p>
                    </div>
                    <p className='text-sm text-zinc-300'>
                      {personalCard.information}
                    </p>
                    <p className='text-xs text-zinc-500 italic'>
                      {personalCard.reason}
                    </p>
                  </div>
                );
              } else {
                console.log('No personal card found, rendering link...');
                return (
                  <div className='text-center text-zinc-400'>
                    <p className='text-sm mb-3'>
                      Generate your personalized tarot card based on your
                      birthday and name.
                    </p>
                    <button
                      onClick={handleSave}
                      className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm transition-colors'
                    >
                      Generate Personal Card
                    </button>
                  </div>
                );
              }
            })()}
          </div>

          {/* Birth Chart Section */}
          <div className='w-full max-w-md p-4 bg-zinc-800 rounded-lg border border-zinc-700'>
            <h3 className='text-lg font-semibold text-purple-400 mb-3'>
              Your Birth Chart
            </h3>
            {(() => {
              const hasBirthChartData = hasBirthChart(me?.profile);
              const birthChartData = hasBirthChartData
                ? getBirthChartFromProfile(me?.profile)
                : null;

              if (birthChartData && birthChartData.length > 0) {
                // Display birth chart placements
                const keyPlacements = [
                  'Sun',
                  'Moon',
                  'Mercury',
                  'Venus',
                  'Mars',
                ]
                  .map((bodyName) =>
                    birthChartData.find((planet) => planet.body === bodyName),
                  )
                  .filter((planet): planet is NonNullable<typeof planet> =>
                    Boolean(planet),
                  );

                return (
                  <div className='space-y-3'>
                    <div className='grid grid-cols-1 gap-2'>
                      {keyPlacements.map((planet) => (
                        <div
                          key={planet.body}
                          className='flex justify-between items-center p-2 bg-zinc-700 rounded'
                        >
                          <span className='text-white font-medium'>
                            {planet.body}
                          </span>
                          <span className='text-purple-300'>{planet.sign}</span>
                        </div>
                      ))}
                    </div>
                    <div className='text-center'>
                      <a
                        href='/birth-chart'
                        className='text-blue-400 text-sm hover:underline'
                      >
                        View Full Birth Chart
                      </a>
                    </div>
                  </div>
                );
              } else {
                console.log(
                  'No birth chart found, rendering generation link...',
                );
                return (
                  <div className='text-center text-zinc-400'>
                    <p className='text-sm mb-3'>
                      Generate your complete birth chart with planetary
                      positions and cosmic insights.
                    </p>
                    <button
                      onClick={handleSave}
                      className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm transition-colors'
                    >
                      Generate Birth Chart
                    </button>
                  </div>
                );
              }
            })()}
          </div>
        </>
      )}

      {/* Location Setup - only for authenticated users */}
      {authUser && !isEditing && <LocationRefresh />}

      {/* Subscription Management Section - only for authenticated users */}
      {authUser && !isEditing && (
        <SubscriptionManagement
          customerId={
            (me?.profile as any)?.stripeCustomerId ||
            (me?.profile as any)?.subscription?.stripeCustomerId
          }
          subscriptionId={
            (me?.profile as any)?.subscription?.stripeSubscriptionId
          }
        />
      )}

      {/* Debug Info */}
      <div className='w-full max-w-md'>
        <div className='text-sm text-zinc-400 text-center max-w-md'>
          <p>
            Your cosmic profile information is stored securely and encrypted.
            This includes your personal tarot card and birth chart data, which
            create a personalized spiritual experience with custom readings and
            insights.
          </p>
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
                setShowAuthModal(false);
                window.location.reload();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
