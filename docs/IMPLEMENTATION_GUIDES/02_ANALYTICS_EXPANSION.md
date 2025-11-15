# Expand Analytics - DAU/WAU/MAU Tracking & Feature Usage

## Overview

Expand analytics dashboard to track daily/weekly/monthly active users, AI engagement metrics, conversion rates, cosmic pulse open rates, and feature usage heatmaps.

## Requirements

### Metrics to Track

1. **User Activity Metrics**
   - DAU (Daily Active Users)
   - WAU (Weekly Active Users)
   - MAU (Monthly Active Users)
   - User retention (Day 1, Day 7, Day 30)
   - Churn rate

2. **AI Engagement Metrics**
   - AI chat sessions per user
   - AI tokens per user (average)
   - AI messages per session
   - Most used Copilot modes
   - AI conversation completion rate

3. **Conversion Metrics**
   - Free to paid conversion rate
   - Trial to paid conversion rate
   - Conversion by feature (which feature drove conversion)
   - Time to conversion
   - Conversion funnel drop-off points

4. **Notification Metrics**
   - Cosmic pulse open rate
   - Cosmic pulse click-through rate
   - Notification delivery rate
   - Notification preference breakdown

5. **Feature Usage**
   - Feature usage heatmap (which features are used most)
   - Collections usage
   - Moon Circles participation
   - Tarot readings per user
   - Birth chart views

## Database Schema

### Table: `analytics_user_activity`

```sql
CREATE TABLE IF NOT EXISTS analytics_user_activity (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_date DATE NOT NULL,
  activity_type TEXT NOT NULL, -- 'session', 'ai_chat', 'tarot', 'moon_circle', 'collection', etc.
  activity_count INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date, activity_type)
);

CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_user_id ON analytics_user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_date ON analytics_user_activity(activity_date);
CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_type ON analytics_user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_user_date ON analytics_user_activity(user_id, activity_date);
```

### Table: `analytics_ai_usage`

```typescript
CREATE TABLE IF NOT EXISTS analytics_ai_usage (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  mode TEXT, -- 'cosmic_weather', 'transit_feelings', 'tarot', 'ritual', 'weekly_overview', 'journal', 'general'
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_analytics_ai_usage_user_id ON analytics_ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_ai_usage_session_id ON analytics_ai_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_ai_usage_created_at ON analytics_ai_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_ai_usage_mode ON analytics_ai_usage(mode);
```

### Table: `analytics_conversions`

```sql
CREATE TABLE IF NOT EXISTS analytics_conversions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  conversion_type TEXT NOT NULL, -- 'free_to_paid', 'trial_to_paid', 'upgrade'
  from_plan TEXT,
  to_plan TEXT,
  trigger_feature TEXT, -- 'ai_limit', 'collections_limit', 'moon_circle', etc.
  days_to_convert INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_conversions_user_id ON analytics_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_type ON analytics_conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_created_at ON analytics_conversions(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_trigger_feature ON analytics_conversions(trigger_feature);
```

### Table: `analytics_notification_events`

```sql
CREATE TABLE IF NOT EXISTS analytics_notification_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'cosmic_pulse', 'moon_circle', 'cosmic_changes', 'weekly_report'
  event_type TEXT NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked'
  notification_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_notification_events_user_id ON analytics_notification_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_notification_events_type ON analytics_notification_events(notification_type);
CREATE INDEX IF NOT EXISTS idx_analytics_notification_events_event_type ON analytics_notification_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_notification_events_created_at ON analytics_notification_events(created_at);
```

## API Endpoints

### 1. POST `/api/analytics/track`

**Purpose**: Track user activity events

**Body**:

```typescript
{
  activity_type: 'session' | 'ai_chat' | 'tarot' | 'moon_circle' | 'collection' | 'birth_chart' | 'cosmic_state';
  metadata?: {
    session_id?: string;
    feature?: string;
    [key: string]: any;
  };
}
```

**Files**: `src/app/api/analytics/track/route.ts`

### 2. GET `/api/admin/analytics/dau-wau-mau`

**Purpose**: Get DAU/WAU/MAU metrics

**Query Params**:

- `start_date`: Start date (ISO string)
- `end_date`: End date (ISO string)
- `granularity`: 'day' | 'week' | 'month'

**Response**:

```typescript
{
  dau: number;
  wau: number;
  mau: number;
  retention: {
    day_1: number; // % of users who returned on day 1
    day_7: number;
    day_30: number;
  }
  churn_rate: number;
  trends: Array<{
    date: string;
    dau: number;
    wau: number;
    mau: number;
  }>;
}
```

**Files**: `src/app/api/admin/analytics/dau-wau-mau/route.ts`

