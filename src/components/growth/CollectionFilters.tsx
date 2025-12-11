'use client';

import { useState } from 'react';
import {
  X,
  Sparkles,
  Moon,
  Heart,
  Flame,
  Mountain,
  Wind,
  Droplets,
} from 'lucide-react';

interface FilterChip {
  id: string;
  label: string;
  type: 'theme' | 'archetype' | 'suit' | 'mood';
  icon?: React.ReactNode;
}

interface CollectionFiltersProps {
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
  availableThemes?: string[];
  availableArchetypes?: string[];
  availableSuits?: string[];
  availableMoods?: string[];
  className?: string;
}

const SUIT_ICONS: Record<string, React.ReactNode> = {
  Cups: <Droplets className='w-3 h-3' />,
  Wands: <Flame className='w-3 h-3' />,
  Swords: <Wind className='w-3 h-3' />,
  Pentacles: <Mountain className='w-3 h-3' />,
};

const THEME_NAMES: Record<string, string> = {
  healing_the_heart: 'Healing the Heart',
  creative_rebirth: 'Creative Rebirth',
  shadow_integration: 'Shadow Integration',
  spiritual_awakening: 'Spiritual Awakening',
  identity_expansion: 'Identity Expansion',
  grounding_stability: 'Grounding & Stability',
  truth_seeking: 'Truth Seeking',
  connection_belonging: 'Connection & Belonging',
};

const ARCHETYPE_NAMES: Record<string, string> = {
  the_restorer: 'The Restorer',
  the_seeker: 'The Seeker',
  the_catalyst: 'The Catalyst',
  the_grounded_one: 'The Grounded One',
  the_empath: 'The Empath',
  the_shadow_dancer: 'The Shadow Dancer',
  the_visionary: 'The Visionary',
  the_mystic: 'The Mystic',
  the_protector: 'The Protector',
  the_heart_opener: 'The Heart Opener',
  the_lunar_weaver: 'The Lunar Weaver',
  the_alchemist: 'The Alchemist',
};

export function CollectionFilters({
  activeFilters,
  onFilterChange,
  availableThemes = [],
  availableArchetypes = [],
  availableSuits = [],
  availableMoods = [],
  className = '',
}: CollectionFiltersProps) {
  const [showAll, setShowAll] = useState(false);

  const allChips: FilterChip[] = [];

  availableThemes.forEach((theme) => {
    allChips.push({
      id: `theme:${theme}`,
      label: THEME_NAMES[theme] || theme,
      type: 'theme',
      icon: <Sparkles className='w-3 h-3' />,
    });
  });

  availableArchetypes.forEach((archetype) => {
    allChips.push({
      id: `archetype:${archetype}`,
      label: ARCHETYPE_NAMES[archetype] || archetype,
      type: 'archetype',
      icon: <Moon className='w-3 h-3' />,
    });
  });

  availableSuits.forEach((suit) => {
    allChips.push({
      id: `suit:${suit}`,
      label: suit,
      type: 'suit',
      icon: SUIT_ICONS[suit] || null,
    });
  });

  availableMoods.slice(0, 5).forEach((mood) => {
    allChips.push({
      id: `mood:${mood}`,
      label: mood,
      type: 'mood',
      icon: <Heart className='w-3 h-3' />,
    });
  });

  const displayChips = showAll ? allChips : allChips.slice(0, 6);

  const toggleFilter = (chipId: string) => {
    if (activeFilters.includes(chipId)) {
      onFilterChange(activeFilters.filter((f) => f !== chipId));
    } else {
      onFilterChange([...activeFilters, chipId]);
    }
  };

  const clearAll = () => {
    onFilterChange([]);
  };

  if (allChips.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className='flex items-center justify-between'>
        <p className='text-xs font-medium text-zinc-400'>Filter by</p>
        {activeFilters.length > 0 && (
          <button
            onClick={clearAll}
            className='text-xs text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Clear all
          </button>
        )}
      </div>

      <div className='flex flex-wrap gap-2'>
        {displayChips.map((chip) => {
          const isActive = activeFilters.includes(chip.id);
          return (
            <button
              key={chip.id}
              onClick={() => toggleFilter(chip.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors ${
                isActive
                  ? 'bg-lunary-primary-900/40 text-lunary-primary-300 border border-lunary-primary-700/50'
                  : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800/70'
              }`}
            >
              {chip.icon}
              <span>{chip.label}</span>
              {isActive && <X className='w-3 h-3 ml-0.5' />}
            </button>
          );
        })}

        {allChips.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className='text-xs text-zinc-400 hover:text-zinc-300 px-2'
          >
            {showAll ? 'Show less' : `+${allChips.length - 6} more`}
          </button>
        )}
      </div>
    </div>
  );
}

interface EntryChipsProps {
  lifeTheme?: string;
  primarySuit?: string;
  emotionalTag?: string;
  className?: string;
}

export function EntryChips({
  lifeTheme,
  primarySuit,
  emotionalTag,
  className = '',
}: EntryChipsProps) {
  const chips: Array<{ label: string; type: string; icon: React.ReactNode }> =
    [];

  if (lifeTheme && THEME_NAMES[lifeTheme]) {
    chips.push({
      label: THEME_NAMES[lifeTheme],
      type: 'theme',
      icon: <Sparkles className='w-2.5 h-2.5' />,
    });
  }

  if (primarySuit && SUIT_ICONS[primarySuit]) {
    chips.push({
      label: primarySuit,
      type: 'suit',
      icon: SUIT_ICONS[primarySuit],
    });
  }

  if (emotionalTag) {
    chips.push({
      label: emotionalTag,
      type: 'mood',
      icon: <Heart className='w-2.5 h-2.5' />,
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {chips.map((chip, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
            chip.type === 'theme'
              ? 'bg-lunary-primary-900/30 text-lunary-primary-300 border border-lunary-primary-700/30'
              : chip.type === 'suit'
                ? 'bg-amber-900/20 text-amber-300 border border-amber-700/30'
                : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/30'
          }`}
        >
          {chip.icon}
          {chip.label}
        </span>
      ))}
    </div>
  );
}
