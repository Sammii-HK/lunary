# Viral Shareable Features: Implementation Progress

## ✅ Completed (Phase 1 Foundation)

### 1. Unified Share Component System

**Location:** `/src/components/share/`

- **ShareModal.tsx** - Reusable modal wrapper with escape key support, backdrop blur
- **SharePreview.tsx** - Image preview with loading states and smooth transitions
- **ShareFormatSelector.tsx** - Format picker (square/landscape/story/pinterest)
- **ShareActions.tsx** - Button grid for download/share/copy with social platform links
- **ShareCustomization.tsx** - Privacy toggles (show name, show personalized badge)

**Usage Example:**

```tsx
import { ShareModal } from '@/components/share/ShareModal';
import { SharePreview } from '@/components/share/SharePreview';
import { ShareActions } from '@/components/share/ShareActions';

<ShareModal isOpen={isOpen} onClose={handleClose} title='Share Your Chart'>
  <SharePreview imageBlob={imageBlob} loading={loading} format={format} />
  <ShareFormatSelector selected={format} onChange={setFormat} />
  <ShareActions
    onShare={handleShare}
    onDownload={handleDownload}
    onCopyLink={handleCopyLink}
    linkCopied={linkCopied}
    canNativeShare={canNativeShare}
  />
</ShareModal>;
```

### 2. Generic Share Hooks

**Location:** `/src/hooks/`

- **useShareModal.ts** - Modal state management (open/close, format selection, loading, error)
- **useShareable.ts** - Generic share logic for any share type with analytics tracking

**Usage Example:**

```tsx
const { isOpen, format, openModal, closeModal, setFormat } =
  useShareModal('square');

const {
  imageBlob,
  shareRecord,
  loading,
  error,
  generateShare,
  handleShare,
  handleDownload,
  handleCopyLink,
  linkCopied,
} = useShareable({
  shareType: 'weekly-pattern',
  onGenerate: async (format) => {
    // Your custom generation logic
    return { shareId: '...', shareUrl: '...' };
  },
});
```

### 3. OG Template Base Components

**Location:** `/src/components/og/templates/`

- **BaseTemplate.tsx** - Common OG image layout with gradient support
- **BrandFooter.tsx** - Consistent watermark with full moon icon + "lunary.app"
- **CardTemplate.tsx** - Card layouts, grid system, pill badges
- **StatsTemplate.tsx** - Data visualization components (stats, progress bars)

**Key Features:**

- Uses branded moon phase SVG icons from `/public/icons/moon-phases/`
- Consistent Roboto Mono typography
- Element-based gradient backgrounds
- Proper opacity and spacing standards

### 4. Share Types & Utilities

**Location:** `/src/lib/share/`

- **types.ts** - TypeScript types, format dimensions, safe zones for story format
- **og-utils.ts** - Helper functions:
  - `getFormatDimensions(format)` - Returns width/height for any format
  - `getElementGradient(element)` - Returns CSS gradient for Fire/Earth/Air/Water
  - `getMoonPhaseIcon(phase)` - Returns branded SVG icon URL for moon phase
  - `getStoryContentArea()` - Returns safe zones for Instagram Stories
  - `OG_COLORS` - Centralized color constants

### 5. Share Analytics Tracking

**Location:** `/src/lib/analytics/share-tracking.ts`

Extends existing `conversionTracking` with share-specific events:

- `shareInitiated(userId, shareType, metadata)` - User opens share modal
- `shareCompleted(userId, shareType, platform, metadata)` - Share action completed
- `shareViewed(shareId, shareType, referrer, metadata)` - Someone views shared link
- `shareConverted(shareId, shareType, action, metadata)` - Share leads to signup/upgrade
- `formatSelected(userId, shareType, format, metadata)` - Format selection for A/B testing

**Already integrated into useShareable hook** - tracking happens automatically.

---

## 📋 Next Steps (Implementation Order)

### Task 4: Refactor ShareDailyInsight (IN PROGRESS)

**File:** `/src/components/ShareDailyInsight.tsx`

**Steps:**

1. Replace custom modal with `<ShareModal>` component
2. Add `useShareModal()` and `useShareable()` hooks
3. Add format selection (portrait → story, square → Instagram post)
4. Update `generateCard()` to accept format parameter
5. Enhance `/src/app/api/og/daily-insight/route.tsx`:
   - Add `?format=` query parameter support
   - Use `BaseTemplate` and `BrandFooter` from templates
   - Replace PNG moon icons with SVG icons using `getMoonPhaseIcon()`
   - Apply consistent branding (opacity 0.4, Roboto Mono 300/400)
6. Add social share URLs with proper encoding

**Current State:** Existing component works but uses custom modal.

**Expected Outcome:** Modern, reusable component with format options.

---

### Task 5: Refactor ShareBirthChart