### 3. GET `/api/admin/analytics/ai-engagement`

**Purpose**: Get AI engagement metrics

**Query Params**:

- `start_date`: Start date
- `end_date`: End date

**Response**:

```typescript
{
  total_sessions: number;
  unique_users: number;
  avg_sessions_per_user: number;
  avg_tokens_per_user: number;
  avg_messages_per_session: number;
  completion_rate: number;
  mode_breakdown: Array<{
    mode: string;
    count: number;
    percentage: number;
  }>;
  trends: Array<{
    date: string;
    sessions: number;
    tokens: number;
  }>;
}
```

**Files**: `src/app/api/admin/analytics/ai-engagement/route.ts`

### 4. GET `/api/admin/analytics/conversions`

**Purpose**: Get conversion metrics

**Query Params**:

- `start_date`: Start date
- `end_date`: End date
- `conversion_type`: Filter by type

**Response**:

```typescript
{
  total_conversions: number;
  conversion_rate: number; // % of free users who converted
  trial_conversion_rate: number; // % of trial users who converted
  avg_days_to_convert: number;
  trigger_breakdown: Array<{
    feature: string;
    count: number;
    percentage: number;
  }>;
  funnel: {
    free_users: number;
    trial_users: number;
    paid_users: number;
    drop_off_points: Array<{
      stage: string;
      drop_off_rate: number;
    }>;
  }
}
```

**Files**: `src/app/api/admin/analytics/conversions/route.ts`

### 5. GET `/api/admin/analytics/notifications`

**Purpose**: Get notification metrics

**Query Params**:

- `start_date`: Start date
- `end_date`: End date
- `notification_type`: Filter by type

**Response**:

```typescript
{
  cosmic_pulse: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    open_rate: number;
    click_through_rate: number;
  }
  moon_circle: {
    sent: number;
    opened: number;
    clicked: number;
  }
  weekly_report: {
    sent: number;
    opened: number;
    clicked: number;
  }
  overall_open_rate: number;
  overall_click_through_rate: number;
}
```

**Files**: `src/app/api/admin/analytics/notifications/route.ts`

### 6. GET `/api/admin/analytics/feature-usage`

**Purpose**: Get feature usage heatmap

**Query Params**:

- `start_date`: Start date
- `end_date`: End date

**Response**:

```typescript
{
  features: Array<{
    feature: string;
    unique_users: number;
    total_events: number;
    avg_per_user: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  heatmap: Array<{
    date: string;
    features: {
      [feature: string]: number;
    };
  }>;
}
```

**Files**: `src/app/api/admin/analytics/feature-usage/route.ts`

## UI Components

### 1. `AnalyticsDashboard.tsx`

**Location**: `src/app/admin/analytics/page.tsx` (update existing)

**Sections**:

1. **Overview Cards**
   - DAU, WAU, MAU
   - Conversion rate
   - AI engagement rate
   - Notification open rate

2. **User Activity Chart**
   - Line chart showing DAU/WAU/MAU over time
   - Retention metrics

3. **AI Engagement Section**
   - Sessions, tokens, messages
   - Mode breakdown (pie chart)
   - Completion rate

4. **Conversion Funnel**
   - Visual funnel showing drop-off points
   - Conversion by trigger feature

5. **Notification Metrics**
   - Open rates by type
   - Click-through rates

6. **Feature Usage Heatmap**
   - Grid showing feature usage over time
   - Most used features list

### 2. `MetricsCard.tsx`

**Location**: `src/components/admin/MetricsCard.tsx`

**Props**:

```typescript
{
  title: string;
  value: string | number;
  change?: number; // % change
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
}
```

### 3. `ConversionFunnel.tsx`

**Location**: `src/components/admin/ConversionFunnel.tsx`

**Features**:

- Visual funnel diagram
- Drop-off percentages
- Interactive tooltips

## Implementation Steps

### Phase 1: Database & Tracking

1. ✅ Create `analytics_user_activity` table
2. ✅ Create `analytics_ai_usage` table
3. ✅ Create `analytics_conversions` table
4. ✅ Create `analytics_notification_events` table
5. ✅ Update existing analytics tracking to use new tables
6. ✅ Add activity tracking to key user actions:
   - AI chat sessions
   - Tarot readings
   - Moon Circle participation
   - Collection creation
   - Birth chart views
   - Cosmic state views

### Phase 2: Conversion Tracking

1. ✅ Track conversions when user upgrades
2. ✅ Record trigger feature (what caused conversion)
3. ✅ Calculate days to convert
4. ✅ Track funnel drop-off points

### Phase 3: Notification Tracking

