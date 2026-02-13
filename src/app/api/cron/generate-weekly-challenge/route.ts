import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getGlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';
import { generateChallenge } from '@/utils/challenges/challenge-generator';

export async function GET() {
  try {
    // Get current Monday
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const weekStart = monday.toISOString().split('T')[0];

    // Check if challenge already exists for this week
    const existing = await sql`
      SELECT id FROM weekly_challenges WHERE week_start = ${weekStart}
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Challenge already exists for this week',
        challengeId: existing.rows[0].id,
      });
    }

    // Get cosmic data for Monday
    const cosmicData = await getGlobalCosmicData(monday);
    if (!cosmicData) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch cosmic data' },
        { status: 500 },
      );
    }

    // Generate challenge from cosmic data
    const result = generateChallenge(cosmicData);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate challenge' },
        { status: 500 },
      );
    }

    const { transitKey, template } = result;

    // Insert the challenge
    const inserted = await sql`
      INSERT INTO weekly_challenges (week_start, transit_key, challenge_title, challenge_description, daily_prompts)
      VALUES (
        ${weekStart},
        ${transitKey},
        ${template.title},
        ${template.description},
        ${JSON.stringify(template.dailyPrompts)}::jsonb
      )
      RETURNING id
    `;

    // Send push notification
    try {
      const { broadcastNativePush } =
        await import('@/lib/notifications/native-push-sender');
      await broadcastNativePush({
        title: "This week's Cosmic Challenge is live",
        body: template.title,
        data: { deeplink: '/app', action: 'weekly_challenge' },
      });
    } catch (pushError) {
      console.warn('[Challenge Cron] Failed to send push:', pushError);
    }

    return NextResponse.json({
      success: true,
      challengeId: inserted.rows[0].id,
      transitKey,
      title: template.title,
    });
  } catch (error) {
    console.error('[Challenge Cron] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
