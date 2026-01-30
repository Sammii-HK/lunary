# Testing Guide: Context Optimization System

> **For detailed cost analysis and usage assumptions, see [COST_ANALYSIS.md](./COST_ANALYSIS.md)**

## Quick Start

### 1. Test Context Optimization Analysis

```bash
# Test a simple query
curl "http://localhost:3000/api/test/context-optimization?query=What's the moon phase?"

# Test a complex query
curl "http://localhost:3000/api/test/context-optimization?query=Give me a deep astrological analysis"

# Test a transit-focused query
curl "http://localhost:3000/api/test/context-optimization?query=What transits am I experiencing?"
```

**Expected Results**:

- Simple query: ~91% savings (150 vs 1,750 tokens)
- Complex query: ~23% savings (1,350 vs 1,750 tokens)
- Transit query: ~74% savings (450 vs 1,750 tokens)

### 2. Test Actual Context Building

```bash
# Build optimized context (requires authentication)
curl -H "Cookie: YOUR_AUTH_COOKIE" \
  "http://localhost:3000/api/test/astral-context?query=What's the cosmic weather?&optimize=true"

# Compare with non-optimized
curl -H "Cookie: YOUR_AUTH_COOKIE" \
  "http://localhost:3000/api/test/astral-context?query=What's the cosmic weather?&optimize=false"
```

**Expected Results**:

- Optimized: Only 2-3 modules included
- Non-optimized: All 10 modules included
- Build time: Optimized is faster

### 3. View Comprehensive Demo

```bash
# See analysis of 10 different query types
curl "http://localhost:3000/api/test/optimization-demo"
```

**Expected Results**:

- Average savings: ~60%
- Monthly projection: 2.79M tokens saved
- Query-by-query breakdown

## Test Endpoints

### `/api/test/context-optimization`

**Purpose**: Analyze a query and show estimated token costs

**Parameters**:

- `query` (optional): The user query to analyze (default: "What's the cosmic weather?")

**Response**:

```json
{
  "query": "What's the moon phase?",
  "optimization": {
    "estimatedTokens": 300,
    "fullContextTokens": 1750,
    "tokensSaved": 1250,
    "savingsPercent": "81%"
  },
  "requirements": {
    "basicCosmic": true,
    "personalTransits": false,
    "natalPatterns": false,
    ...
  },
  "componentCosts": {
    "basicCosmic": 150,
    "personalTransits": 0,
    ...
  }
}
```

### `/api/test/astral-context`

**Purpose**: Build actual astral context and show what was included

**Parameters**:

- `query` (optional): The user query
- `optimize` (optional): Set to "false" to disable optimization

**Requires**: Authentication (user must be logged in)

**Response**:

```json
{
  "query": "What's the cosmic weather?",
  "optimization": {
    "enabled": true,
    "buildTimeMs": 234,
    "modulesIncluded": "3/10"
  },
  "contextModules": {
    "basicCosmic": true,
    "personalTransits": false,
    "progressedChart": false,
    ...
  },
  "details": {
    "user": { "sun": "Leo", "moon": "Pisces" },
    "personalTransits": "Not calculated",
    "progressed": "Not calculated"
  }
}
```

### `/api/test/optimization-demo`

**Purpose**: Comprehensive demonstration with 10 query types

**Parameters**: None

**Response**:

```json
{
  "summary": {
    "testQueries": 10,
    "averageSavingsPercent": "60%",
    "totalSavings": "5,850 tokens"
  },
  "monthlyProjection": {
    "queriesPerMonth": 3000,
    "withoutOptimization": { "tokens": "4,650,000" },
    "withOptimization": { "tokens": "1,860,000" },
    "savings": {
      "tokens": "2,790,000",
      "percent": "60%",
      "description": "2.79M tokens saved per month"
    }
  },
  "queryResults": [...]
}
```

## Manual Testing Scenarios

### Scenario 1: Simple Cosmic Weather Query

```bash
Query: "What's the moon phase today?"

Expected Optimization:
✅ Basic cosmic: Included (moon phase, transits summary)
❌ Personal transits: NOT calculated
❌ Natal patterns: NOT analyzed
❌ Progressed chart: NOT calculated
❌ Eclipses: NOT checked

Expected Savings: ~80% (300 vs 1,750 tokens)
```

### Scenario 2: Saturn Return Question

