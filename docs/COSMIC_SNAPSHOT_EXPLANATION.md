# Cosmic Snapshot Explanation

## What is Cosmic Snapshot?

The **Cosmic Snapshot** is Lunary's proprietary cached data structure that contains a user's complete cosmic state at a given moment. It's essentially a "snapshot" of all their astrological data bundled together.

## Current Implementation

The Cosmic Snapshot is already implemented as **`LunaryContext`** in `src/lib/ai/context.ts`. It includes:

- **Birth Chart**: Complete planetary positions from user's birth data
- **Current Transits**: Active planetary transits affecting the user
- **Moon Position**: Current moon phase and sign
- **Tarot Data**: Last reading, daily/weekly/personal cards, pattern analysis
- **Mood Logs**: Recent mood tracking data (optional)
- **Crystal Recommendations**: Based on current transits (can be added)

## Purpose & Use Cases

### 1. **AI Chat Context** (Currently Used)

- Provides complete cosmic context for AI responses
- Ensures AI has all user's astrological data in one place
- Used in `/api/ai/chat` endpoint

### 2. **Performance Optimization** (Future)

- Cache snapshot in Redis/DB to avoid recalculating every time
- Update every few hours instead of on-demand
- Faster response times for AI chat and features

### 3. **Notifications** (Can Be Used)

- Pre-generate cosmic pulse content using snapshot
- Batch process notifications for all users
- More efficient than calculating per-user on-demand

### 4. **Analytics & Insights** (Future)

- Track how cosmic state changes over time
- Identify patterns in user's cosmic journey
- Generate personalized reports

## Technical Details

**Current Structure:**

```typescript
type LunaryContext = {
  user: { id; tz; locale; displayName };
  birthChart: BirthChartSnapshot | null;
  currentTransits: TransitRecord[];
  moon: MoonSnapshot | null;
  tarot: { lastReading; daily; weekly; personal; patternAnalysis };
  mood?: MoodHistory;
  history: { lastMessages };
};
```

**Caching Strategy (Not Yet Implemented):**

- Store in database table: `cosmic_snapshots`
- Key: `user_id + date` (e.g., "user123_2025-01-15")
- Update frequency: Every 4-6 hours
- TTL: 24 hours

## Why It Matters

1. **Technical Defensibility**: Proprietary data structure competitors can't replicate
2. **Performance**: Faster feature loading, better UX
3. **Consistency**: Same cosmic state across all features
4. **Scalability**: Batch processing for notifications/emails

## Next Steps

If you want to implement caching:

1. Create `sql/cosmic_snapshots.sql` table
2. Add cron job to update snapshots every 4-6 hours
3. Modify `buildLunaryContext` to check cache first
4. Use cached snapshot for notifications/cosmic pulse

For now, it's working fine as-is - the snapshot is built on-demand when needed for AI chat.
