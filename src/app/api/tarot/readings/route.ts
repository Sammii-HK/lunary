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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }

    const spreadSlug = searchParams.get('spread');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);
    const cursorParam = searchParams.get('cursor');
    const cursorDate =
      cursorParam && !Number.isNaN(Date.parse(cursorParam))
        ? new Date(cursorParam)
        : null;

    const subscription = await getSubscription(userId);
    const usage = await computeUsageSnapshot(userId, subscription);

    const historyCutoffDays = usage.historyWindowDays;
    const cutoffDate =
      historyCutoffDays && Number.isFinite(historyCutoffDays)
        ? new Date(Date.now() - historyCutoffDays * 24 * 60 * 60 * 1000)
        : null;

    const rows = await sql`
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
      WHERE user_id = ${userId}
        AND archived_at IS NULL
        ${spreadSlug ? sql`AND spread_slug = ${spreadSlug}` : sql``}
        ${cursorDate ? sql`AND created_at < ${cursorDate}` : sql``}
        ${cutoffDate ? sql`AND created_at >= ${cutoffDate}` : sql``}
      ORDER BY created_at DESC
      LIMIT ${limit + 1}
    `;

    const readings = rows.rows.slice(0, limit).map(mapRowToReading);
    const hasMore = rows.rows.length > limit;
    const nextCursorRow = hasMore ? rows.rows[limit] : null;
    const nextCursor = nextCursorRow
      ? new Date(nextCursorRow.created_at).toISOString()
      : null;

    return NextResponse.json({
      readings,
      usage,
      hasMore,
      nextCursor,
      spreadsUnlocked: Object.keys(TAROT_SPREAD_MAP).filter((slug) =>
        isSpreadAccessible(slug, subscription.plan),
      ),
    });
  } catch (error) {
    console.error('[tarot/readings] GET failed', error);
    return NextResponse.json(
      {
        error: 'Failed to load tarot readings',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    if (!bodyText) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 },
      );
    }

    const data = JSON.parse(bodyText);
    const { userId, spreadSlug, userName, seed, notes, tags } = data;

    if (!userId || !spreadSlug) {
      return NextResponse.json(
        { error: 'userId and spreadSlug are required' },
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

    const subscription = await getSubscription(userId);

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
        ${Array.isArray(tags) && tags.length > 0 ? tags : null},
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
