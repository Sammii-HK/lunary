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

function parseDate(input?: string): Date | null {
  if (!input) return null;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${input}`);
  }
  return parsed;
}

function buildRangeClause(
  startDate: Date | null,
  endDate: Date | null,
  startIndex: number,
) {
  let clause = '';
  const params: string[] = [];

  if (startDate) {
    params.push(startDate.toISOString());
    clause += ` AND ce.created_at >= $${startIndex + params.length - 1}`;
  }

  if (endDate) {
    params.push(endDate.toISOString());
    clause += ` AND ce.created_at <= $${startIndex + params.length - 1}`;
  }

  return { clause, params };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (FEATURE_EVENTS.length === 0) {
    throw new Error('No feature events configured for backfill.');
  }

  const startDate = parseDate(args.startDate);
  const endDate = parseDate(args.endDate);
  const { clause: rangeClause, params: rangeParams } = buildRangeClause(
    startDate,
    endDate,
    2,
  );

  const candidatesQuery = `
    SELECT ce.id, COALESCE(s.plan_type, 'free') as plan_type
    FROM conversion_events ce
    LEFT JOIN subscriptions s ON s.user_id = ce.user_id
    WHERE ce.plan_type IS NULL
      AND ce.user_id IS NOT NULL
      AND ce.event_type = ANY($1::text[])
      ${rangeClause}
  `;
  const candidates = await sql.query(candidatesQuery, [
    FEATURE_EVENTS,
    ...rangeParams,
  ]);

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

  const updateQuery = `
    UPDATE conversion_events ce
    SET plan_type = source.plan_type
    FROM (
      SELECT ce.id, COALESCE(s.plan_type, 'free') as plan_type
      FROM conversion_events ce
      LEFT JOIN subscriptions s ON s.user_id = ce.user_id
      WHERE ce.plan_type IS NULL
        AND ce.user_id IS NOT NULL
        AND ce.event_type = ANY($1::text[])
        ${rangeClause}
    ) AS source
    WHERE ce.id = source.id
  `;
  await sql.query(updateQuery, [FEATURE_EVENTS, ...rangeParams]);

  console.log('Backfill complete.');
}

main().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
