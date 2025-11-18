// Shop utility functions

export interface DigitalPack {
  id: string;
  name: string;
  description: string;
  category:
    | 'moon_phases'
    | 'crystals'
    | 'spells'
    | 'tarot'
    | 'astrology'
    | 'seasonal';
  subcategory?: string;
  price: number; // in cents
  stripeProductId?: string;
  stripePriceId?: string;
  imageUrl?: string;
  downloadUrl?: string;
  fileSize?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    dateRange?: string;
    format?: string;
    itemCount?: number;
  };
}

export interface Purchase {
  id: string;
  userId: string;
  packId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number; // in cents
  downloadToken: string;
  downloadCount: number;
  maxDownloads: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function generatePackSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

export function getCategoryEmoji(category: string): string {
  const emojis: { [key: string]: string } = {
    moon_phases: '🌙',
    crystals: '💎',
    spells: '✨',
    tarot: '🔮',
    astrology: '⭐',
    seasonal: '🌸',
  };
  return emojis[category] || '📦';
}

export function getCategoryDisplayName(category: string): string {
  const names: { [key: string]: string } = {
    moon_phases: 'Moon Phases',
    crystals: 'Crystals',
    spells: 'Spells',
    tarot: 'Tarot',
    astrology: 'Astrology',
    seasonal: 'Seasonal',
  };
  return names[category] || category;
}

export function isDownloadExpired(purchase: Purchase): boolean {
  if (!purchase.expiresAt) return false;
  return new Date() > new Date(purchase.expiresAt);
}

export function canDownload(purchase: Purchase): boolean {
  return (
    purchase.status === 'completed' &&
    purchase.downloadCount < purchase.maxDownloads &&
    !isDownloadExpired(purchase)
  );
}

export function getRemainingDownloads(purchase: Purchase): number {
  return Math.max(0, purchase.maxDownloads - purchase.downloadCount);
}

export function getDownloadExpiryDays(purchase: Purchase): number | null {
  if (!purchase.expiresAt) return null;

  const now = new Date();
  const expiry = new Date(purchase.expiresAt);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

export function validatePackData(pack: Partial<DigitalPack>): string[] {
  const errors: string[] = [];

  if (!pack.name?.trim()) {
    errors.push('Pack name is required');
  }

  if (!pack.description?.trim()) {
    errors.push('Pack description is required');
  }

  if (!pack.category) {
    errors.push('Pack category is required');
  }

  if (typeof pack.price !== 'number' || pack.price <= 0) {
    errors.push('Pack price must be a positive number');
  }

  return errors;
}

export function getPackPreviewUrl(pack: DigitalPack): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const params = new URLSearchParams({
    category: pack.category,
    name: pack.name,
    items: pack.metadata?.itemCount?.toString() || '0',
  });

  return `${baseUrl}/api/shop/og?${params.toString()}`;
}

export function generateDownloadFilename(pack: DigitalPack): string {
  const slug = generatePackSlug(pack.name);
  const category = pack.category;
  const subcategory = pack.subcategory ? `_${pack.subcategory}` : '';
  const format = pack.metadata?.format?.toLowerCase() || 'pdf';

  return `${category}${subcategory}_${slug}.${format}`;
}

// Mock data for development
export function getMockPacks(): DigitalPack[] {
  return [
    {
      id: 'pack_moon_2025',
      name: 'Moon Phases 2025',
      description:
        'Complete guide to all moon phases throughout 2025, with detailed insights and spiritual guidance for each lunar cycle.',
      category: 'moon_phases',
      subcategory: '2025',
      price: 1999,
      imageUrl:
        '/api/shop/og?category=moon_phases&name=Moon%20Phases%202025&items=13',
      stripePriceId: 'price_mock_moon_2025',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        dateRange: '2025-01-01 to 2025-12-31',
        format: 'PDF',
        itemCount: 13,
      },
    },
    {
      id: 'pack_crystals_healing',
      name: 'Crystal Healing Guide',
      description:
        'Discover the power of crystals with this comprehensive guide featuring properties, uses, and healing techniques.',
      category: 'crystals',
      price: 1499,
      imageUrl:
        '/api/shop/og?category=crystals&name=Crystal%20Healing%20Guide&items=8',
      stripePriceId: 'price_mock_crystals',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        format: 'PDF',
        itemCount: 8,
      },
    },
    {
      id: 'pack_spells_protection',
      name: 'Protection Spells Collection',
      description:
        'Sacred rituals and spells for protection, cleansing, and spiritual defense.',
      category: 'spells',
      price: 1299,
      imageUrl:
        '/api/shop/og?category=spells&name=Protection%20Spells%20Collection&items=5',
      stripePriceId: 'price_mock_spells',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        format: 'PDF',
        itemCount: 5,
      },
    },
  ];
}
