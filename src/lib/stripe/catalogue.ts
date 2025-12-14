// src/lib/stripe/catalogue.ts
import Stripe from 'stripe';
import { getShopListingsFromStripe } from '../shop/catalogue';

export type StripeShopItem = {
  slug: string;
  stripeProductId: string;
  stripePriceId: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number | null;
  currency: string | null;
  active: boolean;
  metadata: Record<string, string>;
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(key);
}

export async function listStripeShopItems(): Promise<StripeShopItem[]> {
  const stripe = getStripe();

  // Pull all active products and expand default_price
  const products: Stripe.Product[] = [];
  for await (const p of stripe.products.list({
    limit: 100,
    active: true,
    expand: ['data.default_price'],
  })) {
    products.push(p);
  }

  const items: StripeShopItem[] = [];

  for (const product of products) {
    const slug = product.metadata?.slug;
    if (!slug) continue; // ignore anything not created by your sync

    let stripePriceId: string | null = null;
    let priceCents: number | null = null;
    let currency: string | null = null;

    const dp = product.default_price;

    // default_price might be expanded object or string id or null
    if (dp && typeof dp !== 'string') {
      stripePriceId = dp.id;
      priceCents = dp.unit_amount ?? null;
      currency = dp.currency ?? null;
    } else if (typeof dp === 'string') {
      stripePriceId = dp;
      // fetch full price info
      const price = await stripe.prices.retrieve(dp);
      priceCents = price.unit_amount ?? null;
      currency = price.currency ?? null;
    } else {
      // fallback: list prices if default_price wasn't set
      const prices = await stripe.prices.list({
        product: product.id,
        limit: 1,
        active: true,
      });
      const p0 = prices.data[0];
      if (p0) {
        stripePriceId = p0.id;
        priceCents = p0.unit_amount ?? null;
        currency = p0.currency ?? null;
      }
    }

    items.push({
      slug,
      name: product.name,
      description: product.description,
      active: product.active,
      imageUrl: product.images?.[0] ?? null,
      stripeProductId: product.id,
      stripePriceId,
      priceCents,
      currency,
      metadata: product.metadata as Record<string, string>,
    });
  }

  // 🔥 debug so you can SEE the truth
  const missing = items.filter((i) => !i.stripePriceId);
  if (missing.length) {
    console.log(
      `[stripe shop] Missing stripePriceId for ${missing.length} products:`,
      missing.slice(0, 10).map((m) => m.slug),
    );
  }

  return items;
}

export async function getShopListingBySlugFromStripe(slug: string) {
  const all = await getShopListingsFromStripe();
  return all.find((p) => p.slug === slug);
}
