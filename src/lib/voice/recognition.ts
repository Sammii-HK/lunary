/**
 * Long-form continuous voice recognition wrapper around the Web Speech API.
 *
 * This is intentionally separate from `src/lib/search/voice-input.ts` (which is
 * single-shot, fire-and-forget for the smart search bar). Journal-style voice
 * capture has different lifetime semantics:
 *  - It must keep listening across pauses ("um... let me think...").
 *  - It must auto-restart on iOS Safari, which aggressively kills recognition
 *    after ~1s of silence even when `continuous = true`.
 *  - It must surface interim results so the UI can show a live transcript.
 *
 * Everything is on-device — the browser routes audio to iOS Siri / Android
 * Google native services. No server cost, no Whisper dependency for v1.
 */

export type RecognitionState =
  | 'idle'
  | 'listening'
  | 'paused'
  | 'denied'
  | 'unsupported'
  | 'error';

export type RecognitionEvent =
  | { type: 'state'; state: RecognitionState }
  | { type: 'transcript'; text: string; isFinal: boolean }
  | { type: 'error'; message: string };

export interface ContinuousRecognitionOptions {
  /** BCP-47 language tag, e.g. 'en-US', 'en-GB', 'es-ES'. Defaults to 'en-US'. */
  language?: string;
  onEvent: (e: RecognitionEvent) => void;
}

export interface ContinuousRecognitionHandle {
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

// ---------------------------------------------------------------------------
// Web Speech API typings
// ---------------------------------------------------------------------------

// The DOM lib doesn't ship SpeechRecognition types in older TS targets, and
// browser support is split between `SpeechRecognition` and the prefixed
// `webkitSpeechRecognition`. We declare the minimal surface we need.

interface MinimalSpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface MinimalSpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): MinimalSpeechRecognitionAlternative;
  [index: number]: MinimalSpeechRecognitionAlternative;
}

interface MinimalSpeechRecognitionResultList {
  readonly length: number;
  item(index: number): MinimalSpeechRecognitionResult;
  [index: number]: MinimalSpeechRecognitionResult;
}

interface MinimalSpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: MinimalSpeechRecognitionResultList;
}

interface MinimalSpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

interface MinimalSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult:
    | ((
        this: MinimalSpeechRecognition,
        ev: MinimalSpeechRecognitionEvent,
      ) => void)
    | null;
  onerror:
    | ((
        this: MinimalSpeechRecognition,
        ev: MinimalSpeechRecognitionErrorEvent,
      ) => void)
    | null;
  onend: ((this: MinimalSpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: MinimalSpeechRecognition, ev: Event) => void) | null;
}

type SpeechRecognitionCtor = new () => MinimalSpeechRecognition;

interface SpeechRecognitionWindow {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as SpeechRecognitionWindow;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export function startContinuousRecognition(
  opts: ContinuousRecognitionOptions,
): ContinuousRecognitionHandle {
  const { language = 'en-US', onEvent } = opts;

  const Ctor = getRecognitionCtor();

  // SSR or unsupported browser: emit `unsupported` and return a no-op handle so
  // callers don't have to special-case the return type.
  if (!Ctor) {
    onEvent({ type: 'state', state: 'unsupported' });
    return {
      stop: () => {},
      pause: () => {},
      resume: () => {},
    };
  }

  // ------------------------------------------------------------------
  // Lifecycle state
  // ------------------------------------------------------------------
  // `userIntent` reflects what the *consumer* wants — listening, paused, or
  // stopped. The browser may end the recognition session on its own (this
  // happens routinely on iOS Safari), but we keep restarting it as long as
  // userIntent is 'listening'.
  type UserIntent = 'listening' | 'paused' | 'stopped';
  let userIntent: UserIntent = 'listening';

  // Tracks whether the underlying SpeechRecognition is currently running, to
  // avoid double-start (which throws InvalidStateError on Chrome).
  let isRunning = false;

  // Number of consecutive auto-restart attempts after an error. Reset on any
  // successful result to bound runaway loops if the mic is permanently broken.
  let restartAttempts = 0;
  const MAX_RESTART_ATTEMPTS = 5;

  let restartTimer: ReturnType<typeof setTimeout> | null = null;

  const recognition = new Ctor();
  recognition.lang = language;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  const clearRestartTimer = () => {
    if (restartTimer !== null) {
      clearTimeout(restartTimer);
      restartTimer = null;
    }
  };

  const safeStart = () => {
    if (isRunning) return;
    try {
      recognition.start();
      isRunning = true;
    } catch (err) {
      // Most common: InvalidStateError when the previous session hasn't fully
      // ended yet. Schedule a retry shortly.
      isRunning = false;
      const message = err instanceof Error ? err.message : String(err);
      // Don't treat as a hard error — try once more after a beat.
      clearRestartTimer();
      restartTimer = setTimeout(() => {
        if (userIntent === 'listening') safeStart();
      }, 250);
      onEvent({ type: 'error', message: `start failed: ${message}` });
    }
  };

  recognition.onstart = () => {
    isRunning = true;
    if (userIntent === 'listening') {
      onEvent({ type: 'state', state: 'listening' });
    }
  };

  recognition.onresult = (event: MinimalSpeechRecognitionEvent) => {
    // Got a result — the mic is working, so reset the failure counter.
    restartAttempts = 0;

    // Walk the new results from this event onwards. The browser keeps a
    // running list of all results; `event.resultIndex` is the first new one.
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (!result || result.length === 0) continue;
      const alt = result[0];
      if (!alt) continue;
      const text = alt.transcript;
      if (result.isFinal) {
        final += text;
      } else {
        interim += text;
      }
    }

    // Emit final first (so consumers can append to durable state) and then
    // interim (so the live preview is correct after the append).
    if (final.length > 0) {
      onEvent({ type: 'transcript', text: final.trim(), isFinal: true });
    }
    if (interim.length > 0) {
      onEvent({ type: 'transcript', text: interim.trim(), isFinal: false });
    }
  };

