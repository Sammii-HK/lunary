import { queryPostHogAPI } from '@/lib/posthog-server';

type HogQLResponse = {
  results?: Array<Array<string | number | null>>;
};

export type PostHogABMetricRow = {
  testName: string;
  variant: string;
  eventType: string;
  uniqueActors: number;
};

export type PostHogABHubRow = {
  hub: string;
  eventType: string;
  uniqueActors: number;
};

function escapeHogQLString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function formatHogQLDate(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function actorIdExpression(): string {
  return "coalesce(nullIf(person_id, ''), distinct_id)";
}

function eventList(values: string[]): string {
  return values.map((value) => `'${escapeHogQLString(value)}'`).join(', ');
}

async function runHogQLRows(
  query: string,
): Promise<Array<Array<string | number | null>> | null> {
  const result = await queryPostHogAPI<HogQLResponse>('/query/', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query,
      },
    }),
  });

  return result?.results ?? null;
}

export async function fetchABMetricRowsFromPostHog(
  dateCutoff: Date,
): Promise<PostHogABMetricRow[] | null> {
  const cutoff = formatHogQLDate(dateCutoff);
  const query = `
    SELECT
      JSONExtractString(properties, 'abTest') AS test_name,
      JSONExtractString(properties, 'abVariant') AS variant,
      event,
      count(DISTINCT ${actorIdExpression()}) AS unique_actors
    FROM events
    WHERE JSONExtractString(properties, 'abTest') IS NOT NULL
      AND JSONExtractString(properties, 'abTest') != ''
      AND JSONExtractString(properties, 'abVariant') IS NOT NULL
      AND JSONExtractString(properties, 'abVariant') != ''
      AND timestamp >= toDateTime('${cutoff}')
      AND event IN (${eventList([
        'app_opened',
        'pricing_page_viewed',
        'cta_impression',
        'page_viewed',
        'trial_started',
        'subscription_started',
        'trial_converted',
        'cta_clicked',
      ])})
    GROUP BY test_name, variant, event
    ORDER BY test_name, variant, event
  `;

  const rows = await runHogQLRows(query);
  if (!rows) return null;

  return rows
    .map((row) => ({
      testName: String(row[0] ?? ''),
      variant: String(row[1] ?? ''),
      eventType: String(row[2] ?? ''),
      uniqueActors: Number(row[3] ?? 0),
    }))
    .filter((row) => row.testName && row.variant && row.eventType);
}

export async function fetchABVariantEventRowsFromPostHog(
  testName: string,
  dateCutoff: Date,
): Promise<PostHogABMetricRow[] | null> {
  const cutoff = formatHogQLDate(dateCutoff);
  const escapedTestName = escapeHogQLString(testName);
  const query = `
    SELECT
      JSONExtractString(properties, 'abVariant') AS variant,
      event,
      count(DISTINCT ${actorIdExpression()}) AS unique_actors
    FROM events
    WHERE JSONExtractString(properties, 'abTest') = '${escapedTestName}'
      AND JSONExtractString(properties, 'abVariant') IS NOT NULL
      AND JSONExtractString(properties, 'abVariant') != ''
      AND timestamp >= toDateTime('${cutoff}')
    GROUP BY variant, event
    ORDER BY variant, event
  `;

  const rows = await runHogQLRows(query);
  if (!rows) return null;

  return rows
    .map((row) => ({
      testName,
      variant: String(row[0] ?? ''),
      eventType: String(row[1] ?? ''),
      uniqueActors: Number(row[2] ?? 0),
    }))
    .filter((row) => row.variant && row.eventType);
}

export async function fetchABHubRowsFromPostHog(
  dateCutoff: Date,
): Promise<PostHogABHubRow[] | null> {
  const cutoff = formatHogQLDate(dateCutoff);
  const query = `
    SELECT
      coalesce(
        nullIf(JSONExtractString(properties, 'hub'), ''),
        CASE
          WHEN JSONExtractString(properties, 'abTest') LIKE 'seo_cta_%'
            AND JSONExtractString(properties, 'abTest') != 'seo_cta_copy'
            THEN replaceOne(JSONExtractString(properties, 'abTest'), 'seo_cta_', '')
          WHEN JSONExtractString(properties, 'abTest') LIKE 'seo_sticky_cta_%'
            AND JSONExtractString(properties, 'abTest') != 'seo_sticky_cta_copy'
            THEN replaceOne(JSONExtractString(properties, 'abTest'), 'seo_sticky_cta_', '')
          WHEN JSONExtractString(properties, 'abVariant') LIKE '%_%'
            THEN replaceRegexpOne(JSONExtractString(properties, 'abVariant'), '_[0-9]+$', '')
          ELSE 'unknown'
        END
      ) AS hub,
      event,
      count(DISTINCT ${actorIdExpression()}) AS unique_actors
    FROM events
    WHERE (
      JSONExtractString(properties, 'abTest') IN ('seo_cta_copy', 'seo_sticky_cta_copy')
      OR JSONExtractString(properties, 'abTest') LIKE 'seo_cta_%'
      OR JSONExtractString(properties, 'abTest') LIKE 'seo_sticky_cta_%'
    )
      AND event IN ('cta_impression', 'cta_clicked')
      AND timestamp >= toDateTime('${cutoff}')
    GROUP BY hub, event
    ORDER BY hub, event
  `;

  const rows = await runHogQLRows(query);
  if (!rows) return null;

  return rows
    .map((row) => ({
      hub: String(row[0] ?? ''),
      eventType: String(row[1] ?? ''),
      uniqueActors: Number(row[2] ?? 0),
    }))
    .filter((row) => row.hub && row.eventType);
}
