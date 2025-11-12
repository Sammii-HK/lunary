'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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

export default function ShopPage() {
  const [packs, setPacks] = useState<DigitalPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Products', emoji: '🌟' },
    { id: 'moon_phases', name: 'Moon Phases', emoji: '🌙' },
    { id: 'calendar', name: 'Calendars', emoji: '📅' },
    { id: 'crystals', name: 'Crystals', emoji: '💎' },
    { id: 'spells', name: 'Spells', emoji: '✨' },
    { id: 'tarot', name: 'Tarot', emoji: '🔮' },
    { id: 'astrology', name: 'Astrology', emoji: '⭐' },
    { id: 'seasonal', name: 'Seasonal', emoji: '🌸' },
  ];

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      setLoading(true);

      // Fetch products from Stripe (SSOT)
      const response = await fetch('/api/shop/products');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load products');
      }

      // Transform to DigitalPack format
      const fetchedPacks: DigitalPack[] = (data.packs || []).map(
        (pack: any) => ({
          id: pack.id || 'unknown',
          name: pack.name || 'Unnamed Product',
          description: pack.description || '',
          category: pack.category || 'spells',
          subcategory: pack.subcategory,
          price: pack.price || 0,
          imageUrl: pack.imageUrl,
          stripePriceId: pack.stripePriceId, // For checkout
          isActive: pack.isActive !== false,
          metadata: {
            dateRange: pack.metadata?.dateRange,
            format: pack.metadata?.format || 'PDF',
            itemCount: pack.metadata?.itemCount,
          },
        }),
      );

      setPacks(fetchedPacks);
      console.log(
        `✅ Loaded ${fetchedPacks.length} products from Stripe (SSOT)`,
      );

      if (fetchedPacks.length === 0) {
        console.warn(
          '⚠️ No products found in Stripe. Make sure products have metadata: category, packId, or grimoireType',
        );
      }
    } catch (error: any) {
      console.error('Failed to load packs:', error);
      // Fallback to empty array on error
      setPacks([]);
      // Don't throw - just show empty state
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pack: DigitalPack) => {
    if (!pack.stripePriceId) {
      alert('This product is not available for purchase yet.');
      return;
    }

    try {
      setPurchaseLoading(pack.id);

      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packId: pack.id,
          stripePriceId: pack.stripePriceId,
          // userId is optional - Stripe tracks purchases by email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      alert(error.message || 'Purchase failed. Please try again.');
    } finally {
      setPurchaseLoading(null);
    }
  };

  const filteredPacks =
    selectedCategory === 'all'
      ? packs
      : packs.filter((pack) => pack.category === selectedCategory);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4'></div>
          <p className='text-slate-300'>Loading digital packs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-900 to-slate-800'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-6xl font-light text-white mb-4'>
            Digital Shop
          </h1>
          <p className='text-xl text-slate-300 max-w-2xl mx-auto'>
            Discover our collection of digital spiritual guides, created with
            care to support your journey.
          </p>
        </div>

        {/* Category Filter */}
        <div className='flex flex-wrap justify-center gap-3 mb-8'>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span className='mr-2'>{category.emoji}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {filteredPacks.map((pack) => (
            <div
              key={pack.id}
              className='bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden hover:border-purple-500/50 transition-all duration-300'
            >
              {/* Pack Image */}
              {pack.imageUrl && (
                <div className='aspect-square bg-slate-900 flex items-center justify-center relative'>
                  <Image
                    src={pack.imageUrl}
                    alt={pack.name}
                    fill
                    className='object-cover'
                    unoptimized
                  />
                </div>
              )}

              {/* Pack Details */}
              <div className='p-6'>
                <div className='flex items-start justify-between mb-3'>
                  <h3 className='text-xl font-medium text-white'>
                    {pack.name}
                  </h3>
                  <span className='text-2xl font-bold text-purple-400'>
                    {formatPrice(pack.price)}
                  </span>
                </div>

                <p className='text-slate-300 text-sm mb-4 line-clamp-3'>
                  {pack.description}
                </p>

                {/* Pack Metadata */}
                {pack.metadata && (
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {pack.metadata.itemCount && (
                      <span className='px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded'>
                        {pack.metadata.itemCount} items
                      </span>
                    )}
                    {pack.metadata.format && (
                      <span className='px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded'>
                        {pack.metadata.format}
                      </span>
                    )}
                    {pack.metadata.dateRange && (
                      <span className='px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded'>
                        {pack.metadata.dateRange}
                      </span>
                    )}
                  </div>
                )}

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(pack)}
                  disabled={purchaseLoading === pack.id || !pack.isActive}
                  className='w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors'
                >
                  {purchaseLoading === pack.id ? (
                    <span className='flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Processing...
                    </span>
                  ) : !pack.isActive ? (
                    'Unavailable'
                  ) : (
                    `Purchase for ${formatPrice(pack.price)}`
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPacks.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-slate-400 text-lg'>
              No products found in this category.
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className='mt-16 text-center'>
          <div className='bg-slate-800/30 rounded-xl p-6 max-w-2xl mx-auto'>
            <h3 className='text-lg font-medium text-white mb-3'>
              Secure Digital Downloads
            </h3>
            <p className='text-slate-300 text-sm'>
              All purchases are processed securely through Stripe. After
              payment, you'll receive instant access to download your digital
              products. Downloads are available for 30 days with up to 5
              download attempts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
