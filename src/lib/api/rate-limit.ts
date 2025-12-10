import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, incrementApiKeyUsage, ApiTier } from './keys';

interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: number;
}

const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

export function getRateLimitHeaders(
  info: RateLimitInfo,
): Record<string, string> {
  return {
    'X-RateLimit-Limit': info.limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, info.remaining).toString(),
    'X-RateLimit-Reset': info.reset.toString(),
  };
}

export async function withApiKeyAuth(
  request: NextRequest,
  handler: (
    req: NextRequest,
    apiKey: { tier: ApiTier; userId: string },
  ) => Promise<NextResponse>,
): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      {
        error: 'Missing or invalid Authorization header',
        message:
          'Please provide an API key in the Authorization header: Bearer lun_xxx',
        docs: 'https://lunary.app/developers',
      },
      { status: 401 },
    );
  }

  const apiKey = authHeader.slice(7);
  const validation = await validateApiKey(apiKey);

  if (!validation.valid) {
    return NextResponse.json(
      {
        error: 'Invalid API key',
        message: validation.error,
        docs: 'https://lunary.app/developers',
      },
      { status: 401 },
    );
  }

  const { apiKey: keyData } = validation;
  if (!keyData) {
    return NextResponse.json(
      { error: 'API key validation failed' },
      { status: 500 },
    );
  }

  const cacheKey = keyData.key_hash;
  const now = Date.now();
  const windowMs = 60 * 1000;

  let rateData = rateLimitCache.get(cacheKey);

  if (!rateData || rateData.resetAt < now) {
    rateData = { count: 0, resetAt: now + windowMs };
    rateLimitCache.set(cacheKey, rateData);
  }

  rateData.count++;

  const rateLimitInfo: RateLimitInfo = {
    limit: keyData.rate_limit,
    remaining: keyData.rate_limit - rateData.count,
    reset: Math.ceil(rateData.resetAt / 1000),
  };

  if (rateData.count > keyData.rate_limit) {
    const response = NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `You have exceeded your rate limit of ${keyData.rate_limit} requests per minute`,
        retryAfter: Math.ceil((rateData.resetAt - now) / 1000),
      },
      { status: 429 },
    );

    Object.entries(getRateLimitHeaders(rateLimitInfo)).forEach(
      ([key, value]) => {
        response.headers.set(key, value);
      },
    );

    return response;
  }

  await incrementApiKeyUsage(keyData.key_hash);

  const response = await handler(request, {
    tier: keyData.tier as ApiTier,
    userId: keyData.user_id,
  });

  Object.entries(getRateLimitHeaders(rateLimitInfo)).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  response.headers.set(
    'X-Monthly-Requests-Used',
    (keyData.requests + 1).toString(),
  );
  response.headers.set(
    'X-Monthly-Requests-Limit',
    keyData.request_limit.toString(),
  );

  return response;
}

export function withPublicRateLimit(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: { maxRequests?: number; windowMs?: number } = {},
): Promise<NextResponse> {
  const { maxRequests = 100, windowMs = 60 * 1000 } = options;

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const cacheKey = `public:${ip}`;
  const now = Date.now();

  let rateData = rateLimitCache.get(cacheKey);

  if (!rateData || rateData.resetAt < now) {
    rateData = { count: 0, resetAt: now + windowMs };
    rateLimitCache.set(cacheKey, rateData);
  }

  rateData.count++;

  const rateLimitInfo: RateLimitInfo = {
    limit: maxRequests,
    remaining: maxRequests - rateData.count,
    reset: Math.ceil(rateData.resetAt / 1000),
  };

  if (rateData.count > maxRequests) {
    const response = NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Free tier is limited to ${maxRequests} requests per minute. Get an API key for higher limits.`,
        docs: 'https://lunary.app/developers',
        retryAfter: Math.ceil((rateData.resetAt - now) / 1000),
      },
      { status: 429 },
    );

    Object.entries(getRateLimitHeaders(rateLimitInfo)).forEach(
      ([key, value]) => {
        response.headers.set(key, value);
      },
    );

    return Promise.resolve(response);
  }

  return handler(request).then((response) => {
    Object.entries(getRateLimitHeaders(rateLimitInfo)).forEach(
      ([key, value]) => {
        response.headers.set(key, value);
      },
    );
    return response;
  });
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitCache.entries()) {
    if (value.resetAt < now) {
      rateLimitCache.delete(key);
    }
  }
}, 60 * 1000);
