import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const today = new Date().toISOString().split('T')[0];

    // Get today's rituals
    const rituals = await sql`
      SELECT * FROM daily_rituals
      WHERE user_id = ${user.id} AND ritual_date = ${today}
      ORDER BY ritual_type
    `;

    // Get active intention
    const intention = await sql`
      SELECT id, title, content, created_at FROM collections
      WHERE user_id = ${user.id}
      AND category = 'intention'
      AND content->>'status' = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      rituals: rituals.rows,
      activeIntention: intention.rows[0]
        ? {
            id: intention.rows[0].id,
            text: intention.rows[0].content?.text,
            category: intention.rows[0].content?.intentionCategory,
            createdAt: intention.rows[0].created_at,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching daily rituals:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const {
      ritualType,
      mood,
      moodMoonPhase,
      gratitude,
      intentionReviewed,
      intentionOutcome,
      dreamIntention,
    } = body;

    if (!ritualType || !['morning', 'evening'].includes(ritualType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ritual type' },
        { status: 400 },
      );
    }

    const today = new Date().toISOString().split('T')[0];

    if (ritualType === 'evening') {
      // Validate evening fields
      if (!mood) {
        return NextResponse.json(
          { success: false, error: 'Mood is required for evening ritual' },
          { status: 400 },
        );
      }

      await sql`
        INSERT INTO daily_rituals (user_id, ritual_date, ritual_type, mood, mood_moon_phase, gratitude, intention_reviewed, intention_outcome, dream_intention)
        VALUES (${user.id}, ${today}, 'evening', ${mood}, ${moodMoonPhase || null}, ${gratitude || null}, ${intentionReviewed || false}, ${intentionOutcome || null}, ${dreamIntention || null})
        ON CONFLICT (user_id, ritual_date, ritual_type)
        DO UPDATE SET
          mood = EXCLUDED.mood,
          mood_moon_phase = EXCLUDED.mood_moon_phase,
          gratitude = EXCLUDED.gratitude,
          intention_reviewed = EXCLUDED.intention_reviewed,
          intention_outcome = EXCLUDED.intention_outcome,
          dream_intention = EXCLUDED.dream_intention
      `;

      // Record in ritual_habits for streak tracking
      await sql`
        INSERT INTO ritual_habits (user_id, habit_date, ritual_type, completed, completion_time)
        VALUES (${user.id}, ${today}, 'evening', true, NOW())
        ON CONFLICT (user_id, habit_date, ritual_type) DO NOTHING
      `;

      // Track ritual progress
      try {
        const { incrementProgress } = await import('@/lib/progress/server');
        const subResult = await sql`
          SELECT status FROM subscriptions WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 1
        `;
        const isPro = ['active', 'trial', 'trialing'].includes(
          subResult.rows[0]?.status,
        );
        await incrementProgress(user.id, 'ritual', 1, isPro);
      } catch (progressError) {
        console.warn('[Rituals] Failed to track progress:', progressError);
      }

      // Update intention status if reviewed
      if (intentionReviewed && intentionOutcome) {
        try {
          const activeIntention = await sql`
            SELECT id, content FROM collections
            WHERE user_id = ${user.id} AND category = 'intention' AND content->>'status' = 'active'
            ORDER BY created_at DESC LIMIT 1
          `;
          if (activeIntention.rows[0]) {
            const currentContent = activeIntention.rows[0].content;
            const updatedContent = {
              ...currentContent,
              status:
                intentionOutcome === 'manifested' ||
                intentionOutcome === 'released'
                  ? intentionOutcome
                  : currentContent.status,
              ...(intentionOutcome === 'manifested'
                ? { manifestedAt: new Date().toISOString() }
                : {}),
              ...(intentionOutcome === 'released'
                ? { releasedAt: new Date().toISOString() }
                : {}),
            };
            await sql`
              UPDATE collections SET content = ${JSON.stringify(updatedContent)}::jsonb, updated_at = NOW()
              WHERE id = ${activeIntention.rows[0].id} AND user_id = ${user.id}
            `;
          }
        } catch (intentionError) {
          console.warn('[Rituals] Failed to update intention:', intentionError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving daily ritual:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
