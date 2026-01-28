# Analytics Dashboard Redesign - Implementation Plan

## Current Status

### Feature Adoption Calculations ✅ ALREADY FIXED

- **API Route:** `/app/api/admin/analytics/feature-adoption/route.ts`
- **Default behavior:** Uses `'product_opened'` as denominator (line 13)
- **Calculation:** `pct(users, mau)` where MAU is Product MAU (line 805 in kpis.ts)
- **Conclusion:** Feature adoption is ALREADY using Product MAU correctly!

### What Still Needs Work

1. **Two-tab design** - Current page has basic tabs, need to redesign
2. **Insights system** - Already exists but needs enhancement
3. **Visual hierarchy** - Use brand colors more effectively
4. **Clear metric definitions** - Add explanations for MAU types
5. **Better status indicators** - Use icons and colors consistently

## Design Implementation Plan

### Phase 1: Enhanced Insights System (KEEP & IMPROVE)

The insights system already exists and is working. Keep it and enhance:

**Current insights location:** Lines 2021-2089 in analytics page
**What works:**

- Auto-generation working
- Type-based styling (positive/warning/critical/info)
- Category filtering
- Export to CSV

**Enhancements needed:**

- Add more icons (CheckCircle, AlertCircle, TrendingUp)
- Better color coding with brand colors
- Priority badges (Urgent/High/Medium/Low)
- Link insights to specific metrics

### Phase 2: Tab Redesign

**Tab 1: Investor Snapshot** (Clean, focused)

1. Health Overview Banner
   - 4 key metrics: Growth, Revenue, Retention, Activation
   - Status indicators with icons
   - Critical alerts only

2. Growth Story
   - Product MAU trend chart
   - Acquisition funnel
   - Channel breakdown

3. Retention Health
   - Cohort heatmap with annotations
   - Stickiness metrics
   - "What changed" insights

4. Revenue Snapshot
   - MRR/ARR
   - Conversion rates
   - Tier breakdown

5. Product Health
   - Feature adoption table (clean)
   - Top performing features
   - Critical issues only

**Tab 2: Operational Detail** (Comprehensive, debug-friendly)

1. Audience Breakdown
   - All MAU types explained
   - Product MAU highlighted
   - Overlap visualization

2. Feature Usage (Raw)
   - Complete event counts
   - Tracking quality badges
   - All percentages

3. Daily Momentum
   - 7-day rolling with deltas
   - Week-over-week changes
   - Warning: "Small numbers = volatility"

4. CTA Performance
   - All hubs with raw clicks
   - Mystery tracking issues flagged

5. Cohort Detail
   - Full retention table
   - Week-by-week comparison
   - Maturity indicators

6. Data Quality
   - Tracking issue checklist
   - Audit info
   - Debug tools

### Phase 3: Component Strategy

**Reuse existing components:**

- Card, CardHeader, CardTitle, CardDescription, CardContent
- Button, Badge
- Tabs, TabsList, TabsTrigger, TabsContent
- MiniStat, MetricTable, StatSection, InsightCard

**Create new components:**

- `HealthMetricCard` - Large metric with icon, trend, status
- `StatusBadge` - Consistent status indicator
- `MetricExplainer` - Tooltip/modal with MAU definitions
- `TrendIndicator` - Icon + text for trends

### Phase 4: Color & Icon System

**Status Colors:**

```tsx
const statusColors = {
  excellent: 'lunary-success', // Green
  good: 'lunary-primary', // Violet
  warning: 'lunary-accent', // Purple
  critical: 'lunary-error', // Red
};
```

**Icon Mapping:**

```tsx
import {
  TrendingUp, // Growth, positive
  TrendingDown, // Decline
  DollarSign, // Revenue
  RefreshCw, // Retention
  CheckCircle, // Success, activation
  AlertCircle, // Warning
  XCircle, // Error
  Activity, // General activity
  Users, // User metrics
  Target, // Goals
  Sparkles, // Features
  BarChart3, // Charts
  Download, // Export
  Settings, // Config
} from 'lucide-react';
```

