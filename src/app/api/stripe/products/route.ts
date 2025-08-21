import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request: NextRequest) {
  try {
    // Get all products with their prices
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    // Get all prices to match with products
    const prices = await stripe.prices.list({
      active: true,
    });

    const productInfo = await Promise.all(
      products.data.map(async (product) => {
        // Find all prices for this product
        const productPrices = prices.data.filter(
          (price) => price.product === product.id
        );

        const priceDetails = await Promise.all(
          productPrices.map(async (price) => {
            // Check if this price has any associated trial period metadata
            const trialPeriodDays = 
              product.metadata?.trial_period_days || 
              price.metadata?.trial_period_days || 
              (price.recurring?.interval === 'month' ? '7' : '14'); // fallback to hardcoded

            return {
              id: price.id,
              amount: price.unit_amount,
              currency: price.currency,
              interval: price.recurring?.interval,
              interval_count: price.recurring?.interval_count,
              trial_period_days: parseInt(trialPeriodDays),
              metadata: price.metadata,
            };
          })
        );

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          metadata: product.metadata,
          prices: priceDetails,
        };
      })
    );

    return NextResponse.json({ products: productInfo });
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Function to get trial period for a specific price ID
export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Get the price and its associated product
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product'],
    });

    const product = price.product as Stripe.Product;

    // Determine trial period from product or price metadata, with fallbacks
    const trialPeriodDays =
      product.metadata?.trial_period_days ||
      price.metadata?.trial_period_days ||
      (price.recurring?.interval === 'month' ? '7' : '14'); // fallback

    return NextResponse.json({
      priceId: price.id,
      productId: product.id,
      productName: product.name,
      interval: price.recurring?.interval,
      trial_period_days: parseInt(trialPeriodDays),
      amount: price.unit_amount,
      currency: price.currency,
    });
  } catch (error) {
    console.error('Error fetching price trial period:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch price information',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 