```bash
Query: "Tell me about my Saturn return"

Expected Optimization:
✅ Basic cosmic: Included
✅ Personal transits: Calculated (to show Saturn aspects)
✅ Planetary returns: Calculated (Saturn return proximity)
❌ Progressed chart: NOT calculated
❌ Eclipses: NOT checked

Expected Savings: ~58% (650 vs 1,750 tokens)
```

### Scenario 3: Deep Astrological Analysis

```bash
Query: "Give me a deep astrological analysis of my chart"

Expected Optimization:
✅ Basic cosmic: Included
✅ Personal transits: Calculated
✅ Natal patterns: Analyzed (stelliums, etc.)
✅ Planetary returns: Calculated
✅ Progressed chart: Calculated
✅ Eclipses: Checked

Expected Savings: ~23% (1,200 vs 1,750 tokens)
```

### Scenario 4: Tarot-Only Query

```bash
Query: "Interpret my latest tarot reading"

Expected Optimization:
✅ Basic cosmic: Included (minimal)
✅ Tarot patterns: Analyzed
❌ Personal transits: NOT calculated
❌ Natal patterns: NOT analyzed
❌ All astrological depth: Skipped

Expected Savings: ~71% (450 vs 1,750 tokens)
```

## Optimization Rules

The system analyzes queries using keyword detection:

| Query Contains                        | Modules Activated               |
| ------------------------------------- | ------------------------------- |
| "transit", "aspect", "influence"      | Personal Transits (+300 tokens) |
| "pattern", "stellium", "grand trine"  | Natal Patterns (+200 tokens)    |
| "return", "saturn", "jupiter"         | Planetary Returns (+100 tokens) |
| "progress", "evolved", "changed"      | Progressed Chart (+250 tokens)  |
| "eclipse", "portal", "transformation" | Eclipses (+200 tokens)          |
| "tarot", "card"                       | Tarot Patterns (+150 tokens)    |
| "journal", "entries", "reflection"    | Journal History (+400 tokens)   |

**Always Included**: Basic Cosmic (150 tokens) - current transits, moon phase

## Performance Benchmarks

### Token Costs (Estimated)

| Query Type              | Full Context | Optimized | Savings |
| ----------------------- | ------------ | --------- | ------- |
| Simple (moon phase)     | 1,750        | 300       | 80%     |
| Medium (Saturn return)  | 1,750        | 650       | 58%     |
| Complex (deep analysis) | 1,750        | 1,200     | 23%     |
| Tarot-focused           | 1,750        | 450       | 71%     |
| Transit-focused         | 1,750        | 450       | 71%     |

### Monthly Projections (100 queries/day)

> **Note**: These are input token costs only. For complete cost analysis including output tokens and different usage scenarios, see [COST_ANALYSIS.md](./COST_ANALYSIS.md)

**Without Optimization**: 5.25M input tokens/month (3,000 queries × 1,750 tokens)
**With Optimization**: 1.10M input tokens/month (79% savings, avg 367 tokens/query)
**Tokens Saved**: 4.15M/month

At GPT-4o-mini pricing ($0.00015 per 1K input tokens):

- Without: $0.79/month (input tokens only)
- With: $0.17/month (input tokens only)
- **Input Savings: $0.62/month**

**Total cost including output tokens**: See [COST_ANALYSIS.md](./COST_ANALYSIS.md) for complete calculations with output token costs.

## Troubleshooting

### "Optimization not working"

- Check that `analyzeContextNeeds()` is being called in chat route
- Verify `contextRequirements` parameter is passed to `buildAstralContext()`
- Confirm keywords in query match detection patterns

### "All modules still being calculated"

- If no `contextRequirements` passed, defaults to full context (backward compatible)
- Check that optimization hasn't been explicitly disabled
- Verify the query contains detectable keywords

### "Savings less than expected"

- Complex queries naturally require more modules
- Some queries may trigger multiple module requirements
- Baseline (basic cosmic) is always included (150 tokens)

## Success Criteria

✅ **Test 1**: Simple query saves >70% tokens
✅ **Test 2**: Medium query saves 50-70% tokens
✅ **Test 3**: Complex query saves 20-30% tokens
✅ **Test 4**: Average across all queries saves ~60%
✅ **Test 5**: Build time is faster for optimized queries
✅ **Test 6**: No functionality lost (backward compatible)

## Next Steps

After testing optimization:

1. Monitor real usage patterns
2. Adjust keyword detection if needed
3. Fine-tune token cost estimates
4. Consider adding more granular optimization
5. Implement cost tracking dashboard
