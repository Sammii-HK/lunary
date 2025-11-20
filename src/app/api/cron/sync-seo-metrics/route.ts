import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatDate } from '@/lib/analytics/date-range';
import { getSearchConsoleData, getTopPages } from '@/lib/google/search-console';
import generateSitemap from '@/app/sitemap';

export const runtime = 'nodejs';

/**
 * Count articles from sitemap (grimoire pages + blog posts)
 */
function countArticlesFromSitemap(sitemapData: Array<{ url: string }>): number {
  return sitemapData.filter(
    (entry) =>
      entry.url.includes('/grimoire/') || entry.url.includes('/blog/week/'),
  ).length;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';

    // Allow Vercel cron or CRON_SECRET
    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const metricDate = formatDate(yesterday); // Sync yesterday's data (Search Console has 1-day delay)

    console.log(
      '[sync-seo-metrics] Starting SEO metrics sync for date:',
      metricDate,
    );

    // Get sitemap data
    const sitemapData = generateSitemap();
    const pagesIndexed = sitemapData.length;
    const articleCount = countArticlesFromSitemap(sitemapData);

    let clicks = 0;
    let impressions = 0;
    let ctr = 0;
    let averagePosition = 0;
    let topPages: Array<{ url: string; clicks: number }> = [];

    try {
      // Get Search Console data for yesterday
      const searchConsoleData = await getSearchConsoleData(
        metricDate,
        metricDate,
      );
      clicks = searchConsoleData.totalClicks;
      impressions = searchConsoleData.totalImpressions;
      ctr = searchConsoleData.averageCtr; // Keep as decimal (0.05 = 5%)
      averagePosition = searchConsoleData.averagePosition;

      // Get top 10 pages for yesterday
      const topPagesData = await getTopPages(metricDate, metricDate, 10);
      topPages = topPagesData.map((page) => ({
        url: page.page,
        clicks: page.clicks,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[sync-seo-metrics] Search Console API error:',
        errorMessage,
      );
      // Continue with 0 values if API fails
    }

    // Upsert into database
    await sql`
      INSERT INTO analytics_seo_metrics (
        metric_date,
        clicks,
        impressions,
        ctr,
        average_position,
        pages_indexed,
        article_count,
        top_pages,
        updated_at
      ) VALUES (
        ${metricDate}::DATE,
        ${clicks},
        ${impressions},
        ${ctr},
        ${averagePosition},
        ${pagesIndexed},
        ${articleCount},
        ${JSON.stringify(topPages)}::JSONB,
        NOW()
      )
      ON CONFLICT (metric_date)
      DO UPDATE SET
        clicks = EXCLUDED.clicks,
        impressions = EXCLUDED.impressions,
        ctr = EXCLUDED.ctr,
        average_position = EXCLUDED.average_position,
        pages_indexed = EXCLUDED.pages_indexed,
        article_count = EXCLUDED.article_count,
        top_pages = EXCLUDED.top_pages,
        updated_at = NOW()
    `;

    console.log(
      '[sync-seo-metrics] Successfully synced SEO metrics for',
      metricDate,
    );

    return NextResponse.json({
      success: true,
      metricDate,
      data: {
        clicks,
        impressions,
        ctr: ctr * 100, // Return as percentage for response
        averagePosition,
        pagesIndexed,
        articleCount,
        topPagesCount: topPages.length,
      },
    });
  } catch (error) {
    console.error('[sync-seo-metrics] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync SEO metrics',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
