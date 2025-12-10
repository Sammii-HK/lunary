'use client';

import { useState } from 'react';
import { BookOpen, Sparkles, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface FeatureTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const features = [
  {
    id: 'book-of-shadows',
    title: 'Book of Shadows',
    description:
      'Your AI-powered cosmic guide. Ask questions, get personalized insights, and explore your spiritual journey.',
    icon: BookOpen,
    link: '/book-of-shadows',
  },
  {
    id: 'tarot',
    title: 'Tarot Readings',
    description:
      'Daily cards, personalized spreads, and pattern analysis to guide your journey.',
    icon: Sparkles,
    link: '/tarot',
  },
  {
    id: 'horoscope',
    title: 'Horoscope',
    description:
      'Personalized daily horoscopes based on your birth chart and current transits.',
    icon: Calendar,
    link: '/horoscope',
  },
];

export function OnboardingFeatureTour({
  onComplete,
  onSkip,
}: FeatureTourProps) {
  const [currentFeature, setCurrentFeature] = useState(0);

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
        <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-lunary-primary-500/20 mb-4'>
          <Icon className='w-8 h-8 text-lunary-primary-300' />
        </div>
        <h2 className='text-2xl font-bold text-white mb-2'>{Feature.title}</h2>
        <p className='text-zinc-400'>{Feature.description}</p>
      </div>

      <div className='flex items-center justify-center gap-2'>
        {features.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all ${
              idx === currentFeature
                ? 'w-8 bg-lunary-primary-500'
                : 'w-2 bg-zinc-700'
            }`}
          />
        ))}
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
            <Link
              href={Feature.link}
              onClick={onComplete}
              className='inline-flex items-center gap-2 rounded-lg bg-lunary-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lunary-primary-700'
            >
              Explore {Feature.title}
              <ChevronRight className='w-4 h-4' />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
