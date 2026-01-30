# Testing Guide: Phase 2 & 3 Features

Testing for Pattern Recognition, Progressed Charts, and Eclipse Tracking

## Prerequisites

All test endpoints require **authentication**. You need to be logged in to test these features.

### Getting Your Auth Cookie

1. Log in to the app at `http://localhost:3000`
2. Open browser DevTools → Network tab
3. Make any request and copy the `Cookie` header
4. Use it in curl commands like: `curl -H "Cookie: YOUR_COOKIE_HERE" ...`

---

## Quick Start: Test Everything

### Comprehensive Demo (All Phases)

```bash
curl -H "Cookie: YOUR_AUTH_COOKIE" \
  "http://localhost:3000/api/test/cosmic-companion-demo"
```

This endpoint tests **all Phase 1-3 features** in one call:

- ✅ Basic cosmic data (moon phase, transits)
- ✅ Personal transits
- ✅ Natal aspect patterns
- ✅ Planetary returns
- ✅ Progressed chart
- ✅ Eclipse tracking
- ✅ Stored patterns

**Expected Result**: JSON showing all active modules, sample data from each, and status of all phases.

---

## Phase 2: Pattern Recognition

### 1. Natal Pattern Detection

Test stellium detection and planetary returns:

```bash
curl -H "Cookie: YOUR_AUTH_COOKIE" \
  "http://localhost:3000/api/test/natal-patterns"
```

**What This Tests**:

- Stellium detection (3+ planets in same sign)
- Planetary return proximity (Solar, Jupiter, Saturn)
- Pattern storage and retrieval

**Expected Results**:

```json
{
  "natalPatterns": {
    "count": 1,
    "patterns": [
      {
        "type": "stellium",
        "planets": ["Sun", "Mercury", "Venus"],
        "signs": ["Leo"],
        "element": "Fire",
        "description": "Stellium of 3 planets in Leo"
      }
    ]
  },
  "planetaryReturns": {
    "count": 1,
    "activeReturns": [
      {
        "planet": "Jupiter",
        "type": "Jupiter Return",
        "proximity": "+15 days",
        "phase": "approaching"
      }
    ]
  }
}
```

**Interpretation**:

- **Stelliums**: Concentrated energy, major life theme
- **Returns within ±30 days**: Active influence period
- **Return phases**:
  - `approaching`: Building energy
  - `exact`: Peak influence
  - `separating`: Integration phase

### 2. Pattern Storage

Patterns are automatically stored in `journal_patterns` table with:

- **Natal patterns**: Never expire (permanent)
- **Cyclical patterns**: 90-day expiration
- **Transient patterns**: 7-day expiration

Verify storage:

```sql
SELECT pattern_type, pattern_category, confidence, generated_at
FROM journal_patterns
WHERE user_id = 'YOUR_USER_ID'
ORDER BY generated_at DESC;
```

---

## Phase 3: Progressed Charts & Eclipses

### 1. Progressed Chart Calculations

Test secondary progressions:

```bash
curl -H "Cookie: YOUR_AUTH_COOKIE" \
  "http://localhost:3000/api/test/progressed-chart"
```

**What This Tests**:

- Secondary progression formula (1 day after birth = 1 year of life)
- Progressed Sun and Moon positions
- Sign changes from natal positions
- Progressed Moon cycle phase

**Expected Results**:

```json
{
  "progressedChart": {
    "progressedSun": {
      "sign": "Virgo",
      "degree": "12°34'",
      "natalSun": "Leo 28°",
      "change": "Changed from Leo to Virgo"
    },
    "progressedMoon": {
      "sign": "Pisces",
      "degree": "8°15'",
      "cyclePhase": "Third Quarter of Cycle (ages 14-21, 41-48, 68-75, etc.) - Maturity, harvest, sharing",
      "natalMoon": "Aries 15°",
      "change": "Changed from Aries to Pisces"
    }
  },
  "metadata": {
    "yearsSinceBirth": "42.35",
    "calculationTimeMs": 45
  }
}
```

**Interpretation**:

