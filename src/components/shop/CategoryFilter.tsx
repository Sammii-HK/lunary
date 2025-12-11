'use client';

import { Button } from '@/components/ui/button';
import {
  ShopCategory,
  CATEGORY_LABELS,
  CATEGORY_GRADIENTS,
} from '@/lib/shop/types';

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
            variant={isSelected ? 'lunary' : 'ghost'}
            size='sm'
            onClick={() => onCategoryChange(category)}
            className={`
              rounded-full transition-all duration-300
              ${isSelected ? 'shadow-lg' : 'text-white/60 hover:text-white/80'}
            `}
            style={
              isSelected
                ? {
                    background:
                      category === 'all'
                        ? 'linear-gradient(135deg, #8458D8 0%, #D070E8 100%)'
                        : CATEGORY_GRADIENTS[category],
                    borderColor: 'transparent',
                  }
                : undefined
            }
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
