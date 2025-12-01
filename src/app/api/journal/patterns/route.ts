import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/ai/auth';
import {
  getPatterns,
  analyzeJournalPatterns,
  savePatterns,
} from '@/lib/journal/pattern-analyzer';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    let patterns = await getPatterns(user.id);

    if (patterns.length === 0) {
      const result = await analyzeJournalPatterns(user.id, 30);
      if (result.patterns.length > 0) {
        await savePatterns(user.id, result.patterns);
        patterns = result.patterns;
      }
    }

    return NextResponse.json({
      success: true,
      patterns,
    });
  } catch (error) {
    console.error('Error fetching journal patterns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patterns' },
      { status: 500 },
    );
  }
}
