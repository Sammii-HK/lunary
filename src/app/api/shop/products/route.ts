import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request: NextRequest) {
  try {
    console.log('🛍️ Fetching products from Stripe (SSOT)...');

    // Fetch all active products from Stripe (SSOT)
    const products = await stripe.products.list({
      active: true,
      limit: 100,
      expand: ['data.default_price'],
    });

    // Filter products that are shop packs (have grimoireType metadata or packId or category)
    // Also include products without metadata if they have a price (for debugging)
    const shopProducts = products.data.filter((product) => {
      const hasMetadata =
        product.metadata?.grimoireType === 'grimoire-pack' ||
        product.metadata?.packId ||
        product.metadata?.category;

      // Log products for debugging
      console.log(`Product: ${product.name}`, {
        id: product.id,
        hasMetadata,
        metadata: product.metadata,
        hasPrice: !!product.default_price,
      });

      return hasMetadata || (product.active && product.default_price);
    });

    // Transform Stripe products to shop format
    const packs = shopProducts
      .map((product) => {
        const price = product.default_price;
        const priceData =
          typeof price === 'object' && price !== null ? price : null;

        if (!priceData || priceData.type !== 'one_time') {
          return null;
        }

        // Get category from metadata or infer from product name
        const category =
          product.metadata?.category ||
          extractCategoryFromName(product.name) ||
          'spells';

        return {
          id: product.metadata?.packId || product.id,
          name: product.name,
          description: product.description || '',
          category,
          subcategory: product.metadata?.subcategory,
          price: priceData.unit_amount || 0,
          imageUrl:
            product.images?.[0] || generateOGImageUrl(product, category),
          stripeProductId: product.id,
          stripePriceId: priceData.id,
          isActive: product.active,
          metadata: {
            dateRange: product.metadata?.dateRange,
            format: product.metadata?.fileFormat || 'PDF',
            itemCount: parseInt(product.metadata?.itemCount || '0'),
            blobUrl: product.metadata?.blobUrl,
            blobKey: product.metadata?.blobKey,
          },
          createdAt: new Date(product.created * 1000).toISOString(),
        };
      })
      .filter((pack): pack is NonNullable<typeof pack> => pack !== null);

    console.log(`✅ Found ${packs.length} active shop products`);

    return NextResponse.json({
      success: true,
      packs,
      total: packs.length,
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch products from Stripe:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        details: error.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Helper to extract category from product name
function extractCategoryFromName(name: string): string | null {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('moon')) return 'moon_phases';
  if (lowerName.includes('crystal')) return 'crystals';
  if (lowerName.includes('spell') || lowerName.includes('ritual'))
    return 'spells';
  if (lowerName.includes('tarot')) return 'tarot';
  if (lowerName.includes('astrology') || lowerName.includes('birth chart'))
    return 'astrology';
  if (
    lowerName.includes('seasonal') ||
    lowerName.includes('sabbat') ||
    lowerName.includes('wheel')
  )
    return 'seasonal';
  return null;
}

// Helper to generate OG image URL
function generateOGImageUrl(product: Stripe.Product, category: string): string {
  const name = encodeURIComponent(product.name);
  const itemCount = product.metadata?.itemCount || '0';
  return `/api/shop/og?category=${category}&name=${name}&items=${itemCount}`;
}
