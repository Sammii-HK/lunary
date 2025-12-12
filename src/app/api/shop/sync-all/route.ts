/**
 * Batch Sync All Shop Products
 *
 * Generates PDFs, uploads to Blob, and creates Stripe products for all shop items.
 * Use ?limit=1 to test with a single product first.
 */

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import Stripe from 'stripe';

import { generateSpellPacks } from '@/lib/shop/generators/spell-packs';
import { generateCrystalPacks } from '@/lib/shop/generators/crystal-packs';
import { generateTarotPacks } from '@/lib/shop/generators/tarot-packs';
import { generateSeasonalPacks } from '@/lib/shop/generators/seasonal-packs';
import { generateAstrologyPacks } from '@/lib/shop/generators/astrology-packs';
import { generateBirthChartPacks } from '@/lib/shop/generators/birthchart-packs';
import { generateRetrogradePacks } from '@/lib/shop/generators/retrograde-packs';
import { ShopProduct } from '@/lib/shop/types';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

interface SyncResult {
  id: string;
  slug: string;
  category: string;
  status: 'success' | 'skipped' | 'error';
  blobUrl?: string;
  stripeProductId?: string;
  stripePriceId?: string;
  error?: string;
}

async function generatePdfForProduct(
  product: ShopProduct,
  baseUrl: string,
): Promise<Uint8Array | null> {
  const categoryMap: Record<string, string> = {
    spell: 'spell',
    crystal: 'crystal',
    tarot: 'tarot',
    seasonal: 'seasonal',
    astrology: 'astrology',
    birthchart: 'birthchart',
    retrograde: 'retrograde',
  };

  const category = categoryMap[product.category];
  if (!category) return null;

  const url = `${baseUrl}/api/packs/generate/${category}/${product.slug}`;
  console.log(`  📄 Generating PDF: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `PDF generation failed: ${response.status} ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

async function uploadToBlob(
  pdfBytes: Uint8Array,
  product: ShopProduct,
): Promise<string> {
  const blobKey = `shop/packs/${product.category}/${product.slug}.pdf`;
  console.log(`  ☁️ Uploading to Blob: ${blobKey}`);

  const { url } = await put(blobKey, Buffer.from(pdfBytes), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/pdf',
  });

  return url;
}

async function createStripeProduct(
  product: ShopProduct,
  blobUrl: string,
  fileSize: number,
  baseUrl: string,
): Promise<{ productId: string; priceId: string }> {
  const stripe = getStripe();

  const existingProducts = await stripe.products.search({
    query: `metadata['slug']:'${product.slug}'`,
    limit: 1,
  });

  if (existingProducts.data.length > 0) {
    const existing = existingProducts.data[0];
    console.log(`  ⚠️ Product already exists: ${existing.id}`);
    const prices = await stripe.prices.list({ product: existing.id, limit: 1 });
    return {
      productId: existing.id,
      priceId: prices.data[0]?.id || '',
    };
  }

  const ogImageUrl = `${baseUrl}/api/shop/og?category=${product.category}&name=${encodeURIComponent(product.title)}`;

  console.log(`  💳 Creating Stripe product: ${product.title}`);
  const stripeProduct = await stripe.products.create({
    name: product.title,
    description: product.description,
    images: [ogImageUrl],
    metadata: {
      slug: product.slug,
      category: product.category,
      packId: product.id,
      blobUrl: blobUrl,
      fileSize: fileSize.toString(),
      fileFormat: 'PDF',
      tagline: product.tagline.slice(0, 500),
    },
    active: true,
  });

  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: product.price,
    currency: 'usd',
    metadata: {
      slug: product.slug,
      category: product.category,
    },
  });

  await stripe.products.update(stripeProduct.id, {
    default_price: stripePrice.id,
  });

  console.log(`  ✅ Created: ${stripeProduct.id} / ${stripePrice.id}`);
  return {
    productId: stripeProduct.id,
    priceId: stripePrice.id,
  };
}

