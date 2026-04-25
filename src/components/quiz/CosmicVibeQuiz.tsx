'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  RefreshCw,
  Save,
  Share2,
  Sparkles,
} from 'lucide-react';
import { AudioNarrator } from '@/components/audio/AudioNarrator';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  COSMIC_VIBE_QUESTIONS,
  computeCosmicVibe,
  type CosmicVibe,
  type CosmicVibeAnswers,
  type CosmicVibeQuestionId,
} from '@/lib/quiz/cosmic-vibe';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const TOTAL_QUESTIONS = COSMIC_VIBE_QUESTIONS.length;

function buildOgUrl(vibe: CosmicVibe): string {
  const params = new URLSearchParams({
    vibeName: vibe.vibeName,
    element: vibe.element,
    archetype: vibe.archetype,
    oneLiner: vibe.oneLiner,
  });
  return `/api/og/cosmic-vibe?${params.toString()}`;
}

export function CosmicVibeQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<CosmicVibeAnswers>({});
  const [vibe, setVibe] = useState<CosmicVibe | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [shareNote, setShareNote] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // On mount, hydrate any previously saved vibe so returning users
  // see their card straight away (without overwriting fresh attempts).
  useEffect(() => {
    let cancelled = false;
    fetch('/api/quiz/cosmic-vibe', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.vibe && data?.answers) {
          setAnswers(data.answers as CosmicVibeAnswers);
          setVibe(data.vibe as CosmicVibe);
        }
      })
      .catch(() => {
        /* offline or unauthenticated — silently ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentQuestion = COSMIC_VIBE_QUESTIONS[step];
  const progress = useMemo(
    () => Math.round(((step + (vibe ? 1 : 0)) / TOTAL_QUESTIONS) * 100),
    [step, vibe],
  );

  const finalize = useCallback((next: CosmicVibeAnswers) => {
    const computed = computeCosmicVibe(next);
    setVibe(computed);
    setSaveState('idle');
  }, []);

  const handleSelect = (questionId: CosmicVibeQuestionId, optionId: string) => {
    const next: CosmicVibeAnswers = { ...answers, [questionId]: optionId };
    setAnswers(next);
    if (step < TOTAL_QUESTIONS - 1) {
      // Small delay so the user sees their selection register before
      // the next question slides in.
      window.setTimeout(() => setStep((s) => s + 1), 220);
    } else {
      window.setTimeout(() => finalize(next), 220);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const handleRetake = () => {
    setVibe(null);
    setAnswers({});
    setSaveState('idle');
    setShareNote(null);
    setStep(0);
  };

  const handleSave = async () => {
    if (!vibe) return;
    setSaveState('saving');
    try {
      const res = await fetch('/api/quiz/cosmic-vibe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, vibe }),
      });
      if (!res.ok) throw new Error('save failed');
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const handleShare = async () => {
    if (!vibe) return;
    const ogUrl = buildOgUrl(vibe);
    const fullOgUrl =
      typeof window === 'undefined'
        ? ogUrl
        : new URL(ogUrl, window.location.origin).toString();
    const shareData: ShareData = {
      title: `I'm ${vibe.vibeName} on Lunary`,
      text: `${vibe.oneLiner} — find your cosmic vibe at lunary.app`,
      url: fullOgUrl,
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
        setShareNote('Shared');
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(fullOgUrl);
        setShareNote('Link copied');
        return;
      }
      setShareNote('Sharing not supported on this device');
    } catch {
      // user cancelled / blocked — silently no-op
    }
  };

  // Keep focus + scroll near the active card when it changes.
  useEffect(() => {
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [step, vibe]);

  return (
    <section className='flex flex-col gap-6'>
      {/* Inline keyframes — co-located so we don't need a new stylesheet */}
      <style>{`
        @keyframes cosmic-vibe-question-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cosmic-vibe-result-in {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Progress bar */}
      <div
        className='h-1 w-full overflow-hidden rounded-full bg-surface-overlay'
        role='progressbar'
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className='h-full bg-gradient-to-r from-lunary-primary via-lunary-accent to-lunary-rose transition-[width] duration-500 ease-out'
          style={{ width: `${vibe ? 100 : progress}%` }}
        />
      </div>

      <div ref={stageRef} className='relative min-h-[420px]'>
        {!vibe && currentQuestion ? (
          <QuestionCard
            stepIndex={step}
            total={TOTAL_QUESTIONS}
            question={currentQuestion}
            selected={answers[currentQuestion.id]}
            onSelect={(optionId) => handleSelect(currentQuestion.id, optionId)}
            onBack={step > 0 ? handleBack : undefined}
          />
        ) : null}

        {vibe ? (
          <VibeResultCard
            vibe={vibe}
            saveState={saveState}
            shareNote={shareNote}
            onSave={handleSave}
            onShare={handleShare}
            onRetake={handleRetake}
          />
        ) : null}
      </div>
    </section>
  );
}

interface QuestionCardProps {
  stepIndex: number;
  total: number;
  question: (typeof COSMIC_VIBE_QUESTIONS)[number];
  selected: string | undefined;
  onSelect: (optionId: string) => void;
  onBack?: () => void;
}

function QuestionCard({
  stepIndex,
  total,
  question,
  selected,
  onSelect,
  onBack,
}: QuestionCardProps) {
  return (
    <div
      key={question.id}
      style={{
        animation: 'cosmic-vibe-question-in 500ms ease-out both',
      }}
      className='flex flex-col gap-6 rounded-3xl border border-lunary-primary-700/40 bg-surface-overlay/60 p-6 shadow-[0_0_60px_rgba(132,88,216,0.15)] backdrop-blur sm:p-8'
    >
      <div className='flex items-center justify-between text-xs uppercase tracking-[0.3em] text-content-muted'>
        <span>
          Question {stepIndex + 1} of {total}
        </span>
        <span className='inline-flex items-center gap-1 text-lunary-accent'>
          <Sparkles className='size-3' aria-hidden /> mood read
        </span>
      </div>

      <Heading as='h2' variant='h2' className='text-content-primary'>
        {question.prompt}
      </Heading>

      <ul className='flex flex-col gap-3'>
        {question.options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <li key={option.id}>
              <button
                type='button'
                onClick={() => onSelect(option.id)}
                className={cn(
                  'group flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm sm:text-base transition-all',
                  'border-lunary-primary-700/40 bg-layer-raised/60 text-content-secondary',
                  'hover:border-lunary-accent/60 hover:bg-layer-raised hover:text-content-primary hover:shadow-[0_0_24px_rgba(132,88,216,0.25)]',
                  isSelected &&
                    'border-lunary-accent bg-lunary-accent-800/30 text-content-primary shadow-[0_0_30px_rgba(132,88,216,0.35)]',
                )}
              >
                <span>{option.label}</span>
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                    isSelected
                      ? 'border-lunary-accent bg-lunary-accent text-white'
                      : 'border-lunary-primary-700/60 text-transparent group-hover:border-lunary-accent/80',
                  )}
                  aria-hidden
                >
                  <Check className='size-3.5' />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {onBack ? (
        <div className='flex items-center justify-between pt-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onBack}
            className='gap-1'
          >
            <ArrowLeft className='size-4' /> Back
          </Button>
          <span className='text-xs text-content-muted'>
            Tap an answer to continue <ArrowRight className='inline size-3' />
          </span>
        </div>
      ) : null}
    </div>
  );
}

interface VibeResultCardProps {
  vibe: CosmicVibe;
  saveState: SaveState;
  shareNote: string | null;
  onSave: () => void;
  onShare: () => void;
  onRetake: () => void;
}

function VibeResultCard({
  vibe,
  saveState,
  shareNote,
  onSave,
  onShare,
  onRetake,
}: VibeResultCardProps) {
  const gradient = `linear-gradient(135deg, ${vibe.gradient.from} 0%, ${vibe.gradient.via} 50%, ${vibe.gradient.to} 100%)`;

  return (
    <div
      style={{ animation: 'cosmic-vibe-result-in 700ms ease-out both' }}
      className='flex flex-col gap-5'
    >
      <div
        className='relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8 text-white shadow-[0_0_60px_rgba(132,88,216,0.35)]'
        style={{ background: gradient }}
      >
        {/* Subtle starfield overlay */}
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:32px_32px]'
        />

        <div className='relative flex flex-col gap-4'>
          <span className='text-[10px] uppercase tracking-[0.4em] text-white/70'>
            Your cosmic vibe
          </span>
          <Heading as='h2' variant='h1' className='text-white'>
            {vibe.vibeName}
          </Heading>
          <div className='flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/80'>
            <span className='rounded-full border border-white/30 px-3 py-1'>
              {vibe.element}
            </span>
            <span className='rounded-full border border-white/30 px-3 py-1'>
              {vibe.archetype}
            </span>
          </div>
          <p className='max-w-md text-base italic leading-relaxed text-white/95 sm:text-lg'>
            “{vibe.oneLiner}”
          </p>
        </div>
      </div>

      <AudioNarrator
        text={vibe.oneLiner}
        title={`Hear ${vibe.vibeName}`}
        className='self-start'
      />

      <div className='flex flex-wrap items-center gap-3'>
        <Button
          type='button'
          variant='lunary-solid'
          onClick={onSave}
          disabled={saveState === 'saving' || saveState === 'saved'}
          className='gap-2'
        >
          {saveState === 'saving' ? (
            <Loader2 className='size-4 animate-spin' aria-hidden />
          ) : saveState === 'saved' ? (
            <Check className='size-4' aria-hidden />
          ) : (
            <Save className='size-4' aria-hidden />
          )}
          {saveState === 'saved' ? 'Saved to profile' : 'Save my vibe'}
        </Button>

        <Button
          type='button'
          variant='lunary'
          onClick={onShare}
          className='gap-2'
        >
          <Share2 className='size-4' aria-hidden /> Share my vibe
        </Button>

        <Button
          type='button'
          variant='ghost'
          onClick={onRetake}
          className='gap-2'
        >
          <RefreshCw className='size-4' aria-hidden /> Retake
        </Button>
      </div>

      {saveState === 'error' ? (
        <p className='text-sm text-lunary-rose'>
          Couldn’t save right now — try again in a moment.
        </p>
      ) : null}
      {shareNote ? (
        <p className='text-sm text-content-muted'>{shareNote}</p>
      ) : null}

      <p className='text-xs text-content-muted'>
        This is your fast read — for the full picture, add your birth chart in
        Profile.
      </p>
    </div>
  );
}
