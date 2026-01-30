/**
 * Test endpoint for cosmic pattern detection
 * Usage: GET /api/test/patterns?userId=<email>
 *
 * This is a dev/test endpoint - should be removed or secured in production
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { validateEncryption } from '@/lib/encryption';
import { detectCosmicPatterns } from '@/lib/patterns/core/detector';
import {
  saveCosmicPatterns,
  getCosmicPatterns,
} from '@/lib/patterns/storage/secure-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');

    if (!userIdParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId parameter required',
          usage: 'GET /api/test/patterns?userId=<user-id>',
        },
        { status: 400 },
      );
    }

    const userId = userIdParam;

    // Test encryption
    console.log('🔐 Testing encryption...');
    const encryptionValid = validateEncryption();
    if (!encryptionValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Encryption validation failed',
        },
        { status: 500 },
      );
    }

    // Check data availability
    const tarotResult = await sql`
      SELECT COUNT(*) as count FROM tarot_readings
      WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '90 days'
    `;
    const tarotCount = parseInt(tarotResult.rows[0]?.count || '0');

    const journalResult = await sql`
      SELECT COUNT(*) as count FROM collections
      WHERE user_id = ${userId}
      AND category = 'journal'
      AND created_at >= NOW() - INTERVAL '90 days'
    `;
    const journalCount = parseInt(journalResult.rows[0]?.count || '0');

    console.log(
      `📊 Data availability: ${tarotCount} tarot pulls, ${journalCount} journal entries`,
    );

    // Detect patterns
    console.log('🔍 Detecting cosmic patterns...');
    const startTime = performance.now();

    const result = await detectCosmicPatterns(userId, {
      daysBack: 90,
      userTier: 'free',
    });

    const duration = performance.now() - startTime;

    // Save patterns if any found
    if (
      result.patterns.length > 0 &&
      result.patterns[0].type !== 'insufficient_data'
    ) {
      console.log('💾 Saving patterns to database...');
      await saveCosmicPatterns(userId, result.patterns);

      // Verify storage by retrieving
      const retrievedPatterns = await getCosmicPatterns(userId);
      console.log(
        `✅ Retrieved ${retrievedPatterns.length} encrypted patterns from database`,
      );
    }

    return NextResponse.json({
      success: true,
      test: {
        encryptionValid,
        detectionTime: `${duration.toFixed(0)}ms`,
        dataAvailable: {
          tarotPulls: tarotCount,
          journalEntries: journalCount,
        },
      },
      patterns: result.patterns,
      meta: result.meta,
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
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
