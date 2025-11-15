# Light Community Layer - Moon Circle Insights Sharing

## Overview

Allow users to share insights from Moon Circle events anonymously in-app, with email/Substack comment replies. Creates a sense of community without requiring full social features.

## Requirements

### Core Features

1. **Shared Moon Circle Insights**
   - Users can submit insights after participating in a Moon Circle
   - Insights are anonymous (no user names shown)
   - Insights are tied to specific Moon Circle events (New/Full Moon dates)
   - Optional: Allow users to reply via email or Substack comments

2. **In-App Display**
   - Show shared insights on Moon Circle event pages
   - Display insights grouped by Moon Circle event
   - Show insight count per event
   - Filter by Moon Phase (New Moon vs Full Moon)

3. **Email Integration**
   - Include "Share your insight" CTA in Moon Circle emails
   - Deep link to insight submission form
   - Optional: Allow email replies that get posted as insights

## Database Schema

### Table: `moon_circle_insights`

```sql
CREATE TABLE IF NOT EXISTS moon_circle_insights (
  id SERIAL PRIMARY KEY,
  moon_circle_id INTEGER NOT NULL REFERENCES moon_circles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  insight_text TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Optional: For email replies
  source TEXT DEFAULT 'app', -- 'app', 'email', 'substack'
  email_thread_id TEXT, -- For tracking email replies
  is_approved BOOLEAN DEFAULT true, -- For moderation
  CONSTRAINT insight_text_length CHECK (char_length(insight_text) >= 10 AND char_length(insight_text) <= 1000)
);

CREATE INDEX IF NOT EXISTS idx_moon_circle_insights_moon_circle_id ON moon_circle_insights(moon_circle_id);
CREATE INDEX IF NOT EXISTS idx_moon_circle_insights_user_id ON moon_circle_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_moon_circle_insights_created_at ON moon_circle_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moon_circle_insights_is_approved ON moon_circle_insights(is_approved) WHERE is_approved = true;
```

### Update: `moon_circles` table

```sql
-- Add insight count column (denormalized for performance)
ALTER TABLE moon_circles ADD COLUMN IF NOT EXISTS insight_count INTEGER DEFAULT 0;

-- Create function to update insight count
CREATE OR REPLACE FUNCTION update_moon_circle_insight_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE moon_circles
    SET insight_count = insight_count + 1
    WHERE id = NEW.moon_circle_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE moon_circles
    SET insight_count = GREATEST(0, insight_count - 1)
    WHERE id = OLD.moon_circle_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_insight_count ON moon_circle_insights;
CREATE TRIGGER trigger_update_insight_count
  AFTER INSERT OR DELETE ON moon_circle_insights
  FOR EACH ROW EXECUTE FUNCTION update_moon_circle_insight_count();
```

## API Endpoints

### 1. GET `/api/moon-circles/[id]/insights`

**Purpose**: Fetch insights for a specific Moon Circle event

**Query Params**:

- `limit`: Number of insights to return (default: 20)
- `offset`: Pagination offset (default: 0)
- `sort`: 'newest' | 'oldest' (default: 'newest')

**Response**:

```typescript
{
  insights: Array<{
    id: number;
    insight_text: string;
    created_at: string;
    source: 'app' | 'email' | 'substack';
    // No user_id or user info (anonymous)
  }>;
  total: number;
  moon_circle: {
    id: number;
    moon_phase: string;
    date: string;
    insight_count: number;
  }
}
```

**Files**: `src/app/api/moon-circles/[id]/insights/route.ts`

### 2. POST `/api/moon-circles/[id]/insights`

**Purpose**: Submit a new insight

**Body**:

```typescript
{
  insight_text: string; // 10-1000 chars
  is_anonymous?: boolean; // default: true
}
```

**Response**:

```typescript
{
  success: boolean;
  insight: {
    id: number;
    insight_text: string;
    created_at: string;
  }
}
```

**Auth**: Requires user authentication
**Validation**: Check insight_text length, sanitize content

**Files**: `src/app/api/moon-circles/[id]/insights/route.ts`

### 3. GET `/api/moon-circles/insights/recent`

**Purpose**: Get recent insights across all Moon Circles (for homepage/feed)

**Query Params**:

- `limit`: Number of insights (default: 10)
- `moon_phase`: Filter by 'New Moon' | 'Full Moon'

**Response**:

```typescript
{
  insights: Array<{
    id: number;
    insight_text: string;
    created_at: string;
    moon_circle: {
      id: number;
      moon_phase: string;
      date: string;
    };
  }>;
}
```

**Files**: `src/app/api/moon-circles/insights/recent/route.ts`

## UI Components

### 1. `MoonCircleInsights.tsx`

**Location**: `src/components/MoonCircleInsights.tsx`

**Features**:

- Display list of insights for a Moon Circle
- "Share Your Insight" button/form
- Pagination
- Loading states
- Empty state

