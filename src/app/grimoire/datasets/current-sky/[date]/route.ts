import { buildCurrentSkyFacts } from '@/lib/seo/citation-datasets';

export const revalidate = 86400;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseUtcDate(input: string) {
  if (!DATE_PATTERN.test(input)) return null;
  const date = new Date(`${input}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  if (date.toISOString().slice(0, 10) !== input) return null;
  return date;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date: dateParam } = await params;
  const date = parseUtcDate(dateParam);

  if (!date) {
    return Response.json(
      {
        error: 'Invalid date. Use YYYY-MM-DD in UTC.',
      },
      { status: 404 },
    );
  }

  const facts = buildCurrentSkyFacts(date);

  return Response.json(
    {
      ...facts,
      snapshot: true,
      snapshotDate: dateParam,
      url: `https://lunary.app/grimoire/datasets/current-sky/${dateParam}`,
      latestVersion:
        'https://lunary.app/grimoire/datasets/current-sky-facts.json',
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    },
  );
}
