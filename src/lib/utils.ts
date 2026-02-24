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
  // Allow exact match or subdomain match (e.g. xyz.blob.vercel-storage.com)
  const isTrusted = Array.from(TRUSTED_FETCH_DOMAINS).some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
  if (!isTrusted) {
    throw new Error(`Untrusted fetch URL domain: ${host}`);
  }
  // Reconstruct URL from parsed components to break CodeQL taint chain
  return `${parsed.protocol}//${parsed.host}${parsed.pathname}${parsed.search}`;
}

/**
 * Sanitize a string for safe logging — strips control characters.
 */
export function sanitizeForLog(value: string): string {
  return String(value).replace(/[\r\n\x00-\x1F\x7F]/g, '');
}

export function generateUUID(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  // Fallback for older Android WebViews
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
