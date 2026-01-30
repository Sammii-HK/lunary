# Pattern Analyzer Enhancement: Real Behavioral Pattern Detection

## Overview

Extended the existing `pattern-analyzer.ts` with real astrological pattern detection using journal data. This leverages the proven infrastructure (database queries, mood analysis, confidence scoring) to implement the three placeholder pattern detectors.

## New Pattern Types Added

### 1. Enhanced Lunar Patterns (`moon_sign_pattern`)

**What it detects**: Mood and energy correlations with moon phase AND sign combinations

**How it works**:

- Groups journal entries by moon phase (New, Waxing, Full, Waning) AND moon sign (Aries, Taurus, etc.)
- Analyzes mood tags for each lunar combination
- Identifies patterns like: "You tend to feel anxious during Full Moon in Scorpio"

**Pattern category**: `cyclical` (90-day expiration)

**Example output**:

```json
{
  "type": "moon_sign_pattern",
  "title": "reflective energy during New Moon in Pisces",
  "description": "You tend to feel reflective when the moon is New Moon in Pisces",
  "data": {
    "moonPhase": "New Moon",
    "moonSign": "Pisces",
    "dominantMood": "reflective",
    "moodCount": 4,
    "totalEntries": 5,
    "percentage": 80
  },
  "confidence": 0.72
}
```

### 2. Transit Correlation Patterns (`transit_correlation`)

**What it detects**: Journaling frequency correlations with major planetary transits

**How it works**:

- Calculates planetary positions (Mars, Jupiter, Saturn) for each journal entry date
- Groups entries by transit (e.g., "Mars in Aries", "Saturn in Pisces")
- Identifies when user journals significantly more during specific transits
- Pattern: "You journal 40% more when Mars is in Aries"

**Pattern category**: `cyclical` (90-day expiration)

**Example output**:

```json
{
  "type": "transit_correlation",
  "title": "Active during Mars in Aries",
  "description": "You journal more frequently when Mars is in Aries",
  "data": {
    "planet": "Mars",
    "sign": "Aries",
    "entryCount": 12,
    "topMood": "energized",
    "frequency": 40
  },
  "confidence": 0.75
}
```

### 3. House Activation Patterns (`house_activation`)

**What it detects**: Which astrological houses are emphasized in journal themes

**How it works**:

- Requires user birth chart (for house calculation via Whole Sign system)
- Calculates which houses were activated by transits on each journal date
- Analyzes journal text for house-related keywords:
  - 1st house: self, identity, appearance
  - 4th house: home, family, roots
  - 7th house: relationships, partnerships
  - 10th house: career, reputation, goals
  - etc.
- Identifies patterns like: "You often journal about career matters (10th house themes)"

**Pattern category**: `cyclical` (180-day expiration)

**Example output**:

```json
{
  "type": "house_activation",
  "title": "Partnerships themes emphasized",
  "description": "You often journal about partnerships matters",
  "data": {
    "house": 7,
    "houseName": "Partnerships",
    "count": 8,
    "percentage": 27,
    "keywords": ["relationship", "partner", "marriage"]
  },
  "confidence": 0.8
}
```

## Implementation Details

### Database Integration

- Uses existing `journal_patterns` table with new `pattern_category` field
- Categories with appropriate expiration times:
  - `transient`: 30 days (mood patterns, recurring cards)
  - `cyclical`: 90-180 days (lunar, transit, house patterns)
  - `natal`: permanent (birth chart patterns)
- Preserves natal patterns during cleanup

### Astronomical Data Sources

- **Moon data**: `getAccurateMoonPhase()` - gets phase name and illumination
- **Planetary positions**: `getRealPlanetaryPositions()` - gets all planet signs with smart caching
- **Birth chart**: Queries `user_profiles.birth_chart` for personal house calculations
- All data sources use existing optimized caching (Moon: 15min, Saturn: 7 days, etc.)

### Performance Optimizations

1. **Batch Processing**: Analyzes all entries in one pass
2. **Early Exit**: Skips patterns without sufficient data (min 2-3 entries)
3. **Smart Caching**: Leverages existing astronomical data cache
4. **Confidence Thresholds**: Only saves patterns with confidence > 0.5
5. **Limited Results**: Returns top 10 patterns sorted by confidence

