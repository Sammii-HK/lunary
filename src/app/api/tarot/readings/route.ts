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

const toTextArrayLiteral = (values: string[]): string =>
  `{${values.map((value) => `"${value.replace(/"/g, '\\"')}"`).join(',')}}`;

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const { searchParams } = new URL(request.url);

    const spreadSlug = searchParams.get('spread');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);
    const cursorParam = searchParams.get('cursor');
    const cursorDate =
      cursorParam && !Number.isNaN(Date.parse(cursorParam))
        ? new Date(cursorParam)
        : null;

    const subscription = await getSubscription(userId, userEmail);
    const usage = await computeUsageSnapshot(userId, subscription);

    const historyCutoffDays = usage.historyWindowDays;
    const cutoffDate =
      historyCutoffDays && Number.isFinite(historyCutoffDays)
        ? new Date(Date.now() - historyCutoffDays * 24 * 60 * 60 * 1000)
        : null;

    const values: (string | number | boolean | null | undefined)[] = [userId];
    const whereClauses = ['user_id = $1', 'archived_at IS NULL'];

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

    console.log(`[tarot/readings] GET response for user ${userId}:`, {
      subscription_plan: subscription.plan,
      subscription_status: subscription.status,
      spreads_unlocked_count: spreadsUnlocked.length,
      total_spreads: Object.keys(TAROT_SPREAD_MAP).length,
      usage_limit: usage.monthlyLimit,
      usage_used: usage.monthlyUsed,
    });

    return NextResponse.json({
      readings,
      usage,
      hasMore,
      nextCursor,
      spreadsUnlocked,
    });
  } catch (error) {
    console.error('[tarot/readings] GET failed', error);

    // Try to return spreadsUnlocked even on error, based on subscription if available
    let spreadsUnlocked: string[] = [];
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      if (session?.user) {
        const userId = session.user.id;
        const userEmail = session.user.email;
        const subscription = await getSubscription(userId, userEmail);
        spreadsUnlocked = Object.keys(TAROT_SPREAD_MAP).filter((slug) =>
          isSpreadAccessible(slug, subscription.plan),
        );
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
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

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

    if (!isSpreadAccessible(spreadSlug, subscription.plan)) {
      return NextResponse.json(
        {
          error: 'This spread is locked for your current plan.',
          code: 'spread_locked',
          requiredPlan: spread.minimumPlan,
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

    const reading = generateSpreadReading({
      spreadSlug,
      userId,
      userName,
      seed,
    });

    const cardsForStorage = reading.cards.map((item) => ({
      positionId: item.positionId,
      positionLabel: item.positionLabel,
      positionPrompt: item.positionPrompt,
      card: item.card,
      insight: item.insight,
    }));

    const tagsSqlValue =
      Array.isArray(tags) && tags.length > 0 ? toTextArrayLiteral(tags) : null;

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
        ${JSON.stringify(reading.metadata)}::jsonb
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
                created_at,
                updated_at
    `;

    const savedReading = mapRowToReading(insertResult.rows[0]);
    const updatedUsage = await computeUsageSnapshot(userId, subscription);

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
