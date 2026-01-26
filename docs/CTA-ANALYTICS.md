# CTA Analytics & A/B Testing Guide

## Overview

The CTA system tracks both **impressions** (views) and **clicks** to help you understand which CTAs and examples perform best. This enables data-driven optimization and A/B testing.

## What's Tracked

### Impression Events (`cta_impression`)

Fired when a CTA is shown to a user:

- **hub**: Content category (e.g., "horoscopes", "planets")
- **ctaId**: Always "contextual_nudge"
- **location**: Where on page (e.g., "seo_contextual_nudge")
- **label**: Button text
- **href**: Destination URL
- **pagePath**: Current page URL
- **exampleType**: Type of example shown (e.g., "transit_to_natal", "house_activation")
- **exampleText**: Actual example text (e.g., "Jupiter 17°58' Cancer ⚹ your natal Moon")
- **ctaVariant**: Hub + CTA index (e.g., "horoscopes_0", "planets_1")
- **anonymousId**: User tracking ID
- **userId**: If authenticated
- **userEmail**: If authenticated

### Click Events (`cta_clicked`)

Fired when user clicks a CTA button (same fields as impressions)

## Conversion Rate Formula

```
CTR (Click-Through Rate) = Clicks / Impressions × 100%
```

Example:

- 1,000 impressions of "horoscopes_0" with "Personal Day" example
- 45 clicks
- **CTR = 4.5%**

## A/B Testing Examples

### 1. Test Different Examples Within Same Hub

**Question**: Do transit examples convert better than Personal Day examples on horoscope pages?

**SQL Query** (PostHog/Analytics):

```sql
SELECT
  example_type,
  COUNT(CASE WHEN event = 'cta_impression' THEN 1 END) as impressions,
  COUNT(CASE WHEN event = 'cta_clicked' THEN 1 END) as clicks,
  ROUND(100.0 * COUNT(CASE WHEN event = 'cta_clicked' THEN 1 END) /
    NULLIF(COUNT(CASE WHEN event = 'cta_impression' THEN 1 END), 0), 2) as ctr
FROM events
WHERE hub = 'horoscopes'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY example_type
ORDER BY ctr DESC;
```

**Expected Results**:
| example_type | impressions | clicks | ctr |
|--------------|-------------|--------|-----|
| transit_to_natal | 5,234 | 312 | 5.96% |
| personal_day | 5,187 | 249 | 4.80% |
| house_activation | 5,201 | 234 | 4.50% |

**Action**: Keep "transit_to_natal" examples, test removing lower performers.

### 2. Compare Hub Performance

**Question**: Which Grimoire hubs have the best CTA conversion?

**SQL Query**:

```sql
SELECT
  hub,
  COUNT(CASE WHEN event = 'cta_impression' THEN 1 END) as impressions,
  COUNT(CASE WHEN event = 'cta_clicked' THEN 1 END) as clicks,
  ROUND(100.0 * COUNT(CASE WHEN event = 'cta_clicked' THEN 1 END) /
    NULLIF(COUNT(CASE WHEN event = 'cta_impression' THEN 1 END), 0), 2) as ctr
FROM events
WHERE cta_id = 'contextual_nudge'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY hub
ORDER BY ctr DESC
LIMIT 10;
```

**Example Results**:
| hub | impressions | clicks | ctr |
|-----|-------------|--------|-----|
| transits | 8,234 | 576 | 7.00% |
| horoscopes | 15,623 | 890 | 5.70% |
| planets | 12,456 | 623 | 5.00% |
| houses | 9,876 | 444 | 4.50% |
| moon | 7,654 | 321 | 4.19% |

**Action**: Study why "transits" converts best, apply learnings to other hubs.

### 3. Test CTA Copy Variations

**Question**: Does adding "Example:" prefix improve or hurt CTR?

**How to Test**:

1. Create two CTA variants in `contextual-nudges.json`:

   ```json
   "horoscopes": [
     {
       "headline": "This is your sun sign forecast",
       "subline": "With your birth chart, you'd see: {EXAMPLE}\n\nTakes 2 minutes.",
       ...
     },
     {
       "headline": "Go beyond sun sign",
       "subline": "Sign in to read through your full birth chart.\n\nExample: {EXAMPLE}",
       ...
     }
   ]
   ```

2. Track `ctaVariant` field: "horoscopes_0" vs "horoscopes_1"

