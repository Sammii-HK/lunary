#!/usr/bin/env tsx
/**
 * Script to manually run cron jobs
 * Usage: pnpm run:cron <cron-name>
 *
 * Available crons:
 *   - daily-posts: Generate daily social media posts
 *   - weekly-content: Generate weekly blog, newsletter, Substack, and social posts
 *   - daily-morning-notification: Send daily insight notification
 *   - moon-circles: Create moon circles for new/full moons
 *   - fx-drift: FX drift check and Discord notification
 *
 * Examples:
 *   pnpm run:cron daily-posts
 *   pnpm run:cron weekly-content
 *   pnpm run:cron daily-morning-notification
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables (try .env.local first, then .env)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const cronName = process.argv[2];

if (!cronName) {
  console.error('❌ Please provide a cron name');
  console.error('');
  console.error('Usage: pnpm run:cron <cron-name>');
  console.error('');
  console.error('Available crons:');
  console.error('  - daily-posts: Generate daily social media posts');
  console.error(
    '  - weekly-content: Generate weekly blog, newsletter, Substack, and social posts',
  );
  console.error(
    '  - daily-morning-notification: Send daily insight notification',
  );
  console.error('  - moon-circles: Create moon circles for new/full moons');
  console.error('  - fx-drift: FX drift check and Discord notification');
  console.error('');
  console.error('Examples:');
  console.error('  pnpm run:cron daily-posts');
  console.error('  pnpm run:cron weekly-content');
  process.exit(1);
}

// Map cron names to API endpoints
const cronEndpoints: Record<string, string> = {
  'daily-posts': '/api/cron/daily-posts',
  'weekly-content': '/api/cron/weekly-content',
  'daily-morning-notification': '/api/cron/daily-morning-notification',
  'moon-circles': '/api/cron/moon-circles',
  'fx-drift': '/api/cron/fx-drift',
};

const endpoint = cronEndpoints[cronName];

if (!endpoint) {
  console.error(`❌ Unknown cron name: ${cronName}`);
  console.error('');
  console.error('Available crons:');
  Object.keys(cronEndpoints).forEach((name) => {
    console.error(`  - ${name}`);
  });
  process.exit(1);
}

// Use localhost for testing, but the routes will still:
// - Use production database (via @vercel/postgres)
// - Use production image URLs (hardcoded in routes)
const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://lunary.app'
    : 'http://localhost:3000';

async function runCron() {
  try {
    // Check for CRON_SECRET
    if (!process.env.CRON_SECRET) {
      console.error('❌ CRON_SECRET is not set in your environment variables');
      console.error('');
      console.error('To fix this, add CRON_SECRET to your .env.local file:');
      console.error('  CRON_SECRET=your-secret-here');
      console.error('');
      console.error('Or pull from Vercel: vercel env pull .env.local');
      console.error('');
      console.error(
        'Or run with: CRON_SECRET=your-secret pnpm run:cron <cron-name>',
      );
      process.exit(1);
    }

    console.log(`🚀 Running cron: ${cronName}...`);
    console.log(`   Endpoint: ${baseUrl}${endpoint}`);
    console.log('');

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      if (response.status === 401) {
        console.error('❌ Authentication failed');
        console.error(
          '   Make sure CRON_SECRET is set correctly in your .env.local file',
        );
        console.error('   Or pull from Vercel: vercel env pull .env.local');
        console.error(`   Error: ${errorData.error || 'Unauthorized'}`);
      } else {
        console.error(`❌ Request failed with status ${response.status}`);
        console.error(`   Error: ${errorData.error || errorText}`);
      }
      process.exit(1);
    }

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      const text = await response.text();
      console.error('❌ Failed to parse response as JSON');
      console.error(`   Response status: ${response.status}`);
      console.error(
        `   Response body (first 500 chars): ${text.substring(0, 500)}`,
      );
      process.exit(1);
    }

    if (result.success !== false) {
      console.log('✅ Cron job completed successfully!');
      console.log('');

      // Pretty print the result
      if (result.notificationsSent !== undefined) {
        console.log(`   Notifications sent: ${result.notificationsSent}`);
      }
      if (result.failed !== undefined) {
        console.log(`   Failed: ${result.failed}`);
      }
      if (result.result?.successful !== undefined) {
        console.log(`   Successful: ${result.result.successful}`);
      }
      if (result.result?.failed !== undefined) {
        console.log(`   Failed: ${result.result.failed}`);
      }
      if (result.result?.recipientCount !== undefined) {
        console.log(`   Recipients: ${result.result.recipientCount}`);
      }
      if (result.blog) {
        console.log(`   Blog: ${result.blog.title || 'Generated'}`);
      }
      if (result.newsletter) {
        console.log(
          `   Newsletter: ${result.newsletter.sent ? 'Sent' : 'Failed'} (${result.newsletter.recipients || 0} recipients)`,
        );
      }
      if (result.socialPosts) {
        console.log(
          `   Social Posts: ${result.socialPosts.generated || 0} generated`,
        );
      }
      if (result.moonCircleGenerated) {
        console.log(
          `   Moon Circle: Created (${result.moonCircle?.phase || 'N/A'})`,
        );
      }

      // Print any other relevant data
      if (result.date) {
        console.log(`   Date: ${result.date}`);
      }
      if (result.checkTime) {
        console.log(`   Time: ${result.checkTime}`);
      }

      console.log('');
      console.log('📊 Full result:', JSON.stringify(result, null, 2));
    } else {
      console.error('❌ Cron job failed');
      console.error(
        `   Error: ${result.error || result.message || 'Unknown error'}`,
      );
      if (result.result) {
        console.error(`   Details: ${JSON.stringify(result.result, null, 2)}`);
      }
      console.error('');
      console.error('📊 Full response:', JSON.stringify(result, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

runCron();
