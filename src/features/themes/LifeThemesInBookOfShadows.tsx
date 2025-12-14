'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuthStatus } from '@/components/AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { computeLifeThemes, type LifeTheme } from './LifeThemesEngine';

interface LifeThemesInBookOfShadowsProps {
  className?: string;
}

export function LifeThemesInBookOfShadows({
  className = '',
}: LifeThemesInBookOfShadowsProps) {
  const { isAuthenticated } = useAuthStatus();
  const { isSubscribed } = useSubscription();
  const [primaryTheme, setPrimaryTheme] = useState<LifeTheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchTheme = async () => {
      try {
        const [journalRes, patternsRes] = await Promise.all([
          fetch('/api/journal?limit=20', { credentials: 'include' }).catch(
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

        const themes = computeLifeThemes(journalEntries, tarotPatterns, null);
        setPrimaryTheme(themes[0] || null);
      } catch (error) {
        console.error('[LifeThemes] Failed to fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheme();
  }, [isAuthenticated]);

  if (!isAuthenticated || isLoading) {
    return null;
  }

  if (!primaryTheme) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-lunary-primary-700/30 bg-gradient-to-r from-lunary-primary-950/30 to-zinc-900/50 p-4 ${className}`}
    >
      <div className='flex items-start gap-3'>
        <div className='shrink-0 w-8 h-8 rounded-full bg-lunary-primary-900/40 border border-lunary-primary-700/50 flex items-center justify-center'>
          <Sparkles className='w-4 h-4 text-lunary-primary-400' />
        </div>

        <div className='flex-1 min-w-0'>
          <p className='text-xs text-lunary-primary-300/80 mb-1'>
            You are currently moving through...
          </p>
          <h3 className='text-sm font-medium text-zinc-100 mb-1'>
            {primaryTheme.name}
          </h3>
          <p className='text-xs text-zinc-400 line-clamp-2'>
            {isSubscribed
              ? primaryTheme.longSummary.slice(0, 150) + '...'
              : primaryTheme.shortSummary}
          </p>

          {isSubscribed && (
            <Link
              href='/profile#life-themes'
              className='inline-flex items-center gap-1 mt-2 text-xs text-lunary-primary-400 hover:text-lunary-primary-300'
            >
              View all themes
              <ChevronRight className='w-3 h-3' />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

interface ThemeConnectionProps {
  themeName: string;
  className?: string;
}

export function ThemeConnection({
  themeName,
  className = '',
}: ThemeConnectionProps) {
  return (
    <div
      className={`flex items-center gap-2 text-xs text-lunary-primary-400/80 ${className}`}
    >
      <Sparkles className='w-3 h-3' />
      <span>This connects to your theme: {themeName}</span>
    </div>
  );
}
