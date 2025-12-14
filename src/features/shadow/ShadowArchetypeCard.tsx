'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Sun, Moon } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuthStatus } from '@/components/AuthStatus';
import {
  detectPrimaryArchetype,
  type LunaryArchetype,
} from './ShadowArchetypeDetector';

interface ShadowArchetypeCardProps {
  className?: string;
}

export function ShadowArchetypeCard({
  className = '',
}: ShadowArchetypeCardProps) {
  const { isAuthenticated } = useAuthStatus();
  const { isSubscribed } = useSubscription();
  const [archetype, setArchetype] = useState<LunaryArchetype | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
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

        const journalMoods: string[] = [];
        const journalThemes: string[] = [];
        const cardReferences: string[] = [];

        journalEntries.forEach(
          (entry: {
            moodTags?: string[];
            cardReferences?: string[];
            content?: string;
          }) => {
            if (entry.moodTags) journalMoods.push(...entry.moodTags);
            if (entry.cardReferences)
              cardReferences.push(...entry.cardReferences);
          },
        );

        patterns.forEach((p: { type: string; data?: { theme?: string } }) => {
          if (p.type === 'theme' && p.data?.theme) {
            journalThemes.push(p.data.theme);
          }
        });

        const detected = detectPrimaryArchetype({
          journalMoods,
          journalThemes,
          tarotCards: cardReferences,
          lifeThemes: journalThemes,
        });

        setArchetype(detected);
      } catch (error) {
        console.error('[ShadowArchetypeCard] Failed to detect:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (!isAuthenticated || isLoading) {
    return null;
  }

  if (!archetype) {
    return (
      <div
        className={`rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 ${className}`}
      >
        <div className='flex items-center gap-2 mb-2'>
          <Sparkles className='w-4 h-4 text-lunary-primary-400' />
          <h3 className='text-sm font-medium text-zinc-100'>Your Archetype</h3>
        </div>
        <p className='text-xs text-zinc-400'>
          As you use Lunary, we will reveal the archetype emerging in your
          patterns.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-lunary-primary-700/30 bg-gradient-to-br from-lunary-primary-950/20 to-zinc-900/60 overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-start justify-between p-4 text-left'
      >
        <div className='flex items-start gap-3'>
          <div className='shrink-0 w-10 h-10 rounded-full bg-lunary-primary-900/40 border border-lunary-primary-700/50 flex items-center justify-center'>
            <Sparkles className='w-5 h-5 text-lunary-primary-400' />
          </div>
          <div>
            <p className='text-xs text-lunary-primary-300/80 mb-1'>
              Your Primary Archetype
            </p>
            <h3 className='text-base font-medium text-zinc-100'>
              {archetype.name}
            </h3>
            <p className='text-xs text-zinc-400 mt-1 line-clamp-2'>
              {archetype.shortSummary}
            </p>
          </div>
        </div>
        <div className='shrink-0 ml-2 mt-1'>
          {isExpanded ? (
            <ChevronUp className='w-5 h-5 text-zinc-500' />
          ) : (
            <ChevronDown className='w-5 h-5 text-zinc-500' />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className='px-4 pb-4 pt-0 border-t border-zinc-800/50 space-y-4'>
          {isSubscribed ? (
            <>
              <div className='mt-4'>
                <p className='text-sm text-zinc-300 leading-relaxed whitespace-pre-line'>
                  {archetype.longSummary}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='p-3 rounded-lg bg-emerald-900/10 border border-emerald-700/20'>
                  <p className='text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1'>
                    <Sun className='w-3 h-3' />
                    Light Traits
                  </p>
                  <ul className='space-y-1'>
                    {archetype.lightTraits.slice(0, 3).map((trait, i) => (
                      <li key={i} className='text-xs text-zinc-400'>
                        • {trait}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30'>
                  <p className='text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1'>
                    <Moon className='w-3 h-3' />
                    Shadow Traits
                  </p>
                  <ul className='space-y-1'>
                    {archetype.shadowTraits.slice(0, 3).map((trait, i) => (
                      <li key={i} className='text-xs text-zinc-500'>
                        • {trait}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {archetype.suggestedWork.length > 0 && (
                <div className='p-3 rounded-lg bg-lunary-primary-950/20 border border-lunary-primary-800/30'>
                  <p className='text-xs font-medium text-lunary-primary-300/80 mb-2'>
                    Suggested Work
                  </p>
                  <ul className='space-y-1.5'>
                    {archetype.suggestedWork.slice(0, 4).map((work, i) => (
                      <li
                        key={i}
                        className='text-xs text-zinc-300 flex items-start gap-2'
                      >
                        <span className='text-lunary-primary-400'>•</span>
                        {work}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className='mt-4'>
              <p className='text-xs text-zinc-400 mb-3'>
                {archetype.shortSummary}
              </p>
              <p className='text-xs text-zinc-400'>
                <a
                  href='/pricing'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  Upgrade to Lunary+
                </a>{' '}
                for the full archetype narrative with light and shadow traits,
                plus guided integration work.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ArchetypeCompactBadgeProps {
  archetype: LunaryArchetype;
  className?: string;
}

export function ArchetypeCompactBadge({
  archetype,
  className = '',
}: ArchetypeCompactBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lunary-primary-950/30 border border-lunary-primary-700/30 ${className}`}
    >
      <Sparkles className='w-3 h-3 text-lunary-primary-400' />
      <span className='text-xs text-lunary-primary-300'>{archetype.name}</span>
    </div>
  );
}
