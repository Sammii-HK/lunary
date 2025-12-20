import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAllProducts, getProductBySlug } from '@/lib/shop/generators';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 300;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

interface StripeProductMapping {
  [packId: string]: {
    stripePriceId: string;
    stripeProductId: string;
  };
}

async function getStripeProductMappings(): Promise<StripeProductMapping> {
  try {
    const stripe = getStripe();
    const products = await stripe.products.list({
      active: true,
      limit: 100,
      expand: ['data.default_price'],
    });

    const mappings: StripeProductMapping = {};

    products.data.forEach((product) => {
      const packId = product.metadata?.packId || product.metadata?.slug;
      if (packId && product.default_price) {
        const price = product.default_price;
        if (typeof price === 'object' && price.type === 'one_time') {
          mappings[packId] = {
            stripePriceId: price.id,
            stripeProductId: product.id,
          };
        }
      }
    });

    return mappings;
  } catch (error) {
    console.error('Failed to fetch Stripe products:', error);
    return {};
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');

    if (slug) {
      const product = getProductBySlug(slug);
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 },
        );
      }

      const mappings = await getStripeProductMappings();
      const stripeData = mappings[product.id] || mappings[product.slug];

      return NextResponse.json({
        success: true,
        product: {
          ...product,
          stripePriceId: stripeData?.stripePriceId,
          stripeProductId: stripeData?.stripeProductId,
        },
      });
    }

    let products = getAllProducts();

    if (category && category !== 'all') {
      products = products.filter((p) => p.category === category);
    }

    const mappings = await getStripeProductMappings();

    const productsWithStripe = products.map((product) => {
      const stripeData = mappings[product.id] || mappings[product.slug];
      return {
        ...product,
        stripePriceId: stripeData?.stripePriceId,
        stripeProductId: stripeData?.stripeProductId,
        isAvailable: !!stripeData?.stripePriceId,
      };
    });

    return NextResponse.json(
      {
        success: true,
        products: productsWithStripe,
        total: productsWithStripe.length,
        availableForPurchase: productsWithStripe.filter((p) => p.isAvailable)
          .length,
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=300, stale-while-revalidate=150, max-age=300',
          'CDN-Cache-Control': 'public, s-maxage=300',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
        },
      },
    );
  } catch (error: any) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        details: error.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
