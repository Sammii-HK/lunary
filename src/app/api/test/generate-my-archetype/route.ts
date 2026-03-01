/**
 * Test endpoint to generate archetype snapshot for current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateArchetypeSnapshot } from '@/lib/patterns/snapshot/generator';
import { savePatternSnapshot } from '@/lib/patterns/snapshot/storage';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email') || 'kellow.sammii@gmail.com';

    // Get user ID
    const userResult = await sql`
      SELECT id FROM "user" WHERE email = ${email} LIMIT 1
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult.rows[0].id;

    // Generate archetype snapshot
    const archetypeSnapshot = await generateArchetypeSnapshot(userId);

    if (!archetypeSnapshot) {
      return NextResponse.json({
        success: false,
        message: 'Not enough data to generate archetype snapshot',
        userId,
      });
    }

    // Save it
    const saved = await savePatternSnapshot(userId, archetypeSnapshot);

    return NextResponse.json({
      success: true,
      email,
      userId,
      saved,
      archetype: archetypeSnapshot,
    });
  } catch (error) {
    console.error('Error generating archetype:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
