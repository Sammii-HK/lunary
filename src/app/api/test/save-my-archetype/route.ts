/**
 * Test endpoint to force-save archetype snapshot for current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateArchetypeSnapshot } from '@/lib/patterns/snapshot/generator';
import { sql } from '@vercel/postgres';
import { encryptJSON } from '@/lib/encryption';

export async function GET(request: NextRequest) {
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
      });
    }

    // Force save it without change detection
    const encryptedData = encryptJSON(archetypeSnapshot);
    const jsonbData = JSON.stringify({ encrypted: encryptedData });

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    await sql`
      INSERT INTO journal_patterns (
        user_id,
        pattern_type,
        pattern_data,
        generated_at,
        expires_at
      ) VALUES (
        ${userId},
        'archetype',
        ${jsonbData}::jsonb,
        NOW(),
        ${expiresAt.toISOString()}
      )
    `;

    return NextResponse.json({
      success: true,
      saved: true,
      email,
      archetype: archetypeSnapshot,
    });
  } catch (error) {
    console.error('Error saving archetype:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
