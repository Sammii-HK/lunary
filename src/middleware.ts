import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

const camelToKebab = (str: string) =>
  str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');

const isProductionHost = (hostname: string) =>
  hostname === 'lunary.app' ||
  hostname === 'www.lunary.app' ||
  hostname.startsWith('admin.');

const ANON_ID_COOKIE = 'lunary_anon_id';
const AB_TEST_COOKIE = 'lunary_ab_tests';

// A/B test definitions: test name -> variants with weights
const AB_TESTS: Record<string, { variants: string[]; weights?: number[] }> = {
  'inline-cta-style': {
    variants: ['control', 'minimal', 'sparkles', 'card'],
    // Equal weights by default (25% each)
  },
};

// Simple hash function for deterministic variant assignment
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

// Assign variant deterministically based on user ID + test name
function assignVariant(
  userId: string,
  testName: string,
  test: { variants: string[]; weights?: number[] },
): string {
  const hash = hashString(`${userId}-${testName}`);
  const { variants, weights } = test;

  if (weights && weights.length === variants.length) {
    // Weighted assignment
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const normalized = hash % totalWeight;
    let cumulative = 0;
    for (let i = 0; i < variants.length; i++) {
      cumulative += weights[i];
      if (normalized < cumulative) return variants[i];
    }
  }

  // Equal weight assignment
  return variants[hash % variants.length];
}

const BOT_UA_PATTERN =
  /bot|crawler|spider|crawling|preview|facebookexternalhit|slackbot|discordbot|whatsapp|telegrambot|pinterest|embedly|quora|tumblr|redditbot|gpt|openai|anthropic|gemini|perplexity|cohere|googlebot|baiduspider|yandexbot|ccbot|duckduckbot|bingbot|python-requests|libcurl|scrapy|wget|curl\//i;

const shouldSkipTracking = (request: NextRequest, hostname: string) => {
  if (request.method !== 'GET') return true;

  const ua = request.headers.get('user-agent') || '';
  if (BOT_UA_PATTERN.test(ua)) return true;

  const acceptLang = request.headers.get('accept-language');
  if (!acceptLang) return true;

  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/admin')) return true;

  if (hostname.startsWith('admin.')) return true;

  const purpose = request.headers.get('purpose');
  if (purpose === 'prefetch') return true;

  if (request.headers.get('x-middleware-prefetch') === '1') return true;

  if (request.headers.get('next-router-prefetch') === '1') return true;

  return false;
};

type NormaliseResult = {
  pathname: string;
  changed: boolean;
};

function normalisePathname(pathname: string): NormaliseResult {
  const original = pathname;
  let p = pathname;

  // 1) decode early
  if (p.includes('%')) {
    try {
      p = decodeURIComponent(p);
    } catch {
      // leave as-is if invalid encoding
    }
  }

  // 2) replace spaces with hyphens
  if (p.includes(' ')) {
    p = p.replace(/ /g, '-');
  }

  // 3) trim trailing slashes (except root)
  p = p.replace(/\/+$/, '') || '/';

  // 4) normalise /grimoire segments
  if (p.startsWith('/grimoire/')) {
    const parts = p.split('/').filter(Boolean); // ['grimoire', ...]
    const normalisedParts = parts.map((seg, i) => {
      if (i === 0) return 'grimoire';
      // keep slug casing predictable + collapse camelCase
      return camelToKebab(seg).toLowerCase();
    });
    p = '/' + normalisedParts.join('/');
  } else {
    // outside /grimoire, just lowercase the path (safe for your use-case)
    // If you have case-sensitive non-grimoire routes, remove this.
    p = p.toLowerCase();
  }

  return { pathname: p, changed: p !== original };
}

function applyLegacyRedirects(pathname: string): string | null {
  let p = pathname;

  // One-off canonical
  if (p === '/grimoire/wheel-of-the-year/lammas-or-lughnasadh') {
    return '/grimoire/wheel-of-the-year/lammas';
  }

  // Tarot canonicalisation (run on already-normalised path)
  if (p.startsWith('/grimoire/tarot/')) {
    const parts = p.split('/').filter(Boolean); // ['grimoire','tarot',...]
    const suitSet = new Set(['cups', 'wands', 'swords', 'pentacles']);
    const suit = parts[2];

    // /grimoire/tarot/cups -> /grimoire/tarot/suits/cups
    if (parts.length === 3 && suit && suitSet.has(suit)) {
      return `/grimoire/tarot/suits/${suit}`;
    }

    // /grimoire/tarot/cups/ace-of-cups -> /grimoire/tarot/ace-of-cups
    if (parts.length >= 4 && suit && suitSet.has(suit)) {
      const card = parts[3];
      if (card) return `/grimoire/tarot/${card}`;
    }
  }

  // nothing else to map
  return null;
}