**File:** `/src/components/ShareBirthChart.tsx`

**Steps:**

1. Integrate with `ShareModal` (preserve existing KV persistence logic)
2. Add format selection
3. Enhance `/src/app/api/og/share/birth-chart/route.tsx`:
   - Add `?format=` query parameter
   - Implement element-based gradients using `getElementGradient()`
   - Use Astronomicon font for zodiac symbols
   - Add pill badges for element/modality with color coding
4. Keep existing share link persistence (90-day TTL in Cloudflare KV)

**Current State:** Good foundation, needs format support and visual enhancement.

---

### Task 6: Create ShareNumerology Component

**New Feature**

**Files to Create:**

- `/src/components/share/ShareNumerology.tsx`
- `/src/app/api/share/numerology/route.ts` (POST endpoint)
- `/src/app/api/og/share/numerology/route.tsx` (OG image generation)

**OG Image Content:**

- Life Path number (large, prominent)
- Soul Urge number
- Expression number
- Brief 1-line meanings for each
- Date calculated
- Footer: Full moon icon + "Discover your numerology at lunary.app"

**Format Options:** Square (Instagram), Landscape (X/Twitter)

**Data Source:** Use existing numerology calculation logic from the app.

---

### Task 7: Build ShareWeeklyPattern Feature

**New Feature - HIGH VIRAL POTENTIAL**

**Files to Create:**

- `/src/components/share/ShareWeeklyPattern.tsx`
- `/src/app/api/share/weekly-pattern/route.ts`
- `/src/app/api/og/share/weekly-pattern/route.tsx`

**Integration Point:**

- Add to `/src/app/(authenticated)/book-of-shadows/page.tsx` - Patterns tab
- Show button when user has 3+ readings in past 7 days

**Data Source:**

```ts
import { generateTarotSeasonSnapshot } from '@/lib/patterns/snapshot/generator';
const snapshot = generateTarotSeasonSnapshot(userId, 7); // 7-day window
```

**OG Image Content:**

- Title: "My Week in Tarot"
- Top 3 cards (names + small icons)
- Dominant suit badge with element symbol
- Weekly theme (e.g., "Emotional Depth" for Cups)
- Date range (e.g., "Jan 20-26, 2026")
- User's first name (optional, privacy toggle)

**Subscription Boundaries:**

- Free: Share if 3+ readings in 7 days
- Premium: Add card combinations, moon phase correlation

---

### Task 8: Build ShareDailyCosmicState Feature

**New Feature - DAILY SHAREABLE MOMENT**

**Files to Create:**

- `/src/components/share/ShareDailyCosmicState.tsx`
- `/src/app/api/share/cosmic-state/route.ts`
- `/src/app/api/og/share/cosmic-state/route.tsx`
- Extend `/src/lib/cosmic/cosmic-context-utils.ts` with `getDailyCosmicState()`

**Integration Point:**

- Add to `/src/app/(authenticated)/app/page.tsx` - Dashboard daily insights module
- Always available (refreshes daily)

**OG Image Content:**

- Moon phase icon (branded SVG) + name
- Zodiac season (e.g., "Aquarius Season")
- Top transit headline (e.g., "Venus in Pisces → your 5th house")
- 1-line actionable insight
- Date

**Format Optimization:**

- Square (1080x1080) for Instagram posts
- Story (1080x1920) for Instagram/Snapchat stories
- Landscape (1200x630) for X/Twitter

**Subscription Boundaries:**

- Free: Moon phase + zodiac season + general horoscope
- Premium: Personalized transit affecting user's birth chart house + detailed insight

---

### Task 9: Build ShareRetrogradeBadge Feature

**New Feature - SEASONAL VIRAL MOMENT**

**Files to Create:**

- `/src/components/share/ShareRetrogradeBadge.tsx`
- `/src/app/api/share/retrograde-badge/route.ts`
- `/src/app/api/og/share/retrograde-badge/route.tsx`

**Integration Point:**

- Add to `/src/app/(authenticated)/horoscope/page.tsx` during retrograde periods
- Banner: "You're on Day X of Mercury Retrograde" with share button
- Push notification at milestone days (7, 14, completion)

**Data Source:**

- Use existing `/src/lib/pdf/content-generators/retrograde-content.ts`
- Mercury retrograde dates in grimoire data
- Calculate survival days (retrograde start → today)

**OG Image Content:**

- Circular badge with Mercury symbol ☿
- Text: "Mercury Retrograde Survivor"
- Milestone level: "Day 12" or "Completed Unscathed"
- Humor line: "I survived Mercury Retrograde and all I got was this badge"
- Retrograde period dates

**Badge Levels:**

- 🥉 Bronze (Day 3): "You're getting the hang of it"
- 🥈 Silver (Day 10): "Halfway hero"
- 🥇 Gold (Completed): "You made it through!"
- 💎 Diamond (Completed with 0 mishaps): "Unscathed champion"

