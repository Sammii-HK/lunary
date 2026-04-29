'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Lock as LockIcon,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronUp,
  Share2,
} from 'lucide-react';
import clsx from 'clsx';
import {
  TAROT_SPREADS,
  TAROT_SPREAD_MAP,
  PLAN_RANK,
  TarotPlan,
} from '@/constants/tarotSpreads';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { TarotTransitConnection } from './TarotTransitConnection';
import { getTarotSuitAccent, TarotSuitIcon } from './TarotSuitIcon';
import type { BirthChartPlacement } from '@/context/UserContext';
import { usePlanetaryChart } from '@/context/AstronomyContext';
import { isInDemoMode } from '@/lib/demo-mode';
import { useHaptic } from '@/hooks/useHaptic';
import { useIsNativeIOS } from '@/hooks/useNativePlatform';
import { iosLabel } from '@/lib/ios-labels';

export type SubscriptionStatus =
  | 'free'
  | 'trial'
  | 'active'
  | 'cancelled'
  | 'past_due';

type SpreadReadingCard = {
  positionId: string;
  positionLabel: string;
  positionPrompt: string;
  card: {
    name: string;
    keywords: string[];
    information: string;
    suit: string;
    arcana: string;
  };
  insight: string;
};

export type SpreadReadingRecord = {
  id: string;
  spreadSlug: string;
  spreadName: string;
  summary: string;
  highlights: string[];
  journalingPrompts: string[];
  notes: string;
  tags: string[];
  cards: SpreadReadingCard[];
  metadata: Record<string, unknown>;
  planSnapshot: string;
  createdAt: string;
  updatedAt: string;
};

export interface TarotSpreadExperienceProps {
  userId?: string;
  userName?: string;
  userBirthday?: string;
  birthChart?: BirthChartPlacement[];
  userBirthLocation?: string;
  subscriptionPlan: {
    plan: TarotPlan;
    status: SubscriptionStatus;
  };
  onRequireUpgrade?: (requiredPlan: TarotPlan) => void;
  onCardPreview?: (card: {
    name: string;
    keywords: string[];
    information: string;
  }) => void;
  onShareReading?: (reading: SpreadReadingRecord) => void;
}

type UsageSnapshot = {
  plan: TarotPlan;
  status: SubscriptionStatus;
  monthlyLimit: number | null;
  monthlyUsed: number;
  monthlyRemaining: number | null;
  historyWindowDays: number;
};

// Map TarotPlan (free/monthly/yearly) to actual plan IDs and labels
const PLAN_LABEL: Record<TarotPlan, string> = {
  free: 'Cosmic Explorer',
  monthly: 'Lunary+',
  yearly: 'Lunary+ Pro Annual',
};

// Map TarotPlan to actual plan ID for UpgradePrompt
function mapTarotPlanToPlanId(
  plan: TarotPlan,
): 'free' | 'lunary_plus' | 'lunary_plus_ai' | 'lunary_plus_ai_annual' {
  switch (plan) {
    case 'free':
      return 'free';
    case 'monthly':
      return 'lunary_plus'; // Default monthly plan
    case 'yearly':
      return 'lunary_plus_ai_annual'; // Default yearly plan
    default:
      return 'lunary_plus';
  }
}

const findFirstUnlockedSpread = (
  unlocked: Set<string>,
  plan: TarotPlan,
): string => {
  const defaultSpread =
    TAROT_SPREADS.find((spread) => unlocked.has(spread.slug)) ||
    TAROT_SPREADS[0];

  return defaultSpread.slug;
};

function CollapsibleSpreadLibrary({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      id='spreads'
      className='rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 overflow-hidden'
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className='flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-surface-elevated/50'
      >
        <span className='text-xs uppercase tracking-wide text-content-muted'>
          Spread Library
        </span>
        {isCollapsed ? (
          <ChevronDown className='w-4 h-4 text-content-muted' />
        ) : (
          <ChevronUp className='w-4 h-4 text-content-muted' />
        )}
      </button>
      {!isCollapsed && (
        <div className='border-t border-stroke-subtle/50 p-3'>{children}</div>
      )}
    </div>
  );
}

