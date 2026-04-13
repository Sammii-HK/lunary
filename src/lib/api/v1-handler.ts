import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth } from './rate-limit';
import { ApiTier } from './keys';

type TierRequirement = 'free' | 'starter' | 'developer' | 'business';

const TIER_LEVELS: Record<ApiTier, number> = {
  free: 0,
  starter: 1,
  developer: 2,
  business: 3,
};

/**
 * Wrap a v1 API handler with API key auth + tier checking.
 * Free-tier endpoints allow unauthenticated access with IP rate limiting.
 */
export function v1Handler(
  minTier: TierRequirement,
  handler: (
    req: NextRequest,
    context: { tier: ApiTier; userId: string },
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest) => {
    return withApiKeyAuth(request, async (req, apiKey) => {
      if (TIER_LEVELS[apiKey.tier] < TIER_LEVELS[minTier]) {
        return NextResponse.json(
          {
            error: 'Tier upgrade required',
            message: `This endpoint requires the ${minTier} tier or above. Your current tier is ${apiKey.tier}.`,
            upgrade: 'https://lunary.app/developers/dashboard',
          },
          { status: 403 },
        );
      }

      const response = await handler(req, apiKey);

      response.headers.set(
        'Cache-Control',
        'public, s-maxage=300, stale-while-revalidate=600',
      );

      return response;
    });
  };
}

/** Parse optional ISO date param, default to now */
export function parseDateParam(request: NextRequest): Date {
  const dateParam = new URL(request.url).searchParams.get('date');
  if (!dateParam) return new Date();

  const parsed = new Date(dateParam);
  if (isNaN(parsed.getTime())) return new Date();
  return parsed;
}

/** Standard JSON success response */
export function apiResponse(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

/** Standard JSON error response */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}