### Data Flow

```
Cron Job (daily) → analyzeJournalPatterns(userId)
  ↓
1. Query journal entries (last 30 days)
  ↓
2. Run ALL pattern detectors:
   - Recurring cards
   - Mood patterns
   - Theme patterns
   - Season correlations
   - Enhanced lunar patterns ← NEW
   - Transit correlations ← NEW
   - House activation patterns ← NEW
  ↓
3. Sort by confidence
  ↓
4. Save top 10 to journal_patterns table
  ↓
5. Patterns flow into astral context via getUserPatterns()
```

## Cron Job Integration

The existing `/api/cron/journal-patterns` route automatically runs the enhanced pattern analysis:

```typescript
for (const userId of userIds) {
  const result = await analyzeJournalPatterns(userId, 30);
  if (result.patterns.length > 0) {
    await savePatterns(userId, result.patterns);
  }
}
```

**No changes needed** - the new pattern detectors are automatically called!

## Testing Recommendations

### Manual Test

1. Run the cron job for a test user: `curl http://localhost:3000/api/cron/journal-patterns -H "Authorization: Bearer $CRON_SECRET"`
2. Check `journal_patterns` table for new pattern types
3. Query astral context and verify patterns appear
4. Ask AI about patterns and verify grimoire interpretations

### Pattern Quality Checks

- **Lunar patterns**: Require at least 2 entries for same moon phase+sign combination
- **Transit patterns**: Require at least 3 entries during same transit, 20% above baseline
- **House patterns**: Require at least 3 keyword matches in same house
- **Confidence scores**: Range 0.5-0.9, higher = more data supporting pattern

### Expected Results (30-day analysis)

- Active journaler: 5-8 patterns detected
- Moderate journaler: 2-4 patterns detected
- Infrequent journaler: 0-2 patterns detected

## Code Changes Summary

### Modified Files

1. **`src/lib/journal/pattern-analyzer.ts`** (~300 new lines)
   - Added 4 new pattern types to JournalPattern interface
   - Imported astronomical data functions
   - Added `findEnhancedLunarPatterns()` function
   - Added `findTransitCorrelations()` function
   - Added `findHouseActivationPatterns()` function
   - Updated `analyzeJournalPatterns()` to call new detectors
   - Enhanced `savePatterns()` with category-based expiration

### Impact on Existing Code

- **No breaking changes** - extends existing pattern types
- **Backwards compatible** - old patterns still work
- **Cron job unchanged** - automatically picks up new patterns
- **Zero database migrations** - uses existing schema (already extended in Phase 2)

## Benefits

1. **Real behavioral insights**: Actual correlations between cosmic events and user journaling
2. **Personalized patterns**: Based on user's unique birth chart and journaling habits
3. **Statistical confidence**: Only surfaces patterns with sufficient supporting data
4. **Grimoire integration**: Detected patterns get rich interpretations from grimoire
5. **Progressive enhancement**: Works even if user doesn't have birth chart (lunar/transit patterns still work)

## Future Enhancements

1. **Statistical significance testing**: Chi-squared tests for pattern validity
2. **Machine learning**: Predict optimal journaling times based on patterns
3. **Cross-pattern analysis**: "You journal about relationships during 7th house transits under Full Moon"
4. **User feedback loop**: Let users confirm/deny patterns to improve detection
5. **Comparative analysis**: "You journal 3x more during Mercury retrograde than average user"

## Example User Experience

**Before**:

- AI: "I don't have specific behavioral data about how transits affect you"

**After**:

- User: "How do transits affect my journaling?"
- AI: "I notice you tend to journal more actively when Mars is in Aries - you've made 12 entries during Mars in Aries transits, with predominantly 'energized' moods. You also show a pattern of reflective journaling during New Moon in Pisces phases. Your 7th house (partnerships) themes appear frequently in your recent reflections."

The AI now provides **evidence-based, personalized insights** rather than generic astrological interpretations.