3. Query after 2 weeks:
   ```sql
   SELECT
     cta_variant,
     COUNT(CASE WHEN event = 'cta_impression' THEN 1 END) as impressions,
     COUNT(CASE WHEN event = 'cta_clicked' THEN 1 END) as clicks,
     ROUND(100.0 * COUNT(CASE WHEN event = 'cta_clicked' THEN 1 END) /
       NULLIF(COUNT(CASE WHEN event = 'cta_impression' THEN 1 END), 0), 2) as ctr
   FROM events
   WHERE hub = 'horoscopes'
     AND timestamp >= NOW() - INTERVAL '14 days'
   GROUP BY cta_variant;
   ```

**Statistical Significance**:
Use an A/B test calculator to ensure results are significant (usually need ~100 conversions per variant).

### 4. Analyze Example Text Performance

**Question**: Do longer or shorter examples convert better?

**SQL Query**:

```sql
SELECT
  hub,
  CASE
    WHEN LENGTH(example_text) < 50 THEN 'short'
    WHEN LENGTH(example_text) < 100 THEN 'medium'
    ELSE 'long'
  END as example_length,
  COUNT(CASE WHEN event = 'cta_impression' THEN 1 END) as impressions,
  COUNT(CASE WHEN event = 'cta_clicked' THEN 1 END) as clicks,
  ROUND(100.0 * COUNT(CASE WHEN event = 'cta_clicked' THEN 1 END) /
    NULLIF(COUNT(CASE WHEN event = 'cta_impression' THEN 1 END), 0), 2) as ctr
FROM events
WHERE example_text IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY hub, example_length
ORDER BY hub, ctr DESC;
```

### 5. User Journey Analysis

**Question**: Do users who click CTAs convert to paid?

**SQL Query** (requires joining with conversion events):

```sql
WITH cta_clickers AS (
  SELECT DISTINCT user_id
  FROM events
  WHERE event = 'cta_clicked'
    AND user_id IS NOT NULL
    AND timestamp >= NOW() - INTERVAL '30 days'
),
converters AS (
  SELECT DISTINCT user_id
  FROM events
  WHERE event IN ('subscription_started', 'trial_converted')
    AND timestamp >= NOW() - INTERVAL '30 days'
)
SELECT
  COUNT(DISTINCT c.user_id) as cta_clickers,
  COUNT(DISTINCT cv.user_id) as converters,
  ROUND(100.0 * COUNT(DISTINCT cv.user_id) / COUNT(DISTINCT c.user_id), 2) as conversion_rate
FROM cta_clickers c
LEFT JOIN converters cv ON c.user_id = cv.user_id;
```

## PostHog Dashboards

### Recommended Dashboard Structure

**CTA Performance Overview**:

- Total impressions (last 30 days)
- Total clicks (last 30 days)
- Overall CTR
- CTR by hub (chart)
- CTR trend over time (line graph)

**Example Performance**:

- CTR by example_type (bar chart)
- Top 10 performing examples (table)
- Bottom 10 performing examples (table)

**A/B Test Results**:

- CTR by cta_variant (comparison)
- Statistical significance calculator
- Win/loss ratio

### Creating Insights in PostHog

1. **Impression Funnel**:
   - Step 1: `cta_impression` event
   - Step 2: `cta_clicked` event (same session)
   - Step 3: `signup` or `birth_data_submitted` event

2. **Hub Comparison**:
   - Event: `cta_clicked`
   - Breakdown by: `hub`
   - Metric: CTR (clicks/impressions)

3. **Example Performance**:
   - Event: `cta_impression`
   - Filter: `hub = 'horoscopes'`
   - Breakdown by: `example_type`
   - Metric: Conversion to click

## Optimization Workflow

### Monthly Review Process

1. **Generate Report** (1st of each month):

   ```bash
   # Export last month's data
   psql -d analytics -c "
   SELECT hub, example_type, cta_variant,
          COUNT(CASE WHEN event = 'cta_impression' THEN 1 END) as views,
          COUNT(CASE WHEN event = 'cta_clicked' THEN 1 END) as clicks,
          ROUND(100.0 * COUNT(CASE WHEN event = 'cta_clicked' THEN 1 END) /
            NULLIF(COUNT(CASE WHEN event = 'cta_impression' THEN 1 END), 0), 2) as ctr
   FROM events
   WHERE timestamp >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
     AND timestamp < DATE_TRUNC('month', CURRENT_DATE)
   GROUP BY hub, example_type, cta_variant
   ORDER BY ctr DESC;
   " > cta_report_$(date +%Y-%m).csv
   ```

