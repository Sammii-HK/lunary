'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'jazz-tools/react';
import { useAuthStatus } from './AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { SmartTrialButton } from './SmartTrialButton';
import { X, Sparkles, Calendar, Star, NotebookPen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  generateBirthChart,
  saveBirthChartToProfile,
} from '../../utils/astrology/birthChart';
import { conversionTracking } from '@/lib/analytics';

export function OnboardingFlow() {
  const { me } = useAccount();
  const authState = useAuthStatus();
  const subscription = useSubscription();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    'welcome' | 'birthday' | 'complete'
  >('welcome');
  const [birthday, setBirthday] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Only show onboarding for authenticated users without birthday
    if (
      authState.isAuthenticated &&
      !authState.loading &&
      me?.profile &&
      !(me.profile as any)?.birthday &&
      !subscription.isSubscribed &&
      !subscription.isTrialActive
    ) {
      // Check if user has seen onboarding before
      const hasSeenOnboarding = localStorage.getItem('lunary_onboarding_seen');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [
    authState.isAuthenticated,
    authState.loading,
    me,
    subscription.isSubscribed,
    subscription.isTrialActive,
  ]);

  const handleSaveBirthday = async () => {
    if (!birthday || !me?.profile) return;

    setSaving(true);
    try {
      (me.profile as any).$jazz.set('birthday', birthday);

      // Track birth data submission
      const userId = (me as any)?.id;
      if (userId) {
        conversionTracking.birthDataSubmitted(userId);
      }

      // Generate birth chart immediately after birthday is saved
      try {
        const birthChart = generateBirthChart(birthday);
        if (birthChart && me.profile) {
          await saveBirthChartToProfile(me.profile, birthChart);
          console.log('✅ Birth chart generated and saved immediately');
        }
      } catch (chartError) {
        console.error('Failed to generate birth chart:', chartError);
        // Don't block onboarding if chart generation fails
      }

      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for sync
      setCurrentStep('complete');
    } catch (error) {
      console.error('Failed to save birthday:', error);
      alert('Failed to save birthday. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('lunary_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  const handleComplete = () => {
    localStorage.setItem('lunary_onboarding_seen', 'true');
    setShowOnboarding(false);
    if (subscription.isSubscribed || subscription.isTrialActive) {
      router.push('/book-of-shadows');
    } else {
      router.push('/pricing');
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
          className='absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors'
          aria-label='Skip onboarding'
        >
          <X className='w-5 h-5' />
        </button>

        {currentStep === 'welcome' && (
          <div className='space-y-6'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4'>
                <Sparkles className='w-8 h-8 text-purple-300' />
              </div>
              <h2 className='text-2xl font-bold text-white mb-2'>
                Welcome to your Book of Shadows
              </h2>
              <p className='text-zinc-300'>
                Share a few details so Lunary can gather the sky around your
                words.
              </p>
            </div>

            <div className='space-y-4'>
              <div className='flex items-start gap-4 p-4 bg-zinc-800/50 rounded-lg'>
                <div className='flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center'>
                  <Calendar className='w-5 h-5 text-purple-300' />
                </div>
                <div>
                  <h3 className='text-white font-medium mb-1'>
                    Your Birth Chart
                  </h3>
                  <p className='text-zinc-400 text-sm'>
                    Discover your unique planetary positions and cosmic
                    blueprint
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-4 p-4 bg-zinc-800/50 rounded-lg'>
                <div className='flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center'>
                  <Star className='w-5 h-5 text-purple-300' />
                </div>
                <div>
                  <h3 className='text-white font-medium mb-1'>
                    Personalized Horoscopes
                  </h3>
                  <p className='text-zinc-400 text-sm'>
                    Daily insights tailored to your exact birth chart
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-4 p-4 bg-zinc-800/50 rounded-lg'>
                <div className='flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center'>
                  <NotebookPen className='w-5 h-5 text-purple-300' />
                </div>
                <div>
                  <h3 className='text-white font-medium mb-1'>
                    Conversational Book of Shadows
                  </h3>
                  <p className='text-zinc-400 text-sm'>
                    Chat with Lunary&apos;s calm companion for reflective
                    guidance, grounded in your birth chart, tarot pulls, and the
                    current moon.
                  </p>
                </div>
              </div>
            </div>

            <div className='pt-4'>
              <button
                onClick={() => setCurrentStep('birthday')}
                className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-lg font-medium transition-all'
              >
                Get Started
              </button>
              <button
                onClick={handleSkip}
                className='w-full mt-3 text-zinc-400 hover:text-zinc-300 text-sm transition-colors'
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {currentStep === 'birthday' && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-white mb-2'>
                When Were You Born?
              </h2>
              <p className='text-zinc-300 text-sm'>
                Your birthday unlocks personalized cosmic insights
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-zinc-300 mb-2'>
                Birthday
              </label>
              <input
                type='date'
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
              <p className='text-xs text-zinc-400 mt-2'>
                We use this to calculate your exact birth chart and planetary
                positions
              </p>
            </div>

            <div className='pt-4 space-y-3'>
              <button
                onClick={handleSaveBirthday}
                disabled={!birthday || saving}
                className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all'
              >
                {saving ? 'Saving...' : 'Continue'}
              </button>
              <button
                onClick={() => setCurrentStep('welcome')}
                className='w-full text-zinc-400 hover:text-zinc-300 text-sm transition-colors'
              >
                Back
              </button>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className='space-y-6 text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4'>
              <Star className='w-8 h-8 text-green-300' />
            </div>
            <h2 className='text-2xl font-bold text-white mb-2'>
              You're All Set!
            </h2>
            <p className='text-zinc-300 mb-6'>
              Start your free trial to unlock personalized horoscopes, birth
              chart analysis, and cosmic insights.
            </p>

            <div className='pt-4'>
              <SmartTrialButton size='lg' fullWidth />
              <button
                onClick={handleComplete}
                className='w-full mt-3 text-zinc-400 hover:text-zinc-300 text-sm transition-colors'
              >
                Explore free features
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
