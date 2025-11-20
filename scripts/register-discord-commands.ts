#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables (try .env.local first, then .env)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!DISCORD_APPLICATION_ID || !DISCORD_BOT_TOKEN) {
  console.error('Missing required environment variables:');
  console.error(
    '  DISCORD_APPLICATION_ID:',
    DISCORD_APPLICATION_ID ? '✓' : '✗',
  );
  console.error('  DISCORD_BOT_TOKEN:', DISCORD_BOT_TOKEN ? '✓' : '✗');
  console.error('\n💡 Make sure these are set in your .env.local file');
  process.exit(1);
}

// Validate token format (DISCORD_BOT_TOKEN is guaranteed to exist here)
const token = DISCORD_BOT_TOKEN!;
if (!token.startsWith('MT') && !token.match(/^[A-Za-z0-9._-]+$/)) {
  console.error('⚠️  Warning: DISCORD_BOT_TOKEN format looks incorrect');
  console.error(
    '   Bot tokens typically start with "MT" or contain alphanumeric characters',
  );
  console.error(`   Token length: ${token.length} characters`);
  console.error(`   Token preview: ${token.substring(0, 10)}...`);
}

const commands = [
  {
    name: 'moon',
    description: 'Get current moon phase with energy and sign',
    type: 1,
  },
  {
    name: 'events',
    description: "View today's cosmic events (retrogrades, aspects, ingresses)",
    type: 1,
  },
  {
    name: 'retrograde',
    description: 'Check current active retrogrades',
    type: 1,
  },
  {
    name: 'horoscope',
    description: 'Get daily horoscope for a zodiac sign',
    type: 1,
    options: [
      {
        name: 'sign',
        description: 'Your zodiac sign',
        type: 3,
        required: true,
        choices: [
          { name: 'Aries', value: 'Aries' },
          { name: 'Taurus', value: 'Taurus' },
          { name: 'Gemini', value: 'Gemini' },
          { name: 'Cancer', value: 'Cancer' },
          { name: 'Leo', value: 'Leo' },
          { name: 'Virgo', value: 'Virgo' },
          { name: 'Libra', value: 'Libra' },
          { name: 'Scorpio', value: 'Scorpio' },
          { name: 'Sagittarius', value: 'Sagittarius' },
          { name: 'Capricorn', value: 'Capricorn' },
          { name: 'Aquarius', value: 'Aquarius' },
          { name: 'Pisces', value: 'Pisces' },
        ],
      },
    ],
  },
  {
    name: 'cosmic',
    description: "Get today's primary cosmic event with link to app",
    type: 1,
  },
  {
    name: 'share-reading',
    description: 'Get instructions for sharing your readings in the channel',
    type: 1,
  },
  {
    name: 'app',
    description: 'Get a quick link to the Lunary app',
    type: 1,
  },
];

async function registerCommands() {
  const url = `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/commands`;
  const token = DISCORD_BOT_TOKEN!;

  console.log('Registering Discord commands...');
  console.log(`Application ID: ${DISCORD_APPLICATION_ID}`);
  console.log(`Commands to register: ${commands.length}`);
  console.log(`Token length: ${token.length} characters`);
  console.log(`Token starts with: ${token.substring(0, 5)}...`);

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${token}`,
      },
      body: JSON.stringify(commands),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('\n❌ Failed to register commands:');
      console.error(`Status: ${response.status}`);
      console.error(`Response: ${errorText}`);

      if (response.status === 401) {
        console.error('\n💡 Troubleshooting 401 Unauthorized:');
        console.error(
          '   1. Verify DISCORD_BOT_TOKEN is correct in .env.local',
        );
        console.error(
          '   2. Make sure you copied the full token (no extra spaces)',
        );
        console.error('   3. Check that the token matches the Application ID');
        console.error(
          '   4. Ensure the bot is added to your application (Bot section)',
        );
        console.error(
          '   5. Token should NOT include "Bot " prefix (script adds it)',
        );
      }

      process.exit(1);
    }

    const registered = await response.json();
    console.log(`✅ Successfully registered ${registered.length} commands:`);
    registered.forEach((cmd: any) => {
      console.log(`   - /${cmd.name}: ${cmd.description}`);
    });
  } catch (error) {
    console.error('Error registering commands:', error);
    process.exit(1);
  }
}

registerCommands();