2. **Identify Winners & Losers**:
   - CTR > 6%: High performers ✅
   - CTR 4-6%: Average performers ⚠️
   - CTR < 4%: Low performers ❌

3. **Take Action**:
   - **Remove**: Examples with CTR < 3% and >1000 impressions
   - **Test**: Create variations of high performers (>6% CTR)
   - **Update**: Refresh examples monthly via cron (already automated)

4. **Document Changes**:
   ```markdown
   ## CTA Changes - February 2026

   - **Removed**: "Personal Day" examples from horoscopes (3.2% CTR)
   - **Added**: More transit examples (7.1% average CTR)
   - **Testing**: Shorter copy on moon hub
   ```

### Quick Wins

**If overall CTR is low (<4%)**:

1. Check if examples are loading correctly
2. Verify `{EXAMPLE}` placeholders are in CTA copy
3. Ensure examples are recent (regenerated monthly)
4. Test more concrete examples (transits > general statements)

**If specific hub underperforms**:

1. Review CTA copy for that hub
2. Check if examples match user intent on those pages
3. Test different example types
4. Consider changing button copy or placement

## API Endpoints

### Track Impression

```typescript
POST /api/telemetry/cta-impression
{
  "hub": "horoscopes",
  "ctaId": "contextual_nudge",
  "location": "seo_contextual_nudge",
  "label": "Get my personalised horoscope",
  "href": "/auth?signup=true",
  "pagePath": "/grimoire/horoscopes/daily/aries",
  "exampleType": "transit_to_natal",
  "exampleText": "Jupiter 17°58' Cancer ⚹ your natal Moon",
  "ctaVariant": "horoscopes_0",
  "anonymousId": "..."
}
```

### Track Click

```typescript
POST / api / telemetry / cta - click;
// Same payload as impression
```

## Event Schema

Both impression and click events share the same schema in the analytics database:

```sql
CREATE TABLE events (
  event_id UUID PRIMARY KEY,
  event_type VARCHAR(50), -- 'cta_impression' or 'cta_clicked'
  user_id UUID,
  anonymous_id UUID,
  user_email VARCHAR(255),
  page_path VARCHAR(500),
  timestamp TIMESTAMP,
  metadata JSONB -- Contains all CTA fields
);

-- Example metadata structure
{
  "source": "cta_impression",
  "hub": "horoscopes",
  "cta_id": "contextual_nudge",
  "cta_location": "seo_contextual_nudge",
  "cta_label": "Get my personalised horoscope",
  "cta_href": "/auth?signup=true",
  "example_type": "transit_to_natal",
  "example_text": "Jupiter 17°58' Cancer ⚹ your natal Moon",
  "cta_variant": "horoscopes_0"
}
```

## Best Practices

1. **Minimum Sample Size**: Wait for at least 100 impressions per variant before drawing conclusions
2. **Statistical Significance**: Use a significance level of p < 0.05 for A/B tests
3. **Consistent Tracking**: Never modify analytics code mid-test
4. **Segment Analysis**: Break down by:
   - New vs returning visitors
   - Device type (mobile vs desktop)
   - Time of day
   - Day of week
5. **Monthly Reviews**: Run analysis on the 1st of each month
6. **Document Tests**: Keep a log of all A/B tests and results

## Troubleshooting

**Impressions tracked but no clicks**:

- Check if button is clickable
- Verify `trackCtaClick` is being called
- Test in incognito mode (ad blockers may interfere)

**Duplicate impressions**:

- Check `useRef` in ContextualNudgeButton is working
- Verify component isn't re-mounting unnecessarily

**Missing example data**:

- Run `pnpm run generate-cta-examples` to regenerate
- Check `cta-examples.json` has examples for that hub
- Verify `{EXAMPLE}` placeholder is in CTA copy

## Resources

- **PostHog**: https://posthog.lunary.app (if using PostHog)
- **Analytics Dashboard**: /admin/analytics/cta
- **Example Generation**: `pnpm run generate-cta-examples`
- **Cron Logs**: Vercel dashboard → Cron Jobs → generate-cta-examples

---

**Last Updated**: 2026-01-26
**Version**: 1.0
