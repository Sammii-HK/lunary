import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { TAROT_SPREAD_MAP } from '@/constants/tarotSpreads';
import { generateSpreadReading } from '@/utils/tarot/spreadReading';
import {
  computeUsageSnapshot,
  getSubscription,
  isSpreadAccessible,
  mapRowToReading,
} from './shared';
import { auth } from '@/lib/auth';
import { formatTextArray } from '@/lib/postgres/formatTextArray';

export async function GET(request: NextRequest) {
  const demoUserId = request.headers.get('X-Demo-User');

  try {
    let userId: string;
    let userEmail: string | undefined;

    if (demoUserId && process.env.PERSONA_EMAIL) {
      // Demo mode: Look up REAL persona account from database
      console.log(
        '[Tarot API] Demo mode detected, PERSONA_EMAIL:',
        process.env.PERSONA_EMAIL,
      );

      try {
        const userResult = await sql`
          SELECT id, email FROM "user" WHERE email = ${process.env.PERSONA_EMAIL} LIMIT 1
        `;

        console.log('[Tarot API] User lookup result:', {
          found: userResult.rows.length > 0,
          rowCount: userResult.rows.length,
        });

        if (userResult.rows.length === 0) {
          console.error('[Tarot API] Persona account not found in database!');
          return NextResponse.json(
            {
              error: 'Persona account not found',
              details: 'Email not in database',
            },
            { status: 500 },
          );
        }

        userId = userResult.rows[0].id;
        userEmail = userResult.rows[0].email;
        console.log('[Tarot API] ✅ Using real persona:', {
          userId,
          userEmail,
        });
      } catch (dbError: any) {
        // Database not set up - return empty demo state
        if (dbError?.code === '42P01') {
          console.warn(
            '[Tarot API] Database tables not found - using fallback demo state',
          );

          const response = NextResponse.json({
            readings: [], // Empty - demo uses client-side data
            usage: {
              monthlyLimit: null,
              monthlyUsed: 0,
              historyWindowDays: null,
            },
            hasMore: false,
            nextCursor: null,
            spreadsUnlocked: Object.keys(TAROT_SPREAD_MAP), // Unlock all spreads in demo
          });

          // Aggressive caching for demo mode
          const now = new Date();
          const midnight = new Date(
            Date.UTC(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate() + 1,
              0,
              0,
              0,
              0,
            ),
          );
          const secondsUntilMidnight = Math.floor(
            (midnight.getTime() - now.getTime()) / 1000,
          );
          response.headers.set(
            'Cache-Control',
            `public, max-age=${secondsUntilMidnight}, s-maxage=${secondsUntilMidnight}`,
          );

          return response;
        }
        throw dbError;
      }
    } else {
      if (demoUserId && !process.env.PERSONA_EMAIL) {
        console.error('[Tarot API] Demo mode but PERSONA_EMAIL not set!');
      }
      // Normal mode: use session
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 },
        );
      }

      userId = session.user.id;
      userEmail = session.user.email;
    }
    const { searchParams } = new URL(request.url);

    const spreadSlug = searchParams.get('spread');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);
    const cursorParam = searchParams.get('cursor');
    const cursorDate =
      cursorParam && !Number.isNaN(Date.parse(cursorParam))
        ? new Date(cursorParam)
        : null;

    // Fetch REAL subscription from database (not mocked)
    const subscription = await getSubscription(userId, userEmail);
    const usage = await computeUsageSnapshot(userId, subscription);

    const historyCutoffDays = usage.historyWindowDays;
    const cutoffDate =
      subscription.plan === 'free'
        ? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        : historyCutoffDays && Number.isFinite(historyCutoffDays)
          ? new Date(Date.now() - historyCutoffDays * 24 * 60 * 60 * 1000)
          : null;

    const values: (string | number | boolean | null | undefined)[] = [userId];
    const whereClauses = [
      'user_id = $1',
      'archived_at IS NULL',
      'jsonb_array_length(cards) > 1', // Exclude single-card daily pulls
    ];

    if (spreadSlug) {
      values.push(spreadSlug);
      whereClauses.push(`spread_slug = $${values.length}`);
    }

    if (cursorDate) {
      values.push(cursorDate.toISOString());
      whereClauses.push(`created_at < $${values.length}`);
    }

    if (cutoffDate) {
      values.push(cutoffDate.toISOString());
      whereClauses.push(`created_at >= $${values.length}`);
    }

    values.push(limit + 1);
    const limitParamIndex = values.length;

    const query = `
        SELECT id,
               spread_slug,
               spread_name,
               plan_snapshot,
               cards,
               summary,
               highlights,
               journaling_prompts,
               notes,
               tags,
               metadata,
               ai_interpretation,
               created_at,
               updated_at
        FROM tarot_readings
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY created_at DESC
        LIMIT $${limitParamIndex}
      `;

    const rows = await sql.query(query, values);

    const readings = rows.rows.slice(0, limit).map(mapRowToReading);
    const hasMore = rows.rows.length > limit;
    const nextCursorRow = hasMore ? rows.rows[limit] : null;
    const nextCursor = nextCursorRow
      ? new Date(nextCursorRow.created_at).toISOString()
      : null;

    const spreadsUnlocked = Object.keys(TAROT_SPREAD_MAP).filter((slug) =>
      isSpreadAccessible(slug, subscription.plan),
    );

    const isDemoMode = !!demoUserId;
    const response = NextResponse.json({
      readings,
      usage,
      hasMore,
      nextCursor,
      spreadsUnlocked,
    });

    // Aggressive caching for demo mode - cache until UTC midnight
    if (isDemoMode) {
      const now = new Date();
      const midnight = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
          0,
          0,
          0,
          0,
        ),
      );
      const secondsUntilMidnight = Math.floor(
        (midnight.getTime() - now.getTime()) / 1000,
      );
      response.headers.set(
        'Cache-Control',
        `public, max-age=${secondsUntilMidnight}, s-maxage=${secondsUntilMidnight}`,
      );
    }

    return response;
  } catch (error) {
    console.error('[tarot/readings] GET failed:', error);
    console.error('[tarot/readings] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      demoMode: !!demoUserId,
      hasPersonaEmail: !!process.env.PERSONA_EMAIL,
    });

    // Try to return spreadsUnlocked even on error, based on subscription if available
    let spreadsUnlocked: string[] = [];
    try {
      // For demo mode, return all spreads as unlocked on error
      if (demoUserId && process.env.PERSONA_EMAIL) {
        console.log(
          '[tarot/readings] Demo mode error fallback - unlocking all spreads',
        );
        spreadsUnlocked = Object.keys(TAROT_SPREAD_MAP);
      } else {
        const session = await auth.api.getSession({ headers: request.headers });
        if (session?.user) {
          const userId = session.user.id;
          const userEmail = session.user.email;
          const subscription = await getSubscription(userId, userEmail);
          spreadsUnlocked = Object.keys(TAROT_SPREAD_MAP).filter((slug) =>
            isSpreadAccessible(slug, subscription.plan),
          );
        }
      }
    } catch (subError) {
      console.error(
        '[tarot/readings] Failed to get subscription for error response',
        subError,
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to load tarot readings',
        errorDetails: error instanceof Error ? error.message : 'Unknown error',
        spreadsUnlocked,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for demo mode header first
    const demoUserId = request.headers.get('X-Demo-User');

    let userId: string;
    let userEmail: string | undefined;

    if (demoUserId) {
      // Demo mode: use the specified demo user
      console.log('[Tarot API POST] Demo mode detected, blocking');
      // This should already be blocked by DemoModeProvider, but just in case
      return NextResponse.json(
        { error: 'Demo mode - cannot create new spreads' },
        { status: 403 },
      );
    }

    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    userId = session.user.id;
    userEmail = session.user.email;

    const bodyText = await request.text();
    if (!bodyText) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 },
      );
    }

    const data = JSON.parse(bodyText);
    const { spreadSlug, userName, seed, notes, tags } = data;

    if (!spreadSlug) {
      return NextResponse.json(
        { error: 'spreadSlug is required' },
        { status: 400 },
      );
    }

    const spread = TAROT_SPREAD_MAP[spreadSlug];
    if (!spread) {
      return NextResponse.json(
        { error: `Spread "${spreadSlug}" not found` },
        { status: 404 },
      );
    }

    const subscription = await getSubscription(userId, userEmail);

    console.log(`[tarot/readings] POST subscription check:`, {
      userId,
      userEmail,
      subscription_plan: subscription.plan,
      subscription_status: subscription.status,
      spreadSlug,
      spread_minimumPlan: spread.minimumPlan,
      isAccessible: isSpreadAccessible(spreadSlug, subscription.plan),
    });

    if (!isSpreadAccessible(spreadSlug, subscription.plan)) {
      return NextResponse.json(
        {
          error: 'This spread is locked for your current plan.',
          code: 'spread_locked',
          requiredPlan: spread.minimumPlan,
          currentPlan: subscription.plan,
        },
        { status: 403 },
      );
    }

    const usage = await computeUsageSnapshot(userId, subscription);

    if (
      usage.monthlyLimit !== null &&
      usage.monthlyUsed >= usage.monthlyLimit
    ) {
      return NextResponse.json(
        {
          error: 'Monthly reading limit reached for your plan.',
          code: 'limit_reached',
          usage,
        },
        { status: 403 },
      );
    }

    // Fetch user's birth chart and birthday for chart-based seeding
    let birthChart;
    let userBirthday;
    let userBirthLocation;
    let currentTransits;
    try {
      const profileResult = await sql`
        SELECT birth_chart, birthday, location
        FROM user_profiles
        WHERE user_id = ${userId}
        LIMIT 1
      `;
      if (profileResult.rows.length > 0) {
        birthChart = profileResult.rows[0].birth_chart;
        userBirthday = profileResult.rows[0].birthday;
        const location = profileResult.rows[0].location as Record<
          string,
          any
        > | null;
        userBirthLocation = location?.birthLocation;
      }

      // Get current transits for saving with the reading
      if (birthChart) {
        const { getAstrologicalChart } =
          await import('../../../../../utils/astrology/astrology');
        const { calculateTransitAspects } =
          await import('@/lib/astrology/transit-aspects');
        const { Observer } = await import('astronomy-engine');
        const { parseLocationToCoordinates } =
          await import('../../../../../utils/astrology/birthChart');

        const now = new Date();

        // Use user's birth location if available
        let observer: typeof Observer.prototype;
        if (userBirthLocation) {
          const coords = await parseLocationToCoordinates(userBirthLocation);
          if (coords) {
            observer = new Observer(coords.latitude, coords.longitude, 0);
          } else {
            observer = new Observer(51.4769, 0.0005, 0); // Default fallback
          }
        } else {
          observer = new Observer(51.4769, 0.0005, 0); // Default fallback
        }

        const transitsNow = getAstrologicalChart(now, observer);
        currentTransits = calculateTransitAspects(birthChart, transitsNow);
      }
    } catch (err) {
      // Non-critical - will fall back to regular seeding
      console.warn('[tarot/readings] Failed to fetch birth chart:', err);
    }

    const reading = generateSpreadReading({
      spreadSlug,
      userId,
      userName,
      seed,
      birthChart,
      userBirthday,
    });

    const cardsForStorage = reading.cards.map((item) => ({
      positionId: item.positionId,
      positionLabel: item.positionLabel,
      positionPrompt: item.positionPrompt,
      card: item.card,
      insight: item.insight,
    }));

    // Enhance metadata with transit aspects at time of pull
    const enhancedMetadata = {
      ...reading.metadata,
      transitAspects: currentTransits || null,
      transitCapturedAt: new Date().toISOString(),
    };

    const cleanedTags =
      Array.isArray(tags) && tags.length > 0
        ? tags.filter((tag: unknown): tag is string => typeof tag === 'string')
        : [];
    const tagsSqlValue =
      cleanedTags.length > 0 ? formatTextArray(cleanedTags) : null;

    const insertResult = await sql`
      INSERT INTO tarot_readings (
        user_id,
        spread_slug,
        spread_name,
        plan_snapshot,
        cards,
        summary,
        highlights,
        journaling_prompts,
        notes,
        tags,
        metadata
      ) VALUES (
        ${userId},
        ${reading.spreadSlug},
        ${reading.spreadName},
        ${subscription.plan},
        ${JSON.stringify(cardsForStorage)}::jsonb,
        ${reading.summary},
        ${JSON.stringify(reading.highlights)}::jsonb,
        ${JSON.stringify(reading.journalingPrompts)}::jsonb,
        ${notes || null},
        ${tagsSqlValue}::text[],
        ${JSON.stringify(enhancedMetadata)}::jsonb
      )
      RETURNING id,
                spread_slug,
                spread_name,
                plan_snapshot,
                cards,
                summary,
                highlights,
                journaling_prompts,
                notes,
                tags,
                metadata,
                ai_interpretation,
                created_at,
                updated_at
    `;

    const savedReading = mapRowToReading(insertResult.rows[0]);
    const updatedUsage = await computeUsageSnapshot(userId, subscription);

    // Increment tarot progress for multi-card spreads only (not daily single cards)
    const cardCount = cardsForStorage.length;
    if (cardCount > 1) {
      const isPro = subscription.plan !== 'free';
      try {
        const { incrementProgress } = await import('@/lib/progress/server');
        // Count 1 spread (not individual cards) for progress
        const progressResult = await incrementProgress(
          userId,
          'tarot',
          1, // Count spreads, not cards
          isPro,
        );
        if (progressResult.leveledUp) {
          console.log(
            `[tarot/readings] User ${userId} leveled up to tarot level ${progressResult.newLevel}`,
          );
        }
      } catch (progressError) {
        // Non-critical - don't fail the reading
        console.warn(
          '[tarot/readings] Failed to update progress:',
          progressError,
        );
      }
    }

    return NextResponse.json(
      {
        reading: savedReading,
        usage: updatedUsage,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[tarot/readings] POST failed', error);
    return NextResponse.json(
      {
        error: 'Failed to generate tarot spread',
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const data = await request.json();
    const { readingId, aiInterpretation } = data;

    if (!readingId) {
      return NextResponse.json(
        { error: 'readingId is required' },
        { status: 400 },
      );
    }

    if (typeof aiInterpretation !== 'string') {
      return NextResponse.json(
        { error: 'aiInterpretation must be a string' },
        { status: 400 },
      );
    }

    const result = await sql`
      UPDATE tarot_readings
      SET ai_interpretation = ${aiInterpretation},
          updated_at = NOW()
      WHERE id = ${readingId}::uuid
        AND user_id = ${userId}
      RETURNING id,
                spread_slug,
                spread_name,
                plan_snapshot,
                cards,
                summary,
                highlights,
                journaling_prompts,
                notes,
                tags,
                metadata,
                ai_interpretation,
                created_at,
                updated_at
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Reading not found or unauthorized' },
        { status: 404 },
      );
    }

    const updatedReading = mapRowToReading(result.rows[0]);

    return NextResponse.json({
      reading: updatedReading,
    });
  } catch (error) {
    console.error('[tarot/readings] PATCH failed', error);
    return NextResponse.json(
      {
        error: 'Failed to update tarot reading',
      },
      { status: 500 },
    );
  }
}
