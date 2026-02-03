import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  hasFeatureAccess,
  normalizePlanType,
  FEATURE_ACCESS,
} from '../../../../../utils/pricing';
import { YearlyForecast, generateYearlyForecast } from '@/lib/forecast/yearly';

export const dynamic = 'force-dynamic';

type YearlyForecastRow = {
  forecast: YearlyForecast;
  expires_at: Date | null;
};

const CACHE_HEADERS = {
  'Cache-Control':
    'private, s-maxage=300, stale-while-revalidate=600, must-revalidate',
};

async function getCachedYearlyForecast(
  year: number,
): Promise<YearlyForecast | null> {
  const dbUrl =
    process.env.POSTGRES_URL || process.env.DATABASE_URL || 'not-set';
  const dbPrefix = dbUrl.includes('localhost')
    ? 'local'
    : dbUrl.includes('vercel')
      ? 'vercel'
      : 'unknown';

  console.log(
    `[forecast/yearly] Checking cache for year ${year} (DB: ${dbPrefix})`,
  );

  try {
    const result = await sql<YearlyForecastRow>`
      SELECT forecast, expires_at
      FROM yearly_forecasts
      WHERE year = ${year}
      LIMIT 1
    `;

    console.log(
      `[forecast/yearly] Cache query returned ${result.rows.length} row(s) for year ${year}`,
    );

    const row = result.rows[0];
    if (!row) {
      console.log(`[forecast/yearly] No cached data found for year ${year}`);
      return null;
    }

    if (!row.forecast) {
      console.warn(
        `[forecast/yearly] Cached row exists but forecast field is null for year ${year}`,
      );
      return null;
    }

    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      console.log(
        `[forecast/yearly] Cached data expired for year ${year} (expires_at: ${row.expires_at})`,
      );
      return null;
    }

    const forecast = row.forecast;
    console.log(
      `[forecast/yearly] Cache HIT for year ${year}: ${forecast.majorTransits?.length || 0} transits, ${forecast.retrogrades?.length || 0} retrogrades, ${forecast.eclipses?.length || 0} eclipses, ${forecast.keyAspects?.length || 0} aspects`,
    );

    return forecast;
  } catch (error: any) {
    if (error?.code === '42P01') {
      console.warn(
        `[forecast/yearly] yearly_forecasts table missing (code: 42P01) - run setup-db to create it. Error: ${error.message}`,
      );
      return null;
    }
    console.error(
      `[forecast/yearly] Error querying cache for year ${year}:`,
      error,
    );
    throw error;
  }
}

async function cacheYearlyForecast(
  year: number,
  forecast: YearlyForecast,
  source: string,
): Promise<void> {
  const stats = {
    majorTransits: forecast.majorTransits.length,
    retrogrades: forecast.retrogrades.length,
    eclipses: forecast.eclipses.length,
    keyAspects: forecast.keyAspects.length,
  };

  const dbUrl =
    process.env.POSTGRES_URL || process.env.DATABASE_URL || 'not-set';
  const dbPrefix = dbUrl.includes('localhost')
    ? 'local'
    : dbUrl.includes('vercel')
      ? 'vercel'
      : 'unknown';

  console.log(
    `[forecast/yearly] Caching forecast for year ${year} (source: ${source}, DB: ${dbPrefix})`,
  );

  try {
    await sql`
      INSERT INTO yearly_forecasts (
        year,
        summary,
        forecast,
        stats,
        source,
        generated_at,
        expires_at,
        created_at,
        updated_at
      )
      VALUES (
        ${year},
        ${forecast.summary},
        ${JSON.stringify(forecast)}::jsonb,
        ${JSON.stringify(stats)}::jsonb,
        ${source},
        NOW(),
        NULL,
        NOW(),
        NOW()
      )
      ON CONFLICT (year)
      DO UPDATE SET
        summary = EXCLUDED.summary,
        forecast = EXCLUDED.forecast,
        stats = EXCLUDED.stats,
        source = EXCLUDED.source,
        generated_at = NOW(),
        expires_at = NULL,
        updated_at = NOW()
    `;
    console.log(
      `[forecast/yearly] Successfully cached forecast for year ${year} with stats:`,
      stats,
    );
  } catch (error: any) {
    if (error?.code === '42P01') {
      console.warn(
        `[forecast/yearly] yearly_forecasts table missing (code: 42P01) - skipping cache write. Error: ${error.message}`,
      );
      return;
    }
    console.error(
      `[forecast/yearly] Error caching forecast for year ${year}:`,
      error,
    );
    throw error;
  }
}

