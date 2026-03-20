/**
 * Rate-limited fetch wrapper for Ayrshare API calls.
 *
 * Ayrshare suspends profiles after too many 429s. This wrapper:
 * - Enforces 500ms minimum gap between requests
 * - Retries up to 2x on 429 with exponential backoff
 * - Gives up cleanly instead of spamming
 *
 * Shared across ayrshare.ts, ayrshare-youtube.ts, and collect-performance.ts
 */

const MIN_REQUEST_INTERVAL_MS = 500;
const MAX_RETRIES = 2;
let lastRequestTime = 0;

export async function ayrshareFetch(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const now = Date.now();
  const gap = MIN_REQUEST_INTERVAL_MS - (now - lastRequestTime);
  if (gap > 0) {
    await new Promise((r) => setTimeout(r, gap));
  }
  lastRequestTime = Date.now();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, init);

    if (response.status !== 429) return response;

    if (attempt === MAX_RETRIES) {
      console.error(
        `[ayrshare] Still rate limited after ${MAX_RETRIES} retries. Giving up.`,
      );
      return response;
    }

    const retryAfter = response.headers.get('retry-after');
    const waitMs = retryAfter
      ? Math.min(parseInt(retryAfter, 10) * 1000, 30000)
      : 5000 * (attempt + 1);
    console.warn(
      `[ayrshare] 429 rate limited. Waiting ${waitMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
    );
    await new Promise((r) => setTimeout(r, waitMs));
    lastRequestTime = Date.now();
  }

  throw new Error('Unexpected: exceeded retry loop');
}
