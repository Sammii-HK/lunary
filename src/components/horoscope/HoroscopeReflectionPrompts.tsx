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
import { useProgress } from '@/components/progress/useProgress';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { mutate } from 'swr';

interface HoroscopeReflectionPromptsProps {
  sunSign?: string | null;
  moonPhase?: string | null;
  className?: string;
}

const SIGN_PROMPTS: Record<string, string[]> = {
  aries: [
    'Where am I being called to take bold action today?',
    'What fear is holding me back from stepping into my power?',
    'How can I channel my fire energy without burning out?',
    'What new beginning is trying to emerge in my life?',
    'Where do I need more courage right now?',
  ],
  taurus: [
    'What am I building that brings me lasting security?',
    'Where can I slow down and trust the process?',
    'What simple pleasure have I been neglecting?',
    'How is my body asking me to care for it today?',
    'What am I ready to release that no longer serves my growth?',
  ],
  gemini: [
    'What conversation have I been avoiding that needs to happen?',
    'How can I better integrate my many interests?',
    'What is my curious mind drawn to right now?',
    'Where do I need to listen more than I speak?',
    'What ideas are ready to be shared with the world?',
  ],
  cancer: [
    'What does my inner sanctuary need from me today?',
    'Where am I holding on too tightly out of fear?',
    'How can I nurture myself the way I nurture others?',
    'What emotions are asking for my attention?',
    'What would it look like to feel truly safe right now?',
  ],
  leo: [
    'Where am I dimming my light to make others comfortable?',
    'What creative expression wants to flow through me today?',
    'How can I lead with my heart instead of my ego?',
    'What brings me genuine joy, not just external validation?',
    'Where can I be more generous with my warmth?',
  ],
  virgo: [
    'What small improvement would have the biggest impact today?',
    'Where am I being too critical of myself or others?',
    'How can I be of service without depleting myself?',
    'What system in my life needs attention or refinement?',
    'Where can I trust imperfection as part of the process?',
  ],
  libra: [
    'Where do I need to find better balance in my life?',
    'What relationship dynamic needs my honest attention?',
    'How can I make a decision from my own centre today?',
    'What beauty am I creating or noticing around me?',
    'Where am I sacrificing my needs for false harmony?',
  ],
  scorpio: [
    'What truth is hiding beneath the surface right now?',
    'Where am I resisting transformation?',
    'What am I ready to release from my emotional depths?',
    'How can I channel my intensity into healing?',
    'What power am I reclaiming today?',
  ],
  sagittarius: [
    'What belief system am I ready to outgrow?',
    'Where is my sense of adventure leading me?',
    'How can I expand my perspective on a current challenge?',
    'What wisdom have I gained that I can share?',
    'Where do I need more freedom in my life?',
  ],
  capricorn: [
    'What long-term goal deserves my focus today?',
    'Where am I confusing productivity with self-worth?',
    'How can I build something meaningful one step at a time?',
    'What responsibility can I set down for a moment?',
    'Where do I need to be more patient with my progress?',
  ],
  aquarius: [
    'What innovative idea am I sitting on?',
    'How can I contribute to my community today?',
    'Where am I being contrarian versus genuinely visionary?',
    'What connection between people needs my attention?',
    'How can I honour my uniqueness without isolating myself?',
  ],
  pisces: [
    'What is my intuition whispering to me today?',
    'Where do I need stronger boundaries to protect my energy?',
    'How can I ground my dreams into reality?',
    'What creative or spiritual practice is calling to me?',
    'Where am I absorbing emotions that are not mine?',
  ],
};

const MOON_PHASE_PROMPTS: Record<string, string[]> = {
  new: [
    'What intention am I planting during this new moon?',
    'What old pattern am I ready to release to make space for the new?',
    'How does this moment of darkness feel — scary or restful?',
  ],
  waxing: [
    'What am I actively growing and nurturing right now?',
    'Where do I need to put in more effort to reach my goals?',
    'What momentum am I building?',
  ],
  full: [
    'What is being illuminated in my life during this full moon?',
    'What have I manifested that I can celebrate?',
    'What emotions are being amplified right now?',
  ],
  waning: [
    'What am I ready to let go of as the moon wanes?',
    'How can I rest and restore before the next cycle?',
    'What lesson from this lunar cycle do I want to carry forward?',
  ],
};

const DEFAULT_PROMPTS = [
  'What cosmic energy do I most need to work with today?',
  'How can I align my daily actions with the current sky?',
  'What celestial message feels most personal to me right now?',
  'Where do I feel most in sync with the universe today?',
  'What area of my life is the cosmos asking me to pay attention to?',
];

