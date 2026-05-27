import { listCurrentSkySnapshots } from '@/lib/seo/citation-snapshot-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get('limit') ?? 90);
  const limit = Number.isFinite(limitParam) ? limitParam : 90;
  let snapshots: Awaited<ReturnType<typeof listCurrentSkySnapshots>> = [];

  try {
    snapshots = await listCurrentSkySnapshots(limit);
  } catch (error) {
    console.error('[current-sky archive] Snapshot list unavailable', error);
  }

  return Response.json(
    {
      '@context': 'https://schema.org',
      '@type': 'DataCatalog',
      name: 'Lunary Current Sky Snapshot Archive',
      description:
        'Database-backed daily archive of Lunary current-sky facts for stable AI and search citations.',
      url: 'https://lunary.app/grimoire/datasets/current-sky',
      measurementTechnique:
        'Geocentric ecliptic longitude and lunar illumination calculated with Astronomy Engine at UTC reference time.',
      isBasedOn: 'https://lunary.app/about/methodology',
      license: 'https://lunary.app/terms',
      creator: {
        '@type': 'Organization',
        name: 'Lunary',
        url: 'https://lunary.app',
      },
      dataset: snapshots.map((snapshot) => ({
        '@type': 'Dataset',
        name: `Lunary Current Sky Facts ${snapshot.snapshotDate}`,
        identifier: `lunary-current-sky-${snapshot.snapshotDate}`,
        version: snapshot.version,
        temporalCoverage: snapshot.snapshotDate,
        dateModified: snapshot.updatedAt.slice(0, 10),
        variableMeasured: [
          'moon.phase',
          'moon.sign',
          'moon.eclipticLongitude',
          'moon.illuminationPercent',
          'sun.sign',
          'sun.eclipticLongitude',
          'planets.sign',
          'planets.eclipticLongitude',
        ],
        measurementTechnique:
          'Astronomy Engine geocentric ecliptic longitude and illumination calculation.',
        isBasedOn: 'https://lunary.app/about/methodology',
        license: 'https://lunary.app/terms',
        url: `https://lunary.app/grimoire/datasets/current-sky/${snapshot.snapshotDate}`,
        distribution: {
          '@type': 'DataDownload',
          encodingFormat: 'application/json',
          contentUrl: `https://lunary.app/grimoire/datasets/current-sky/${snapshot.snapshotDate}`,
        },
      })),
      snapshots: snapshots.map((snapshot) => ({
        date: snapshot.snapshotDate,
        version: snapshot.version,
        url: `https://lunary.app/grimoire/datasets/current-sky/${snapshot.snapshotDate}`,
        generatedAt: snapshot.generatedAt,
        updatedAt: snapshot.updatedAt,
      })),
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=900, s-maxage=3600',
      },
    },
  );
}