## Implementation Steps

### Step 1: Create Status Badge Component

```tsx
// components/admin/StatusBadge.tsx
type Status = 'excellent' | 'good' | 'warning' | 'critical';

interface StatusBadgeProps {
  status: Status;
  label?: string;
  icon?: boolean;
}

export function StatusBadge({ status, label, icon }: StatusBadgeProps) {
  const config = {
    excellent: {
      className:
        'bg-lunary-success-950/40 text-lunary-success-300 border-lunary-success-700',
      icon: CheckCircle,
    },
    good: {
      className:
        'bg-lunary-primary-950/40 text-lunary-primary-300 border-lunary-primary-700',
      icon: CheckCircle,
    },
    warning: {
      className:
        'bg-lunary-accent-950/40 text-lunary-accent-300 border-lunary-accent-700',
      icon: AlertCircle,
    },
    critical: {
      className:
        'bg-lunary-error-950/40 text-lunary-error-300 border-lunary-error-700',
      icon: XCircle,
    },
  };

  const { className, icon: Icon } = config[status];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${className}`}
    >
      {icon && <Icon className='h-3 w-3' />}
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
}
```

### Step 2: Create Health Metric Card

```tsx
// components/admin/HealthMetricCard.tsx
import { LucideIcon } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface HealthMetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description?: string;
}

export function HealthMetricCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  status,
  description,
}: HealthMetricCardProps) {
  return (
    <div className='rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-4 shadow-sm shadow-black/30'>
      <div className='flex items-start justify-between mb-3'>
        <Icon className='h-6 w-6 text-lunary-primary-300' />
        <StatusBadge status={status} />
      </div>

      <div className='space-y-1'>
        <div className='text-xs text-zinc-400'>{label}</div>
        <div className='flex items-baseline gap-2'>
          <span className='text-3xl font-bold text-white'>{value}</span>
          {unit && <span className='text-sm text-zinc-500'>{unit}</span>}
        </div>
        {trend && <div className='text-xs text-zinc-400'>{trend}</div>}
        {description && (
          <div className='text-xs text-zinc-500 mt-2'>{description}</div>
        )}
      </div>
    </div>
  );
}
```

### Step 3: Enhance Existing Tab Structure

Current analytics page already has tabs. Enhance them:

```tsx
<Tabs defaultValue='investor' className='space-y-6'>
  <TabsList className='grid w-full max-w-md grid-cols-2'>
    <TabsTrigger value='investor' className='flex items-center gap-2'>
      <BarChart3 className='h-4 w-4' />
      Investor Snapshot
    </TabsTrigger>
    <TabsTrigger value='operational' className='flex items-center gap-2'>
      <Settings className='h-4 w-4' />
      Operational Detail
    </TabsTrigger>
  </TabsList>

  <TabsContent value='investor' className='space-y-6'>
    {/* Investor sections */}
  </TabsContent>

  <TabsContent value='operational' className='space-y-6'>
    {/* Operational sections - KEEP EXISTING CONTENT */}
  </TabsContent>
