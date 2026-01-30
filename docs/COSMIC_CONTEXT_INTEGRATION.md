# Cosmic Context Integration Documentation

## Overview

The Cosmic Context Integration provides users with personalized astrological information throughout the app, combining moon phases, planetary aspects, and house placements to create a unified cosmic context experience.

## Features

### 1. Enhanced Moon Phase Display (Horoscope)

**Location:** `/horoscope` - Aspects section
**Component:** `src/app/(authenticated)/horoscope/components/TodaysAspects.tsx`

#### Features:

- **Branded Moon Icons**: Uses SVG icons from `/public/icons/moon-phases/` instead of emojis
- **Moon Phase Keywords**: Displays 3 keywords per phase (e.g., "Completion • Clarity • Manifestation")
- **Full Description**: Shows complete moon phase information from `utils/moon/monthlyPhases.ts`
- **Personalized House Placement**: Calculates and displays which house the transiting Moon is in
- **House-Specific Interpretations**: 12 unique interpretations based on Moon's current house position

#### Example Display:

```
┌─────────────────────────────────────────┐
│  [🌕 Moon Icon]  Full Moon               │
│                  in your 7th house       │
│  Completion • Clarity • Manifestation    │
│                                          │
│  Relationships and partnerships are      │
│  emotionally significant now. This is    │
│  a time to nurture your connections...   │
└─────────────────────────────────────────┘
```

#### House Interpretations:

- **1st House**: Self-expression and personal identity
- **2nd House**: Values, finances, and security
- **3rd House**: Communication, learning, siblings
- **4th House**: Home, family, inner world
- **5th House**: Creativity, romance, joy
- **6th House**: Health, habits, work environment
- **7th House**: Relationships, partnerships
- **8th House**: Transformation, intimacy, shared resources
- **9th House**: Travel, philosophy, education
- **10th House**: Career, reputation, leadership
- **11th House**: Community, friends, social causes
- **12th House**: Rest, solitude, spiritual connection

#### Technical Details:

- Uses Whole Sign House system for calculations
- Requires birth chart with Ascendant for house placement
- Gracefully falls back to generic moon info if birth chart unavailable

---

### 2. Moon Phase on Main Tarot Page

**Location:** `/tarot` - Top of page, below header
**Component:** `src/app/(authenticated)/tarot/components/TarotView.tsx`

#### Features:

- Displays current moon phase with branded icon
- Shows phase name and keywords
- Available to all users (free and paid)
- Consistent styling with horoscope moon display

#### Example Display:

```
┌─────────────────────────────────────────┐
│  [🌕 Icon]  Full Moon                    │
│             Completion • Clarity         │
└─────────────────────────────────────────┘
```

---

### 3. CosmicContextCard Component

**Location:** Used in tarot pattern drill-downs
**Component:** `src/components/patterns/CosmicContextCard.tsx`

#### Features:

- **Reusable Component**: Can be used anywhere cosmic context is needed
- **Date Display**: Shows when the card was pulled
- **Moon Phase**: Branded icon with phase name
- **Card Meaning** (optional): Shows card keywords and description
- **Active Aspects**: Displays planetary aspects as styled badges

#### Props:

```typescript
interface CosmicContextCardProps {
  date: string;
  moonPhase?: {
    emoji: string;
    name: string;
  };
  aspects?: Array<{
    planet1: string;
    planet2: string;
    aspectSymbol: string;
  }>;
  cardName?: string;
  showCardMeaning?: boolean;
}
```

#### Example Display:

```
┌─────────────────────────────────────────┐
│  When pulled                            │
│  Jan 29, 2026        [🌕] Full Moon     │
├─────────────────────────────────────────┤
│  Card Meaning                           │
│  [Love] [Connection] [Choice]           │
│  The Lovers represents harmony...       │
├─────────────────────────────────────────┤
│  Active aspects                         │
│  [Mars ☌ Sun] [Venus △ Jupiter]         │
└─────────────────────────────────────────┘
```

---

### 4. Frequent Cards Dropdown with Full Context

**Location:** `/tarot` - Patterns section
**Components:**

- `src/components/patterns/FrequentCardsSection.tsx`
- `src/lib/patterns/pattern-adapter.ts`

#### The Problem (Fixed):

Previously, the `appearances` array was empty (`appearances: []`), resulting in empty dropdowns when users clicked on frequent cards.

#### The Solution:

- Made `pattern-adapter.ts` async to fetch real reading data
- Fetches from `/api/patterns/user-readings` endpoint
- Groups readings by card name to populate appearances
- Each appearance includes date, moon phase, and aspects

#### Features:

