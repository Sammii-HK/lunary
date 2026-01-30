# Birth Chart Calculation Tests

Comprehensive test suite for astronomical calculations used in birth chart generation.

## Test Coverage

### ✅ calculations.test.ts (32 tests)

Tests core astronomical calculation functions:

**Julian Day Calculations (4 tests)**

- J2000.0 epoch verification
- Unix epoch verification
- Sequential day increments
- Fractional day handling

**Degree Normalization (5 tests)**

- Range validation (0-360°)
- Wraparound for values > 360°
- Negative value handling
- Large positive/negative values

**Earth Heliocentric Position (3 tests)**

- Rectangular coordinate validation
- Orbital motion over time
- Constant distance from Sun (~1 AU)

**Zodiac Sign Assignment (14 tests)**

- All 12 sign boundaries (0°, 30°, 60°, ..., 330°)
- Cusp positions (29.9° vs 30.1°)

**Degree Formatting (4 tests)**

- Ecliptic → sign degree conversion
- Degree range validation (0-29)
- Minute range validation (0-59)
- Minute precision

**Integration Tests (2 tests)**

- Full zodiac conversion
- Julian Day monotonic increase

---

### ✅ asteroids.test.ts (17 tests)

Tests asteroid position calculations using Kepler orbital mechanics:

**Major Asteroids (4 tests)**

- Ceres, Pallas, Juno, Vesta position calculations
- Valid range verification (0-360°)

**Minor Asteroids (4 tests)**

- Hygiea, Pholus, Psyche, Eros position calculations
- NaN prevention

**Orbital Motion (2 tests)**

- 30-day movement verification
- Different movement rates between asteroids

**Historical Dates (2 tests)**

- Year 2000 calculations
- Future date (2030) calculations

**Consistency (3 tests)**

- Identical results for same date
- Different results for different dates
- Timezone independence

**Numerical Stability (2 tests)**

- Far-future/past date handling (1900-2100)
- Epoch-proximity accuracy

---

### ✅ zodiacSign.test.ts (40 tests)

Tests zodiac sign assignment and degree formatting:

**Sign Boundaries (15 tests)**

- All 12 zodiac signs at exact boundaries
- Aries (0°), Taurus (30°), ..., Pisces (330°, 359.9°)

**Cusp Positions (2 tests)**

- Aries/Taurus cusp (29.999° vs 30.001°)
- Pisces/Aries cusp (359.999° vs 0.001°)

**Edge Cases (3 tests)**

- 360° handling (normalizes to Aries)
- Values > 360°
- Negative values

**Degree Formatting (12 tests)**

- Basic formatting (0°, 15.5°, 29.99°)
- Sign degree conversion (30° ecliptic → 0° Taurus)
- All sign boundaries (0°, 30°, 60°, ..., 270°)
- Minute precision (15.25° = 15°15')
- Edge cases (360°, >360°, small fractions)

**Range Validation (2 tests)**

- Degrees always 0-29
- Minutes always 0-59

**Integration (1 test)**

- Combined sign and degree accuracy

---

## Test Statistics

**Total Tests: 89**

- ✅ Passing: 89
- ❌ Failing: 0
- Coverage: Core calculation functions

## Running Tests

```bash
# Run all astrology tests
npm test -- __tests__/unit/astrology/

# Run specific test file
npm test -- __tests__/unit/astrology/calculations.test.ts
npm test -- __tests__/unit/astrology/asteroids.test.ts
npm test -- __tests__/unit/astrology/zodiacSign.test.ts

# Watch mode
npm test -- --watch __tests__/unit/astrology/
```

## Accuracy & Tolerances

### Planetary Positions

- **Planets**: Simplified orbital mechanics (not full ephemeris)
- **Acceptable tolerance**: ±1-3° from Swiss Ephemeris
- **Reference**: NASA JPL Horizons System

### Asteroids

- **Method**: Kepler orbital elements
- **Epoch**: JD 2461000.5 (2026-01-15.0 TDB)
- **Acceptable tolerance**: ±3° (simplified mechanics)
- **Orbital elements**: JPL Horizons System

### Julian Day

- **Reference**: J2000.0 = JD 2451545.0
- **Tolerance**: ±0.01 days
- **Range tested**: 1900-2100

### Angles (Ascendant/Midheaven)

- **Method**: Trigonometric calculation
- **Tolerance**: ±2° (timezone/location precision)

## Known Limitations

1. **Simplified Orbital Mechanics**: Uses basic Kepler orbits, not full perturbation theory
2. **No Nutation**: Does not account for Earth's axial nutation
3. **No Precession**: Uses tropical zodiac (precession already accounted for in astronomy library)
4. **Time Scale**: Uses UTC, not TDB (Barycentric Dynamical Time)

These simplifications are acceptable for astrological purposes (±1-3° tolerance).

## Future Improvements

- [ ] Add integration tests with full birth chart generation
- [ ] Test retrograde detection accuracy
- [ ] Add house system calculations tests (Placidus, Whole Sign)
- [ ] Test extreme latitudes (Arctic/Antarctic)
- [ ] Add aspect calculation tests
- [ ] Test timezone edge cases (DST transitions)
- [ ] Benchmark performance for bulk calculations

## References

- **Astronomy Engine**: https://github.com/cosinekitty/astronomy
- **JPL Horizons**: https://ssd.jpl.nasa.gov/horizons/
- **Swiss Ephemeris**: https://www.astro.com/swisseph/
- **J2000.0 Epoch**: https://en.wikipedia.org/wiki/Epoch_(astronomy)#J2000.0

## Maintenance

Tests should be run:

- ✅ Before each release
- ✅ After modifying calculation functions
- ✅ When updating orbital elements
- ✅ After astronomy library updates

Last updated: 2026-01-30
