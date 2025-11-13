'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Lock, Sparkles, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import {
  TAROT_SPREADS,
  TAROT_SPREAD_MAP,
  PLAN_RANK,
  TarotPlan,
} from '@/constants/tarotSpreads';
import { TarotCard } from '@/components/TarotCard';

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

type SpreadReadingRecord = {
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

const PLAN_LABEL: Record<TarotPlan, string> = {
  free: 'Cosmic Explorer',
  monthly: 'Cosmic Guide',
  yearly: 'Cosmic Master',
};

const findFirstUnlockedSpread = (
  unlocked: Set<string>,
  plan: TarotPlan,
): string => {
  const defaultSpread =
    TAROT_SPREADS.find((spread) => unlocked.has(spread.slug)) ||
    TAROT_SPREADS[0];

  return defaultSpread.slug;
};

export function TarotSpreadExperience({
  userId,
  userName,
  subscriptionPlan,
  onRequireUpgrade,
  onCardPreview,
}: TarotSpreadExperienceProps) {
  const [selectedSpreadSlug, setSelectedSpreadSlug] = useState<string>(
    TAROT_SPREADS[0].slug,
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

  const selectedSpread = TAROT_SPREAD_MAP[selectedSpreadSlug];

  const unlockedSpreads = useMemo(
    () => unlockedSpreadSlugs,
    [unlockedSpreadSlugs],
  );

  const refreshReadings = useCallback(async () => {
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
          // Fallback: unlock spreads based on subscription plan
          const fallbackUnlocked = Object.keys(TAROT_SPREAD_MAP).filter(
            (slug) => {
              const spread = TAROT_SPREAD_MAP[slug];
              if (!spread) return false;
              const planRank = PLAN_RANK[subscriptionPlan.plan];
              const spreadRank = PLAN_RANK[spread.minimumPlan];
              return planRank >= spreadRank;
            },
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

      const unlocked = new Set<string>(data.spreadsUnlocked || []);
      setUnlockedSpreadSlugs(unlocked);

      console.log('[TarotSpreadExperience] Loaded spreads:', {
        readingsCount: fetchedReadings.length,
        unlockedCount: unlocked.size,
        subscriptionPlan: subscriptionPlan.plan,
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
      if (!unlocked.has(selectedSpreadSlug)) {
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
  }, [selectedSpreadSlug, subscriptionPlan.plan]);

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
          setLimitWarning(
            'You have used all complimentary spread saves for this cycle. Upgrade to unlock unlimited tarot journaling.',
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
            : 'bg-purple-500/10 text-purple-200',
        )}
      >
        {isLocked && <Lock className='h-3 w-3' />}
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
          <div className='rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-200'>
            {usage.monthlyLimit - usage.monthlyUsed} of {usage.monthlyLimit}{' '}
            complimentary saves remaining
          </div>
        )}
      </div>

      {error && (
        <div className='rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200'>
          {error}
        </div>
      )}

      {limitWarning && (
        <div className='rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-200'>
          {limitWarning}
        </div>
      )}

      <div className='space-y-4'>
        <div className='space-y-2'>
          <span className='text-xs uppercase tracking-wide text-zinc-500'>
            Spread Library
          </span>
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
                          'w-full rounded-lg border px-3 py-2 text-left transition-all',
                          isSelected
                            ? 'border-purple-500/40 bg-purple-500/10'
                            : 'border-zinc-800/30 bg-zinc-900/30 hover:border-purple-500/30',
                          isLocked ? 'opacity-60' : 'opacity-100',
                        )}
                      >
                        <div className='flex items-center justify-between gap-2'>
                          <div>
                            <p className='text-sm font-medium text-zinc-100'>
                              {spread.name}
                            </p>
                            <p className='text-xs text-zinc-400'>
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
        </div>

        {selectedSpread && (
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4 space-y-3'>
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
                    ? 'bg-purple-500/10 text-purple-200'
                    : unlockedSpreads.has(selectedSpread.slug)
                      ? 'bg-purple-500/80 text-white hover:bg-purple-500'
                      : 'bg-zinc-800/80 text-zinc-400',
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
                    Start a reading
                  </>
                )}
              </button>
            </div>
            <div className='grid gap-3 md:grid-cols-2'>
              <div className='rounded-md border border-zinc-800/40 bg-zinc-950/40 p-3'>
                <p className='text-xs font-semibold uppercase text-zinc-500'>
                  Intention
                </p>
                <p className='text-sm text-zinc-300'>
                  {selectedSpread.intention}
                </p>
              </div>
              <div className='rounded-md border border-zinc-800/40 bg-zinc-950/40 p-3'>
                <p className='text-xs font-semibold uppercase text-zinc-500'>
                  Journaling Prompts
                </p>
                <ul className='mt-1 space-y-1 text-xs text-zinc-300'>
                  {selectedSpread.journalPrompts.slice(0, 2).map((prompt) => (
                    <li key={prompt}>• {prompt}</li>
                  ))}
                  {selectedSpread.journalPrompts.length > 2 && (
                    <li className='text-zinc-500'>+ more once you save</li>
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
              <Sparkles className='mb-2 h-5 w-5 text-purple-300' />
              Pull a spread to start building your tarot archive.
            </div>
          )}

          {currentReading && (
            <div className='space-y-4'>
              <div className='rounded-lg border border-purple-500/20 bg-purple-500/10 p-4'>
                <div className='flex items-center justify-between gap-2'>
                  <div>
                    <p className='text-xs uppercase tracking-wider text-purple-300/80'>
                      {currentReading.spreadName}
                    </p>
                    <h3 className='text-lg font-medium text-zinc-100'>
                      {currentReading.summary}
                    </h3>
                  </div>
                  <p className='text-xs text-zinc-400'>
                    Saved{' '}
                    {new Date(currentReading.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className='mt-3 flex flex-wrap gap-2'>
                  {currentReading.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className='rounded-full bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300'
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                {currentReading.cards.map((card) => (
                  <div
                    key={card.positionId}
                    className='flex h-full flex-col overflow-hidden rounded-lg border border-zinc-800/50 bg-zinc-900/40'
                  >
                    <div className='border-b border-zinc-800/50 bg-zinc-900/60 px-3 py-2'>
                      <p className='text-xs uppercase tracking-wide text-zinc-500'>
                        {card.positionLabel}
                      </p>
                      <p className='text-xs text-zinc-400'>
                        {card.positionPrompt}
                      </p>
                    </div>
                    <div className='flex-1 space-y-3 p-3'>
                      <button
                        className='w-full text-left'
                        onClick={() =>
                          onCardPreview?.({
                            name: card.card.name,
                            keywords: card.card.keywords,
                            information: card.card.information,
                          })
                        }
                      >
                        <TarotCard
                          name={card.card.name}
                          keywords={card.card.keywords.slice(0, 3)}
                          information={
                            card.card.information.slice(0, 140) + '…'
                          }
                          variant={
                            card.card.arcana === 'major' ? 'major' : 'minor'
                          }
                        />
                      </button>
                      <p className='text-sm text-zinc-300'>{card.insight}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium text-zinc-200'>
                    Reflection Notes
                  </p>
                  <span className='text-xs text-zinc-500'>
                    {isSavingNotes ? 'Saving…' : 'Auto-saved'}
                  </span>
                </div>
                <textarea
                  value={notesDraft}
                  onChange={(event) => setNotesDraft(event.target.value)}
                  rows={4}
                  placeholder='Capture rituals, emotions, and how the message landed today.'
                  className='w-full rounded-lg border border-zinc-800/60 bg-zinc-950/70 p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/60 focus:outline-none focus:ring-1 focus:ring-purple-500/60'
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
                <span className='text-xs text-purple-200'>
                  History: {usage.historyWindowDays} days
                </span>
              )}
            </div>
            <div className='mt-3 space-y-2'>
              {readings.length === 0 && (
                <p className='text-xs text-zinc-500'>
                  No saved spreads yet. Your pulls will appear here.
                </p>
              )}
              {readings.map((reading) => (
                <div
                  key={reading.id}
                  className={clsx(
                    'group flex items-start justify-between gap-3 rounded-md border px-3 py-2',
                    currentReading?.id === reading.id
                      ? 'border-purple-500/40 bg-purple-500/10'
                      : 'border-zinc-800/40 bg-zinc-900/40 hover:border-purple-500/30',
                  )}
                >
                  <button
                    onClick={() => setCurrentReading(reading)}
                    className='flex-1 text-left'
                  >
                    <p className='text-sm font-medium text-zinc-100'>
                      {reading.spreadName}
                    </p>
                    <p className='text-xs text-zinc-500'>
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