- **First Appearance**: Shows full details with card meaning + cosmic context
- **AI-Generated Insights**: Integrates TarotTransitConnection (when birth chart available)
- **Remaining Appearances**: Shows date, moon phase, and aspects
- **Frequency Timeline**: Visual graph showing card appearances over time

#### Data Flow:

```
TarotView
  → AdvancedPatterns
    → TarotPatternsHub
      → FrequentCardsSection
        → CosmicContextCard
        → TarotTransitConnection (optional)
```

#### Content Structure:

```
When you expand "The Empress":
1. Date & Moon Phase (Jan 29, 2026 🌕 Full Moon)
2. Card Meaning (Keywords + Description)
3. Active Aspects (Mars ☌ Sun, Venus △ Jupiter)
4. AI Transit Insights (if birth chart available)
5. Other Appearances (2-10 more dates)
6. Frequency Timeline Graph
```

---

## API Endpoints

### GET /api/patterns/user-readings

Fetches user's tarot readings with cosmic context.

#### Query Parameters:

- `days` (optional): Number of days to fetch (default: 30)

#### Response:

```json
{
  "success": true,
  "readings": [
    {
      "name": "The Lovers",
      "keywords": ["Love", "Connection", "Choice"],
      "information": "The Lovers represents...",
      "createdAt": "2026-01-29T12:00:00Z",
      "moonPhase": {
        "phase": "fullMoon",
        "emoji": "🌕",
        "name": "Full Moon"
      },
      "aspects": [
        {
          "planet1": "Mars",
          "planet2": "Sun",
          "aspectType": "conjunct",
          "aspectSymbol": "☌"
        }
      ]
    }
  ],
  "count": 15,
  "timeFrameDays": 30
}
```

---

## Components Reference

### Enhanced Components

#### `src/lib/cosmic/cosmic-context-utils.ts`

**Purpose**: Shared utilities for cosmic context
**Key Functions**:

- `getCosmicContextForDate(date)` - Returns moon phase with keywords, info, and icon
- `formatAspect(aspect)` - Formats aspects for display
- `getMoonPhaseEmoji(moonPhaseLabel)` - Returns emoji for phase

**Interface**:

```typescript
export interface CosmicContextData {
  moonPhase: {
    phase: string;
    emoji: string;
    name: string;
    keywords: string[];
    information: string;
    icon: { src: string; alt: string };
  };
  aspects?: Array<{
    planet1: string;
    planet2: string;
    aspectType: string;
    aspectSymbol: string;
  }>;
}
```

#### `src/components/patterns/CosmicContextCard.tsx` (NEW)

**Purpose**: Reusable component for displaying cosmic context
**Usage**:

```tsx
<CosmicContextCard
  date='2026-01-29T12:00:00Z'
  moonPhase={{ emoji: '🌕', name: 'Full Moon' }}
  aspects={[{ planet1: 'Mars', planet2: 'Sun', aspectSymbol: '☌' }]}
  cardName='The Lovers'
  showCardMeaning={true}
/>
```

#### `src/lib/patterns/pattern-adapter.ts`

**Purpose**: Transform basic patterns to include real appearance data
**Key Change**: Made async to fetch readings from API
**Function**: `transformBasicPatternsToAnalysis(basicPatterns)` → Returns `Promise<PatternAnalysis>`

---

## Feature Access & Entitlements

### Moon Phase Display

| Feature                          | Free | Lunary+ | Pro Monthly | Pro Annual |
| -------------------------------- | ---- | ------- | ----------- | ---------- |
| **Moon phase in horoscope**      | ✓    | ✓       | ✓           | ✓          |
| **Personalized house placement** | ✓\*  | ✓\*     | ✓\*         | ✓\*        |
| **Moon on tarot page**           | ✓    | ✓       | ✓           | ✓          |

\*Requires birth chart with birth time

### Tarot Pattern Drill-Down

| Feature                           | Free | Lunary+ | Pro Monthly | Pro Annual |
| --------------------------------- | ---- | ------- | ----------- | ---------- |
| **View frequent cards**           | ✓    | ✓       | ✓           | ✓          |
| **Expand card details**           | ✗    | ✗       | ✓           | ✓          |
| **Cosmic context per appearance** | ✗    | ✗       | ✓           | ✓          |
| **AI transit insights**           | ✗    | ✗       | ✓           | ✓          |
| **Frequency timeline**            | ✗    | ✗       | ✓           | ✓          |

---

## Technical Implementation

### Type Definitions

#### `src/lib/patterns/tarot-pattern-types.ts`

