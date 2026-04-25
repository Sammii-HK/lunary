'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Mic, Square, Trash2 } from 'lucide-react';
import {
  isRecognitionSupported,
  startContinuousRecognition,
  type ContinuousRecognitionHandle,
  type RecognitionState,
} from '@/lib/voice/recognition';
import { VoiceWaveform } from '@/components/journal/VoiceWaveform';
import { cn } from '@/lib/utils';

interface VoiceJournalInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  /** Optional transit-driven prompt to surface above the textarea. */
  prompt?: string;
  /** Override the localStorage draft key. Defaults to `lunary:voice-journal-draft`. */
  draftKey?: string;
  /** Disable the localStorage draft autosave. */
  disableDraft?: boolean;
  className?: string;
  /** Override the default language tag. */
  language?: string;
}

const DEFAULT_DRAFT_KEY = 'lunary:voice-journal-draft';
const DRAFT_SAVE_INTERVAL_MS = 5_000;
// How long after the last keystroke we resume listening (the user may have
// just been mid-keypress — don't yank the mic away after a single character).
const TYPING_PAUSE_GRACE_MS = 1_500;

type UiState = 'idle' | 'listening' | 'paused' | 'denied' | 'error';

/**
 * Voice-first journal input. Tap the mic to dictate; the transcript appends
 * to the textarea live. Typing temporarily pauses recognition so editing
 * doesn't fight the mic.
 *
 * Privacy posture: nothing leaves the device. Web Speech Recognition routes
 * audio to iOS Siri / Android Google native speech services. We don't ship
 * Whisper-WASM in v1 (extra ~30MB) — quality is "good enough" and the latency
 * is unbeatable.
 */
