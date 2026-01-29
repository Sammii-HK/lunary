/**
 * Test endpoint to view pattern snapshots for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { decryptJSON } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email') || 'kellow.sammii@gmail.com';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get user ID
    const userResult = await sql`
      SELECT id FROM "user" WHERE email = ${email} LIMIT 1
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult.rows[0].id;

    // Get pattern snapshots
    const patternsResult = await sql`
      SELECT pattern_type, pattern_data, generated_at
      FROM journal_patterns
      WHERE user_id = ${userId}
        AND pattern_type IN ('life_themes', 'tarot_season', 'tarot_moon_phase', 'emotion_moon_phase')
      ORDER BY generated_at DESC
      LIMIT ${limit}
    `;

    const snapshots = [];
    for (const row of patternsResult.rows) {
      try {
        const encryptedString = row.pattern_data.encrypted;
        if (encryptedString) {
          const decrypted = decryptJSON(encryptedString);
          snapshots.push({
            type: row.pattern_type,
            generatedAt: row.generated_at,
            data: decrypted,
          });
        }
      } catch (error) {
        console.error('Failed to decrypt pattern:', error);
      }
    }

    // Group by type
    const grouped: Record<string, any[]> = {};
    for (const snapshot of snapshots) {
      if (!grouped[snapshot.type]) {
        grouped[snapshot.type] = [];
      }
      grouped[snapshot.type].push(snapshot);
    }

    return NextResponse.json({
      success: true,
      email,
      userId,
      totalSnapshots: snapshots.length,
      byType: Object.entries(grouped).map(([type, items]) => ({
        type,
        count: items.length,
      })),
      snapshots: grouped,
    });
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
