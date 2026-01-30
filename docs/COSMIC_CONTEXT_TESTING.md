# Cosmic Context Integration - Testing Plan

## Overview

This document outlines the testing strategy for the cosmic context integration features implemented in January 2026.

---

## Features Under Test

### 1. Enhanced Moon Phase Display (Horoscope)

- **Location**: `/horoscope` page - Aspects section
- **Component**: `TodaysAspects.tsx`
- **Feature Keys**: `moon_phases` (free)

### 2. Moon Phase Display (Tarot)

- **Location**: `/tarot` page - Top section
- **Component**: `TarotView.tsx`
- **Feature Keys**: `moon_phases` (free)

### 3. Cosmic Context Card Component

- **Location**: Reusable component
- **Component**: `CosmicContextCard.tsx`
- **Usage**: Tarot pattern drill-downs

### 4. Frequent Cards Drill-Down

- **Location**: `/tarot` - Patterns section
- **Component**: `FrequentCardsSection.tsx`
- **Feature Keys**: `advanced_patterns` (Pro Monthly/Annual)

### 5. Cosmic Context Utilities

- **Location**: Shared utilities
- **File**: `cosmic-context-utils.ts`
- **Usage**: All components

---

## Test Categories

### A. Unit Tests

#### Cosmic Context Utilities

```typescript
// Test: getCosmicContextForDate()
describe('getCosmicContextForDate', () => {
  it('should return correct moon phase for given date', () => {
    const date = new Date('2026-01-29');
    const context = getCosmicContextForDate(date);
    expect(context.moonPhase.name).toBeDefined();
    expect(context.moonPhase.emoji).toBeDefined();
    expect(context.moonPhase.keywords).toHaveLength(3);
  });

  it('should return correct icon path', () => {
    const context = getCosmicContextForDate(new Date());
    expect(context.moonPhase.icon.src).toContain('/icons/moon-phases/');
    expect(context.moonPhase.icon.src).toMatch(/\.svg$/);
  });
});
```

#### House Calculation

```typescript
// Test: calculateHouseWholeSig()
describe('calculateHouseWholeSig', () => {
  it('should calculate correct house for planet longitude', () => {
    const ascendant = 0; // 0° Aries
    const planet = 30; // 0° Taurus
    const house = calculateHouseWholeSig(planet, ascendant);
    expect(house).toBe(2); // Second house
  });

  it('should handle wrap-around correctly', () => {
    const ascendant = 330; // 0° Pisces
    const planet = 0; // 0° Aries
    const house = calculateHouseWholeSig(planet, ascendant);
    expect(house).toBe(2); // Second house
  });
});
```

#### Moon Phase Icon Mapping

```typescript
// Test: getMoonPhaseIcon()
describe('getMoonPhaseIcon', () => {
  it('should return correct icon for each phase', () => {
    expect(getMoonPhaseIcon('New Moon')).toBe(
      '/icons/moon-phases/new-moon.svg',
    );
    expect(getMoonPhaseIcon('Full Moon')).toBe(
      '/icons/moon-phases/full-moon.svg',
    );
    expect(getMoonPhaseIcon('First Quarter')).toBe(
      '/icons/moon-phases/first-quarter.svg',
    );
  });

  it('should fallback to default for unknown phase', () => {
    expect(getMoonPhaseIcon('Unknown Phase')).toBe(
      '/icons/moon-phases/new-moon.svg',
    );
  });
});
```

---

### B. Integration Tests

#### API Endpoint: /api/patterns/user-readings

