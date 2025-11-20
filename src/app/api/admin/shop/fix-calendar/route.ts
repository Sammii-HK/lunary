import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export const dynamic = 'force-dynamic';

async function checkAdminAuth(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const userEmail = session?.user?.email?.toLowerCase();
    const adminEmails = (
      process.env.ADMIN_EMAILS ||
      process.env.ADMIN_EMAIL ||
      ''
    )
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    return Boolean(userEmail && adminEmails.includes(userEmail));
  } catch (error) {
    console.error('Admin auth check failed:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { year } = await request.json();

    if (!year) {
      return NextResponse.json({ error: 'Year is required' }, { status: 400 });
    }

    const stripe = getStripe();
    const sku = `calendar-${year}`;

    // Find the calendar product
    // Try multiple search strategies since Stripe search has limitations
    let product = null;

    try {
      // First try by packId
      const byPackId = await stripe.products.search({
        query: `metadata['packId']:'${sku}'`,
        limit: 1,
      });

      if (byPackId.data.length > 0) {
        product = byPackId.data[0];
        console.log(`Found calendar by packId: ${product.id}`);
      }
    } catch (error) {
      console.warn('Search by packId failed:', error);
    }

    if (!product) {
      try {
        // Try by sku
        const bySku = await stripe.products.search({
          query: `metadata['sku']:'${sku}'`,
          limit: 1,
        });

        if (bySku.data.length > 0) {
          product = bySku.data[0];
          console.log(`Found calendar by sku: ${product.id}`);
        }
      } catch (error) {
        console.warn('Search by sku failed:', error);
      }
    }

    if (!product) {
      // Fallback: List all products and filter by year and category
      try {
        const allProducts = await stripe.products.list({
          limit: 100,
        });

        product = allProducts.data.find(
          (p) =>
            (p.metadata?.year === year.toString() ||
              p.metadata?.packId === sku ||
              p.metadata?.sku === sku) &&
            p.metadata?.category === 'calendar',
        );

        if (product) {
          console.log(`Found calendar by listing and filtering: ${product.id}`);
        }
      } catch (error) {
        console.error('Failed to list products:', error);
        throw new Error(
          `Failed to search for calendar: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    if (!product) {
      return NextResponse.json(
        { error: `Calendar for ${year} not found` },
        { status: 404 },
      );
    }

    // Check if product already has default_price
    if (product.default_price) {
      return NextResponse.json({
        success: true,
        message: 'Calendar already has default_price set',
        product: {
          id: product.id,
          name: product.name,
          defaultPrice: product.default_price,
        },
      });
    }

    // Get or create a price for the product
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 1,
    });

    let priceId: string;

    if (prices.data.length > 0) {
      priceId = prices.data[0].id;
      console.log(`Using existing price: ${priceId}`);
    } else {
      // Create a new price (default to $6.99)
      const newPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 699, // $6.99
        currency: 'usd',
        metadata: {
          packId: sku,
          year: year.toString(),
        },
      });
      priceId = newPrice.id;
      console.log(`Created new price: ${priceId}`);
    }

    // Generate OG image URL with calendar emoji
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const imageUrl = `${baseUrl}/api/shop/og?category=calendar&name=${encodeURIComponent(product.name)}&items=0`;

    // Set default_price and image on product
    const updatedProduct = await stripe.products.update(product.id, {
      default_price: priceId,
      images:
        product.images && product.images.length > 0
          ? product.images
          : [imageUrl],
    });

    console.log(
      `✅ Calendar fixed: ${updatedProduct.id} now has default_price and image`,
    );

    return NextResponse.json({
      success: true,
      message: `Calendar for ${year} fixed successfully`,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        defaultPrice: updatedProduct.default_price,
        priceId: priceId,
        image: updatedProduct.images?.[0] || imageUrl,
      },
    });
  } catch (error: any) {
    console.error('Failed to fix calendar:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fix calendar',
      },
      { status: 500 },
    );
  }
}
