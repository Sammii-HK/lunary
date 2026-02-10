import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { sql } from '@vercel/postgres';
import { getGlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';
import {
  calculateCosmicScore,
  type CosmicScoreResult,
} from '@/utils/cosmic-score';
import { hasFeatureAccess, type FeatureKey } from '../../../../utils/pricing';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user profile with birth chart
    const profileResult = await sql`
      SELECT birthday, birth_chart
      FROM user_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    const profile = profileResult.rows[0];
    if (!profile?.birthday || !profile?.birth_chart) {
      return NextResponse.json(
        { error: 'Birth chart required for cosmic score' },
        { status: 400 },
      );
    }

    const birthChart = Array.isArray(profile.birth_chart)
      ? profile.birth_chart
      : [];
    if (birthChart.length === 0) {
      return NextResponse.json(
        { error: 'Valid birth chart required' },
        { status: 400 },
      );
    }

    // Fetch subscription for feature gating
    const subResult = await sql`
      SELECT status, plan_type
      FROM subscriptions
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    const sub = subResult.rows[0];

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // Check if we have a cached score for today in daily_horoscopes
    const cached = await sql`
      SELECT horoscope_data
      FROM daily_horoscopes
      WHERE user_id = ${userId}
        AND horoscope_date = ${dateStr}
      LIMIT 1
    `;

    let score: CosmicScoreResult;

    if (cached.rows[0]?.horoscope_data?.cosmicScore) {
      score = cached.rows[0].horoscope_data.cosmicScore;
    } else {
      // Calculate fresh score
      const cosmicData = await getGlobalCosmicData(now);
      if (!cosmicData) {
        return NextResponse.json(
          { error: 'Cosmic data unavailable' },
          { status: 503 },
        );
      }

      score = calculateCosmicScore(cosmicData, birthChart, now);

      // Cache in daily_horoscopes JSON
      if (cached.rows[0]?.horoscope_data) {
        const existingData = cached.rows[0].horoscope_data;
        await sql`
          UPDATE daily_horoscopes
          SET horoscope_data = ${JSON.stringify({ ...existingData, cosmicScore: score })}::jsonb
          WHERE user_id = ${userId} AND horoscope_date = ${dateStr}
        `;
      } else {
        await sql`
          INSERT INTO daily_horoscopes (user_id, horoscope_date, horoscope_data, generated_at)
          VALUES (${userId}, ${dateStr}, ${JSON.stringify({ cosmicScore: score })}::jsonb, NOW())
          ON CONFLICT (user_id, horoscope_date)
          DO UPDATE SET
            horoscope_data = daily_horoscopes.horoscope_data || ${JSON.stringify({ cosmicScore: score })}::jsonb
        `;
      }
    }

    // Gate detailed data behind paid tier
    const isPaid = hasFeatureAccess(
      sub?.status ?? 'free',
      sub?.plan_type ?? 'free',
      'cosmic_score_detailed' as FeatureKey,
    );

    if (isPaid) {
      return NextResponse.json(score);
    }

    // Free tier: overall, headline, dominantEnergy only
    return NextResponse.json({
      overall: score.overall,
      headline: score.headline,
      dominantEnergy: score.dominantEnergy,
    });
  } catch (error) {
    console.error('[CosmicScore] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