function buildRedirect(request: NextRequest, pathname: string, status = 301) {
  return NextResponse.redirect(new URL(pathname, request.url), status);
}

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname, searchParams } = request.nextUrl;

  const hostname =
    request.headers.get('host')?.split(':')[0].toLowerCase() ?? '';

  const isProd = isProductionHost(hostname);

  // PRODUCTION: www -> apex
  if (isProd && hostname === 'www.lunary.app') {
    const url = request.nextUrl.clone();
    url.hostname = 'lunary.app';
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  // PRODUCTION: force https
  if (isProd && request.headers.get('x-forwarded-proto') !== 'https') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  // Admin subdomain routing
  const isAdminSubdomain = hostname.startsWith('admin.');

  if (isProd && isAdminSubdomain) {
    if (
      !pathname.startsWith('/admin') &&
      !pathname.startsWith('/auth') &&
      !pathname.startsWith('/api')
    ) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === '/' ? '/admin' : `/admin${pathname}`;
      return NextResponse.rewrite(url);
    }
  } else {
    // PRODUCTION ONLY: block /admin on non-admin hosts
    // Local/dev/staging hosts should be allowed to use /admin directly.
    if (isProd && pathname.startsWith('/admin')) {
      return buildRedirect(request, '/', 302);
    }
  }

  // Normalise once
  const { pathname: normalisedPath } = normalisePathname(pathname);

  // Legacy special cases
  if (normalisedPath === '/$') return buildRedirect(request, '/', 301);

  if (normalisedPath === '/grimoire/guides/birth-chart-complete-guide-0') {
    return buildRedirect(
      request,
      '/grimoire/guides/birth-chart-complete-guide',
      301,
    );
  }

  // Grimoire ?item=foo -> /grimoire/foo
  if (normalisedPath === '/grimoire' && searchParams.has('item')) {
    const item = searchParams.get('item');
    if (item) {
      const slug = camelToKebab(item).toLowerCase();
      return buildRedirect(request, `/grimoire/${slug}`, 302);
    }
  }

  // Blog week legacy
  const blogWeekMatch = normalisedPath.match(/^\/blog\/week\/(\d+)-(\d{4})$/);
  if (blogWeekMatch) {
    return buildRedirect(
      request,
      `/blog/week/week-${blogWeekMatch[1]}-${blogWeekMatch[2]}`,
      301,
    );
  }

  // Apply legacy mappings after normalisation, so it catches %20, casing, etc.
  const legacy = applyLegacyRedirects(normalisedPath);
  const finalPath = legacy ?? normalisedPath;

  // Redirect if anything changed (including normalisation)
  if (finalPath !== pathname) {
    return buildRedirect(request, finalPath, 301);
  }

  const response = NextResponse.next();

  if (!shouldSkipTracking(request, hostname) && isProd) {
    let anonId = request.cookies.get(ANON_ID_COOKIE)?.value;

    if (!anonId) {
      anonId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
      response.cookies.set(ANON_ID_COOKIE, anonId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    // Assign A/B test variants (deterministic based on anonId)
    const existingTests = request.cookies.get(AB_TEST_COOKIE)?.value;
    let abTests: Record<string, string> = {};

    try {
      if (existingTests) {
        abTests = JSON.parse(existingTests);
      }
    } catch {
      // Invalid JSON, reset
    }

    // Assign variants for any missing tests
    let testsChanged = false;
    for (const [testName, testConfig] of Object.entries(AB_TESTS)) {
      if (!abTests[testName]) {
        abTests[testName] = assignVariant(anonId, testName, testConfig);
        testsChanged = true;
      }
    }

    if (testsChanged || !existingTests) {
      response.cookies.set(AB_TEST_COOKIE, JSON.stringify(abTests), {
        httpOnly: false, // Readable by client JS for tracking
        sameSite: 'lax',
        secure: isProd,
        path: '/',
        maxAge: 60 * 60 * 24 * 90, // 90 days
      });
    }

    const trackingUrl = new URL('/api/telemetry/pageview', request.url);
    const headers = new Headers();
    headers.set('content-type', 'application/json');
    headers.set('x-lunary-anon-id', anonId);

    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) headers.set('cookie', cookieHeader);

    const userAgent = request.headers.get('user-agent');
    if (userAgent) headers.set('user-agent', userAgent);

    const referer = request.headers.get('referer');
    if (referer) headers.set('referer', referer);

    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) headers.set('accept-language', acceptLanguage);

    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) headers.set('x-forwarded-for', forwardedFor);

    const realIp = request.headers.get('x-real-ip');
    if (realIp) headers.set('x-real-ip', realIp);

    // Track page_viewed (one per page per user per day)
    console.log('[middleware] Calling page_viewed:', { path: finalPath });
    event.waitUntil(
      fetch(trackingUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ path: finalPath }),
      })
        .then((res) => {
          if (!res.ok) {
            console.error('[middleware] page_viewed fetch failed:', res.status);
          }
          return res.json();
        })
        .catch((err) => {
          console.error('[middleware] page_viewed fetch error:', err.message);
        }),
    );

    // Track app_opened (one per user per UTC day) - server-side for reliability
    const appOpenedUrl = new URL('/api/telemetry/app-opened', request.url);
    console.log('[middleware] Calling app_opened:', { path: finalPath });
    event.waitUntil(
      fetch(appOpenedUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ path: finalPath }),
      })
        .then((res) => {
          if (!res.ok) {
            console.error('[middleware] app_opened fetch failed:', res.status);
          }
          return res.json();
        })
        .catch((err) => {
          console.error('[middleware] app_opened fetch error:', err.message);
        }),
    );

    // Track product_opened (one per authenticated user per UTC day)
    // Endpoint checks auth and skips if user not logged in
    const productOpenedUrl = new URL(
      '/api/telemetry/product-opened',
      request.url,
    );
    event.waitUntil(
      fetch(productOpenedUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ path: finalPath }),
      }),
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by API)
     * - _next (static files, images, etc.)
     * - Static files with extensions
     * - Common static assets
     */
    '/((?!api|_next|.*\\.[\\w]+$|favicon\\.ico|sw\\.js|manifest\\.json|robots\\.txt|sitemap).*)',
  ],
};
