import { ShopClient } from './ShopClient';

interface DigitalPack {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  imageUrl?: string;
  stripePriceId?: string;
  isActive: boolean;
  metadata?: {
    dateRange?: string;
    format?: string;
    itemCount?: number;
  };
}

async function getProducts(): Promise<DigitalPack[]> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/shop/products`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.success) {
      return [];
    }

    return (data.packs || []).map((pack: any) => ({
      id: pack.id || 'unknown',
      name: pack.name || 'Unnamed Product',
      description: pack.description || '',
      category: pack.category || 'spells',
      subcategory: pack.subcategory,
      price: pack.price || 0,
      imageUrl: pack.imageUrl,
      stripePriceId: pack.stripePriceId,
      isActive: pack.isActive !== false,
      metadata: {
        dateRange: pack.metadata?.dateRange,
        format: pack.metadata?.format || 'PDF',
        itemCount: pack.metadata?.itemCount,
      },
    }));
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const packs = await getProducts();

  return <ShopClient initialPacks={packs} />;
}
