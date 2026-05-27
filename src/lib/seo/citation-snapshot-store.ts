import { revalidateTag, unstable_cache } from 'next/cache';
import { sql } from '@vercel/postgres';
import { buildCurrentSkyFacts } from './citation-datasets';

export const CURRENT_SKY_DATASET_KEY = 'current-sky';
export const CITATION_SNAPSHOT_TAG = 'citation-dataset-snapshots';

export type CitationDatasetSnapshot = {
  datasetKey: string;
  snapshotDate: string;
  version: string;
  payload: Record<string, unknown>;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toUtcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function parseUtcDateKey(input: string) {
  if (!DATE_PATTERN.test(input)) return null;

  const date = new Date(`${input}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  if (toUtcDateKey(date) !== input) return null;

  return date;
}

function snapshotFromRow(
  row: Record<string, unknown>,
): CitationDatasetSnapshot {
  const snapshotDate =
    row.snapshot_date instanceof Date
      ? toUtcDateKey(row.snapshot_date)
      : String(row.snapshot_date).slice(0, 10);

  return {
    datasetKey: String(row.dataset_key),
    snapshotDate,
    version: String(row.version),
    payload: row.payload as Record<string, unknown>,
    generatedAt: new Date(String(row.generated_at)).toISOString(),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

function isMissingSnapshotTableError(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error.code === '42P01' || error.code === 'missing_connection_string')
  ) {
    return true;
  }

  return String(error).includes('citation_dataset_snapshots');
}

export function buildCurrentSkySnapshotPayload(date: Date) {
  const dateKey = toUtcDateKey(date);
  const facts = buildCurrentSkyFacts(date);

  return {
    ...facts,
    snapshot: true,
    snapshotDate: dateKey,
    archivedAt: `${dateKey}T12:00:00.000Z`,
    identifier: `lunary-current-sky-${dateKey}`,
    isPartOf: 'https://lunary.app/grimoire/datasets/current-sky-facts.json',
    url: `https://lunary.app/grimoire/datasets/current-sky/${dateKey}`,
    latestVersion:
      'https://lunary.app/grimoire/datasets/current-sky-facts.json',
    sameAs: [
      `https://lunary.app/grimoire/datasets/current-sky/${dateKey}`,
      'https://lunary.app/grimoire/datasets/current-sky-facts.json',
    ],
  };
}

function revalidateSnapshotTags(dateKey: string) {
  try {
    revalidateTag(CITATION_SNAPSHOT_TAG);
    revalidateTag(`${CITATION_SNAPSHOT_TAG}-${CURRENT_SKY_DATASET_KEY}`);
    revalidateTag(
      `${CITATION_SNAPSHOT_TAG}-${CURRENT_SKY_DATASET_KEY}-${dateKey}`,
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[citation-snapshot-store] revalidateTag skipped', error);
    }
  }
}

export async function upsertCurrentSkySnapshot(date = new Date()) {
  const dateKey = toUtcDateKey(date);
  const payload = buildCurrentSkySnapshotPayload(date);

  const result = await sql`
    INSERT INTO citation_dataset_snapshots (
      dataset_key,
      snapshot_date,
      version,
      payload,
      generated_at,
      updated_at
    )
    VALUES (
      ${CURRENT_SKY_DATASET_KEY},
      ${dateKey}::date,
      ${dateKey},
      ${JSON.stringify(payload)}::jsonb,
      NOW(),
      NOW()
    )
    ON CONFLICT (dataset_key, snapshot_date)
    DO UPDATE SET
      version = EXCLUDED.version,
      payload = EXCLUDED.payload,
      generated_at = NOW(),
      updated_at = NOW()
    RETURNING dataset_key, snapshot_date, version, payload, generated_at, created_at, updated_at
  `;

  revalidateSnapshotTags(dateKey);

  return snapshotFromRow(result.rows[0]);
}

export async function getCurrentSkySnapshot(dateKey: string) {
  const cached = unstable_cache(
    async () => {
      try {
        const result = await sql`
          SELECT dataset_key, snapshot_date, version, payload, generated_at, created_at, updated_at
          FROM citation_dataset_snapshots
          WHERE dataset_key = ${CURRENT_SKY_DATASET_KEY}
            AND snapshot_date = ${dateKey}::date
          LIMIT 1
        `;

        return result.rows[0] ? snapshotFromRow(result.rows[0]) : null;
      } catch (error) {
        if (isMissingSnapshotTableError(error)) return null;
        throw error;
      }
    },
    [`${CITATION_SNAPSHOT_TAG}-${CURRENT_SKY_DATASET_KEY}-${dateKey}`],
    {
      tags: [
        CITATION_SNAPSHOT_TAG,
        `${CITATION_SNAPSHOT_TAG}-${CURRENT_SKY_DATASET_KEY}`,
        `${CITATION_SNAPSHOT_TAG}-${CURRENT_SKY_DATASET_KEY}-${dateKey}`,
      ],
      revalidate: 86400,
    },
  );

  return cached();
}

export async function listCurrentSkySnapshots(limit = 90) {
  const normalizedLimit = Math.max(1, Math.min(limit, 366));

  try {
    const result = await sql`
      SELECT dataset_key, snapshot_date, version, payload, generated_at, created_at, updated_at
      FROM citation_dataset_snapshots
      WHERE dataset_key = ${CURRENT_SKY_DATASET_KEY}
      ORDER BY snapshot_date DESC
      LIMIT ${normalizedLimit}
    `;

    return result.rows.map(snapshotFromRow);
  } catch (error) {
    if (isMissingSnapshotTableError(error)) return [];
    throw error;
  }
}