export function VoiceJournalInput({
  value,
  onChange,
  placeholder = 'How are you really feeling tonight?',
  prompt,
  draftKey = DEFAULT_DRAFT_KEY,
  disableDraft = false,
  className,
  language,
}: VoiceJournalInputProps) {
  const textareaId = useId();
  const liveRegionId = useId();

  const [supported, setSupported] = useState<boolean | null>(null);
  const [uiState, setUiState] = useState<UiState>('idle');
  const [interim, setInterim] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRef = useRef<ContinuousRecognitionHandle | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -------- SSR-safe support detection -----------------------------------
  useEffect(() => {
    setSupported(isRecognitionSupported());
  }, []);

  // -------- Hydrate draft from localStorage -------------------------------
  useEffect(() => {
    if (disableDraft) return;
    if (typeof window === 'undefined') return;
    // Only hydrate if the caller didn't already pass a value (avoids stomping
    // a server-loaded entry).
    if (valueRef.current && valueRef.current.length > 0) return;
    try {
      const saved = window.localStorage.getItem(draftKey);
      if (saved && saved.length > 0) {
        onChange(saved);
      }
    } catch {
      // localStorage may be disabled (Safari private mode) — ignore.
    }
    // Intentional: we want this to fire exactly once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- Persist draft every 5s ---------------------------------------
  useEffect(() => {
    if (disableDraft) return;
    if (typeof window === 'undefined') return;
    const interval = setInterval(() => {
      try {
        const v = valueRef.current;
        if (v && v.length > 0) {
          window.localStorage.setItem(draftKey, v);
        } else {
          window.localStorage.removeItem(draftKey);
        }
      } catch {
        // Ignore storage failures.
      }
    }, DRAFT_SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [draftKey, disableDraft]);

  // -------- Stop recognition cleanly on unmount ---------------------------
  useEffect(() => {
    return () => {
      handleRef.current?.stop();
      handleRef.current = null;
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, []);

  // -------- Recognition lifecycle ----------------------------------------
  const stopRecognition = useCallback(() => {
    handleRef.current?.stop();
    handleRef.current = null;
    setInterim('');
  }, []);

  const startRecognition = useCallback(() => {
    if (handleRef.current) return; // Already running.
    setErrorMessage(null);
    setInterim('');
    handleRef.current = startContinuousRecognition({
      language,
      onEvent: (event) => {
        if (event.type === 'state') {
          // Map the lib's state space to the UI's smaller one.
          const next: UiState = mapState(event.state);
          setUiState(next);
          if (next === 'denied') {
            setErrorMessage(
              'Tap the lock icon in the address bar to allow microphone access.',
            );
            handleRef.current = null;
          }
          if (next === 'idle') {
            setInterim('');
          }
        } else if (event.type === 'transcript') {
          if (event.isFinal) {
            // Append final text with a sensible separator.
            const current = valueRef.current;
            const sep = current.length === 0 || /\s$/.test(current) ? '' : ' ';
            const cleaned = event.text.trim();
            if (cleaned.length > 0) {
              onChange(`${current}${sep}${cleaned}`);
            }
            setInterim('');
          } else {
            setInterim(event.text);
          }
        } else if (event.type === 'error') {
          setErrorMessage(event.message);
        }
      },
    });
  }, [language, onChange]);

  const handleMicClick = useCallback(() => {
    if (uiState === 'listening' || uiState === 'paused') {
      stopRecognition();
    } else {
      startRecognition();
    }
  }, [uiState, startRecognition, stopRecognition]);

  // -------- Textarea editing --------------------------------------------
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(() => {
    // Typing pauses voice — assume the user is editing.
    if (handleRef.current && uiState === 'listening') {
      handleRef.current.pause();
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      // Don't auto-resume — let the user explicitly tap the mic again. This
      // matches the heuristic that "typing means I'm taking over".
    }, TYPING_PAUSE_GRACE_MS);
  }, [uiState]);

  // -------- Clear --------------------------------------------------------
  const handleClear = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (value.length === 0) return;
    const ok = window.confirm(
      'Clear your journal entry? This cannot be undone.',
    );
    if (!ok) return;
    stopRecognition();
    onChange('');
    setInterim('');
    if (!disableDraft) {
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        // Ignore.
      }
    }
  }, [value.length, stopRecognition, onChange, disableDraft, draftKey]);

  const charCount = value.length;
  const isListening = uiState === 'listening';

  const liveRegionMessage = useMemo(() => {
    switch (uiState) {
      case 'listening':
        return 'Listening. Speak to add to your entry.';
      case 'paused':
        return 'Microphone paused.';
      case 'denied':
        return 'Microphone access denied.';
      case 'error':
        return errorMessage ? `Voice error: ${errorMessage}` : 'Voice error.';
      default:
        return '';
    }
  }, [uiState, errorMessage]);

  // SSR + initial render: render UI without the mic button until we know
  // whether the browser supports it. After detection, hide it entirely if
  // unsupported (per spec).
  const showMic = supported === true;

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {prompt ? (
        <div className='mb-2 text-sm text-content-secondary italic'>
          {prompt}
        </div>
      ) : null}

      <label htmlFor={textareaId} className='sr-only'>
        Journal entry
      </label>

      <div className='relative'>
        <textarea
          id={textareaId}
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={6}
          aria-describedby={liveRegionId}
          className={cn(
            'w-full rounded-xl border border-stroke-default bg-surface-base text-content-primary',
            'px-4 py-3 pr-14 text-base placeholder:text-content-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lunary-primary',
            'min-h-[160px] resize-y leading-relaxed',
          )}
        />

        {/* Live interim transcript shown after the existing text. */}
        {interim && isListening ? (
          <div
            aria-hidden='true'
            className={cn(
              'pointer-events-none absolute bottom-2 left-4 right-14',
              'text-sm text-content-muted italic truncate',
            )}
          >
            {value && !/\s$/.test(value) ? ' ' : ''}
            {interim}
          </div>
        ) : null}

        {showMic ? (
          <button
            type='button'
            onClick={handleMicClick}
            aria-label={
              isListening ? 'Stop voice recording' : 'Start voice recording'
            }
            aria-pressed={isListening}
            className={cn(
              'absolute bottom-3 right-3 inline-flex h-11 w-11 items-center justify-center',
              'rounded-full transition-all touch-manipulation',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lunary-primary focus-visible:ring-offset-2',
              isListening
                ? 'bg-lunary-primary text-white shadow-[0_0_20px_#8458D866] animate-pulse'
                : 'bg-lunary-primary/15 text-lunary-accent hover:bg-lunary-primary/25',
            )}
          >
            {isListening ? (
              <Square className='h-5 w-5' fill='currentColor' />
            ) : (
              <Mic className='h-5 w-5' />
            )}
          </button>
        ) : null}
      </div>

      {/* Waveform — only when actively listening */}
      {isListening ? (
        <div className='mt-3'>
          <VoiceWaveform listening={isListening} />
        </div>
      ) : null}

      {/* Permission denied / error inline message */}
      {uiState === 'denied' ? (
        <div className='mt-2 text-xs text-lunary-error'>
          Tap the lock icon in the address bar to allow microphone access.
        </div>
      ) : null}
      {uiState === 'error' && errorMessage ? (
        <div className='mt-2 text-xs text-lunary-error'>{errorMessage}</div>
      ) : null}

      {/* Footer: char count + privacy note + clear */}
      <div className='mt-2 flex items-center justify-between gap-3 text-xs text-content-muted'>
        <span>
          {charCount} {charCount === 1 ? 'character' : 'characters'} - Speak or
          type — your words are private to you
        </span>
        {value.length > 0 ? (
          <button
            type='button'
            onClick={handleClear}
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-1',
              'text-content-muted hover:text-lunary-error transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lunary-primary',
            )}
            aria-label='Clear journal entry'
          >
            <Trash2 className='h-3.5 w-3.5' />
            <span>Clear</span>
          </button>
        ) : null}
      </div>

      {/* SR-only live region for state announcements */}
      <div
        id={liveRegionId}
        aria-live='polite'
        aria-atomic='true'
        className='sr-only'
      >
        {liveRegionMessage}
      </div>
    </div>
  );
}

function mapState(state: RecognitionState): UiState {
  switch (state) {
    case 'listening':
      return 'listening';
    case 'paused':
      return 'paused';
    case 'denied':
      return 'denied';
    case 'unsupported':
      return 'idle';
    case 'error':
      return 'error';
    case 'idle':
    default:
      return 'idle';
  }
}

export default VoiceJournalInput;
