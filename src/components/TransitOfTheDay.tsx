'use client';

import { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import {
  getUpcomingTransits,
  TransitEvent,
} from '../../utils/astrology/transitCalendar';
import {
  getPersonalTransitImpactList,
  PersonalTransitImpact,
} from '../../utils/astrology/personalTransits';
import { useSubscription } from '../hooks/useSubscription';
import { hasFeatureAccess } from '../../utils/pricing';
import { bodiesSymbols } from '@/constants/symbols';
import dayjs from 'dayjs';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { useCTACopy } from '@/hooks/useCTACopy';
import { shouldRedactWord } from '@/constants/redactedWords';

const getOrdinalSuffix = (n: number): string => {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

const getPlanetSymbol = (planet: string): string => {
  const key = planet.toLowerCase() as keyof typeof bodiesSymbols;
  return bodiesSymbols[key] || planet.charAt(0);
};

export const TransitOfTheDay = () => {
  const { user } = useUser();
  const authStatus = useAuthStatus();
  const subscription = useSubscription();
  const variant = useFeatureFlagVariant('paywall_preview_style_v1');
  const ctaCopy = useCTACopy();

  // For unauthenticated users, force paid access to false immediately
  // Don't wait for subscription to resolve
  const hasPersonalizedAccess = !authStatus.isAuthenticated
    ? false
    : hasFeatureAccess(
        subscription.status,
        subscription.plan,
        'personalized_transit_readings',
      );

  // Get general transits for unauthenticated users or when no chart access
  const generalTransit = useMemo((): TransitEvent | null => {
    if (authStatus.isAuthenticated && hasPersonalizedAccess) return null;

    const upcomingTransits = getUpcomingTransits();
    if (upcomingTransits.length === 0) return null;

    const today = dayjs().startOf('day');
    const nextWeek = today.add(7, 'day');

    const relevantTransits = upcomingTransits.filter((t) => {
      const transitDate = dayjs(t.date);
      return transitDate.isAfter(today); // && transitDate.isBefore(nextWeek);
    });

    if (relevantTransits.length === 0) {
      const futureTransit = upcomingTransits.find((t) =>
        dayjs(t.date).isAfter(today),
      );
      return futureTransit ?? upcomingTransits[0];
    }

    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const sorted = relevantTransits.sort((a, b) => {
      const priorityDiff =
        priorityOrder[b.significance] - priorityOrder[a.significance];
      if (priorityDiff !== 0) return priorityDiff;
      return dayjs(a.date).diff(dayjs(b.date));
    });

    return sorted[0];
  }, [authStatus.isAuthenticated, hasPersonalizedAccess]);

  // Calculate personal impacts for ALL authenticated users (for preview and paid access)
  const personalImpacts = useMemo(() => {
    if (!authStatus.isAuthenticated || !user) return [];
    const birthChart = user.birthChart;
    if (!birthChart || birthChart.length === 0) return [];
    return getPersonalTransitImpactList(birthChart, 60);
  }, [authStatus.isAuthenticated, user]);

  const transit = useMemo((): PersonalTransitImpact | null => {
    if (personalImpacts.length === 0) return null;
    const today = dayjs().startOf('day');
    const nextWeek = today.add(7, 'day');

    const futureImpacts = personalImpacts.filter((impact) => {
      const impactDate = dayjs(impact.date);
      return impactDate.isAfter(today) && impactDate.isBefore(nextWeek);
    });

    if (futureImpacts.length > 0) {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const sorted = [...futureImpacts].sort((a, b) => {
        const priorityDiff =
          priorityOrder[b.significance] - priorityOrder[a.significance];
        if (priorityDiff !== 0) return priorityDiff;
        return dayjs(a.date).diff(dayjs(b.date));
      });
      return sorted[0];
    }

    const nextFuture = personalImpacts.find((impact) =>
      dayjs(impact.date).isAfter(today),
    );
    return nextFuture ?? personalImpacts[0];
  }, [personalImpacts]);

  // Helper to render preview based on A/B test variant
  // Takes the transit to show (either general or personalized)
  const renderPreview = (
    previewTransit: TransitEvent | PersonalTransitImpact,
  ) => {
    if (!previewTransit) return null;

    if (variant === 'truncated') {
      // Variant B: Truncated with BLURRED date - show month but blur day, then continue with content
      const transitDate = dayjs(previewTransit.date);
      const month = transitDate.format('MMM');
      const day = transitDate.format('D');

      // Build additional content to show after the date
      let additionalContent = '';
      if ('house' in previewTransit && previewTransit.house) {
        const houseText = ` → your ${previewTransit.house}${getOrdinalSuffix(previewTransit.house)} house`;
        additionalContent = `${houseText}. ${previewTransit.actionableGuidance || ''}`;
      } else {
        // For general transit, show description
        const fullDescription =
          (previewTransit as TransitEvent).description || '';
        additionalContent = `. ${fullDescription}`;
      }

      return (
        <div className='locked-preview-truncated-single mb-2'>
          <p className='text-xs'>
            {month}{' '}
            <span
              className='inline-block'
              style={{ filter: 'blur(4px)', userSelect: 'none' }}
            >
              {day}
            </span>
            : {previewTransit.planet} {previewTransit.event}
            {additionalContent}
          </p>
        </div>
      );
    }

    if (variant === 'redacted') {
      // Variant C: Redacted style - soft blur effect on key terms
      // Build full content string
      let fullContent = '';
      if ('house' in previewTransit && previewTransit.house) {
        const houseText = ` → your ${previewTransit.house}${getOrdinalSuffix(previewTransit.house)} house`;
        fullContent = `${previewTransit.planet} ${previewTransit.event}${houseText}. ${previewTransit.actionableGuidance || ''}`;
      } else {
        const fullDescription =
          (previewTransit as TransitEvent).description || '';
        fullContent = `${previewTransit.planet} ${previewTransit.event}. ${fullDescription}`;
      }

      const words = fullContent.split(' ');
      const redactedContent = words.map((word, i) => {
        const shouldRedact = shouldRedactWord(word, i);
        return shouldRedact ? (
          <span key={i} className='redacted-word'>
            {word}
          </span>
        ) : (
          <span key={i}>{word}</span>
        );
      });

      const contentWithSpaces: React.ReactNode[] = [];
      redactedContent.forEach((element, i) => {
        contentWithSpaces.push(element);
        if (i < redactedContent.length - 1) {
          contentWithSpaces.push(' ');
        }
      });

      return (
        <div className='locked-preview-redacted mb-2'>
          <p className='text-xs text-zinc-400'>{contentWithSpaces}</p>
        </div>
      );
    }

    // Variant A: Blur Effect (default)
    // Build preview content based on transit type
    let previewContent = '';

    // Check if it's a PersonalTransitImpact (has house property)
    if ('house' in previewTransit && previewTransit.house) {
      const houseText = ` → your ${previewTransit.house}${getOrdinalSuffix(previewTransit.house)} house`;
      previewContent = `${previewTransit.planet} ${previewTransit.event}${houseText}. ${previewTransit.actionableGuidance || ''}`;
    } else {
      // It's a TransitEvent (general), show continuation of description
      const fullDescription =
        (previewTransit as TransitEvent).description || '';
      const sentences = fullDescription.split('.');
      // Skip the first sentence (already shown) and show the rest
      previewContent = sentences.slice(1).join('.').trim();
      if (previewContent && !previewContent.endsWith('.')) {
        previewContent += '.';
      }
    }

    if (!previewContent) return null;

    return (
      <div className='locked-preview mb-2'>
        <p className='locked-preview-text text-xs'>{previewContent}</p>
      </div>
    );
  };

  // Show general transit for unauthenticated users or users without chart access
  if (!authStatus.isAuthenticated || !hasPersonalizedAccess) {
    if (!generalTransit) {
      // Fallback: show upsell if no transits available (shouldn't happen)
      return (
        <Link
          href='/pricing'
          className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md w-full h-full hover:border-lunary-primary-700/50 transition-colors'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Sparkles className='w-4 h-4 text-lunary-secondary-200' />
              <span className='text-sm text-lunary-primary-200'>
                {ctaCopy.transitList}
              </span>
            </div>
            <ArrowRight className='w-4 h-4 text-lunary-secondary-200' />
          </div>
        </Link>
      );
    }

    const transitDate = dayjs(generalTransit.date);
    // const isToday = transitDate.isSame(dayjs(), 'day');
    const isTomorrow = transitDate.isSame(dayjs().add(1, 'day'), 'day');
    // const dateLabel = isToday
    //   ? 'Today'
    //   : isTomorrow
    //     ? 'Tomorrow'
    //     : transitDate.format('MMM D');
    const dateLabel = isTomorrow ? 'Tomorrow' : transitDate.format('MMM D');

    return (
      <Link
        href='/horoscope'
        className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md w-full h-full hover:border-lunary-primary-700/50 transition-colors group'
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-1'>
              <div className='flex items-center gap-2 align-middle'>
                <span className='font-astro text-lg text-lunary-secondary-200 align-middle'>
                  {getPlanetSymbol(generalTransit.planet)}
                </span>
                <span className='text-sm text-zinc-200'>Your Next Transit</span>
                <span className='text-xs text-zinc-400 uppercase tracking-wide'>
                  {dateLabel}
                </span>
              </div>
              {generalTransit.significance === 'high' && (
                <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
                  Major
                </span>
              )}
            </div>
            <p className='text-sm text-zinc-200 mb-1'>
              {generalTransit.planet} {generalTransit.event}
            </p>
            <p className='text-xs text-zinc-200 mb-2'>
              {generalTransit.description.split('.')[0]}.
            </p>

            {/* A/B test: Show preview of PERSONALIZED content (what they're missing) */}
            <div className='relative'>
              {renderPreview(transit || generalTransit)}
              <span className='absolute top-0 right-0 inline-flex items-center gap-1 text-[10px] bg-lunary-primary-900/80 border border-lunary-primary-700/50 px-2 py-0.5 rounded text-lunary-primary-300'>
                <Sparkles className='w-2.5 h-2.5' />
                Lunary+
              </span>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                ctaCopy.trackCTAClick('transitList', 'dashboard');
              }}
              className='flex items-center gap-1.5 text-xs text-lunary-primary-200 hover:text-lunary-primary-100 transition-colors bg-none border-none p-0 cursor-pointer'
            >
              {ctaCopy.transitList}
            </button>
          </div>
          <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-secondary-200 transition-colors flex-shrink-0 mt-1' />
        </div>
      </Link>
    );
  }

  if (!transit) {
    // Fallback: show general transit if no personalized transit available
    if (generalTransit) {
      const transitDate = dayjs(generalTransit.date);
      const isToday = transitDate.isSame(dayjs(), 'day');
      const isTomorrow = transitDate.isSame(dayjs().add(1, 'day'), 'day');
      const dateLabel = isToday
        ? 'Today'
        : isTomorrow
          ? 'Tomorrow'
          : transitDate.format('MMM D');

      return (
        <Link
          href='/horoscope'
          className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md w-full h-full hover:border-lunary-primary-700/50 transition-colors group'
        >
          <div className='flex items-start justify-between gap-3'>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between mb-1'>
                <div className='flex items-center gap-2 align-middle'>
                  <span className='font-astro text-lg text-lunary-secondary-200'>
                    {getPlanetSymbol(generalTransit.planet)}
                  </span>
                  <span className='text-sm text-zinc-200'>
                    Your Next Transit
                  </span>
                  <span className='text-xs text-zinc-400 uppercase tracking-wide'>
                    {dateLabel}
                  </span>
                </div>
                {generalTransit.significance === 'high' && (
                  <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
                    Major
                  </span>
                )}
              </div>
              <p className='text-sm text-zinc-200 mb-1'>
                {generalTransit.planet} {generalTransit.event}
              </p>
              <p className='text-xs text-zinc-400 line-clamp-2'>
                {generalTransit.description}
              </p>
            </div>
            <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-secondary-200 transition-colors flex-shrink-0 mt-1' />
          </div>
        </Link>
      );
    }
    return null;
  }

  const transitDate = dayjs(transit.date);
  const isToday = transitDate.isSame(dayjs(), 'day');
  const isTomorrow = transitDate.isSame(dayjs().add(1, 'day'), 'day');
  const dateLabel = isToday
    ? 'Today'
    : isTomorrow
      ? 'Tomorrow'
      : transitDate.format('MMM D');

  return (
    <Link
      href='/horoscope'
      className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md w-full h-full hover:border-lunary-primary-700/50 transition-colors group'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-2 align-middle'>
              <span className='font-astro text-lg text-lunary-secondary-200'>
                {getPlanetSymbol(transit.planet)}
              </span>
              <span className='text-sm text-zinc-200'>Your Next Transit</span>
              <span className='text-xs text-zinc-400 uppercase tracking-wide'>
                {dateLabel}
              </span>
            </div>
            {transit.significance === 'high' && (
              <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
                Major
              </span>
            )}
          </div>
          <p className='text-sm text-zinc-200 mb-1'>
            {transit.planet} {transit.event}
            {transit.house && (
              <span className='text-zinc-400'>
                {' '}
                your {transit.house}
                {getOrdinalSuffix(transit.house)} house
              </span>
            )}
          </p>
          <p className='text-xs text-zinc-400 line-clamp-2'>
            {transit.actionableGuidance}
          </p>
        </div>
        <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-secondary-200 transition-colors flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
};