  recognition.onerror = (event: MinimalSpeechRecognitionErrorEvent) => {
    const code = event.error;
    // Permission denied — terminal. The user has to retry from a UI gesture.
    if (code === 'not-allowed' || code === 'service-not-allowed') {
      userIntent = 'stopped';
      onEvent({ type: 'state', state: 'denied' });
      return;
    }

    // `no-speech` and `aborted` are noisy and routine on iOS — don't surface
    // them as errors; let `onend` handle the restart.
    if (code === 'no-speech' || code === 'aborted') {
      return;
    }

    onEvent({ type: 'error', message: event.message || code });
    onEvent({ type: 'state', state: 'error' });
  };

  recognition.onend = () => {
    isRunning = false;

    // iOS Safari quirk: recognition.continuous = true is honoured very loosely.
    // Safari ends the session aggressively after short silences, even mid-
    // sentence. Chrome desktop is well-behaved but Chrome Android also ends
    // after ~60s. The fix is to restart whenever the user still wants to
    // listen. We add a tiny debounce to give the engine time to release its
    // resources, and a backoff if we're failing repeatedly.
    if (userIntent !== 'listening') {
      return;
    }

    if (restartAttempts >= MAX_RESTART_ATTEMPTS) {
      onEvent({
        type: 'error',
        message: 'Recognition repeatedly ended; stopping auto-restart.',
      });
      onEvent({ type: 'state', state: 'error' });
      userIntent = 'stopped';
      return;
    }

    restartAttempts += 1;
    const delay = Math.min(100 * restartAttempts, 800);
    clearRestartTimer();
    restartTimer = setTimeout(() => {
      if (userIntent === 'listening') safeStart();
    }, delay);
  };

  // Kick off the first session.
  onEvent({ type: 'state', state: 'listening' });
  safeStart();

  return {
    stop: () => {
      userIntent = 'stopped';
      clearRestartTimer();
      try {
        // `abort` is more decisive than `stop` — it discards pending results
        // and won't fire a final `onresult`. For a "stop" gesture in the UI
        // we want immediate termination.
        recognition.abort();
      } catch {
        // Ignore — recognition may already have ended.
      }
      isRunning = false;
      onEvent({ type: 'state', state: 'idle' });
    },
    pause: () => {
      if (userIntent !== 'listening') return;
      userIntent = 'paused';
      clearRestartTimer();
      try {
        recognition.stop();
      } catch {
        // Ignore.
      }
      onEvent({ type: 'state', state: 'paused' });
    },
    resume: () => {
      if (userIntent === 'listening') return;
      userIntent = 'listening';
      restartAttempts = 0;
      onEvent({ type: 'state', state: 'listening' });
      safeStart();
    },
  };
}
