# Mood Detection: AI vs Keyword Analysis

## Cost-Benefit Breakdown

### Keyword Detection (Current Default)

**Benefits**:

- ✅ **Free** - Zero API costs
- ✅ **Fast** - ~10ms per entry
- ✅ **Reliable** - No external dependencies, works offline
- ✅ **Deterministic** - Same input = same output
- ✅ **Privacy** - No data leaves your server
- ✅ **Scalable** - Can process 100+ entries/second

**Limitations**:

- ❌ **Requires explicit emotion words** - "I feel happy" ✅, "Best day ever!" ❌
- ❌ **Misses nuance** - Can't understand complex emotions
- ❌ **No context** - Doesn't understand sarcasm, mixed emotions
- ❌ **Accuracy** - ~70% (misses ~30% of moods)

**Example**:

```
Text: "Today was exhausting but I learned so much. Ready for tomorrow."
Keyword detects: ["tired"] (misses: inspired, hopeful)
```

---

### AI Detection (Claude Haiku)

**Benefits**:

- ✅ **High accuracy** - ~90% mood detection
- ✅ **Understands context** - Detects implicit emotions
- ✅ **Handles complexity** - Mixed emotions, sarcasm, metaphor
- ✅ **Better UX** - More accurate patterns = better insights

**Costs**:

- 💰 **Price**: $0.0001 per entry (~$0.10 per 1,000 entries)
- ⏱️ **Speed**: ~500ms per entry (50x slower than keyword)
- 🌐 **External dependency**: Requires API key and internet
- 🔐 **Privacy consideration**: Text sent to Anthropic

**Example**:

```
Text: "Today was exhausting but I learned so much. Ready for tomorrow."
AI detects: ["tired", "inspired", "hopeful"] ✅
```

---

## Cost Analysis

### Scenario 1: Small Scale (Personal Use)

- **10 entries/month** × 12 months = 120 entries/year
- **AI Cost**: $0.012/year (~1 cent)
- **Recommendation**: ✅ **Use AI** - cost is negligible

### Scenario 2: Medium Scale (Active User)

- **100 entries/month** × 12 months = 1,200 entries/year
- **AI Cost**: $0.12/year (~12 cents)
- **Recommendation**: ✅ **Use AI** - excellent ROI

### Scenario 3: Large Scale (10,000 users)

- **10,000 users** × 50 entries/year = 500,000 entries/year
- **AI Cost**: $50/year
- **Recommendation**: ⚖️ **Hybrid** - use keyword by default, AI for premium users or on-demand

### Scenario 4: Very Active Platform (100,000 users)

- **100,000 users** × 50 entries/year = 5,000,000 entries/year
- **AI Cost**: $500/year
- **Recommendation**: 🔄 **Smart hybrid**:
  - Keyword for initial auto-tagging (free)
  - AI for "enhance my patterns" feature (paid)
  - AI for premium subscription users only

---

## Recommended Strategy

### Phase 1: Auto-Tag on Creation (Keyword)

**When**: User creates journal entry
**Method**: Keyword detection (free, fast)
**Coverage**: ~70% of moods detected

```typescript
// On journal creation:
const moods = await detectMoods(text, (preferAI = false)); // keyword
```

### Phase 2: One-Time Backfill (Keyword)

**When**: Once, for existing entries without tags
**Method**: Keyword detection (free)
**Why**: Get historical data tagged quickly

```bash
# Run once for all users
POST /api/journal/backfill-moods { method: "keyword" }
```

### Phase 3: AI Enhancement (Optional)

**When**: User requests better accuracy
**Method**: AI detection (paid, but cheap)
**Why**: Improve pattern quality for users who care

Options:

1. **Premium feature**: "Enhance my patterns with AI"
2. **On-demand**: User clicks "Re-analyze with AI"
3. **Premium tier**: Auto-use AI for premium subscribers

---

## Periodic Backfills: Are They Needed?

### Why You're Right to Question This

If we auto-tag on creation, periodic backfills are **mostly unnecessary**. They only make sense for:

❌ **NOT needed for**:

- Keeping tags up to date (auto-tag handles this)
- Getting more patterns (auto-tag handles this)
- Regular maintenance (auto-tag handles this)

✅ **ONLY needed for**:

1. **Algorithm improvements** - If we improve mood detection taxonomy
   - Example: Add new moods like "empowered", "anxious-excited"
   - Run once after update to re-tag old entries

2. **Migration to AI** - If user upgrades to premium
   - One-time upgrade: Re-analyze with AI for better accuracy
   - Not periodic, just on plan change

3. **Bug fixes** - If detection had a bug
   - One-time fix after deploying patch

### Conclusion on Periodic Backfills

**Answer**: You don't need periodic backfills!

**Better approach**:

- ✅ Auto-tag on creation (always)
- ✅ One-time backfill for existing entries (migration)
- ✅ On-demand "enhance" feature (user-triggered)
- ❌ Scheduled periodic backfills (waste of resources)

---

## Final Recommendation

### For Your Use Case (Lunary App)

**Immediate (Now)**:

1. ✅ Auto-tag with **keyword** on journal creation (free, fast)
2. ✅ One-time **keyword** backfill for existing entries (free)
3. ✅ Pattern detection threshold at 1 occurrence (catches more patterns)

**Future (Phase 2)**:

1. Add "Enhance Patterns with AI" button in UI
   - Users can click to re-analyze with AI
   - Shows before/after comparison
   - Premium feature or pay-per-use ($0.10 per 1,000 entries)

2. Premium tier auto-uses AI
   - Lunary Pro/Ultimate users get AI auto-tagging
   - Better pattern insights = higher perceived value

**Cost Projection**:

- **Free users**: $0 (keyword only)
- **Premium users** (AI): ~$0.50/year per active user
- **10,000 premium users**: $5,000/year (totally viable)

---

## Implementation Priority

1. **HIGH**: Auto-tag on creation (keyword) ⭐️
2. **HIGH**: One-time backfill endpoint ⭐️
3. **MEDIUM**: AI enhancement feature
4. **LOW**: Periodic backfills (probably skip)

---

## Bottom Line

**Use Keyword for 99% of cases**. It's free, fast, and good enough for pattern detection.

**Use AI for**:

- Premium users (add value to subscription)
- "Enhance my patterns" feature (user-triggered)
- Edge cases where accuracy matters

**Skip periodic backfills** - they're wasteful if you auto-tag on creation.

**ROI is EXCELLENT** for AI even at scale, but keyword detection gives you 70% of the value for 0% of the cost.
