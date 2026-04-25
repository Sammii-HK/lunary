/**
 * TTS cache + Web Speech Synthesis wrapper.
 *
 * v1 strategy: use the browser's free Web Speech Synthesis API as the primary
 * playback path. No server cost, no API keys, works offline on most modern
 * browsers / iOS / Android.
 *
 * The IndexedDB cache layer below is reserved for a *future* upgrade path
 * where the founder may want premium voices via OpenAI TTS or ElevenLabs.
 * In that scenario the server route returns a real audio URL and we cache the
 * blob keyed by (contentHash, voice) so we never re-generate paid audio.
 *
 *   FUTURE:
 *     // const res = await fetch('/api/audio/narrate', { method: 'POST', ... })
 *     // const { audioUrl, useBrowserSynthesis } = await res.json()
 *     // if (audioUrl) await setCachedAudioUrl(hash, voice, audioUrl)
 *
 * Until then `getCachedAudioUrl` will return null and the client falls back
 * to `speakText` (Web Speech API).
 */

const DB_NAME = 'lunary-tts-cache';
const DB_VERSION = 1;
const STORE_NAME = 'audio-blobs';

type CachedRecord = {
  key: string;
  url: string;
  createdAt: number;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function hasSpeechSynthesis(): boolean {
  return isBrowser() && typeof window.speechSynthesis !== 'undefined';
}

function makeKey(contentHash: string, voice: string): string {
  return `${contentHash}::${voice || 'default'}`;
}

// ---------- IndexedDB plumbing (no library) ---------------------------------

function openDb(): Promise<IDBDatabase | null> {
  if (!isBrowser() || typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        console.warn('[tts-cache] IndexedDB open failed', req.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('[tts-cache] IndexedDB unavailable', err);
      resolve(null);
    }
  });
}

export async function getCachedAudioUrl(
  contentHash: string,
  voice: string,
): Promise<string | null> {
  const db = await openDb();
  if (!db) return null;
  const key = makeKey(contentHash, voice);
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        const rec = req.result as CachedRecord | undefined;
        resolve(rec?.url ?? null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function setCachedAudioUrl(
  contentHash: string,
  voice: string,
  url: string,
): Promise<void> {
  const db = await openDb();
  if (!db) return;
  const key = makeKey(contentHash, voice);
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: CachedRecord = { key, url, createdAt: Date.now() };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Lightweight content hash so callers can build cache keys without dragging in
 * a crypto dep. Collisions are fine here — worst case we fall back to
 * regenerating audio.
 */
export function hashContent(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h << 5) - h + text.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

// ---------- Web Speech Synthesis primary path -------------------------------

export interface SpeakOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: SpeechSynthesisErrorEvent) => void;
  onPause?: () => void;
  onResume?: () => void;
}

/**
 * Speak the given text using the Web Speech Synthesis API.
 * Resolves with the utterance so callers can subscribe to lifecycle events
 * if they didn't pass them in via opts.
 *
 * Returns a no-op utterance shim on SSR / unsupported browsers so callers
 * don't have to null-check everywhere.
 */
export async function speakText(
  text: string,
  opts: SpeakOptions = {},
): Promise<SpeechSynthesisUtterance> {
  if (!hasSpeechSynthesis()) {
    // Build a stub that callers can attach to; fires error on next tick.
    const stub = {
      text,
      onstart: null,
      onend: null,
      onerror: null,
    } as unknown as SpeechSynthesisUtterance;
    return stub;
  }

  // Ensure clean state — Safari sometimes gets stuck with paused queues.
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = clamp(opts.rate ?? 1, 0.5, 2);
  utterance.pitch = clamp(opts.pitch ?? 1, 0, 2);
  utterance.volume = clamp(opts.volume ?? 1, 0, 1);
  if (opts.lang) utterance.lang = opts.lang;

  if (opts.voice) {
    const voices = listVoices();
    const match =
      voices.find((v) => v.name === opts.voice) ||
      voices.find((v) => v.voiceURI === opts.voice);
    if (match) utterance.voice = match;
  }

  if (opts.onStart) utterance.addEventListener('start', opts.onStart);
  if (opts.onEnd) utterance.addEventListener('end', opts.onEnd);
  if (opts.onError) {
    utterance.addEventListener('error', opts.onError as EventListener);
  }
  if (opts.onPause) utterance.addEventListener('pause', opts.onPause);
  if (opts.onResume) utterance.addEventListener('resume', opts.onResume);

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[tts-cache] speak failed', err);
  }
  return utterance;
}

export function pauseAll(): void {
  if (!hasSpeechSynthesis()) return;
  try {
    window.speechSynthesis.pause();
  } catch {
    /* noop */
  }
}

export function resumeAll(): void {
  if (!hasSpeechSynthesis()) return;
  try {
    window.speechSynthesis.resume();
  } catch {
    /* noop */
  }
}

export function stopAll(): void {
  if (!hasSpeechSynthesis()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
}

export function listVoices(): SpeechSynthesisVoice[] {
  if (!hasSpeechSynthesis()) return [];
  try {
    return window.speechSynthesis.getVoices() ?? [];
  } catch {
    return [];
  }
}

/** Whether the Web Speech API is available in this environment. */
export function isSpeechSupported(): boolean {
  return hasSpeechSynthesis();
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
