/**
 * Test Discord Webhook
 *
 * Quick test to verify your Discord webhook is working
 *
 * Run with: npx ts-node scripts/test-discord-webhook.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function testWebhook() {
  if (!DISCORD_WEBHOOK_URL) {
    console.error('❌ Error: DISCORD_WEBHOOK_URL not found in .env.local');
    console.log('\nTo set it up:');
    console.log('1. Go to your Discord server settings');
    console.log('2. Integrations → Webhooks → New Webhook');
    console.log('3. Copy the webhook URL');
    console.log(
      '4. Add to .env.local: DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...\n',
    );
    process.exit(1);
  }

  console.log('🧪 Testing Discord webhook...\n');
  console.log(`Webhook URL: ${DISCORD_WEBHOOK_URL.substring(0, 50)}...\n`);

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: '🧪 Test Notification',
            description:
              'This is a test message from your weekly sync cron job setup!',
            color: 0x00ff00,
            fields: [
              { name: '✅ Status', value: 'Working correctly', inline: true },
              {
                name: '📅 Date',
                value: new Date().toLocaleString(),
                inline: true,
              },
            ],
            footer: { text: 'Weekly Subscription Sync' },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to send Discord notification');
      console.error(`Status: ${response.status}`);
      console.error(`Response: ${errorText}\n`);
      process.exit(1);
    }

    console.log(
      '✅ Success! Check your Discord channel for the test message.\n',
    );
  } catch (error: any) {
    console.error('❌ Error sending webhook:', error.message);
    process.exit(1);
  }
}

testWebhook();
