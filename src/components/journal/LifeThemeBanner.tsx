'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import {
  analyzeLifeThemes,
  hasEnoughDataForThemes,
  LifeThemeInput,
  LifeThemeResult,
} from '@/lib/life-themes/engine';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/modal';

interface LifeThemeBannerProps {
  className?: string;
}

export function LifeThemeBanner({ className = '' }: LifeThemeBannerProps) {
  const subscription = useSubscription();
  const isPremium = hasBirthChartAccess(subscription.status, subscription.plan);

  const [primaryTheme, setPrimaryTheme] = useState<LifeThemeResult | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const [journalRes, patternsRes] = await Promise.all([
          fetch('/api/journal?limit=30', { credentials: 'include' }).catch(
            () => null,
          ),
          fetch('/api/patterns?days=30', { credentials: 'include' }).catch(
            () => null,
          ),
        ]);

        const journalData = journalRes?.ok
          ? await journalRes.json()
          : { entries: [] };
        const patternsData = patternsRes?.ok ? await patternsRes.json() : null;

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
        };

        if (hasEnoughDataForThemes(input)) {
          const themes = analyzeLifeThemes(input, 1);
          if (themes.length > 0) {
            setPrimaryTheme(themes[0]);
          }
        }
      } catch (error) {
        console.error('[LifeThemeBanner] Failed to load theme:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTheme();
  }, []);

  if (loading || !primaryTheme) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`w-full text-left rounded-lg border border-lunary-primary-800/50 bg-gradient-to-r from-lunary-primary-950/40 to-transparent p-3 hover:border-lunary-primary-700/50 transition-colors ${className}`}
      >
        <div className='flex items-center gap-2'>
          <Sparkles className='w-4 h-4 text-lunary-primary-400 flex-shrink-0' />
          <p className='text-sm text-zinc-300'>
            You're currently moving through:{' '}
            <span className='text-lunary-primary-300 font-medium'>
              {primaryTheme.name}
            </span>
          </p>
        </div>
      </button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size='md'>
        <ModalHeader>
          <div className='flex items-center gap-2'>
            <Sparkles className='w-5 h-5 text-lunary-primary-400' />
            <span>{primaryTheme.name}</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className='space-y-4'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              {isPremium ? primaryTheme.longSummary : primaryTheme.shortSummary}
            </p>

            {isPremium && primaryTheme.guidanceBullets.length > 0 && (
              <div className='space-y-2'>
                <p className='text-xs font-medium text-zinc-400 uppercase tracking-wide'>
                  Guidance for this theme
                </p>
                <ul className='space-y-2'>
                  {primaryTheme.guidanceBullets.map((bullet, i) => (
                    <li
                      key={i}
                      className='text-sm text-zinc-300 flex items-start gap-2'
                    >
                      <span className='text-lunary-primary-400 mt-0.5'>•</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {primaryTheme.relatedTags.length > 0 && (
              <div className='flex flex-wrap gap-2 pt-2'>
                {primaryTheme.relatedTags.map((tag) => (
                  <span
                    key={tag}
                    className='text-xs px-2 py-1 rounded bg-lunary-primary-900/30 text-lunary-primary-300'
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {!isPremium && (
              <p className='text-xs text-zinc-500 pt-2 border-t border-zinc-800'>
                Upgrade to unlock deeper insights and personalized guidance for
                your themes.
              </p>
            )}
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
