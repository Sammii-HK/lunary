import { submitIndexNowUrls } from '@/lib/indexnow';
import {
  CANONICAL_SITE_URL,
  INDEXNOW_DISCOVERY_PATHS,
} from '@/lib/seo/discovery';

function normalizeBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    CANONICAL_SITE_URL
  ).replace(/\/+$/, '');
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const baseUrl = normalizeBaseUrl();
  const urls = INDEXNOW_DISCOVERY_PATHS.map((path) => `${baseUrl}${path}`);

  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, urls }, null, 2));
    return;
  }

  const result = await submitIndexNowUrls(urls);

  console.log(
    JSON.stringify(
      {
        success: true,
        status: result.status,
        submittedCount: result.submitted.length,
        submitted: result.submitted,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : 'IndexNow submission failed',
  );
  process.exit(1);
});
