import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

type Args = {
  startDate?: string;
  endDate?: string;
  dryRun: boolean;
};

const FEATURE_EVENTS = [
  'birth_chart_viewed',
  'tarot_viewed',
  'personalized_tarot_viewed',
  'horoscope_viewed',
  'personalized_horoscope_viewed',
  'crystal_recommendations_viewed',
];

function parseArgs(argv: string[]): Args {
  return argv.reduce<Args>(
    (acc, arg) => {
      if (arg === '--dry-run') {
        acc.dryRun = true;
        return acc;
      }
      const [key, value] = arg.split('=');
      if (!value) return acc;
      if (key === '--start-date') acc.startDate = value;
      if (key === '--end-date') acc.endDate = value;
      return acc;
    },
    { dryRun: false },
  );
}

function toTextArrayLiteral(values: string[]): string | null {
  if (values.length === 0) return null;
  return `{${values
    .map((v) => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
    .join(',')}}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const eventsArray = toTextArrayLiteral(FEATURE_EVENTS);
  if (!eventsArray) {
    throw new Error('No feature events configured for backfill.');
  }

  const startClause = args.startDate
    ? sql`AND ce.created_at >= ${args.startDate}`
    : sql``;
  const endClause = args.endDate
    ? sql`AND ce.created_at <= ${args.endDate}`
    : sql``;

  const candidates = await sql`
    SELECT ce.id, COALESCE(s.plan_type, 'free') as plan_type
    FROM conversion_events ce
    LEFT JOIN subscriptions s ON s.user_id = ce.user_id
    WHERE ce.plan_type IS NULL
      AND ce.user_id IS NOT NULL
      AND ce.event_type = ANY(SELECT unnest(${eventsArray}::text[]))
      ${startClause}
      ${endClause}
  `;

  const candidateCount = candidates.rows.length;
  console.log(`Found ${candidateCount} conversion events to backfill.`);

  if (candidateCount === 0) return;

  if (args.dryRun) {
    const summary = candidates.rows.reduce(
      (acc: Record<string, number>, row) => {
        const planType = String(row.plan_type || 'free');
        acc[planType] = (acc[planType] || 0) + 1;
        return acc;
      },
      {},
    );
    console.log('Dry run summary by plan_type:', summary);
    return;
  }

  await sql`
    UPDATE conversion_events ce
    SET plan_type = source.plan_type
    FROM (
      SELECT ce.id, COALESCE(s.plan_type, 'free') as plan_type
      FROM conversion_events ce
      LEFT JOIN subscriptions s ON s.user_id = ce.user_id
      WHERE ce.plan_type IS NULL
        AND ce.user_id IS NOT NULL
        AND ce.event_type = ANY(SELECT unnest(${eventsArray}::text[]))
        ${startClause}
        ${endClause}
    ) AS source
    WHERE ce.id = source.id
  `;

  console.log('Backfill complete.');
}

main().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
