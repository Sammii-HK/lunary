import { config } from 'dotenv';
import { resolve } from 'node:path';
import {
  parseUtcDateKey,
  toUtcDateKey,
  upsertCurrentSkySnapshot,
} from '../src/lib/seo/citation-snapshot-store';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

function readArg(name: string) {
  const prefix = `${name}=`;
  return process.argv
    .slice(2)
    .find((arg) => arg === name || arg.startsWith(prefix))
    ?.replace(prefix, '');
}

function dateMinusUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() - days);
  return next;
}

async function main() {
  const dateArg = readArg('--date');
  const daysArg = Number(readArg('--days') ?? 31);
  const days = Number.isFinite(daysArg)
    ? Math.max(1, Math.min(Math.floor(daysArg), 366))
    : 31;
  const startDate = dateArg ? parseUtcDateKey(dateArg) : new Date();

  if (!startDate) {
    throw new Error('Invalid --date value. Use YYYY-MM-DD in UTC.');
  }

  const snapshots = [];

  for (let offset = 0; offset < days; offset += 1) {
    const targetDate = dateMinusUtcDays(startDate, offset);
    const snapshot = await upsertCurrentSkySnapshot(targetDate);
    snapshots.push(snapshot.snapshotDate);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        datasetKey: 'current-sky',
        startDate: toUtcDateKey(startDate),
        days,
        snapshots,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
