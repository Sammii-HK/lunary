# Birth Chart Symbols & Interpretations

**Last Updated**: 2026-01-30

## Overview

This document details the complete implementation of astrological symbols and enhanced planetary interpretations in the Lunary birth chart system.

---

## Astronomicon Font Integration

### Official Reference

All symbol mappings follow the official Astronomicon font v1.1 specification:
https://astronomicon.co/en/astronomicon-fonts/

### Implementation Location

- **Symbol Definitions**: `/utils/zodiac/zodiac.ts`
- **Font File**: `/public/fonts/Astronomicon.ttf`
- **CSS Class**: `font-astro` (applies Astronomicon font)

---

## Symbol Mappings

### Planets (bodiesSymbols)

All major planetary symbols use Astronomicon glyphs:

```typescript
{
  sun: 'Q',        // ☉ Sun
  moon: 'R',       // ☽ Moon
  mercury: 'S',    // ☿ Mercury
  venus: 'T',      // ♀ Venus
  mars: 'U',       // ♂ Mars
  jupiter: 'V',    // ♃ Jupiter
  saturn: 'W',     // ♄ Saturn
  uranus: 'X',     // ♅ Uranus
  neptune: 'Y',    // ♆ Neptune
  pluto: 'Z',      // ♇ Pluto
}
```

### Angles & Nodes (astroPointSymbols)

```typescript
{
  ascendant: 'c',     // Ascendant (Rising Sign)
  descendant: 'f',    // Descendant
  midheaven: 'd',     // Midheaven (MC)
  imumcoeli: 'e',     // Imum Coeli (IC)
  northnode: 'g',     // ☊ North Node
  southnode: 'i',     // ☋ South Node
  lilith: 'z',        // ⚸ Lilith (Black Moon)
  partoffortune: '?', // ⊗ Part of Fortune
}
```

### Asteroids (astroPointSymbols)

**Astronomicon Glyphs** (use `font-astro` class):

```typescript
{
  chiron: 'q',   // ⚷ Chiron
  ceres: 'l',    // ⚳ Ceres
  pallas: 'm',   // ⚴ Pallas
  juno: 'n',     // ⚵ Juno
  vesta: 'o',    // ⚶ Vesta
  hygiea: 'p',   // ⚕ Hygiea
  pholus: 'r',   // Pholus
}
```

**Unicode Fallbacks** (NO `font-astro` class - not in Astronomicon v1.1):

```typescript
{
  psyche: 'Ψ',   // Greek letter Psi
  eros: '♡',     // Heart symbol
}
```

---

## Smart Font Rendering

### Conditional Font Application

The codebase automatically detects whether to apply the `font-astro` class:

```typescript
const isAstronomiconChar = symbol.length === 1 && symbol.charCodeAt(0) < 128;

<span className={`text-xs ${isAstronomiconChar ? 'font-astro' : ''}`}>
  {symbol}
</span>
```

**Logic**:

- **Astronomicon characters**: Single ASCII characters (code < 128) → Apply `font-astro`
- **Unicode characters**: Multi-byte or high codepoint (code ≥ 128) → Use system font

### Implementation Locations

1. **Elemental & Modal Balance** (`src/app/birth-chart/page.tsx` lines 2091-2108)
2. **Modalities Section** (`src/app/birth-chart/page.tsx` lines 2157-2176)
3. **Asteroids Section** (`src/components/birth-chart-sections/AsteroidsSection.tsx` line 53)

---

## Enhanced Planetary Interpretations

### Overview

Location: `src/app/birth-chart/page.tsx` - `getPlanetaryInterpretation()` function

Each major planet (Sun, Moon, Mercury, Venus, Mars) has **12 detailed sign-specific interpretations** that explain:

- **What** the planet represents
- **How** it expresses in that specific sign
- **Why** this combination matters for the native

### Example: Sun in Capricorn

**OLD** (Generic):

> "Your core identity and life purpose expresses through ambitious, disciplined, traditional energy."

**NEW** (Educational):

> "Your identity is ambitious, disciplined, and achievement-oriented. You define yourself through accomplishment and responsibility. Your purpose involves mastering challenges and building legacy."

### Coverage

- **Sun**: 12 signs × detailed identity/purpose interpretations
- **Moon**: 12 signs × emotional needs/security interpretations
- **Mercury**: 12 signs × thinking/communication style interpretations
- **Venus**: 12 signs × love/values interpretations
- **Mars**: 12 signs × action/drive interpretations
- **Outer Planets** (Jupiter, Saturn, Uranus, Neptune, Pluto): Archetypal fallback interpretations

### Retrograde Notation

All retrograde planets include educational context:

```typescript
const retrogradeNote = planet.retrograde
  ? ' [Retrograde: This energy turns inward, requiring you to master it internally before expressing it outwardly. Periods of reflection and revision are essential.]'
  : '';
```

---

## Component Updates

### 1. Asteroids Section

**File**: `src/components/birth-chart-sections/AsteroidsSection.tsx`

**Changes**:

- Removed hardcoded `font-astro` class
- Now renders Unicode symbols (Psyche, Eros) with system font
- Astronomicon symbols (Ceres, Pallas, etc.) display correctly

### 2. Elemental & Modal Balance

**File**: `src/app/birth-chart/page.tsx`

**Changes**:

- Added smart font detection for planet symbols
- Conditional `font-astro` class application
- Supports mixed Astronomicon + Unicode symbols

### 3. Personal/Social/Generational Planet Sections

**Files**:

