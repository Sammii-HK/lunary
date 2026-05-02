'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  isSpeechSupported,
  pauseAll,
  resumeAll,
  speakText,
  stopAll,
} from '@/lib/audio/tts-cache';

export type NarrationState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'error';

export interface UseAudioNarrationOptions {
  voice?: string;
  /** initial playback rate (0.5 - 2). default 1. */
  rate?: number;
  /**
   * If true, the hook will always use the browser's free Web Speech
   * Synthesis API and never reach for a paid TTS audio URL. Used by
   * `AudioNarrator` to enforce the `voice_narration` premium gate while
   * letting free users keep the (zero-cost) browser voice fallback.
   * Today the underlying `speakText` path is browser-only, so this is a
   * forward-compatible flag that becomes load-bearing once the route
   * starts returning real `audioUrl`s.
   */
  forceBrowserSynth?: boolean;
}

export interface UseAudioNarrationResult {
  state: NarrationState;
  /** estimated total duration in seconds (or null while not yet playing) */
  duration: number | null;
  /** seconds elapsed since playback started */
  position: number;
  /** whether speech synthesis is available in this environment */
  supported: boolean;
  /** current playback rate */
  rate: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
}

/**
 * Words-per-minute estimate used to predict utterance duration.
 * Web Speech API doesn't expose precise position events, so we estimate by
 * counting words in the source text and dividing by a typical speech rate.
 * 165 wpm ≈ a friendly narration cadence; we then adjust by the playback rate.
 */
const BASE_WPM = 165;

function estimateDurationSeconds(text: string, rate: number): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  const wpm = BASE_WPM * Math.max(rate, 0.5);
  return (words / wpm) * 60;
}

/**
 * Custom hook that manages a single TTS narration utterance.
 *
 * Internally uses `speakText` from `@/lib/audio/tts-cache` (Web Speech API).
 * If/when the server route returns a real `audioUrl`, this hook can be
 * upgraded to use an <audio> element instead, the public API stays the same.
 */
