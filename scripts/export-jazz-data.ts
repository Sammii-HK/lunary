#!/usr/bin/env tsx
/**
 * Jazz Data Export Script
 *
 * Exports user profile data from Jazz Cloud to prepare for PostgreSQL migration.
 *
 * Prerequisites:
 * - JAZZ_WORKER_ACCOUNT and JAZZ_WORKER_SECRET in .env.local
 * - POSTGRES_URL in .env.local
 *
 * Run with: pnpm tsx scripts/export-jazz-data.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { sql } from '@vercel/postgres';
import { startWorker } from 'jazz-tools/worker';
import { co, z, Group } from 'jazz-tools';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// ============================================
// Jazz Schema (copied from production schema.ts)
// ============================================

const BirthChartPlanet = co.map({
  body: z.string(),
  sign: z.string(),
  degree: z.number(),
  minute: z.number(),
  eclipticLongitude: z.number(),
  retrograde: z.boolean(),
});

const PersonalCard = co.map({
  name: z.string(),
  keywords: co.list(z.string()),
  information: z.string(),
  calculatedDate: z.string(),
  reason: z.string(),
});

const BirthChart = co.list(BirthChartPlanet);

const Subscription = co.map({
  status: z.enum(['free', 'trial', 'active', 'cancelled', 'past_due']),
  plan: z.enum([
    'free',
    'monthly',
    'yearly',
    'lunary_plus',
    'lunary_plus_ai',
    'lunary_plus_ai_annual',
  ]),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  currentPeriodEnd: z.string().optional(),
  trialEndsAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const UserLocation = co.map({
  latitude: z.number(),
  longitude: z.number(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  lastUpdated: z.string(),
});

const NoteItem = co.map({
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const PushSubscription = co.map({
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string(),
  userAgent: z.string().optional(),
  createdAt: z.string(),
  preferences: co.map({
    moonPhases: z.boolean(),
    planetaryTransits: z.boolean(),
    retrogrades: z.boolean(),
    sabbats: z.boolean(),
    eclipses: z.boolean(),
    majorAspects: z.boolean(),
    moonCircles: z.boolean(),
  }),
});

const AccountRoot = co.map({
  notes: co.list(NoteItem),
  pushSubscriptions: co.list(PushSubscription).optional(),
});

const CustomProfile = co.map({
  name: z.string(),
  birthday: z.string(),
  birthTime: z.string().optional(),
  birthLocation: z.string().optional(),
  birthChart: BirthChart.optional(),
  personalCard: PersonalCard.optional(),
  subscription: Subscription.optional(),
  stripeCustomerId: z.string().optional(),
  location: UserLocation.optional(),
});

const DigitalPack = co.map({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum([
    'moon_phases',
    'crystals',
    'spells',
    'tarot',
    'astrology',
    'seasonal',
  ]),
  subcategory: z.string().optional(),
  price: z.number(),
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
  imageUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
  fileSize: z.number().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: co
    .map({
      dateRange: z.string().optional(),
      format: z.string().optional(),
      itemCount: z.number().optional(),
    })
    .optional(),
});

const Purchase = co.map({
  id: z.string(),
  userId: z.string(),
  packId: z.string(),
  stripeSessionId: z.string(),
  stripePaymentIntentId: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  amount: z.number(),
  downloadToken: z.string(),
  downloadCount: z.number(),
  maxDownloads: z.number(),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const ShopRoot = co.map({
  packs: co.list(DigitalPack),
  purchases: co.list(Purchase),
});

const MyAppAccount = co.account({
  root: AccountRoot,
  profile: CustomProfile,
  shop: ShopRoot.optional(),
});

// ============================================
// Export Types
// ============================================

interface ExportedProfile {
  userId: string;
  email: string;
  jazzAccountId?: string;
  profile: {
    name?: string;
    birthday?: string;
    birthTime?: string;
    birthLocation?: string;
    birthChart?: any[];
    personalCard?: any;
    subscription?: any;
    stripeCustomerId?: string;
    location?: any;
  } | null;
  notes: any[];
  exportedAt: string;
}

interface ExportData {
  exportedAt: string;
  userCount: number;
  profiles: ExportedProfile[];
  errors: { userId: string; email: string; error: string }[];
}

// ============================================
// Main Export Function
// ============================================

async function exportJazzData() {
  console.log('🚀 Jazz Data Export Script');
  console.log('==========================\n');

  // Check environment variables
  const jazzAccount = process.env.JAZZ_WORKER_ACCOUNT;
  const jazzSecret = process.env.JAZZ_WORKER_SECRET;
  const postgresUrl = process.env.POSTGRES_URL;

  if (!jazzAccount || !jazzSecret) {
    console.error('❌ Missing JAZZ_WORKER_ACCOUNT or JAZZ_WORKER_SECRET');
    console.error('   Please set these in your .env.local file');
    process.exit(1);
  }

  if (!postgresUrl) {
    console.error('❌ Missing POSTGRES_URL');
    console.error('   Please set this in your .env.local file');
    process.exit(1);
  }

  console.log('✅ Environment variables found');
  console.log(`   Jazz Account: ${jazzAccount.substring(0, 15)}...`);

  // Initialize Jazz worker
  console.log('\n📡 Connecting to Jazz Cloud...');
  let worker: any;

  try {
    const workerResult = await startWorker({
      AccountSchema: MyAppAccount,
      accountID: jazzAccount,
      accountSecret: jazzSecret,
      syncServer:
        process.env.JAZZ_SYNC_SERVER ||
        `wss://cloud.jazz.tools/?key=${process.env.JAZZ_SYNC_KEY}`,
      skipInboxLoad: true,
      asActiveAccount: false,
    });
    worker = workerResult.worker;
    console.log('✅ Connected to Jazz Cloud');
  } catch (error) {
    console.error('❌ Failed to connect to Jazz Cloud:', error);
    process.exit(1);
  }

  // Get all users from subscriptions table (since Better Auth user table may not exist)
  console.log('\n👥 Fetching users from database...');
  let users: { id: string; email: string; name: string | null }[] = [];

  try {
    // Try Better Auth user table first
    try {
      const result = await sql`
        SELECT id, email, name FROM "user" ORDER BY "createdAt" ASC
      `;
      users = result.rows as any[];
      console.log(`✅ Found ${users.length} users in Better Auth user table`);
    } catch {
      // Fallback to subscriptions table
      console.log(
        '   Better Auth user table not found, using subscriptions table...',
      );
      const result = await sql`
        SELECT user_id as id, user_email as email, NULL as name 
        FROM subscriptions 
        WHERE user_id IS NOT NULL
        GROUP BY user_id, user_email
        ORDER BY MIN(created_at) ASC
      `;
      users = result.rows as any[];
      console.log(`✅ Found ${users.length} users in subscriptions table`);
    }
  } catch (error) {
    console.error('❌ Failed to fetch users from PostgreSQL:', error);
    process.exit(1);
  }

  // Export each user's Jazz data
  console.log('\n📦 Exporting Jazz profiles...\n');

  const exportData: ExportData = {
    exportedAt: new Date().toISOString(),
    userCount: users.length,
    profiles: [],
    errors: [],
  };

  let exported = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    process.stdout.write(`   Processing ${user.email}... `);

    try {
      // Load Jazz account for this user
      const account = await MyAppAccount.load(user.id, {
        loadAs: worker,
        resolve: {
          profile: true,
          root: { notes: true },
        },
      });

      if (!account) {
        console.log('⚠️  No Jazz account found');
        skipped++;
        continue;
      }

      const profile = account.profile;
      const root = account.root;

      // Extract profile data
      const exportedProfile: ExportedProfile = {
        userId: user.id,
        email: user.email,
        jazzAccountId: account.id,
        profile: profile
          ? {
              name: (profile as any)?.name,
              birthday: (profile as any)?.birthday,
              birthTime: (profile as any)?.birthTime,
              birthLocation: (profile as any)?.birthLocation,
              birthChart: (profile as any)?.birthChart
                ? Array.from((profile as any).birthChart).map((p: any) => ({
                    body: p?.body,
                    sign: p?.sign,
                    degree: p?.degree,
                    minute: p?.minute,
                    eclipticLongitude: p?.eclipticLongitude,
                    retrograde: p?.retrograde,
                  }))
                : undefined,
              personalCard: (profile as any)?.personalCard
                ? {
                    name: (profile as any).personalCard?.name,
                    keywords: (profile as any).personalCard?.keywords
                      ? Array.from((profile as any).personalCard.keywords)
                      : [],
                    information: (profile as any).personalCard?.information,
                    calculatedDate: (profile as any).personalCard
                      ?.calculatedDate,
                    reason: (profile as any).personalCard?.reason,
                  }
                : undefined,
              subscription: (profile as any)?.subscription
                ? {
                    status: (profile as any).subscription?.status,
                    plan: (profile as any).subscription?.plan,
                    stripeCustomerId: (profile as any).subscription
                      ?.stripeCustomerId,
                    stripeSubscriptionId: (profile as any).subscription
                      ?.stripeSubscriptionId,
                    currentPeriodEnd: (profile as any).subscription
                      ?.currentPeriodEnd,
                    trialEndsAt: (profile as any).subscription?.trialEndsAt,
                  }
                : undefined,
              stripeCustomerId: (profile as any)?.stripeCustomerId,
              location: (profile as any)?.location
                ? {
                    latitude: (profile as any).location?.latitude,
                    longitude: (profile as any).location?.longitude,
                    city: (profile as any).location?.city,
                    country: (profile as any).location?.country,
                    timezone: (profile as any).location?.timezone,
                  }
                : undefined,
            }
          : null,
        notes: root?.notes
          ? Array.from(root.notes).map((n: any) => ({
              title: n?.title,
              content: n?.content,
              createdAt: n?.createdAt,
              updatedAt: n?.updatedAt,
            }))
          : [],
        exportedAt: new Date().toISOString(),
      };

      exportData.profiles.push(exportedProfile);
      exported++;

      const hasData =
        exportedProfile.profile?.name || exportedProfile.profile?.birthday;
      console.log(hasData ? '✅ Exported' : '⚪ Empty profile');
    } catch (error) {
      console.log('❌ Error');
      exportData.errors.push({
        userId: user.id,
        email: user.email,
        error: error instanceof Error ? error.message : String(error),
      });
      errors++;
    }
  }

  // Save export to file
  const outputPath = resolve(process.cwd(), 'jazz_export_data.json');
  writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

  // Summary
  console.log('\n==========================');
  console.log('📊 Export Summary');
  console.log('==========================');
  console.log(`   Total users: ${users.length}`);
  console.log(`   Exported: ${exported}`);
  console.log(`   Skipped (no Jazz account): ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log(`\n✅ Export saved to: ${outputPath}`);

  // Show profiles with data
  const profilesWithData = exportData.profiles.filter(
    (p) => p.profile?.name || p.profile?.birthday,
  );

  if (profilesWithData.length > 0) {
    console.log(`\n👥 Users with profile data (${profilesWithData.length}):`);
    for (const p of profilesWithData) {
      console.log(
        `   - ${p.email}: ${p.profile?.name || 'no name'}, birthday: ${p.profile?.birthday || 'none'}`,
      );
    }
  }

  process.exit(0);
}

// Run the export
exportJazzData().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
