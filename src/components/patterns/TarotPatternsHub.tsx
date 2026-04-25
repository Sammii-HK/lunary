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
  const isObserved = patterns.dataSource === 'observed';

  const timeFrameDays = Math.ceil(
    (new Date(patterns.dateRange.end).getTime() -
      new Date(patterns.dateRange.start).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <div className='space-y-4'>
      {!isObserved && (
        <div className='rounded-xl border border-stroke-subtle bg-surface-card/30 px-4 py-3 text-xs text-content-muted'>
          Preview based on generated daily cards. Saved readings will replace
          this once you have recorded tarot activity.
        </div>
      )}

      {/* Dominant Themes - Enhanced RecurringThemesCard */}
      {patterns.dominantThemes.length > 0 && (
        <RecurringThemesCard
          title={isObserved ? 'Dominant Themes' : 'Theme Preview'}
          subtitle={
            isObserved
              ? `${patterns.totalReadings} readings across ${timeFrameDays} days`
              : `${timeFrameDays}-day generated preview`
          }
          items={patterns.dominantThemes}
          showTrendIndicators={showTrendIndicators}
        />
      )}

      {/* Visualization Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {/* Suit Distribution */}
        <PatternCard
          title='Suit Distribution'
          subtitle={
            isObserved
              ? `Minor arcana mix from ${patterns.totalCardsDrawn} cards`
              : 'Minor arcana mix in this preview'
          }
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
          subtitle={
            isObserved
              ? 'Major vs Minor cards drawn'
              : 'Major vs Minor preview cards'
          }
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
            subtitle={
              isObserved
                ? `${patterns.totalReadings} recorded readings`
                : 'Recorded readings only'
            }
            color='accent'
            icon={<TrendingUp className='w-4 h-4' />}
            collapsible={true}
            defaultCollapsed={true}
          >
            <div className='flex items-center justify-center h-[250px] text-sm text-content-muted'>
              {isObserved
                ? 'Timeline visualization coming soon'
                : 'No recorded reading timeline yet'}
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
        />
      )}

      {/* Upgrade Prompt for Free Users */}
      {userTier === 'free' && (
        <div className='rounded-xl border border-lunary-accent-800 bg-layer-deep/40 p-4 text-center'>
          <h3 className='text-lg font-medium text-content-brand-accent mb-2'>
            Unlock Deeper Pattern Insights
          </h3>
          <p className='text-sm text-content-muted mb-4'>
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
