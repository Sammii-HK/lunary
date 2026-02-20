import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { getFeatureAdoption } from '@/lib/analytics/kpis';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

const familyToEventType = (
  family: string | null,
): 'app_opened' | 'product_opened' | 'grimoire_viewed' => {
  switch (family) {
    case 'product':
    default:
      // Default to product_opened for feature adoption metrics
      // Product MAU (signed-in users) is the correct denominator for product features
      return 'product_opened';
    case 'grimoire':
      return 'grimoire_viewed';
    case 'site':
      return 'app_opened';
  }
};

/**
 * Feature Adoption endpoint for insights
 * Uses pre-computed daily_metrics for 99% cost reduction
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);
    const family = searchParams.get('family');
    const eventType = familyToEventType(family);

    // FAST PATH: Query pre-computed adoption rates from daily_metrics table
    const result = await sql.query(
      `SELECT
        signed_in_product_mau as mau,
        dashboard_adoption,
        horoscope_adoption,
        tarot_adoption,
        chart_adoption,
        guide_adoption,
        ritual_adoption
      FROM daily_metrics
      WHERE metric_date >= $1 AND metric_date <= $2
      ORDER BY metric_date DESC
      LIMIT 1`,
      [
        range.start.toISOString().split('T')[0],
        range.end.toISOString().split('T')[0],
      ],
    );

    if (result.rows.length > 0) {
      // Got pre-computed metrics - FAST!
      const row = result.rows[0];
      const mau = Number(row.mau || 0);

      const features = [
        {
          event_type: 'daily_dashboard_viewed',
          users: Math.round((Number(row.dashboard_adoption || 0) / 100) * mau),
          adoption_rate: Number(row.dashboard_adoption || 0),
        },
        {
          event_type: 'personalized_horoscope_viewed',
          users: Math.round((Number(row.horoscope_adoption || 0) / 100) * mau),
          adoption_rate: Number(row.horoscope_adoption || 0),
        },
        {
          event_type: 'tarot_drawn',
          users: Math.round((Number(row.tarot_adoption || 0) / 100) * mau),
          adoption_rate: Number(row.tarot_adoption || 0),
        },
        {
          event_type: 'chart_viewed',
          users: Math.round((Number(row.chart_adoption || 0) / 100) * mau),
          adoption_rate: Number(row.chart_adoption || 0),
        },
        {
          event_type: 'astral_chat_used',
          users: Math.round((Number(row.guide_adoption || 0) / 100) * mau),
          adoption_rate: Number(row.guide_adoption || 0),
        },
        {
          event_type: 'ritual_completed',
          users: Math.round((Number(row.ritual_adoption || 0) / 100) * mau),
          adoption_rate: Number(row.ritual_adoption || 0),
        },
      ];

      const response = NextResponse.json({
        source: 'daily_metrics',
        family: family ?? 'site',
        event_type: eventType,
        range,
        mau,
        features,
      });
      response.headers.set(
        'Cache-Control',
        `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}, stale-while-revalidate=${ANALYTICS_CACHE_TTL_SECONDS * 2}`,
      );
      return response;
    }

    // FALLBACK: Live query if no snapshot exists
    const adoption = await getFeatureAdoption(range, { eventType });
    const response = NextResponse.json({
      source: 'database',
      family: family ?? 'site',
      event_type: eventType,
      range,
      ...adoption,
    });
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
    );
    return response;
  } catch (error) {
    console.error('[analytics/feature-adoption] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
