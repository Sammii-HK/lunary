import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { analyzeJournalPatterns } from '@/lib/journal/pattern-analyzer';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const daysBack = parseInt(searchParams.get('days') || '30', 10);

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required. Usage: ?email=user@example.com' },
        { status: 400 },
      );
    }

    console.log('🔍 Looking up user by email:', email);

    // Get user ID from email
    const userResult = await sql`
      SELECT id FROM "user"
      WHERE email = ${email}
      LIMIT 1
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: `No user found with email: ${email}` },
        { status: 404 },
      );
    }

    const userId = userResult.rows[0].id;
    console.log('✅ Found user ID:', userId);

    // Check if user has journal entries
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const entriesCount = await sql`
      SELECT COUNT(*) as count
      FROM collections
      WHERE user_id = ${userId}
      AND category = 'journal'
      AND created_at >= ${cutoffDate.toISOString()}
    `;

    const journalCount = parseInt(entriesCount.rows[0].count);
    console.log(
      `📝 User has ${journalCount} journal entries in last ${daysBack} days`,
    );

    if (journalCount === 0) {
      return NextResponse.json({
        success: true,
        userId,
        email,
        message: 'No journal entries found in the specified time period',
        journalEntriesCount: 0,
        patterns: [],
      });
    }

    // Check if user has birth chart (needed for transit/house patterns)
    const birthChartResult = await sql`
      SELECT birth_chart FROM user_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    const hasBirthChart =
      birthChartResult.rows.length > 0 &&
      birthChartResult.rows[0].birth_chart !== null;
    console.log(`🌟 Birth chart available: ${hasBirthChart}`);

    // Run pattern analysis
    console.log('🔍 Running pattern analysis...');
    const result = await analyzeJournalPatterns(userId, daysBack);

    console.log('✅ Pattern analysis complete');
    console.log('Patterns found:', result.patterns.length);

    // Group patterns by type for summary
    const patternsByType: Record<string, number> = {};
    for (const pattern of result.patterns) {
      patternsByType[pattern.type] = (patternsByType[pattern.type] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      userId,
      email,
      journalEntriesCount: journalCount,
      hasBirthChart,
      daysAnalyzed: daysBack,
      patternsFound: result.patterns.length,
      patternsByType,
      patterns: result.patterns,
      generatedAt: result.generatedAt,
    });
  } catch (error) {
    console.error('❌ Error during pattern analysis:', error);
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
