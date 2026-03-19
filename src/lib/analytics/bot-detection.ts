/**
 * Bot detection for analytics events.
 *
 * Layer 1: User-agent pattern matching (catches declared bots)
 * Layer 2: Browser fingerprint signals (catches stealth bots)
 *
 * Modern browsers send sec-fetch-* headers that bots almost never do.
 * Combined with accept-language and cookie presence, this catches
 * the vast majority of headless/automated traffic.
 */

const BOT_UA_PATTERN =
  /bot|crawler|spider|crawling|preview|facebookexternalhit|slackbot|discordbot|whatsapp|telegrambot|pinterest|embedly|quora|tumblr|redditbot|gpt|openai|anthropic|gemini|perplexity|cohere|googlebot|baiduspider|yandexbot|ccbot|duckduckbot|bingbot|python-requests|libcurl|scrapy|wget|curl\/|httrack|ahrefsbot|semrushbot|mj12bot|dotbot|petalbot|bytespider|sogou|applebot|dataforseo|zoominfobot|gptbot|claudebot|go-http-client|java\/|okhttp|axios|node-fetch|undici|headlesschrome|phantomjs|selenium|puppeteer|playwright/i;

/**
 * Check if a request looks like it comes from a bot.
 * Returns a reason string if bot detected, null if likely human.
 */
export function detectBot(headers: Headers): string | null {
  const ua = headers.get('user-agent') || '';

  // 1. No user agent at all
  if (!ua) return 'no_ua';

  // 2. Known bot UA pattern
  if (BOT_UA_PATTERN.test(ua)) return 'bot_ua';

  // 3. No accept-language header (real browsers always send this)
  if (!headers.get('accept-language')) return 'no_accept_language';

  // 4. Missing sec-fetch-dest header
  // All modern browsers (Chrome 76+, Firefox 90+, Safari 16.4+) send this.
  // Bots using older browser UAs or headless mode without full headers don't.
  const secFetchDest = headers.get('sec-fetch-dest');
  if (!secFetchDest) {
    // Exception: older Safari/mobile browsers may not send sec-fetch-*.
    // Only flag if the UA claims to be a modern browser version.
    const isModernChrome = /Chrome\/(?:7[6-9]|[89]\d|1\d\d)/.test(ua);
    const isModernFirefox = /Firefox\/(?:9\d|1\d\d)/.test(ua);
    if (isModernChrome || isModernFirefox) {
      return 'no_sec_fetch';
    }
  }

  // 5. Very short or suspicious user agents
  if (ua.length < 20) return 'short_ua';

  return null;
}

/**
 * Quick check for the middleware — same logic as detectBot but takes NextRequest-like headers.
 */
export function isBotRequest(headers: Headers): boolean {
  return detectBot(headers) !== null;
}
