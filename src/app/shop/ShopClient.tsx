'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { ShopProduct, ShopCategory, CATEGORY_LABELS } from '@/lib/shop/types';
import { ProductCard } from '@/components/shop/ProductCard';
import { CategoryFilter } from '@/components/shop/CategoryFilter';
import { SeasonalHighlight } from '@/components/shop/SeasonalHighlight';
import { Pagination } from '@/components/shop/Pagination';

interface ShopClientProps {
  products: ShopProduct[];
  featuredProduct?: ShopProduct;
  currentPage?: number;
  totalPages?: number;
  totalProducts?: number;
  allProductCounts?: Record<ShopCategory | 'all', number>;
}

export function ShopClient({
  products,
  featuredProduct,
  currentPage = 1,
  totalPages = 1,
  totalProducts,
  allProductCounts,
}: ShopClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    ShopCategory | 'all'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get('from');
  const linkSuffix = fromParam ? `?from=${fromParam}` : '';

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.tagline.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.whatInside.some((item) => item.toLowerCase().includes(query)),
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const productCounts = useMemo(() => {
    // Use pre-calculated counts from server if available
    if (allProductCounts) {
      return allProductCounts;
    }

    // Fallback to calculating from current products
    const counts: Record<ShopCategory | 'all', number> = {
      all: products.length,
      spell: 0,
      crystal: 0,
      tarot: 0,
      seasonal: 0,
      astrology: 0,
      birthchart: 0,
      bundle: 0,
    };

    products.forEach((p) => {
      counts[p.category]++;
    });

    return counts;
  }, [products, allProductCounts]);

  return (
    <div className='min-h-screen bg-lunary-bg'>
      <div className='container mx-auto px-4 py-12 max-w-7xl'>
        <header className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-light text-white mb-4'>
            Digital Shop
          </h1>
          <p className='text-lg text-white/60 max-w-2xl mx-auto'>
            Curated packs of rituals, guides, and cosmic wisdom to deepen your
            practice. Instant access, beautifully crafted, forever yours.
          </p>
        </header>

        {featuredProduct && !searchQuery && (
          <div className='mb-12'>
            <SeasonalHighlight
              product={featuredProduct}
              label='Featured This Season'
              linkSuffix={linkSuffix}
            />
          </div>
        )}

        {/* Search Bar */}
        <div className='mb-8'>
          <div className='relative max-w-md mx-auto'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search packs...'
              className='w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-lunary-primary/50 focus:ring-1 focus:ring-lunary-primary/30 transition-all text-left'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all'
                aria-label='Clear search'
              >
                <X className='w-4 h-4' />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className='text-center text-sm text-white/50 mt-3'>
              {filteredProducts.length} result
              {filteredProducts.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          )}
        </div>

        <div className='mb-10'>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            productCounts={productCounts}
          />
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <h2 className='sr-only'>
              {selectedCategory === 'all'
                ? 'All Products'
                : CATEGORY_LABELS[selectedCategory]}
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 6}
                  linkSuffix={linkSuffix}
                />
              ))}
            </div>
          </>
        ) : (
          <div className='text-center py-16'>
            <p className='text-white/50 text-lg'>
              No products found in this category.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !searchQuery && selectedCategory === 'all' && (
          <div className='mt-12'>
            <Pagination currentPage={currentPage} totalPages={totalPages} />
            <p className='text-center text-sm text-white/40 mt-4'>
              Showing {products.length} of {totalProducts || products.length}{' '}
              packs
            </p>
          </div>
        )}

        <div className='mt-16 text-center'>
          <div className='bg-white/5 rounded-2xl p-8 max-w-2xl mx-auto border border-white/5'>
            <h2 className='text-xl font-medium text-white mb-3'>
              Instant Digital Access
            </h2>
            <p className='text-white/60 text-sm leading-relaxed'>
              All purchases are processed securely through Stripe. After
              payment, you receive instant access to your digital packs.
              Downloads are available for 30 days with up to 5 download
              attempts. Questions? Reach out anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
