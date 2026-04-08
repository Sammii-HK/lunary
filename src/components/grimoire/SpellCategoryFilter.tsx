'use client';

export type SpellCategoryKey =
  | 'all'
  | 'protection'
  | 'love'
  | 'prosperity'
  | 'healing'
  | 'cleansing'
  | 'divination'
  | 'manifestation'
  | 'banishing'
  | 'moon-magic'
  | 'planetary-magic'
  | 'elemental-magic'
  | 'emotional-healing'
  | 'shadow-work'
  | 'self-love'
  | 'house-rituals'
  | 'sabbat-rituals';

interface SpellCategoryFilterProps {
  selectedCategory: SpellCategoryKey;
  onCategoryChange: (category: SpellCategoryKey) => void;
  spellCounts: Record<SpellCategoryKey, number>;
}

const CATEGORY_DISPLAY: Record<
  SpellCategoryKey,
  { label: string; icon: string }
> = {
  all: { label: 'All Spells', icon: '✨' },
  protection: { label: 'Protection', icon: '🛡️' },
  love: { label: 'Love', icon: '💖' },
  prosperity: { label: 'Prosperity', icon: '💰' },
  healing: { label: 'Healing', icon: '🌿' },
  cleansing: { label: 'Cleansing', icon: '🌊' },
  divination: { label: 'Divination', icon: '🔮' },
  manifestation: { label: 'Manifestation', icon: '🌟' },
  banishing: { label: 'Banishing', icon: '🌙' },
  'moon-magic': { label: 'Moon Magic', icon: '🌕' },
  'planetary-magic': { label: 'Planetary', icon: '☿️' },
  'elemental-magic': { label: 'Elemental', icon: '🔥' },
  'emotional-healing': { label: 'Emotional', icon: '💜' },
  'shadow-work': { label: 'Shadow Work', icon: '🖤' },
  'self-love': { label: 'Self-Love', icon: '💗' },
  'house-rituals': { label: 'House Rituals', icon: '🏠' },
  'sabbat-rituals': { label: 'Sabbats', icon: '🌾' },
};

export function SpellCategoryFilter({
  selectedCategory,
  onCategoryChange,
  spellCounts,
}: SpellCategoryFilterProps) {
  const categories = Object.entries(CATEGORY_DISPLAY).filter(
    ([key]) => spellCounts[key as SpellCategoryKey] > 0 || key === 'all',
  );

  return (
    <div className='flex flex-wrap justify-center gap-2'>
      {categories.map(([key, { label, icon }]) => {
        const isSelected = selectedCategory === key;
        const count = spellCounts[key as SpellCategoryKey];

        return (
          <button
            key={key}
            onClick={() => onCategoryChange(key as SpellCategoryKey)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              flex items-center gap-2
              ${
                isSelected
                  ? 'bg-lunary-primary text-white shadow-lg shadow-lunary-primary/25'
                  : 'bg-white/5 text-content-primary/70 hover:bg-white/10 hover:text-content-primary'
              }
            `}
          >
            <span>{icon}</span>
            <span>{label}</span>
            {count > 0 && (
              <span
                className={`
                  text-xs px-1.5 py-0.5 rounded-full
                  ${isSelected ? 'bg-white/20' : 'bg-white/10'}
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default SpellCategoryFilter;