- **Progressed Sun**: Changes sign every ~30 years (major life theme shift)
- **Progressed Moon**: Changes sign every ~2.5 years (evolving emotional needs)
- **Moon Cycle**: Completes every ~27-28 years (spiritual/emotional cycles)

### 2. Eclipse Tracking

Test eclipse detection and natal chart relevance:

```bash
# Default: 6 months ahead
curl -H "Cookie: YOUR_AUTH_COOKIE" \
  "http://localhost:3000/api/test/eclipses"

# Custom timeframe: 12 months ahead
curl -H "Cookie: YOUR_AUTH_COOKIE" \
  "http://localhost:3000/api/test/eclipses?months=12"
```

**What This Tests**:

- Solar and lunar eclipse calculations
- Eclipse-natal planet aspects (±3° orb)
- Eclipse relevance determination
- Upcoming eclipse dates

**Expected Results**:

```json
{
  "search": {
    "months": 6,
    "totalEclipses": 4,
    "relevantEclipses": 1
  },
  "relevantEclipses": [
    {
      "date": "2026-03-20",
      "type": "solar",
      "obscuration": "95%",
      "degree": "29°",
      "zodiacSign": "Pisces",
      "relevance": {
        "isRelevant": true,
        "affectedPlanets": ["Sun", "Mercury"],
        "closestAspect": "Sun (1.2° orb)",
        "interpretation": "This eclipse aspects your natal Sun, Mercury - significant personal impact"
      }
    }
  ]
}
```

**Interpretation**:

- **Solar eclipses**: New beginnings, external events
- **Lunar eclipses**: Emotional culminations, releases
- **Relevant (±3° orb)**: Significant personal impact
- **Timing**: Effects felt ±1 week from exact date

---

## Integration Testing

### Test Astral Context with All Modules

Build full astral context to verify all modules work together:

```bash
curl -H "Cookie: YOUR_AUTH_COOKIE" \
  "http://localhost:3000/api/test/astral-context?query=Give%20me%20a%20complete%20cosmic%20analysis&optimize=false"
```

This builds **full context** (no optimization) and shows:

- Which modules were calculated
- Build time
- Data completeness

**Expected**: All 8+ modules included, build time < 3 seconds

### Test Optimized Context

Compare with optimized context:

```bash
curl -H "Cookie: YOUR_AUTH_COOKIE" \
  "http://localhost:3000/api/test/astral-context?query=What%27s%20the%20moon%20phase&optimize=true"
```

**Expected**: Only 1-2 modules included, build time < 500ms

---

## Performance Benchmarks

### Expected Performance

| Feature                 | Calculation Time | Notes                              |
| ----------------------- | ---------------- | ---------------------------------- |
| Natal Pattern Detection | < 50ms           | In-memory analysis                 |
| Planetary Returns       | < 20ms           | Simple position comparison         |
| Progressed Chart        | < 100ms          | Uses optimized planetary positions |
| Eclipse Tracking (6mo)  | < 200ms          | Astronomy calculations             |
| Full Astral Context     | < 3000ms         | All modules together               |

### Token Usage

| Module            | Token Cost | When Active                               |
| ----------------- | ---------- | ----------------------------------------- |
| Natal Patterns    | 200 tokens | Keywords: natal, pattern, stellium        |
| Planetary Returns | 100 tokens | Keywords: return, saturn, jupiter         |
| Progressed Chart  | 250 tokens | Keywords: progress, evolve, changed       |
| Eclipses          | 200 tokens | Keywords: eclipse, portal, transformation |

See [COST_ANALYSIS.md](./COST_ANALYSIS.md) for complete token cost breakdown.

---

## Verification Checklist

### Phase 2: Pattern Recognition

- [ ] Natal patterns detected correctly (stelliums found)
- [ ] Planetary returns calculate proximity accurately
- [ ] Returns within ±30 days marked as active
- [ ] Patterns stored in database with correct category
- [ ] Expiration logic works (natal = permanent, cyclical = 90d)

### Phase 3: Progressed Charts

- [ ] Progressed Sun calculated using 1 day = 1 year formula
- [ ] Progressed Moon position accurate
- [ ] Moon cycle phase description correct
- [ ] Sign changes from natal detected
- [ ] Uses existing optimized `getRealPlanetaryPositions()`