async function syncProduct(
  product: ShopProduct,
  baseUrl: string,
  dryRun: boolean,
): Promise<SyncResult> {
  console.log(`\n🔄 Syncing: ${product.title} (${product.category})`);

  try {
    const pdfBytes = await generatePdfForProduct(product, baseUrl);
    if (!pdfBytes) {
      return {
        id: product.id,
        slug: product.slug,
        category: product.category,
        status: 'error',
        error: 'Failed to generate PDF',
      };
    }

    if (dryRun) {
      console.log(
        `  🔍 [DRY RUN] Would upload ${pdfBytes.length} bytes to Blob`,
      );
      console.log(`  🔍 [DRY RUN] Would create Stripe product`);
      return {
        id: product.id,
        slug: product.slug,
        category: product.category,
        status: 'success',
        blobUrl: 'dry-run://blob-url',
        stripeProductId: 'prod_dry_run',
        stripePriceId: 'price_dry_run',
      };
    }

    const blobUrl = await uploadToBlob(pdfBytes, product);
    const { productId, priceId } = await createStripeProduct(
      product,
      blobUrl,
      pdfBytes.length,
      baseUrl,
    );

    return {
      id: product.id,
      slug: product.slug,
      category: product.category,
      status: 'success',
      blobUrl,
      stripeProductId: productId,
      stripePriceId: priceId,
    };
  } catch (error) {
    console.error(`  ❌ Error:`, error);
    return {
      id: product.id,
      slug: product.slug,
      category: product.category,
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    const category = searchParams.get('category');
    const dryRun = searchParams.get('dryRun') === 'true';
    const skipExisting = searchParams.get('skipExisting') !== 'false';

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000');

    console.log(`\n🚀 Starting batch sync`);
    console.log(`   Base URL: ${baseUrl}`);
    console.log(`   Limit: ${limit || 'all'}`);
    console.log(`   Category: ${category || 'all'}`);
    console.log(`   Dry Run: ${dryRun}`);
    console.log(`   Skip Existing: ${skipExisting}`);

    let allProducts: ShopProduct[] = [];

    if (!category || category === 'spell') {
      allProducts.push(...generateSpellPacks());
    }
    if (!category || category === 'crystal') {
      allProducts.push(...generateCrystalPacks());
    }
    if (!category || category === 'tarot') {
      allProducts.push(...generateTarotPacks());
    }
    if (!category || category === 'seasonal') {
      allProducts.push(...generateSeasonalPacks());
    }
    if (!category || category === 'astrology') {
      allProducts.push(...generateAstrologyPacks());
    }
    if (!category || category === 'birthchart') {
      allProducts.push(...generateBirthChartPacks());
    }
    if (!category || category === 'retrograde') {
      allProducts.push(...generateRetrogradePacks());
    }

    console.log(`\n📦 Found ${allProducts.length} products to sync`);

    if (limit > 0) {
      allProducts = allProducts.slice(0, limit);
      console.log(`   Limited to first ${limit} product(s)`);
    }

    const results: SyncResult[] = [];

    for (const product of allProducts) {
      const result = await syncProduct(product, baseUrl, dryRun);
      results.push(result);

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const successful = results.filter((r) => r.status === 'success').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const failed = results.filter((r) => r.status === 'error').length;

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log(`\n✅ Sync complete in ${duration}s`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);

    return NextResponse.json({
      success: true,
      summary: {
        total: allProducts.length,
        successful,
        skipped,
        failed,
        durationSeconds: duration,
      },
      results,
    });
  } catch (error) {
    console.error('Batch sync failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Batch Sync API',
    usage: {
      method: 'POST',
      params: {
        limit: 'Number of products to sync (default: all)',
        category:
          'Filter by category (spell, crystal, tarot, seasonal, astrology, birthchart, retrograde)',
        dryRun: 'Set to "true" to test without creating real resources',
        skipExisting: 'Set to "false" to re-sync existing products',
      },
      examples: [
        'POST /api/shop/sync-all?limit=1&dryRun=true',
        'POST /api/shop/sync-all?category=spell&limit=5',
        'POST /api/shop/sync-all',
      ],
    },
  });
}