```bash
# Test: Fetch user readings with cosmic context
curl -X GET 'http://localhost:3000/api/patterns/user-readings?days=30' \
  -H 'Cookie: <auth-cookie>'

# Expected Response:
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

#### Pattern Adapter Transformation

```typescript
// Test: transformBasicPatternsToAnalysis()
describe('transformBasicPatternsToAnalysis', () => {
  it('should fetch and populate appearances array', async () => {
    const basicPatterns = {
      frequentCards: [{ name: 'The Lovers', count: 5 }],
      timeFrame: 30,
      // ... other fields
    };

    const analysis = await transformBasicPatternsToAnalysis(basicPatterns);

    expect(analysis.frequentCards[0].appearances).toBeDefined();
    expect(analysis.frequentCards[0].appearances.length).toBeGreaterThan(0);
    expect(analysis.frequentCards[0].appearances[0].moonPhase).toBeDefined();
    expect(analysis.frequentCards[0].appearances[0].aspects).toBeDefined();
  });

  it('should sort appearances by date descending', async () => {
    // ... test implementation
  });
});
```

---

### C. Component Tests

#### TodaysAspects Component

```typescript
describe('TodaysAspects', () => {
  it('should display moon phase with icon', () => {
    const { getByAltText, getByText } = render(
      <TodaysAspects birthChart={mockBirthChart} currentTransits={mockTransits} />
    );

    expect(getByAltText(/moon phase/i)).toBeInTheDocument();
    expect(getByText(/Full Moon/i)).toBeInTheDocument();
  });

  it('should display house placement when birth chart available', () => {
    const { getByText } = render(
      <TodaysAspects birthChart={mockBirthChart} currentTransits={mockTransits} />
    );

    expect(getByText(/in your \d+(st|nd|rd|th) house/i)).toBeInTheDocument();
  });

  it('should show keywords', () => {
    const { getByText } = render(
      <TodaysAspects birthChart={mockBirthChart} currentTransits={mockTransits} />
    );

    expect(getByText(/Completion/i)).toBeInTheDocument();
    expect(getByText(/Clarity/i)).toBeInTheDocument();
  });

  it('should gracefully handle missing birth chart', () => {
    const { queryByText } = render(
      <TodaysAspects birthChart={[]} currentTransits={mockTransits} />
    );

    expect(queryByText(/in your \d+(st|nd|rd|th) house/i)).not.toBeInTheDocument();
  });
});
```

#### CosmicContextCard Component

```typescript
describe('CosmicContextCard', () => {
  it('should display date and moon phase', () => {
    const { getByText } = render(
      <CosmicContextCard
        date="2026-01-29T12:00:00Z"
        moonPhase={{ emoji: '🌕', name: 'Full Moon' }}
      />
    );

    expect(getByText(/Jan 29, 2026/i)).toBeInTheDocument();
    expect(getByText(/Full Moon/i)).toBeInTheDocument();
  });

  it('should show card meaning when showCardMeaning is true', () => {
    const { getByText } = render(
      <CosmicContextCard
        date="2026-01-29T12:00:00Z"
        cardName="The Lovers"
        showCardMeaning={true}
      />
    );

    expect(getByText(/Card Meaning/i)).toBeInTheDocument();
  });

  it('should display aspects as badges', () => {
    const aspects = [
      { planet1: 'Mars', planet2: 'Sun', aspectSymbol: '☌' }
    ];

    const { getByText } = render(
      <CosmicContextCard
        date="2026-01-29T12:00:00Z"
        aspects={aspects}
      />
    );

    expect(getByText(/Mars ☌ Sun/i)).toBeInTheDocument();
  });
});
```

---

### D. End-to-End Tests

#### E2E Test 1: Horoscope Moon Phase Display

```typescript
test('Horoscope page displays moon phase with house placement', async ({
  page,
}) => {
  // 1. Login as user with birth chart
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // 2. Navigate to horoscope page
  await page.goto('/horoscope');

  // 3. Check moon phase is displayed
  await expect(page.locator('img[alt*="Moon"]')).toBeVisible();
  await expect(
    page.locator('text=/Full Moon|New Moon|First Quarter/i'),
  ).toBeVisible();

  // 4. Check keywords are displayed
  await expect(
    page.locator('text=/Completion|Clarity|Manifestation/i'),
  ).toBeVisible();

  // 5. Check house placement
  await expect(
    page.locator('text=/in your \\d+(st|nd|rd|th) house/i'),
  ).toBeVisible();

  // 6. Check house interpretation
  await expect(page.locator('text=/Your emotional energy/i')).toBeVisible();
});
```

#### E2E Test 2: Tarot Moon Phase Display

```typescript
test('Tarot page displays moon phase', async ({ page }) => {
  await page.goto('/tarot');

  // Check moon phase section exists
  await expect(page.locator('img[src*="/icons/moon-phases/"]')).toBeVisible();
  await expect(page.locator('text=/Full Moon|New Moon/i')).toBeVisible();
});
```

#### E2E Test 3: Frequent Cards Drill-Down (Pro User)

```typescript
test('Pro user can expand frequent cards to see cosmic context', async ({
  page,
}) => {
  // 1. Login as Pro user
  await page.goto('/login');
  await loginAsProUser(page);

  // 2. Navigate to tarot patterns
  await page.goto('/tarot');
  await page.click('text=/Patterns/i');

  // 3. Wait for patterns to load
  await page.waitForSelector('text=/Frequent Cards/i');

  // 4. Expand first frequent card
  const firstCard = page.locator('[data-testid="frequent-card"]').first();
  await firstCard.click();

  // 5. Check cosmic context is displayed
  await expect(page.locator('text=/When pulled/i')).toBeVisible();
  await expect(page.locator('img[src*="/icons/moon-phases/"]')).toBeVisible();
  await expect(page.locator('text=/Active aspects/i')).toBeVisible();

  // 6. Check card meaning is shown for first appearance
  await expect(page.locator('text=/Card Meaning/i')).toBeVisible();
});
```

#### E2E Test 4: Free User Upgrade Prompt

```typescript
test('Free user sees upgrade prompt for pattern drill-down', async ({
  page,
}) => {
  // 1. Login as free user
  await page.goto('/login');
  await loginAsFreeUser(page);

  // 2. Navigate to tarot patterns
  await page.goto('/tarot');
  await page.click('text=/Patterns/i');

  // 3. Try to expand frequent card
  const firstCard = page.locator('[data-testid="frequent-card"]').first();
  await firstCard.click();

  // 4. Check upgrade prompt is shown
  await expect(page.locator('text=/Upgrade to Pro/i')).toBeVisible();
  await expect(page.locator('text=/Unlock pattern drill-down/i')).toBeVisible();
});
```

---

### E. Visual Regression Tests

#### Test Screenshots

```typescript
// Horoscope page - Moon phase card
test('Moon phase card visual regression', async ({ page }) => {
  await page.goto('/horoscope');
  const moonCard = page.locator('[data-testid="moon-phase-card"]');
  await expect(moonCard).toHaveScreenshot('moon-phase-card.png');
});

