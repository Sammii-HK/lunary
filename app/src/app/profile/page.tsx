'use client';

import { useAccount } from 'jazz-tools/react';
import { useState, useEffect } from 'react';
import {
  generateBirthChart,
  saveBirthChartToProfile,
  hasBirthChart,
} from '../../../utils/astrology/birthChart';

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

  const handleSave = () => {
    if (me?.profile) {
      try {
        // Actually save to Jazz profile
        (me.profile as any).name = name;
        (me.profile as any).birthday = birthday;

        // Generate and save birth chart if birthday is provided and chart doesn't exist
        if (birthday) {
          const hasExistingChart = hasBirthChart(me.profile);

          if (!hasExistingChart) {
            const birthChart = generateBirthChart(birthday);
            saveBirthChartToProfile(me.profile, birthChart);
          } else {
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
                {birthday ? new Date(birthday).toLocaleDateString() : 'Not set'}
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

      <div className='text-sm text-zinc-400 text-center max-w-md'>
        <p>
          Your profile information is stored securely and encrypted. It is
          completely optional but providing this information allows us to create
          a more personalized experience for you, with custom tarot readings,
          custom horoscopes, and a birth chart.
        </p>
      </div>
    </div>
  );
}
