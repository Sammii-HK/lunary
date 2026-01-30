# Birth Chart Feature Testing Guide

**Last Updated**: 2026-01-30

## Overview

This document provides comprehensive testing instructions for all birth chart features implemented in this session.

---

## Features to Test

1. ✅ Correct Astronomicon symbol mappings
2. ✅ Asteroid symbols rendering (8 asteroids)
3. ✅ Enhanced planetary interpretations (sign-specific)
4. ✅ Chart Ruler feature
5. ✅ Planetary Dignity indicators
6. ✅ Quick Chart Summary
7. ✅ Elemental & Modal Balance symbols

---

## Test Environment Setup

### Prerequisites

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser to http://localhost:3000
```

### Test User Data

Use a birth chart with diverse placements:

**Example Test Birth Data**:

- **Date**: 1990-01-15
- **Time**: 14:30
- **Location**: New York, NY, USA
- **Timezone**: America/New_York

This ensures:

- Multiple elements represented
- Various modalities
- Different planetary dignities
- Asteroids in different signs

---

## Test Cases

### 1. Symbol Rendering - Astronomicon Glyphs

**Feature**: Correct Astronomicon font mappings

**Test Steps**:

1. Navigate to birth chart page
2. Scroll to "Elemental & Modal Balance" section
3. Expand the section

**Expected Results**:

- ✅ All planet symbols render as proper glyphs (not ?, boxes, or letters)
- ✅ Fire element shows: Sun (☉), Mars (♂), etc.
- ✅ Earth element shows: Moon (☽), Mercury (☿), Venus (♀), Saturn (♄), etc.
- ✅ No question marks or missing glyphs

**Visual Verification**:

```
Elements Section:
1 Fire: ☉ ♂ ? [symbols, NOT letters]
2 Earth: ☉ ☽ ♂ ♀ ♄ ♆ ♇ [proper glyphs]
3 Air: ☿ ♀ ♃ ☊ [proper glyphs]
4 Water: ♄ ☿ ♈ [proper glyphs]
```

**Test File**: Manual visual test
**Location**: `src/app/birth-chart/page.tsx` (Elemental Balance section)

---

### 2. Asteroid Symbols

**Feature**: 8 asteroids with correct symbols (6 Astronomicon + 2 Unicode)

**Test Steps**:

1. Navigate to birth chart page
2. Scroll to "Asteroids" collapsible section
3. Expand the section

**Expected Results**:

- ✅ **Ceres**: Shows ⚳ symbol (Astronomicon 'l')
- ✅ **Pallas**: Shows ⚴ symbol (Astronomicon 'm')
- ✅ **Juno**: Shows ⚵ symbol (Astronomicon 'n')
- ✅ **Vesta**: Shows ⚶ symbol (Astronomicon 'o')
- ✅ **Hygiea**: Shows ⚕ symbol (Astronomicon 'p')
- ✅ **Chiron**: Shows ⚷ symbol (Astronomicon 'q')
- ✅ **Pholus**: Shows symbol (Astronomicon 'r')
- ✅ **Psyche**: Shows Ψ symbol (Unicode)
- ✅ **Eros**: Shows ♡ symbol (Unicode)

**Visual Format**:

```
⚳ Ceres in Capricorn
  19°25' Capricorn

⚴ Pallas in Capricorn
  1°15' Capricorn
