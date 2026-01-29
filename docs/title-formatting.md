# Title Formatting Guide

## Automatic " | Lunary" Suffix

The grimoire layout (`./src/app/grimoire/layout.tsx`) automatically appends " | Lunary" to all page titles using Next.js's `title.template` pattern.

```typescript
// Layout metadata
export const metadata: Metadata = {
  title: {
    template: '%s | Lunary', // Appends to all child pages
    default: 'Free Grimoire [500+ Spells, Crystals, Tarot & More]',
  },
};
```

## ✅ Correct Usage (Pages)

**DO:** Provide titles WITHOUT " | Lunary" suffix

```typescript
// ✅ Good
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Virgo Horoscope February 2026: Monthly Predictions',
    // Layout will make it: "Virgo Horoscope February 2026: Monthly Predictions | Lunary"
  };
}
```

**DON'T:** Include " | Lunary" or " - Lunary" in page titles

```typescript
// ❌ Bad - will result in "Title | Lunary | Lunary"
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Virgo Horoscope | Lunary', // Don't do this!
  };
}
```

## 🛡️ Safety Utility (Optional)

If you're not sure whether a title already has the suffix, use `formatTitle`:

```typescript
import { formatTitle } from '@/lib/formatTitle';

export async function generateMetadata(): Promise<Metadata> {
  const rawTitle = getSomeTitle(); // Might have " | Lunary" already

  return {
    title: formatTitle(rawTitle), // Removes any existing suffix
  };
}
```

## Examples

### Monthly Horoscope Page

```typescript
// Page: /grimoire/horoscopes/virgo/2026/february
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${signName} Horoscope ${monthName} ${year}: Monthly Predictions`,
    // Result: "Virgo Horoscope February 2026: Monthly Predictions | Lunary"
  };
}
```

### Houses Page

```typescript
// Page: /grimoire/houses/overview/eighth
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${ordinal} House in Astrology: Meaning, Planets & Themes`,
    // Result: "8th House in Astrology: Meaning, Planets & Themes | Lunary"
  };
}
```

### Error Pages

```typescript
// Special case - error pages can override template
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      absolute: 'Not Found | Lunary', // Use 'absolute' to bypass template
    },
  };
}
```

## Migration Checklist

When creating or updating grimoire pages:

- [ ] Remove " | Lunary" from title string
- [ ] Remove " - Lunary" from title string
- [ ] Test in browser - should see " | Lunary" appended
- [ ] Check `<title>` tag in source - should have single " | Lunary"

## Benefits

✅ **Consistency:** All grimoire pages use " | Lunary" (not mix of " | " and " - ")
✅ **DRY:** Define suffix once in layout, not every page
✅ **Maintainability:** Change branding in one place
✅ **Safety:** formatTitle utility prevents duplication

## Current Status

All pages touched in SEO optimization (Jan 29, 2026):

- ✅ Monthly horoscope pages (3,000 pages)
- ✅ Yearly horoscope pages (60 pages)
- ✅ Houses pages (12 pages)
- ✅ Witch types pages
- ✅ Horoscopes hub page

All have been cleaned and will use the layout's automatic suffix.
