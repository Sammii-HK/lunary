'use client';

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Moon, Zap } from 'lucide-react';
import { ArchetypeEvolutionChart } from './ArchetypeEvolutionChart';

interface LifeTheme {
  id: string;
  name: string;
  score: number;
  shortSummary: string;
  sources: {
    journalEntries: number;
    tarotCards: string[];
    dreamTags: string[];
  };
}

interface LifeThemeSnapshot {
  type: 'life_themes';
  generatedAt: string;
  data: {
    themes: LifeTheme[];
    dominantTheme: string;
    timestamp: string;
  };
}

interface TarotSeasonSnapshot {
  type: 'tarot_season';
  generatedAt: string;
  data: {
    season: {
      name: string;
      suit: string;
      description: string;
    };
    dominantTheme: string;
    suitDistribution: Array<{
      suit: string;
      count: number;
      percentage: number;
    }>;
    frequentCards: Array<{
      name: string;
      count: number;
    }>;
    period: number;
    timestamp: string;
  };
}

interface MoonPhasePattern {
  type: 'tarot_moon_phase';
  generatedAt: string;
  data: {
    title: string;
    description: string;
    confidence: number;
    tier: string;
    data: {
      moonPhase: string;
      pullCount: number;
      totalPulls: number;
      percentage: number;
      timeWindow: {
        startDate: string;
        endDate: string;
        daysAnalyzed: number;
      };
    };
  };
}

interface ArchetypeSnapshot {
  type: 'archetype';
  generatedAt: string;
  data: {
    archetypes: Array<{
      name: string;
      strength: number;
      basedOn: string[];
    }>;
    dominantArchetype: string;
    timestamp: string;
  };
}

type PatternSnapshot =
  | LifeThemeSnapshot
  | TarotSeasonSnapshot
  | MoonPhasePattern
  | ArchetypeSnapshot;

interface PatternResponse {
  success: boolean;
  totalSnapshots: number;
  byType: Array<{
    type: string;
    count: number;
  }>;
  snapshots: {
    life_themes?: LifeThemeSnapshot[];
    tarot_season?: TarotSeasonSnapshot[];
    tarot_moon_phase?: MoonPhasePattern[];
    archetype?: ArchetypeSnapshot[];
  };
}