```

**Test File**: `src/components/birth-chart-sections/AsteroidsSection.tsx`
**Unit Tests**: `__tests__/unit/astrology/asteroids.test.ts` (17 tests)

---

### 3. Enhanced Planetary Interpretations

**Feature**: Sign-specific, educational interpretations for Sun, Moon, Mercury, Venus, Mars

**Test Steps**:

1. Navigate to birth chart page
2. Expand "Personal Planets" section
3. Read each planet's interpretation

**Expected Results**:

- ✅ Sun interpretation is **specific** to its sign (not generic)
- ✅ Moon interpretation explains emotional needs for that sign
- ✅ Mercury interpretation explains thinking style for that sign
- ✅ Venus interpretation explains love approach for that sign
- ✅ Mars interpretation explains action style for that sign

**Example - Sun in Capricorn**:

❌ **OLD** (too generic):

> "Your core identity and life purpose expresses through ambitious, disciplined, traditional energy."

✅ **NEW** (educational):

> "Your identity is ambitious, disciplined, and achievement-oriented. You define yourself through accomplishment and responsibility. Your purpose involves mastering challenges and building legacy."

**Test Criteria**:

- Interpretation is 2-3 sentences long
- Explains WHAT, HOW, and WHY
- Includes sign-specific keywords
- Retrograde notation appears if applicable

**Test File**: `src/app/birth-chart/page.tsx` - `getPlanetaryInterpretation()`

---

### 4. Chart Ruler Feature

**Feature**: Automatic chart ruler detection and display

**Test Steps**:

1. Navigate to birth chart page
2. Scroll to "Chart Ruler" collapsible section
3. Expand the section

**Expected Results**:

- ✅ Section displays chart ruler based on Ascendant sign
- ✅ Shows correct ruling planet:
  - Aries Rising → Mars
  - Taurus Rising → Venus
  - Gemini Rising → Mercury
  - Cancer Rising → Moon
  - Leo Rising → Sun
  - Virgo Rising → Mercury
  - Libra Rising → Venus
  - Scorpio Rising → Pluto
  - Sagittarius Rising → Jupiter
  - Capricorn Rising → Saturn
  - Aquarius Rising → Uranus
  - Pisces Rising → Neptune

**Visual Format**:

```
Chart Ruler

♂ Mars rules your chart

As the ruler of your Aries Ascendant, Mars is the most
important planet in your chart...

Chart Ruler Placement
Sign: Capricorn ♑
Position: 15°30'
House: 10th House

Key Aspects to Chart Ruler
△ Jupiter (2° orb)
□ Saturn (4° orb)
```

**Test Cases**:
| Ascendant Sign | Expected Ruler | Verify |
|----------------|----------------|--------|
| Aries | Mars | ☐ |
| Capricorn | Saturn | ☐ |
| Pisces | Neptune | ☐ |

**Test File**: `src/app/birth-chart/page.tsx` - Chart Ruler section
**Test Function**: `getChartRuler()`

---

### 5. Planetary Dignity Indicators

**Feature**: Badges showing Rulership, Exaltation, Detriment, Fall

**Test Steps**:

1. Navigate to birth chart page
2. Expand "Personal Planets" section
3. Look for colored badges next to planet names

**Expected Results**:

**Inline Badges** (in planet sections):

- ✅ Green badge ✦ "Rulership" for planets in home sign
- ✅ Amber badge ★ "Exalted" for planets in exaltation
- ✅ Orange badge ⚠ "Detriment" for planets in challenging sign
- ✅ Red badge ▼ "Fall" for planets in weakened state

**Example Visual**:

```
☉ Sun in Leo  ✦ Rulership
Your identity is expressed through...