// Tarot page - Moon display
test('Tarot moon phase visual regression', async ({ page }) => {
  await page.goto('/tarot');
  const moonSection = page.locator('[data-testid="tarot-moon-phase"]');
  await expect(moonSection).toHaveScreenshot('tarot-moon-phase.png');
});

// Cosmic context card
test('Cosmic context card visual regression', async ({ page }) => {
  await page.goto('/tarot');
  await expandFirstFrequentCard(page);
  const cosmicCard = page
    .locator('[data-testid="cosmic-context-card"]')
    .first();
  await expect(cosmicCard).toHaveScreenshot('cosmic-context-card.png');
});
```

---

### F. Performance Tests

#### Load Time Tests

```typescript
test('Moon phase calculation performance', () => {
  const startTime = performance.now();

  for (let i = 0; i < 1000; i++) {
    getCosmicContextForDate(new Date());
  }

  const endTime = performance.now();
  const avgTime = (endTime - startTime) / 1000;

  expect(avgTime).toBeLessThan(10); // < 10ms per calculation
});

test('Pattern transformation performance', async () => {
  const startTime = performance.now();

  await transformBasicPatternsToAnalysis(largeMockPatterns);

  const endTime = performance.now();
  const duration = endTime - startTime;

  expect(duration).toBeLessThan(1000); // < 1s for transformation
});
```

#### API Response Time

```bash
# Use Apache Bench to test API performance
ab -n 100 -c 10 http://localhost:3000/api/patterns/user-readings

