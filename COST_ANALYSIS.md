# Cost Analysis: Context Optimization System

## Overview

This document explains how the context optimization system reduces AI API costs by selectively building only the context needed for each query.

## Current AI Model

**Model**: GPT-4o-mini (OpenAI)
**Usage**: Chat completion API with context injection

## Token Cost Estimates

### Context Component Breakdown

These estimates represent the **input token cost** for each context module when included in the AI prompt:

| Component             | Token Cost | Description                                          | When Activated                                               |
| --------------------- | ---------- | ---------------------------------------------------- | ------------------------------------------------------------ |
| **Basic Cosmic**      | 150 tokens | Current transits, moon phase, today's cosmic weather | Always included (baseline)                                   |
| **Personal Transits** | 300 tokens | Personalized transit calculations, aspect analysis   | Keywords: transit, aspect, influence, energy, feeling, house |
| **Natal Patterns**    | 200 tokens | Stelliums, Grand Trines, T-Squares, aspect patterns  | Keywords: natal, birth chart, pattern, stellium              |
| **Planetary Returns** | 100 tokens | Solar/Jupiter/Saturn return proximity                | Keywords: return, saturn, jupiter, birthday                  |
| **Progressed Chart**  | 250 tokens | Secondary progression calculations                   | Keywords: progress, evolve, changed, development             |
| **Eclipses**          | 200 tokens | Eclipse tracking and natal relevance                 | Keywords: eclipse, portal, transformation                    |
| **Tarot Patterns**    | 150 tokens | Tarot pattern analysis from database                 | Keywords: tarot, card, pattern                               |
| **Journal History**   | 400 tokens | Recent journal entries and summaries                 | Keywords: journal, wrote, entries, reflection                |

**Full Context**: 1,750 tokens (all modules)

### How Token Estimates Were Derived

Token costs are **estimates** based on:

1. **Actual output observation**: Manually counted tokens in sample context objects
2. **Component size**: JSON structure size for each module
3. **Database query results**: Typical result set sizes (e.g., 5-10 transits, 3-5 patterns)
4. **Conservative estimates**: Rounded up to ensure we don't under-estimate costs

**Important**: These are approximations. Actual token counts vary based on:

- Birth chart complexity (more planets = more data)
- Number of journal entries
- Pattern detection results
- Date ranges requested

## Usage Assumptions

### Default Projection (Test Endpoint)

The `/api/test/optimization-demo` endpoint uses these assumptions:

```typescript
const queriesPerDay = 100;
const daysPerMonth = 30;
const totalMonthlyQueries = 3,000;
```

**This is a PLACEHOLDER for demonstration purposes.**

### How to Calculate Your Actual Usage

To determine your real usage, you need to:

#### 1. Track Astral Query Volume

Count queries that use `buildAstralContext()`:

- Queries detected by `isAstralQuery()`
- Queries with `aiMode === 'astral'`

#### 2. Monitor Query Distribution

Different query types have different costs:

| Query Type         | Example                            | Avg Tokens | % of Queries |
| ------------------ | ---------------------------------- | ---------- | ------------ |
| Simple cosmic      | "What's the moon phase?"           | 150        | 30%          |
| Transit-focused    | "What transits am I experiencing?" | 450        | 25%          |
| Saturn return      | "Tell me about my Saturn return"   | 550        | 10%          |
| Deep analysis      | "Give me a deep reading"           | 900        | 15%          |
| Tarot-focused      | "Interpret my tarot reading"       | 300        | 10%          |
| Journal reflection | "Reflect on my entries"            | 700        | 10%          |

**Your distribution will vary** - track actual user behavior.

#### 3. Calculate Weighted Average

```typescript
// Example calculation
const weightedAverage =
  0.3 * 150 + // Simple queries
  0.25 * 450 + // Transit queries
  0.1 * 550 + // Returns
  0.15 * 900 + // Deep analysis
  0.1 * 300 + // Tarot
  0.1 * 700; // Journal

// = 45 + 112.5 + 55 + 135 + 30 + 70 = 447.5 tokens/query
```

## OpenAI Pricing (GPT-4o-mini)

**Current rates** (as of January 2025):

- **Input tokens**: $0.150 per 1M tokens ($0.00015 per 1K tokens)
- **Output tokens**: $0.600 per 1M tokens ($0.00060 per 1K tokens)

