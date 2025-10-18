import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Sync grimoire packs with Stripe products as SSOT
export async function POST(request: NextRequest) {
  try {
    const { action, pack } = await request.json();

    switch (action) {
      case 'create':
        return await createStripeProduct(pack);
      case 'update':
        return await updateStripeProduct(pack);
      case 'sync-all':
        return await syncAllProducts();
      case 'get-products':
        return await getStripeProducts();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Stripe sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

async function createStripeProduct(pack: any) {
  console.log(`🛍️ Creating Stripe product for grimoire pack: ${pack.title}`);

  // Create Stripe product with grimoire pack metadata
  const product = await stripe.products.create({
    name: pack.title,
    description: pack.description,
    images: [], // Could add pack preview images later
    metadata: {
      // Grimoire-specific metadata
      packId: pack.id || generatePackId(pack.category, pack.title),
      category: pack.category,
      grimoireType: 'grimoire-pack',

      // Content metadata
      spellCount: pack.spells?.length?.toString() || '0',
      crystalCount: pack.crystals?.length?.toString() || '0',
      herbCount: pack.herbs?.length?.toString() || '0',

      // Timing metadata
      bestDays: JSON.stringify(pack.timing?.bestDays || []),
      moonPhase: pack.timing?.moonPhase || '',
      planetaryHour: pack.timing?.planetaryHour || '',

      // Generation metadata
      createdFrom: 'grimoire-generator',
      generatedAt: new Date().toISOString(),

      // Content hash for change detection
      contentHash: generateContentHash(pack),
    },
    active: true,
  });

  // Create Stripe price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: pack.metadata?.price || 249, // Default $2.49
    currency: 'usd',
    metadata: {
      packId: product.metadata.packId,
      category: pack.category,
      difficulty: pack.difficulty || 'beginner-intermediate',
      estimatedTime:
        pack.metadata?.estimatedTime || '15-45 minutes per practice',
    },
  });

  console.log(`✅ Stripe product created: ${product.id}`);
  console.log(`💰 Stripe price created: ${price.id}`);

  return NextResponse.json({
    success: true,
    stripeProductId: product.id,
    stripePriceId: price.id,
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      metadata: product.metadata,
      priceId: price.id,
      amount: price.unit_amount,
      currency: price.currency,
    },
  });
}

async function updateStripeProduct(pack: any) {
  if (!pack.stripeProductId) {
    throw new Error('Pack must have stripeProductId to update');
  }

  console.log(`🔄 Updating Stripe product: ${pack.stripeProductId}`);

  // Update Stripe product
  const product = await stripe.products.update(pack.stripeProductId, {
    name: pack.title,
    description: pack.description,
    metadata: {
      packId: pack.id,
      category: pack.category,
      grimoireType: 'grimoire-pack',
      spellCount: pack.spells?.length?.toString() || '0',
      crystalCount: pack.crystals?.length?.toString() || '0',
      herbCount: pack.herbs?.length?.toString() || '0',
      bestDays: JSON.stringify(pack.timing?.bestDays || []),
      moonPhase: pack.timing?.moonPhase || '',
      contentHash: generateContentHash(pack),
      updatedAt: new Date().toISOString(),
    },
    active: pack.isActive !== false,
  });

  return NextResponse.json({
    success: true,
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      metadata: product.metadata,
    },
  });
}

async function syncAllProducts() {
  console.log('🔄 Syncing all Stripe products with grimoire data...');

  // Get all Stripe products with grimoire metadata
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price'],
    limit: 100,
  });

  const grimoireProducts = products.data.filter(
    (product) => product.metadata?.grimoireType === 'grimoire-pack',
  );

  console.log(`Found ${grimoireProducts.length} grimoire products in Stripe`);

  // Get prices for all products
  const prices = await stripe.prices.list({
    active: true,
    limit: 100,
  });

  const productDetails = grimoireProducts.map((product) => {
    const productPrices = prices.data.filter(
      (price) => price.product === product.id,
    );

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      metadata: product.metadata,
      prices: productPrices.map((price) => ({
        id: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        metadata: price.metadata,
      })),
      active: product.active,
      created: product.created,
      updated: product.updated,
    };
  });

  return NextResponse.json({
    success: true,
    totalProducts: grimoireProducts.length,
    products: productDetails,
    lastSync: new Date().toISOString(),
  });
}

async function getStripeProducts() {
  // Get all active grimoire products from Stripe
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price'],
    limit: 100,
  });

  const prices = await stripe.prices.list({
    active: true,
    limit: 100,
  });

  const grimoireProducts = products.data
    .filter((product) => product.metadata?.grimoireType === 'grimoire-pack')
    .map((product) => {
      const productPrices = prices.data.filter(
        (price) => price.product === product.id,
      );

      return {
        stripeProductId: product.id,
        stripePriceId: productPrices[0]?.id,
        title: product.name,
        description: product.description,
        category: product.metadata?.category,

        // Reconstruct grimoire data from metadata
        spellCount: parseInt(product.metadata?.spellCount || '0'),
        crystalCount: parseInt(product.metadata?.crystalCount || '0'),
        herbCount: parseInt(product.metadata?.herbCount || '0'),

        timing: {
          bestDays: product.metadata?.bestDays
            ? JSON.parse(product.metadata.bestDays)
            : [],
          moonPhase: product.metadata?.moonPhase,
          planetaryHour: product.metadata?.planetaryHour,
        },

        metadata: {
          price: productPrices[0]?.unit_amount || 249,
          difficulty:
            productPrices[0]?.metadata?.difficulty || 'beginner-intermediate',
          estimatedTime:
            productPrices[0]?.metadata?.estimatedTime ||
            '15-45 minutes per practice',
        },

        isActive: product.active,
        createdAt: new Date(product.created * 1000).toISOString(),
        updatedAt: product.updated
          ? new Date(product.updated * 1000).toISOString()
          : null,

        // Stripe-specific data
        prices: productPrices.map((price) => ({
          id: price.id,
          amount: price.unit_amount,
          currency: price.currency,
        })),
      };
    });

  return NextResponse.json({
    success: true,
    products: grimoireProducts,
    total: grimoireProducts.length,
  });
}

// Helper functions
function generatePackId(category: string, title: string): string {
  const timestamp = Date.now();
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${category}-${slug}-${timestamp}`;
}

function generateContentHash(pack: any): string {
  // Generate a hash of the pack content for change detection
  const contentString = JSON.stringify({
    spells: pack.spells?.map((s: any) => s.id || s.title),
    crystals: pack.crystals?.map((c: any) => c.name),
    herbs: pack.herbs?.map((h: any) => h.name),
    correspondences: pack.correspondences,
  });

  // Simple hash function (in production, use crypto.createHash)
  let hash = 0;
  for (let i = 0; i < contentString.length; i++) {
    const char = contentString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}
