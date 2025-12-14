// src/lib/shop/catalogue.ts
import { listStripeShopItems } from '@/lib/stripe/catalogue';
import { getProductBySlug } from '@/lib/shop/generators';
import type { ShopProduct } from '@/lib/shop/types';

export type ShopListingProduct = ShopProduct & {
  stripeProductId: string;
  stripePriceId?: string | null;
  stripeActive: boolean;
  stripeImageUrl?: string | null;
  stripePriceCents?: number | null;
  stripeCurrency?: string | null;
};

export async function getShopListingsFromStripe(): Promise<
  ShopListingProduct[]
> {
  const stripeItems = await listStripeShopItems();

  const mapped: ShopListingProduct[] = [];
  for (const item of stripeItems) {
    const local = getProductBySlug(item.slug);

    // If Stripe has it but local content is missing, still show it
    // Use Stripe name/description as fallback.
    const base: ShopProduct =
      local ??
      ({
        id: item.metadata.packId || item.slug,
        slug: item.slug,
        title: item.name,
        tagline: item.metadata.tagline || '',
        description: item.description || '',
        category: (item.metadata.category as any) || 'spell',
        whatInside: [],
        perfectFor: [],
        related: [],
        price: item.priceCents ?? 0,
        gradient: '',
      } satisfies ShopProduct);

    mapped.push({
      ...base,
      stripeProductId: item.stripeProductId,
      stripePriceId: item.stripePriceId,
      stripeActive: item.active,
      stripeImageUrl: item.imageUrl,
      stripePriceCents: item.priceCents,
      stripeCurrency: item.currency,
      // oplistStripeShopItemstionally override local price with Stripe price
      price: item.priceCents ?? base.price,
    });
  }

  return mapped;
}
