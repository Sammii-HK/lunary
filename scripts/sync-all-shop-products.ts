// scripts/sync-all-shop-products.ts
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

// const BASE_URL =
//   process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
//     ? `https://${process.env.VERCEL_URL}`
//     : 'http://localhost:3000';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

function getArgValue(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

function hasFlag(args: string[], ...flags: string[]) {
  return flags.some((f) => args.includes(f));
}

async function main() {
  const args = process.argv.slice(2);

  const dryRun = hasFlag(args, '--dry-run', '-d');
  const limit = getArgValue(args, '--limit');
  const category = getArgValue(args, '--category');
  const skipExistingArg = getArgValue(args, '--skip-existing');
  const perCategory = getArgValue(args, '--per-category');

  // API default is skipExisting=true unless explicitly set to 'false'
  const skipExisting =
    skipExistingArg === undefined ? undefined : skipExistingArg;

  const url = new URL('/api/shop/sync-all', BASE_URL);

  if (dryRun) url.searchParams.set('dryRun', 'true');
  if (limit) url.searchParams.set('limit', limit);
  if (category) url.searchParams.set('category', category);
  if (perCategory) url.searchParams.set('perCategory', perCategory);
  if (skipExisting !== undefined) {
    // pass 'false' to re-sync, 'true' to skip existing
    url.searchParams.set('skipExisting', skipExisting);
  }

  console.log('\n🛒 Lunary Shop: Batch Sync');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Request: ${url.toString()}`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}\n`);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // no body needed: your route reads query params only
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('❌ Sync failed');
    console.error(`   Status: ${res.status} ${res.statusText}`);
    if (text) console.error(`   Response: ${text}`);
    process.exit(1);
  }

  const data = await res.json();

  // Pretty summary
  const summary = data?.summary;
  if (summary) {
    console.log('✅ Sync complete');
    console.log(
      `   Total: ${summary.total} | Successful: ${summary.successful} | Skipped: ${summary.skipped} | Failed: ${summary.failed}`,
    );
    console.log(`   Duration: ${summary.durationSeconds}s\n`);
  } else {
    console.log('✅ Sync complete (no summary returned)\n');
  }

  // Show failures (and optionally successes if you want)
  const results = data?.results ?? [];
  const failed = results.filter((r: any) => r.status === 'error');
  if (failed.length) {
    console.log('❌ Failed items:');
    for (const r of failed) {
      console.log(`   - ${r.category}/${r.slug}: ${r.error}`);
    }
    console.log('');
    process.exit(1);
  }

  console.log('🎉 All done.\n');
}

main().catch((err) => {
  console.error('❌ Script crashed:', err);
  process.exit(1);
});
