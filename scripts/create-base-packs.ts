import Stripe from 'stripe';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable not found');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface BasePackConfig {
  category: string;
  name: string;
  description: string;
  price: number; // in cents
  emoji: string;
}

const BASE_PACKS: BasePackConfig[] = [
  {
    category: 'crystals',
    name: 'Crystal Guide Pack',
    description:
      'Complete guide to crystals with properties, uses, and care instructions. Perfect for beginners and experienced practitioners.',
    price: 499, // $4.99
    emoji: '💎',
  },
  {
    category: 'spells',
    name: 'Essential Spells Pack',
    description:
      'Collection of essential spells for protection, love, prosperity, and healing. Includes instructions and correspondences.',
    price: 499, // $4.99
    emoji: '✨',
  },
  {
    category: 'tarot',
    name: 'Tarot Reading Guide',
    description:
      'Comprehensive tarot guide with card meanings, spreads, and interpretation techniques. Master the art of tarot reading.',
    price: 699, // $6.99
    emoji: '🔮',
  },
  {
    category: 'astrology',
    name: 'Astrology Fundamentals',
    description:
      'Learn the fundamentals of astrology including signs, planets, houses, and aspects. Perfect for understanding your birth chart.',
    price: 699, // $6.99
    emoji: '⭐',
  },
  {
    category: 'seasonal',
    name: 'Seasonal Magic Guide',
    description:
      'Guide to seasonal magic, rituals, and correspondences for each season. Connect with the natural rhythms of the year.',
    price: 599, // $5.99
    emoji: '🌸',
  },
];

async function createBasePack(config: BasePackConfig, dryRun: boolean) {
  console.log(
    `\n${config.emoji} ${dryRun ? '[DRY RUN] ' : ''}Creating: ${config.name}`,
  );
  console.log(`   Category: ${config.category}`);
  console.log(`   Price: $${(config.price / 100).toFixed(2)}`);

  if (dryRun) {
    console.log('   ✅ [DRY RUN] Pack would be created');
    return;
  }

  try {
    // Check if pack already exists
    const existingProducts = await stripe.products.search({
      query: `metadata['category']:'${config.category}' AND name:'${config.name}'`,
      limit: 1,
    });

    if (existingProducts.data.length > 0) {
      console.log(`   ⚠️ Pack already exists: ${existingProducts.data[0].id}`);
      return;
    }

    // Generate pack via API
    const generateResponse = await fetch(
      `${BASE_URL}/api/shop/packs/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: config.category,
          name: config.name,
          description: config.description,
          price: config.price,
        }),
      },
    );

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      throw new Error(`Pack generation failed: ${errorText}`);
    }

    const { pack } = await generateResponse.json();
    console.log(`   📦 Pack generated: ${pack.id}`);

    // Sync to Stripe
    const syncResponse = await fetch(
      `${BASE_URL}/api/shop/packs/generate-and-sync`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: config.category,
          autoPublish: true,
          customNaming: {
            title: config.name,
            subtitle: config.description,
          },
        }),
      },
    );

    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      throw new Error(`Stripe sync failed: ${errorText}`);
    }

    const syncResult = await syncResponse.json();
    console.log(
      `   ✅ Pack synced to Stripe: ${syncResult.pack?.stripeProductId}`,
    );
  } catch (error: any) {
    console.error(`   ❌ Failed to create pack: ${error.message}`);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');

  console.log('🎯 Creating Base Packs');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Base URL: ${BASE_URL}\n`);

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No packs will be created\n');
  }

  try {
    for (const packConfig of BASE_PACKS) {
      await createBasePack(packConfig, dryRun);
    }

    console.log(
      `\n✅ ${dryRun ? 'Would create' : 'Created'} ${BASE_PACKS.length} base packs`,
    );
  } catch (error: any) {
    console.error('\n❌ Error creating base packs:', error.message);
    process.exit(1);
  }
}

main();
