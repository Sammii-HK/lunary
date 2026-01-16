import { config } from 'dotenv';
import { resolve } from 'path';
import { runPostHogBackfill } from '@/lib/analytics/posthog-backfill';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

type Args = {
  startDate?: string;
  endDate?: string;
  dryRun: boolean;
  limit: number;
};

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
      if (key === '--limit') acc.limit = Number(value);
      return acc;
    },
    { dryRun: false, limit: 5000 },
  );
}

function parseDate(input?: string, fallbackDays?: number): Date {
  if (!input && typeof fallbackDays === 'number') {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - fallbackDays);
    return d;
  }
  if (!input) return new Date();
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${input}`);
  }
  return parsed;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const start = parseDate(args.startDate, 30);
  const end = parseDate(args.endDate);

  const counters = await runPostHogBackfill({
    start,
    end,
    dryRun: args.dryRun,
    limit: args.limit,
  });

  console.log(
    [
      'Backfill complete.',
      `fetched=${counters.fetched}`,
      `inserted=${counters.inserted}`,
      `skipped_no_user=${counters.skipped_no_user}`,
      `skipped_duplicate=${counters.skipped_duplicate}`,
      `skipped_invalid=${counters.skipped_invalid}`,
      `dryRun=${args.dryRun}`,
    ].join(' '),
  );
}

main().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
