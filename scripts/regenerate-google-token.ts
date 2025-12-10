/**
 * Script to regenerate Google OAuth2 refresh token
 *
 * Usage:
 * 1. Run: npx tsx scripts/regenerate-google-token.ts
 * 2. Open the URL printed in the browser
 * 3. Authorize and copy the code from the redirect URL
 * 4. Paste the code when prompted
 * 5. Copy the new refresh token to your .env.local
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { google } from 'googleapis';
import * as readline from 'readline';

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/webmasters',
];

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      '❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment',
    );
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost',
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('\n🔑 Google OAuth2 Token Regeneration\n');
  console.log('1. Open this URL in your browser:\n');
  console.log(`   ${authUrl}\n`);
  console.log('2. Authorize the app');
  console.log('3. After redirect, copy the "code" parameter from the URL\n');
  console.log(
    '   Example: http://localhost:3000/...?code=4/0XXXXX <- copy this part\n',
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('4. Paste the code here: ', async (code) => {
    try {
      const { tokens } = await oauth2Client.getToken(code);

      console.log('\n✅ Success! Add this to your .env.local:\n');
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);

      if (tokens.access_token) {
        console.log('Access token (expires in 1 hour):');
        console.log(`${tokens.access_token.substring(0, 50)}...\n`);
      }
    } catch (error: any) {
      console.error('\n❌ Error getting token:', error.message);
    }

    rl.close();
  });
}

main();
