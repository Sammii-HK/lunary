# Analytics Insights Integration

## Overview

Integrated an automated insights generation system into the analytics dashboard that analyzes metrics and surfaces actionable recommendations.

## Components

### 1. Insights Generation Logic

**Location:** `/src/lib/analytics/insights.ts`

**Features:**

- Auto-generates insights from 18+ different metrics
- Categorizes insights by type: positive, warning, critical, info
- Prioritizes insights: urgent, high, medium, low
- Detects tracking quality issues automatically

**Insight Categories:**

- **Retention:** Cohort improvements, low retention warnings
- **Product:** Feature adoption, broken features, hook features
- **Growth:** Activation rates, signup quality
- **Engagement:** Stickiness, returning users
- **Revenue:** MRR milestones, conversion rates
- **Quality:** Tracking bugs, dual-event detection

**Example Insights:**

- "Recent cohorts showing 3x better D30 retention. Something changed in product - investigate what improved!"
- "Guide chat is your best feature but only 12.5% of users discover it. Add prominent discovery prompts."
- "Rituals feature has 0% adoption - either tracking is broken or feature is invisible to users."
- "Horoscopes are your hook feature with 75% adoption. Optimize this funnel and use it to drive other features."

### 2. InsightCard Component

**Location:** `/src/components/admin/InsightCard.tsx`

**Features:**

- Color-coded by insight type (positive/warning/critical/info)
- Uses Lunary brand colors
- Displays priority badges
- Shows metric values and action items
- Responsive design with Lucide icons

**Color Coding:**

- 🟢 **Positive:** Green tones (`lunary-success`)
- 🟡 **Warning:** Yellow tones
- 🔴 **Critical:** Red tones (`lunary-error`)
- 🔵 **Info:** Purple tones (`lunary-primary`)

### 3. Insights API Endpoint

**Location:** `/src/app/api/admin/analytics/insights/route.ts`

**Functionality:**

- Fetches all necessary analytics metrics in parallel
- Builds comprehensive `AnalyticsMetrics` object
- Calls `generateInsights()` with metrics
- Returns prioritized insights array

**Metrics Collected:**

- Product/App MAU, DAU, WAU
- Growth rate and signup count
- Activation and retention rates
- Feature adoption percentages
- Revenue metrics (MRR, conversion rate)
- Tracking quality issues

### 4. Dashboard Integration

**Location:** `/src/app/admin/analytics/page.tsx`

**Changes:**

- Added `insights` state
- Added insights fetching to main data fetch
- New "Actionable Insights" section in Investor Snapshot tab
- Auto-hides when no insights available
- 2-column responsive grid layout

**UI Placement:**
Located between "Quick Glance" and data integrity warnings in the Investor Snapshot tab.

## Insight Detection Rules

### Retention Improvements (Positive)

**Triggers when:**

- Recent cohort D30 retention > 50%
- Early cohort D30 retention < 20%
- Recent cohort is 3x better than early cohort

**Message:** Shows improvement multiplier
**Action:** "Document what changed and double down"

### Low Retention (Warning)

**Triggers when:**

- D30 retention < 15%
- Product MAU > 50

**Message:** Shows exact percentage
**Action:** "Add onboarding flow and engagement hooks"

### Low Feature Adoption (Critical)

**Triggers when:**

- Guide adoption < 15%
- Product MAU > 20

**Message:** "Guide chat is your best feature but only X% discover it"
**Action:** "Add feature tour + dashboard prompts"
**Priority:** Urgent

### Broken Features (Critical)

**Triggers when:**

- Ritual adoption = 0%
- Product MAU > 20

**Message:** "Either tracking is broken or feature is invisible"
**Action:** "Investigate tracking code + UX visibility"
**Priority:** Urgent

### High Hook Feature (Positive)

**Triggers when:**

- Horoscope adoption > 60%

**Message:** "Horoscopes are your hook feature with X% adoption"
**Action:** "Add cross-feature prompts from horoscope"

### Low Stickiness (Warning)

**Triggers when:**

- Stickiness (DAU/MAU) < 15%
- Product MAU > 20

**Message:** Shows stickiness percentage and active days
**Action:** "Add daily notifications + email reminders"

### Strong Activation (Positive)

