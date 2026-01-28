# Complete Analytics Dashboard Inventory & Redesign Map

## Overview

**Total Sections:** 33
**Total Metrics:** 100+
**Current Line Count:** 4,035 lines
**Tabs:** 2 (Investor Snapshot, Operational Detail)

---

## INVESTOR SNAPSHOT TAB (9 Sections)

### Current Content Analysis

#### ✅ Section 1: Quick Glance

**Current Metrics:**

- Monthly Recurring Revenue (MRR)
- New Subscriptions
- Conversion Rate
- Growth Rate

**Status:** KEEP - Perfect for investors
**Enhancement:** Add Health Overview section BEFORE this with HealthMetricCard components

#### ✅ Section 2: Actionable Insights

**Current Features:**

- Priority-based insights
- Type filtering (Positive/Warning/Critical/Info)
- Category filtering
- CSV export

**Status:** KEEP & ENHANCE
**Enhancement:**

- Add icons to section header (Sparkles)
- Add StatusBadge for priority levels
- Link insights to specific metrics

#### ✅ Section 3: App Active Users (Core App Usage)

**Metrics:** DAU, WAU, MAU, New Users
**Status:** KEEP but SIMPLIFY
**Enhancement:**

- Hide audit details (move to Operational)
- Focus on MAU trend
- Add 30-day growth %

#### ✅ Section 4: Engaged Users & Stickiness

**Metrics:** Engaged DAU/WAU/MAU, Stickiness ratios
**Status:** KEEP but SIMPLIFY
**Enhancement:**

- Show stickiness as key metric
- Hide detailed breakdown (keep in Operational)
- Add trend indicators

#### ✅ Section 5: Returning Canonical Users

**Metrics:** Returning DAU/WAU/MAU, Range totals
**Status:** KEEP but SIMPLIFY
**Enhancement:**

- Show returning % instead of absolute numbers
- Add trend comparison

#### ✅ Section 6: Returning Users Source Breakdown

**Metrics:** Organic, Direct/Brand, Internal
**Status:** KEEP
**Enhancement:** Add icons for each source type

#### ✅ Section 7: Active Days Distribution

**Metrics:** 1 day, 2-3 days, 4-7 days, 8-14 days, 15+ days
**Status:** KEEP
**Enhancement:** Add visualization (bar chart or sparkline)

#### ✅ Section 8: Content & Funnel

**Metrics:** Grimoire entry, MAU, conversion influence
**Status:** KEEP & ENHANCE
**Enhancement:**

- Highlight conversion influence %
- Add trend for Grimoire MAU
- Show as growth driver

#### ✅ Section 9: Reach (page_viewed)

**Metrics:** Reach DAU/WAU/MAU, Pages per user
**Status:** CONSIDER MOVING
**Recommendation:** This is site-wide metric - could go to Operational tab
**Alternative:** Keep if investors care about total reach

---

## OPERATIONAL DETAIL TAB (24 Sections)

### Audience & Usage Metrics

#### Section 10: All-Time Product Footprint ✅

**Metrics:** Total accounts, Product users, Returning users, Avg active days
**Status:** KEEP
**Enhancement:** Add icon (Users), highlight Product MAU as north star

#### Section 11-13: SEO & Attribution (3 sections)

**Metrics:**

- First-touch attribution summary
- Traffic source breakdown table
- Conversion by source table

**Status:** KEEP ALL
**Enhancement:**

- Add icons (TrendingUp, BarChart3)
- Add StatusBadge for high/low performing sources
- Highlight best conversion sources

#### Section 14: Subscription Funnel

**Metrics:** Signups → Subscriptions (30d), Conversion rate
**Status:** KEEP
**Enhancement:** Add ConversionFunnel visualization, trend comparison

#### Section 15: CTA Conversion Performance

**Metrics:** Hub-based CTA clicks → signups (7d)
**Status:** KEEP & FLAG ISSUES
**Enhancement:**

- Add StatusBadge for tracking issues
- Flag "mystery hubs" with warning badge
- Highlight best performing hubs

### Activation & Features

#### Section 16: Activation Health

**Metrics:** Activation rate %, Activated users, Total signups
**Status:** KEEP
**Enhancement:**

