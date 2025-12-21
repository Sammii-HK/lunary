'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import {
  analyzeLifeThemes,
  hasEnoughDataForThemes,
  LifeThemeInput,
  LifeThemeResult,
} from '@/lib/life-themes/engine';

interface LifeThemesCardProps {
  className?: string;
}

export function LifeThemesCard({ className = '' }: LifeThemesCardProps) {
  const subscription = useSubscription();
  const isPremium = hasBirthChartAccess(subscription.status, subscription.plan);

  const [themes, setThemes] = useState<LifeThemeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const [hasEnoughData, setHasEnoughData] = useState(false);

  useEffect(() => {
    async function loadThemes() {
      try {
        const [journalRes, patternsRes, dreamsRes] = await Promise.all([
          fetch('/api/journal?limit=30', { credentials: 'include' }).catch(
            () => null,
          ),
          fetch('/api/patterns?days=30', { credentials: 'include' }).catch(
            () => null,
          ),
          fetch('/api/journal/dreams?limit=20', {
            credentials: 'include',
          }).catch(() => null),
        ]);

        const journalData = journalRes?.ok
          ? await journalRes.json()
          : { entries: [] };
        const patternsData = patternsRes?.ok ? await patternsRes.json() : null;
        const dreamsData = dreamsRes?.ok
          ? await dreamsRes.json()
          : { entries: [] };

        const dreamTags = (dreamsData.entries || []).flatMap(
          (e: any) => e.dreamTags || [],
        );

        const input: LifeThemeInput = {
          journalEntries: (journalData.entries || []).map((e: any) => ({
            content: e.content || '',
            moodTags: e.moodTags || [],
            createdAt: e.createdAt,
          })),
          tarotPatterns: patternsData
            ? {
                dominantThemes: patternsData.dominantThemes || [],
                frequentCards: patternsData.frequentCards || [],
                suitDistribution: patternsData.suitDistribution || [],
              }
            : null,
          dreamTags,
        };

        setHasEnoughData(hasEnoughDataForThemes(input));

        if (hasEnoughDataForThemes(input)) {
          const maxThemes = isPremium ? 3 : 1;
          const analyzedThemes = analyzeLifeThemes(input, maxThemes);
          setThemes(analyzedThemes);
        }
      } catch (error) {
        console.error('[LifeThemesCard] Failed to load themes:', error);
      } finally {
        setLoading(false);
      }
    }

    loadThemes();
  }, [isPremium]);

  if (loading) {
    return (
      <div
        className={`rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4 ${className}`}
      >
        <div className='h-16 bg-zinc-900/50 rounded-lg animate-pulse' />
      </div>
    );
  }

  if (!hasEnoughData) {
    return (
      <div
        className={`rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4 ${className}`}
      >
        <div className='flex items-center gap-2 mb-2'>
          <Sparkles className='w-4 h-4 text-zinc-600' />
          <h3 className='text-sm font-medium text-zinc-400'>Life Themes</h3>
        </div>
        <p className='text-xs text-zinc-500 leading-relaxed'>
          Life themes appear as you write more in your journal and pull more
          tarot. Try saving a few reflections, record a dream, or do some
          spreads, then check back here.
        </p>
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <div
        className={`rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4 ${className}`}
      >
        <div className='flex items-center gap-2 mb-2'>
          <Sparkles className='w-4 h-4 text-zinc-600' />
          <h3 className='text-sm font-medium text-zinc-400'>Life Themes</h3>
        </div>
        <p className='text-xs text-zinc-500 leading-relaxed'>
          Themes are emerging from your activity. Keep journaling, pulling
          tarot, and recording dreams to reveal stronger patterns.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4 ${className} max-w-full`}
    >
      <div className='flex items-center gap-2 mb-3'>
        <Sparkles className='w-4 h-4 text-lunary-primary-400' />
        <h3 className='text-sm font-medium text-zinc-200'>
          Current Life Themes
        </h3>
      </div>

      <div className='space-y-2'>
        {themes.map((theme) => {
          const isExpanded = expandedTheme === theme.id;

          return (
            <div
              key={theme.id}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden'
            >
              <button
                onClick={() => setExpandedTheme(isExpanded ? null : theme.id)}
                className='w-full flex items-center justify-between p-3 text-left hover:bg-zinc-800/30 transition-colors'
              >
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-zinc-100'>
                    {theme.name}
                  </p>
                  {!isExpanded && (
                    <p className='text-xs text-zinc-400 truncate'>
                      {theme.shortSummary}
                    </p>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-500 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isExpanded && (
                <div className='px-3 pb-3 space-y-3'>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    {isPremium ? theme.longSummary : theme.shortSummary}
                  </p>

                  {isPremium && theme.guidanceBullets.length > 0 && (
                    <div className='space-y-1.5'>
                      <p className='text-xs font-medium text-zinc-400 uppercase tracking-wide'>
                        Guidance
                      </p>
                      <ul className='space-y-1'>
                        {theme.guidanceBullets.slice(0, 3).map((bullet, i) => (
                          <li
                            key={i}
                            className='text-xs text-zinc-400 flex items-start gap-2'
                          >
                            <span className='text-lunary-primary-400 mt-0.5'>
                              •
                            </span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {theme.relatedTags.length > 0 && (
                    <div className='flex flex-wrap gap-1.5'>
                      {theme.relatedTags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className='text-xs px-2 py-0.5 rounded bg-lunary-primary-900/30 text-lunary-primary-300'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isPremium && themes.length > 0 && (
        <p className='text-xs text-zinc-500 mt-3'>
          Upgrade for deeper theme insights and guidance.
        </p>
      )}
    </div>
  );
}
