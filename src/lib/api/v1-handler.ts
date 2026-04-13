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

const PAID_TIERS = new Set<ApiTier>(['starter', 'developer', 'business']);

/**
 * Wrap a v1 API handler with API key auth + tier checking.
 * All requests require an API key (even free tier).
 * Free tier responses include attribution; paid tiers get white-label.
 */
export function v1Handler(
  minTier: TierRequirement,
  handler: (
    req: NextRequest,
    context: { tier: ApiTier; userId: string; keyPrefix: string },
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

      // Inject attribution for free tier, paid tiers get clean responses
      if (!PAID_TIERS.has(apiKey.tier)) {
        try {
          const body = await response.json();
          const attributed = {
            ...body,
            attribution: {
              text: 'Powered by Lunary',
              url: `https://lunary.app?utm_source=api&utm_medium=partner&utm_content=${apiKey.keyPrefix}`,
              required: true,
              remove_with_paid_plan: 'https://lunary.app/developers/dashboard',
            },
          };
          return NextResponse.json(attributed, {
            status: response.status,
            headers: response.headers,
          });
        } catch {
          // If response isn't JSON, return as-is
          return response;
        }
      }

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
