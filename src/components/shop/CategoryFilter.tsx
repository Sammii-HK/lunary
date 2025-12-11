'use client';

import { Button } from '@/components/ui/button';
import { ShopCategory, CATEGORY_LABELS } from '@/lib/shop/types';

interface CategoryFilterProps {
  selectedCategory: ShopCategory | 'all';
  onCategoryChange: (category: ShopCategory | 'all') => void;
  productCounts?: Record<ShopCategory | 'all', number>;
}

const CATEGORIES: (ShopCategory | 'all')[] = [
  'all',
  'spell',
  'crystal',
  'tarot',
  'seasonal',
  'astrology',
  'birthchart',
  'bundle',
];

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  productCounts,
}: CategoryFilterProps) {
  return (
    <div className='flex flex-wrap gap-2 justify-center'>
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category;
        const label =
          category === 'all' ? 'All Packs' : CATEGORY_LABELS[category];
        const count = productCounts?.[category];

        return (
          <Button
            key={category}
            variant={isSelected ? 'lunary-solid' : 'outline'}
            size='sm'
            onClick={() => onCategoryChange(category)}
          >
            {label}
            {count !== undefined && (
              <span className='ml-1.5 text-xs opacity-70'>({count})</span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
