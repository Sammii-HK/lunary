# Share Features A/B Testing Guide

This guide shows how to integrate A/B testing with the viral shareable features using Lunary's existing PostHog-based A/B testing infrastructure.

## Overview

Share features can be A/B tested for:

- **OG image variations** (detailed vs. minimal design)
- **CTA copy** (different button text)
- **Branding placement** (bottom center vs. top right)
- **Social preview styles** (image-first vs. text-first)

## Setup

### 1. Add Share Tests to PostHog Mapping

Update `/src/lib/ab-test-tracking.ts`:

```typescript
const POSTHOG_TEST_MAPPING: Record<string, string> = {
  // ... existing tests ...

  // Share feature tests
  'share-og-design': 'share_og_design', // OG image style (minimal vs detailed)
  'share-cta-copy': 'share_cta_copy', // Share button text
  'share-branding-position': 'share_branding', // Footer placement
  'share-preview-style': 'share_preview', // Preview modal style
};
```

### 2. Extend A/B Test Hooks

Update `/src/hooks/useABTestTracking.ts` to include share tests:

```typescript
export function useABTestTracking(/* ... */) {
  // Add these lines with existing test variants:
  const shareOgDesign = useFeatureFlagVariant('share-og-design');
  const shareCta = useFeatureFlagVariant('share-cta-copy');
  const shareBranding = useFeatureFlagVariant('share-branding-position');
  const sharePreview = useFeatureFlagVariant('share-preview-style');

  const abMetadata = useMemo(
    () => {
      const allTests = [
        // ... existing tests ...
        { test: 'share-og-design', variant: shareOgDesign },
        { test: 'share-cta-copy', variant: shareCta },
        { test: 'share-branding-position', variant: shareBranding },
        { test: 'share-preview-style', variant: sharePreview },
      ];
      // ... rest of logic
    },
    [
      /* ... add new dependencies */
    ],
  );
}
```

### 3. Extend Variant Hook

Add share variants to `useABTestVariants()`:

```typescript
export function useABTestVariants() {
  // ... existing variants ...
  const shareOgDesign = useFeatureFlagVariant('share-og-design');
  const shareCta = useFeatureFlagVariant('share-cta-copy');
  const shareBranding = useFeatureFlagVariant('share-branding-position');
  const sharePreview = useFeatureFlagVariant('share-preview-style');

  return {
    // ... existing returns ...
    shareOgDesign,
    shareCta,
    shareBranding,
    sharePreview,
  };
}
```

## Usage Examples

### Example 1: A/B Test Share Button Copy

```typescript
// In any share component (e.g., ShareWeeklyPattern.tsx)
import { useABTestVariants, useABTestConversion } from '@/hooks/useABTestTracking';

export function ShareWeeklyPattern() {
  const { shareCta } = useABTestVariants();
  const { trackConversion } = useABTestConversion();

  const handleOpen = async () => {
    openModal();

    // Track with A/B test metadata
    trackConversion('share_initiated', {
      featureName: 'weekly-pattern',
      metadata: {
        share_type: 'weekly-pattern',
        cta_variant: shareCta,
      },
    });

    if (!imageBlob) {
      await generateCard();
    }
  };

  // Use variant for button text
  const buttonText = shareCta === 'mystical'
    ? "Share Your Cosmic Pattern ✨"
    : "Share This Week's Pattern";

  return (
    <button onClick={handleOpen}>
      {buttonText}
    </button>
  );
}
```

### Example 2: A/B Test OG Image Style

```typescript
// In OG route (e.g., /api/og/share/weekly-pattern/route.tsx)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get('shareId');
  const style = searchParams.get('style') || 'default'; // 'minimal' or 'detailed'

  // Apply different styles based on variant
  const isMinimal = style === 'minimal';

  const padding = isMinimal ? 60 : 40;
  const borderWidth = isMinimal ? 1 : 2;
  const showGradient = !isMinimal;

  return new ImageResponse(
    <div style={{
      padding: `${padding}px`,
      border: `${borderWidth}px solid ${OG_COLORS.border}`,
      background: showGradient ? gradientBg : OG_COLORS.background,
    }}>
      {/* ... */}
    </div>,
    { width, height }
  );
}
```

Then in the component:

```typescript
const { shareOgDesign } = useABTestVariants();

const ogImageUrl = `/api/og/share/weekly-pattern?shareId=${shareId}&format=${format}&style=${shareOgDesign}`;
```

### Example 3: A/B Test Branding Position

```typescript
// In OG route footer section
const { shareBranding } = useABTestVariants();

const brandingPosition = shareBranding === 'top_right'
  ? { position: 'absolute', top: 32, right: 32 }
  : { position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)' };

return (
  <div style={brandingPosition}>
    <img src={moonIcon} />
    <span>lunary.app</span>
  </div>
);
```

### Example 4: Track Share Completion with A/B Metadata

```typescript
// In share component
const { trackConversion } = useABTestConversion();

const handleShare = async () => {
  if (!imageBlob) return;

  // Native share
  await navigator.share({ files: [file] });

  // Track completion with A/B test metadata automatically included
  trackConversion('share_completed', {
    featureName: 'weekly-pattern',
    metadata: {
      share_type: 'weekly-pattern',
      platform: 'native',
      format: format,
    },
  });
};
```

## PostHog Experiment Setup

### 1. Create Experiments in PostHog

**share-og-design:**

- Variant A (control): `default` - Current detailed design
- Variant B (test): `minimal` - Cleaner, more minimal design

**share-cta-copy:**

- Variant A (control): `standard` - "Share This Week's Pattern"
- Variant B (test): `mystical` - "Share Your Cosmic Pattern ✨"

**share-branding-position:**

- Variant A (control): `bottom_center` - Footer at bottom center
- Variant B (test): `top_right` - Branding in top right corner

**share-preview-style:**

- Variant A (control): `default` - Current modal style
- Variant B (test): `compact` - More compact preview

### 2. Track Success Metrics

Key events to monitor:

- `share_initiated` - User opens share modal
- `share_completed` - User completes share action
- `share_viewed` - Someone views shared link
- `signup` - User signs up after viewing share

Conversion funnel:

```
share_initiated → share_completed → share_viewed → signup
```

### 3. Analyze Results

In PostHog, compare variants:

- **Completion rate**: `share_completed / share_initiated`
- **Viral coefficient**: `share_viewed / share_completed`
- **Conversion rate**: `signup / share_viewed`
- **Overall impact**: `signup / share_initiated`

## Implementation Checklist

- [ ] Add share tests to `POSTHOG_TEST_MAPPING`
- [ ] Update `useABTestTracking` to include share test variants
- [ ] Update `useABTestConversion` to include share tests
- [ ] Add share variants to `useABTestVariants`
- [ ] Create PostHog experiments with proper variants
- [ ] Implement conditional rendering in share components
- [ ] Add `style` parameter support to OG routes
- [ ] Update share tracking to use `trackConversion` instead of direct `trackEvent`
- [ ] Test all variants locally with PostHog feature flag overrides
- [ ] Monitor experiment results in PostHog dashboard

## Testing Locally

Override feature flags in PostHog:

1. Open PostHog browser console
2. Run: `posthog.featureFlags.override({'share-og-design': 'minimal'})`
3. Refresh page and test share feature
4. Reset: `posthog.featureFlags.override({})`

## Notes

- A/B tests automatically track with existing `shareTracking` methods when using `trackConversion`
- Only use `trackConversion` for user actions (clicks, completions)
- Use `useABTestTracking` for page views
- Each share feature can have its own set of A/B tests
- Results are visible in PostHog dashboard under "Experiments"
