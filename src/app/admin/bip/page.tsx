import { sql } from '@vercel/postgres';
import { getSearchConsoleData } from '@/lib/google/search-console';
import { BipTriggerButtons } from './BipTriggerButtons';
import Image from 'next/image';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const dynamic = 'force-dynamic';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

interface BipMetrics {
  mau: number;
  mrr: number;
  subscriberCount: number;
  impressionsPerDay: number;
}

interface BipState {
  dayCount: number;
  lastDailyPost: string | null;
}

async function getCurrentMetrics(): Promise<BipMetrics> {
  // Same queries as the admin dashboard
  const mauStart = new Date(
    Date.now() - 29 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const mauEnd = new Date().toISOString();

  const [mauResult, subsResult] = await Promise.all([
    // MAU: 30-day distinct product users
    sql.query(
      `SELECT COUNT(DISTINCT user_id) as count
       FROM conversion_events
       WHERE created_at >= $1 AND created_at <= $2
         AND user_id IS NOT NULL
         AND user_id NOT LIKE 'anon:%'
         AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
      [mauStart, mauEnd, TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
    ),
    // Active subscribers + MRR
    sql.query(
      `SELECT COUNT(*) as subscriber_count,
              COALESCE(SUM(COALESCE(monthly_amount_due, 0)), 0) as mrr
       FROM subscriptions
       WHERE status = 'active'
         AND stripe_subscription_id IS NOT NULL
         AND (user_email IS NULL OR (user_email NOT LIKE $1 AND user_email != $2))`,
      [TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
    ),
  ]);

  const mau = Number(mauResult.rows[0]?.count || 0);
  const subscriberCount = Number(subsResult.rows[0]?.subscriber_count || 0);
  const mrr = Number(subsResult.rows[0]?.mrr || 0);

  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  let impressionsPerDay = 0;
  try {
    const scData = await getSearchConsoleData(sevenDaysAgo, today);
    impressionsPerDay = Math.round(scData.totalImpressions / 7);
  } catch (err) {
    console.warn('[BIP Admin] GSC fetch failed:', err);
  }

  return { mau, mrr, subscriberCount, impressionsPerDay };
}

async function getBipState(): Promise<BipState> {
  try {
    const result = await sql`
      SELECT key, value FROM bip_state WHERE key IN ('bip_day_count', 'bip_last_daily_post')
    `;
    const map: Record<string, string> = {};
    for (const row of result.rows) {
      map[row.key as string] = row.value as string;
    }
    return {
      dayCount: map.bip_day_count ? parseInt(map.bip_day_count, 10) : 0,
      lastDailyPost: map.bip_last_daily_post ?? null,
    };
  } catch {
    return { dayCount: 0, lastDailyPost: null };
  }
}

function getCardImages(): string[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'app-demos', 'bip');
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.png') && !f.startsWith('.'))
      .sort()
      .reverse()
      .map((f) => `/app-demos/bip/${f}`);
  } catch {
    return [];
  }
}

export default async function BipPreviewPage() {
  const [metrics, bipState, cardImages] = await Promise.all([
    getCurrentMetrics(),
    getBipState(),
    Promise.resolve(getCardImages()),
  ]);

  const today = new Date().toISOString().split('T')[0];
  const postedToday = bipState.lastDailyPost === today;

  return (
    <main className='min-h-screen bg-[#0a0a0a] text-white p-6 max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold mb-1'>Build in Public</h1>
      <p className='text-neutral-400 text-sm mb-8'>
        Automated BIP posts to @sammiihk — daily stats + weekly card
      </p>

      {/* Current metrics */}
      <section className='mb-8'>
        <h2 className='text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3'>
          Current metrics
        </h2>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
          <div className='bg-[#14141e] border border-[#2a2a3e] rounded-xl p-4'>
            <div className='text-2xl font-bold'>{metrics.mau}</div>
            <div className='text-neutral-400 text-sm mt-1'>MAU</div>
          </div>
          <div className='bg-[#14141e] border border-[#2a2a3e] rounded-xl p-4'>
            <div className='text-2xl font-bold'>{metrics.subscriberCount}</div>
            <div className='text-neutral-400 text-sm mt-1'>subscribers</div>
          </div>
          <div className='bg-[#14141e] border border-[#2a2a3e] rounded-xl p-4'>
            <div className='text-2xl font-bold'>
              {metrics.mrr > 0 ? `£${metrics.mrr.toFixed(2)}` : '£0'}
            </div>
            <div className='text-neutral-400 text-sm mt-1'>MRR</div>
            {metrics.mrr === 0 && metrics.subscriberCount > 0 && (
              <div className='text-neutral-600 text-xs mt-1'>
                coupons applied
              </div>
            )}
          </div>
          <div className='bg-[#14141e] border border-[#2a2a3e] rounded-xl p-4'>
            <div className='text-2xl font-bold'>
              {metrics.impressionsPerDay > 0
                ? metrics.impressionsPerDay.toLocaleString()
                : '—'}
            </div>
            <div className='text-neutral-400 text-sm mt-1'>impressions/day</div>
          </div>
        </div>
      </section>

      {/* Post state */}
      <section className='mb-8'>
        <h2 className='text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3'>
          Post state
        </h2>
        <div className='bg-[#14141e] border border-[#2a2a3e] rounded-xl p-4 space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-neutral-400'>Day count</span>
            <span className='font-mono'>
              {bipState.dayCount > 0
                ? `Day ${bipState.dayCount}`
                : 'Not started'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-neutral-400'>Last daily post</span>
            <span className='font-mono'>
              {bipState.lastDailyPost ?? 'Never'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-neutral-400'>Posted today</span>
            <span
              className={postedToday ? 'text-green-400' : 'text-neutral-400'}
            >
              {postedToday ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </section>

      {/* Manual triggers */}
      <section className='mb-8'>
        <h2 className='text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3'>
          Manual triggers
        </h2>
        <BipTriggerButtons />
      </section>

      {/* Card image gallery */}
      {cardImages.length > 0 && (
        <section className='mb-8'>
          <h2 className='text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3'>
            Generated cards
          </h2>
          <div className='space-y-4'>
            {cardImages.map((src) => {
              const filename = src.split('/').pop() ?? src;
              return (
                <div key={src}>
                  <p className='text-xs text-neutral-500 font-mono mb-2'>
                    {filename}
                  </p>
                  <Image
                    src={src}
                    alt={filename}
                    width={1200}
                    height={675}
                    className='rounded-xl w-full h-auto'
                    unoptimized
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {cardImages.length === 0 && (
        <section>
          <div className='bg-[#14141e] border border-[#2a2a3e] rounded-xl p-8 text-center'>
            <p className='text-neutral-400 text-sm'>
              No generated cards yet. Run the weekly cron to generate one.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