```typescript
export interface CardAppearance {
  date: string;
  readingId?: string;
  moonPhase?: {
    phase: string;
    emoji: string;
    name: string;
  };
  aspects?: Array<{
    planet1: string;
    planet2: string;
    aspectType: string;
    aspectSymbol: string;
  }>;
}

export interface FrequentCard {
  name: string;
  count: number;
  percentage: number;
  suit?: string;
  emoji?: string;
  appearances: CardAppearance[];
}
```

### Async Data Flow

#### Before (Empty):

```typescript
const frequentCards = basicPatterns.frequentCards.map((card) => ({
  ...card,
  appearances: [], // Empty!
}));
```

#### After (Populated):

```typescript
const response = await fetch(`/api/patterns/user-readings?days=${timeFrame}`);
const readingsData = await response.json();

const frequentCards = basicPatterns.frequentCards.map((card) => {
  const appearances = readingsData.readings
    .filter((reading) => reading.name === card.name)
    .map((reading) => ({
      date: reading.createdAt,
      moonPhase: reading.moonPhase,
      aspects: reading.aspects,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return { ...card, appearances };
});
```

---

## Performance Considerations

### Optimization Strategies

1. **Next.js Image Component**: All moon icons use `next/image` for optimization
2. **API Caching**: User readings cached in pattern-adapter transformation
3. **Limited Appearances**: Display max 10 appearances to prevent performance issues
4. **Lazy Loading**: TarotTransitConnection only shown for first (most recent) appearance
5. **SessionStorage**: Pattern analysis cached to avoid redundant API calls

### Load Times

- Moon phase calculation: < 10ms
- Aspect calculation: < 50ms
- Pattern transformation with API fetch: < 1s
- TarotTransitConnection (AI): 2-5s (loading state shown)

---

## Testing

### Manual Testing Checklist

#### Horoscope Moon Phase

- [ ] Moon phase displays with correct icon
- [ ] Keywords show correctly (3 per phase)
- [ ] House placement shows (if birth chart available)
- [ ] House interpretation is specific to that house
- [ ] Falls back gracefully without birth chart

#### Tarot Page Moon

- [ ] Moon phase appears at top of page
- [ ] Shows current phase with keywords
- [ ] Responsive on mobile

#### Frequent Cards Drill-Down

- [ ] Cards list displays (all users)
- [ ] Expand button shows for Pro users
- [ ] Drill-down locked for free/Lunary+ users
- [ ] First appearance shows card meaning + cosmic context
- [ ] Moon phase icon displays correctly
- [ ] Aspects show as badges
- [ ] TarotTransitConnection loads (with birth chart)
- [ ] Timeline graph renders
- [ ] "Show more" indicates additional appearances

### Edge Cases

- [ ] No birth chart: Moon shows without house placement
- [ ] No appearances: Shows "No data" message
- [ ] No aspects that day: Hides aspects section
- [ ] Slow API: Loading state displays
- [ ] API error: Graceful fallback

---

## Troubleshooting

### Common Issues

#### "Appearances array is empty"

**Cause**: `pattern-adapter.ts` not fetching data
**Solution**: Check that API endpoint is accessible and returning data

#### "Moon phase not showing"

**Cause**: Missing moon phase data in reading
**Solution**: Verify `/api/patterns/user-readings` returns `moonPhase` field

#### "House placement missing"

**Cause**: No birth chart or no Ascendant
**Solution**: User needs to enter birth chart with birth time in settings

#### "TarotTransitConnection not loading"

**Cause**: Missing birth chart data
**Solution**: Check that `birthChart`, `userBirthday`, and `currentTransits` props are passed through component hierarchy

---

## Future Enhancements

### Potential Additions

1. **Historical Transit Analysis**: Show how transits evolved over multiple appearances
2. **Pattern Correlation**: Identify which moon phases/aspects correlate with specific cards
3. **Predictive Insights**: Suggest optimal times to pull specific cards based on cosmic conditions
4. **Moon Phase Filtering**: Filter frequent cards by moon phase
5. **Aspect Filtering**: Filter cards by specific planetary aspects
6. **Export Cosmic Context**: Allow users to export appearance data with cosmic context

---

## Changelog

### Version 1.0.0 (2026-01-30)

- ✅ Enhanced moon phase display with branded icons
- ✅ Added personalized house placement to horoscope
- ✅ Added moon phase to main tarot page
- ✅ Created CosmicContextCard component
- ✅ Populated frequent cards appearances with real data
- ✅ Integrated TarotTransitConnection for AI insights
- ✅ All TypeScript types properly defined
- ✅ ESLint and Prettier compliant

---

## Related Documentation

- [Tarot Patterns Guide](./TAROT_PATTERNS.md)
- [API Documentation](./API.md)
- [Entitlements & Access Control](./ENTITLEMENTS.md)
