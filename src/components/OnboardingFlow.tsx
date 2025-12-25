'use client';

import { ReactNode, useState, useEffect } from 'react';
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
  Eye,
  Brain,
  Heart,
  Zap,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateBirthChart } from '../../utils/astrology/birthChart';
import { conversionTracking } from '@/lib/analytics';
import { OnboardingFeatureTour } from './OnboardingFeatureTour';
import { BirthdayInput } from './ui/birthday-input';
import { PlanId } from '../../utils/stripe-prices';

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
  previewStep?:
    | 'welcome'
    | 'birthday'
    | 'intention'
    | 'feature_tour'
    | 'complete';
}

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
    'welcome' | 'birthday' | 'intention' | 'feature_tour' | 'complete'
  >('welcome');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [birthday, setBirthday] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [selectedIntention, setSelectedIntention] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState({
    loading: true,
    completed: false,
  });
  const isSubscribedOrTrial =
    simulateSubscribed ||
    subscription.isSubscribed ||
    subscription.isTrialActive;
  const normalizedPlan =
    overridePlanId || normalizePlanType(subscription.planName || 'free');
  const activePlan =
    PRICING_PLANS.find((plan) => plan.id === normalizedPlan) ||
    PRICING_PLANS[0];
  const stepOrder: Array<
    'welcome' | 'birthday' | 'intention' | 'feature_tour' | 'complete'
  > = ['welcome', 'birthday', 'intention', 'feature_tour', 'complete'];
  const moonPhases = [
    {
      label: 'New Moon',
      src: '/icons/moon-phases/new-moon.svg',
    },
    {
      label: 'Waxing Crescent',
      src: '/icons/moon-phases/waxing-cresent-moon.svg',
    },
    {
      label: 'Half Moon',
      src: '/icons/moon-phases/first-quarter.svg',
    },
    {
      label: 'Waxing Gibbous',
      src: '/icons/moon-phases/waxing-gibbous-moon.svg',
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
          title: 'Plus AI guidance',
          items: [
            'Unlimited AI chat with your cosmic companion',
            'Personalized weekly reports + deeper readings',
            'Advanced pattern analysis + downloadable PDFs',
            'AI ritual generation + saved chat threads',
          ],
        },
      ];
    }

    return [
      { title: 'Everything in Lunary+', items: basePlanHighlights },
      {
        title: 'Everything in Lunary+ AI',
        items: [
          'Unlimited AI chat with your cosmic companion',
          'Personalized weekly reports + deeper readings',
          'Advanced pattern analysis + downloadable PDFs',
          'AI ritual generation + saved chat threads',
        ],
      },
      {
        title: 'Annual extras',
        items: [
          'Unlimited tarot spreads + annual deep dives',
          'Yearly forecast + extended timeline analysis',
          'Calendar download + unlimited collections',
          'Priority support + premium annual benefits',
        ],
      },
    ];
  })();

  useEffect(() => {
    if (!authState.isAuthenticated || !user?.id || previewMode) {
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

  const handleSaveBirthday = async () => {
    if (!birthday) return;

    setSaving(true);
    try {
      if (previewMode) {
        setCurrentStep('intention');
        return;
      }
      // Save to Postgres
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ birthday }),
      });

      // Track birth data submission
      if (user?.id) {
        conversionTracking.birthDataSubmitted(user.id);
      }

      // Generate birth chart immediately after birthday is saved
      try {
        const birthChart = await generateBirthChart(
          birthday,
          birthTime || undefined,
          birthLocation || undefined,
        );
        if (birthChart) {
          await fetch('/api/profile/birth-chart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ birthChart }),
          });
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

  const handleSkip = async () => {
    setShowSkipWarning(true);
  };

  const handleConfirmSkip = async (redirectPath?: string) => {
    await trackStepCompletion('complete', true);
    resolveOnboarding();
    setShowSkipWarning(false);
    setCurrentStep('complete');
    if (redirectPath && !previewMode) {
      router.push(redirectPath);
    }
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
      setCurrentStep('complete');
    }
  };

  const handleComplete = async () => {
    await trackStepCompletion(currentStep, false);
    resolveOnboarding();
    if (!previewMode) {
      // User already has subscription, send them to personalized content
      router.push('/book-of-shadows');
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

        {showSkipWarning && (
          <div className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/70 p-4'>
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
                  onClick={() => setShowSkipWarning(false)}
                  className='text-zinc-400 hover:text-white'
                  aria-label='Cancel'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>

              <div className='mt-4 flex flex-col gap-2'>
                <button
                  onClick={() => setShowSkipWarning(false)}
                  className='w-full rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 hover:border-zinc-500'
                >
                  Continue
                </button>
                <button
                  onClick={() => handleConfirmSkip('/profile')}
                  className='w-full rounded-lg bg-lunary-primary px-3 py-2 text-xs font-medium text-white hover:bg-lunary-primary-400'
                >
                  Go to profile
                </button>
                <button
                  onClick={() => handleConfirmSkip()}
                  className='w-full rounded-lg text-xs text-zinc-400 hover:text-zinc-200'
                >
                  Skip for now
                </button>
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
                <Image
                  src={phase.src}
                  alt={phase.label}
                  width={16}
                  height={16}
                />
              </div>
            );
          })}
        </div>

        {currentStep === 'welcome' && (
          <div className='space-y-6'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-16 h-16 mb-2'>
                <Image
                  src='/icons/moon-phases/full-moon.svg'
                  alt='Full Moon'
                  width={64}
                  height={64}
                  priority
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
                      ? `You’ve unlocked ${activePlan.name}`
                      : 'What’s waiting for you'}
                  </h3>
                  {isSubscribedOrTrial && (
                    <span className='text-[10px] uppercase tracking-wide text-lunary-accent-200/80'>
                      Premium unlocked
                    </span>
                  )}
                </div>
                <p className='text-xs text-zinc-300 mb-3'>
                  {isSubscribedOrTrial
                    ? 'Thanks for joining. Here’s everything now available in your plan.'
                    : 'Here’s what you can explore right away with a free account.'}
                </p>
                <div className='space-y-3 text-xs text-zinc-300'>
                  {planHighlights.map((section) => (
                    <div key={section.title} className='space-y-2'>
                      <div className='text-[11px] font-semibold uppercase tracking-wide text-zinc-400'>
                        {section.title}
                      </div>
                      <ul className='space-y-2'>
                        {section.items.map((feature) => (
                          <li key={feature} className='flex items-start gap-2'>
                            <span className='text-lunary-accent-300 mt-0.5'>
                              •
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='pt-4'>
              <button
                onClick={() => setCurrentStep('birthday')}
                className='w-full bg-gradient-to-r from-lunary-primary to-lunary-highlight hover:from-lunary-primary-400 hover:to-lunary-highlight-400 text-white py-3 px-6 rounded-lg font-medium transition-all'
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
              <h2 className='text-base font-semibold text-white mb-2 md:text-lg'>
                When Were You Born?
              </h2>
              <p className='text-zinc-300 text-sm'>
                Your birthday unlocks personalized cosmic insights
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
                  Birthday *
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
                    <input
                      type='text'
                      value={birthLocation}
                      onChange={(e) => setBirthLocation(e.target.value)}
                      placeholder='City, Country'
                      className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
                    />
                  </div>
                </div>
              )}

              <p className='text-xs text-zinc-400'>
                We use this to calculate your exact birth chart and planetary
                positions. Add birth time and location for the most accurate
                chart.
              </p>
            </div>

            <div className='pt-4 space-y-3'>
              <button
                onClick={handleSaveBirthday}
                disabled={!birthday || saving}
                className='w-full bg-gradient-to-r from-lunary-primary to-lunary-highlight hover:from-lunary-primary-400 hover:to-lunary-highlight-400 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all'
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
              <h2 className='text-base font-semibold text-white mb-2 md:text-lg'>
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
                        ? 'border-lunary-primary bg-lunary-primary-900'
                        : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto mb-2 ${
                        isSelected ? 'text-lunary-accent-300' : 'text-zinc-400'
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
                className='w-full bg-gradient-to-r from-lunary-primary to-lunary-highlight hover:from-lunary-primary-400 hover:to-lunary-highlight-400 text-white py-3 px-6 rounded-lg font-medium transition-all'
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
            onComplete={() => setCurrentStep('complete')}
            onSkip={handleStepSkip}
            planId={normalizedPlan as PlanId}
            isSubscribed={isSubscribedOrTrial}
          />
        )}

        {currentStep === 'complete' && (
          <div className='space-y-6 text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 mb-4'>
              <Image
                src='/icons/moon-phases/full-moon.svg'
                alt='Full Moon'
                width={64}
                height={64}
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
