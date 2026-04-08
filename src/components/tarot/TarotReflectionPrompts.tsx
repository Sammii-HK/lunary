'use client';

import { useState, useMemo } from 'react';
import {
  ChevronDown,
  BookOpen,
  Check,
  Loader2,
  PenTool,
  Sparkles,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import Link from 'next/link';
import { hasFeatureAccess } from '../../../utils/pricing';
import { JOURNAL_PROMPT_LIMITS } from '../../../utils/entitlements';
import type { TrendAnalysis } from '../../../utils/tarot/improvedTarot';
import { useProgress } from '@/components/progress/useProgress';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { mutate } from 'swr';
import { Collapse } from '@/components/ui/Collapse';

interface TarotReflectionPromptsProps {
  trendAnalysis: TrendAnalysis | null;
  className?: string;
}

const THEME_PROMPTS: Record<string, string[]> = {
  healing: [
    'What part of me is asking for healing right now?',
    'How have I been caring for my emotional wellbeing lately?',
    'What old wound feels ready to be released?',
    'Where do I need to be more gentle with myself?',
    'What would deep self-compassion look like today?',
  ],
  transformation: [
    'What am I being asked to let go of?',
    'What is trying to emerge in my life right now?',
    'Where am I resisting change, and why?',
    'How would I describe the person I am becoming?',
    'What feels like it is dying in order for something new to be born?',
  ],
  creativity: [
    'What creative impulse have I been ignoring?',
    'How can I express myself more authentically today?',
    'What would I create if I knew I could not fail?',
    'Where does inspiration find me most easily?',
    'What project or idea keeps calling to me?',
  ],
  action: [
    'What action have I been delaying that I know I need to take?',
    'Where do I need to be more decisive?',
    'What gives me the courage to move forward?',
    'How can I channel my energy more effectively?',
    'What first step could I take today?',
  ],
  truth: [
    'What truth have I been avoiding?',
    'Where am I not being honest with myself?',
    'What would change if I saw this situation clearly?',
    'How can I communicate more authentically?',
    'What insight is trying to break through?',
  ],
  abundance: [
    'What am I grateful for in this moment?',
    'Where do I already have enough?',
    'What beliefs about scarcity am I ready to release?',
    'How can I be more generous with myself and others?',
    'What would true abundance feel like?',
  ],
  connection: [
    'How open is my heart right now?',
    'What relationship needs more of my attention?',
    'Where am I holding back from connection?',
    'How can I deepen intimacy in my life?',
    'What do I truly need from others?',
  ],
};

const SUIT_PROMPTS: Record<string, string[]> = {
  Cups: [
    'What emotions am I experiencing most strongly?',
    'How am I honoring my intuition?',
    'What does my heart want me to know?',
    'Where do I need more emotional flow?',
    'How can I better nurture my inner world?',
  ],
  Wands: [
    'What ignites my passion right now?',
    'Where am I being called to take action?',
    'What creative project wants my attention?',
    'How can I sustain my energy for what matters?',
    'What adventure is calling to me?',
  ],
  Swords: [
    'What thoughts are dominating my mind?',
    'Where do I need more clarity?',
    'What conversation have I been avoiding?',
    'How can I think more clearly about this situation?',
    'What truth is trying to emerge?',
  ],
  Pentacles: [
    'What am I building in my life right now?',
    'How am I caring for my body and physical needs?',
    'What practical steps can I take today?',
    'Where do I feel most grounded?',
    'What resources do I have that I am not using?',
  ],
};

const DEFAULT_PROMPTS = [
  'What message from my recent readings feels most important?',
  'How can I apply the wisdom of the cards to my life today?',
  'What patterns am I noticing in my readings?',
  'What question do I want to bring to my next reading?',
  'How has tarot helped me understand myself better?',
];

export function TarotReflectionPrompts({
  trendAnalysis,
  className = '',
}: TarotReflectionPromptsProps) {
  const subscription = useSubscription();
  const hasTarotPatternsAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'tarot_patterns',
  );
  const { progress: skillProgress } = useProgress();
  const journalSkill = skillProgress.find((p) => p.skillTree === 'journal');
  const [isExpanded, setIsExpanded] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState<string | null>(null);
  const [savedPrompts, setSavedPrompts] = useState<Set<string>>(new Set());
  const [activePromptIndex, setActivePromptIndex] = useState<number | null>(
    null,
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const prompts = useMemo(() => {
    const limit = hasTarotPatternsAccess
      ? JOURNAL_PROMPT_LIMITS.lunary_plus
      : JOURNAL_PROMPT_LIMITS.free;

    if (!trendAnalysis) return DEFAULT_PROMPTS.slice(0, limit);

    const topTheme = trendAnalysis.dominantThemes[0]?.toLowerCase();
    const topSuit = trendAnalysis.suitPatterns[0];

    let selectedPrompts: string[] = [];

    if (topTheme && THEME_PROMPTS[topTheme]) {
      selectedPrompts = [...THEME_PROMPTS[topTheme]];
    } else if (topSuit && SUIT_PROMPTS[topSuit.suit]) {
      selectedPrompts = [...SUIT_PROMPTS[topSuit.suit]];
    } else {
      selectedPrompts = [...DEFAULT_PROMPTS];
    }

    return selectedPrompts.slice(0, limit);
  }, [trendAnalysis, hasTarotPatternsAccess]);

  const handleSaveToJournal = async (prompt: string, reflection: string) => {
    if (!reflection.trim()) return;
    setSavingPrompt(prompt);

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: `Reflection prompt: ${prompt}\n\n${reflection.trim()}`,
          moodTags: ['reflection'],
          cardReferences: [],
          source: 'tarot-prompt',
        }),
      });

      if (response.ok) {
        setSavedPrompts((prev) => new Set([...prev, prompt]));
        setActivePromptIndex(null);
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[prompt];
          return next;
        });
        mutate('/api/progress');
      }
    } catch (error) {
      console.error('[TarotReflectionPrompts] Failed to save:', error);
    } finally {
      setSavingPrompt(null);
    }
  };

  return (
    <div
      className={`rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between p-4 text-left hover:bg-surface-card/30 transition-colors'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-layer-base/30'>
            <BookOpen className='w-4 h-4 text-lunary-accent-400' />
          </div>
          <div>
            <p className='text-sm font-medium text-content-primary'>
              Reflection Prompts
            </p>
            <p className='text-xs text-content-muted'>
              {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'} for
              your journal
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {journalSkill && (
            <div className='flex items-center gap-1.5 text-[10px] text-content-muted'>
              <PenTool className='w-3 h-3 text-lunary-accent' />
              <span>Lv. {journalSkill.currentLevel}</span>
            </div>
          )}
          <ChevronDown
            className={`w-4 h-4 text-content-muted transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      <Collapse isOpen={isExpanded}>
        <div className='px-4 pb-4 space-y-3'>
          {prompts.map((prompt, i) => {
            const isSaved = savedPrompts.has(prompt);
            const isSaving = savingPrompt === prompt;

            return (
              <div
                key={i}
                className='p-3 rounded-lg border border-stroke-subtle/50 bg-surface-card/20'
              >
                <p className='text-sm text-content-secondary mb-2'>{prompt}</p>
                <div className='space-y-2'>
                  {activePromptIndex === i && !isSaved ? (
                    <>
                      <textarea
                        value={drafts[prompt] ?? ''}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [prompt]: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder='Write your reflection...'
                        className='w-full bg-surface-elevated/60 border border-stroke-default/60 rounded-md p-2 text-xs text-content-primary placeholder-zinc-500 focus:outline-none focus:border-lunary-primary-700 resize-none'
                        disabled={isSaving}
                      />
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() =>
                            handleSaveToJournal(prompt, drafts[prompt] ?? '')
                          }
                          disabled={!drafts[prompt]?.trim() || isSaving}
                          className='inline-flex items-center gap-1.5 text-xs font-medium text-content-brand-accent hover:text-content-brand-accent transition-colors disabled:opacity-50'
                        >
                          {isSaving ? (
                            <Loader2 className='w-3 h-3 animate-spin' />
                          ) : (
                            <BookOpen className='w-3 h-3' />
                          )}
                          Save reflection
                        </button>
                        <button
                          onClick={() => setActivePromptIndex(null)}
                          disabled={isSaving}
                          className='text-xs text-content-muted hover:text-content-secondary transition-colors'
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => setActivePromptIndex(i)}
                      disabled={isSaved || isSaving}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        isSaved
                          ? 'text-lunary-success-400'
                          : 'text-lunary-accent-400 hover:text-content-brand-accent'
                      }`}
                    >
                      {isSaving ? (
                        <Loader2 className='w-3 h-3 animate-spin' />
                      ) : isSaved ? (
                        <Check className='w-3 h-3' />
                      ) : (
                        <BookOpen className='w-3 h-3' />
                      )}
                      {isSaved ? 'Saved' : 'Write reflection'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!hasTarotPatternsAccess && (
            <Link
              href='/pricing?nav=app'
              className='flex items-center gap-2 rounded-lg border border-lunary-primary-800/40 bg-layer-deep/30 px-3 py-2.5 hover:bg-layer-deep/50 transition-colors group'
            >
              <Sparkles className='w-3.5 h-3.5 text-lunary-primary-400 flex-shrink-0' />
              <p className='text-xs text-content-muted'>
                Get{' '}
                <span className='text-content-brand font-medium group-hover:text-content-secondary'>
                  {JOURNAL_PROMPT_LIMITS.lunary_plus -
                    JOURNAL_PROMPT_LIMITS.free}{' '}
                  more prompts
                </span>{' '}
                and unlimited Book of Shadows entries with Lunary+
              </p>
            </Link>
          )}

          {journalSkill && (
            <div className='pt-2 border-t border-stroke-subtle/40'>
              <div className='flex items-center justify-between mb-1'>
                <span className='text-[10px] text-content-muted flex items-center gap-1'>
                  <PenTool className='w-3 h-3' />
                  Journal Keeper
                </span>
                <span className='text-[10px] text-content-muted'>
                  {journalSkill.actionsToNext !== null
                    ? `${journalSkill.actionsToNext} more to level ${journalSkill.currentLevel + 1}`
                    : 'Max level'}
                </span>
              </div>
              <ProgressBar
                progress={journalSkill.progressToNext}
                level={journalSkill.currentLevel}
                size='sm'
                showLabel={false}
              />
            </div>
          )}
        </div>
      </Collapse>
    </div>
  );
}
