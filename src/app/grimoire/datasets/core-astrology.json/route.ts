import { buildCoreAstrologyDataset } from '@/lib/seo/citation-datasets';

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET() {
  return Response.json(buildCoreAstrologyDataset(), {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
