/**
 * Debug PostHog Events - See what's actually stored
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function debugPostHogEvents() {
  const posthogApiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const posthogProjectId =
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID ||
    process.env.POSTHOG_PROJECT_ID;
  const posthogHost =
    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
    process.env.POSTHOG_HOST ||
    'https://eu.i.posthog.com';

  if (!posthogApiKey) {
    throw new Error(
      'POSTHOG_PERSONAL_API_KEY environment variable not set. ' +
        'Create one at: https://posthog.com/settings/user-api-keys',
    );
  }

  if (!posthogProjectId) {
    throw new Error(
      'POSTHOG_PROJECT_ID or NEXT_PUBLIC_POSTHOG_PROJECT_ID environment variable not set',
    );
  }

  console.log('🔍 Debugging PostHog Events\n');
  console.log(`PostHog Host: ${posthogHost}`);
  console.log(`PostHog Project ID: ${posthogProjectId}\n`);

  // Fetch recent events to see what properties they have
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7); // Last 7 days

  console.log(`Fetching events from ${startDate.toISOString()}...\n`);

  // Query 1: Get ANY recent events to see what we're working with
  console.log('=== Query 1: Recent app_opened events ===\n');
  try {
    const query1 = {
      kind: 'EventsQuery',
      select: ['uuid', 'event', 'timestamp', 'distinct_id', 'properties'],
      where: ["event = 'app_opened'"],
      after: startDate.toISOString(),
      limit: 5,
    };

    const response1 = await fetch(
      `${posthogHost}/api/projects/${posthogProjectId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${posthogApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query1 }),
      },
    );

    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`Found ${data1.results?.length || 0} app_opened events`);
      if (data1.results && data1.results.length > 0) {
        console.log('\nSample event properties:');
        console.log(JSON.stringify(data1.results[0], null, 2));
      }
    } else {
      console.log(`Error: ${response1.status} ${await response1.text()}`);
    }
  } catch (error) {
    console.log(`Error fetching app_opened events:`, error);
  }

  // Query 2: Check for events with $active_feature_flags
  console.log('\n=== Query 2: Events with $active_feature_flags ===\n');
  try {
    const query2 = {
      kind: 'EventsQuery',
      select: ['uuid', 'event', 'timestamp', 'properties'],
      where: ['properties.$active_feature_flags IS NOT NULL'],
      after: startDate.toISOString(),
      limit: 5,
    };

    const response2 = await fetch(
      `${posthogHost}/api/projects/${posthogProjectId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${posthogApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query2 }),
      },
    );

    if (response2.ok) {
      const data2 = await response2.json();
      console.log(
        `Found ${data2.results?.length || 0} events with $active_feature_flags`,
      );
      if (data2.results && data2.results.length > 0) {
        console.log('\nSample event with feature flags:');
        const sample = data2.results[0];
        console.log(`Event: ${sample[1]}`);
        console.log(`$active_feature_flags:`, sample[3]?.$active_feature_flags);
        console.log('\nAll properties:');
        console.log(JSON.stringify(sample[3], null, 2));
      }
    } else {
      console.log(`Error: ${response2.status} ${await response2.text()}`);
    }
  } catch (error) {
    console.log(`Error fetching events with $active_feature_flags:`, error);
  }

  // Query 3: Check for $feature_flag_called events
  console.log('\n=== Query 3: $feature_flag_called events ===\n');
  try {
    const query3 = {
      kind: 'EventsQuery',
      select: ['uuid', 'event', 'timestamp', 'properties'],
      where: ["event = '$feature_flag_called'"],
      after: startDate.toISOString(),
      limit: 5,
    };

    const response3 = await fetch(
      `${posthogHost}/api/projects/${posthogProjectId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${posthogApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query3 }),
      },
    );

    if (response3.ok) {
      const data3 = await response3.json();
      console.log(
        `Found ${data3.results?.length || 0} $feature_flag_called events`,
      );
      if (data3.results && data3.results.length > 0) {
        console.log('\nSample feature flag call:');
        const sample = data3.results[0];
        console.log(`Timestamp: ${sample[2]}`);
        console.log(`$feature_flag:`, sample[3]?.$feature_flag);
        console.log(
          `$feature_flag_response:`,
          sample[3]?.$feature_flag_response,
        );
        console.log('\nAll properties:');
        console.log(JSON.stringify(sample[3], null, 2));
      }
    } else {
      console.log(`Error: ${response3.status} ${await response3.text()}`);
    }
  } catch (error) {
    console.log(`Error fetching $feature_flag_called events:`, error);
  }

  // Query 4: Check for page_viewed events with metadata
  console.log('\n=== Query 4: page_viewed events ===\n');
  try {
    const query4 = {
      kind: 'EventsQuery',
      select: ['uuid', 'event', 'timestamp', 'properties'],
      where: ["event = 'page_viewed'"],
      after: startDate.toISOString(),
      limit: 5,
    };

    const response4 = await fetch(
      `${posthogHost}/api/projects/${posthogProjectId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${posthogApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query4 }),
      },
    );

    if (response4.ok) {
      const data4 = await response4.json();
      console.log(`Found ${data4.results?.length || 0} page_viewed events`);
      if (data4.results && data4.results.length > 0) {
        console.log('\nSample page_viewed event properties:');
        const sample = data4.results[0];
        console.log(`Event: ${sample[1]}`);
        console.log(`Properties keys:`, Object.keys(sample[3] || {}));

        // Check for any A/B test related properties
        const props = sample[3] || {};
        const abTestProps = Object.keys(props).filter(
          (k) =>
            k.includes('feature') ||
            k.includes('flag') ||
            k.includes('test') ||
            k.includes('variant') ||
            k.includes('ab'),
        );
        if (abTestProps.length > 0) {
          console.log('\nA/B test related properties:');
          abTestProps.forEach((key) => {
            console.log(`  ${key}:`, props[key]);
          });
        }
      }
    } else {
      console.log(`Error: ${response4.status} ${await response4.text()}`);
    }
  } catch (error) {
    console.log(`Error fetching page_viewed events:`, error);
  }

  // Summary
  console.log('\n=== Summary ===\n');
  console.log('Possible reasons for 0 A/B test events:\n');
  console.log('1. PostHog is not recording feature flag data with events');
  console.log(
    '   - Check if "Send feature flag information with events" is enabled in PostHog',
  );
  console.log(
    '   - Go to: Project Settings → Feature Flags → Advanced → Enable "Send feature flag info"',
  );
  console.log('\n2. Feature flags are stored in $active_feature_flags (array)');
  console.log(
    '   - The backfill script may need to be updated to use this format',
  );
  console.log('\n3. No users were actually in A/B tests during this period');
  console.log(
    '   - Check PostHog dashboard to see if feature flags were active',
  );
  console.log("\n4. Feature flag names in the script don't match PostHog");
  console.log('   - Check the test names above against POSTHOG_TEST_MAPPING');
}

debugPostHogEvents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