- Add trend comparison
- Add StatusBadge based on rate
- Link to insights about activation

#### Section 17: Feature-Driven Tiers

**Metrics:** Activation by feature (Free/Paid/Unknown split)
**Status:** KEEP
**Enhancement:** Already using MetricTable - good!

### Momentum & Quality

#### Section 18: Momentum ⚠️

**Metrics:**

- Site momentum (app_opened) DAU/WAU/MAU 7-day rolling
- Product momentum DAU/WAU/MAU 7-day rolling
- Activation rate 7-day rolling
- All with WoW deltas and % changes

**Status:** KEEP - CRITICAL for daily debugging
**Enhancement:**

- Add warning banner: "Small user base = volatility - focus on trends"
- Add icons (TrendingUp/TrendingDown)
- Color code positive/negative trends

#### Section 19-23: Event Volume & Quality (5 sections)

**Sections:**

- Raw Event Audit (events, identities, links)
- Average Sessions
- AI Usage & Costs
- Feature Usage Heatmap
- Audience Segments comparison

**Status:** KEEP ALL - Essential for debugging
**Enhancement:**

- Add section icons (Activity, BarChart3)
- Add data quality StatusBadge
- Highlight anomalies

### Product Features

#### Section 24-25: Signed-In Product Usage (2 sections)

**Metrics:**

- Product DAU/WAU/MAU
- Feature adoption per Product MAU

**Status:** KEEP ALL
**Enhancement:**

- Add MAU explainer at TOP of Operational tab
- Highlight Product MAU as denominator
- Add StatusBadge for adoption levels (0% = critical, <10% = warning, >50% = excellent)

### Grimoire

#### Section 26-27: Grimoire Deep Dive (2 sections)

**Metrics:**

- Grimoire health (entry rate, MAU, conversions)
- SEO & Referral (Search Console data)

**Status:** KEEP ALL
**Enhancement:**

- Add Sparkles icon
- Highlight conversion influence
- Show Grimoire as acquisition channel

### Lifecycle

#### Section 28-29: Conversion & Lifecycle (2 sections)

**Metrics:**

- Conversion funnel (Free → Trial → Paid)
- Subscription lifecycle & plans breakdown

**Status:** KEEP ALL
**Enhancement:**

- Add DollarSign icon
- Highlight MRR by plan
- Show churn rate trend

### External Channels

#### Section 30-32: Notifications & External (3 sections)

**Metrics:**

- Notification health (open rates, CTR by channel)
- Discord bot engagement (7d)
- Top Discord commands

**Status:** KEEP ALL (Discord sections conditional)
**Enhancement:**

- Add Bell icon for notifications
- Add MessageCircle icon for Discord
- Highlight best performing channels

### Retention

#### Section 33: Cohort Retention Analysis

**Metrics:** Weekly cohorts with D1/D7/D30 retention %
**Status:** KEEP - CRITICAL
**Enhancement:**

- Add color coding for retention levels
- Highlight recent vs early cohort improvements
- Add maturity indicators
- Flag dead cohorts (0% retention)

---

## Redesign Strategy by Tab

### INVESTOR SNAPSHOT TAB - Redesign Approach

**NEW SECTION 0: Health Overview (ADD FIRST)**

```tsx
<Card>
  <CardHeader>
    <CardTitle className='flex items-center gap-2'>
      <Activity className='h-5 w-5 text-lunary-primary' />
      Health Snapshot
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      <HealthMetricCard
        icon={TrendingUp}
        label='Product Growth'
        value={productMAU}
        unit='MAU'
        trend='+X% vs last month'
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
  </CardContent>
</Card>
```

**Then keep sections 1-9 with enhancements:**

1. Quick Glance - Add growth trends
2. Actionable Insights - Add icons and StatusBadge
   3-7. Engagement metrics - Simplify, hide details
3. Content & Funnel - Highlight conversion driver
4. Reach - Consider moving to Operational

**What to HIDE from Investor tab:**

- Raw event audit details
- Momentum volatility (scary numbers)
- Tracking bugs and data quality issues
- Discord/notification details
- Feature-by-feature adoption (show summary only)

### OPERATIONAL DETAIL TAB - Redesign Approach

