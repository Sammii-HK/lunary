import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  hasFeatureAccess,
  normalizePlanType,
  FEATURE_ACCESS,
} from '../../../../../utils/pricing';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  calculateRealAspects,
  checkSignIngress,
  checkRetrogradeEvents,
  checkSeasonalEvents,
} from '../../../../../utils/astrology/cosmic-og';
import { Observer } from 'astronomy-engine';
import dayjs from 'dayjs';

const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

// Cache for 5 minutes - subscription checks are cached at Stripe route level
// Forecast generation is expensive, longer cache significantly reduces CPU
export const revalidate = 300;

interface YearlyForecast {
  year: number;
  majorTransits: Array<{
    date: string;
    event: string;
    description: string;
    significance: string;
  }>;
  eclipses: Array<{
    date: string;
    type: 'solar' | 'lunar';
    sign: string;
    description: string;
  }>;
  retrogrades: Array<{
    planet: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  keyAspects: Array<{
    date: string;
    aspect: string;
    planets: string[];
    description: string;
  }>;
  summary: string;
}

function calculateEclipses(year: number): YearlyForecast['eclipses'] {
  const eclipses: YearlyForecast['eclipses'] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const moonPhase = getAccurateMoonPhase(currentDate);
    const positions = getRealPlanetaryPositions(currentDate, DEFAULT_OBSERVER);

    if (
      moonPhase.isSignificant &&
      (moonPhase.name === 'New Moon' || moonPhase.name === 'Full Moon')
    ) {
      eclipses.push({
        date: currentDate.toISOString().split('T')[0],
        type: moonPhase.name === 'New Moon' ? 'solar' : 'lunar',
        sign: positions.moon?.sign || 'Unknown',
        description: `${moonPhase.name === 'New Moon' ? 'Solar' : 'Lunar'} Eclipse in ${positions.moon?.sign || 'Unknown'} - ${moonPhase.energy || 'A powerful cosmic event'}`,
      });
    }

    currentDate = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  }

  return eclipses.slice(0, 6);
}

