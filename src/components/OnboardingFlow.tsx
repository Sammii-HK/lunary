'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'jazz-tools/react';
import { useAuthStatus } from './AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { SmartTrialButton } from './SmartTrialButton';
import {
  X,
  Sparkles,
  Calendar,
  Star,
  NotebookPen,
  Eye,
  Brain,
  Heart,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  generateBirthChart,
  saveBirthChartToProfile,
} from '../../utils/astrology/birthChart';
import { conversionTracking } from '@/lib/analytics';
import { OnboardingFeatureTour } from './OnboardingFeatureTour';

export function OnboardingFlow() {
  const { me } = useAccount();
  const authState = useAuthStatus();
  const subscription = useSubscription();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    | 'welcome'
    | 'birthday'
    | 'intention'
    | 'feature_tour'
    | 'ai_preview'
    | 'complete'
  >('welcome');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [birthday, setBirthday] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [selectedIntention, setSelectedIntention] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [birthChartPreview, setBirthChartPreview] = useState<any>(null);

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

      // Save birth time and location if provided
      if (birthTime) {
        (me.profile as any).$jazz.set('birthTime', birthTime);
      }
      if (birthLocation) {
        (me.profile as any).$jazz.set('birthLocation', birthLocation);
      }

      // Generate birth chart immediately after birthday is saved
      try {
        const birthChart = await generateBirthChart(
          birthday,
          birthTime || undefined,
          birthLocation || undefined,
        );
        if (birthChart && me.profile) {
          await saveBirthChartToProfile(me.profile, birthChart);
          setBirthChartPreview(birthChart);
          console.log('✅ Birth chart generated and saved immediately');
        }
      } catch (chartError) {
        console.error('Failed to generate birth chart:', chartError);
      }

      // Sync birthday to push subscription for server-side notifications
      try {
        const profile = me.profile as any;
        await fetch('/api/notifications/sync-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birthday,
            name: profile?.name || null,
            email: profile?.email || null,
          }),
        });
        console.log('✅ Birthday synced to push subscription');
      } catch (syncError) {
        console.error(
          'Failed to sync birthday to push subscription:',
          syncError,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentStep('intention');
    } catch (error) {
      console.error('Failed to save birthday:', error);
      alert('Failed to save birthday. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const trackStepCompletion = async (
    step: string,
    skipped: boolean = false,
  ) => {
    try {
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

  const handleSkip = async () => {
    await trackStepCompletion(currentStep, true);
    localStorage.setItem('lunary_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  const handleStepSkip = async () => {
    await trackStepCompletion(currentStep, true);
    if (currentStep === 'welcome') {
      setCurrentStep('birthday');
    } else if (currentStep === 'birthday') {
      setCurrentStep('intention');
    } else if (currentStep === 'intention') {
      setCurrentStep('feature_tour');
    } else if (currentStep === 'feature_tour') {
      setCurrentStep('ai_preview');
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await trackStepCompletion(currentStep, false);
    localStorage.setItem('lunary_onboarding_seen', 'true');
    setShowOnboarding(false);
    if (subscription.isSubscribed || subscription.isTrialActive) {
      router.push('/book-of-shadows');
    } else {
      router.push('/pricing');
    }
  };

  const handleNext = async () => {
    await trackStepCompletion(currentStep, false);
    if (currentStep === 'welcome') {
      setCurrentStep('birthday');
    } else if (currentStep === 'birthday') {
      setCurrentStep('intention');
    } else if (currentStep === 'intention') {
      setCurrentStep('feature_tour');
    } else if (currentStep === 'feature_tour') {
      setCurrentStep('ai_preview');
    } else {
      handleComplete();
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

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-zinc-300 mb-2'>
                  Birthday *
                </label>
                <input
                  type='date'
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-zinc-300 mb-2'>
                  Birth Time (optional)
                </label>
                <input
                  type='time'
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
                />
                <p className='text-xs text-zinc-400 mt-1'>
                  More precise time = more accurate chart
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-zinc-300 mb-2'>
                  Birth Location (optional)
                </label>
                <input
                  type='text'
                  value={birthLocation}
                  onChange={(e) => setBirthLocation(e.target.value)}
                  placeholder='City, Country'
                  className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500'
                />
              </div>

              <p className='text-xs text-zinc-400'>
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
              <div className='flex items-center justify-between'>
                <button
                  onClick={() => setCurrentStep('welcome')}
                  className='text-zinc-400 hover:text-zinc-300 text-sm transition-colors'
                >
                  Back
                </button>
                <button
                  onClick={handleStepSkip}
                  className='text-zinc-400 hover:text-zinc-300 text-sm transition-colors'
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'intention' && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-white mb-2'>
                What brings you here?
              </h2>
              <p className='text-zinc-300 text-sm'>
                Help us personalize your experience
              </p>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              {[
                { id: 'clarity', label: 'Clarity', icon: Eye, color: 'purple' },
                {
                  id: 'confidence',
                  label: 'Confidence',
                  icon: Zap,
                  color: 'yellow',
                },
                { id: 'calm', label: 'Calm', icon: Heart, color: 'pink' },
                { id: 'insight', label: 'Insight', icon: Brain, color: 'blue' },
              ].map((intention) => {
                const Icon = intention.icon;
                const isSelected = selectedIntention === intention.id;
                return (
                  <button
                    key={intention.id}
                    onClick={() => setSelectedIntention(intention.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto mb-2 ${
                        isSelected ? 'text-purple-300' : 'text-zinc-400'
                      }`}
                    />
                    <div
                      className={`text-sm font-medium ${
                        isSelected ? 'text-white' : 'text-zinc-300'
                      }`}
                    >
                      {intention.label}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className='pt-4 space-y-3'>
              <button
                onClick={() => {
                  if (selectedIntention) {
                    conversionTracking.upgradeClicked(
                      'onboarding_intention',
                      selectedIntention,
                    );
                  }
                  handleNext();
                }}
                className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-lg font-medium transition-all'
              >
                Continue
              </button>
              <div className='flex items-center justify-between'>
                <button
                  onClick={() => setCurrentStep('birthday')}
                  className='text-zinc-400 hover:text-zinc-300 text-sm transition-colors'
                >
                  Back
                </button>
                <button
                  onClick={handleStepSkip}
                  className='text-zinc-400 hover:text-zinc-300 text-sm transition-colors'
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'feature_tour' && (
          <OnboardingFeatureTour
            onComplete={handleNext}
            onSkip={handleStepSkip}
          />
        )}

        {currentStep === 'ai_preview' && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-white mb-2'>
                Unlock Lunary AI
              </h2>
              <p className='text-zinc-300 text-sm'>
                See what personalized guidance looks like
              </p>
            </div>

            {birthChartPreview && birthChartPreview.length > 0 && (
              <div className='p-4 bg-zinc-800/50 rounded-lg border border-zinc-700'>
                <h3 className='text-sm font-medium text-white mb-2'>
                  Your Birth Chart Preview
                </h3>
                <div className='space-y-2 text-xs text-zinc-300'>
                  {birthChartPreview
                    .slice(0, 3)
                    .map((planet: any, idx: number) => (
                      <div key={idx} className='flex justify-between'>
                        <span>{planet.body}</span>
                        <span className='text-purple-300'>{planet.sign}</span>
                      </div>
                    ))}
                  {birthChartPreview.length > 3 && (
                    <div className='text-zinc-500 text-xs'>
                      +{birthChartPreview.length - 3} more planets
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className='p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30'>
              <h3 className='text-sm font-medium text-white mb-2 flex items-center gap-2'>
                <Sparkles className='w-4 h-4 text-purple-300' />
                What You Unlock with Lunary AI
              </h3>
              <ul className='space-y-2 text-xs text-zinc-300'>
                <li className='flex items-start gap-2'>
                  <span className='text-purple-300 mt-0.5'>•</span>
                  <span>
                    Unlimited conversations with your cosmic companion
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-purple-300 mt-0.5'>•</span>
                  <span>
                    Personalized insights based on your exact birth chart
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-purple-300 mt-0.5'>•</span>
                  <span>Ritual suggestions aligned with current transits</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-purple-300 mt-0.5'>•</span>
                  <span>Deeper tarot interpretations and cosmic guidance</span>
                </li>
              </ul>
            </div>

            <div className='p-4 bg-zinc-800/50 rounded-lg border border-zinc-700'>
              <h3 className='text-sm font-medium text-white mb-2'>
                Quick Transit Explanation
              </h3>
              <p className='text-xs text-zinc-300 leading-relaxed'>
                Transits are when current planetary positions interact with your
                birth chart. For example, when Jupiter transits your Sun sign,
                it brings expansion and growth opportunities. Lunary AI explains
                these in simple, meaningful ways.
              </p>
            </div>

            <div className='pt-4 space-y-3'>
              <button
                onClick={() => setCurrentStep('complete')}
                className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-lg font-medium transition-all'
              >
                Start Free Trial
              </button>
              <button
                onClick={() => setCurrentStep('intention')}
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
