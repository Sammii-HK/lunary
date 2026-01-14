'use client';

import { useState } from 'react';
import { BookOpen, Sparkles, Calendar, ChevronRight } from 'lucide-react';

type PlanId =
  | 'free'
  | 'lunary_plus'
  | 'lunary_plus_ai'
  | 'lunary_plus_ai_annual';

interface FeatureTourProps {
  onComplete: () => void;
  onSkip: () => void;
  planId?: PlanId;
  isSubscribed?: boolean;
}

const features = [
  {
    id: 'book-of-shadows',
    title: 'Book of Shadows',
    description:
      'Your guided space for reflection, patterns, and ritual grounding.',
    icon: BookOpen,
    highlights: [
      'Capture insights, intentions, and daily reflections',
      'Track themes over time in one place',
      'Use prompts and rituals to go deeper',
    ],
  },
  {
    id: 'tarot',
    title: 'Tarot Readings',
    description: 'Daily and deep-dive tarot that connects to your real life.',
    icon: Sparkles,
    highlights: [
      'Daily card pulls with clear meaning',
      'Spreads for love, work, or decisions',
      'Patterns to see what keeps repeating',
    ],
  },
  {
    id: 'horoscope',
    title: 'Horoscope',
    description: 'A daily compass that turns the sky into clear guidance.',
    icon: Calendar,
    highlights: [
      'Daily themes you can act on',
      'Transits explained in plain language',
      'Quick overview of the day ahead',
    ],
  },
];

export function OnboardingFeatureTour({
  onComplete,
  onSkip,
  planId = 'free',
  isSubscribed = false,
}: FeatureTourProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const basePlanHighlights = [
    'Complete birth chart analysis + personal transits',
    'Personalized daily horoscopes and tarot guidance',
    'Moon Circles for new + full moons',
    'Ritual generator, collections, and monthly insights',
    'Personalized crystal recommendations + cosmic state',
  ];

  const planHighlights = (() => {
    if (!isSubscribed || planId === 'free') {
      return [
        {
          title: 'Included with your account',
          items: [
            'Your personal birth chart overview and key placements',
            'Daily moon phase insights + general horoscope',
            'Tarot card of the day + basic lunar calendar',
            'Grimoire library for astrology, tarot, and rituals',
            'Weekly AI ritual/reading to get started',
          ],
        },
      ];
    }

    if (planId === 'lunary_plus') {
      return [{ title: 'Lunary+ includes', items: basePlanHighlights }];
    }

    if (planId === 'lunary_plus_ai') {
      return [
        { title: 'Everything in Lunary+', items: basePlanHighlights },
        {
          title: 'Plus AI guidance',
          items: [
            'Effectively unlimited AI chat + saved threads',
            'Personalized weekly reports + deeper readings',
            'Advanced pattern analysis + downloadable PDFs',
            'AI ritual generation + deeper guidance',
          ],
        },
      ];
    }

    return [
      { title: 'Everything in Lunary+', items: basePlanHighlights },
      {
        title: 'Everything in Lunary+ AI',
        items: [
          'Effectively unlimited AI chat + saved threads',
          'Personalized weekly reports + deeper readings',
          'Advanced pattern analysis + downloadable PDFs',
          'AI ritual generation + deeper guidance',
        ],
      },
      {
        title: 'Annual extras',
        items: [
          'Unlimited tarot spreads + annual deep dives',
          'Yearly forecast + extended timeline analysis',
          'Calendar download + unlimited collections',
          'Priority support + annual benefits',
        ],
      },
    ];
  })();

  const handleNext = () => {
    if (currentFeature < features.length - 1) {
      setCurrentFeature(currentFeature + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const Feature = features[currentFeature];
  const Icon = Feature.icon;

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h2 className='text-base font-semibold text-white mb-2 md:text-lg'>
          Feature tour
        </h2>
        <p className='text-sm text-zinc-400'>
          Here’s how your plan turns the sky into daily guidance.
        </p>
      </div>

      <div className='flex flex-wrap justify-center gap-2'>
        {features.map((feature, idx) => (
          <button
            key={feature.id}
            type='button'
            onClick={() => setCurrentFeature(idx)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              idx === currentFeature
                ? 'bg-lunary-primary text-white'
                : 'border border-zinc-700 text-zinc-300 hover:border-zinc-500'
            }`}
            aria-label={`Show ${feature.title}`}
          >
            {feature.title}
          </button>
        ))}
      </div>

      <div className='rounded-xl border border-zinc-800 bg-zinc-950/60 p-4'>
        <div className='flex items-start gap-3'>
          <div className='inline-flex h-10 w-10 items-center justify-center rounded-lg bg-lunary-primary-500/20'>
            <Icon className='h-5 w-5 text-lunary-primary-300' />
          </div>
          <div>
            <h3 className='text-sm font-semibold text-white'>
              {Feature.title}
            </h3>
            <p className='text-xs text-zinc-400 mt-1'>{Feature.description}</p>
          </div>
        </div>
        <div className='mt-4 space-y-2 text-xs text-zinc-300'>
          {Feature.highlights.map((item) => (
            <div key={item} className='flex items-start gap-2'>
              <span className='text-lunary-accent-300 mt-0.5'>•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className='mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4'>
          <div className='flex items-center justify-between mb-2'>
            <h4 className='text-xs font-semibold text-zinc-200 uppercase tracking-wide'>
              {isSubscribed && planId !== 'free'
                ? 'Unlocked in your plan'
                : 'Included with your account'}
            </h4>
            {isSubscribed && planId !== 'free' && (
              <span className='text-[10px] uppercase tracking-wide text-lunary-accent-200/80'>
                Premium
              </span>
            )}
          </div>
          <div className='space-y-3 text-xs text-zinc-300'>
            {planHighlights.map((section) => (
              <div key={section.title} className='space-y-2'>
                <div className='text-[11px] font-semibold uppercase tracking-wide text-zinc-400'>
                  {section.title}
                </div>
                <div className='grid gap-2 sm:grid-cols-2'>
                  {section.items.map((item) => (
                    <div key={item} className='flex items-start gap-2'>
                      <span className='text-lunary-accent-300 mt-0.5'>•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between gap-3'>
        <button
          onClick={handleSkip}
          className='px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors'
        >
          Skip
        </button>
        <div className='flex gap-2'>
          {currentFeature < features.length - 1 ? (
            <button
              onClick={handleNext}
              className='inline-flex items-center gap-2 rounded-lg bg-lunary-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lunary-primary-700'
            >
              Next
              <ChevronRight className='w-4 h-4' />
            </button>
          ) : (
            <button
              onClick={onComplete}
              className='inline-flex items-center gap-2 rounded-lg bg-lunary-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lunary-primary-700'
            >
              Continue
              <ChevronRight className='w-4 h-4' />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
