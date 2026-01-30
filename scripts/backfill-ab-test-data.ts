/**
 * Backfill A/B Test Data from PostHog
 *
 * This script fetches historical A/B test events from PostHog and inserts them
 * into the conversion_events table with proper abTest/abVariant metadata.
 *
 * Usage:
 *   tsx scripts/backfill-ab-test-data.ts [--days=30] [--dry-run]
 *
 * Options:
 *   --days=N    Number of days of historical data to backfill (default: 30)
 *   --dry-run   Preview what would be inserted without actually inserting
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import {
  canonicaliseEvent,
  insertCanonicalEventsBatch,
  type CanonicalEventType,
} from '../src/lib/analytics/canonical-events';

// PostHog test name -> Admin dashboard test name mapping
const POSTHOG_TEST_MAPPING: Record<string, string> = {
  pricing_cta_test: 'pricing_cta',
  pricing_display_test: 'pricing_price',
  onboarding_flow_test: 'onboarding_flow',
  upgrade_prompt_test: 'upgrade_prompt',
};

// PostHog variant normalization
function normalizeVariant(
  variant: string | boolean | undefined,
): 'A' | 'B' | null {
  if (variant === undefined || variant === null) return null;

  if (typeof variant === 'boolean') {
    return variant ? 'B' : 'A';
  }

  const normalized = variant.toString().toLowerCase();
  if (
    normalized === 'control' ||
    normalized === 'a' ||
    normalized === 'variant_a'
  ) {
    return 'A';
  }
  if (
    normalized === 'test' ||
    normalized === 'b' ||
    normalized === 'variant_b'
  ) {
    return 'B';
  }

  return null;
}

interface PostHogEvent {
  uuid: string;
  event: string;
  timestamp: string;
  distinct_id: string;
  properties: {
    // A/B test experiment properties (set by PostHog)
    $feature_flag?: string;
    $feature_flag_response?: string | boolean;

    // Custom properties you may have set
    abTest?: string;
    abVariant?: string | boolean;

    // User properties
    $user_id?: string;
    email?: string;
    plan_type?: string;
    trial_days_remaining?: number;

    // Page properties
    $current_url?: string;
    $pathname?: string;

    // Other metadata
    [key: string]: any;
  };
}

async function fetchPostHogEvents(daysBack: number): Promise<PostHogEvent[]> {
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

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  console.log(`Fetching PostHog events from ${startDate.toISOString()}...`);

  // Use PostHog's HogQL query API to fetch events with A/B test properties
  // See: https://posthog.com/docs/api/query
  const testNames = Object.keys(POSTHOG_TEST_MAPPING)
    .map((t) => `'${t}'`)
    .join(', ');

  const query = {
    kind: 'EventsQuery',
    select: ['uuid', 'event', 'timestamp', 'distinct_id', 'properties'],
    where: [
      // Filter for events with A/B test feature flags OR custom abTest property
      `(properties.$feature_flag IN [${testNames}]) OR (properties.abTest IS NOT NULL)`,
    ],
    after: startDate.toISOString(),
    limit: 10000,
  };

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
    const errorText = await response.text();
    throw new Error(`PostHog API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.results || [];
}

function transformPostHogEvent(event: PostHogEvent) {
  // Determine A/B test name and variant
  let testName: string | null = null;
  let variant: 'A' | 'B' | null = null;

  // Check for PostHog feature flag properties
  if (event.properties.$feature_flag) {
    const mappedTestName = POSTHOG_TEST_MAPPING[event.properties.$feature_flag];
    if (mappedTestName) {
      testName = mappedTestName;
      variant = normalizeVariant(event.properties.$feature_flag_response);
    }
  }

  // Check for custom abTest property (fallback)
  if (!testName && event.properties.abTest) {
    testName = event.properties.abTest;
    variant = normalizeVariant(event.properties.abVariant);
  }

  if (!testName || !variant) {
    return null; // Skip events without valid A/B test data
  }

  // Map PostHog event names to canonical event types
  const eventTypeMapping: Record<string, CanonicalEventType> = {
    pricing_page_viewed: 'pricing_page_viewed',
    $pageview: 'app_opened',
    upgrade_clicked: 'upgrade_clicked',
    trial_started: 'trial_started',
    subscription_started: 'subscription_started',
    trial_converted: 'trial_converted',
  };

  const canonicalEventType = eventTypeMapping[event.event];
  if (!canonicalEventType) {
    console.warn(`Skipping unknown event type: ${event.event}`);
    return null;
  }

  // Extract path from properties
  const pagePath = event.properties.$pathname || event.properties.$current_url;

  return canonicaliseEvent({
    eventType: canonicalEventType,
    eventId: event.uuid,
    userId: event.properties.$user_id || event.distinct_id,
    anonymousId: event.distinct_id,
    userEmail: event.properties.email,
    planType: event.properties.plan_type,
    trialDaysRemaining: event.properties.trial_days_remaining,
    pagePath: pagePath,
    metadata: {
      abTest: testName,
      abVariant: variant,
      // Preserve other relevant properties
      source: 'posthog_backfill',
    },
    createdAt: new Date(event.timestamp),
  });
}

async function main() {
  const args = process.argv.slice(2);
  const daysArg = args.find((arg) => arg.startsWith('--days='));
  const daysBack = daysArg ? parseInt(daysArg.split('=')[1]) : 30;
  const isDryRun = args.includes('--dry-run');

  console.log('=== PostHog A/B Test Data Backfill ===\n');
  console.log(`Days to backfill: ${daysBack}`);
  console.log(`Dry run: ${isDryRun}\n`);

  try {
    // Fetch events from PostHog
    console.log('Step 1: Fetching events from PostHog...');
    const posthogEvents = await fetchPostHogEvents(daysBack);
    console.log(
      `Found ${posthogEvents.length} PostHog events with A/B test data\n`,
    );

    if (posthogEvents.length === 0) {
      console.log('No events to backfill. Exiting.');
      return;
    }

    // Transform events
    console.log('Step 2: Transforming events...');
    const transformedEvents = posthogEvents
      .map(transformPostHogEvent)
      .filter(
        (result): result is { ok: true; row: any } =>
          result !== null && result.ok,
      );

    console.log(
      `Successfully transformed ${transformedEvents.length} events\n`,
    );

    if (transformedEvents.length === 0) {
      console.log('No valid events to insert. Exiting.');
      return;
    }

    // Show summary
    const testCounts = transformedEvents.reduce(
      (acc, event) => {
        const testName = event.row.metadata?.abTest;
        if (testName) {
          acc[testName] = (acc[testName] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log('Events by test:');
    Object.entries(testCounts).forEach(([test, count]) => {
      console.log(`  ${test}: ${count} events`);
    });
    console.log();

    if (isDryRun) {
      console.log('DRY RUN: Would insert these events:');
      console.log(JSON.stringify(transformedEvents.slice(0, 5), null, 2));
      console.log(`\n... and ${transformedEvents.length - 5} more events`);
      console.log('\nRun without --dry-run to actually insert the data.');
      return;
    }

    // Insert into database
    console.log('Step 3: Inserting into conversion_events table...');
    const rows = transformedEvents.map((e) => e.row);
    const result = await insertCanonicalEventsBatch(rows);

    console.log(`\n✅ Backfill complete!`);
    console.log(`  - Inserted: ${result.inserted} events`);
    console.log(`  - Duplicates skipped: ${result.duplicates} events`);
    console.log(`\nYou can now view A/B test results at /admin/ab-testing`);
  } catch (error) {
    console.error('Error during backfill:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
