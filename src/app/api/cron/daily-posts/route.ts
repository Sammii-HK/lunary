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

    // Use the correct base URL - avoid VERCEL_URL as it can cause issues
    const baseUrl = 'https://lunary.app';

    console.log('📅 Publishing post for date:', dateStr);
    console.log('🌐 Using base URL:', baseUrl);

    // Fetch cosmic content
    const cosmicUrl = `${baseUrl}/api/og/cosmic-post?date=${dateStr}`;
    console.log('🔗 Fetching cosmic content from:', cosmicUrl);

    const cosmicResponse = await fetch(cosmicUrl);

    if (!cosmicResponse.ok) {
      console.error('❌ Cosmic API Error:', {
        status: cosmicResponse.status,
        statusText: cosmicResponse.statusText,
        url: cosmicUrl,
        headers: Object.fromEntries(cosmicResponse.headers.entries()),
      });

      // Try to get error response
      try {
        const errorText = await cosmicResponse.text();
        console.error('❌ Cosmic API Error Body:', errorText);
      } catch (e) {
        console.error('❌ Could not read error response');
      }

      throw new Error(
        `Failed to fetch cosmic content: ${cosmicResponse.status} ${cosmicResponse.statusText}`,
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
      platforms: ['instagram', 'x', 'threads'],
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
