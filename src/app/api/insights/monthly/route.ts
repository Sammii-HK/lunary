import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  hasFeatureAccess,
  normalizePlanType,
} from '../../../../../utils/pricing';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    // Check subscription access
    const subscriptionResult = await sql`
      SELECT status, plan_type FROM subscriptions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1
    `;
    const subscription = subscriptionResult.rows[0];
    // Normalize status: 'trialing' -> 'trial' for consistency with hasFeatureAccess
    const rawStatus = subscription?.status || 'free';
    const subscriptionStatus = rawStatus === 'trialing' ? 'trial' : rawStatus;
    // Normalize plan type to ensure correct feature access
    const planType = normalizePlanType(subscription?.plan_type);
    const hasAccess = hasFeatureAccess(
      subscriptionStatus,
      planType,
      'monthly_insights',
    );

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Monthly insights feature requires Lunary+ subscription',
          upgradeRequired: true,
        },
        { status: 403 },
      );
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Get frequent tarot cards from last 30 days
    // Cards is a JSONB array, so we need to unnest it first
    const tarotResult = await sql`
      SELECT 
        card_data->'card'->>'name' as card_name,
        COUNT(*) as count
      FROM tarot_readings,
      jsonb_array_elements(cards) as card_data
      WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '30 days'
      AND archived_at IS NULL
      AND card_data->'card'->>'name' IS NOT NULL
      GROUP BY card_data->'card'->>'name'
      ORDER BY count DESC
      LIMIT 5
    `;

    const frequentCards = tarotResult.rows
      .map((row) => ({
        name: row.card_name,
        count: parseInt(row.count),
      }))
      .filter((card) => card.name); // Filter out any null/undefined names

    // Get mood trends (if available in the future)
    // For now, we'll derive a simple trend from card patterns
    const moodTrend =
      frequentCards.length > 0
        ? null // Will be calculated from card meanings if needed
        : null;

    // Get themes from recent tarot readings
    const themesResult = await sql`
      SELECT DISTINCT tags
      FROM tarot_readings
      WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '30 days'
      AND archived_at IS NULL
      AND tags IS NOT NULL
      LIMIT 5
    `;

    const themes: string[] = [];
    themesResult.rows.forEach((row) => {
      if (row.tags && Array.isArray(row.tags)) {
        themes.push(...row.tags);
      }
    });

    return NextResponse.json({
      insight: {
        month,
        year,
        frequentCards,
        moodTrend: moodTrend || null,
        themes: [...new Set(themes)].slice(0, 5),
      },
    });
  } catch (error) {
    console.error('[Monthly Insights] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly insights' },
      { status: 500 },
    );
  }
}
