'use client';

import { useState } from 'react';
import { OnboardingFlow } from '@/components/OnboardingFlow';

const planOptions = [
  { id: 'free', label: 'Free' },
  { id: 'lunary_plus', label: 'Lunary+' },
  { id: 'lunary_plus_ai', label: 'Lunary+ Pro' },
  { id: 'lunary_plus_ai_annual', label: 'Lunary+ Pro Annual' },
] as const;

const stepOptions = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'intention', label: 'Intention' },
  { id: 'feature_tour', label: 'Tour' },
  { id: 'complete', label: 'Complete' },
] as const;

type PlanId = (typeof planOptions)[number]['id'];
type StepId = (typeof stepOptions)[number]['id'];

export default function OnboardingPreviewPage() {
  const [planId, setPlanId] = useState<PlanId>('free');
  const [stepId, setStepId] = useState<StepId>('welcome');

  const previewHeader = (
    <div className='space-y-2'>
      <div className='text-xs font-medium uppercase tracking-wide text-zinc-500'>
        Preview subscription tier
      </div>
      <div className='flex flex-wrap gap-2'>
        {planOptions.map((plan) => {
          const isActive = plan.id === planId;
          return (
            <button
              key={plan.id}
              type='button'
              onClick={() => setPlanId(plan.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                isActive
                  ? 'bg-lunary-primary text-white'
                  : 'border border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              {plan.label}
            </button>
          );
        })}
      </div>
      <div className='text-xs font-medium uppercase tracking-wide text-zinc-500 pt-2'>
        Preview step
      </div>
      <div className='flex flex-wrap gap-2'>
        {stepOptions.map((step) => {
          const isActive = step.id === stepId;
          return (
            <button
              key={step.id}
              type='button'
              onClick={() => setStepId(step.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                isActive
                  ? 'bg-zinc-700 text-white'
                  : 'border border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='mx-auto max-w-3xl px-6 py-8'>
        <h1 className='text-2xl font-semibold text-white'>
          Onboarding Preview
        </h1>
        <p className='mt-2 text-sm text-zinc-400'>
          Use the tabs inside the modal to preview onboarding by subscription
          tier.
        </p>
      </div>

      <OnboardingFlow
        forceOpen
        previewMode
        overridePlanId={planId}
        simulateSubscribed={planId !== 'free'}
        previewHeader={previewHeader}
        previewStep={stepId}
      />
    </div>
  );
}
