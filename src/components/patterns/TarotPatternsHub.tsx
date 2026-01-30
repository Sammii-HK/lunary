'use client';

import { Sparkles, Moon, TrendingUp } from 'lucide-react';
import { PatternCard } from './PatternCard';
import { RecurringThemesCard } from '../RecurringThemesCard';
import { FrequentCardsSection } from './FrequentCardsSection';
import { SuitDistributionChart } from './visualizations/SuitDistributionChart';
import { ArcanaBalanceRadial } from './visualizations/ArcanaBalanceRadial';
import type {
  PatternAnalysis,
  UserTier,
} from '@/lib/patterns/tarot-pattern-types';
import { hasFeatureAccess } from '../../../utils/pricing';
import type { BirthChartPlacement } from '@/context/UserContext';
import type { AstroChartInformation } from '../../../utils/astrology/astrology';

interface TarotPatternsHubProps {
  patterns: PatternAnalysis;
  userTier: UserTier;
  subscriptionStatus?: string;
  onUpgradeClick?: () => void;
  // Optional props for transit connections
  birthChart?: BirthChartPlacement[];
  userBirthday?: string;
  currentTransits?: AstroChartInformation[];
  userBirthLocation?: string;
}

export function TarotPatternsHub({
  patterns,
  userTier,
  subscriptionStatus,
  onUpgradeClick,
  birthChart,
  userBirthday,
  currentTransits,
  userBirthLocation,
}: TarotPatternsHubProps) {
  // Feature access checks
  const hasAdvancedPatterns = hasFeatureAccess(
    subscriptionStatus,
    userTier,
    'tarot_patterns_advanced',
  );
  const hasDrillDown = hasFeatureAccess(
    subscriptionStatus,
    userTier,
    'pattern_drill_down',
  );
  const hasBasicPatterns = hasFeatureAccess(
    subscriptionStatus,
    userTier,
    'tarot_patterns_basic',
  );

  // Tier-specific limits and features
  const showTrendIndicators = [
    'lunary_plus_ai',
    'lunary_plus_ai_annual',
  ].includes(userTier);

  const timeFrameDays = Math.ceil(
    (new Date(patterns.dateRange.end).getTime() -
      new Date(patterns.dateRange.start).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <div className='space-y-6'>
      {/* Dominant Themes - Enhanced RecurringThemesCard */}
      {patterns.dominantThemes.length > 0 && (
        <RecurringThemesCard
          title='Dominant Themes'
          subtitle={`Patterns from the last ${timeFrameDays} days`}
          items={patterns.dominantThemes}
          showTrendIndicators={showTrendIndicators}
        />
      )}

      {/* Visualization Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {/* Suit Distribution */}
        <PatternCard
          title='Suit Distribution'
          subtitle='Element balance in your readings'
          color='primary'
          icon={<Sparkles className='w-4 h-4' />}
          locked={!hasBasicPatterns}
          onUpgradeClick={onUpgradeClick}
          collapsible={true}
          defaultCollapsed={false}
        >
          <SuitDistributionChart data={patterns.suitPatterns} />
        </PatternCard>

        {/* Arcana Balance */}
        <PatternCard
          title='Arcana Balance'
          subtitle='Major vs Minor arcana'
          color='secondary'
          icon={<Moon className='w-4 h-4' />}
          locked={!hasBasicPatterns}
          onUpgradeClick={onUpgradeClick}
          collapsible={true}
          defaultCollapsed={false}
        >
          <ArcanaBalanceRadial
            majorCount={patterns.arcanaBalance.major}
            minorCount={patterns.arcanaBalance.minor}
          />
        </PatternCard>

        {/* Placeholder for Timeline (Pro Monthly+) */}
        {hasAdvancedPatterns && (
          <PatternCard
            title='Reading Frequency'
            subtitle='Your practice over time'
            color='accent'
            icon={<TrendingUp className='w-4 h-4' />}
            collapsible={true}
            defaultCollapsed={true}
          >
            <div className='flex items-center justify-center h-[250px] text-sm text-zinc-500'>
              Timeline visualization coming soon
            </div>
          </PatternCard>
        )}
      </div>

      {/* Frequent Cards with Drill-Down */}
      {patterns.frequentCards.length > 0 && (
        <FrequentCardsSection
          cards={patterns.frequentCards}
          allowDrillDown={hasDrillDown}
          locked={!hasBasicPatterns}
          onUpgradeClick={onUpgradeClick}
          birthChart={birthChart}
          userBirthday={userBirthday}
          currentTransits={currentTransits}
          userBirthLocation={userBirthLocation}
        />
      )}

      {/* Upgrade Prompt for Free Users */}
      {userTier === 'free' && (
        <div className='rounded-xl border border-lunary-accent-800 bg-lunary-accent-950/40 p-6 text-center'>
          <h3 className='text-lg font-medium text-lunary-accent-300 mb-2'>
            Unlock Deeper Pattern Insights
          </h3>
          <p className='text-sm text-zinc-400 mb-4'>
            Upgrade to Lunary+ to access extended pattern analysis, radial
            charts, and more.
          </p>
          <button
            onClick={onUpgradeClick}
            className='px-6 py-2 rounded-lg bg-lunary-accent hover:bg-lunary-accent/80 text-white font-medium transition-colors'
          >
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
}
