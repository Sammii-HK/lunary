'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
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

export type SubscriptionStatus =
  | 'free'
  | 'trial'
  | 'active'
  | 'cancelled'
  | 'past_due';

export interface TarotSpreadExperienceProps {
  userId?: string;
  userName?: string;
  userBirthday?: string;
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
  yearly: 'Lunary+ AI Annual',
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
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className='space-y-2'>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className='flex w-full items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-3 py-2 text-left transition-colors hover:bg-zinc-900/50'
      >
        <span className='text-xs uppercase tracking-wide text-zinc-400'>
          Spread Library
        </span>
        {isCollapsed ? (
          <ChevronDown className='w-4 h-4 text-zinc-400' />
        ) : (
          <ChevronUp className='w-4 h-4 text-zinc-400' />
        )}
      </button>
      {!isCollapsed && <div>{children}</div>}
    </div>
  );
}

export function TarotSpreadExperience({
  userId,
  userName,
  subscriptionPlan,
  onRequireUpgrade,
  onCardPreview,
  onShareReading,
}: TarotSpreadExperienceProps) {
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
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [lastSavedNotes, setLastSavedNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const selectedSpread = selectedSpreadSlug
    ? TAROT_SPREAD_MAP[selectedSpreadSlug]
    : null;

  const unlockedSpreads = useMemo(
    () => unlockedSpreadSlugs,
    [unlockedSpreadSlugs],
  );

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

      setReadings(fetchedReadings);
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
      onCardPreview({
        name: cardData.name,
        keywords: cardData.keywords,
        information: cardData.information,
      });
    },
    [onCardPreview],
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
            ? 'bg-zinc-800/80 text-zinc-300'
            : 'bg-lunary-primary-950 text-lunary-accent-200',
        )}
      >
        {isLocked && <LockIcon className='h-3 w-3' />}
        {PLAN_LABEL[minimumPlan]}
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
    <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 space-y-6'>
      <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100'>
            Guided Tarot Spreads
          </h2>
          <p className='text-sm text-zinc-400'>
            Choose a spread, draw cards instantly, and save your insights.
          </p>
        </div>
        {usage && usage.monthlyLimit !== null && (
          <div className='rounded-full border border-lunary-primary-800 bg-lunary-primary-950 px-3 py-1 text-xs text-lunary-accent-200'>
            {usage.monthlyLimit - usage.monthlyUsed} of {usage.monthlyLimit}{' '}
            saved spreads this month
          </div>
        )}
      </div>

      {error && !error.toLowerCase().includes('authentication required') && (
        <div className='rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200'>
          {error}
        </div>
      )}

      {limitWarning && (
        <div className='rounded-lg border border-lunary-accent-700 bg-lunary-accent-950 p-3 text-sm text-lunary-accent-200'>
          {limitWarning}
        </div>
      )}

      <div className='space-y-4'>
        <CollapsibleSpreadLibrary>
          <div className='grid gap-3 md:grid-cols-2'>
            {Object.entries(groupedSpreads).map(([category, spreads]) => (
              <div
                key={category}
                className='rounded-lg border border-zinc-800/40 bg-zinc-900/40 p-3 space-y-2'
              >
                <p className='text-xs font-medium text-zinc-400'>{category}</p>
                <div className='space-y-2'>
                  {spreads.map((spread) => {
                    const isLocked = !unlockedSpreads.has(spread.slug);
                    const isSelected = selectedSpreadSlug === spread.slug;

                    return (
                      <button
                        key={spread.slug}
                        onClick={() => handleSelectSpread(spread.slug)}
                        className={clsx(
                          'w-full rounded-lg border px-3 py-2 text-left transition-all relative',
                          isSelected
                            ? isLocked
                              ? 'border-zinc-700/50 bg-zinc-900/50'
                              : 'border-lunary-primary-600 bg-lunary-primary-950'
                            : isLocked
                              ? 'border-zinc-800/30 bg-zinc-900/30 hover:border-zinc-700/50 cursor-not-allowed'
                              : 'border-zinc-800/30 bg-zinc-900/30 hover:border-lunary-primary-700',
                        )}
                        disabled={isLocked && !isSelected}
                        title={
                          isLocked
                            ? `Upgrade to ${PLAN_LABEL[spread.minimumPlan]} to unlock this spread`
                            : undefined
                        }
                      >
                        <div className='flex items-center justify-between gap-2'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <p
                                className={clsx(
                                  'text-sm font-medium',
                                  isLocked ? 'text-zinc-400' : 'text-zinc-100',
                                )}
                              >
                                {spread.name}
                              </p>
                              {isLocked && (
                                <LockIcon className='h-3 w-3 text-zinc-600' />
                              )}
                            </div>
                            <p
                              className={clsx(
                                'text-xs',
                                isLocked ? 'text-zinc-600' : 'text-zinc-400',
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
          <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center'>
            <Sparkles className='mb-3 h-8 w-8 text-lunary-accent-300/50' />
            <p className='text-sm text-zinc-400'>
              Select a spread from above to begin your reading
            </p>
          </div>
        )}

        {selectedSpread && (
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4 space-y-3'>
            {!unlockedSpreads.has(selectedSpread.slug) && (
              <div className='rounded-lg border border-lunary-primary-700 bg-lunary-primary-950 p-4 mb-3'>
                <div className='flex items-start gap-3'>
                  <LockIcon className='h-5 w-5 text-lunary-accent mt-0.5 flex-shrink-0' />
                  <div className='flex-1'>
                    <h4 className='text-sm font-medium text-lunary-accent-200 mb-1'>
                      This spread requires{' '}
                      {PLAN_LABEL[selectedSpread.minimumPlan]}
                    </h4>
                    <p className='text-xs text-lunary-accent-300/80 mb-3'>
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
                <h3 className='text-lg font-medium text-zinc-100'>
                  {selectedSpread.name}
                </h3>
                <p className='text-sm text-zinc-400'>
                  {selectedSpread.description}
                </p>
              </div>
              <button
                onClick={handleGenerateReading}
                disabled={
                  isGenerating ||
                  isLoading ||
                  !unlockedSpreads.has(selectedSpread.slug)
                }
                className={clsx(
                  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  isGenerating
                    ? 'bg-lunary-primary-950 text-lunary-accent-200'
                    : unlockedSpreads.has(selectedSpread.slug)
                      ? 'bg-lunary-primary text-white hover:bg-lunary-primary-400'
                      : 'bg-zinc-800/80 text-zinc-400 cursor-not-allowed',
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
                    {unlockedSpreads.has(selectedSpread.slug)
                      ? 'Start a reading'
                      : 'Upgrade to unlock'}
                  </>
                )}
              </button>
            </div>
            <div className='grid gap-3 md:grid-cols-2'>
              <div className='rounded-md border border-zinc-800/40 bg-zinc-950/40 p-3'>
                <p className='text-xs font-semibold uppercase text-zinc-400'>
                  Intention
                </p>
                <p className='text-sm text-zinc-300'>
                  {selectedSpread.intention}
                </p>
              </div>
              <div className='rounded-md border border-zinc-800/40 bg-zinc-950/40 p-3'>
                <p className='text-xs font-semibold uppercase text-zinc-400'>
                  Journaling Prompts
                </p>
                <ul className='mt-1 space-y-1 text-xs text-zinc-300'>
                  {selectedSpread.journalPrompts.slice(0, 2).map((prompt) => (
                    <li key={prompt}>• {prompt}</li>
                  ))}
                  {selectedSpread.journalPrompts.length > 2 && (
                    <li className='text-zinc-400'>
                      + more in the spread guide
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='grid gap-6 lg:grid-cols-[2fr,1fr]'>
        <div className='space-y-4'>
          {isLoading && (
            <div className='flex h-48 items-center justify-center rounded-lg border border-zinc-800/40 bg-zinc-900/30'>
              <Loader2 className='h-6 w-6 animate-spin text-zinc-400' />
            </div>
          )}

          {!isLoading && !currentReading && (
            <div className='flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/20 text-center text-sm text-zinc-400'>
              <Sparkles className='mb-2 h-5 w-5 text-lunary-accent-300' />
              Pull a spread to start building your tarot archive.
            </div>
          )}

          {currentReading && (
            <div className='space-y-4'>
              <div className='rounded-lg border border-lunary-primary-800 bg-lunary-primary-950 p-4'>
                <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
                  <div>
                    <p className='text-xs uppercase tracking-wider text-lunary-accent-300/80'>
                      {currentReading?.spreadName}
                    </p>
                    <h3 className='text-lg font-medium text-zinc-100'>
                      {currentReading?.summary}
                    </h3>
                  </div>
                  <div className='flex items-center gap-2'>
                    {onShareReading && currentReading && (
                      <button
                        type='button'
                        onClick={() => onShareReading(currentReading)}
                        className='inline-flex items-center gap-2 rounded-md bg-zinc-900/60 px-3 py-1 text-xs font-medium text-lunary-primary-300 transition-colors hover:bg-zinc-900/80'
                      >
                        <Share2 className='h-4 w-4' />
                        Share spread
                      </button>
                    )}
                    <p className='text-xs text-zinc-400'>
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
                      className='rounded-full bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300'
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              <div className='grid gap-3 md:grid-cols-2'>
                {currentReading?.cards?.map((card) => (
                  <button
                    key={card.positionId}
                    type='button'
                    onClick={() => handleCardPreview(card.card)}
                    className='flex flex-col items-start gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-3 text-left transition-colors hover:border-lunary-primary-600'
                  >
                    <div className='flex w-full items-center justify-between'>
                      <div>
                        <p className='text-xs uppercase tracking-wide text-zinc-400'>
                          {card.positionLabel}
                        </p>
                        <p className='text-xs text-zinc-500'>
                          {card.positionPrompt}
                        </p>
                      </div>
                      <span className='text-[10px] uppercase tracking-[0.2em] text-zinc-500'>
                        {card.card.arcana === 'major' ? 'Major' : 'Minor'}
                      </span>
                    </div>
                    <p className='text-lg font-semibold text-zinc-100'>
                      {card.card.name}
                    </p>
                    <p className='text-sm text-zinc-300 leading-relaxed'>
                      “{card.insight}”
                    </p>
                    <div className='flex flex-wrap gap-1'>
                      {card.card.keywords.slice(0, 4).map((keyword) => (
                        <span
                          key={`${card.positionId}-${keyword}`}
                          className='text-xs px-2 py-0.5 rounded text-zinc-100 bg-zinc-900 border border-zinc-800'
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <p className='text-xs text-lunary-primary-300'>
                      Tap to explore the full meaning
                    </p>
                  </button>
                ))}
              </div>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium text-zinc-200'>
                    Reflection Notes
                  </p>
                  <span className='text-xs text-zinc-400'>
                    {isSavingNotes ? 'Saving…' : 'Auto-saved'}
                  </span>
                </div>
                <textarea
                  value={notesDraft}
                  onChange={(event) => setNotesDraft(event.target.value)}
                  rows={4}
                  placeholder='Capture rituals, emotions, and how the message landed today.'
                  className='w-full rounded-lg border border-zinc-800/60 bg-zinc-950/70 p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lunary-primary-600 focus:outline-none focus:ring-1 focus:ring-lunary-primary-600'
                />
              </div>
            </div>
          )}
        </div>

        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-zinc-100'>Saved Spreads</p>
              {usage && usage.plan !== 'free' && (
                <span className='text-xs text-lunary-accent-200'>
                  History: {usage?.historyWindowDays ?? 0} days
                </span>
              )}
            </div>
            <div className='mt-3 space-y-2'>
              {readings.length === 0 && (
                <p className='text-xs text-zinc-400'>
                  No saved spreads yet. Your pulls will appear here.
                </p>
              )}
              {readings.map((reading) => (
                <div
                  key={reading.id}
                  className={clsx(
                    'group flex items-start justify-between gap-3 rounded-md border px-3 py-2',
                    currentReading?.id === reading.id
                      ? 'border-lunary-primary-600 bg-lunary-primary-950'
                      : 'border-zinc-800/40 bg-zinc-900/40 hover:border-lunary-primary-700',
                  )}
                >
                  <button
                    onClick={() => setCurrentReading(reading)}
                    className='flex-1 text-left'
                  >
                    <p className='text-sm font-medium text-zinc-100'>
                      {reading.spreadName}
                    </p>
                    <p className='text-xs text-zinc-400'>
                      {new Date(reading.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                  <button
                    onClick={() => handleArchive(reading.id)}
                    className='text-zinc-600 hover:text-red-400'
                    aria-label='Archive reading'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4 text-sm text-zinc-300'>
            <p className='text-sm font-medium text-zinc-100'>Tips</p>
            <ul className='mt-2 space-y-1 text-xs text-zinc-400'>
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
