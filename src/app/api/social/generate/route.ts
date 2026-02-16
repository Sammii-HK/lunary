import { NextRequest, NextResponse } from 'next/server';
import {
  generateSocialAssets,
  getAyrsharePayload,
} from '@/lib/social/pipeline';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { week, substackUrl, includeVoiceover = false } = body;

    if (week === undefined) {
      return NextResponse.json({ error: 'week is required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

    const assets = await generateSocialAssets(week, baseUrl, {
      generateVoiceover: includeVoiceover,
      substackUrl,
    });

    const ayrsharePayload = getAyrsharePayload(assets);

    return NextResponse.json({
      success: true,
      assets,
      ayrshare: ayrsharePayload,
    });
  } catch (error) {
    console.error('Social generation error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate social assets',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const week = request.nextUrl.searchParams.get('week');

  if (!week) {
    return NextResponse.json(
      { error: 'week parameter required' },
      { status: 400 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

  try {
    const assets = await generateSocialAssets(parseInt(week), baseUrl, {
      generateVoiceover: false,
    });

    return NextResponse.json({
      week: parseInt(week),
      images: assets.images,
      captions: assets.captions,
      hashtags: assets.hashtags,
      platforms: assets.platforms,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 },
    );
  }
}