export function HoroscopeReflectionPrompts({
  sunSign,
  moonPhase,
  className = '',
}: HoroscopeReflectionPromptsProps) {
  const subscription = useSubscription();
  const hasAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personalized_horoscope',
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
    let selectedPrompts: string[] = [];

    // Try sign-based prompts first
    if (sunSign) {
      const signKey = sunSign.toLowerCase();
      if (SIGN_PROMPTS[signKey]) {
        selectedPrompts = [...SIGN_PROMPTS[signKey]];
      }
    }

    // Mix in moon phase prompts if available
    if (moonPhase) {
      const phaseKey = moonPhase.toLowerCase().includes('new')
        ? 'new'
        : moonPhase.toLowerCase().includes('full')
          ? 'full'
          : moonPhase.toLowerCase().includes('waning')
            ? 'waning'
            : 'waxing';
      const phasePrompts = MOON_PHASE_PROMPTS[phaseKey] || [];
      if (selectedPrompts.length === 0) {
        selectedPrompts = phasePrompts;
      } else {
        // Interleave: 3 sign + 2 phase
        selectedPrompts = [
          ...selectedPrompts.slice(0, 3),
          ...phasePrompts.slice(0, 2),
        ];
      }
    }

    if (selectedPrompts.length === 0) {
      selectedPrompts = [...DEFAULT_PROMPTS];
    }

    const limit = hasAccess
      ? JOURNAL_PROMPT_LIMITS.lunary_plus
      : JOURNAL_PROMPT_LIMITS.free;
    return selectedPrompts.slice(0, limit);
  }, [sunSign, moonPhase, hasAccess]);

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
          source: 'horoscope-prompt',
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
      console.error('[HoroscopeReflectionPrompts] Failed to save:', error);
    } finally {
      setSavingPrompt(null);
    }
  };

  return (
    <div
      className={`rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/30 transition-colors'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-lunary-primary-900/30'>
            <BookOpen className='w-4 h-4 text-lunary-primary-400' />
          </div>
          <div>
            <p className='text-sm font-medium text-zinc-100'>
              Cosmic Reflection Prompts
            </p>
            <p className='text-xs text-zinc-400'>
              {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'} for
              your journal
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {journalSkill && (
            <div className='flex items-center gap-1.5 text-[10px] text-zinc-500'>
              <PenTool className='w-3 h-3 text-lunary-accent' />
              <span>Lv. {journalSkill.currentLevel}</span>
            </div>
          )}
          <ChevronDown
            className={`w-4 h-4 text-zinc-500 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className='px-4 pb-4 space-y-3'>
          {prompts.map((prompt, i) => {
            const isSaved = savedPrompts.has(prompt);
            const isSaving = savingPrompt === prompt;

            return (
              <div
                key={i}
                className='p-3 rounded-lg border border-zinc-800/50 bg-zinc-800/20'
              >
                <p className='text-sm text-zinc-300 mb-2'>{prompt}</p>
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
                        className='w-full bg-zinc-900/60 border border-zinc-700/60 rounded-md p-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-lunary-primary-700 resize-none'
                        disabled={isSaving}
                      />
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() =>
                            handleSaveToJournal(prompt, drafts[prompt] ?? '')
                          }
                          disabled={!drafts[prompt]?.trim() || isSaving}
                          className='inline-flex items-center gap-1.5 text-xs font-medium text-lunary-accent-300 hover:text-lunary-accent-200 transition-colors disabled:opacity-50'
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
                          className='text-xs text-zinc-500 hover:text-zinc-300 transition-colors'
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
                          : 'text-lunary-accent-400 hover:text-lunary-accent-300'
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

          {!hasAccess && (
            <Link
              href='/pricing?nav=app'
              className='flex items-center gap-2 rounded-lg border border-lunary-primary-800/40 bg-lunary-primary-950/30 px-3 py-2.5 hover:bg-lunary-primary-950/50 transition-colors group'
            >
              <Sparkles className='w-3.5 h-3.5 text-lunary-primary-400 flex-shrink-0' />
              <p className='text-xs text-zinc-400'>
                Get{' '}
                <span className='text-lunary-primary-300 font-medium group-hover:text-lunary-primary-200'>
                  {JOURNAL_PROMPT_LIMITS.lunary_plus -
                    JOURNAL_PROMPT_LIMITS.free}{' '}
                  more prompts
                </span>{' '}
                and unlimited Book of Shadows entries with Lunary+
              </p>
            </Link>
          )}

          {journalSkill && (
            <div className='pt-2 border-t border-zinc-800/40'>
              <div className='flex items-center justify-between mb-1'>
                <span className='text-[10px] text-zinc-500 flex items-center gap-1'>
                  <PenTool className='w-3 h-3' />
                  Journal Keeper
                </span>
                <span className='text-[10px] text-zinc-500'>
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
      )}
    </div>
  );
}
