# Pattern Components Visual Guide

## Component Hierarchy

```
TarotPatternsHub (Main Orchestrator)
├── Summary Stats Row
│   ├── Total Readings
│   ├── Time Period
│   └── Unique Cards
│
├── RecurringThemesCard (Enhanced)
│   └── Dominant Themes with Trend Indicators ↑↓→
│
├── Visualization Grid
│   ├── PatternCard (Suit Distribution)
│   │   └── SuitDistributionChart (Radial)
│   │
│   ├── PatternCard (Arcana Balance)
│   │   └── ArcanaBalanceRadial
│   │
│   └── PatternCard (Timeline) [Pro+]
│       └── CardFrequencyTimeline
│
├── FrequentCardsSection
│   └── Expandable Card Items
│       ├── Card Info
│       ├── Appearance Badges
│       └── CardFrequencyTimeline (Mini)
│
└── Upgrade Prompt [Free Users]
```

---

## Component Props Reference

### TarotPatternsHub

**Purpose:** Main orchestration component that displays all pattern visualizations

**Props:**

```tsx
{
  patterns: PatternAnalysis;          // Pattern data
  userTier: UserTier;                 // 'free' | 'lunary_plus' | 'lunary_plus_ai' | 'lunary_plus_ai_annual'
  subscriptionStatus?: string;        // 'active' | 'trial' | 'free'
  onUpgradeClick?: () => void;        // Callback for upgrade button
}
```

**Usage:**

```tsx
<TarotPatternsHub
  patterns={patternAnalysis}
  userTier='lunary_plus_ai'
  subscriptionStatus='active'
  onUpgradeClick={() => router.push('/pricing')}
/>
```

---

### PatternCard

**Purpose:** Reusable card wrapper with consistent styling and locking

**Props:**

```tsx
{
  title: string;                      // Card title
  subtitle?: string;                  // Optional subtitle
  color?: ColorVariant;               // 'primary' | 'secondary' | 'accent' | 'highlight' | 'rose' | 'success'
  icon?: React.ReactNode;             // Optional icon
  badge?: string;                     // Optional badge text
  children: React.ReactNode;          // Card content
  locked?: boolean;                   // Show locked overlay
  onUpgradeClick?: () => void;        // Upgrade button callback
  className?: string;                 // Additional classes
}
```

**Usage:**

```tsx
<PatternCard
  title='Suit Distribution'
  subtitle='Element balance in your readings'
  color='primary'
  icon={<Sparkles className='w-4 h-4' />}
  locked={!hasAccess}
  onUpgradeClick={handleUpgrade}
>
  <SuitDistributionChart data={suitData} />
</PatternCard>
```

**Color Variants:**

- `primary` - Nebula Violet (Main patterns, Major Arcana)
- `secondary` - Comet Trail Blue (Frequent cards, Cups)
- `accent` - Galaxy Haze Purple (Highlights, Swords)
- `highlight` - Supernova Pink (Interactive, Wands)
- `rose` - Cosmic Rose (Soft warnings, insights)
- `success` - Aurora Green (Pentacles, confirmations)

---

### FrequentCardsSection

**Purpose:** Display frequent cards with optional drill-down

**Props:**

```tsx
{
  cards: FrequentCard[];              // Array of frequent cards
  allowDrillDown?: boolean;           // Enable expand/collapse
  locked?: boolean;                   // Show locked overlay
  onUpgradeClick?: () => void;        // Upgrade callback
}
```

**FrequentCard Type:**

```tsx
{
  name: string;                       // Card name
  count: number;                      // Appearance count
  percentage: number;                 // Percentage of total
  suit?: string;                      // Card suit
  meaning?: string;                   // Card meaning
  emoji?: string;                     // Visual emoji
  appearances: Array<{                // Appearance dates
    date: string;
    readingId?: string;
  }>;
}
```

**Usage:**

```tsx
<FrequentCardsSection
  cards={[
    {
      name: 'The Moon',
      count: 8,
      percentage: 15.4,
      meaning: 'Intuition and the subconscious',
      appearances: [{ date: '2026-01-28' }, { date: '2026-01-25' }],
    },
  ]}
  allowDrillDown={hasProAccess}
  locked={!hasBasicAccess}
  onUpgradeClick={handleUpgrade}
/>
```

---

### RecurringThemesCard (Enhanced)

**Purpose:** Display dominant themes with optional trends

**Props:**

```tsx
{
  title?: string;                     // Default: 'Recurring themes'
  subtitle?: string;                  // Optional subtitle
  items: RecurringThemeItem[];        // Theme items
  className?: string;                 // Additional classes
  showTrendIndicators?: boolean;      // Show ↑↓→ arrows
}
```

**RecurringThemeItem Type:**

```tsx
{
  label: string;                      // Theme name
  detail?: string;                    // Optional description
  trend?: 'up' | 'down' | 'stable';   // Trend direction
  strength?: number;                  // 0-100, overrides default bar width
}
```

**Usage:**

