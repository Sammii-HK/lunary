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

    console.log('📅 Publishing post for date:', dateStr);

    // Fetch your unique daily cosmic content
    const cosmicUrl = `https://lunary.app/api/og/cosmic-post?date=${dateStr}`;
    console.log('🔗 Fetching cosmic content from:', cosmicUrl);

    const cosmicResponse = await fetch(cosmicUrl);

    console.log('🌟 Cosmic API response:', {
      status: cosmicResponse.status,
      ok: cosmicResponse.ok,
      contentType: cosmicResponse.headers.get('content-type'),
    });

    if (!cosmicResponse.ok) {
      console.error('❌ Cosmic API failed:', {
        status: cosmicResponse.status,
        statusText: cosmicResponse.statusText,
        url: cosmicUrl,
      });

      const errorText = await cosmicResponse.text();
      console.error('❌ Error response:', errorText.substring(0, 200));

      throw new Error(
        `Failed to fetch cosmic content: ${cosmicResponse.status}`,
      );
    }

    const cosmicContent = await cosmicResponse.json();
    console.log('✅ Cosmic content loaded:', {
      primaryEvent: cosmicContent.primaryEvent,
      highlightsCount: cosmicContent.highlights?.length,
    });

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
          url: `https://lunary.app/api/og/cosmic?date=${dateStr}`,
          alt: `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance.`,
        },
      ],
    };

    // Send directly to Succulent API (bypass internal scheduler)
    const succulentApiUrl = 'https://app.succulent.social/api/posts';
    const apiKey = process.env.SUCCULENT_SECRET_KEY;

    console.log('🚀 Sending directly to Succulent API...');

    const response = await fetch(succulentApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey || '',
      },
      body: JSON.stringify(postData),
    });

    const result = await response.json();

    console.log('📨 Direct Succulent response:', {
      status: response.status,
      ok: response.ok,
      result: result,
    });

    if (response.ok) {
      console.log('✅ Daily cron job completed successfully');
      return NextResponse.json({
        success: true,
        message: 'Daily post published immediately',
        date: dateStr,
        hashtags: selectedHashtags.join(' '),
        publishedAt: new Date().toISOString(),
        succulentResult: result,
      });
    } else {
      console.error('❌ Succulent API failed:', result);
      throw new Error(
        `Succulent API failed: ${response.status} ${result.error || result.message}`,
      );
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
