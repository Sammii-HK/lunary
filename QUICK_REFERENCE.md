# Tarot Patterns Redesign - Quick Reference

## 🚀 Quick Start

### 1. Import Components

```tsx
import { TarotPatternsHub } from '@/components/patterns/TarotPatternsHub';
import {
  transformBasicPatternsToAnalysis,
  mapSubscriptionPlanToUserTier,
} from '@/lib/patterns/pattern-adapter';
```

### 2. Use in Your Component

```tsx
const patternAnalysis = transformBasicPatternsToAnalysis(basicPatterns);
const userTier = mapSubscriptionPlanToUserTier(subscription.plan);

<TarotPatternsHub
  patterns={patternAnalysis}
  userTier={userTier}
  subscriptionStatus={subscription.status}
  onUpgradeClick={() => router.push('/pricing')}
/>;
```

---

## 📦 Key Components

| Component               | Purpose               | Location                                                           |
| ----------------------- | --------------------- | ------------------------------------------------------------------ |
| `TarotPatternsHub`      | Main orchestrator     | `src/components/patterns/TarotPatternsHub.tsx`                     |
| `PatternCard`           | Reusable card wrapper | `src/components/patterns/PatternCard.tsx`                          |
| `FrequentCardsSection`  | Interactive cards     | `src/components/patterns/FrequentCardsSection.tsx`                 |
| `SuitDistributionChart` | Radial suit chart     | `src/components/patterns/visualizations/SuitDistributionChart.tsx` |
| `ArcanaBalanceRadial`   | Major/Minor balance   | `src/components/patterns/visualizations/ArcanaBalanceRadial.tsx`   |
| `CardFrequencyTimeline` | Timeline sparkline    | `src/components/patterns/visualizations/CardFrequencyTimeline.tsx` |

---

## 🔐 Feature Access

```tsx
import { hasFeatureAccess } from '@/utils/pricing';

const hasAdvanced = hasFeatureAccess(status, plan, 'tarot_patterns_advanced');
const hasDrillDown = hasFeatureAccess(status, plan, 'pattern_drill_down');
```

**Feature Keys:**

- `tarot_patterns_basic` - Lunary+
- `tarot_patterns_advanced` - Pro Monthly+
- `pattern_drill_down` - Pro Monthly+
- `pattern_export` - Pro Annual
- `pattern_comparison` - Pro Annual
- `predictive_insights` - Pro Annual

---

## 🎨 Brand Colors

```tsx
import {
  getSuitColorClasses,
  getSuitColorHSL,
} from '@/lib/patterns/utils/suit-colors';

// Get Tailwind classes
const classes = getSuitColorClasses('Cups');

// Get HSL for charts
const color = getSuitColorHSL('Wands');
```

**Color Mapping:**

- Cups → Secondary (Blue)
- Wands → Highlight (Pink)
- Swords → Accent (Purple)
- Pentacles → Success (Green)
- Major Arcana → Primary (Violet)

---

## 📱 Responsive Breakpoints

- **Mobile:** `< 768px` - Single column
- **Tablet:** `768-1024px` - 2 columns
- **Desktop:** `> 1024px` - 3 columns

---

## 📚 Documentation

1. **PATTERN_REDESIGN_PHASE_1_COMPLETE.md** - Full implementation details
2. **PATTERN_COMPONENTS_GUIDE.md** - Component API reference
3. **IMPLEMENTATION_SUMMARY.md** - Overview and next steps
4. **EXAMPLE_USAGE.tsx** - Integration examples

---

## ✅ What's Done

- [x] Shared utilities (colors, formatters, types)
- [x] Visualization components (charts, timelines)
- [x] Core components (cards, hub)
- [x] Enhanced RecurringThemesCard
- [x] Entitlements configuration
- [x] TypeScript support
- [x] Build passing
- [x] Documentation complete

---

## 🔜 Next Steps

1. Test with real data
2. Add feature flag to AdvancedPatterns.tsx
3. Deploy to staging
4. Gather user feedback

---

## 🆘 Need Help?

- Integration examples: `src/components/patterns/EXAMPLE_USAGE.tsx`
- Component API: `PATTERN_COMPONENTS_GUIDE.md`
- Full details: `PATTERN_REDESIGN_PHASE_1_COMPLETE.md`

---

**Status:** ✅ READY FOR INTEGRATION

**Build:** ✅ PASSING (0 errors)

**Date:** January 30, 2026
