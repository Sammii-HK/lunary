'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStatus } from '@/components/AuthStatus';
import { useUser } from '@/context/UserContext';
import { useSubscription } from '@/hooks/useSubscription';
import { hasFeatureAccess } from '../../utils/pricing';
import { Sparkles, Lock, Star, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { CosmicScoreCategories } from '@/utils/cosmic-score';
import { ShareCosmicScore } from '@/components/share/ShareCosmicScore';

interface ScoreData {
  overall: number;
  headline: string;
  dominantEnergy: string;
  categories?: CosmicScoreCategories;
  bestWindowDescription?: string;
}

const CATEGORY_LABELS: Record<keyof CosmicScoreCategories, string> = {
  communication: 'Communication',
  creativity: 'Creativity',
  love: 'Love',
  career: 'Career',
  rest: 'Rest',
};

// Bar fills for the dropdown breakdown
const CATEGORY_BAR_COLORS: Record<keyof CosmicScoreCategories, string> = {
  communication: 'bg-lunary-accent',
  creativity: 'bg-lunary-primary',
  love: 'bg-lunary-rose',
  career: 'bg-lunary-success-400',
  rest: 'bg-lunary-secondary',
};

// Tag styles per category — distinct colored outlines
const CATEGORY_TAG_CLASSES: Record<keyof CosmicScoreCategories, string> = {
  communication:
    'bg-lunary-accent-900/40 border-lunary-accent-700/30 text-lunary-accent-300',
  creativity:
    'bg-lunary-primary-900/40 border-lunary-primary-700/30 text-lunary-primary-300',
  love: 'bg-lunary-rose-900/40 border-lunary-rose-700/30 text-lunary-rose-300',
  career:
    'bg-lunary-success-900/40 border-lunary-success-700/40 text-lunary-success-400',
  rest: 'bg-lunary-secondary-900/40 border-lunary-secondary-700/30 text-lunary-secondary-300',
};

// Fixed color positions around the wheel
const WHEEL_STOPS = [
  { deg: 0, color: '#7B7BE8' }, // blue (0%)
  { deg: 57.6, color: '#6B9B7A' }, // green (16%)
  { deg: 118.8, color: '#D4A574' }, // gold (33%)
  { deg: 180, color: '#EE789E' }, // cosmic rose (50%)
  { deg: 259.2, color: '#D070E8' }, // pink (72%)
  { deg: 360, color: '#8458D8' }, // purple (100%)
];

const TRACK_COLOR = 'rgba(255,255,255,0.06)';

/** Build a conic-gradient that only fills up to the score angle */
function buildArcGradient(score: number): string {
  const angle = score * 3.6;
  const parts: string[] = [];

  for (const stop of WHEEL_STOPS) {
    if (stop.deg > angle) break;
    parts.push(`${stop.color} ${stop.deg}deg`);
  }

  // Hard transition to track color at the score angle
  parts.push(`${TRACK_COLOR} ${angle}deg`);
  parts.push(`${TRACK_COLOR} 360deg`);

  return `conic-gradient(from 0deg, ${parts.join(', ')})`;
}

// Score number matches where the arc ends on the wheel
function getScoreNumberColor(score: number): string {
  if (score >= 85) return '#8458D8'; // primary (purple)
  if (score >= 70) return '#D070E8'; // highlight (pink)
  if (score >= 50) return '#EE789E'; // cosmic rose
  if (score >= 33) return '#D4A574'; // warm gold
  if (score >= 16) return '#6B9B7A'; // success (green)
  return '#7B7BE8'; // secondary (blue)
}

export function CosmicScore() {
  const authStatus = useAuthStatus();
  const { user } = useUser();
  const subscription = useSubscription();
  const [score, setScore] = useState<ScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const isPaid = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'cosmic_score_detailed' as any,
  );

  useEffect(() => {
    if (!authStatus.isAuthenticated) {
      setIsLoading(false);
      return;
    }

    // If no birthday or birth chart, show the prompt instead
    if (!user?.birthday || !user?.birthChart) {
      setIsLoading(false);
      return;
    }

    let active = true;

    const fetchScore = async () => {
      try {
        const response = await fetch('/api/cosmic-score');
        if (response.ok) {
          const data = await response.json();
          if (active) setScore(data);
        } else {
          const errData = await response.json().catch(() => ({}));
          if (active) {
            setFetchError(
              (errData as { error?: string }).error || 'Could not load score',
            );
          }
        }
      } catch (error) {
        console.error('[CosmicScore] Failed to fetch:', error);
        if (active) setFetchError('Could not load score');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchScore();
    return () => {
      active = false;
    };
  }, [authStatus.isAuthenticated, user?.birthday, user?.birthChart]);

  // Animate score counter
  useEffect(() => {
    if (!score?.overall) return;

    const target = score.overall;
    const duration = 1200;
    const steps = 30;
    const stepDuration = duration / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += Math.ceil(target / steps);
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setAnimatedScore(current);
    }, stepDuration);

    return () => clearInterval(interval);
  }, [score?.overall]);

  // Not authenticated — hide completely
  if (!authStatus.isAuthenticated) {
    return null;
  }

  // No birthday or birth chart — show setup prompt
  if (!user?.birthday || !user?.birthChart) {
    return (
      <Link
        href='/profile'
        className='block rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 hover:border-lunary-primary-700 transition-colors'
      >
        <div className='flex items-center gap-3'>
          <div className='flex-shrink-0 w-12 h-12 rounded-full bg-lunary-primary-900/30 border border-lunary-primary-800/40 flex items-center justify-center'>
            <Star className='w-5 h-5 text-lunary-primary-400' />
          </div>
          <div>
            <h3 className='text-sm font-medium text-zinc-100'>
              Unlock Your Cosmic Score
            </h3>
            <p className='text-xs text-zinc-400'>
              {!user?.birthday
                ? 'Add your birthday to get your daily score'
                : 'Generate your birth chart to see your score'}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (isLoading) {
    return (
      <div className='rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 animate-pulse'>
        <div className='flex items-center gap-3'>
          <div className='h-16 w-16 rounded-full bg-zinc-800' />
          <div className='flex-1 space-y-2'>
            <div className='h-4 bg-zinc-800 rounded w-3/4' />
            <div className='h-3 bg-zinc-800/60 rounded w-1/2' />
          </div>
        </div>
      </div>
    );
  }

  // API error — show with retry
  if (fetchError || !score) {
    return (
      <div className='rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4'>
        <div className='flex items-center gap-3'>
          <div className='flex-shrink-0 w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center'>
            <Star className='w-5 h-5 text-zinc-500' />
          </div>
          <div>
            <h3 className='text-sm font-medium text-zinc-300'>
              Today's Cosmic Score
            </h3>
            <p className='text-xs text-zinc-500'>
              {fetchError || 'Score unavailable right now'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const categories = score.categories;
  const categoryKeys = categories
    ? (Object.keys(categories) as (keyof CosmicScoreCategories)[])
    : [];

  // For free users, show top 2 categories
  const sortedCategories = categories
    ? categoryKeys.sort((a, b) => (categories[b] ?? 0) - (categories[a] ?? 0))
    : [];
  const visibleCategories = isPaid
    ? sortedCategories
    : sortedCategories.slice(0, 2);
  const hasCategories = visibleCategories.length > 0 && categories;

  return (
    <div className='rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3 shadow-sm'>
      <div className='flex items-center gap-3'>
        {/* Circular score meter (conic gradient follows the arc) */}
        <div className='relative flex-shrink-0 w-12 h-12'>
          <div
            className='absolute inset-0 rounded-full'
            style={{
              background: buildArcGradient(animatedScore),
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))',
              WebkitMask:
                'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))',
            }}
          />
          {/* Score number */}
          <span
            className='absolute inset-0 flex items-center justify-center text-sm font-medium'
            style={{ color: getScoreNumberColor(score.overall) }}
          >
            {animatedScore}
          </span>
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-1.5'>
            <h3 className='text-xs font-medium text-zinc-100 truncate'>
              Cosmic Score
            </h3>
            <span className='ml-auto' />
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md border ${CATEGORY_TAG_CLASSES[score.dominantEnergy as keyof CosmicScoreCategories] ?? 'bg-lunary-primary-900/40 border-lunary-primary-700/30 text-lunary-primary-300'}`}
            >
              {score.dominantEnergy}
            </span>
            <ShareCosmicScore
              overall={score.overall}
              headline={score.headline}
              dominantEnergy={score.dominantEnergy}
              sunSign={
                user?.birthChart?.find((p: any) => p.body === 'Sun')?.sign
              }
            />
          </div>
          <p className='text-[11px] text-zinc-400 leading-snug mt-0.5 truncate'>
            {score.headline}
          </p>
        </div>

        {/* Expand toggle */}
        {hasCategories && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className='flex-shrink-0 p-1 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors'
            aria-label={expanded ? 'Hide breakdown' : 'Show breakdown'}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Collapsible category bars */}
      {hasCategories && (
        <div
          className='overflow-hidden transition-all duration-300 ease-in-out'
          style={{
            maxHeight: expanded ? (contentRef.current?.scrollHeight ?? 200) : 0,
          }}
        >
          <div ref={contentRef} className='pt-2.5 space-y-1.5'>
            {visibleCategories.map((key) => (
              <div key={key} className='flex items-center gap-2'>
                <span className='text-[10px] text-zinc-500 w-24 truncate'>
                  {CATEGORY_LABELS[key]}
                </span>
                <div className='flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden'>
                  <div
                    className={`h-full rounded-full ${CATEGORY_BAR_COLORS[key]} transition-all duration-1000 ease-out`}
                    style={{ width: `${(categories[key] / 20) * 100}%` }}
                  />
                </div>
                <span className='text-[10px] text-zinc-500 w-5 text-right'>
                  {categories[key]}
                </span>
              </div>
            ))}

            {/* Upsell for free users */}
            {!isPaid && sortedCategories.length > 2 && (
              <Link
                href='/pricing?nav=app'
                className='flex items-center gap-1.5 mt-1 text-[10px] text-lunary-primary-300 hover:text-lunary-primary-200 transition-colors'
              >
                <Lock className='w-3 h-3' />
                <span>Unlock full breakdown</span>
                <Sparkles className='w-3 h-3' />
              </Link>
            )}

            {/* Best window for paid users */}
            {isPaid && score.bestWindowDescription && (
              <p className='text-[10px] text-zinc-500'>
                Best time for {score.bestWindowDescription}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
