import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;
    const body = await request.json();
    const { stepsCompleted, skipped } = body;

    await sql`
      INSERT INTO onboarding_completion (user_id, steps_completed, skipped, completed_at, updated_at)
      VALUES (${userId}, ${JSON.stringify(stepsCompleted || [])}::TEXT[], ${skipped || false}, NOW(), NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET
        steps_completed = ${JSON.stringify(stepsCompleted || [])}::TEXT[],
        skipped = ${skipped || false},
        completed_at = CASE WHEN ${skipped || false} THEN onboarding_completion.completed_at ELSE NOW() END,
        updated_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Onboarding] Error tracking completion:', error);
    return NextResponse.json(
      { error: 'Failed to track completion' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    const result = await sql`
      SELECT steps_completed, skipped, completed_at
      FROM onboarding_completion
      WHERE user_id = ${userId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({
        completed: false,
        stepsCompleted: [],
        skipped: false,
      });
    }

    const row = result.rows[0];
    return NextResponse.json({
      completed: !!row.completed_at,
      stepsCompleted: row.steps_completed || [],
      skipped: row.skipped || false,
    });
  } catch (error) {
    console.error('[Onboarding] Error fetching completion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch completion' },
      { status: 500 },
    );
  }
}