- `src/components/birth-chart-sections/PersonalPlanetsSection.tsx`
- `src/components/birth-chart-sections/SocialPlanetsSection.tsx`
- `src/components/birth-chart-sections/GenerationalPlanetsSection.tsx`

**Changes**:

- Display detailed sign-specific interpretations
- Include dignity badges (Rulership, Exaltation, Detriment, Fall)
- Pass `getPlanetDignityStatus` function for inline badges

---

## Chart Ruler Enhancement

### Location

`src/app/birth-chart/page.tsx` - Chart Ruler Section (lines 1597-1693)

### Features

1. **Automatic Detection**: Determines ruling planet based on Ascendant sign
2. **Placement Details**: Shows ruler's sign, degree, house
3. **Key Aspects**: Displays top 3 aspects to chart ruler
4. **Educational Context**: Explains significance of chart ruler

### Ruling Planet Mappings

```typescript
const rulers = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Pluto', // Modern (traditional: Mars)
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Uranus', // Modern (traditional: Saturn)
  Pisces: 'Neptune', // Modern (traditional: Jupiter)
};
```

---

## Planetary Dignity Indicators

### Overview

Location: `src/app/birth-chart/page.tsx` - `getPlanetDignityStatus()` function

### Dignity Types

1. **Rulership** (Domicile) - Green badge ✦
   - Planet in its home sign
   - Natural strength and ease of expression

2. **Exaltation** - Amber badge ★
   - Planet operating at highest potential
   - Elevated expression

3. **Detriment** - Orange badge ⚠
   - Planet in opposite sign from rulership
   - Challenges in natural expression

4. **Fall** - Red badge ▼
   - Planet in opposite sign from exaltation
   - Weakened state, requires extra effort

### Display Locations

- **Inline**: Personal/Social/Generational planet sections
- **Dedicated Section**: "Planetary Strength" collapsible section
- **Visual**: Color-coded borders and badges

---

## Quick Chart Summary

### Location

`src/app/birth-chart/page.tsx` - Chart Summary Section (lines 1598-1685)

### Features

Three-column grid displaying:

1. **Dominant Element** (Fire/Earth/Air/Water)
   - Count of planets in each element
   - Explanation of what this means

2. **Dominant Modality** (Cardinal/Fixed/Mutable)
   - Count of planets in each modality
   - Behavioral approach description

3. **Most Aspected Planet**
   - Planet with most major aspects
   - Significance as chart focal point

---

## Testing

### Unit Tests

Location: `__tests__/unit/astrology/`

- **asteroids.test.ts**: 17 tests for asteroid calculations
- **calculations.test.ts**: 32 tests for core astronomical functions
- **zodiacSign.test.ts**: 40 tests for sign assignment and formatting

**Total**: 89 passing tests

### Manual Verification Checklist

- [ ] All planet symbols render in chart wheel
- [ ] Asteroid symbols display correctly (except Psyche/Eros use Unicode)
- [ ] Elemental Balance shows all symbols correctly
- [ ] Modal Balance shows all symbols correctly
- [ ] Personal planet interpretations are sign-specific
- [ ] Chart Ruler section displays correctly
- [ ] Dignity badges show appropriate colors
- [ ] Quick Chart Summary calculates correctly

---

## Common Issues & Solutions

### Issue: Symbols show as "?" or boxes

**Cause**: Incorrect Astronomicon character mapping or missing font file

**Solution**:

1. Verify `/public/fonts/Astronomicon.ttf` exists
2. Check symbol mapping in `/utils/zodiac/zodiac.ts`
3. Ensure `font-astro` class is applied correctly

### Issue: Unicode symbols (Psyche, Eros) don't render

**Cause**: `font-astro` class applied to Unicode characters

**Solution**: Use conditional font application logic:

```typescript
const isAstronomiconChar = symbol.length === 1 && symbol.charCodeAt(0) < 128;
```

### Issue: Duplicate symbols in different constants

**Cause**: Symbol defined in both `bodiesSymbols` and `astroPointSymbols`

**Solution**:

- `bodiesSymbols`: Only planets (Sun through Pluto)
- `astroPointSymbols`: Angles, nodes, asteroids, points

---

## Maintenance

### Adding New Asteroids

1. Check [Astronomicon documentation](https://astronomicon.co/en/astronomicon-fonts/) for glyph availability
2. If available, add to `astroPointSymbols` with Astronomicon character
3. If not available, add with Unicode fallback symbol
4. Update ASTEROIDS constants in relevant components

### Updating Interpretations

1. Edit `getPlanetaryInterpretation()` in `src/app/birth-chart/page.tsx`
2. Add new planet-sign combination to nested object
3. Follow format: What + How + Why
4. Include retrograde notation if applicable

### Updating Symbol Mappings

**IMPORTANT**: Always reference official Astronomicon documentation before changing mappings.

**DO NOT** guess character positions or use arbitrary mappings.

---

## References

- **Astronomicon Font v1.1**: https://astronomicon.co/en/astronomicon-fonts/
- **Font License**: Open Font License (SIL OFL)
- **JPL Horizons** (Orbital Elements): https://ssd.jpl.nasa.gov/horizons/
- **Swiss Ephemeris**: https://www.astro.com/swisseph/

---

## Related Documentation

- `/docs/FEATURE_ACCESS.md` - Birth chart access control
- `/__tests__/unit/astrology/README.md` - Test suite documentation
- `/BIRTH_CHART_ENHANCEMENT_COMPLETE.md` - Implementation history

---

**Maintained by**: Development Team
**Contact**: For issues or questions, file a GitHub issue
