'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuthStatus } from '@/components/AuthStatus';
import { computeLifeThemes, type LifeTheme } from './LifeThemesEngine';

interface LifeThemesOverviewProps {
  className?: string;
  maxThemes?: number;
}

export function LifeThemesOverview({
  className = '',
  maxThemes = 3,
}: LifeThemesOverviewProps) {
  const { isAuthenticated } = useAuthStatus();
  const { isSubscribed } = useSubscription();
  const [themes, setThemes] = useState<LifeTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  const fetchThemes = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const [journalRes, patternsRes] = await Promise.all([
        fetch('/api/journal?limit=30', { credentials: 'include' }).catch(
          () => null,
        ),
        fetch('/api/journal/patterns', { credentials: 'include' }).catch(
          () => null,
        ),
      ]);

      const journalEntries = journalRes?.ok
        ? (await journalRes.json()).entries || []
        : [];

      const patterns = patternsRes?.ok
        ? (await patternsRes.json()).patterns || []
        : [];

      const tarotPatterns = {
        dominantThemes: patterns
          .filter((p: { type: string }) => p.type === 'theme')
          .map((p: { data?: { theme?: string } }) => p.data?.theme || ''),
      };

      const computedThemes = computeLifeThemes(
        journalEntries,
        tarotPatterns,
        null,
      );
      setThemes(computedThemes);
    } catch (error) {
      console.error('[LifeThemes] Failed to compute themes:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const handleRefresh = () => {
    const now = Date.now();
    if (now - lastRefresh < 30000) {
      return;
    }
    setLastRefresh(now);
    setIsRefreshing(true);
    fetchThemes();
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        className={`rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 ${className}`}
      >
        <div className='flex items-center gap-3 mb-3'>
          <div className='w-6 h-6 rounded-full bg-zinc-800 animate-pulse' />
          <div className='h-5 w-32 bg-zinc-800 rounded animate-pulse' />
        </div>
        <div className='space-y-2'>
          <div className='h-4 bg-zinc-800 rounded w-3/4 animate-pulse' />
          <div className='h-4 bg-zinc-800 rounded w-1/2 animate-pulse' />
        </div>
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <div
        className={`rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 ${className}`}
      >
        <div className='flex items-center gap-2 mb-2'>
          <Sparkles className='w-4 h-4 text-lunary-primary-400' />
          <h3 className='text-sm font-medium text-zinc-100'>Life Themes</h3>
        </div>
        <p className='text-xs text-zinc-400'>
          Once you have used Lunary for a while, we will reveal the themes
          emerging in your journey.
        </p>
      </div>
    );
  }

  const displayThemes = isSubscribed
    ? themes.slice(0, maxThemes)
    : themes.slice(0, 1);

  return (
    <div
      className={`rounded-xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/60 to-lunary-primary-950/10 p-4 ${className}`}
    >
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <Sparkles className='w-4 h-4 text-lunary-primary-400' />
          <h3 className='text-sm font-medium text-zinc-100'>
            Your Life Themes
          </h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className='p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors disabled:opacity-50'
          title='Refresh themes'
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <div className='space-y-3'>
        {displayThemes.map((theme) => (
          <div
            key={theme.id}
            className='border border-zinc-800/50 rounded-lg bg-zinc-900/40 overflow-hidden'
          >
            <button
              onClick={() =>
                setExpandedTheme(expandedTheme === theme.id ? null : theme.id)
              }
              className='w-full flex items-start justify-between p-3 text-left'
            >
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='text-sm font-medium text-zinc-100'>
                    {theme.name}
                  </span>
                  <div
                    className='h-1.5 w-12 rounded-full bg-zinc-800'
                    title={`Confidence: ${Math.round(theme.confidence * 100)}%`}
                  >
                    <div
                      className='h-full rounded-full bg-lunary-primary-500'
                      style={{ width: `${theme.confidence * 100}%` }}
                    />
                  </div>
                </div>
                <p className='text-xs text-zinc-400 line-clamp-2'>
                  {theme.shortSummary}
                </p>
              </div>
              <div className='shrink-0 ml-2 mt-1'>
                {expandedTheme === theme.id ? (
                  <ChevronUp className='w-4 h-4 text-zinc-500' />
                ) : (
                  <ChevronDown className='w-4 h-4 text-zinc-500' />
                )}
              </div>
            </button>

            {expandedTheme === theme.id && isSubscribed && (
              <div className='px-3 pb-3 pt-0 border-t border-zinc-800/50'>
                <p className='text-xs text-zinc-300 leading-relaxed mt-3 mb-3'>
                  {theme.longSummary}
                </p>
                {theme.guidanceBullets && theme.guidanceBullets.length > 0 && (
                  <div className='mt-2'>
                    <p className='text-xs font-medium text-zinc-400 mb-2'>
                      Guidance:
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
                  <div className='flex flex-wrap gap-1 mt-3'>
                    {theme.relatedTags.map((tag) => (
                      <span
                        key={tag}
                        className='text-[10px] px-2 py-0.5 rounded-full bg-lunary-primary-900/30 text-lunary-primary-300 border border-lunary-primary-700/30'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!isSubscribed && themes.length > 1 && (
        <div className='mt-3 pt-3 border-t border-zinc-800/50'>
          <p className='text-xs text-zinc-400'>
            <a
              href='/pricing?nav=app'
              className='text-lunary-primary-400 hover:text-lunary-primary-300'
            >
              Upgrade to Lunary+
            </a>{' '}
            to see all {themes.length} life themes with guidance.
          </p>
        </div>
      )}
    </div>
  );
}