</Tabs>
```

### Step 4: Build Investor Tab Sections

#### Section 0: Health Overview

```tsx
<Card>
  <CardHeader>
    <CardTitle className='flex items-center gap-2'>
      <Activity className='h-5 w-5 text-lunary-primary' />
      Health Snapshot
    </CardTitle>
    <CardDescription>Last 30 days</CardDescription>
  </CardHeader>
  <CardContent>
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      <HealthMetricCard
        icon={TrendingUp}
        label='Product Growth'
        value={productMAU}
        unit='MAU'
        trend='+8% vs last month'
        status='good'
      />
      <HealthMetricCard
        icon={DollarSign}
        label='Revenue'
        value={`$${mrr}`}
        unit='MRR'
        status='good'
      />
      <HealthMetricCard
        icon={RefreshCw}
        label='Retention'
        value={`${(retention * 100).toFixed(0)}%`}
        unit='D30'
        status='excellent'
      />
      <HealthMetricCard
        icon={CheckCircle}
        label='Activation'
        value={`${(activation * 100).toFixed(1)}%`}
        status='good'
      />
    </div>

    {/* Critical alerts */}
    {criticalInsights.length > 0 && (
      <div className='mt-6 space-y-2'>
        {criticalInsights.map((insight, idx) => (
          <div
            key={idx}
            className='rounded-xl border border-lunary-error-700/40 bg-lunary-error-950/40 p-4 flex items-start gap-3'
          >
            <AlertCircle className='h-5 w-5 text-lunary-error-300 flex-shrink-0 mt-0.5' />
            <div>
              <div className='font-medium text-lunary-error-200'>
                {insight.message}
              </div>
              {insight.action && (
                <div className='text-sm text-lunary-error-300 mt-1'>
                  {insight.action}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>
```

#### Section 1-4: Keep simplified versions of existing content

- Focus on trends, not raw numbers
- Hide tracking bugs
- Emphasize growth story

### Step 5: Operational Tab - Keep Everything, Add Context

The Operational tab should keep ALL existing content but add:

- Clear section headers with icons
- Status badges for tracking issues
- Explanatory text for MAU types
- Data quality indicators

```tsx
<TabsContent value='operational' className='space-y-6'>
  {/* Add MAU Explainer at top */}
  <Card className='border-lunary-primary-700/40 bg-lunary-primary-950/20'>
    <CardContent className='pt-6'>
      <div className='flex items-start gap-3'>
        <Users className='h-5 w-5 text-lunary-primary-300 mt-0.5' />
        <div>
          <h3 className='font-medium text-lunary-primary-200 mb-2'>
            Understanding MAU Types
          </h3>
          <div className='space-y-2 text-sm text-zinc-300'>
            <div>
              <strong>Product MAU:</strong> Signed-in users who used app
              features (north star metric)
            </div>
            <div>
              <strong>App MAU:</strong> Anyone who opened the app (includes
              logged out users)
            </div>
            <div>
              <strong>Grimoire MAU:</strong> Users who viewed grimoire content
              only
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Keep ALL existing operational sections */}
  {/* Just add better visual organization */}
</TabsContent>
```

## Success Criteria

✅ Two distinct tabs serving different audiences
✅ Investor tab is clean and focused
✅ Operational tab has all debugging details
✅ Brand colors used consistently
✅ Lucide icons throughout (NO emojis)
✅ Feature adoption calculations verified correct
✅ Status indicators clear and consistent
✅ Insights enhanced with better visuals
✅ No functionality lost

## Files to Modify

1. `/src/app/admin/analytics/page.tsx` - Main dashboard
2. `/src/components/admin/StatusBadge.tsx` - NEW
3. `/src/components/admin/HealthMetricCard.tsx` - NEW
4. `/src/components/admin/TrendIndicator.tsx` - NEW (optional)

## Files Already Good

- `/src/lib/analytics/kpis.ts` - Feature adoption calc is correct ✅
- `/src/app/api/admin/analytics/feature-adoption/route.ts` - Using Product MAU ✅
- `/src/lib/analytics/insights.ts` - Insights system working ✅
- `/src/components/admin/InsightCard.tsx` - Styling is good ✅

## Next Steps

1. Create StatusBadge component
2. Create HealthMetricCard component
3. Reorganize tabs in analytics page
4. Build Investor tab with Health Overview
5. Enhance Operational tab with explainers
6. Add icons throughout
7. Test and verify calculations

## Notes

- Feature adoption is ALREADY using Product MAU correctly - no calculation fixes needed!
- Focus on UI/UX improvements and better organization
- Keep all existing functionality in Operational tab
- Make Investor tab tell a clear growth story
- Use brand colors consistently
- NO EMOJIS anywhere, only Lucide icons