export function useAudioNarration(
  text: string,
  opts: UseAudioNarrationOptions = {},
): UseAudioNarrationResult {
  const { voice, forceBrowserSynth: _forceBrowserSynth } = opts;
  const initialRate = opts.rate ?? 1;
  // `_forceBrowserSynth` is intentionally consumed here even though the
  // underlying `speakText` path is browser-only today. Once the server
  // route starts returning paid TTS `audioUrl`s, this flag is the gate
  // that keeps free users on the zero-cost browser voice. See
  // `voice_narration` in `utils/entitlements.ts`.
  void _forceBrowserSynth;

  const [state, setState] = useState<NarrationState>('idle');
  const [position, setPosition] = useState(0);
  const [rate, setRateState] = useState<number>(initialRate);
  const [duration, setDuration] = useState<number | null>(null);
  const [supported, setSupported] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const tickRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const positionAtPauseRef = useRef<number>(0);

  // SSR-safe support detection
  useEffect(() => {
    setSupported(isSpeechSupported());
  }, []);

  const clearTicker = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTicker = useCallback(() => {
    clearTicker();
    if (typeof window === 'undefined') return;
    tickRef.current = window.setInterval(() => {
      if (startedAtRef.current === null) return;
      const elapsed =
        positionAtPauseRef.current + (Date.now() - startedAtRef.current) / 1000;
      setPosition(elapsed);
    }, 200);
  }, [clearTicker]);

  const handleEnd = useCallback(() => {
    clearTicker();
    startedAtRef.current = null;
    positionAtPauseRef.current = 0;
    setPosition(0);
    setState('idle');
    utteranceRef.current = null;
  }, [clearTicker]);

  const handleError = useCallback(() => {
    clearTicker();
    startedAtRef.current = null;
    positionAtPauseRef.current = 0;
    setState('error');
    utteranceRef.current = null;
  }, [clearTicker]);

  const play = useCallback(() => {
    if (!isSpeechSupported() || !text?.trim()) {
      setState('error');
      return;
    }

    // resume from paused state
    if (state === 'paused') {
      resumeAll();
      startedAtRef.current = Date.now();
      setState('playing');
      startTicker();
      return;
    }

    setState('loading');
    setPosition(0);
    positionAtPauseRef.current = 0;
    const estimated = estimateDurationSeconds(text, rate);
    setDuration(estimated > 0 ? estimated : null);

    void speakText(text, {
      voice,
      rate,
      onStart: () => {
        startedAtRef.current = Date.now();
        setState('playing');
        startTicker();
      },
      onEnd: handleEnd,
      onError: handleError,
      onPause: () => {
        if (startedAtRef.current !== null) {
          positionAtPauseRef.current +=
            (Date.now() - startedAtRef.current) / 1000;
          startedAtRef.current = null;
        }
        clearTicker();
        setState('paused');
      },
      onResume: () => {
        startedAtRef.current = Date.now();
        setState('playing');
        startTicker();
      },
    }).then((utt) => {
      utteranceRef.current = utt;
    });
  }, [
    text,
    voice,
    rate,
    state,
    startTicker,
    clearTicker,
    handleEnd,
    handleError,
  ]);

  const pause = useCallback(() => {
    if (state !== 'playing') return;
    pauseAll();
    if (startedAtRef.current !== null) {
      positionAtPauseRef.current += (Date.now() - startedAtRef.current) / 1000;
      startedAtRef.current = null;
    }
    clearTicker();
    setState('paused');
  }, [state, clearTicker]);

  const stop = useCallback(() => {
    stopAll();
    clearTicker();
    startedAtRef.current = null;
    positionAtPauseRef.current = 0;
    setPosition(0);
    setDuration(null);
    setState('idle');
    utteranceRef.current = null;
  }, [clearTicker]);

  const setRate = useCallback(
    (next: number) => {
      const clamped = Math.min(2, Math.max(0.5, next));
      setRateState(clamped);
      // Web Speech doesn't allow live rate changes, restart at the new rate
      // if currently playing so the change is felt immediately.
      if (state === 'playing' || state === 'paused') {
        stopAll();
        clearTicker();
        positionAtPauseRef.current = 0;
        startedAtRef.current = null;
        setPosition(0);
        setState('idle');
        // schedule a restart on next tick so React state settles
        window.setTimeout(() => {
          // re-trigger play with new rate
          if (text?.trim()) {
            setState('loading');
            const estimated = estimateDurationSeconds(text, clamped);
            setDuration(estimated > 0 ? estimated : null);
            void speakText(text, {
              voice,
              rate: clamped,
              onStart: () => {
                startedAtRef.current = Date.now();
                setState('playing');
                startTicker();
              },
              onEnd: handleEnd,
              onError: handleError,
              onPause: () => {
                if (startedAtRef.current !== null) {
                  positionAtPauseRef.current +=
                    (Date.now() - startedAtRef.current) / 1000;
                  startedAtRef.current = null;
                }
                clearTicker();
                setState('paused');
              },
              onResume: () => {
                startedAtRef.current = Date.now();
                setState('playing');
                startTicker();
              },
            }).then((utt) => {
              utteranceRef.current = utt;
            });
          }
        }, 0);
      }
    },
    [state, text, voice, clearTicker, startTicker, handleEnd, handleError],
  );

  // Cleanup: stop speaking when the component unmounts or text changes.
  useEffect(() => {
    return () => {
      stopAll();
      if (tickRef.current !== null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
      startedAtRef.current = null;
      positionAtPauseRef.current = 0;
    };
  }, []);

  // If the source text changes while playing, stop immediately.
  useEffect(() => {
    stopAll();
    clearTicker();
    startedAtRef.current = null;
    positionAtPauseRef.current = 0;
    setPosition(0);
    setDuration(null);
    setState('idle');
  }, [text, clearTicker]);

  return useMemo(
    () => ({
      state,
      duration,
      position,
      supported,
      rate,
      play,
      pause,
      stop,
      setRate,
    }),
    [state, duration, position, supported, rate, play, pause, stop, setRate],
  );
}

export default useAudioNarration;
