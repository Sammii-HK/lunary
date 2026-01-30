# UI Consolidation Guide

## Problem

The UI shows duplicate content:

1. Lines 946-966 in TarotView.tsx: "Your X-Day Tarot Patterns" section with RecurringThemesCard + AdvancedPatterns
2. Lines 1026+ in TarotView.tsx: "Tarot Patterns" CollapsibleSection with AdvancedPatterns again

## Solution

### Step 1: Remove Duplicate Section

**In `/src/app/(authenticated)/tarot/components/TarotView.tsx`:**

**DELETE lines 946-966** (the duplicate paid patterns section):

```tsx
// DELETE THIS ENTIRE BLOCK:
{
  /* Recurring themes - paid only, behind tarot_patterns */
}
{
  hasPaidAccess &&
    subscription.hasAccess('tarot_patterns') &&
    personalizedReading?.trendAnalysis && (
      <HoroscopeSection
        title={`Your ${timeFrame}-Day Tarot Patterns`}
        color='zinc'
      >
        <RecurringThemesCard
          className='mb-6'
          subtitle={`Based on your last ${timeFrame} days of readings`}
          items={recurringThemeItems}
        />
        <AdvancedPatterns
          basicPatterns={personalizedReading.trendAnalysis}
          selectedView={30}
          isMultidimensionalMode={false}
          onMultidimensionalModeChange={() => {}}
        />
      </HoroscopeSection>
    );
}
```

**Keep ONLY the CollapsibleSection (lines 1026+)** - this is the single source of patterns.

### Step 2: Integrate TarotPatternsHub into AdvancedPatterns

**In `/src/components/tarot/AdvancedPatterns.tsx`:**

Add at the top of the component (after imports):

```tsx
import { TarotPatternsHub } from '@/components/patterns/TarotPatternsHub';
import {
  transformBasicPatternsToAnalysis,
  mapSubscriptionPlanToUserTier,
} from '@/lib/patterns/pattern-adapter';

export function AdvancedPatterns({
  basicPatterns,
  selectedView,
  isMultidimensionalMode,
  onMultidimensionalModeChange,
  recentReadings,
  onCardClick,
}: AdvancedPatternsProps) {
  const subscription = useSubscription();

  // Feature flag for new patterns hub
  const USE_NEW_PATTERNS_HUB = true;

  // Early return for new hub on basic views (not year-over-year, not multidimensional)
  if (
    USE_NEW_PATTERNS_HUB &&
    basicPatterns &&
    typeof selectedView === 'number' &&
    !isMultidimensionalMode
  ) {
    const patternAnalysis = transformBasicPatternsToAnalysis(basicPatterns);
    const userTier = mapSubscriptionPlanToUserTier(subscription.plan);

    return (
      <TarotPatternsHub
        patterns={patternAnalysis}
        userTier={userTier}
        subscriptionStatus={subscription.status}
        onUpgradeClick={() => {
          // Could integrate with existing upgrade modal
          // For now, simple redirect
          window.location.href = '/pricing';
        }}
      />
    );
  }

  // Continue with existing implementation for year-over-year and multidimensional
  // ... rest of existing code
}
```

### Step 3: Result

After these changes:

✅ **No more duplication** - patterns only show in one place (CollapsibleSection)
✅ **New TarotPatternsHub** - Used for basic time-based views (7, 14, 30, 90, 180, 365 days)
✅ **Old AdvancedPatterns** - Still used for year-over-year and multidimensional modes
✅ **Arcana weighting** - Built into the new ArcanaBalanceRadial component

## Arcana Weighting Added

New utility: `/src/lib/patterns/utils/arcana-weighting.ts`

**Features:**

- Accounts for deck composition (22 Major, 56 Minor)
- Calculates weighted percentages
- Shows deviation from expected frequency
- Provides interpretations

**Example output:**

```
42% Major Arcana (+13.8% above average)
Big life themes and transformations are present

Expected: ~28% Major, ~72% Minor
```

## Testing

1. Navigate to tarot page
2. Verify patterns only show once (inside "Tarot Patterns" section)
3. Click different time ranges (7, 14, 30 days etc) - should see new hub
4. Click "Year-over-Year" - should see old advanced patterns
5. Click "Advanced" sparkle - should see multidimensional analysis
6. Check Arcana Balance card shows weighted interpretation

## Before & After

**Before:**

- "Recurring themes" at top
- "Dominant Themes" badges below
- "Frequent Cards" list
- "Suit Patterns" bars
- _Then_ "Tarot Patterns" section with same content repeated

**After:**

- Only "Tarot Patterns" CollapsibleSection
- Inside: Beautiful new hub with visualizations
- No duplication
- Arcana balance shows statistical context
