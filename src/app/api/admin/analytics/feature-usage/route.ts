import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    features: [],
    heatmap: [],
    note: 'Feature usage tracking is now handled by PostHog. View detailed feature analytics in the PostHog dashboard.',
  });
}
