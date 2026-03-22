import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        'Moon pack auto-generation is paused. Packs are now curated manually.',
    },
    { status: 503 },
  );
}