1. ✅ Track notification sent events
2. ✅ Track notification opened events (via email tracking pixels)
3. ✅ Track notification clicked events (via UTM params)
4. ✅ Update notification sending code to log events

### Phase 4: API Endpoints

1. ✅ Create `/api/analytics/track` endpoint
2. ✅ Create `/api/admin/analytics/dau-wau-mau` endpoint
3. ✅ Create `/api/admin/analytics/ai-engagement` endpoint
4. ✅ Create `/api/admin/analytics/conversions` endpoint
5. ✅ Create `/api/admin/analytics/notifications` endpoint
6. ✅ Create `/api/admin/analytics/feature-usage` endpoint

### Phase 5: Dashboard UI

1. ✅ Update `/admin/analytics` page
2. ✅ Add overview metrics cards
3. ✅ Add charts (use recharts or similar)
4. ✅ Add conversion funnel visualization
5. ✅ Add feature usage heatmap
6. ✅ Add date range picker
7. ✅ Add export functionality (CSV)

### Phase 6: Integration

1. ✅ Add tracking calls to AI chat
2. ✅ Add tracking calls to notification handlers
3. ✅ Add tracking calls to conversion events
4. ✅ Add email tracking pixels
5. ✅ Add UTM tracking to notification links

## Files to Create

```
sql/analytics_user_activity.sql
sql/analytics_ai_usage.sql
sql/analytics_conversions.sql
sql/analytics_notification_events.sql
src/app/api/analytics/track/route.ts
src/app/api/admin/analytics/dau-wau-mau/route.ts
src/app/api/admin/analytics/ai-engagement/route.ts
src/app/api/admin/analytics/conversions/route.ts
src/app/api/admin/analytics/notifications/route.ts
src/app/api/admin/analytics/feature-usage/route.ts
src/components/admin/MetricsCard.tsx
src/components/admin/ConversionFunnel.tsx
src/lib/analytics/tracking.ts (helper functions)
```

## Files to Modify

```
src/app/admin/analytics/page.tsx (major update)
src/app/api/ai/chat/route.ts (add tracking)
src/app/api/cron/daily-cosmic-pulse/route.ts (add tracking)
src/app/api/cron/weekly-cosmic-report/route.ts (add tracking)
src/app/api/stripe/webhook/route.ts (add conversion tracking)
src/lib/email.ts (add tracking pixels)
```

## Tracking Implementation Details

### Activity Tracking

```typescript
// In key user actions
await trackActivity({
  userId,
  activity_type: 'ai_chat',
  metadata: {
    session_id,
    mode: 'cosmic_weather',
    message_count: 5,
  },
});
```

### AI Usage Tracking

```typescript
// Start of AI session
const sessionId = await startAISession({
  userId,
  mode: 'cosmic_weather',
});

// End of AI session
await endAISession({
  sessionId,
  message_count: 10,
  token_count: 2500,
  completed: true,
});
```

### Conversion Tracking

```typescript
// When user upgrades
await trackConversion({
  userId,
  conversion_type: 'free_to_paid',
  from_plan: 'free',
  to_plan: 'monthly',
  trigger_feature: 'ai_limit',
  days_to_convert: 7,
});
```

### Notification Tracking

```typescript
// When sending notification
await trackNotificationEvent({
  userId,
  notification_type: 'cosmic_pulse',
  event_type: 'sent',
  notification_id: emailId,
});

// In email template (tracking pixel)
<img src="${baseUrl}/api/analytics/track-notification?type=cosmic_pulse&id=${emailId}&event=opened" width="1" height="1" />

// In email links (UTM params)
<a href="${deepLinkUrl}&utm_source=email&utm_medium=cosmic_pulse&utm_campaign=daily">Click here</a>
```

## Testing Checklist

- [ ] Activity tracking records events correctly
- [ ] DAU/WAU/MAU calculations are accurate
- [ ] AI engagement metrics match actual usage
- [ ] Conversion tracking captures all upgrade paths
- [ ] Notification tracking pixels work
- [ ] UTM params are captured correctly
- [ ] Charts display data correctly
- [ ] Date range filtering works
- [ ] Export to CSV works
- [ ] Performance is acceptable (cached queries)

## Performance Considerations

- Use materialized views for aggregated metrics
- Cache DAU/WAU/MAU calculations (update hourly)
- Use database indexes for fast queries
- Consider using PostHog or similar for real-time analytics
- Batch insert tracking events for performance

## Future Enhancements

- Real-time analytics dashboard
- Cohort analysis
- A/B test results integration
- Predictive churn analysis
- User segmentation
- Custom event tracking
- Funnel visualization improvements
- Export to Google Sheets/Excel