```tsx
<RecurringThemesCard
  title='Dominant Themes'
  subtitle='Last 30 days'
  items={[
    { label: 'Emotional Growth', strength: 95, trend: 'up' },
    { label: 'New Beginnings', strength: 78, trend: 'stable' },
    { label: 'Inner Wisdom', strength: 62, trend: 'down' },
  ]}
  showTrendIndicators={hasProAccess}
/>
```

---

## Visualization Components

### SuitDistributionChart

**Purpose:** Radial bar chart showing suit distribution

**Props:**

```tsx
{
  data: SuitPattern[];                // Suit pattern data
}
```

**SuitPattern Type:**

```tsx
{
  suit: string;                       // 'Cups' | 'Wands' | 'Swords' | 'Pentacles' | 'Major Arcana'
  count: number;                      // Number of cards
  percentage: number;                 // Percentage of total
  trend?: 'up' | 'down' | 'stable';   // Optional trend
}
```

**Usage:**

```tsx
<SuitDistributionChart
  data={[
    { suit: 'Cups', count: 20, percentage: 40 },
    { suit: 'Wands', count: 15, percentage: 30 },
    { suit: 'Swords', count: 10, percentage: 20 },
    { suit: 'Pentacles', count: 5, percentage: 10 },
  ]}
/>
```

---

### ArcanaBalanceRadial

**Purpose:** Show Major vs Minor Arcana balance

**Props:**

```tsx
{
  majorCount: number; // Major Arcana count
  minorCount: number; // Minor Arcana count
}
```

**Usage:**

```tsx
<ArcanaBalanceRadial majorCount={12} minorCount={40} />
```

---

### CardFrequencyTimeline

**Purpose:** Sparkline showing card appearances over time

**Props:**

```tsx
{
  cardName: string;                   // Card name for context
  appearances: Array<{ date: string }>; // Appearance dates
  height?: number;                    // Chart height (default: 60)
}
```

**Usage:**

```tsx
<CardFrequencyTimeline
  cardName='The Moon'
  appearances={[
    { date: '2026-01-28' },
    { date: '2026-01-25' },
    { date: '2026-01-20' },
  ]}
  height={80}
/>
```

---

## Utility Functions

### Suit Colors

```tsx
import {
  getSuitColorClasses,
  getSuitColorHSL,
} from '@/lib/patterns/utils/suit-colors';

// Get Tailwind classes for a suit
const classes = getSuitColorClasses('Cups');
// Returns: { bg, bgLight, text, border, borderLight }

// Get HSL color for charts
const color = getSuitColorHSL('Wands');
// Returns: 'hsl(var(--lunary-highlight))'
```

### Pattern Formatters

```tsx
import {
  formatPercentage,
  getTrendIndicator,
  getTrendIcon,
  getTrendColor,
  calculateStrength,
} from '@/lib/patterns/utils/pattern-formatters';

formatPercentage(75.5); // "76%"
getTrendIndicator(10, 8); // "up"
getTrendIcon('up'); // "↑"
getTrendColor('up'); // "text-lunary-success"
calculateStrength(20, 100); // 20
```

---

## Feature Access Checks

```tsx
import { hasFeatureAccess } from '@/utils/pricing';

// Check if user has access to a feature
const hasAdvanced = hasFeatureAccess(
  subscriptionStatus, // 'active' | 'trial' | 'free'
  userPlan, // 'free' | 'lunary_plus' | 'lunary_plus_ai' | 'lunary_plus_ai_annual'
  'tarot_patterns_advanced',
);

// Use in component
{
  hasAdvanced && <AdvancedVisualization />;
}

// Lock component
<PatternCard locked={!hasAdvanced}>
  <AdvancedVisualization />
</PatternCard>;
```

**Available Feature Keys:**

- `tarot_patterns_basic` - Lunary+
- `tarot_patterns_advanced` - Pro Monthly+
- `pattern_drill_down` - Pro Monthly+
- `pattern_heatmap` - Pro Monthly+
- `card_combinations` - Pro Monthly+
- `ai_pattern_insights` - Pro Monthly+
- `pattern_export` - Pro Annual
- `pattern_comparison` - Pro Annual
- `predictive_insights` - Pro Annual
- `year_over_year` - Pro Annual
- `pattern_network_graph` - Pro Annual (future)

---

## Data Transformation

### Basic Patterns → Pattern Analysis

```tsx
import { transformBasicPatternsToAnalysis } from '@/lib/patterns/pattern-adapter';

// Transform existing BasicPatterns format to new PatternAnalysis format
const patternAnalysis = transformBasicPatternsToAnalysis(basicPatterns);
```

### Subscription Plan → User Tier

```tsx
import { mapSubscriptionPlanToUserTier } from '@/lib/patterns/pattern-adapter';

// Map subscription plan to user tier
const userTier = mapSubscriptionPlanToUserTier(subscription.plan);
// Returns: 'free' | 'lunary_plus' | 'lunary_plus_ai' | 'lunary_plus_ai_annual'
```

---

## Responsive Breakpoints

All components follow mobile-first responsive design:

```tsx
// Mobile (< 768px) - Single column
<div className="space-y-4">

// Tablet (768px+) - 2 columns
<div className="md:grid md:grid-cols-2 md:gap-4">

// Desktop (1024px+) - 3 columns
<div className="lg:grid lg:grid-cols-3 lg:gap-6">
```

