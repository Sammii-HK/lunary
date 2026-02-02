// Crystal companion cards with horizontal scroll on mobile
'use client';

import { Badge } from '@/components/ui/badge';
import { Gem, Sparkles } from 'lucide-react';

interface CrystalRecommendation {
  date: Date | string;
  crystal: string;
  reason: string;
  usage?: string;
  chakra?: string;
  intention?: string;
  affirmation?: string;
}

interface CrystalCardsProps {
  crystals: CrystalRecommendation[];
}

// Color palette for crystal cards based on chakra or crystal name
function getCrystalColors(
  crystal: string,
  chakra?: string,
): {
  border: string;
  bg: string;
  accent: string;
} {
  const chakraColors: Record<
    string,
    { border: string; bg: string; accent: string }
  > = {
    root: {
      border: 'border-red-700/40',
      bg: 'bg-gradient-to-br from-red-950/30 to-zinc-900',
      accent: 'text-red-400',
    },
    sacral: {
      border: 'border-orange-700/40',
      bg: 'bg-gradient-to-br from-orange-950/30 to-zinc-900',
      accent: 'text-orange-400',
    },
    'solar plexus': {
      border: 'border-yellow-700/40',
      bg: 'bg-gradient-to-br from-yellow-950/30 to-zinc-900',
      accent: 'text-yellow-400',
    },
    heart: {
      border: 'border-emerald-700/40',
      bg: 'bg-gradient-to-br from-emerald-950/30 to-zinc-900',
      accent: 'text-emerald-400',
    },
    throat: {
      border: 'border-sky-700/40',
      bg: 'bg-gradient-to-br from-sky-950/30 to-zinc-900',
      accent: 'text-sky-400',
    },
    'third eye': {
      border: 'border-indigo-700/40',
      bg: 'bg-gradient-to-br from-indigo-950/30 to-zinc-900',
      accent: 'text-indigo-400',
    },
    crown: {
      border: 'border-purple-700/40',
      bg: 'bg-gradient-to-br from-purple-950/30 to-zinc-900',
      accent: 'text-purple-400',
    },
    all: {
      border: 'border-lunary-primary-700/40',
      bg: 'bg-gradient-to-br from-lunary-primary-950/30 to-zinc-900',
      accent: 'text-lunary-primary-400',
    },
  };

  // Check chakra first
  if (chakra) {
    const chakraKey = chakra.toLowerCase().replace(' chakra', '').trim();
    if (chakraColors[chakraKey]) {
      return chakraColors[chakraKey];
    }
    if (chakra.toLowerCase().includes('all')) {
      return chakraColors.all;
    }
  }

  // Default based on crystal name patterns
  const crystalLower = crystal.toLowerCase();
  if (crystalLower.includes('amethyst') || crystalLower.includes('purple')) {
    return chakraColors.crown;
  }
  if (crystalLower.includes('rose') || crystalLower.includes('green')) {
    return chakraColors.heart;
  }
  if (crystalLower.includes('citrine') || crystalLower.includes('yellow')) {
    return chakraColors['solar plexus'];
  }
  if (crystalLower.includes('lapis') || crystalLower.includes('blue')) {
    return chakraColors.throat;
  }
  if (crystalLower.includes('carnelian') || crystalLower.includes('orange')) {
    return chakraColors.sacral;
  }
  if (
    crystalLower.includes('garnet') ||
    crystalLower.includes('red') ||
    crystalLower.includes('obsidian')
  ) {
    return chakraColors.root;
  }

  // Default
  return chakraColors.all;
}

function formatChakra(chakra: string | undefined): string {
  if (!chakra) return '';
  if (chakra === 'All Chakras' || chakra === 'Alls Chakra') {
    return 'All Chakras';
  }
  return chakra.endsWith(' Chakra') ? chakra : `${chakra} Chakra`;
}

export function CrystalCards({ crystals }: CrystalCardsProps) {
  if (!crystals || crystals.length === 0) return null;

  return (
    <section className='space-y-6'>
      <h2 className='text-3xl font-bold flex items-center gap-2'>
        <Gem className='h-8 w-8' />
        Weekly Crystal Companions
      </h2>

      {/* Horizontal scroll container on mobile, grid on larger screens */}
      <div className='relative'>
        {/* Mobile horizontal scroll */}
        <div className='md:hidden'>
          <div className='flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent'>
            {crystals.map((crystal, index) => (
              <CrystalCard
                key={index}
                crystal={crystal}
                className='snap-start flex-shrink-0 w-72'
              />
            ))}
          </div>
          {/* Scroll indicator */}
          {crystals.length > 1 && (
            <div className='flex justify-center gap-1 mt-2'>
              {crystals.map((_, index) => (
                <div
                  key={index}
                  className='w-1.5 h-1.5 rounded-full bg-zinc-700'
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop/tablet grid */}
        <div className='hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {crystals.map((crystal, index) => (
            <CrystalCard key={index} crystal={crystal} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CrystalCardProps {
  crystal: CrystalRecommendation;
  className?: string;
}

export function CrystalCard({ crystal, className = '' }: CrystalCardProps) {
  const crystalDate =
    crystal.date instanceof Date ? crystal.date : new Date(crystal.date);
  const colors = getCrystalColors(crystal.crystal, crystal.chakra);

  return (
    <div
      className={`rounded-xl border ${colors.border} ${colors.bg} p-4 ${className}`}
    >
      {/* Header */}
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <div className={`p-1.5 rounded-lg bg-zinc-800/50 ${colors.accent}`}>
            <Sparkles className='h-4 w-4' />
          </div>
          <h3 className={`font-semibold ${colors.accent}`}>
            {crystal.crystal}
          </h3>
        </div>
      </div>

      {/* Date */}
      <p className='text-xs text-zinc-500 mb-3'>
        {crystalDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })}
      </p>

      {/* Reason */}
      <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
        {crystal.reason}
      </p>

      {/* Usage tip */}
      {crystal.usage && (
        <p className='text-xs text-zinc-400 italic mb-3 border-l-2 border-zinc-700 pl-2'>
          {crystal.usage}
        </p>
      )}

      {/* Affirmation */}
      {crystal.affirmation && (
        <p className='text-xs text-zinc-400 mb-3'>
          <span className='font-medium text-zinc-300'>Affirmation:</span> "
          {crystal.affirmation}"
        </p>
      )}

      {/* Tags */}
      <div className='flex flex-wrap gap-1.5 mt-auto'>
        {crystal.chakra && (
          <Badge
            variant='outline'
            className='text-xs border-zinc-700 text-zinc-400'
          >
            {formatChakra(crystal.chakra)}
          </Badge>
        )}
        {crystal.intention && (
          <Badge
            variant='secondary'
            className='text-xs bg-zinc-800 text-zinc-300'
          >
            {crystal.intention}
          </Badge>
        )}
      </div>
    </div>
  );
}