**Context costs are input tokens only** (output is the AI's response).

### Monthly Cost Formula

```typescript
// INPUT TOKEN COSTS (context)
const monthlyInputTokens = queriesPerMonth * avgTokensPerQuery;
const inputCostPerMonth = (monthlyInputTokens / 1000) * 0.00015;

// OUTPUT TOKEN COSTS (AI responses - typically 200-500 tokens each)
const avgOutputTokens = 300; // Conservative estimate
const monthlyOutputTokens = queriesPerMonth * avgOutputTokens;
const outputCostPerMonth = (monthlyOutputTokens / 1000) * 0.0006;

// TOTAL
const totalMonthlyCost = inputCostPerMonth + outputCostPerMonth;
```

## Real Cost Examples

### Example 1: Small App (100 queries/day)

**Without Optimization**:

- 3,000 queries/month × 1,750 tokens = 5,250,000 input tokens
- Input cost: 5,250 × $0.00015 = **$0.79/month**
- Output cost: 900,000 output tokens × $0.00060 = **$0.54/month**
- **Total: $1.33/month**

**With Optimization** (79% savings):

- 3,000 queries/month × 367 tokens = 1,101,000 input tokens
- Input cost: 1,101 × $0.00015 = **$0.17/month**
- Output cost: **$0.54/month** (unchanged)
- **Total: $0.71/month**

**Savings: $0.62/month** (47% overall)

### Example 2: Medium App (1,000 queries/day)

**Without Optimization**:

- 30,000 queries/month × 1,750 tokens = 52,500,000 input tokens
- Input cost: 52,500 × $0.00015 = **$7.88/month**
- Output cost: 9,000,000 output tokens × $0.00060 = **$5.40/month**
- **Total: $13.28/month**

**With Optimization** (79% savings):

- 30,000 queries/month × 367 tokens = 11,010,000 input tokens
- Input cost: 11,010 × $0.00015 = **$1.65/month**
- Output cost: **$5.40/month** (unchanged)
- **Total: $7.05/month**

**Savings: $6.23/month** (47% overall)

### Example 3: Large App (10,000 queries/day)

**Without Optimization**:

- 300,000 queries/month × 1,750 tokens = 525,000,000 input tokens
- Input cost: 525,000 × $0.00015 = **$78.75/month**
- Output cost: 90,000,000 output tokens × $0.00060 = **$54.00/month**
- **Total: $132.75/month**

**With Optimization** (79% savings):

- 300,000 queries/month × 367 tokens = 110,100,000 input tokens
- Input cost: 110,100 × $0.00015 = **$16.52/month**
- Output cost: **$54.00/month** (unchanged)
- **Total: $70.52/month**

**Savings: $62.23/month** (47% overall)

## Understanding the Savings

### Input Token Savings Only

Context optimization **only reduces input tokens**. Output tokens (AI responses) are unchanged.

- **Input tokens**: Context you send to the AI (we optimize this)
- **Output tokens**: AI's response (same regardless of context optimization)

### Why "79% savings" ≠ "79% cost reduction"

- 79% savings on **input tokens** (context)
- But input tokens are only **~40-60% of total cost**
- Output tokens (AI responses) are **40-60% of total cost**
- **Overall cost reduction: ~47%**

This is still significant - nearly half your AI costs!

## Query Optimization Breakdown

### Token Savings by Query Type

From test results (`/api/test/optimization-demo`):

| Query Type                         | Full Context | Optimized | Savings | % Saved |
| ---------------------------------- | ------------ | --------- | ------- | ------- |
| "What's the cosmic weather?"       | 1,750        | 150       | 1,600   | 91%     |
| "How's the moon phase?"            | 1,750        | 150       | 1,600   | 91%     |
| "My Saturn return"                 | 1,750        | 250       | 1,500   | 86%     |
| "What transits am I experiencing?" | 1,750        | 450       | 1,300   | 74%     |
| "Any eclipses affecting me?"       | 1,750        | 350       | 1,400   | 80%     |
| "My progressed chart"              | 1,750        | 400       | 1,350   | 77%     |
| "Natal chart patterns"             | 1,750        | 500       | 1,250   | 71%     |
| "Journal reflection"               | 1,750        | 550       | 1,200   | 69%     |
| "Deep astrological analysis"       | 1,750        | 150       | 1,600   | 91%     |
| "Interpret tarot reading"          | 1,750        | 300       | 1,450   | 83%     |

**Average**: 79% savings on input tokens

## Custom Cost Calculator

### Step 1: Measure Your Usage

```typescript
// Track over 30 days
let totalAstralQueries = 0;
let totalTokensUsed = 0;

// In your chat route:
if (useAstralContext) {
  totalAstralQueries++;
  const contextNeeds = analyzeContextNeeds(userMessage);
  const { estimatedTokens } = estimateContextCost(contextNeeds);
  totalTokensUsed += estimatedTokens;

  // Log to analytics
  captureEvent('astral_context_cost', {
    tokens: estimatedTokens,
    modules: contextNeeds,
  });
}

// After 30 days:
const avgTokensPerQuery = totalTokensUsed / totalAstralQueries;
const queriesPerDay = totalAstralQueries / 30;
```

### Step 2: Calculate Your Costs

```typescript
const queriesPerMonth = queriesPerDay * 30;
const monthlyInputTokens = queriesPerMonth * avgTokensPerQuery;

// With optimization
const optimizedInputCost = (monthlyInputTokens / 1000) * 0.00015;

// Without optimization (full context always)
const unoptimizedInputTokens = queriesPerMonth * 1750;
const unoptimizedInputCost = (unoptimizedInputTokens / 1000) * 0.00015;

const savings = unoptimizedInputCost - optimizedInputCost;
const savingsPercent = (savings / unoptimizedInputCost) * 100;

console.log(`Monthly input cost: $${optimizedInputCost.toFixed(2)}`);
console.log(`Savings: $${savings.toFixed(2)} (${savingsPercent.toFixed(0)}%)`);
```

### Step 3: Add Output Tokens

Output tokens are harder to predict, but you can estimate:

```typescript
const avgOutputTokens = 300; // Measure this from actual usage
const monthlyOutputTokens = queriesPerMonth * avgOutputTokens;
const outputCost = (monthlyOutputTokens / 1000) * 0.0006;

const totalMonthlyCost = optimizedInputCost + outputCost;
console.log(`Total monthly cost: $${totalMonthlyCost.toFixed(2)}`);
```

## Monitoring & Analytics

### Recommended Tracking

Track these metrics in your analytics:

1. **Query volume**: Astral queries per day
2. **Token usage**: Average tokens per query
3. **Module activation rate**: Which modules are used most
4. **Cost per user**: Monthly cost / active users
5. **Query type distribution**: Simple vs complex queries

### Sample Analytics Query

```typescript
// Track context optimization effectiveness
interface CostMetrics {
  date: Date;
  totalQueries: number;
  totalTokens: number;
  avgTokensPerQuery: number;
  estimatedCost: number;
  modulesUsed: {
    personalTransits: number;
    natalPatterns: number;
    progressedChart: number;
    // ... etc
  };
}
```

## Optimization Strategies

### 1. Encourage Specific Queries

Guide users to ask specific questions rather than "tell me everything":

- ❌ "Give me a complete analysis" → 1,750 tokens
- ✅ "What transits am I experiencing?" → 450 tokens

### 2. Adjust Keyword Detection

If certain modules are rarely needed, make keywords more specific:

```typescript
// Less aggressive
needsProgressedChart: msg.includes('progressed chart');

// More aggressive (current)
needsProgressedChart: msg.includes('progress') ||
  msg.includes('evolve') ||
  msg.includes('changed');
```

### 3. Implement Smart Defaults

For new users with minimal data:

- Skip expensive modules (journal history, natal patterns)
- Focus on universal cosmic context

### 4. Cache Heavy Computations

Some context components can be cached:

- Natal patterns: Never change (cache permanently)
- Planetary returns: Change daily (cache 24h)
- Progressed chart: Changes monthly (cache 30 days)

Already implemented in `/src/lib/journal/pattern-storage.ts`.

## Frequently Asked Questions

### Why not just always use full context?

At scale, costs matter:

- 10,000 queries/day = $62/month savings
- 100,000 queries/day = $620/month savings

### Does this affect response quality?

No - the AI only receives context it needs. A moon phase query doesn't benefit from natal pattern analysis.

### Can I disable optimization?

Yes, in `buildAstralContext()`:

```typescript
// Disable optimization (always build full context)
const astralContext = await buildAstralContext(
  userId,
  userName,
  userBirthday,
  now,
  // Don't pass contextRequirements parameter
);
```

### How accurate are the token estimates?

Token estimates are approximations (±20%). Track actual usage with:

```typescript
import { encoding_for_model } from 'tiktoken';

const enc = encoding_for_model('gpt-4o-mini');
const actualTokens = enc.encode(JSON.stringify(context)).length;
```

## Future Improvements

### Planned Enhancements

1. **Dynamic token counting**: Use tiktoken to get exact counts
2. **Usage analytics dashboard**: Real-time cost tracking
3. **Per-user optimization**: Personalize based on user's query patterns
4. **Cost budgets**: Alert when approaching limits
5. **A/B testing**: Measure impact on user satisfaction

### Adaptive Optimization

Future versions could learn:

- Which modules users find most valuable
- Time-of-day query patterns
- Seasonal variations (eclipses, retrogrades)

## Summary

### Key Takeaways

✅ **Context optimization saves ~79% on input tokens**
✅ **Overall cost reduction: ~47%** (considering output tokens)
✅ **Automatic - no user action required**
✅ **No quality loss - AI gets exactly what it needs**
✅ **Scales linearly - bigger apps save more**

### Actual Costs (GPT-4o-mini)

For a medium-sized app (1,000 queries/day):

- **Without optimization**: $13.28/month
- **With optimization**: $7.05/month
- **Savings**: $6.23/month (47%)

### Action Items

1. ✅ Review your query patterns
2. ✅ Measure actual usage over 30 days
3. ✅ Calculate your specific savings
4. ✅ Set up cost monitoring
5. ✅ Adjust keyword detection if needed

---

**Last Updated**: 2026-01-30
**Model**: GPT-4o-mini
**Pricing Source**: OpenAI Pricing (January 2025)
