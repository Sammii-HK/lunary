import { buildCurrentSkyFacts } from '@/lib/seo/citation-datasets';

export const dynamic = 'force-static';
export const revalidate = 3600;

export function GET() {
  return Response.json(buildCurrentSkyFacts(), {
    headers: {
      'Cache-Control': 'public, max-age=900, s-maxage=3600',
    },
  });
}
