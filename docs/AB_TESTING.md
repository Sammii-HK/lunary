# A/B Testing Guide

Simple, free A/B testing using localStorage (no external service needed).

## How It Works

1. **Variant Assignment**: Users are randomly assigned to variant A or B on first visit
2. **Persistence**: Variant is stored in localStorage and persists across sessions
3. **Tracking**: Conversions are tracked with variant metadata via analytics

## Usage Examples

### Pricing Page CTA Text

```typescript
import { getABTestVariant, AB_TESTS } from '@/lib/ab-testing';

const variant = getABTestVariant(AB_TESTS.PRICING_CTA);
const ctaText =
  variant === 'A' ? 'Start your free trial' : 'Unlock your cosmic blueprint';
```

### Pricing Display

```typescript
const priceVariant = getABTestVariant(AB_TESTS.PRICING_PRICE);
const displayPrice = priceVariant === 'A' ? '$4.99' : '$5.99';
```

### Button Text

```typescript
const buttonVariant = getABTestVariant(AB_TESTS.UPGRADE_PROMPT);
const buttonText =
  buttonVariant === 'A' ? 'Start Free Trial' : 'Begin Your Journey';
```

## Tracking Conversions

```typescript
import { trackABTestConversion, AB_TESTS } from '@/lib/ab-testing';

// When user converts
const variant = getABTestVariant(AB_TESTS.PRICING_CTA);
await trackABTestConversion(AB_TESTS.PRICING_CTA, variant, 'trial_started', {
  planType: 'monthly',
});
```

## Analyzing Results

Check your analytics dashboard (`/admin/analytics`) and filter by `abTest` and `abVariant` in metadata to compare conversion rates.

## Best Practices

1. **Test one thing at a time** - Don't test multiple elements simultaneously
2. **Run for at least 2 weeks** - Need sufficient sample size
3. **Track meaningful metrics** - Focus on conversions, not just clicks
4. **Document your tests** - Keep track of what you're testing and why

## Free Alternatives

- **localStorage-based** (current implementation) - Free, simple, works great
- **Vercel Analytics** - Free tier, built-in A/B testing support
- **PostHog** - Free tier up to 1M events/month
- **Google Optimize** - Free but being sunset (not recommended)
