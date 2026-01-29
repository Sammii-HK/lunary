import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const personaEmail = process.env.PERSONA_EMAIL;

    if (!personaEmail) {
      return NextResponse.json({
        error: 'PERSONA_EMAIL not set',
        env: process.env.NODE_ENV,
      });
    }

    // Look up user
    const userResult = await sql`
      SELECT id, email, name, created_at
      FROM users
      WHERE email = ${personaEmail}
      LIMIT 1
    `;

    // Look up subscription if user exists
    let subscription = null;
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;
      const subResult = await sql`
        SELECT plan_type, status, created_at
        FROM subscriptions
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      subscription = subResult.rows[0] || null;

      // Count tarot spreads
      const spreadsResult = await sql`
        SELECT COUNT(*) as count
        FROM tarot_readings
        WHERE user_id = ${userId}
        AND archived_at IS NULL
      `;

      return NextResponse.json({
        success: true,
        personaEmail,
        user: userResult.rows[0],
        subscription,
        spreadsCount: spreadsResult.rows[0]?.count || 0,
      });
    }

    return NextResponse.json({
      error: 'Persona user not found',
      personaEmail,
      searchedFor: personaEmail,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