# Expected Results:
# - Mean response time: < 500ms
# - 95th percentile: < 1000ms
# - 99th percentile: < 2000ms
```

---

### G. Accessibility Tests

#### Screen Reader Tests

```typescript
test('Moon phase is accessible to screen readers', async ({ page }) => {
  await page.goto('/horoscope');

  const moonIcon = page.locator('img[alt*="Moon"]');
  await expect(moonIcon).toHaveAttribute('alt', /Full Moon|New Moon/i);

  const moonText = page.locator('text=/Full Moon|New Moon/i');
  await expect(moonText).toBeVisible();
});

test('Cosmic context card is keyboard navigable', async ({ page }) => {
  await page.goto('/tarot');

  // Tab through elements
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  // Ensure focus is visible
  const focusedElement = page.locator(':focus');
  await expect(focusedElement).toBeVisible();
});
```

#### Color Contrast Tests

```typescript
test('Moon phase keywords have sufficient contrast', async ({ page }) => {
  await page.goto('/horoscope');

  const keyword = page.locator('text=/Completion/i').first();
  const contrast = await getContrastRatio(keyword);

  expect(contrast).toBeGreaterThanOrEqual(4.5); // WCAG AA standard
});
```

---

### H. Mobile Responsiveness Tests

#### Mobile Layout Tests

```typescript
test('Moon phase displays correctly on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto('/horoscope');

  const moonCard = page.locator('[data-testid="moon-phase-card"]');
  await expect(moonCard).toBeVisible();

  // Check text doesn't overflow
  const boundingBox = await moonCard.boundingBox();
  expect(boundingBox.width).toBeLessThanOrEqual(375);
});

test('Cosmic context card is readable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/tarot');

  await expandFirstFrequentCard(page);

  const cosmicCard = page
    .locator('[data-testid="cosmic-context-card"]')
    .first();
  await expect(cosmicCard).toBeVisible();

  // Check all text is visible without horizontal scroll
  const hasHorizontalScroll = await page.evaluate(() => {
    return (
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
    );
  });

  expect(hasHorizontalScroll).toBe(false);
});
```

---

## Manual Testing Checklist

### Horoscope Page (/horoscope)

- [ ] Moon phase icon loads correctly (SVG, not emoji)
- [ ] Moon phase name displays (e.g., "Full Moon")
- [ ] Keywords show (3 per phase)
- [ ] House placement shows when birth chart available ("in your 7th house")
- [ ] House interpretation is unique to that house
- [ ] Layout is responsive on mobile
- [ ] Works without birth chart (no house placement shown)
- [ ] No console errors
- [ ] No TypeScript errors

### Tarot Page (/tarot)

- [ ] Moon phase section appears at top
- [ ] Moon icon loads correctly
- [ ] Moon phase name displays
- [ ] Keywords show
- [ ] Layout is responsive on mobile
- [ ] Available to all users (free and paid)
- [ ] No console errors

### Tarot Patterns - Frequent Cards (Pro Users)

- [ ] Frequent cards list displays
- [ ] Can expand card to see details
- [ ] First appearance shows:
  - [ ] Date ("When pulled: Jan 29, 2026")
  - [ ] Moon phase with icon
  - [ ] Card meaning with keywords
  - [ ] Active aspects (if any)
  - [ ] AI transit insights (if birth chart available)
- [ ] Remaining appearances show:
  - [ ] Date
  - [ ] Moon phase with icon
  - [ ] Active aspects (if any)
- [ ] Timeline graph displays
- [ ] "Show more" indicates additional appearances
- [ ] No console errors

### Tarot Patterns - Free Users

- [ ] Can see frequent cards list
- [ ] Cannot expand cards (locked)
- [ ] Upgrade prompt shows when trying to expand
- [ ] Upgrade button links to pricing page

### Edge Cases

- [ ] No birth chart: Moon shows without house placement
- [ ] No appearances: Shows "No data" message
- [ ] No aspects that day: Hides aspects section
- [ ] Slow API: Loading state displays
- [ ] API error: Graceful fallback message
- [ ] Missing moon phase data: Fallback to generic moon icon

---

## Test Data Requirements

### Mock Data Needed

1. **Mock Birth Chart**:

   ```typescript
   const mockBirthChart = [
     { body: 'Sun', sign: 'Aries', eclipticLongitude: 15 },
     { body: 'Moon', sign: 'Cancer', eclipticLongitude: 105 },
     { body: 'Ascendant', sign: 'Libra', eclipticLongitude: 180 },
     // ... other planets
   ];
   ```

2. **Mock Current Transits**:

   ```typescript
   const mockTransits = [
     { body: 'Moon', sign: 'Pisces', eclipticLongitude: 345 },
     { body: 'Sun', sign: 'Aquarius', eclipticLongitude: 310 },
     // ... other planets
   ];
   ```

3. **Mock Tarot Readings**:
   ```typescript
   const mockReadings = [
     {
       name: 'The Lovers',
       createdAt: '2026-01-29T12:00:00Z',
       moonPhase: { phase: 'fullMoon', emoji: '🌕', name: 'Full Moon' },
       aspects: [{ planet1: 'Mars', planet2: 'Sun', aspectSymbol: '☌' }],
     },
     // ... more readings
   ];
   ```

---

## Automation Setup

### GitHub Actions Workflow

```yaml
name: Cosmic Context Tests

