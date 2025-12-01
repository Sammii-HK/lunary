import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { betterAuth } from 'better-auth';
import { JazzBetterAuthDatabaseAdapter } from 'jazz-tools/better-auth/database-adapter';
import { sql } from '@vercel/postgres';
import { scryptSync, randomBytes } from 'crypto';

async function extractJazzUsers() {
  console.log('=== Extracting Better Auth Users from Jazz ===\n');

  const JAZZ_WORKER_ACCOUNT = process.env.JAZZ_WORKER_ACCOUNT;
  const JAZZ_WORKER_SECRET = process.env.JAZZ_WORKER_SECRET;
  const JAZZ_SYNC_SERVER =
    process.env.JAZZ_SYNC_SERVER || 'wss://cloud.jazz.tools';

  if (!JAZZ_WORKER_ACCOUNT || !JAZZ_WORKER_SECRET) {
    console.error('❌ Missing JAZZ_WORKER_ACCOUNT or JAZZ_WORKER_SECRET');
    process.exit(1);
  }

  console.log('📡 Creating Better Auth instance with Jazz adapter...');
  console.log(`   Account: ${JAZZ_WORKER_ACCOUNT.substring(0, 20)}...`);

  try {
    // Create a Better Auth instance using the Jazz adapter
    const auth = betterAuth({
      database: JazzBetterAuthDatabaseAdapter({
        syncServer: JAZZ_SYNC_SERVER,
        accountID: JAZZ_WORKER_ACCOUNT,
        accountSecret: JAZZ_WORKER_SECRET,
        debugLogs: {
          isRunnerLogs: true,
        },
      }),
      secret: 'extract-script-secret',
      emailAndPassword: {
        enabled: true,
      },
    });

    console.log('✅ Better Auth instance created\n');

    // Wait for adapter to connect
    console.log('⏳ Waiting for Jazz connection...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Access internal adapter
    const internalAuth = auth as any;
    console.log('Auth keys:', Object.keys(internalAuth));

    // Try to access the database adapter
    if (internalAuth.$context) {
      console.log('Context keys:', Object.keys(internalAuth.$context));
    }

    if (internalAuth.adapter) {
      console.log('Adapter keys:', Object.keys(internalAuth.adapter));
    }

    // Try to list all sessions (which would reveal users)
    console.log('\n🔍 Trying to list sessions...');

    // The adapter should have internal methods
    const adapter = internalAuth.$context?.adapter || internalAuth.adapter;

    if (adapter) {
      console.log('Adapter methods:', Object.keys(adapter));

      // Try different methods
      if (typeof adapter.findMany === 'function') {
        const users = await adapter.findMany({ model: 'user' });
        console.log('Users via findMany:', users);
      }

      if (typeof adapter.list === 'function') {
        const users = await adapter.list('user');
        console.log('Users via list:', users);
      }
    }

    // Wait a bit more for data to sync
    await new Promise((resolve) => setTimeout(resolve, 3000));

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

extractJazzUsers();