async function generateYearlyForecast(
  year: number,
  userBirthday?: string,
): Promise<YearlyForecast> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const majorTransits: YearlyForecast['majorTransits'] = [];
  const retrogrades: YearlyForecast['retrogrades'] = [];
  const keyAspects: YearlyForecast['keyAspects'] = [];

  let currentDate = new Date(startDate);
  const checkedDates = new Set<string>();

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];

    if (checkedDates.has(dateStr)) {
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      continue;
    }
    checkedDates.add(dateStr);

    const positions = getRealPlanetaryPositions(currentDate, DEFAULT_OBSERVER);
    const aspects = calculateRealAspects(positions);
    const ingresses = checkSignIngress(positions, currentDate);
    const retrogradeEvents = checkRetrogradeEvents(positions);

    retrogradeEvents.forEach((event) => {
      if (
        event.type === 'starts' &&
        !retrogrades.find(
          (r) => r.planet === event.planet && r.startDate === dateStr,
        )
      ) {
        retrogrades.push({
          planet: event.planet || 'Unknown',
          startDate: dateStr,
          endDate: '',
          description: `${event.planet} retrograde begins`,
        });
      }
    });

    aspects
      .filter((a) => a.priority >= 8)
      .forEach((aspect) => {
        keyAspects.push({
          date: dateStr,
          aspect: aspect.aspect || '',
          planets: [aspect.planet1 || '', aspect.planet2 || ''],
          description: aspect.description || '',
        });

        majorTransits.push({
          date: dateStr,
          event: aspect.aspect || '',
          description: aspect.description || '',
          significance: `Major ${aspect.aspect} between ${aspect.planet1} and ${aspect.planet2}`,
        });
      });

    currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  const eclipses = calculateEclipses(year);

  const summary = `Your ${year} cosmic forecast reveals ${majorTransits.length} major planetary transits, ${retrogrades.length} planetary retrogrades, ${eclipses.length} eclipses, and ${keyAspects.length} significant aspects. This year brings transformative energies and opportunities for growth.`;

  return {
    year,
    majorTransits: majorTransits.slice(0, 20),
    eclipses,
    retrogrades: retrogrades.slice(0, 10),
    keyAspects: keyAspects.slice(0, 20),
    summary,
  };
}

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
    let rawStatus = subscription?.status || 'free';
    let subscriptionStatus = rawStatus === 'trialing' ? 'trial' : rawStatus;
    let planType = normalizePlanType(subscription?.plan_type);
    let customerId = subscription?.stripe_customer_id;

    const conversionPlan = conversionPlanResult.rows[0]?.plan_type;
    const planOverrideSources = [
      userPlanRaw,
      subscription?.plan_type,
      conversionPlan,
      conversionPlan === 'yearly' ? 'yearly' : undefined,
      subscription?.plan_type === 'yearly' ? 'yearly' : undefined,
    ].filter(Boolean) as string[];

    const normalizedUserPlan =
      planOverrideSources
        .map((value) => normalizePlanType(value))
        .find((plan) => plan && plan !== 'free' && plan !== 'lunary_plus') ||
      (userPlanRaw ? normalizePlanType(userPlanRaw) : 'free');

    const userHasAnnualOverride =
      normalizedUserPlan === 'lunary_plus_ai_annual' ||
      planOverrideSources.some((plan) => plan === 'yearly');

    console.log(
      `[forecast/yearly] User ${userId} plan override check: session=${userPlanRaw}, subscriptionPlan=${subscription?.plan_type}, conversionPlan=${conversionPlan}, normalizedOverride=${normalizedUserPlan}, override=${userHasAnnualOverride}`,
    );

    if (userHasAnnualOverride) {
      planType = normalizedUserPlan;
      if (subscriptionStatus === 'free' || !subscriptionStatus) {
        subscriptionStatus = 'active';
      }
    }

    // If we don't have a customer ID yet, try to find it via Stripe customer lookup using email
    if (!customerId && userEmail) {
      try {
        const customerLookup = await fetch(
          `${request.nextUrl.origin}/api/stripe/find-customer`,
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
          `${request.nextUrl.origin}/api/stripe/get-subscription`,
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
              rawStripeStatus === 'trialing' ? 'trial' : rawStripeStatus;
            const rawPlan = stripeSub.plan;
            planType = normalizePlanType(rawPlan);

            // CRITICAL: If Stripe says lunary_plus_ai_annual, use it directly
            // Don't let database override Stripe data
            if (
              rawPlan === 'lunary_plus_ai_annual' ||
              planType === 'lunary_plus_ai_annual'
            ) {
              planType = 'lunary_plus_ai_annual';
            }
            // Database is automatically updated by get-subscription route

            const immediateAccessCheck = hasFeatureAccess(
              subscriptionStatus,
              planType,
              'yearly_forecast',
            );
            console.log(
              `[forecast/yearly] Fetched from Stripe: rawStatus=${rawStripeStatus}, status=${subscriptionStatus}, rawPlan=${rawPlan}, normalized=${planType}, hasAccess=${immediateAccessCheck}`,
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

    // Debug logging to understand what's happening
    const normalizedPlan = normalizePlanType(planType);
    console.log(
      `[forecast/yearly] Final check - subscriptionStatus: ${subscriptionStatus}, planType: ${planType}, normalized: ${normalizedPlan}`,
    );
    console.log(
      `[forecast/yearly] Checking access - status is trial/active: ${subscriptionStatus === 'trial' || subscriptionStatus === 'active'}, plan is annual: ${normalizedPlan === 'lunary_plus_ai_annual' || planType === 'lunary_plus_ai_annual'}`,
    );

    // Defensive check: if plan is lunary_plus_ai_annual and status is trial/active, always grant access
    // This matches the client-side hook logic
    let hasAccess = false;
    let accessSource: 'user_plan_override' | 'subscription_logic' =
      'subscription_logic';

    if (userHasAnnualOverride) {
      hasAccess =
        FEATURE_ACCESS.lunary_plus_ai_annual.includes('yearly_forecast');
      accessSource = 'user_plan_override';
      console.log(
        `[forecast/yearly] Granting access via user plan override (raw=${userPlanRaw}, normalized=${normalizedUserPlan})`,
      );
    }

    if (!hasAccess) {
      // Check both normalized and raw plan type
      const isAnnualPlan =
        normalizedPlan === 'lunary_plus_ai_annual' ||
        planType === 'lunary_plus_ai_annual' ||
        planType === 'yearly';
      const isValidStatus =
        subscriptionStatus === 'trial' ||
        subscriptionStatus === 'active' ||
        subscriptionStatus === 'trialing';

      if (isAnnualPlan && isValidStatus) {
        hasAccess =
          FEATURE_ACCESS.lunary_plus_ai_annual.includes('yearly_forecast');
        accessSource = 'subscription_logic';
        console.log(
          `[forecast/yearly] Defensive check passed - annual plan (${planType}/${normalizedPlan}) with valid status (${subscriptionStatus}), hasAccess: ${hasAccess}`,
        );
      } else {
        // Fall back to standard hasFeatureAccess check
        hasAccess = hasFeatureAccess(
          subscriptionStatus,
          planType,
          'yearly_forecast',
        );
        accessSource = 'subscription_logic';
        console.log(
          `[forecast/yearly] Standard hasFeatureAccess result: ${hasAccess} for feature 'yearly_forecast' (status: ${subscriptionStatus}, plan: ${planType})`,
        );
      }
    }

    console.log(
      `[forecast/yearly] Access decision for user ${userId}: hasAccess=${hasAccess}, source=${accessSource}, subscriptionStatus=${subscriptionStatus}, planType=${planType}, normalizedUserPlan=${normalizedUserPlan}`,
    );

    if (!hasAccess) {
      console.error(
        `[forecast/yearly] ACCESS DENIED - status: ${subscriptionStatus}, plan: ${planType}, normalized: ${normalizedPlan}`,
      );
      return NextResponse.json(
        {
          error:
            'Yearly cosmic forecast is available for Lunary+ AI Annual subscribers',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    const userProfileResult = await sql`
      SELECT birthday
      FROM accounts
      WHERE id = ${userId}
      LIMIT 1
    `;

    const userBirthday = userProfileResult.rows[0]?.birthday || undefined;

    const forecast = await generateYearlyForecast(year, userBirthday);

    return NextResponse.json(
      { success: true, forecast },
      {
        headers: {
          // Cache for 5 minutes with stale-while-revalidate
          // Significantly reduces CPU - users can force refresh via button
          'Cache-Control':
            'private, s-maxage=300, stale-while-revalidate=600, must-revalidate',
        },
      },
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