export function TarotSpreadExperience({
  userId,
  userName,
  userBirthday,
  birthChart,
  userBirthLocation,
  subscriptionPlan,
  onRequireUpgrade,
  onCardPreview,
  onShareReading,
}: TarotSpreadExperienceProps) {
  const { currentAstrologicalChart } = usePlanetaryChart();
  const isNativeIOS = useIsNativeIOS();
  const haptic = useHaptic();
  const [selectedSpreadSlug, setSelectedSpreadSlug] = useState<string | null>(
    null,
  );
  const [readings, setReadings] = useState<SpreadReadingRecord[]>([]);
  const [currentReading, setCurrentReading] =
    useState<SpreadReadingRecord | null>(null);
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const [unlockedSpreadSlugs, setUnlockedSpreadSlugs] = useState<Set<string>>(
    () => new Set(),
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>('');
  const [expandedTransitCardIndex, setExpandedTransitCardIndex] =
    useState<number>(0);
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [lastSavedNotes, setLastSavedNotes] = useState<string>('');
  const [journalSaveState, setJournalSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const selectedSpread = selectedSpreadSlug
    ? TAROT_SPREAD_MAP[selectedSpreadSlug]
    : null;

  const unlockedSpreads = useMemo(
    () => unlockedSpreadSlugs,
    [unlockedSpreadSlugs],
  );

  // In demo mode, treat all spreads as unlocked for UI purposes
  // API will still block pulling new spreads with modal
  const displayUnlockedSpreads = useMemo(() => {
    const demoMode = isInDemoMode();
    if (demoMode) {
      // Show all spreads as unlocked in demo
      return new Set(Object.keys(TAROT_SPREAD_MAP));
    }
    return unlockedSpreads;
  }, [unlockedSpreads]);

  const refreshReadings = useCallback(async () => {
    // Don't fetch if user is not authenticated
    if (!userId) {
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tarot/readings?limit=20`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[TarotSpreadExperience] API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        // Even if the request fails, try to get spreadsUnlocked from error response
        // or use fallback based on subscription plan
        const errorUnlocked = errorData.spreadsUnlocked || [];
        if (errorUnlocked.length > 0) {
          const unlocked = new Set<string>(errorUnlocked);
          setUnlockedSpreadSlugs(unlocked);
        } else {
          // Fallback: unlock spreads based on subscription plan from frontend
          console.log(
            '[TarotSpreadExperience] Using fallback unlock based on subscription plan:',
            subscriptionPlan.plan,
          );
          const fallbackUnlocked = Object.keys(TAROT_SPREAD_MAP).filter(
            (slug) => {
              const spread = TAROT_SPREAD_MAP[slug];
              if (!spread) return false;
              // Monthly and yearly have same access
              if (
                subscriptionPlan.plan === 'monthly' ||
                subscriptionPlan.plan === 'yearly'
              ) {
                return true;
              }
              const planRank = PLAN_RANK[subscriptionPlan.plan];
              const spreadRank = PLAN_RANK[spread.minimumPlan];
              return planRank >= spreadRank;
            },
          );
          console.log(
            '[TarotSpreadExperience] Fallback unlocked spreads:',
            fallbackUnlocked,
          );
          setUnlockedSpreadSlugs(new Set(fallbackUnlocked));
        }

        throw new Error(
          errorData.error ||
            `Failed to load saved spreads (${response.status})`,
        );
      }

      const data = await response.json();
      const fetchedReadings: SpreadReadingRecord[] = data.readings || [];

      // Filter out daily single-card pulls - only show actual spreads (2+ cards)
      const actualSpreads = fetchedReadings.filter(
        (reading) => reading.cards && reading.cards.length > 1,
      );

      setReadings(actualSpreads);
      setUsage(data.usage || null);

      let unlocked = new Set<string>(data.spreadsUnlocked || []);

      // If API returned wrong data (too few spreads for monthly/yearly), use frontend subscription
      if (
        (subscriptionPlan.plan === 'monthly' ||
          subscriptionPlan.plan === 'yearly') &&
        unlocked.size < 5
      ) {
        console.warn(
          '[TarotSpreadExperience] API returned only',
          unlocked.size,
          'spreads for',
          subscriptionPlan.plan,
          'plan. Using frontend subscription to unlock all spreads.',
        );
        // Unlock all spreads for monthly/yearly subscribers
        unlocked = new Set(Object.keys(TAROT_SPREAD_MAP));
      }

      setUnlockedSpreadSlugs(unlocked);

      console.log('[TarotSpreadExperience] Loaded spreads:', {
        readingsCount: fetchedReadings.length,
        unlockedCount: unlocked.size,
        subscriptionPlan: subscriptionPlan.plan,
        subscriptionStatus: subscriptionPlan.status,
        unlockedSpreads: Array.from(unlocked),
        apiReturnedCount: data.spreadsUnlocked?.length || 0,
      });

      if (fetchedReadings.length > 0) {
        setCurrentReading(fetchedReadings[0]);
        setNotesDraft(fetchedReadings[0].notes || '');
        setLastSavedNotes(fetchedReadings[0].notes || '');
      } else {
        setCurrentReading(null);
        setNotesDraft('');
        setLastSavedNotes('');
      }

      // Ensure selected spread is accessible
      if (selectedSpreadSlug !== null && !unlocked.has(selectedSpreadSlug)) {
        const firstUnlockedSlug = findFirstUnlockedSpread(
          unlocked,
          subscriptionPlan.plan,
        );
        setSelectedSpreadSlug(firstUnlockedSlug);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [
    userId,
    selectedSpreadSlug,
    subscriptionPlan.plan,
    subscriptionPlan.status,
  ]);

  useEffect(() => {
    refreshReadings();
  }, [refreshReadings]);

  useEffect(() => {
    if (!currentReading) return;
    setNotesDraft(currentReading.notes || '');
    setLastSavedNotes(currentReading.notes || '');
    setJournalSaveState('idle');
    setExpandedTransitCardIndex(0); // Reset to first card when reading changes
  }, [currentReading]);

  useEffect(() => {
    if (!currentReading) return;
    if (notesDraft === lastSavedNotes) return;
    if (!userId) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsSavingNotes(true);
        const response = await fetch(
          `/api/tarot/readings/${currentReading.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              notes: notesDraft.trim() === '' ? null : notesDraft,
            }),
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error('Failed to save notes');
        }

        const data = await response.json();
        const updatedReading: SpreadReadingRecord = data.reading;
        setLastSavedNotes(updatedReading.notes || '');
        setUsage(data.usage || usage);
        setReadings((prev) =>
          prev.map((reading) =>
            reading.id === updatedReading.id ? updatedReading : reading,
          ),
        );
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error(err);
        }
      } finally {
        setIsSavingNotes(false);
      }
    }, 900);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [currentReading, notesDraft, userId, lastSavedNotes, usage]);

  const handleSelectSpread = (slug: string) => {
    setLimitWarning(null);
    if (!unlockedSpreads.has(slug)) {
      const requiredPlan = TAROT_SPREAD_MAP[slug]?.minimumPlan ?? 'monthly';
      setSelectedSpreadSlug(slug);
      setLimitWarning('This spread is reserved for subscribers.');
      if (onRequireUpgrade) {
        onRequireUpgrade(requiredPlan);
      }
      return;
    }
    setSelectedSpreadSlug(slug);
  };

  const handleCardPreview = useCallback(
    (cardData: SpreadReadingCard['card']) => {
      if (!onCardPreview) return;
      haptic.light(); // Subtle feedback on card tap
      onCardPreview({
        name: cardData.name,
        keywords: cardData.keywords,
        information: cardData.information,
      });
    },
    [onCardPreview, haptic],
  );

  const handleGenerateReading = async () => {
    if (!selectedSpread) return;
    if (!unlockedSpreads.has(selectedSpread.slug)) {
      if (onRequireUpgrade) {
        onRequireUpgrade(selectedSpread.minimumPlan);
      }
      return;
    }

    setIsGenerating(true);
    setLimitWarning(null);

    try {
      const response = await fetch('/api/tarot/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userName,
          spreadSlug: selectedSpread.slug,
        }),
      });

      if (response.status === 403) {
        const data = await response.json();
        if (data.code === 'limit_reached') {
          const limit =
            typeof data.usage?.monthlyLimit === 'number'
              ? data.usage.monthlyLimit
              : null;
          const limitCopy = limit
            ? `${limit} saved spreads`
            : 'your saved spreads';
          const windowCopy = limit ? 'this month' : 'for this cycle';
          setLimitWarning(
            `You have reached ${limitCopy} ${windowCopy}. Upgrade to the annual plan for unlimited tarot spreads.`,
          );
        } else if (data.code === 'spread_locked') {
          setLimitWarning('This spread is reserved for subscribers.');
          if (onRequireUpgrade) {
            onRequireUpgrade(data.requiredPlan || 'monthly');
          }
        }
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to generate spread');
      }

      const data = await response.json();
      const newReading: SpreadReadingRecord = data.reading;
      haptic.medium(); // Tactile feedback for successful reading
      setReadings((prev) => [newReading, ...prev]);
      setCurrentReading(newReading);
      setUsage(data.usage || usage);
      setNotesDraft(newReading.notes || '');
      setLastSavedNotes(newReading.notes || '');
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate tarot reading',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveReflectionToJournal = async () => {
    if (!currentReading || !userId || journalSaveState === 'saving') return;

    const cardLines = currentReading.cards
      .map(
        (card) => `- ${card.positionLabel}: ${card.card.name}, ${card.insight}`,
      )
      .join('\n');
    const promptLines = currentReading.journalingPrompts
      .slice(0, 3)
      .map((prompt) => `- ${prompt}`)
      .join('\n');
    const notes = notesDraft.trim();
    const content = [
      `Tarot reflection: ${currentReading.spreadName}`,
      '',
      currentReading.summary,
      '',
      'Cards:',
      cardLines,
      promptLines ? '\nPrompts:\n' + promptLines : '',
      notes ? '\nMy notes:\n' + notes : '',
    ]
      .filter(Boolean)
      .join('\n');

    setJournalSaveState('saving');
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content,
          category: 'journal',
          source: 'tarot',
          sourceMessageId: currentReading.id,
          moodTags: ['tarot', 'reflection', currentReading.spreadSlug],
          cardReferences: currentReading.cards.map((card) => card.card.name),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save reflection');
      }

      setJournalSaveState('saved');
    } catch (err) {
      console.error('[TarotSpreadExperience] Failed to save journal:', err);
      setJournalSaveState('error');
    }
  };

  const handleArchive = async (readingId: string) => {
    try {
      const response = await fetch(`/api/tarot/readings/${readingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove reading');
      }

      const data = await response.json();
      setReadings((prev) => prev.filter((reading) => reading.id !== readingId));
      setUsage(data.usage || usage);
      if (currentReading?.id === readingId) {
        setCurrentReading(null);
        setNotesDraft('');
        setLastSavedNotes('');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to archive reading');
    }
  };

  const renderPlanBadge = (minimumPlan: TarotPlan) => {
    const userRank = subscriptionPlan.plan;
    const isLocked =
      (minimumPlan === 'monthly' && userRank === 'free') ||
      (minimumPlan === 'yearly' && userRank !== 'yearly');

    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
          isLocked
            ? 'bg-surface-card/80 text-content-secondary'
            : 'bg-layer-deep text-content-brand-accent',
        )}
      >
        {isLocked && <LockIcon className='h-3 w-3' />}
        {iosLabel(PLAN_LABEL[minimumPlan], isNativeIOS)}
      </span>
    );
  };

  const groupedSpreads = useMemo(() => {
    return TAROT_SPREADS.reduce<Record<string, typeof TAROT_SPREADS>>(
      (acc, spread) => {
        const group = acc[spread.category] || [];
        group.push(spread);
        acc[spread.category] = group;
        return acc;
      },
      {},
    );
  }, []);

  return (
    <div data-testid='tarot-spreads-section' className='space-y-4'>
      {usage && usage.monthlyLimit !== null && (
        <div className='w-fit rounded-full border border-lunary-primary-800 bg-layer-deep px-3 py-1 text-xs text-content-brand-accent'>
          {usage.monthlyLimit - usage.monthlyUsed} of {usage.monthlyLimit} saved
          spreads this month
        </div>
      )}

      {error && !error.toLowerCase().includes('authentication required') && (
        <div className='rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200'>
          {error}
        </div>
      )}

      {limitWarning && (
        <div className='rounded-lg border border-lunary-accent-700 bg-layer-deep p-3 text-sm text-content-brand-accent'>
          {limitWarning}
        </div>
      )}

      <div className='space-y-4'>
        <CollapsibleSpreadLibrary>
          <div className='grid gap-3 md:grid-cols-2'>
            {Object.entries(groupedSpreads).map(([category, spreads]) => (
              <div
                key={category}
                className='rounded-lg border border-stroke-subtle/40 bg-surface-elevated/40 p-3 space-y-2'
              >
                <p className='text-xs font-medium text-content-muted'>
                  {category}
                </p>
                <div className='space-y-2'>
                  {spreads.map((spread) => {
                    const isLocked = !displayUnlockedSpreads.has(spread.slug);
                    const isSelected = selectedSpreadSlug === spread.slug;

                    return (
                      <button
                        key={spread.slug}
                        onClick={() => handleSelectSpread(spread.slug)}
                        className={clsx(
                          'w-full rounded-lg border px-3 py-2 text-left transition-all relative',
                          isSelected
                            ? isLocked
                              ? 'border-stroke-default/50 bg-surface-elevated/50'
                              : 'border-lunary-primary-600 bg-layer-deep'
                            : isLocked
                              ? 'border-stroke-subtle/30 bg-surface-elevated/30 hover:border-stroke-default/50 cursor-not-allowed'
                              : 'border-stroke-subtle/30 bg-surface-elevated/30 hover:border-lunary-primary-700',
                        )}
                        disabled={isLocked && !isSelected}
                        title={
                          isLocked
                            ? `Upgrade to ${iosLabel(PLAN_LABEL[spread.minimumPlan], isNativeIOS)} to unlock this spread`
                            : undefined
                        }
                      >
                        <div className='flex items-center justify-between gap-2'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <p
                                className={clsx(
                                  'text-sm font-medium',
                                  isLocked
                                    ? 'text-content-muted'
                                    : 'text-content-primary',
                                )}
                              >
                                {spread.name}
                              </p>
                              {isLocked && (
                                <LockIcon className='h-3 w-3 text-content-muted' />
                              )}
                            </div>
                            <p
                              className={clsx(
                                'text-xs',
                                isLocked
                                  ? 'text-content-muted'
                                  : 'text-content-muted',
                              )}
                            >
                              {spread.cardCount} cards · {spread.estimatedTime}
                            </p>
                          </div>
                          {renderPlanBadge(spread.minimumPlan)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSpreadLibrary>

        {!selectedSpread && (
          <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-stroke-subtle bg-surface-elevated/20 p-12 text-center'>
            <Sparkles className='mb-3 h-8 w-8 text-content-brand-accent/50' />
            <p className='text-sm text-content-muted'>
              Select a spread from above to begin your reading
            </p>
          </div>
        )}

        {selectedSpread && (
          <div className='rounded-lg border border-stroke-subtle/50 bg-surface-elevated/40 p-4 space-y-3'>
            {!displayUnlockedSpreads.has(selectedSpread.slug) && (
              <div className='rounded-lg border border-lunary-primary-700 bg-layer-deep p-4 mb-3'>
                <div className='flex items-start gap-3'>
                  <LockIcon className='h-5 w-5 text-lunary-accent mt-0.5 flex-shrink-0' />
                  <div className='flex-1'>
                    <h4 className='text-sm font-medium text-content-brand-accent mb-1'>
                      This spread requires{' '}
                      {iosLabel(
                        PLAN_LABEL[selectedSpread.minimumPlan],
                        isNativeIOS,
                      )}
                    </h4>
                    <p className='text-xs text-content-brand-accent/80 mb-3'>
                      Upgrade to unlock {selectedSpread.name} and access all
                      premium tarot spreads.
                    </p>
                    <UpgradePrompt
                      variant='inline'
                      featureName='tarot_spreads'
                      requiredPlan={mapTarotPlanToPlanId(
                        selectedSpread.minimumPlan,
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
              <div>
                <h3 className='text-lg font-medium text-content-primary'>
                  {selectedSpread.name}
                </h3>
                <p className='text-sm text-content-muted'>
                  {selectedSpread.description}
                </p>
              </div>
              <button
                onClick={handleGenerateReading}
                disabled={
                  isGenerating ||
                  isLoading ||
                  !displayUnlockedSpreads.has(selectedSpread.slug)
                }
                className={clsx(
                  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  isGenerating
                    ? 'bg-layer-deep text-content-brand-accent'
                    : displayUnlockedSpreads.has(selectedSpread.slug)
                      ? 'bg-lunary-primary text-white hover:bg-lunary-primary-400'
                      : 'bg-surface-card/80 text-content-muted cursor-not-allowed',
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Summoning cards...
                  </>
                ) : (
                  <>
                    <Sparkles className='h-4 w-4' />
                    {displayUnlockedSpreads.has(selectedSpread.slug)
                      ? 'Start a reading'
                      : 'Upgrade to unlock'}
                  </>
                )}
              </button>
            </div>
            <div className='grid gap-3 md:grid-cols-2'>
              <div className='rounded-md border border-stroke-subtle/40 bg-surface-base/40 p-3'>
                <p className='text-xs font-semibold uppercase text-content-muted'>
                  Intention
                </p>
                <p className='text-sm text-content-secondary'>
                  {selectedSpread.intention}
                </p>
              </div>
              <div className='rounded-md border border-stroke-subtle/40 bg-surface-base/40 p-3'>
                <p className='text-xs font-semibold uppercase text-content-muted'>
                  Journaling Prompts
                </p>
                <ul className='mt-1 space-y-1 text-xs text-content-secondary'>
                  {selectedSpread.journalPrompts.slice(0, 2).map((prompt) => (
                    <li key={prompt}>• {prompt}</li>
                  ))}
                  {selectedSpread.journalPrompts.length > 2 && (
                    <li className='text-content-muted'>
                      + more in the spread guide
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='grid gap-4 lg:grid-cols-[2fr,1fr]'>
        <div className='space-y-4'>
          {isLoading && (
            <div className='flex h-32 items-center justify-center rounded-lg border border-stroke-subtle/40 bg-surface-elevated/30'>
              <Loader2 className='h-6 w-6 animate-spin text-content-muted' />
            </div>
          )}

          {!isLoading && !currentReading && (
            <div className='flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-stroke-subtle bg-surface-elevated/20 text-center text-sm text-content-muted'>
              <Sparkles className='mb-2 h-5 w-5 text-content-brand-accent' />
              Pull a spread to start building your tarot archive.
            </div>
          )}

          {currentReading && (
            <div className='space-y-4'>
              <div className='rounded-lg border border-lunary-primary-800 bg-layer-deep p-4'>
                <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
                  <div>
                    <p className='text-xs uppercase tracking-wider text-content-brand-accent/80'>
                      {currentReading?.spreadName}
                    </p>
                    <h3 className='text-base sm:text-lg font-medium text-content-primary'>
                      {currentReading?.summary}
                    </h3>
                  </div>
                  <div className='flex items-center gap-2'>
                    {currentReading?.createdAt && (
                      <Link
                        href={`/app/time-machine?${new URLSearchParams({
                          date: new Date(currentReading.createdAt)
                            .toISOString()
                            .slice(0, 10),
                          label: `Tarot: ${currentReading.spreadName}`,
                        }).toString()}`}
                        className='inline-flex items-center gap-2 rounded-md border border-stroke-subtle bg-surface-elevated/40 px-3 py-1 text-xs font-medium text-content-secondary transition-colors hover:border-lunary-primary/40 hover:text-content-primary'
                      >
                        <CalendarDays className='h-4 w-4' />
                        Sky that day
                      </Link>
                    )}
                    {onShareReading && currentReading && (
                      <button
                        type='button'
                        onClick={() => onShareReading(currentReading)}
                        className='inline-flex items-center gap-2 rounded-md bg-surface-elevated/60 px-3 py-1 text-xs font-medium text-content-brand transition-colors hover:bg-surface-elevated/80'
                      >
                        <Share2 className='h-4 w-4' />
                        Share spread
                      </button>
                    )}
                    <p className='text-xs text-content-muted'>
                      Saved{' '}
                      {currentReading?.createdAt
                        ? new Date(
                            currentReading.createdAt,
                          ).toLocaleDateString()
                        : ''}
                    </p>
                  </div>
                </div>
                <div className='mt-3 flex flex-wrap gap-2'>
                  {currentReading?.highlights?.map((highlight) => (
                    <span
                      key={highlight}
                      className='rounded-full bg-surface-elevated/60 px-3 py-1 text-xs text-content-secondary'
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              <div className='space-y-3'>
                {currentReading?.cards?.map((card, cardIndex) => {
                  const isTransitExpanded =
                    expandedTransitCardIndex === cardIndex;
                  const cardAccent = getTarotSuitAccent({
                    cardName: card.card.name,
                    suit: card.card.suit,
                    arcana: card.card.arcana,
                  });
                  return (
                    <div
                      key={card.positionId}
                      data-testid={`spread-card-${cardIndex}`}
                      className='rounded-xl border border-stroke-subtle/50 bg-gradient-to-br from-surface-elevated/65 to-layer-base/35 p-3 shadow-[0_16px_55px_rgba(0,0,0,0.16)] sm:p-4'
                    >
                      {/* Card header - clickable to preview */}
                      <button
                        type='button'
                        onClick={() => handleCardPreview(card.card)}
                        className='w-full flex items-start gap-3 text-left transition-colors hover:opacity-90'
                      >
                        <div
                          className={clsx(
                            'flex h-16 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br text-content-primary shadow-inner shadow-black/25 sm:h-20 sm:w-14 sm:rounded-xl',
                            cardAccent,
                          )}
                        >
                          <TarotSuitIcon
                            cardName={card.card.name}
                            suit={card.card.suit}
                            arcana={card.card.arcana}
                            className='h-6 w-6 text-content-brand-accent sm:h-7 sm:w-7'
                          />
                        </div>
                        <div className='flex min-w-0 flex-1 flex-col items-start gap-2'>
                          <div className='flex w-full items-start justify-between gap-3'>
                            <div>
                              <p className='text-xs uppercase tracking-wide text-content-muted'>
                                {card.positionLabel}
                              </p>
                              <p className='text-xs text-content-muted'>
                                {card.positionPrompt}
                              </p>
                            </div>
                            <span className='rounded-full border border-stroke-subtle/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-content-muted'>
                              {card.card.arcana === 'major'
                                ? 'Major'
                                : card.card.suit || 'Minor'}
                            </span>
                          </div>
                          <p className='text-base sm:text-lg font-semibold text-content-primary'>
                            {card.card.name}
                          </p>
                          <p className='text-sm text-content-secondary leading-relaxed'>
                            "{card.insight}"
                          </p>
                          <div className='flex flex-wrap gap-1'>
                            {card.card.keywords.slice(0, 4).map((keyword) => (
                              <span
                                key={`${card.positionId}-${keyword}`}
                                className='text-xs px-2 py-0.5 rounded text-content-primary bg-surface-elevated border border-stroke-subtle'
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                          <p className='text-xs text-content-brand'>
                            Tap to explore the full meaning
                          </p>
                        </div>
                      </button>

                      {/* In Your Chart - collapsible per card transit insights */}
                      <div className='mt-3 sm:mt-4'>
                        <button
                          type='button'
                          data-testid={`spread-transit-toggle-${cardIndex}`}
                          onClick={() =>
                            setExpandedTransitCardIndex(
                              isTransitExpanded ? -1 : cardIndex,
                            )
                          }
                          className='w-full flex items-center justify-between px-3 py-2 rounded-lg border border-lunary-primary-800/30 bg-layer-deep/20 hover:bg-layer-deep/30 transition-colors sm:px-4 sm:py-3'
                        >
                          <span className='text-sm font-medium text-content-brand-accent'>
                            In Your Chart
                          </span>
                          {isTransitExpanded ? (
                            <ChevronUp className='w-4 h-4 text-content-brand-accent' />
                          ) : (
                            <ChevronDown className='w-4 h-4 text-content-brand-accent' />
                          )}
                        </button>

                        {isTransitExpanded && (
                          <div
                            className='mt-2'
                            data-testid={`spread-transit-content-${cardIndex}`}
                          >
                            <TarotTransitConnection
                              cardName={card.card.name}
                              birthChart={birthChart}
                              userBirthday={userBirthday}
                              currentTransits={currentAstrologicalChart || []}
                              historicalTransits={
                                currentReading.metadata?.transitAspects as
                                  | any[]
                                  | null
                              }
                              historicalTimestamp={
                                currentReading.metadata?.transitCapturedAt as
                                  | string
                                  | null
                              }
                              readingCreatedAt={currentReading.createdAt}
                              userBirthLocation={userBirthLocation}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium text-content-primary'>
                    Reflection Notes
                  </p>
                  <span className='text-xs text-content-muted'>
                    {isSavingNotes ? 'Saving...' : 'Auto-saved'}
                  </span>
                </div>
                <textarea
                  value={notesDraft}
                  onChange={(event) => setNotesDraft(event.target.value)}
                  rows={4}
                  placeholder='Capture rituals, emotions, and how the message landed today.'
                  className='w-full rounded-lg border border-stroke-subtle/60 bg-surface-base/70 p-3 text-sm text-content-primary placeholder:text-content-muted focus:border-lunary-primary-600 focus:outline-none focus:ring-1 focus:ring-lunary-primary-600'
                />
                <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stroke-subtle/45 bg-surface-elevated/35 px-3 py-2'>
                  <p className='text-xs text-content-muted'>
                    Save this spread into your journal so it can feed long-term
                    patterns.
                  </p>
                  <button
                    type='button'
                    onClick={handleSaveReflectionToJournal}
                    disabled={journalSaveState === 'saving'}
                    className='inline-flex items-center gap-1.5 rounded-full border border-lunary-primary/35 bg-lunary-primary/10 px-3 py-1.5 text-xs font-medium text-content-brand transition-colors hover:bg-lunary-primary/20 disabled:opacity-60'
                  >
                    {journalSaveState === 'saving' ? (
                      <Loader2 className='h-3.5 w-3.5 animate-spin' />
                    ) : journalSaveState === 'saved' ? (
                      <CheckCircle2 className='h-3.5 w-3.5' />
                    ) : (
                      <BookOpen className='h-3.5 w-3.5' />
                    )}
                    {journalSaveState === 'saved'
                      ? 'Saved to journal'
                      : journalSaveState === 'error'
                        ? 'Try again'
                        : 'Save to journal'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='space-y-4'>
          <div className='rounded-lg border border-stroke-subtle/50 bg-surface-elevated/40 p-4'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-content-primary'>
                Saved Spreads
              </p>
              {usage && usage.plan !== 'free' && (
                <span className='text-xs text-content-brand-accent'>
                  History: {usage?.historyWindowDays ?? 0} days
                </span>
              )}
            </div>
            <div className='mt-3 space-y-2'>
              {readings.length === 0 && (
                <p className='text-xs text-content-muted'>
                  No saved spreads yet. Your pulls will appear here.
                </p>
              )}
              {readings.map((reading) => (
                <div
                  key={reading.id}
                  className={clsx(
                    'group flex items-start justify-between gap-3 rounded-xl border px-3 py-3 transition-colors',
                    currentReading?.id === reading.id
                      ? 'border-lunary-primary-500 bg-gradient-to-br from-lunary-primary/15 to-layer-deep ring-1 ring-lunary-primary/25'
                      : 'border-stroke-subtle/40 bg-gradient-to-br from-surface-elevated/45 to-layer-base/20 hover:border-lunary-primary-700',
                  )}
                >
                  <button
                    onClick={() => setCurrentReading(reading)}
                    className='flex flex-1 items-start gap-3 text-left'
                  >
                    <div className='flex h-10 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-layer-deep text-[10px] font-semibold tracking-[0.16em] text-content-brand-accent'>
                      {reading.cards.length}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium text-content-primary'>
                        {reading.spreadName}
                      </p>
                      <p className='text-xs text-content-muted'>
                        {new Date(reading.createdAt).toLocaleDateString()}
                      </p>
                      <p className='mt-1 line-clamp-2 text-xs leading-relaxed text-content-secondary'>
                        {reading.summary}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleArchive(reading.id)}
                    className='text-content-muted hover:text-red-400'
                    aria-label='Archive reading'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className='rounded-lg border border-stroke-subtle/50 bg-surface-elevated/40 p-4 text-sm text-content-secondary'>
            <p className='text-sm font-medium text-content-primary'>Tips</p>
            <ul className='mt-2 space-y-1 text-xs text-content-muted'>
              <li>• Click a card to open its full meaning.</li>
              <li>• Notes auto-save—capture rituals, actions, and shifts.</li>
              <li>
                • Archive spreads once complete to keep your library focused.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