☽ Moon in Scorpio  ▼ Fall
Your emotional needs...
```

**Test Cases**:
| Planet | Sign | Expected Dignity | Badge Color |
|--------|------|------------------|-------------|
| Sun | Leo | Rulership | Green ✦ |
| Moon | Taurus | Exaltation | Amber ★ |
| Sun | Aquarius | Detriment | Orange ⚠ |
| Moon | Scorpio | Fall | Red ▼ |
| Mars | Aries | Rulership | Green ✦ |
| Venus | Pisces | Exaltation | Amber ★ |

**Dedicated Section**:

1. Scroll to "Planetary Strength" section
2. Expand section

**Expected Results**:

- ✅ Lists all planets with dignities/debilities
- ✅ Color-coded borders matching badge colors
- ✅ Detailed explanations for each

**Test File**: `src/app/birth-chart/page.tsx` - `getPlanetDignityStatus()`

---

### 6. Quick Chart Summary

**Feature**: At-a-glance chart pattern overview

**Test Steps**:

1. Navigate to birth chart page
2. Scroll to "Chart Summary" section (near top, after Big Three)
3. Expand the section

**Expected Results**:

**Three Cards Displayed**:

1. **Dominant Element**
   - ✅ Shows element with most planets (Fire/Earth/Air/Water)
   - ✅ Displays planet count
   - ✅ Shows element symbol using Astronomicon
   - ✅ Explains what this means

2. **Dominant Modality**
   - ✅ Shows modality with most planets (Cardinal/Fixed/Mutable)
   - ✅ Displays planet count
   - ✅ Shows modality symbol using Astronomicon
   - ✅ Explains behavioral approach

3. **Most Aspected Planet**
   - ✅ Identifies planet with most major aspects
   - ✅ Shows planet symbol
   - ✅ Explains significance as focal point

**Visual Format**:

```
Chart Summary

[Dominant Element]        [Dominant Modality]      [Most Aspected]
🜂 Earth Dominant         ⊞ Fixed Mode             ♄ Saturn Focal Point
9 planets in Earth signs. 11 planets in Fixed...  Your most aspected...
```

**Test Calculations**:

- Count planets by element
- Count planets by modality
- Count major aspects for each planet
- Verify correct identification of dominant/focal

**Test File**: `src/app/birth-chart/page.tsx` - Chart Summary section
**Test Functions**: `getElementCounts()`, `getModalityCounts()`, `getMostAspectedPlanet()`

---

### 7. Elemental & Modal Balance - All Symbols

**Feature**: Complete symbol rendering in balance breakdown

**Test Steps**:

1. Navigate to birth chart page
2. Scroll to "Elemental & Modal Balance" section
3. Expand the section

**Expected Results**:

**Elements Panel**:

- ✅ Each element shows count
- ✅ Planet symbols render correctly below
- ✅ All symbols use Astronomicon font
- ✅ No "?" or boxes for any planet

**Modalities Panel**:

- ✅ Each modality shows count
- ✅ Planet symbols render correctly below
- ✅ Includes asteroids (Ceres, Pallas, etc.)
- ✅ Asteroid symbols render (Astronomicon + Unicode)

**Test Cases**:

| Element | Symbol Test                  | Expected |
| ------- | ---------------------------- | -------- |
| Fire    | Shows Sun (☉)                | ✅       |
| Earth   | Shows Moon (☽), Saturn (♄)   | ✅       |
| Air     | Shows Mercury (☿), Venus (♀) | ✅       |
| Water   | Shows Mars in Water sign     | ✅       |

| Modality | Symbol Test                               | Expected |
| -------- | ----------------------------------------- | -------- |
| Cardinal | Shows Ceres (⚳), Pallas (⚴) if applicable | ✅       |
| Fixed    | Shows Juno (⚵), Vesta (⚶) if applicable   | ✅       |
| Mutable  | Shows Psyche (Ψ), Eros (♡) if applicable  | ✅       |

**Test File**: `src/app/birth-chart/page.tsx` - Elemental & Modal Balance section

---

## Automated Tests

### Run Unit Tests

```bash
# All astrology tests
npm test -- __tests__/unit/astrology/

