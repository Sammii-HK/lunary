/**
 * Check for recent events with abTest metadata in PostHog
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function checkRecentABData() {
  const posthogApiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const posthogProjectId =
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID ||
    process.env.POSTHOG_PROJECT_ID;
  const posthogHost =
    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
    process.env.POSTHOG_HOST ||
    'https://eu.i.posthog.com';

  if (!posthogApiKey || !posthogProjectId) {
    throw new Error('Missing PostHog credentials');
  }

  console.log('🔍 Checking for events with abTest metadata...\n');

  // Check for events with our custom abTest property (sent from our code)
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - 24); // Last 24 hours

  const query = {
    kind: 'EventsQuery',
    select: ['uuid', 'event', 'timestamp', 'distinct_id', 'properties'],
    where: [
      // Look for our custom properties
      'properties.abTest IS NOT NULL OR properties.ab_test IS NOT NULL',
    ],
    after: startDate.toISOString(),
    limit: 100,
  };

  console.log(`Searching last 24 hours for events with abTest metadata...\n`);

  const response = await fetch(
    `${posthogHost}/api/projects/${posthogProjectId}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${posthogApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `PostHog API error: ${response.status} ${await response.text()}`,
    );
  }

  const data = await response.json();
  const events = data.results || [];

  console.log(`Found ${events.length} events with abTest metadata\n`);

  if (events.length > 0) {
    console.log('✅ SUCCESS! A/B test data IS being tracked!\n');

    // Group by test name and variant
    const testCounts: Record<string, Record<string, number>> = {};

    events.forEach((event: any) => {
      const props = event[4] || event.properties || {};
      const testName = props.abTest || props.ab_test;
      const variant = props.abVariant || props.ab_variant;

      if (testName) {
        if (!testCounts[testName]) testCounts[testName] = {};
        if (!testCounts[testName][variant]) testCounts[testName][variant] = 0;
        testCounts[testName][variant]++;
      }
    });

    console.log('Events by test and variant:');
    Object.entries(testCounts).forEach(([test, variants]) => {
      console.log(`\n  ${test}:`);
      Object.entries(variants).forEach(([variant, count]) => {
        console.log(`    ${variant}: ${count} events`);
      });
    });

    console.log('\n\n📋 Sample events:\n');
    events.slice(0, 3).forEach((event: any, i: number) => {
      const props = event[4] || event.properties || {};
      console.log(`Event ${i + 1}:`);
      console.log(`  Type: ${event[1]}`);
      console.log(`  Time: ${event[2]}`);
      console.log(`  Test: ${props.abTest || props.ab_test}`);
      console.log(`  Variant: ${props.abVariant || props.ab_variant}`);
      console.log(
        `  Page: ${props.page_path || props.$pathname || props.$current_url}`,
      );
      console.log('');
    });

    console.log(
      '\n💡 You can now run the backfill script to populate historical data!',
    );
    console.log('   pnpm tsx scripts/backfill-ab-test-data.ts --days=7\n');
  } else {
    console.log('❌ No events found with abTest metadata\n');
    console.log('This could mean:');
    console.log("1. The fixes haven't been deployed yet");
    console.log(
      '2. No users have visited the app in the last 24 hours (unlikely)',
    );
    console.log("3. The feature flags aren't being evaluated client-side\n");

    console.log('Let me check if there are ANY recent events...\n');

    // Check for any recent events
    const anyQuery = {
      kind: 'EventsQuery',
      select: ['event', 'timestamp'],
      where: ["event = 'app_opened' OR event = 'page_viewed'"],
      after: startDate.toISOString(),
      limit: 5,
    };

    const anyResponse = await fetch(
      `${posthogHost}/api/projects/${posthogProjectId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${posthogApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: anyQuery }),
      },
    );

    if (anyResponse.ok) {
      const anyData = await anyResponse.json();
      console.log(
        `Found ${anyData.results?.length || 0} recent app_opened/page_viewed events`,
      );

      if ((anyData.results?.length || 0) > 0) {
        console.log('\n✅ Events ARE being tracked');
        console.log(
          "❌ But they DON'T have abTest metadata (fixes not deployed yet)\n",
        );
        console.log('Next steps:');
        console.log('1. Deploy the fixes we made today');
        console.log('2. Wait 1-2 hours for new events');
        console.log('3. Run this script again to verify');
        console.log(
          '4. Then run the backfill: pnpm tsx scripts/backfill-ab-test-data.ts',
        );
      }
    }
  }
}

checkRecentABData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
