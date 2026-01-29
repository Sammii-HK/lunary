/**
 * API endpoint for fetching pattern history
 * GET /api/patterns/history - Returns historical pattern snapshots
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { decryptJSON } from '@/lib/encryption';
import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import {
  getPatternHistory,
  getCurrentSnapshots,
} from '@/lib/patterns/snapshot/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;
    const searchParams = request.nextUrl.searchParams;
    const patternType = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const currentOnly = searchParams.get('current') === 'true';

    if (currentOnly) {
      // Get only the most recent snapshot for each type
      const currentSnapshots = await getCurrentSnapshots(userId);

      return NextResponse.json({
        success: true,
        current: currentSnapshots,
      });
    }

    // Get full history
    const history = await getPatternHistory(userId, patternType, limit);

    // Add metadata (generatedAt from database timestamp)
    const patternsResult = await sql`
      SELECT pattern_type, pattern_data, generated_at
      FROM journal_patterns
      WHERE user_id = ${userId}
        AND pattern_type IN ('life_themes', 'tarot_season', 'archetype', 'tarot_moon_phase', 'emotion_moon_phase')
        AND expires_at > NOW()
      ORDER BY generated_at DESC
      LIMIT ${limit}
    `;

    const snapshotsWithMeta = [];
    for (const row of patternsResult.rows) {
      const encryptedString = row.pattern_data.encrypted;
      if (encryptedString) {
        const decrypted = decryptJSON(encryptedString);
        snapshotsWithMeta.push({
          type: row.pattern_type,
          generatedAt: row.generated_at,
          data: decrypted,
        });
      }
    }

    // Group by pattern type for easier consumption
    const grouped: Record<string, any[]> = {};
    for (const snapshot of snapshotsWithMeta) {
      if (!grouped[snapshot.type]) {
        grouped[snapshot.type] = [];
      }
      grouped[snapshot.type].push(snapshot);
    }

    // Count by type
    const byType = Object.entries(grouped).map(([type, items]) => ({
      type,
      count: items.length,
    }));

    return NextResponse.json({
      success: true,
      userId,
      totalSnapshots: snapshotsWithMeta.length,
      byType,
      snapshots: grouped,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to view patterns' },
        { status: 401 },
      );
    }

    console.error('Error fetching pattern history:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
