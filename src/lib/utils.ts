import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a UUID with fallback for older browsers/WebViews
 * that don't support crypto.randomUUID()
 */
/**
 * Strip HTML tags from a string in O(n) without regex.
 * Replaces tags with the given substitute (default: space).
 */
export function stripHtmlTags(str: string, substitute = ' '): string {
  let result = '';
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '<') {
      if (depth === 0) result += substitute;
      depth++;
    } else if (ch === '>') {
      if (depth > 0) depth--;
    } else if (depth === 0) {
      result += ch;
    }
  }
  return result;
}

/**
 * Allow-list of trusted domains for external fetch requests.
 * Prevents SSRF by rejecting URLs pointing to untrusted hosts.
 */
const TRUSTED_FETCH_DOMAINS = new Set([
  'blob.vercel-storage.com',
  'api.github.com',
  'api.openai.com',
  'api.deepinfra.com',
  'www.reddit.com',
]);

/**
 * Validate that a URL points to a trusted domain before fetching.
 * Throws if the URL host is not in the allow-list.
 */
export function validateFetchUrl(url: string): string {
  const parsed = new URL(url);
  const host = parsed.hostname;

  if (parsed.protocol !== 'https:') {
    throw new Error(`Untrusted fetch URL protocol: ${parsed.protocol}`);
  }

  // Allow exact match or subdomain match (e.g. xyz.blob.vercel-storage.com)
  const isTrusted = Array.from(TRUSTED_FETCH_DOMAINS).some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
  if (!isTrusted) {
    throw new Error(`Untrusted fetch URL domain: ${host}`);
  }
  // Reconstruct URL from parsed components to break CodeQL taint chain
  return `https://${parsed.host}${parsed.pathname}${parsed.search}`;
}

/**
 * Sanitize a string for safe logging — strips control characters.
 */
export function sanitizeForLog(value: string): string {
  return String(value).replace(/[\r\n\x00-\x1F\x7F]/g, '');
}

let fallbackUuidCounter = 0;

export function generateUUID(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
      12,
      16,
    )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // Last-resort uniqueness fallback for very old WebViews without Web Crypto.
  fallbackUuidCounter = (fallbackUuidCounter + 1) % 0xffff;
  const now = Date.now().toString(16).padStart(12, '0').slice(-12);
  const perf =
    typeof performance !== 'undefined'
      ? Math.floor(performance.now() * 1000)
          .toString(16)
          .padStart(8, '0')
          .slice(-8)
      : '00000000';
  const counter = fallbackUuidCounter.toString(16).padStart(4, '0');

  return `${perf.slice(0, 8)}-${counter}-4${now.slice(0, 3)}-8${now.slice(
    3,
    6,
  )}-${now.slice(6)}${counter}${perf.slice(0, 2)}`;
}
