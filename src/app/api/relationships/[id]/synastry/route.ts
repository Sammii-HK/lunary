import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import { calculateSynastry } from '@/lib/astrology/synastry';
import type { BirthChartData } from '../../../../../../utils/astrology/birthChart';
import { ensureRelationshipChartFresh } from '../../../../../../utils/astrology/regenerateRelationshipChart';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id: profileId } = await params;

    // Get user's birth chart
    const userResult = await sql`
      SELECT birth_chart FROM user_profiles
      WHERE user_id = ${user.id}
    `;

    if (userResult.rows.length === 0 || !userResult.rows[0].birth_chart) {
      return NextResponse.json(
        {
          error:
            'Your birth chart is required for synastry. Please add your birth details in your profile.',
        },
        { status: 400 },
      );
    }

    const userBirthChart = userResult.rows[0].birth_chart as BirthChartData[];

    // Get relationship profile's birth chart (with version column fallback)
    let profileResult;
    try {
      profileResult = await sql`
        SELECT id, birthday, birth_time, birth_location, birth_chart, birth_chart_version, name FROM relationship_profiles
        WHERE id = ${profileId}::uuid AND user_id = ${user.id}
      `;
    } catch {
      // birth_chart_version column may not exist yet
      profileResult = await sql`
        SELECT id, birthday, birth_time, birth_location, birth_chart, name FROM relationship_profiles
        WHERE id = ${profileId}::uuid AND user_id = ${user.id}
      `;
    }

    if (profileResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Relationship profile not found' },
        { status: 404 },
      );
    }

    const profile = profileResult.rows[0];

    // Regenerate chart if stale, and invalidate synastry cache if chart changed
    let freshChart: BirthChartData[] | null = null;
    let regenerated = false;
    try {
      const regenResult = await ensureRelationshipChartFresh({
        id: profile.id,
        birthday: profile.birthday,
        birth_time: profile.birth_time,
        birth_location: profile.birth_location,
        birth_chart: profile.birth_chart as BirthChartData[] | null,
        birth_chart_version: profile.birth_chart_version ?? undefined,
      });
      freshChart = regenResult.chart;
      regenerated = regenResult.regenerated;
    } catch {
      // Regeneration failed entirely — use existing chart
    }

    if (regenerated) {
      // Chart was regenerated — cached synastry is invalid
      try {
        await sql`DELETE FROM synastry_reports WHERE relationship_profile_id = ${profileId}::uuid`;
      } catch (cacheError) {
        console.warn(
          '[Synastry] Failed to invalidate stale cache:',
          cacheError,
        );
      }
    }

    const profileBirthChart =
      freshChart ?? (profile.birth_chart as BirthChartData[] | null);

    if (!profileBirthChart) {
      return NextResponse.json(
        {
          error:
            'Birth chart is required for synastry. Please add birth details to this profile.',
        },
        { status: 400 },
      );
    }

    // Check for cached synastry report
    const cachedResult = await sql`
      SELECT compatibility_score, synastry_aspects, element_balance, modality_balance, analysis_summary
      FROM synastry_reports
      WHERE user_id = ${user.id} AND relationship_profile_id = ${profileId}::uuid
      ORDER BY calculated_at DESC
      LIMIT 1
    `;

    if (cachedResult.rows.length > 0) {
      const cached = cachedResult.rows[0];
      return NextResponse.json({
        profileName: profile.name,
        compatibilityScore: cached.compatibility_score,
        aspects: cached.synastry_aspects,
        elementBalance: cached.element_balance,
        modalityBalance: cached.modality_balance,
        summary: cached.analysis_summary,
        cached: true,
      });
    }

    // Calculate synastry
    const synastryResult = calculateSynastry(userBirthChart, profileBirthChart);

    // Store the result
    await sql`
      INSERT INTO synastry_reports (
        user_id, relationship_profile_id, compatibility_score,
        synastry_aspects, element_balance, modality_balance, analysis_summary
      )
      VALUES (
        ${user.id},
        ${profileId}::uuid,
        ${synastryResult.compatibilityScore},
        ${JSON.stringify(synastryResult.aspects)}::jsonb,
        ${JSON.stringify(synastryResult.elementBalance)}::jsonb,
        ${JSON.stringify(synastryResult.modalityBalance)}::jsonb,
        ${synastryResult.summary}
      )
    `;

    return NextResponse.json({
      profileName: profile.name,
      compatibilityScore: synastryResult.compatibilityScore,
      aspects: synastryResult.aspects,
      elementBalance: synastryResult.elementBalance,
      modalityBalance: synastryResult.modalityBalance,
      summary: synastryResult.summary,
      cached: false,
    });
  } catch (error) {
    console.error('[Synastry] Error calculating synastry:', error);
    return NextResponse.json(
      { error: 'Failed to calculate synastry' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Force recalculation by deleting cached report
  try {
    const user = await requireUser(request);
    const { id: profileId } = await params;

    await sql`
      DELETE FROM synastry_reports
      WHERE user_id = ${user.id} AND relationship_profile_id = ${profileId}::uuid
    `;

    // Redirect to GET to calculate fresh
    return GET(request, { params });
  } catch (error) {
    console.error('[Synastry] Error recalculating synastry:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate synastry' },
      { status: 500 },
    );
  }
}
