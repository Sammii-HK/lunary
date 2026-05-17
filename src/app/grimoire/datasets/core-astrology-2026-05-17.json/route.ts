import { buildCoreAstrologyDataset } from '@/lib/seo/citation-datasets';

export const dynamic = 'force-static';
export const revalidate = 2592000;

export function GET() {
  const dataset = buildCoreAstrologyDataset();

  return Response.json(
    {
      ...dataset,
      snapshot: true,
      snapshotDate: '2026-05-17',
      url: 'https://lunary.app/grimoire/datasets/core-astrology-2026-05-17.json',
      latestVersion: 'https://lunary.app/grimoire/datasets/core-astrology.json',
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=2592000',
      },
    },
  );
}
