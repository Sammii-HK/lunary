import dayjs from 'dayjs';

const BASE_URL = 'https://lunary.app';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  url: string;
}

function generateRecentWeeks(count: number = 12): BlogPost[] {
  const weeks: BlogPost[] = [];
  const startOf2025 = dayjs('2025-01-06');
  const today = dayjs();
  const currentWeekStart = today.startOf('week').add(1, 'day');

  let weekDate = startOf2025;
  let weekNumber = 1;
  const year = 2025;

  while (
    weekDate.isBefore(currentWeekStart) ||
    weekDate.isSame(currentWeekStart, 'day')
  ) {
    const weekEnd = weekDate.add(6, 'day');
    const weekSlug = `week-${weekNumber}-${year}`;

    weeks.push({
      slug: weekSlug,
      title: `Weekly Cosmic Forecast: Week ${weekNumber}, ${year}`,
      description: `Astrological insights for ${weekDate.format('MMMM D')} - ${weekEnd.format('MMMM D, YYYY')}. Planetary highlights, moon phases, retrogrades, and guidance for the week ahead.`,
      pubDate: weekDate.toDate(),
      url: `${BASE_URL}/blog/week/${weekSlug}`,
    });

    weekDate = weekDate.add(7, 'day');
    weekNumber++;
  }

  return weeks.reverse().slice(0, count);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = generateRecentWeeks(12);

  const rssItems = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${post.url}</link>
      <guid isPermaLink="true">${post.url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${post.pubDate.toUTCString()}</pubDate>
    </item>`,
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Lunary Blog - Weekly Cosmic Forecasts</title>
    <link>${BASE_URL}/blog</link>
    <description>Weekly astrological insights, planetary highlights, moon phases, and cosmic guidance from Lunary.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/logo.png</url>
      <title>Lunary</title>
      <link>${BASE_URL}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