on:
  push:
    branches: [main, feat/cosmic-context-*]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Check TypeScript
        run: npm run type-check

      - name: Run ESLint
        run: npm run lint
```

---

## Success Criteria

### All tests must pass:

- ✅ Unit tests: 100% pass rate
- ✅ Integration tests: 100% pass rate
- ✅ E2E tests: 100% pass rate
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ No console errors in browser
- ✅ Performance: < 500ms API response time
- ✅ Accessibility: WCAG AA compliant
- ✅ Mobile: Responsive on all screen sizes

---

## Test Execution Log

### Automated Test Results (2026-01-30)

| Test                     | Status  | Notes                       |
| ------------------------ | ------- | --------------------------- |
| TypeScript compilation   | ✅ Pass | Next.js build successful    |
| ESLint check             | ✅ Pass | 0 warnings, 0 errors        |
| Next.js Production Build | ✅ Pass | Build completed in 101s     |
| Image Component Usage    | ✅ Pass | Using next/image everywhere |
| Import Paths             | ✅ Pass | All @/ imports resolved     |

### Manual Test Results (Pending User Verification)

| Test                            | Status     | Notes          |
| ------------------------------- | ---------- | -------------- |
| Horoscope moon phase display    | ⏳ Pending | Need to verify |
| Tarot moon phase display        | ⏳ Pending | Need to verify |
| Frequent cards drill-down (Pro) | ⏳ Pending | Need to verify |
| Frequent cards locked (Free)    | ⏳ Pending | Need to verify |
| House calculation accuracy      | ⏳ Pending | Need to verify |
| API endpoint response           | ⏳ Pending | Need to verify |
| Mobile responsiveness           | ⏳ Pending | Need to verify |

---

## Next Steps

1. **Run manual tests** on each feature
2. **Write unit tests** for cosmic-context-utils.ts
3. **Write component tests** for TodaysAspects and CosmicContextCard
4. **Implement E2E tests** for critical user flows
5. **Set up CI/CD** automation in GitHub Actions
6. **Monitor production** for errors and performance issues

---

_Testing Plan Created: January 30, 2026_
_Last Updated: January 30, 2026_
