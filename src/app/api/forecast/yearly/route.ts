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
            'Yearly cosmic forecast is available for Lunary+ AI Annual subscribers',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    let userBirthday = user.birthday;
    if (!userBirthday) {
      try {
        const userProfileResult = await sql`
          SELECT birthday
          FROM accounts
          WHERE id = ${userId}
          LIMIT 1
        `;
        userBirthday = userProfileResult.rows[0]?.birthday || undefined;
      } catch (dbError: any) {
        if (dbError?.code !== '42P01') {
          throw dbError;
        }
        console.warn(
          '[forecast/yearly] accounts table missing in this environment - continuing without birthday',
        );
      }
    }

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