// Cache for 5 minutes - subscription checks are cached at Stripe route level
// Forecast generation is expensive, longer cache significantly reduces CPU
export const revalidate = 300;

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;
    const userPlanRaw = user.plan;
    const userEmail = user.email;

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear() + 1;

    if (!year || year < 2025 || year > 2100) {
      return NextResponse.json(
        { error: 'Valid year required (2025-2100)' },
        { status: 400 },
      );
    }

    // First, check database subscription
    const [subscriptionResult, conversionPlanResult] = await Promise.all([
      sql`
        SELECT plan_type, status, stripe_customer_id
        FROM subscriptions
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 1
      `,
      sql`
        SELECT plan_type
        FROM conversion_events
        WHERE user_id = ${userId}
          AND plan_type IS NOT NULL
          AND plan_type <> ''
        ORDER BY created_at DESC
        LIMIT 1
      `,
    ]);

    const subscription = subscriptionResult.rows[0];
    const conversionPlan = conversionPlanResult.rows[0]?.plan_type;

    let customerId = subscription?.stripe_customer_id;
    let planSource: 'session' | 'subscription' | 'conversion' | 'stripe' =
      'session';
    let planType = normalizePlanType(userPlanRaw);
    let subscriptionStatus:
      | 'free'
      | 'trial'
      | 'active'
      | 'cancelled'
      | 'past_due' = planType !== 'free' ? 'active' : 'free';
    if ((!planType || planType === 'free') && subscription?.plan_type) {
      const dbPlan = normalizePlanType(subscription.plan_type);
      if (dbPlan !== 'free') {
        planType = dbPlan;
        planSource = 'subscription';
        const rawStatus = subscription.status || 'free';
        subscriptionStatus =
          rawStatus === 'trialing'
            ? 'trial'
            : (rawStatus as typeof subscriptionStatus);
      }
    }

    if (
      (!planType || planType === 'free') &&
      conversionPlan &&
      normalizePlanType(conversionPlan) !== 'free'
    ) {
      planType = normalizePlanType(conversionPlan);
      planSource = 'conversion';
      subscriptionStatus = 'active';
    }

    // Use hardcoded baseUrl to prevent SSRF attacks
    const baseUrl = process.env.VERCEL
      ? 'https://lunary.app'
      : 'http://localhost:3000';

    // If we don't have a customer ID yet, try to find it via Stripe customer lookup using email
    if (!customerId && userEmail) {
      try {
        const customerLookup = await fetch(
          `${baseUrl}/api/stripe/find-customer`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail }),
            cache: 'no-store',
          },
        );

        if (customerLookup.ok) {
          const lookupData = await customerLookup.json();
          if (lookupData?.found && lookupData.customer?.id) {
            customerId = lookupData.customer.id;
            console.log(
              `[forecast/yearly] Found Stripe customer via email lookup: ${customerId}`,
            );
          }
        } else {
          console.warn(
            `[forecast/yearly] Failed to look up customer by email (${userEmail}): ${customerLookup.status}`,
          );
        }
      } catch (error) {
        console.error(
          '[forecast/yearly] Error while looking up Stripe customer by email:',
          error,
        );
      }
    }

    // Try to fetch from Stripe API for more accurate subscription data
    // This is especially important in preview deployments where DB might be stale

    if (customerId) {
      try {
        // Pass userId so get-subscription route can update database automatically
        const stripeResponse = await fetch(
          `${baseUrl}/api/stripe/get-subscription`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId, userId }),
            // Allow Next.js to cache for 5 minutes (matches Stripe route)
            next: { revalidate: 300 },
          },
        );

        if (stripeResponse.ok) {
          const stripeData = await stripeResponse.json();
          console.log(
            `[forecast/yearly] Stripe API response:`,
            JSON.stringify(stripeData, null, 2),
          );
          if (
            (stripeData.success || stripeData.hasSubscription) &&
            stripeData.subscription
          ) {
            const stripeSub = stripeData.subscription;
            // Normalize status: 'trialing' -> 'trial' for consistency
            const rawStripeStatus = stripeSub.status;
            subscriptionStatus =
              rawStripeStatus === 'trialing'
                ? 'trial'
                : (rawStripeStatus as typeof subscriptionStatus);
            const rawPlan = stripeSub.plan;
            planType = normalizePlanType(rawPlan);
            planSource = 'stripe';
            console.log(
              `[forecast/yearly] Fetched from Stripe: rawStatus=${rawStripeStatus}, status=${subscriptionStatus}, rawPlan=${rawPlan}, normalized=${planType}`,
            );
          } else {
            console.log(
              '[forecast/yearly] Stripe response missing subscription data, using database subscription',
              { stripeData },
            );
          }
        } else {
          // Check if Stripe is unavailable (503) - this is expected in preview/dev
          const stripeData =
            stripeResponse.status === 503
              ? await stripeResponse.json().catch(() => null)
              : null;

          if (stripeData?.useDatabaseFallback) {
            console.log(
              '[forecast/yearly] Stripe not configured in this environment, using database subscription',
            );
            // Continue with database subscription (already set above)
          } else {
            console.log(
              `[forecast/yearly] Stripe fetch failed: ${stripeResponse.status}, using database subscription`,
            );
            // Continue with database subscription (already set above)
          }
        }
      } catch (error) {
        console.error('[forecast/yearly] Failed to fetch from Stripe:', error);
        // Continue with database subscription (already set above)
      }
    }

    const normalizedPlan = normalizePlanType(planType);
    const isAnnualPlan = normalizedPlan === 'lunary_plus_ai_annual';
    const statusIsActive =
      subscriptionStatus === 'trial' || subscriptionStatus === 'active';

    if (planSource !== 'subscription' && normalizedPlan !== 'free') {
      subscriptionStatus = statusIsActive ? subscriptionStatus : 'active';
    }

    let hasAccess = false;
    if (isAnnualPlan) {
      hasAccess =
        FEATURE_ACCESS.lunary_plus_ai_annual.includes('yearly_forecast');
    } else {
      hasAccess = hasFeatureAccess(
        subscriptionStatus,
        normalizedPlan,
        'yearly_forecast',
      );
    }

    console.log(
      `[forecast/yearly] Access decision for user ${userId}: hasAccess=${hasAccess}, plan=${normalizedPlan}, planSource=${planSource}, status=${subscriptionStatus}`,
    );

    if (!hasAccess) {
      console.error(
        `[forecast/yearly] ACCESS DENIED - status: ${subscriptionStatus}, plan: ${planType}, normalized: ${normalizedPlan}`,
      );
      return NextResponse.json(
        {
          error:
            'Yearly cosmic forecast is available for Lunary+ Pro Annual subscribers',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    const cachedForecast = await getCachedYearlyForecast(year);
    if (cachedForecast) {
      console.log(
        `[forecast/yearly] ✅ CACHE HIT - Serving cached forecast for ${year} from yearly_forecasts table`,
      );
      return NextResponse.json(
        { success: true, forecast: cachedForecast },
        { headers: CACHE_HEADERS },
      );
    }

    console.log(
      `[forecast/yearly] ❌ CACHE MISS - Generating forecast for year ${year} on-demand`,
    );
    const forecast = await generateYearlyForecast(year);
    console.log(
      `[forecast/yearly] Generated forecast: ${forecast.majorTransits.length} transits, ${forecast.retrogrades.length} retrogrades, ${forecast.eclipses.length} eclipses, ${forecast.keyAspects.length} aspects`,
    );
    await cacheYearlyForecast(year, forecast, 'api');
    console.log(
      `[forecast/yearly] Cached newly generated forecast for year ${year}`,
    );

    return NextResponse.json(
      { success: true, forecast },
      { headers: CACHE_HEADERS },
    );
  } catch (error) {
    console.error('Failed to generate yearly forecast:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Please sign in to access yearly forecast' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Unable to generate yearly forecast' },
      { status: 500 },
    );
  }
}
