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
import { Paywall, UpgradePrompt } from '../../components/Paywall';

export default function ProfilePage() {
  const { me } = useAccount();
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  if (!me) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
        <p className='text-zinc-400'>Loading your profile...</p>
      </div>
    );
  }

  return (
    <>
      <UpgradePrompt />
      <div className='flex flex-col items-center gap-6 py-8'>
        <h1 className='text-2xl font-bold text-white'>Your Profile</h1>

        <div className='bg-zinc-800 rounded-lg p-6 w-full max-w-md'>
          {isEditing ? (
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-zinc-300 mb-2'>
                  Name
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter your name'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-zinc-300 mb-2'>
                  Birthday
                </label>
                <input
                  type='date'
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className='w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!name || !birthday}
                className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors'
              >
                Save Profile
              </button>
            </div>
          ) : (
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-zinc-300 mb-1'>
                  Name
                </label>
                <p className='text-white'>{name || 'Not set'}</p>
              </div>

              <div>
                <label className='block text-sm font-medium text-zinc-300 mb-1'>
                  Birthday
                </label>
                <p className='text-white'>
                  {birthday
                    ? new Date(birthday).toLocaleDateString()
                    : 'Not set'}
                </p>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors'
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Cosmic Data Sections */}
        {!isEditing && birthday && (
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
                }
                return (
                  <p className='text-zinc-400'>
                    Calculating your personal card...
                  </p>
                );
              })()}
            </div>

            {/* Cosmic Profile Section */}
            <div className='w-full max-w-md p-4 bg-zinc-800 rounded-lg border border-zinc-700'>
              <h3 className='text-lg font-semibold text-blue-400 mb-3'>
                Your Cosmic Profile
              </h3>
              {(() => {
                const birthChart = getBirthChartFromProfile(me?.profile);
                if (birthChart && birthChart.length > 0) {
                  const sunSign = birthChart.find(
                    (p) => p.body === 'Sun',
                  )?.sign;
                  const moonSign = birthChart.find(
                    (p) => p.body === 'Moon',
                  )?.sign;
                  const risingSign = birthChart.find(
                    (p) => p.body === 'Ascendant',
                  )?.sign;
                  const mercury = birthChart.find(
                    (p) => p.body === 'Mercury',
                  )?.sign;
                  const venus = birthChart.find(
                    (p) => p.body === 'Venus',
                  )?.sign;
                  const mars = birthChart.find((p) => p.body === 'Mars')?.sign;

                  return (
                    <div className='space-y-4'>
                      {/* Big Three */}
                      <div>
                        <h4 className='text-sm font-medium text-zinc-300 mb-2'>
                          The Big Three
                        </h4>
                        <div className='grid grid-cols-3 gap-2 text-center'>
                          {sunSign && (
                            <div>
                              <p className='text-xs text-zinc-400'>Sun</p>
                              <p className='text-sm font-medium text-yellow-400'>
                                {sunSign}
                              </p>
                              <p className='text-xs text-zinc-500'>Identity</p>
                            </div>
                          )}
                          {moonSign && (
                            <div>
                              <p className='text-xs text-zinc-400'>Moon</p>
                              <p className='text-sm font-medium text-blue-400'>
                                {moonSign}
                              </p>
                              <p className='text-xs text-zinc-500'>Emotions</p>
                            </div>
                          )}
                          {risingSign && (
                            <div>
                              <p className='text-xs text-zinc-400'>Rising</p>
                              <p className='text-sm font-medium text-purple-400'>
                                {risingSign}
                              </p>
                              <p className='text-xs text-zinc-500'>
                                Personality
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Personal Planets */}
                      <div>
                        <h4 className='text-sm font-medium text-zinc-300 mb-2'>
                          Personal Planets
                        </h4>
                        <div className='grid grid-cols-3 gap-2 text-center'>
                          {mercury && (
                            <div>
                              <p className='text-xs text-zinc-400'>Mercury</p>
                              <p className='text-sm font-medium text-green-400'>
                                {mercury}
                              </p>
                              <p className='text-xs text-zinc-500'>
                                Communication
                              </p>
                            </div>
                          )}
                          {venus && (
                            <div>
                              <p className='text-xs text-zinc-400'>Venus</p>
                              <p className='text-sm font-medium text-pink-400'>
                                {venus}
                              </p>
                              <p className='text-xs text-zinc-500'>
                                Love & Beauty
                              </p>
                            </div>
                          )}
                          {mars && (
                            <div>
                              <p className='text-xs text-zinc-400'>Mars</p>
                              <p className='text-sm font-medium text-red-400'>
                                {mars}
                              </p>
                              <p className='text-xs text-zinc-500'>
                                Action & Drive
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Links */}
                      <div className='flex justify-between text-xs'>
                        <a
                          href='/birth-chart'
                          className='text-blue-400 hover:text-blue-300 underline'
                        >
                          View Full Birth Chart →
                        </a>
                        <a
                          href='/horoscope'
                          className='text-purple-400 hover:text-purple-300 underline'
                        >
                          Today&apos;s Horoscope →
                        </a>
                      </div>
                    </div>
                  );
                }
                return (
                  <p className='text-zinc-400'>
                    Calculating your cosmic profile...
                  </p>
                );
              })()}
            </div>
          </>
        )}

        <div className='text-sm text-zinc-400 text-center max-w-md'>
          <p>
            Your cosmic profile information is stored securely and encrypted.
            This includes your personal tarot card and birth chart data, which
            create a personalized spiritual experience with custom readings and
            insights.
          </p>
        </div>
      </div>
    </>
  );
}
