import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';
import {
  canonicaliseEvent,
  insertCanonicalEvent,
} from '@/lib/analytics/canonical-events';
import { getEngagementOverview } from '@/lib/analytics/kpis';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function main() {
  console.log('[analytics-smoke] Checking conversion_events table...');
  await sql`SELECT 1 FROM conversion_events LIMIT 1`;

  const testUserId = `smoke:${Date.now()}`;
  const today = new Date();

  console.log('[analytics-smoke] Testing dedupe behaviour...');

  const app1 = canonicaliseEvent({
    eventType: 'app_opened',
    userId: testUserId,
    pagePath: '/app',
    createdAt: today.toISOString(),
  });
  const app2 = canonicaliseEvent({
    eventType: 'app_opened',
    userId: testUserId,
    pagePath: '/app',
    createdAt: new Date(today.getTime() + 60_000).toISOString(),
  });

  if (!app1.ok || !app2.ok) {
    throw new Error('Failed to build canonical app_opened events');
  }

  const insert1 = await insertCanonicalEvent(app1.row);
  const insert2 = await insertCanonicalEvent(app2.row);
  console.log(
    '[analytics-smoke] app_opened inserted:',
    insert1.inserted,
    insert2.inserted,
  );

  const g1 = canonicaliseEvent({
    eventType: 'grimoire_viewed',
    userId: testUserId,
    pagePath: '/grimoire/houses/mars',
    createdAt: today.toISOString(),
  });
  const g2 = canonicaliseEvent({
    eventType: 'grimoire_viewed',
    userId: testUserId,
    pagePath: '/grimoire/houses/mars',
    createdAt: new Date(today.getTime() + 120_000).toISOString(),
  });
  if (!g1.ok || !g2.ok) {
    throw new Error('Failed to build canonical grimoire_viewed events');
  }

  const gIns1 = await insertCanonicalEvent(g1.row);
  const gIns2 = await insertCanonicalEvent(g2.row);
  console.log(
    '[analytics-smoke] grimoire_viewed inserted:',
    gIns1.inserted,
    gIns2.inserted,
  );

  const action1 = canonicaliseEvent({
    eventType: 'tarot_viewed',
    userId: testUserId,
    pagePath: '/tarot',
    createdAt: today.toISOString(),
  });
  const action2 = canonicaliseEvent({
    eventType: 'tarot_viewed',
    userId: testUserId,
    pagePath: '/tarot',
    createdAt: new Date(today.getTime() + 30_000).toISOString(),
  });
  if (!action1.ok || !action2.ok) {
    throw new Error('Failed to build canonical tarot_drawn events');
  }

  const aIns1 = await insertCanonicalEvent(action1.row);
  const aIns2 = await insertCanonicalEvent(action2.row);
  console.log(
    '[analytics-smoke] tarot_drawn inserted:',
    aIns1.inserted,
    aIns2.inserted,
  );

  if (!(insert1.inserted === true && insert2.inserted === false)) {
    throw new Error('Expected app_opened to dedupe to 1 per day');
  }
  if (!(gIns1.inserted === true && gIns2.inserted === false)) {
    throw new Error(
      'Expected grimoire_viewed to dedupe to 1 per day per entity',
    );
  }
  if (!(aIns1.inserted === true && aIns2.inserted === true)) {
    throw new Error('Expected tarot_drawn to not dedupe');
  }

  console.log('[analytics-smoke] KPI sanity (last 7 days)...');
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 6);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  const overview = await getEngagementOverview({ start, end });
  console.log(
    '[analytics-smoke] DAU/WAU/MAU:',
    overview.dau,
    overview.wau,
    overview.mau,
  );

  console.log('[analytics-smoke] Done.');
}

main().catch((error) => {
  console.error('[analytics-smoke] Failed:', error);
  process.exit(1);
});
