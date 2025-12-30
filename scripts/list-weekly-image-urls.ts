import { sql } from '@vercel/postgres';

type ImageRow = {
  date: string;
  platform: string;
  postType: string;
  topic: string | null;
  imageUrl: string | null;
};

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

async function main() {
  const weekStart = getWeekStart(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const result = await sql<ImageRow>`
    SELECT
      scheduled_date::date as "date",
      platform,
      post_type as "postType",
      topic,
      image_url as "imageUrl"
    FROM social_posts
    WHERE scheduled_date::date >= ${formatDate(weekStart)}
      AND scheduled_date::date <= ${formatDate(weekEnd)}
      AND image_url IS NOT NULL
    ORDER BY scheduled_date::date ASC, platform ASC, post_type ASC, id ASC
  `;

  const grouped: Record<
    string,
    Record<
      string,
      Array<{ postType: string; topic: string | null; imageUrl: string }>
    >
  > = {};

  for (const row of result.rows) {
    if (!row.imageUrl) continue;
    if (!grouped[row.date]) grouped[row.date] = {};
    if (!grouped[row.date][row.platform]) grouped[row.date][row.platform] = [];
    grouped[row.date][row.platform].push({
      postType: row.postType,
      topic: row.topic,
      imageUrl: row.imageUrl,
    });
  }

  const output = {
    weekStart: formatDate(weekStart),
    weekEnd: formatDate(weekEnd),
    days: grouped,
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error('Failed to list image URLs:', error);
  process.exit(1);
});
