import { NextResponse } from 'next/server';
import { analyzeJournalPatterns } from '@/lib/journal/pattern-analyzer';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Capture console.error calls to return them in response
const capturedErrors: string[] = [];
const originalConsoleError = console.error;

export async function GET() {
  capturedErrors.length = 0; // Clear previous errors

  // Override console.error temporarily
  console.error = (...args: unknown[]) => {
    originalConsoleError(...args);
    capturedErrors.push(args.map((a) => String(a)).join(' '));
  };

  try {
    const testUserId = 'test-pattern-user-001';

    console.log('🔍 Running pattern analysis for test user:', testUserId);

    const result = await analyzeJournalPatterns(testUserId, 30);

    console.log('✅ Pattern analysis complete');
    console.log('Patterns found:', result.patterns.length);

    // Restore console.error
    console.error = originalConsoleError;

    return NextResponse.json({
      success: true,
      testUserId,
      patternsFound: result.patterns.length,
      patterns: result.patterns,
      generatedAt: result.generatedAt,
      capturedErrors: capturedErrors.length > 0 ? capturedErrors : undefined,
    });
  } catch (error) {
    // Restore console.error
    console.error = originalConsoleError;

    console.error('❌ Error during pattern analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        capturedErrors: capturedErrors.length > 0 ? capturedErrors : undefined,
      },
      { status: 500 },
    );
  }
}