**Grid Layouts:**

- Summary stats: 1 col → 3 cols
- Visualizations: 1 col → 2 cols → 3 cols
- Cards: Full width → Half width → Third width

---

## Color System Reference

### Lunary Brand Colors

```css
/* Primary (Nebula Violet) */
--lunary-primary: #8458d8;

/* Secondary (Comet Trail) */
--lunary-secondary: #7b7be8;

/* Accent (Galaxy Haze) */
--lunary-accent: #c77dff;

/* Highlight (Supernova) */
--lunary-highlight: #d070e8;

/* Rose (Cosmic Rose) */
--lunary-rose: #ee789e;

/* Success (Aurora Green) */
--lunary-success: #6b9b7a;

/* Error (Solar Flare) - Avoid using for patterns */
--lunary-error: #d06060;
```

### Suit Color Mapping

| Suit         | Color            | Element | Energy    |
| ------------ | ---------------- | ------- | --------- |
| Cups         | Secondary (Blue) | Water   | Emotion   |
| Wands        | Highlight (Pink) | Fire    | Action    |
| Swords       | Accent (Purple)  | Air     | Intellect |
| Pentacles    | Success (Green)  | Earth   | Material  |
| Major Arcana | Primary (Violet) | Spirit  | Universal |

---

## Testing Examples

### Unit Test Example

```tsx
import { render, screen } from '@testing-library/react';
import { PatternCard } from '@/components/patterns/PatternCard';

test('renders pattern card with title', () => {
  render(
    <PatternCard title='Test Card'>
      <div>Content</div>
    </PatternCard>,
  );
  expect(screen.getByText('Test Card')).toBeInTheDocument();
});

test('shows locked overlay when locked', () => {
  render(
    <PatternCard title='Locked Card' locked={true}>
      <div>Content</div>
    </PatternCard>,
  );
  expect(screen.getByText('Upgrade to unlock')).toBeInTheDocument();
});
```

### Integration Test Example

```tsx
test('TarotPatternsHub respects user tier', () => {
  const mockPatterns = {
    /* ... */
  };

  // Free user - should see locked features
  const { rerender } = render(
    <TarotPatternsHub
      patterns={mockPatterns}
      userTier='free'
      subscriptionStatus='free'
    />,
  );
  expect(screen.getByText('Upgrade to unlock')).toBeInTheDocument();

  // Pro user - should see all features
  rerender(
    <TarotPatternsHub
      patterns={mockPatterns}
      userTier='lunary_plus_ai'
      subscriptionStatus='active'
    />,
  );
  expect(screen.queryByText('Upgrade to unlock')).not.toBeInTheDocument();
});
```

---

## Common Patterns

### 1. Loading State

```tsx
{loading ? (
  <div className="flex items-center justify-center py-12">
    <div className="w-8 h-8 border-2 border-lunary-primary-700 border-t-lunary-primary rounded-full animate-spin" />
  </div>
) : (
  <TarotPatternsHub patterns={patterns} ... />
)}
```

### 2. Error State

```tsx
{error ? (
  <div className="rounded-lg border border-lunary-error-800 bg-lunary-error-950/40 p-4">
    <p className="text-sm text-lunary-error-300">{error}</p>
  </div>
) : (
  <TarotPatternsHub patterns={patterns} ... />
)}
```

### 3. Empty State

```tsx
{patterns.totalReadings === 0 ? (
  <div className="text-center py-12">
    <p className="text-zinc-400">No readings yet. Start your first reading!</p>
  </div>
) : (
  <TarotPatternsHub patterns={patterns} ... />
)}
```

### 4. Conditional Features

```tsx
const hasAdvanced = hasFeatureAccess(status, plan, 'tarot_patterns_advanced');
const hasDrillDown = hasFeatureAccess(status, plan, 'pattern_drill_down');

<FrequentCardsSection
  cards={cards}
  allowDrillDown={hasDrillDown}
  locked={!hasAdvanced}
/>;
```

---

## Performance Tips

1. **Memoize expensive calculations:**

```tsx
const patternAnalysis = useMemo(
  () => transformBasicPatternsToAnalysis(basicPatterns),
  [basicPatterns],
);
```

2. **Lazy load charts:**

```tsx
const SuitDistributionChart = lazy(
  () => import('@/components/patterns/visualizations/SuitDistributionChart'),
);
```

3. **Debounce interactions:**

```tsx
const debouncedExpand = useDebouncedCallback(
  (cardName) => setExpandedCard(cardName),
  300,
);
```

4. **Cache API responses:**

```tsx
const cacheKey = `patterns-${timeFrame}-${userId}`;
sessionStorage.setItem(cacheKey, JSON.stringify(patterns));
```

---

## Accessibility Checklist

- [ ] All interactive elements have proper focus states
- [ ] Charts have descriptive labels
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Keyboard navigation works for all interactions
- [ ] Screen readers can access all content
- [ ] Loading states announce to screen readers
- [ ] Error messages are descriptive and actionable

---

This guide covers all the new pattern components. For more examples, see `EXAMPLE_USAGE.tsx`.
