import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Verify cron request
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Daily cron job started at:', new Date().toISOString());

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://lunary.app';

    console.log('📅 Publishing post for date:', dateStr);

    // Fetch cosmic content
    const cosmicResponse = await fetch(
      `${baseUrl}/api/og/cosmic-post?date=${dateStr}`,
    );

    if (!cosmicResponse.ok) {
      throw new Error(
        `Failed to fetch cosmic content: ${cosmicResponse.status}`,
      );
    }

    const cosmicContent = await cosmicResponse.json();

    // Simple hashtag selection
    const themes = [
      ['#tarot', '#dailytarot', '#tarotreading', '#divination'],
      ['#horoscope', '#astrology', '#zodiac', '#planetary'],
      ['#mooncycles', '#moonphases', '#lunar', '#celestial'],
    ];

    const seed = today.getDate();
    const selectedHashtags = themes.map(
      (theme, i) => theme[(seed + i) % theme.length],
    );

    // Format post content with hashtags
    const socialContent = [
      ...cosmicContent.highlights.slice(0, 3),
      '',
      cosmicContent.horoscopeSnippet,
      '',
      cosmicContent.callToAction,
      '',
      selectedHashtags.join(' '),
    ].join('\n');

    // Publish immediately (no scheduling delay)
    const postData = {
      accountGroupId: process.env.SUCCULENT_ACCOUNT_GROUP_ID,
      content: socialContent,
      platforms: ['instagram', 'x', 'threads',],
      scheduledDate: new Date().toISOString(), // Publish now
      media: [
        {
          type: 'image',
          url: `${baseUrl}/api/og/cosmic?date=${dateStr}`,
          alt: `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance.`,
        },
      ],
    };

    // Send to existing single post scheduler
    const schedulerUrl = `${baseUrl}/api/schedule-posts/single`;
    const response = await fetch(schedulerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postData,
        succulentApiUrl: 'https://app.succulent.social/api/posts',
        testMode: false,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Daily cron job completed successfully');
      return NextResponse.json({
        success: true,
        message: 'Daily post published immediately',
        date: dateStr,
        hashtags: selectedHashtags.join(' '),
        publishedAt: new Date().toISOString(),
      });
    } else {
      throw new Error(result.error || 'Scheduler failed');
    }
  } catch (error) {
    console.error('❌ Daily cron job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