**NEW SECTION 0: MAU Type Explainer (ADD FIRST)**

```tsx
<Card className='border-lunary-primary-700/40 bg-lunary-primary-950/20'>
  <CardContent className='pt-6'>
    <div className='flex items-start gap-3'>
      <Users className='h-5 w-5 text-lunary-primary-300' />
      <div>
        <h3 className='font-medium text-lunary-primary-200'>
          Understanding MAU Types
        </h3>
        <div className='space-y-2 text-sm'>
          <div className='flex items-start gap-2'>
            <CheckCircle className='h-4 w-4 text-lunary-success-300' />
            <div>
              <strong>Product MAU ({productMAU}):</strong> Signed-in users who
              used app features. This is our north star metric.
            </div>
          </div>
          <div className='flex items-start gap-2'>
            <Activity className='h-4 w-4 text-lunary-secondary-300' />
            <div>
              <strong>App MAU:</strong> All users who opened the app.
            </div>
          </div>
          <div className='flex items-start gap-2'>
            <Info className='h-4 w-4 text-lunary-accent-300' />
            <div>
              <strong>Grimoire MAU:</strong> Users viewing grimoire only.
            </div>
          </div>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

**Then keep ALL 24 sections with enhancements:**

- Add icons to every section header
- Add StatusBadge for tracking issues
- Add StatusBadge for adoption levels
- Color code trends (green=good, red=bad)
- Flag data quality issues with warning badges
- Highlight Product MAU everywhere it's used

**Critical enhancements:**

- Section 18 (Momentum): Add volatility warning
- Section 15 (CTA): Flag mystery hubs
- Section 25 (Feature Adoption): Add adoption status badges
- Section 33 (Cohort Retention): Color code retention levels

---

## Component Mapping

### Existing Components to Reuse

- **Card, CardHeader, CardTitle, CardDescription, CardContent**: All sections
- **MiniStat**: Individual metrics (60+ uses)
- **MetricTable**: Tables (Feature adoption, Attribution, CTA, Cohorts)
- **StatSection**: Grouped sections (already used in 6 places)
- **MetricsCard**: Primary metrics (Quick Glance)
- **InsightCard**: Insights display
- **ConversionFunnel**: Funnel visualization
- **SearchConsoleMetrics**: SEO data

### New Components Created

- **StatusBadge**: Status indicators (5 types)
- **HealthMetricCard**: Health overview metrics

### Components to Create (Optional)

- **TrendIndicator**: Consistent trend display with icons
- **MetricExplainer**: Tooltip for MAU definitions
- **DataQualityBadge**: Specific badge for tracking issues

---

## Icon System (Lucide React)

### By Section Type

- **Health/Overview**: `Activity`
- **Growth**: `TrendingUp`, `TrendingDown`
- **Revenue**: `DollarSign`
- **Retention**: `RefreshCw`
- **Activation**: `CheckCircle`
- **Users**: `Users`
- **Features**: `Sparkles`
- **Analytics**: `BarChart3`
- **Settings**: `Settings`
- **Notifications**: `Bell`
- **Chat**: `MessageCircle`
- **Target/Goals**: `Target`
- **Calendar**: `CalendarRange`
- **Download**: `Download`

### Status Icons

- **Success**: `CheckCircle` (with `text-lunary-success-300`)
- **Warning**: `AlertCircle` (with `text-lunary-accent-300`)
- **Error**: `XCircle` (with `text-lunary-error-300`)
- **Info**: `Info` (with `text-lunary-secondary-300`)

---

## Color Coding System

### Status Colors

```tsx
const statusConfig = {
  excellent: {
    badge:
      'bg-lunary-success-950/40 text-lunary-success-300 border-lunary-success-700',
    text: 'text-lunary-success-300',
    border: 'border-lunary-success-700',
  },
  good: {
    badge:
      'bg-lunary-primary-950/40 text-lunary-primary-300 border-lunary-primary-700',
    text: 'text-lunary-primary-300',
    border: 'border-lunary-primary-700',
  },
  warning: {
    badge:
      'bg-lunary-accent-950/40 text-lunary-accent-300 border-lunary-accent-700',
    text: 'text-lunary-accent-300',
    border: 'border-lunary-accent-700',
  },
  critical: {
    badge:
      'bg-lunary-error-950/40 text-lunary-error-300 border-lunary-error-700',
    text: 'text-lunary-error-300',
    border: 'border-lunary-error-700',
  },
};
```

### Feature Adoption Status Rules

```tsx
function getAdoptionStatus(adoption: number): BadgeStatus {
  if (adoption === 0) return 'critical'; // Broken/not found
  if (adoption < 10) return 'warning'; // Low adoption
  if (adoption < 50) return 'good'; // Normal adoption
  return 'excellent'; // High adoption
}
```

### Retention Status Rules

```tsx
function getRetentionStatus(retention: number): BadgeStatus {
  if (retention === 0) return 'critical'; // Dead cohort
  if (retention < 15) return 'warning'; // Poor retention
  if (retention < 50) return 'good'; // Normal retention
  return 'excellent'; // Great retention
}
```

---

## Implementation Priority

### Phase 1: Foundation (DONE ✅)

- [x] Design system audit
- [x] Verify calculations (already correct!)
- [x] Create StatusBadge component
- [x] Create HealthMetricCard component
- [x] Document comprehensive inventory

### Phase 2: Investor Tab Enhancement

1. Add Health Overview section (NEW)
2. Add icons to tab triggers
3. Enhance insights section with StatusBadge
4. Add trend indicators to engagement sections
5. Simplify detailed metrics (hide in Operational)

**Estimated effort:** 2-3 hours

### Phase 3: Operational Tab Enhancement

1. Add MAU Type Explainer (NEW)
2. Add icons to all 24 section headers
3. Add StatusBadge to feature adoption table
4. Add StatusBadge to CTA performance table
5. Add color coding to cohort retention table
6. Add volatility warning to Momentum section
7. Flag tracking issues with badges

**Estimated effort:** 3-4 hours

### Phase 4: Polish & Testing

1. Consistent icon usage throughout
2. Responsive design verification
3. Empty state handling
4. Loading state improvements
5. Test all 33 sections render correctly
6. Verify no functionality lost

**Estimated effort:** 1-2 hours

**Total Implementation:** 6-9 hours

---

## Success Criteria

### Investor Snapshot Tab

- [ ] Health Overview shows 4 key metrics at top
- [ ] All sections have clear visual hierarchy
- [ ] Trends are easy to spot
- [ ] No tracking bugs visible
- [ ] Growth story is clear
- [ ] Icons used consistently
- [ ] Brand colors used effectively

### Operational Detail Tab

- [ ] MAU types explained at top
- [ ] All 24 sections preserved
- [ ] Icons on every section
- [ ] Tracking issues flagged with StatusBadge
- [ ] Feature adoption shows status
- [ ] Cohort retention color coded
- [ ] Data quality issues visible
- [ ] Product MAU highlighted as north star

### Overall

- [ ] Zero functionality lost
- [ ] No emojis anywhere (Lucide icons only)
- [ ] Feature adoption using Product MAU (verified ✅)
- [ ] Responsive on mobile
- [ ] Code is maintainable
- [ ] Components are reusable
- [ ] Brand identity consistent

---

## Files Modified

### New Files

- `/src/components/admin/StatusBadge.tsx` ✅
- `/src/components/admin/HealthMetricCard.tsx` ✅
- `/src/components/admin/index.ts` (updated) ✅

### Files to Modify

- `/src/app/admin/analytics/page.tsx` (main implementation)

### Documentation

- `DESIGN_SYSTEM_AUDIT.md` ✅
- `ANALYTICS_REDESIGN_PLAN.md` ✅
- `ANALYTICS_REDESIGN_PROGRESS.md` ✅
- `COMPLETE_ANALYTICS_INVENTORY.md` ✅ (this file)

---

## Next Steps

With this comprehensive inventory, you now have:

1. **Complete list** of all 33 sections
2. **Component mapping** for each section
3. **Enhancement strategy** for each section
4. **Icon system** defined
5. **Color coding rules** specified
6. **Implementation priority** ordered
7. **Success criteria** defined

The foundation components are built. Ready to implement the page-level redesign following the step-by-step guide in `ANALYTICS_REDESIGN_PROGRESS.md`.
