'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';
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

type NextHitResponse = {
  success: boolean;
  hit: {
    transitPlanet: string;
    natalPlanet: string;
    aspect: string;
    exactDate: string;
    blurb: string | null;
  } | null;
};

/** Compact relative time for badge display (future-only, tomorrow+) */
const formatRelativeTime = (date: dayjs.Dayjs): string => {
  const now = dayjs();
  const today = now.startOf('day');
  const transitDay = date.startOf('day');
  const daysDiff = transitDay.diff(today, 'day');

  if (daysDiff <= 1) return 'tomorrow';
  if (daysDiff <= 6) return date.format('ddd');
  return date.format('MMM D');
};

const formatExactCountdown = (date: dayjs.Dayjs): string => {
  const now = dayjs();
  const minutes = date.diff(now, 'minute');
  if (minutes <= 0) return 'exact now';
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes - days * 1440) / 60);
  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${Math.max(1, minutes)}m`;
};

const formatPeakLabel = (date: dayjs.Dayjs): string => {
  const countdown = formatExactCountdown(date);
  return countdown === 'exact now' ? 'Peaks now' : `Peaks in ${countdown}`;
};

export const TransitOfTheDay = () => {
  const { user } = useUser();
  const authStatus = useAuthStatus();
  const router = useRouter();
  const subscription = useSubscription();
  const variant = useFeatureFlagVariant('paywall_preview_style_v1');
  const ctaCopy = useCTACopy();
  const [nextHit, setNextHit] = useState<NextHitResponse['hit']>(null);

  useEffect(() => {
    if (!authStatus.isAuthenticated) {
      setNextHit(null);
      return;
    }

    let cancelled = false;
    fetch('/api/live-transits/next-hit', { credentials: 'include' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: NextHitResponse | null) => {
        if (!cancelled && data?.success) {
          setNextHit(data.hit);
        }
      })
      .catch(() => {
        if (!cancelled) setNextHit(null);
      });

    return () => {
      cancelled = true;
    };
  }, [authStatus.isAuthenticated]);

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
  // Future-only with tier-based scoring: today > tomorrow > this week
  const generalTransit = useMemo((): TransitEvent | null => {
    if (authStatus.isAuthenticated && hasPersonalizedAccess) return null;

    const upcomingTransits = getUpcomingTransits();
    if (upcomingTransits.length === 0) return null;

    const now = dayjs();
    const today = now.startOf('day');
    const priorityOrder: Record<string, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    // Strictly future events only (tomorrow onward) — today is covered by Today's Influence
    const relevantTransits = upcomingTransits.filter(
      (t) => dayjs(t.date).startOf('day').diff(today, 'day') > 0,
    );
    if (relevantTransits.length === 0) return null;

    const sorted = relevantTransits
      .map((t) => {
        const daysDiff = dayjs(t.date).startOf('day').diff(today, 'day');
        // Sooner events rank higher
        let tierScore = 0;
        if (daysDiff === 1) tierScore = 2_000_000;
        else if (daysDiff <= 7) tierScore = 1_000_000;
        const sigScore = (priorityOrder[t.significance] ?? 1) * 1_000;
        return { transit: t, score: tierScore + sigScore };
      })
      .sort((a, b) => b.score - a.score);

    return sorted[0]?.transit ?? null;
  }, [authStatus.isAuthenticated, hasPersonalizedAccess]);

  // Calculate personal impacts for ALL authenticated users (for preview and paid access)
  const personalImpacts = useMemo(() => {
    if (!authStatus.isAuthenticated || !user) return [];
    const birthChart = user.birthChart;
    if (!birthChart || birthChart.length === 0) return [];
    return getPersonalTransitImpactList(birthChart, 60);
  }, [authStatus.isAuthenticated, user]);

  // Future-only with tier-based scoring: today > tomorrow > this week
  const transit = useMemo((): PersonalTransitImpact | null => {
    if (personalImpacts.length === 0) return null;

    const now = dayjs();
    const today = now.startOf('day');
    const priorityOrder: Record<string, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    // Strictly future events only (tomorrow onward) — today is covered by Today's Influence
    const relevantImpacts = personalImpacts.filter(
      (impact) => dayjs(impact.date).startOf('day').diff(today, 'day') > 0,
    );
    if (relevantImpacts.length === 0) return null;

    const sorted = relevantImpacts
      .map((impact) => {
        const daysDiff = dayjs(impact.date).startOf('day').diff(today, 'day');
        // Sooner events rank higher
        let tierScore = 0;
        if (daysDiff === 1) tierScore = 2_000_000;
        else if (daysDiff <= 7) tierScore = 1_000_000;
        const sigScore = (priorityOrder[impact.significance] ?? 1) * 1_000;
        return { impact, score: tierScore + sigScore };
      })
      .sort((a, b) => b.score - a.score);

    return sorted[0]?.impact ?? null;
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
          <p className='text-xs text-content-muted'>{contentWithSpaces}</p>
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

  const nextHitLine = nextHit ? (
    <div className='mt-2 flex items-start gap-1.5 rounded-md border border-stroke-subtle/50 bg-surface-card/40 px-2 py-1.5 text-[11px] leading-snug text-content-muted'>
      <Clock className='mt-0.5 h-3 w-3 shrink-0 text-content-brand-secondary' />
      <span>
        {formatPeakLabel(dayjs(nextHit.exactDate))}:{' '}
        <span className='text-content-secondary'>
          {nextHit.transitPlanet} {nextHit.aspect.toLowerCase()} natal{' '}
          {nextHit.natalPlanet}
        </span>
      </span>
    </div>
  ) : null;

  // Show general transit for unauthenticated users or users without chart access
  if (!authStatus.isAuthenticated || !hasPersonalizedAccess) {
    if (!generalTransit) {
      // Fallback: show upsell if no transits available (shouldn't happen)
      return (
        <Link
          href='/pricing?nav=app'
          className='block py-3 px-4 bg-surface-elevated border border-stroke-subtle/50 rounded-md w-full h-full hover:border-lunary-primary-700/50 transition-colors'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Sparkles className='w-4 h-4 text-content-brand-secondary' />
              <span className='text-sm text-content-secondary'>
                {ctaCopy.transitList}
              </span>
            </div>
            <ArrowRight className='w-4 h-4 text-content-brand-secondary' />
          </div>
        </Link>
      );
    }

    return (
      <Link
        href='/horoscope'
        className='block py-3 px-4 bg-surface-elevated border border-stroke-subtle/50 rounded-md w-full h-full hover:border-lunary-primary-700/50 transition-colors group'
        data-testid='transit-card'
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-1'>
              <div className='flex items-center gap-2 align-middle'>
                <span className='font-astro text-lg text-content-brand-secondary align-middle'>
                  {getPlanetSymbol(generalTransit.planet)}
                </span>
                <span className='text-sm text-content-primary'>
                  Your Next Transit
                </span>
              </div>
              <span className='inline-flex items-center text-xs px-2 py-0.5 rounded-md border bg-surface-elevated border-stroke-subtle text-content-muted'>
                {formatRelativeTime(dayjs(generalTransit.date))}
              </span>
            </div>
            <p className='text-sm text-content-primary mb-1'>
              {generalTransit.planet} {generalTransit.event}
            </p>
            <p className='text-xs text-content-primary mb-2'>
              {generalTransit.description.split('.')[0]}.
            </p>
            {nextHitLine}

            {/* A/B test: Show preview of PERSONALIZED content (what they're missing) */}
            <div className='relative'>
              {renderPreview(transit || generalTransit)}
              <span
                role='button'
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(
                    authStatus.isAuthenticated
                      ? '/pricing?nav=app'
                      : '/auth?signup=true',
                  );
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(
                      authStatus.isAuthenticated
                        ? '/pricing?nav=app'
                        : '/auth?signup=true',
                    );
                  }
                }}
                className='absolute top-0 right-0 inline-flex items-center gap-1 text-[10px] bg-layer-base/80 border border-lunary-primary-700/50 px-2 py-0.5 rounded text-content-brand hover:bg-layer-raised/80 transition-colors'
              >
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
              className='flex items-center gap-1.5 text-xs text-content-secondary hover:text-content-secondary transition-colors bg-none border-none p-0'
            >
              {ctaCopy.transitList}
            </button>
          </div>
          <ArrowRight className='w-4 h-4 text-content-muted group-hover:text-content-brand-secondary transition-colors flex-shrink-0 mt-1' />
        </div>
      </Link>
    );
  }

  if (!transit) {
    // Fallback: show general transit if no personalized transit available
    if (generalTransit) {
      return (
        <Link
          href='/horoscope'
          className='block py-3 px-4 bg-surface-elevated border border-stroke-subtle/50 rounded-md w-full h-full hover:border-lunary-primary-700/50 transition-colors group'
        >
          <div className='flex items-start justify-between gap-3'>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between mb-1'>
                <div className='flex items-center gap-2 align-middle'>
                  <span className='font-astro text-lg text-content-brand-secondary'>
                    {getPlanetSymbol(generalTransit.planet)}
                  </span>
                  <span className='text-sm text-content-primary'>
                    Your Next Transit
                  </span>
                </div>
                <span className='inline-flex items-center text-xs px-2 py-0.5 rounded-md border bg-surface-elevated border-stroke-subtle text-content-muted'>
                  {formatRelativeTime(dayjs(generalTransit.date))}
                </span>
              </div>
              <p className='text-sm text-content-primary mb-1'>
                {generalTransit.planet} {generalTransit.event}
              </p>
              <p className='text-xs text-content-muted line-clamp-2'>
                {generalTransit.description}
              </p>
              {nextHitLine}
            </div>
            <ArrowRight className='w-4 h-4 text-content-muted group-hover:text-content-brand-secondary transition-colors flex-shrink-0 mt-1' />
          </div>
        </Link>
      );
    }
    return null;
  }

  return (
    <Link
      href='/horoscope'
      className='block py-3 px-4 bg-surface-elevated border border-stroke-subtle/50 rounded-md w-full h-full hover:border-lunary-primary-700/50 transition-colors group'
      data-testid='transit-card'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-2 align-middle'>
              <span className='font-astro text-lg text-content-brand-secondary'>
                {getPlanetSymbol(transit.planet)}
              </span>
              <span className='text-sm text-content-primary'>
                Your Next Transit
              </span>
            </div>
            <span className='inline-flex items-center text-xs px-2 py-0.5 rounded-md border bg-surface-elevated border-stroke-subtle text-content-muted'>
              {formatRelativeTime(dayjs(transit.date))}
            </span>
          </div>
          <p className='text-sm text-content-primary mb-1'>
            {transit.planet} {transit.event}
            {transit.house && (
              <span className='text-content-muted'>
                {' '}
                your {transit.house}
                {getOrdinalSuffix(transit.house)} house
              </span>
            )}
          </p>
          <p className='text-xs text-content-muted line-clamp-2'>
            {transit.actionableGuidance}
          </p>
          {nextHitLine}
        </div>
        <ArrowRight className='w-4 h-4 text-content-muted group-hover:text-content-brand-secondary transition-colors flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
};
