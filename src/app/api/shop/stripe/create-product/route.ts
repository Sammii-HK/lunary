import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pack } = body;

    if (!pack || !pack.name || !pack.description || !pack.price) {
      return NextResponse.json(
        { error: 'Missing required pack data: name, description, price' },
        { status: 400 },
      );
    }

    console.log(`🛍️ Creating Stripe product for: ${pack.name}`);

    // Create Stripe product
    const product = await stripe.products.create({
      name: pack.name,
      description: pack.description,
      images: pack.imageUrl ? [pack.imageUrl] : [],
      metadata: {
        packId: pack.id,
        category: pack.category,
        subcategory: pack.subcategory || '',
        itemCount: pack.metadata?.itemCount?.toString() || '0',
        format: pack.metadata?.format || 'PDF',
        dateRange: pack.metadata?.dateRange || '',
      },
    });

    // Create Stripe price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: pack.price, // Price in cents
      currency: 'usd',
      metadata: {
        packId: pack.id,
        category: pack.category,
      },
    });

    console.log(`✅ Stripe product created: ${product.id}`);
    console.log(`💰 Stripe price created: ${price.id}`);

    return NextResponse.json({
      success: true,
      stripeProductId: product.id,
      stripePriceId: price.id,
      product,
      price,
    });
  } catch (error: any) {
    console.error('❌ Failed to create Stripe product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Stripe product' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { pack } = body;

    if (!pack || !pack.stripeProductId) {
      return NextResponse.json(
        { error: 'Missing pack data or Stripe product ID' },
        { status: 400 },
      );
    }

    console.log(`🔄 Updating Stripe product: ${pack.stripeProductId}`);

    // Update Stripe product
    const product = await stripe.products.update(pack.stripeProductId, {
      name: pack.name,
      description: pack.description,
      images: pack.imageUrl ? [pack.imageUrl] : [],
      active: pack.isActive,
      metadata: {
        packId: pack.id,
        category: pack.category,
        subcategory: pack.subcategory || '',
        itemCount: pack.metadata?.itemCount?.toString() || '0',
        format: pack.metadata?.format || 'PDF',
        dateRange: pack.metadata?.dateRange || '',
      },
    });

    console.log(`✅ Stripe product updated: ${product.id}`);

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error('❌ Failed to update Stripe product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update Stripe product' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing productId parameter' },
        { status: 400 },
      );
    }

    console.log(`🗑️ Deactivating Stripe product: ${productId}`);

    // Deactivate product instead of deleting (Stripe best practice)
    const product = await stripe.products.update(productId, {
      active: false,
    });

    console.log(`✅ Stripe product deactivated: ${product.id}`);

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error('❌ Failed to deactivate Stripe product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to deactivate Stripe product' },
      { status: 500 },
    );
  }
}