---

### Task 10: Build ShareZodiacSeason Feature

**New Feature - 12x ANNUAL SHAREABLE MOMENTS**

**Files to Create:**

- `/src/components/share/ShareZodiacSeason.tsx`
- `/src/app/api/share/zodiac-season/route.ts`
- `/src/app/api/og/share/zodiac-season/route.tsx`

**Integration Point:**

- Add to `/src/app/(authenticated)/app/page.tsx` - Dashboard banner during season transitions (±3 days)
- Push notification 1 day before: "Aquarius Season starts tomorrow!"

**Data Source:**

```ts
import { ZODIAC_SEASONS } from '@/lib/journal/pattern-analyzer';
// Calculate which season just started
```

**OG Image Content:**

- Large zodiac symbol (Astronomicon font, 96px)
- Text: "Welcome to [Sign] Season"
- Element badge (e.g., "Fixed Water" for Scorpio)
- Season dates (e.g., "Jan 20 - Feb 18")
- 2-3 season themes (e.g., "Innovation • Community • Vision")
- Personal prompt (premium): "How will Aquarius season affect YOUR chart?"
- Element-based gradient background

**Subscription Boundaries:**

- Free: Season announcement + general themes
- Premium: Personal house activation note

---

### Task 11: Multi-Platform Format Optimization

**Enhance ALL OG routes** to accept `?format=` query parameter.

**Format Sizes:**

```ts
const formatSizes = {
  square: { width: 1080, height: 1080 }, // Instagram posts
  landscape: { width: 1200, height: 630 }, // X/Twitter, Facebook
  story: { width: 1080, height: 1920 }, // Instagram/Snapchat stories
  pinterest: { width: 1000, height: 1500 }, // Pinterest pins
};
```

**Story Format Safe Zones:**

- Top safe zone: 250px (avoid profile pic overlap)
- Bottom safe zone: 300px (avoid interaction buttons)
- Content area: 1080x1370px

**Implementation:**

1. Update all `/src/app/api/og/share/*/route.tsx` files
2. Read `?format=` from `searchParams`
3. Adjust dimensions and layout accordingly
4. Test on real devices (iOS/Android)

---

### Task 13: A/B Testing Framework

**File to Create:** `/src/lib/share/ab-testing.ts`

Use existing `/src/lib/ab-test-tracking.ts` infrastructure:

```tsx
const variant = useFeatureFlagVariant('share-og-design');
const ogImageUrl =
  variant === 'detailed'
    ? `/api/og/${type}/${shareId}?style=detailed`
    : `/api/og/${type}/${shareId}?style=minimal`;
```

**Test Variations:**

1. OG image style: Minimalist vs. Detailed visual design
2. CTA copy: "Explore your chart" vs. "Get your free reading"
3. Branding placement: Bottom center vs. Top right corner
4. Social preview: Image-first vs. Text-first

**Track with:** `shareTracking.formatSelected()` and conversion rates.

---

## 🎨 Design Standards Reference

### Brand Colors

```ts
lunary-primary-600: '#8458D8'  // Nebula Violet
lunary-accent: '#C77DFF'       // Galaxy Haze
lunary-rose: '#EE789E'         // Cosmic Rose
```

### Element Gradients

```ts
Fire: 'linear-gradient(135deg, #DC2626 0%, #EA580C 50%, #EAB308 100%)';
Earth: 'linear-gradient(135deg, #65A30D 0%, #059669 50%, #0D9488 100%)';
Air: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)';
Water: 'linear-gradient(135deg, #0891B2 0%, #0D9488 50%, #1D4ED8 100%)';
```

### Typography

- Font: Roboto Mono 300 (body), 400 (headings)
- Letter-spacing: 0.05-0.1em
- Use Astronomicon font for zodiac/planet symbols

### Branding

- Watermark: Full moon icon + "lunary.app"
- Icon size: 20-24px
- Text size: 16-18px
- Opacity: 0.3-0.4
- Position: Bottom center, 24-40px margin

### Moon Phase Icons

**ALWAYS use branded SVG icons from `/public/icons/moon-phases/`:**

- `new-moon.svg`
- `waxing-cresent-moon.svg`
- `first-quarter.svg`
- `waxing-gibbous-moon.svg`
- `full-moon.svg`
- `waning-gibbous-moon.svg`
- `last-quarter.svg`
- `waning-cresent-moon.svg`

**NEVER use emoji moon phases (🌑 🌒 🌓 🌔 🌕).**

---

## 📊 Success Metrics to Track

### Week 1-2 (Foundation Launch)

- **Target:** 10% of weekly active users share at least once
- **Baseline:** Track current share rate before redesign