### Phase 3: Eclipses

- [ ] Solar eclipses detected (next 6-12 months)
- [ ] Lunar eclipses detected (next 6-12 months)
- [ ] Eclipse-natal planet aspects calculated (±3° orb)
- [ ] Relevant eclipses identified correctly
- [ ] Eclipse types and dates accurate

### Integration

- [ ] All modules integrate into `buildAstralContext()`
- [ ] Conditional building works (optimization)
- [ ] No performance regression (< 3s for full context)
- [ ] Context includes all requested modules
- [ ] Context excludes unrequested modules (when optimized)

---

## Troubleshooting

### "No birth chart found"

**Problem**: User profile missing birth chart data

**Solution**:

1. Ensure user has completed onboarding
2. Check `user_profiles.birth_chart` is not null
3. Verify birth chart format matches `BirthChartData[]` type

### "No patterns detected"

**Problem**: No stelliums or major configurations in natal chart

**Solution**: This is normal! Not all charts have stelliums or grand aspects. The system should gracefully return empty arrays.

### "Progressed chart calculation failed"

**Problem**: Birthday missing or invalid

**Solution**:

1. Verify `user_profiles.birthday` exists
2. Check date format (should be valid Date string)
3. Ensure `getRealPlanetaryPositions()` is accessible

### "No relevant eclipses"

**Problem**: No eclipses aspect natal planets within ±3° orb

**Solution**: This is normal! Eclipses may not always aspect personal planets. System correctly returns empty array.

### "Build time too slow"

**Problem**: Full context taking > 3 seconds

**Solution**:

1. Check database query performance
2. Verify planetary position caching is working
3. Consider increasing cache TTLs
4. Profile to find bottleneck (most likely database queries)

---

## Testing Scenarios

### Scenario 1: User with Stellium

**Setup**: User has 3+ planets in same sign

**Expected**:

- `natal-patterns` endpoint shows stellium
- Pattern stored with type `stellium`
- Element and planets listed correctly

### Scenario 2: Approaching Saturn Return

**Setup**: User age ~29, 58, or 87 years

**Expected**:

- `natal-patterns` endpoint shows Saturn return
- Proximity within ±30 days
- Phase is "approaching" or "exact"
- Marked as active return

### Scenario 3: Recent Progressed Moon Sign Change

**Setup**: User's progressed Moon changed sign recently

**Expected**:

- `progressed-chart` shows new sign
- "change" field indicates sign shift
- Cycle phase description accurate

### Scenario 4: Upcoming Eclipse Aspects Natal Sun

**Setup**: Eclipse in next 6 months within ±3° of natal Sun

**Expected**:

- `eclipses` endpoint shows eclipse as relevant
- Affected planets includes "Sun"
- Orb calculated correctly
- Interpretation indicates personal significance

---

## Next Steps

After verifying Phase 2 & 3:

1. ✅ **Confirm all features work** using test endpoints
2. 📊 **Monitor performance** in production
3. 🎯 **Move to Phase 4**: Crystal/Herb/Numerology integration
4. 🔄 **Phase 5**: Migration and backfill historical data

---

## API Reference

### Test Endpoints

| Endpoint                          | Auth Required | Purpose                          |
| --------------------------------- | ------------- | -------------------------------- |
| `/api/test/cosmic-companion-demo` | ✅            | Test all Phase 1-3 features      |
| `/api/test/natal-patterns`        | ✅            | Test pattern detection & returns |
| `/api/test/progressed-chart`      | ✅            | Test secondary progressions      |
| `/api/test/eclipses?months=N`     | ✅            | Test eclipse tracking            |
| `/api/test/astral-context`        | ✅            | Test full context building       |

### Response Formats

All endpoints return JSON with:

- **Main data**: Feature-specific results
- **Metadata**: Calculation times, counts
- **Interpretation**: What the data means
- **Tips**: How to use the information

---

**Last Updated**: 2026-01-30
**Phase Status**: Phases 1-3 Complete ✅