**Props**:

```typescript
{
  moonCircleId: number;
  moonPhase: string;
  date: string;
}
```

### 2. `ShareInsightForm.tsx`

**Location**: `src/components/ShareInsightForm.tsx`

**Features**:

- Textarea for insight (with character counter)
- Anonymous toggle (default: true)
- Submit button
- Success/error states
- Validation (10-1000 chars)

**Props**:

```typescript
{
  moonCircleId: number;
  onSuccess?: () => void;
}
```

### 3. `InsightCard.tsx`

**Location**: `src/components/InsightCard.tsx`

**Features**:

- Display single insight
- Format date/time
- Show source badge (app/email/substack)
- Moon phase indicator

**Props**:

```typescript
{
  insight: {
    id: number;
    insight_text: string;
    created_at: string;
    source: string;
  };
  moonCircle?: {
    moon_phase: string;
    date: string;
  };
}
```

## Pages to Update

### 1. `/moon-circles/page.tsx`

**Updates**:

- Add `MoonCircleInsights` component to each Moon Circle card
- Show insight count badge
- Add "View Insights" link/button

### 2. `/moon-circles/[id]/page.tsx` (NEW)

**Purpose**: Dedicated page for a specific Moon Circle event

**Content**:

- Moon Circle details (phase, date, rituals, etc.)
- `MoonCircleInsights` component
- `ShareInsightForm` component
- Related Moon Circles

## Email Integration

### Update Moon Circle Email Template

**File**: `src/lib/moon-circles/email-template.tsx`

**Add Section**:

```tsx
<div style='margin: 30px 0; padding: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 8px;'>
  <h3 style='color: #fff;'>Share Your Insight</h3>
  <p style='color: #cbd5e1;'>
    Did this Moon Circle resonate with you? Share your insight anonymously with
    the community.
  </p>
  <a
    href='${appUrl}/moon-circles/${moonCircleId}?share=true'
    style='display: inline-block; background: #8b5cf6; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;'
  >
    Share Your Insight →
  </a>
</div>
```

## Implementation Steps

### Phase 1: Database & API

1. ✅ Create `moon_circle_insights` table
2. ✅ Add `insight_count` to `moon_circles` table
3. ✅ Create trigger for auto-updating insight count
4. ✅ Create GET `/api/moon-circles/[id]/insights` endpoint
5. ✅ Create POST `/api/moon-circles/[id]/insights` endpoint
6. ✅ Create GET `/api/moon-circles/insights/recent` endpoint
7. ✅ Add validation and sanitization
8. ✅ Add rate limiting (max 3 insights per Moon Circle per user)

### Phase 2: UI Components

1. ✅ Create `InsightCard.tsx` component
2. ✅ Create `ShareInsightForm.tsx` component
3. ✅ Create `MoonCircleInsights.tsx` component
4. ✅ Add loading and error states
5. ✅ Add character counter and validation

### Phase 3: Page Integration

1. ✅ Update `/moon-circles/page.tsx` to show insight counts
2. ✅ Create `/moon-circles/[id]/page.tsx` for individual events
3. ✅ Add "Share Insight" CTA to Moon Circle cards
4. ✅ Add deep linking from email (`?share=true`)

### Phase 4: Email Integration

1. ✅ Update Moon Circle email template with CTA
2. ✅ Test email deep links
3. ✅ Add source tracking for email submissions

### Phase 5: Testing & Polish

1. ✅ Test insight submission flow
2. ✅ Test pagination
3. ✅ Test anonymous display
4. ✅ Test rate limiting
5. ✅ Add analytics tracking for insight submissions

## Files to Create

```
sql/moon_circle_insights.sql
src/app/api/moon-circles/[id]/insights/route.ts
src/app/api/moon-circles/insights/recent/route.ts
src/components/MoonCircleInsights.tsx
src/components/ShareInsightForm.tsx
src/components/InsightCard.tsx
src/app/moon-circles/[id]/page.tsx
```

## Files to Modify

```
sql/moon_circles.sql (add insight_count column)
src/app/moon-circles/page.tsx (add insight display)
src/lib/moon-circles/email-template.tsx (add CTA)
```

## Testing Checklist

- [ ] Can submit insight for a Moon Circle
- [ ] Insight appears in list (anonymous)
- [ ] Character limit validation works (10-1000 chars)
- [ ] Rate limiting prevents spam (max 3 per event)
- [ ] Pagination works correctly
- [ ] Email deep link opens form with pre-filled Moon Circle
- [ ] Insight count updates automatically
- [ ] Recent insights endpoint returns correct data
- [ ] Empty state displays when no insights
- [ ] Loading states work correctly

## Future Enhancements

- Moderation queue for insights
- Upvote/like insights
- Reply to insights (nested comments)
- Filter insights by theme/tag
- Export insights for Moon Circle reports
- Integration with Substack comments API
