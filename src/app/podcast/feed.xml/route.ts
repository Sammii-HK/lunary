import { prisma } from '@/lib/prisma';

const BASE_URL = 'https://lunary.app';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export async function GET() {
  const episodes = await prisma.podcastEpisode.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: {
      slug: true,
      title: true,
      description: true,
      audioUrl: true,
      durationSecs: true,
      publishedAt: true,
      episodeNumber: true,
    },
  });

  const rssItems = episodes
    .map(
      (ep) => `
    <item>
      <title>${escapeXml(ep.title)}</title>
      <link>${BASE_URL}/podcast/${escapeXml(ep.slug)}</link>
      <guid isPermaLink="true">${BASE_URL}/podcast/${escapeXml(ep.slug)}</guid>
      <description>${escapeXml(ep.description)}</description>
      <pubDate>${new Date(ep.publishedAt).toUTCString()}</pubDate>
      <enclosure url="${escapeXml(ep.audioUrl)}" type="audio/mpeg" />
      <itunes:episode>${ep.episodeNumber}</itunes:episode>
      <itunes:duration>${formatDuration(ep.durationSecs)}</itunes:duration>
      <itunes:summary>${escapeXml(ep.description)}</itunes:summary>
    </item>`,
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:itunes="http://www.itunes.apple.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>The Grimoire by Lunary</title>
    <link>${BASE_URL}/podcast</link>
    <description>Weekly explorations of astrology, tarot, crystals, numerology, and cosmic wisdom from the Lunary grimoire.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/podcast/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/logo.png</url>
      <title>The Grimoire by Lunary</title>
      <link>${BASE_URL}/podcast</link>
    </image>
    <itunes:author>Lunary</itunes:author>
    <itunes:summary>Weekly explorations of astrology, tarot, crystals, numerology, and cosmic wisdom from the Lunary grimoire.</itunes:summary>
    <itunes:category text="Religion &amp; Spirituality">
      <itunes:category text="Spirituality" />
    </itunes:category>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="${BASE_URL}/logo.png"/>
    <itunes:owner>
      <itunes:name>Lunary</itunes:name>
    </itunes:owner>
    <itunes:type>episodic</itunes:type>
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
