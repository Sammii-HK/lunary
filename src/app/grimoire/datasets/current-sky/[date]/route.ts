import {
  buildCurrentSkySnapshotPayload,
  getCurrentSkySnapshot,
  parseUtcDateKey,
} from '@/lib/seo/citation-snapshot-store';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date: dateParam } = await params;
  const date = parseUtcDateKey(dateParam);

  if (!date) {
    return Response.json(
      {
        error: 'Invalid date. Use YYYY-MM-DD in UTC.',
      },
      { status: 404 },
    );
  }

  const snapshot = await getCurrentSkySnapshot(dateParam);
  const payload = snapshot?.payload ?? {
    ...buildCurrentSkySnapshotPayload(date),
    archived: false,
    archiveStatus: 'not-yet-persisted',
  };

  return Response.json(payload, {
    headers: {
      'Cache-Control': snapshot
        ? 'public, max-age=86400, s-maxage=86400'
        : 'public, max-age=900, s-maxage=3600',
    },
  });
}
