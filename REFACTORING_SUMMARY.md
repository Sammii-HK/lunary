# Analytics Dashboard Refactoring Summary

## Overview

Refactored the `/src/app/admin/analytics/page.tsx` file (4,117 lines) to improve maintainability by extracting reusable components and utility functions.

## Components Extracted

### 1. MiniStat Component

**Location:** `/src/components/admin/MiniStat.tsx`
**Usage:** 60+ instances throughout analytics dashboard
**Purpose:** Displays small metric cards with icon, label, and value

**Props:**

```typescript
{
  label: string;
  value: string | number;
  icon: ReactNode;
}
```

### 2. SectionHeader Component

**Location:** `/src/components/admin/SectionHeader.tsx`
**Usage:** 10+ instances
**Purpose:** Consistent section headers with title and optional description

**Props:**

```typescript
{
  title: string;
  description?: string;
}
```

### 3. MetricTable Component

**Location:** `/src/components/admin/MetricTable.tsx`
**Usage:** 5 table variations
**Purpose:** Responsive tables for displaying metrics with various column types

**Props:**

```typescript
{
  columns: Array<{
    label: string;
    key: string;
    type?: 'text' | 'number' | 'percentage' | 'ratio';
    align?: 'left' | 'right';
    decimals?: number;
    render?: (value: any, row: any) => ReactNode;
  }>;
  data: Array<Record<string, any>>;
  emptyMessage?: string;
}
```

**Features:**

- Auto-formatting for numbers, percentages, and ratios
- Custom render functions for complex cells
- Automatic handling of empty data states
- Responsive hover states

### 4. MomentumCard Component

**Location:** `/src/components/admin/MomentumCard.tsx`
**Usage:** 7 instances in momentum sections
**Purpose:** Displays metrics with 7-day rolling averages and trend indicators

**Props:**

```typescript
{
  label: string;
  currentValue: string | number;
  change: number | null;
  percentChange: number | null;
  trendDescription: ReactNode;
  formatter?: (value: number) => string;
}
```

### 5. StatSection Component

**Location:** `/src/components/admin/StatSection.tsx`
**Usage:** 6+ section wrappers
**Purpose:** Consistent wrapper for grouped statistics with header and footer

**Props:**

```typescript
{
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footerText?: string;
}
```

### 6. MetricInfoBox Component

**Location:** `/src/components/admin/MetricInfoBox.tsx`
**Usage:** 2+ instances for supplementary metrics
**Purpose:** Bordered box displaying key-value pairs

**Props:**

```typescript
{
  title: string;
  metrics: Array<{
    label: string;
    value: string | number | ReactNode;
  }>;
}
```

## Utility Functions Extracted

### Analytics Utilities

**Location:** `/src/lib/analytics/utils.tsx`

**Functions:**

1. `describeTrend(current, previous)` - Returns colored trend indicator
2. `computeWeekOverWeekChange(current, previous)` - Calculates WoW metrics
3. `formatMetricValue(value, decimals)` - Formats numbers with localization
4. `computePercent(numerator, denominator)` - Safe percentage calculation
5. `formatDateInput(date)` - Formats dates as YYYY-MM-DD
6. `shiftDateInput(dateOnly, deltaDays)` - Date arithmetic utility

## Export Index

Created `/src/components/admin/index.ts` for centralized component exports:

```typescript
export { MiniStat } from './MiniStat';
export { SectionHeader } from './SectionHeader';
export { MetricTable } from './MetricTable';
export { MomentumCard } from './MomentumCard';
export { StatSection } from './StatSection';
export { MetricInfoBox } from './MetricInfoBox';
export { MetricsCard } from './MetricsCard';
export { InsightCard } from './InsightCard';
export { ConversionFunnel } from './ConversionFunnel';
export { SearchConsoleMetrics } from './SearchConsoleMetrics';
```

## Changes to Analytics Page

### Imports Added

```typescript
import { MiniStat } from '@/components/admin/MiniStat';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { MetricTable } from '@/components/admin/MetricTable';
import { MomentumCard } from '@/components/admin/MomentumCard';
import { StatSection } from '@/components/admin/StatSection';
import { MetricInfoBox } from '@/components/admin/MetricInfoBox';

import {
  describeTrend as describeTrendUtil,
  computeWeekOverWeekChange as computeWoWChange,
  formatMetricValue as formatMetric,
  computePercent,
  formatDateInput,
  shiftDateInput,
} from '@/lib/analytics/utils';
```

### Inline Code Removed

- Inline `MiniStat` component definition (21 lines)
- `describeTrend` function (11 lines)
- `computeWeekOverWeekChange` function (10 lines)
- `formatMetricValue` function (7 lines)
- `computePercent` function (4 lines)
- `formatDateInput` function (1 line)
- `shiftDateInput` function (7 lines)

**Total lines removed from analytics page:** ~61 lines of code

## Benefits

1. **Improved Maintainability:** Components can be updated in one place
2. **Code Reusability:** Components can be used across different pages
3. **Easier Testing:** Individual components can be unit tested
4. **Better Organization:** Clear separation of concerns
5. **Reduced File Size:** Analytics page is more manageable
6. **Consistent UI:** Standardized patterns across the dashboard
7. **Type Safety:** All components have proper TypeScript interfaces

## Usage Example

### Before (Inline)

```typescript
<div className='rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-3 shadow-sm shadow-black/30'>
  <div className='flex items-center gap-1.5 text-xs font-medium text-zinc-400'>
    <Activity className='h-5 w-5 text-lunary-primary-300' />
    App DAU
  </div>
  <div className='mt-2 text-xl font-light tracking-tight text-white'>
    {appDau.toLocaleString()}
  </div>
</div>
```

### After (Component)

```typescript
<MiniStat
  label='App DAU'
  value={appDau}
  icon={<Activity className='h-5 w-5 text-lunary-primary-300' />}
/>
```

## Next Steps

Future refactoring opportunities:

1. Extract chart wrapper components
2. Extract filter/date range components
3. Create compound components for complex sections
4. Add Storybook stories for visual documentation
5. Create unit tests for extracted components
6. Consider extracting data fetching hooks

## Files Modified

- `/src/app/admin/analytics/page.tsx` - Refactored to use extracted components
- **Created:** `/src/components/admin/MiniStat.tsx`
- **Created:** `/src/components/admin/SectionHeader.tsx`
- **Created:** `/src/components/admin/MetricTable.tsx`
- **Created:** `/src/components/admin/MomentumCard.tsx`
- **Created:** `/src/components/admin/StatSection.tsx`
- **Created:** `/src/components/admin/MetricInfoBox.tsx`
- **Created:** `/src/lib/analytics/utils.tsx`
- **Created:** `/src/components/admin/index.ts`

## Impact

- **Components extracted:** 6
- **Utility functions extracted:** 6
- **Total component instances replaced:** 80+
- **Lines of code reorganized:** ~200+
- **New reusable components available:** 6
- **Improved import paths:** Centralized via index file