# Specific test files
npm test -- __tests__/unit/astrology/asteroids.test.ts
npm test -- __tests__/unit/astrology/calculations.test.ts
npm test -- __tests__/unit/astrology/zodiacSign.test.ts
```

**Expected Results**:

- ✅ 89 tests passing (17 + 32 + 40)
- ✅ 0 tests failing

### Test Coverage

| Test File            | Tests | Coverage                                |
| -------------------- | ----- | --------------------------------------- |
| asteroids.test.ts    | 17    | Asteroid calculations, orbital motion   |
| calculations.test.ts | 32    | Julian Day, normalization, zodiac signs |
| zodiacSign.test.ts   | 40    | Sign boundaries, degree formatting      |

---

## Visual Regression Testing

### Key Screenshots to Capture

1. **Birth Chart Wheel**
   - All planet symbols visible
   - Asteroids positioned correctly
   - No missing glyphs

2. **Elemental Balance**
   - All symbols rendering
   - Proper spacing
   - No overflow

3. **Personal Planets Section**
   - Dignity badges showing
   - Correct colors
   - Interpretations visible

4. **Chart Ruler Section**
   - Ruler identified correctly
   - Placement details shown
   - Aspects listed

5. **Planetary Strength Section**
   - All dignities listed
   - Color-coded borders
   - Badges rendering

---

## Browser Compatibility

Test in the following browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

**Known Issues**:

- Astronomicon font must load correctly
- Unicode fallbacks (Psyche, Eros) may vary slightly by OS/browser

---

## Performance Testing

### Page Load Metrics

**Target Metrics**:

- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.0s

**Test Command**:

```bash
npm run build
npm start
# Use Lighthouse in Chrome DevTools
```

**Acceptable Results**:

- Performance score: > 90
- No console errors
- Symbols load without flicker

---

## Accessibility Testing

### Screen Reader Testing

**Test Steps**:

1. Enable VoiceOver (Mac) or NVDA (Windows)
2. Navigate through birth chart sections
3. Verify:
   - ✅ Planet names announced correctly
   - ✅ Dignity statuses readable
   - ✅ Interpretations accessible
   - ✅ Collapsible sections navigable

### Keyboard Navigation

**Test Steps**:

1. Tab through birth chart page
2. Verify:
   - ✅ Collapsible sections toggle with Enter/Space
   - ✅ Focus indicators visible
   - ✅ No keyboard traps

---

## Edge Cases

### Test Edge Cases

1. **No Birth Time Provided**
   - Expected: Houses section shows upgrade prompt
   - Chart Ruler may not calculate

2. **Very Early Birth Date (1900)**
   - Expected: All calculations still work
   - Asteroids render correctly

3. **Future Birth Date (2030)**
   - Expected: Calculations work
   - No errors or crashes

4. **All Planets in One Sign (Stellium)**
   - Expected: Element/modality shows extreme dominance
   - UI handles high counts gracefully

5. **No Dignified Planets**
   - Expected: "Planetary Strength" section still appears
   - Shows message or only challenging dignities

---

## Smoke Test Checklist

Quick verification after deployment:

- [ ] Birth chart loads without errors
- [ ] All symbols render (no ? or boxes)
- [ ] Asteroid symbols appear correctly
- [ ] Personal planet interpretations are detailed
- [ ] Chart Ruler section displays
- [ ] Dignity badges show correct colors
- [ ] Quick Chart Summary calculates correctly
- [ ] Elemental Balance symbols render
- [ ] Modal Balance symbols render
- [ ] No console errors
- [ ] Page performance acceptable

---

## Reporting Issues

If you find issues:

1. **Document**:
   - Browser and version
   - Screenshot of issue
   - Steps to reproduce
   - Expected vs actual behavior

2. **Check**:
   - Browser console for errors
   - Network tab for failed requests
   - Astronomicon font loaded

3. **Report**:
   - File GitHub issue with details
   - Tag with `birth-chart` label
   - Include test case that fails

---

## References

- Feature Documentation: `/docs/BIRTH_CHART_SYMBOLS_AND_INTERPRETATIONS.md`
- Symbol Reference: `/docs/ASTRONOMICON_QUICK_REFERENCE.md`
- Test Suite: `/__tests__/unit/astrology/README.md`

---

**Last Updated**: 2026-01-30
**Test Status**: ✅ Ready for manual testing