### Week 4-6 (New Features Launch)

- **Target:** 25% of weekly active users share at least once
- **Target:** 2+ shares per sharing user per week
- **Target:** 15% click-through rate from shared links

### Week 8+ (Optimization)

- **Target:** Viral coefficient K > 0.3 (each share generates 0.3+ new shares)
- **Target:** 5% conversion rate (shared link → signup)
- **Target:** 50% of shares via Instagram (primary platform)

---

## 🧪 Testing Checklist

For each share feature:

- [ ] Share button appears in correct location
- [ ] Modal opens smoothly without lag
- [ ] Loading state shows skeleton/spinner
- [ ] Image generates successfully (no errors)
- [ ] Preview displays correctly
- [ ] Format selector switches sizes correctly
- [ ] Native share works on iOS/Android
- [ ] Download button saves PNG
- [ ] Copy link copies URL to clipboard
- [ ] Social platform buttons open correct URLs
- [ ] Share link persistence works (KV storage)
- [ ] Shared links load public page correctly
- [ ] OG meta tags render in social previews (test with https://www.opengraph.xyz/)
- [ ] Analytics events fire correctly
- [ ] Subscription boundaries respected
- [ ] Cross-platform testing (Instagram, X, Pinterest)

---

## 🚀 Quick Start Guide

### To Add a New Share Feature:

1. **Create the component:**

```tsx
// /src/components/share/ShareMyFeature.tsx
'use client';

import { useShareModal } from '@/hooks/useShareModal';
import { useShareable } from '@/hooks/useShareable';
import { ShareModal } from './ShareModal';
import { SharePreview } from './SharePreview';
import { ShareActions } from './ShareActions';
import { ShareFormatSelector } from './ShareFormatSelector';

export function ShareMyFeature({ data }: { data: any }) {
  const { isOpen, format, openModal, closeModal, setFormat } =
    useShareModal('square');

  const {
    imageBlob,
    loading,
    error,
    handleShare,
    handleDownload,
    handleCopyLink,
    linkCopied,
  } = useShareable({
    shareType: 'my-feature',
    onGenerate: async (format) => {
      // Call your API endpoint
      const response = await fetch('/api/share/my-feature', {
        method: 'POST',
        body: JSON.stringify({ data, format }),
      });
      const { shareId, shareUrl } = await response.json();

      // Fetch OG image
      const ogResponse = await fetch(
        `/api/og/share/my-feature?shareId=${shareId}&format=${format}`,
      );
      const blob = await ogResponse.blob();
      setImageBlob(blob);

      return { shareId, shareUrl };
    },
  });

  return (
    <>
      <button onClick={openModal}>Share</button>

      <ShareModal isOpen={isOpen} onClose={closeModal} title='Share My Feature'>
        <SharePreview imageBlob={imageBlob} loading={loading} format={format} />
        <ShareFormatSelector selected={format} onChange={setFormat} />
        <ShareActions
          onShare={handleShare}
          onDownload={handleDownload}
          onCopyLink={handleCopyLink}
          linkCopied={linkCopied}
          canNativeShare={
            typeof navigator !== 'undefined' && 'share' in navigator
          }
        />
      </ShareModal>
    </>
  );
}
```

2. **Create the API endpoint:**

```ts
// /src/app/api/share/my-feature/route.ts
import { kvPut } from '@/lib/cloudflare/kv';

export async function POST(request: Request) {
  const { data, format } = await request.json();

  const shareId = crypto.randomUUID().replace(/-/g, '');
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/share/my-feature/${shareId}`;

  await kvPut(shareId, JSON.stringify({ data, format }), 60 * 60 * 24 * 90); // 90 days

  return Response.json({ shareId, shareUrl });
}
```

3. **Create the OG image route:**

```tsx
// /src/app/api/og/share/my-feature/route.tsx
import { ImageResponse } from 'next/og';
import { BaseTemplate } from '@/components/og/templates/BaseTemplate';
import { BrandFooter } from '@/components/og/templates/BrandFooter';
import { getFormatDimensions } from '@/lib/share/og-utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'square';
  const { width, height } = getFormatDimensions(format);

  // Fetch data from KV using shareId...

  return new ImageResponse(
    <BaseTemplate width={width} height={height}>
      {/* Your custom content */}
    </BaseTemplate>,
    { width, height },
  );
}
```

---

## 📝 Notes

- All share features use the same foundation (modal, hooks, templates)
- Analytics tracking is automatic through `useShareable`
- Always use branded moon phase SVGs, never emojis
- Test OG images at https://www.opengraph.xyz/
- Respect subscription boundaries in all share features
- Priority order: Complete tasks 4-6 first (refactor existing), then 7-10 (new features)

---

**Last Updated:** 2026-01-30
**Implementation Branch:** `feat/viral-shares-redesign`