function LifeThemeCard({ snapshot }: { snapshot: LifeThemeSnapshot }) {
  const date = new Date(snapshot.generatedAt);
  const formattedDate = date.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const dominantTheme = snapshot.data.themes[0];

  return (
    <div className='bg-zinc-900 border border-lunary-primary-700/30 rounded-lg p-4'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <TrendingUp className='w-4 h-4 text-lunary-primary-400' />
          <span className='text-xs text-zinc-500'>{formattedDate}</span>
        </div>
        <span className='text-xs bg-lunary-primary-900/30 text-lunary-primary-300 px-2 py-0.5 rounded'>
          Score: {dominantTheme.score}
        </span>
      </div>

      <h3 className='text-base font-semibold text-white mb-1'>
        {dominantTheme.name}
      </h3>
      <p className='text-sm text-zinc-400 mb-3'>{dominantTheme.shortSummary}</p>

      <div className='flex flex-wrap gap-2 mb-3'>
        {snapshot.data.themes.slice(1, 3).map((theme) => (
          <span
            key={theme.id}
            className='text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded'
          >
            {theme.name} ({theme.score})
          </span>
        ))}
      </div>

      <div className='text-xs text-zinc-500'>
        <div>📖 {dominantTheme.sources.journalEntries} journal entries</div>
        {dominantTheme.sources.tarotCards.length > 0 && (
          <div>
            🃏 Cards: {dominantTheme.sources.tarotCards.slice(0, 3).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

function TarotSeasonCard({ snapshot }: { snapshot: TarotSeasonSnapshot }) {
  const date = new Date(snapshot.generatedAt);
  const formattedDate = date.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const topSuit = snapshot.data.suitDistribution[0];

  return (
    <div className='bg-zinc-900 border border-indigo-700/30 rounded-lg p-4'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <Sparkles className='w-4 h-4 text-indigo-400' />
          <span className='text-xs text-zinc-500'>{formattedDate}</span>
        </div>
        <span className='text-xs bg-indigo-900/30 text-indigo-300 px-2 py-0.5 rounded'>
          {snapshot.data.period} days
        </span>
      </div>

      <h3 className='text-base font-semibold text-white mb-1'>
        {snapshot.data.season.name}
      </h3>
      <p className='text-sm text-zinc-400 mb-3'>
        {snapshot.data.season.description}
      </p>

      <div className='mb-3'>
        <div className='text-xs text-zinc-500 mb-1'>Suit Distribution:</div>
        <div className='flex gap-1 h-2 rounded overflow-hidden'>
          {snapshot.data.suitDistribution.map((suit) => (
            <div
              key={suit.suit}
              className='bg-indigo-600'
              style={{ width: `${suit.percentage}%` }}
              title={`${suit.suit}: ${suit.percentage.toFixed(1)}%`}
            />
          ))}
        </div>
        <div className='text-xs text-zinc-500 mt-1'>
          {topSuit.suit}: {topSuit.percentage.toFixed(0)}%
        </div>
      </div>

      <div className='text-xs text-zinc-500'>
        <div>
          🃏 Top cards:{' '}
          {snapshot.data.frequentCards
            .slice(0, 3)
            .map((c) => c.name)
            .join(', ')}
        </div>
      </div>
    </div>
  );
}

function MoonPhasePatternCard({ snapshot }: { snapshot: MoonPhasePattern }) {
  const date = new Date(snapshot.generatedAt);
  const formattedDate = date.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className='bg-zinc-900 border border-zinc-700 rounded-lg p-4'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <Moon className='w-4 h-4 text-zinc-400' />
          <span className='text-xs text-zinc-500'>{formattedDate}</span>
        </div>
        <span className='text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded'>
          {(snapshot.data.confidence * 100).toFixed(0)}% confidence
        </span>
      </div>

      <h3 className='text-base font-semibold text-white mb-1'>
        {snapshot.data.title}
      </h3>
      <p className='text-sm text-zinc-400 mb-3'>{snapshot.data.description}</p>

      <div className='text-xs text-zinc-500'>
        <div>
          🃏 {snapshot.data.data.pullCount} pulls /{' '}
          {snapshot.data.data.totalPulls} total
        </div>
        <div>📅 {snapshot.data.data.timeWindow.daysAnalyzed} days analyzed</div>
      </div>
    </div>
  );
}

function ArchetypeCard({ snapshot }: { snapshot: ArchetypeSnapshot }) {
  const date = new Date(snapshot.generatedAt);
  const formattedDate = date.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const dominantArchetype = snapshot.data.archetypes[0];

  return (
    <div className='bg-zinc-900 border border-lunary-secondary-700/30 rounded-lg p-4'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <Sparkles className='w-4 h-4 text-lunary-secondary-400' />
          <span className='text-xs text-zinc-500'>{formattedDate}</span>
        </div>
        <span className='text-xs bg-lunary-secondary-900/30 text-lunary-secondary-300 px-2 py-0.5 rounded'>
          Strength: {dominantArchetype.strength}
        </span>
      </div>

      <h3 className='text-base font-semibold text-white mb-1'>
        {dominantArchetype.name}
      </h3>
      <p className='text-sm text-zinc-400 mb-3'>
        Your dominant archetype pattern for this period
      </p>

      <div className='flex flex-wrap gap-2 mb-3'>
        {snapshot.data.archetypes.slice(1, 3).map((archetype, idx) => (
          <span
            key={idx}
            className='text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded'
          >
            {archetype.name} ({archetype.strength})
          </span>
        ))}
      </div>

      {dominantArchetype.basedOn && dominantArchetype.basedOn.length > 0 && (
        <div className='text-xs text-zinc-500'>
          <div>
            Based on: {dominantArchetype.basedOn.slice(0, 3).join(', ')}
            {dominantArchetype.basedOn.length > 3 && '...'}
          </div>
        </div>
      )}
    </div>
  );
}

export function PatternSnapshotsSection() {
  const [patterns, setPatterns] = useState<PatternResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<
    'all' | 'life_themes' | 'tarot_season' | 'tarot_moon_phase' | 'archetype'
  >('all');

  useEffect(() => {
    async function loadPatterns() {
      try {
        const response = await fetch('/api/patterns/history', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setPatterns(data);
        }
      } catch (error) {
        console.error('Failed to load patterns:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPatterns();
  }, []);

  if (isLoading) {
    return (
      <div className='text-center py-8'>
        <div className='animate-pulse text-zinc-400'>Loading patterns...</div>
      </div>
    );
  }

  if (!patterns || patterns.totalSnapshots === 0) {
    return (
      <div className='text-center py-12'>
        <Zap className='w-10 h-10 text-zinc-700 mx-auto mb-3' />
        <p className='text-zinc-400'>No patterns detected yet</p>
        <p className='text-xs text-zinc-500 mt-1'>
          Keep journaling and pulling tarot to discover your patterns
        </p>
      </div>
    );
  }

  const filterTypes = [
    { id: 'all' as const, label: 'All', count: patterns.totalSnapshots },
    {
      id: 'life_themes' as const,
      label: 'Life Themes',
      count: patterns.byType.find((t) => t.type === 'life_themes')?.count || 0,
    },
    {
      id: 'tarot_season' as const,
      label: 'Tarot Seasons',
      count: patterns.byType.find((t) => t.type === 'tarot_season')?.count || 0,
    },
    {
      id: 'tarot_moon_phase' as const,
      label: 'Moon Phases',
      count:
        patterns.byType.find((t) => t.type === 'tarot_moon_phase')?.count || 0,
    },
    {
      id: 'archetype' as const,
      label: 'Archetypes',
      count: patterns.byType.find((t) => t.type === 'archetype')?.count || 0,
    },
  ];

  const allSnapshots: PatternSnapshot[] = [
    ...(patterns.snapshots.life_themes || []),
    ...(patterns.snapshots.tarot_season || []),
    ...(patterns.snapshots.tarot_moon_phase || []),
    ...(patterns.snapshots.archetype || []),
  ].sort(
    (a, b) =>
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
  );

  const filteredSnapshots =
    selectedType === 'all'
      ? allSnapshots
      : allSnapshots.filter((s) => s.type === selectedType);

  return (
    <div className='space-y-4'>
      {/* Summary Stats */}
      <div className='grid grid-cols-3 gap-2'>
        {patterns.byType.map((type) => (
          <div
            key={type.type}
            className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-center'
          >
            <div className='text-2xl font-bold text-white'>{type.count}</div>
            <div className='text-xs text-zinc-500 capitalize'>
              {type.type.replace('_', ' ')}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className='flex gap-2 overflow-x-auto pb-2'>
        {filterTypes.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedType(filter.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedType === filter.id
                ? 'bg-lunary-primary-600/20 text-lunary-primary-300 border border-lunary-primary-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
            }`}
          >
            {filter.label}
            {filter.count > 0 && (
              <span className='text-xs bg-zinc-800 px-1.5 py-0.5 rounded'>
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Archetype Evolution Chart */}
      {selectedType === 'archetype' &&
        patterns.snapshots.archetype &&
        patterns.snapshots.archetype.length > 1 && (
          <ArchetypeEvolutionChart
            snapshots={patterns.snapshots.archetype}
            className='mb-4'
          />
        )}

      {/* Pattern Cards */}
      <div className='space-y-3'>
        {filteredSnapshots.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-zinc-400'>No patterns of this type yet</p>
          </div>
        ) : (
          filteredSnapshots.map((snapshot, idx) => {
            if (snapshot.type === 'life_themes') {
              return <LifeThemeCard key={idx} snapshot={snapshot} />;
            } else if (snapshot.type === 'tarot_season') {
              return <TarotSeasonCard key={idx} snapshot={snapshot} />;
            } else if (snapshot.type === 'tarot_moon_phase') {
              return <MoonPhasePatternCard key={idx} snapshot={snapshot} />;
            } else if (snapshot.type === 'archetype') {
              return <ArchetypeCard key={idx} snapshot={snapshot} />;
            }
            return null;
          })
        )}
      </div>
    </div>
  );
}
