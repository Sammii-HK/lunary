import { NextRequest, NextResponse } from 'next/server';
import { generateGrimoirePack } from '../../packs/spells/route';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const dynamic = 'force-dynamic';

// Generate grimoire pack and automatically sync to Stripe as SSOT
export async function POST(request: NextRequest) {
  try {
    const { 
      category, 
      includeRituals = false, 
      customNaming = {},
      autoPublish = false 
    } = await request.json();

    console.log(`🏭 Generating and syncing ${category} pack to Stripe...`);

    // 1. Generate the grimoire pack with proper naming
    const packData = await generateGrimoirePackWithNaming(category, includeRituals, customNaming);
    
    // 2. Create Stripe product as SSOT
    const stripeProduct = await createStripeProduct(packData);
    
    // 3. Update pack with Stripe IDs
    const finalPack = {
      ...packData,
      stripeProductId: stripeProduct.product.id,
      stripePriceId: stripeProduct.price.id,
      stripeUrl: `https://buy.stripe.com/test_${stripeProduct.price.id}`, // Generate buy link
      isPublished: autoPublish,
      syncedAt: new Date().toISOString()
    };

    console.log(`✅ Pack created and synced: ${finalPack.sku}`);

    return NextResponse.json({
      success: true,
      message: `Pack "${finalPack.fullName}" created and synced to Stripe`,
      pack: finalPack,
      stripe: {
        productId: stripeProduct.product.id,
        priceId: stripeProduct.price.id,
        url: stripeProduct.url
      }
    });

  } catch (error) {
    console.error('Pack generation and sync error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate and sync pack',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Enhanced pack generation with naming
async function generateGrimoirePackWithNaming(
  category: string, 
  includeRituals: boolean, 
  customNaming: any
) {
  // Generate base pack using existing function
  const basePack = await generateGrimoirePack(category, includeRituals);
  
  // Override with custom naming if provided
  if (customNaming.title) basePack.title = customNaming.title;
  if (customNaming.subtitle) basePack.subtitle = customNaming.subtitle;
  if (customNaming.specialEvent) {
    // Regenerate naming with special event
    const metadata = {
      category,
      difficulty: 'intermediate',
      year: new Date().getFullYear(),
      specialEvent: customNaming.specialEvent,
      contentCount: {
        spells: basePack.spells?.length || 0,
        crystals: basePack.crystals?.length || 0,
        herbs: basePack.herbs?.length || 0,
        rituals: includeRituals ? 1 : 0
      }
    };
    
    const { generatePackNaming } = await import('../../../../../utils/grimoire/packNaming');
    const newNaming = generatePackNaming(metadata);
    
    Object.assign(basePack, {
      title: newNaming.title,
      subtitle: newNaming.subtitle,
      fullName: newNaming.fullName,
      series: newNaming.series,
      volume: newNaming.volume,
      edition: newNaming.edition,
      sku: newNaming.sku,
      slug: newNaming.slug
    });
  }
  
  return basePack;
}

// Create Stripe product with comprehensive metadata
async function createStripeProduct(packData: any) {
  console.log(`🛍️ Creating Stripe product: ${packData.fullName}`);

  // Create comprehensive Stripe product
  const product = await stripe.products.create({
    name: packData.fullName,
    description: packData.description,
    images: [], // Could add pack preview images
    metadata: {
      // Pack identification
      packId: packData.id,
      sku: packData.sku,
      slug: packData.slug,
      
      // Series and volume info
      series: packData.series,
      volume: packData.volume,
      edition: packData.edition,
      
      // Content metadata
      category: packData.category,
      spellCount: packData.spells?.length?.toString() || '0',
      crystalCount: packData.crystals?.length?.toString() || '0',
      herbCount: packData.herbs?.length?.toString() || '0',
      ritualCount: packData.rituals?.length?.toString() || '0',
      
      // Timing and correspondences
      bestDays: JSON.stringify(packData.timing?.bestDays || []),
      moonPhase: packData.timing?.moonPhase || '',
      planetaryHour: packData.timing?.planetaryHour || '',
      elements: JSON.stringify(packData.correspondences?.elements || []),
      
      // Shop metadata
      difficulty: packData.shopMetadata?.difficulty || 'intermediate',
      estimatedTime: packData.shopMetadata?.estimatedTime || '15-45 minutes',
      tags: JSON.stringify(packData.shopMetadata?.tags || []),
      searchKeywords: JSON.stringify(packData.shopMetadata?.searchKeywords || []),
      
      // Generation metadata
      grimoireType: 'grimoire-pack',
      generatedAt: new Date().toISOString(),
      contentHash: generateContentHash(packData),
    },
    active: true,
  });

  // Create Stripe price with proper metadata
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: packData.pricing?.amount || 249,
    currency: 'usd',
    metadata: {
      packId: packData.id,
      sku: packData.sku,
      series: packData.series,
      edition: packData.edition,
      compareAtPrice: packData.pricing?.compareAtPrice?.toString() || '',
    },
  });

  // Generate Stripe buy link
  const paymentLinks = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: {
      packId: packData.id,
      sku: packData.sku,
    },
  });

  console.log(`✅ Stripe product created: ${product.id}`);
  console.log(`💰 Stripe price created: ${price.id}`);
  console.log(`🔗 Payment link created: ${paymentLinks.id}`);

  return {
    product,
    price,
    paymentLink: paymentLinks,
    url: paymentLinks.url
  };
}

function generateContentHash(pack: any): string {
  const contentString = JSON.stringify({
    spells: pack.spells?.map((s: any) => s.id || s.title),
    crystals: pack.crystals?.map((c: any) => c.name),
    herbs: pack.herbs?.map((h: any) => h.name),
    correspondences: pack.correspondences,
  });
  
  let hash = 0;
  for (let i = 0; i < contentString.length; i++) {
    const char = contentString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
}

// Import the function from the other file
async function generateGrimoirePack(category: string, includeRituals: boolean) {
  // This would normally import from the spells route, but for now we'll call the API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app'}/api/packs/spells?category=${category}&rituals=${includeRituals}`);
  return await response.json();
}
