import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAdminAuth } from '@/lib/admin-auth';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { productId, category } = await request.json();

    if (!productId || !category) {
      return NextResponse.json(
        { error: 'Product ID and category are required' },
        { status: 400 },
      );
    }

    const stripe = getStripe();

    // Get current product
    const product = await stripe.products.retrieve(productId);

    // Update product metadata with new category
    const updatedProduct = await stripe.products.update(productId, {
      metadata: {
        ...product.metadata,
        category: category,
      },
    });

    // Also update price metadata if it exists
    if (product.default_price) {
      const priceId =
        typeof product.default_price === 'string'
          ? product.default_price
          : product.default_price.id;
      await stripe.prices.update(priceId, {
        metadata: {
          ...(typeof product.default_price === 'object'
            ? product.default_price.metadata || {}
            : {}),
          category: category,
        },
      });
    }

    console.log(`✅ Product ${productId} category updated to: ${category}`);

    return NextResponse.json({
      success: true,
      message: `Product category updated to ${category}`,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        category: updatedProduct.metadata?.category,
      },
    });
  } catch (error: any) {
    console.error('Failed to update category:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update category',
      },
      { status: 500 },
    );
  }
}