**Triggers when:**

- Activation rate > 50%

**Message:** "X% of signups activate within 24h"
**Note:** "Your onboarding is working - now focus on retention"

### Low Activation (Warning)

**Triggers when:**

- Activation rate < 30%
- Signup count > 50

**Message:** "Only X% of new signups activate"
**Action:** "Improve onboarding flow + email nurture"

### Multi-Entry Architecture (Info)

**Triggers when:**

- Dashboard adoption < 25%
- Horoscope adoption > 50%
- Product MAU > 50

**Message:** "Users enter via email links and bookmarks - this is normal"
**Action:** "Track entry points to optimize direct-to-feature flows"

### Revenue Milestone (Positive)

**Triggers when:**

- MRR between $1,000 and $2,000

**Message:** "You're at $X MRR"
**Note:** "Focus on retention to hit $2k milestone"

### Low Conversion Rate (Warning)

**Triggers when:**

- Free-to-trial conversion < 10%
- Signup count > 100

**Message:** Shows exact conversion percentage
**Action:** "A/B test paywall timing + messaging"

## Tracking Quality Detection

### Dual-Event Bug Detection

**Detects when:**

- Two horoscope events have identical counts
- Counts are > 10

**Issue:** "Identical counts (X) suggest dual-event bug"
**Severity:** Medium

### Zero Adoption Detection

**Detects when:**

- Critical features (`ritual_started`, `chart_viewed`) have 0 events
- Product MAU > 20

**Issue:** "0 events recorded - tracking likely broken"
**Severity:** High

## API Response Format

```json
{
  "insights": [
    {
      "type": "positive" | "warning" | "critical" | "info",
      "category": "retention" | "product" | "growth" | "engagement" | "revenue" | "quality",
      "message": "Human-readable insight message",
      "priority": "urgent" | "high" | "medium" | "low",
      "action": "Recommended next step (optional)",
      "metric": {
        "label": "Metric name",
        "value": "Formatted value"
      }
    }
  ],
  "metrics": { /* Full AnalyticsMetrics object */ },
  "range": { "start": "2026-01-01", "end": "2026-01-31" }
}
```

## Usage Example

### API Call

```typescript
const response = await fetch(
  '/api/admin/analytics/insights?start_date=2026-01-01&end_date=2026-01-31',
);
const { insights } = await response.json();
```

### Rendering Insights

```tsx
<div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
  {insights.map((insight, idx) => (
    <InsightCard key={idx} insight={insight} />
  ))}
</div>
```

## Benefits

1. **Proactive Issue Detection:** Automatically surfaces tracking bugs and broken features
2. **Actionable Recommendations:** Each insight includes specific next steps
3. **Prioritized Focus:** Urgent issues appear first
4. **Positive Reinforcement:** Celebrates wins to maintain momentum
5. **Context-Aware:** Insights adapt based on product MAU and other thresholds
6. **Investor-Ready:** Clean presentation of what matters most

## Future Enhancements

Potential improvements:

1. Historical insight tracking (show resolved/new insights)
2. Insight dismissal and snoozing
3. Email notifications for critical insights
4. Custom insight rules configuration
5. A/B test suggestions based on insights
6. Benchmark comparisons (vs. industry standards)
7. Insight impact tracking (measure results of taking action)
8. Natural language queries ("What should I focus on this week?")

## Files Modified

- `/src/app/admin/analytics/page.tsx` - Added insights state and UI section
- **Created:** `/src/app/api/admin/analytics/insights/route.ts` - Insights API endpoint
- **Created:** `/src/lib/analytics/insights.ts` - Insights generation logic (previous session)
- **Created:** `/src/components/admin/InsightCard.tsx` - Insights display component (previous session)

## Testing

To test the insights system:

1. Navigate to `/admin/analytics`
2. Check the "Actionable Insights" section below "Quick Glance"
3. Insights will auto-generate based on current metrics
4. Look for color-coded cards with priority badges
5. Verify that critical issues (like 0% adoption) appear as urgent

## Performance

- Insights generation happens in parallel with other analytics fetches
- No additional load time for the dashboard
- Insights are computed server-side from already-fetched metrics
- Response cached per date range (inherits from analytics cache)
