import { NextResponse } from 'next/server';
import { analyzeJournalPatterns } from '@/lib/journal/pattern-analyzer';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET() {
  try {
    const testUserId = 'test-pattern-user-001';

    console.log('🔍 Running pattern analysis for test user:', testUserId);

    const result = await analyzeJournalPatterns(testUserId, 30);

    console.log('✅ Pattern analysis complete');
    console.log('Patterns found:', result.patterns.length);

    return NextResponse.json({
      success: true,
      testUserId,
      patternsFound: result.patterns.length,
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
