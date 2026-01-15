'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import {
  detectPrimaryArchetype,
  hasEnoughDataForArchetypes,
  ArchetypeDetectorInput,
  ArchetypeResult,
} from '@/lib/archetypes/detector';

interface ArchetypeBarProps {
  className?: string;
}

export function ArchetypeBar({ className = '' }: ArchetypeBarProps) {
  const subscription = useSubscription();
  const hasCosmicProfileAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'cosmic_profile',
  );

  const [archetype, setArchetype] = useState<ArchetypeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function loadArchetype() {
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

        const input: ArchetypeDetectorInput = {
          journalEntries: (journalData.entries || []).map((e: any) => ({
            content: e.content || '',
            moodTags: e.moodTags || [],
          })),
          dreamTags,
          tarotMajors:
            patternsData?.frequentCards
              ?.filter((c: any) => isMajorArcana(c.name))
              ?.map((c: any) => c.name) || [],
          tarotSuits: patternsData?.suitDistribution || [],
        };

        if (hasEnoughDataForArchetypes(input)) {
          const detected = detectPrimaryArchetype(input);
          setArchetype(detected);
        }
      } catch (error) {
        console.error('[ArchetypeBar] Failed to load archetype:', error);
      } finally {
        setLoading(false);
      }
    }

    loadArchetype();
  }, []);

  if (loading || !archetype) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between p-3 text-left hover:bg-zinc-800/30 transition-colors'
      >
        <div className='flex items-center gap-2'>
          <Sparkles className='w-4 h-4 text-lunary-secondary-400' />
          <div>
            <span className='text-sm text-zinc-300'>Pattern detected: </span>
            <span className='text-sm font-medium text-lunary-secondary-300'>
              {archetype.name}
            </span>
          </div>
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
            {hasCosmicProfileAccess
              ? archetype.premiumNarrative.split('\n\n')[0]
              : archetype.freeSummary}
          </p>

          {hasCosmicProfileAccess && archetype.suggestedWork.length > 0 && (
            <div className='space-y-1.5'>
              <p className='text-xs font-medium text-zinc-400 uppercase tracking-wide'>
                Suggested practices
              </p>
              <ul className='space-y-1'>
                {archetype.suggestedWork.slice(0, 3).map((work, i) => (
                  <li
                    key={i}
                    className='text-xs text-zinc-400 flex items-start gap-2'
                  >
                    <span className='text-lunary-secondary-400 mt-0.5'>•</span>
                    {work}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!hasCosmicProfileAccess && (
            <p className='text-xs text-zinc-500'>
              Upgrade for deeper archetype insights and practices.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function isMajorArcana(cardName: string): boolean {
  const majors = [
    'The Fool',
    'The Magician',
    'The High Priestess',
    'The Empress',
    'The Emperor',
    'The Hierophant',
    'The Lovers',
    'The Chariot',
    'Strength',
    'The Hermit',
    'Wheel of Fortune',
    'Justice',
    'The Hanged Man',
    'Death',
    'Temperance',
    'The Devil',
    'The Tower',
    'The Star',
    'The Moon',
    'The Sun',
    'Judgement',
    'The World',
  ];
  return majors.includes(cardName);
}
