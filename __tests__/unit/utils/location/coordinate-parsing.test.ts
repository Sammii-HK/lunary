/**
 * Coordinate Parsing Tests
 *
 * Tests the parseCoordinates function from utils/location.ts
 * which handles multiple coordinate input formats.
 */

import { parseCoordinates } from 'utils/location';

describe('Coordinate parsing', () => {
  // --- Decimal pair with comma ---

  it('parses "40.7128,-74.006" (decimal pair, comma)', () => {
    const result = parseCoordinates('40.7128,-74.006');
    expect(result).toEqual({ latitude: 40.7128, longitude: -74.006 });
  });

  it('parses "40.7128, -74.006" (decimal pair, comma + space)', () => {
    const result = parseCoordinates('40.7128, -74.006');
    expect(result).toEqual({ latitude: 40.7128, longitude: -74.006 });
  });

  it('parses "-33.8688, 151.2093" (negative latitude)', () => {
    const result = parseCoordinates('-33.8688, 151.2093');
    expect(result).toEqual({ latitude: -33.8688, longitude: 151.2093 });
  });

  // --- Decimal pair with space ---

  it('parses "40.7128 -74.006" (decimal pair, space)', () => {
    const result = parseCoordinates('40.7128 -74.006');
    expect(result).toEqual({ latitude: 40.7128, longitude: -74.006 });
  });

  // --- Hemisphere notation ---

  it('parses "40.7128N, 74.006W" (hemisphere notation)', () => {
    const result = parseCoordinates('40.7128N, 74.006W');
    expect(result).toEqual({ latitude: 40.7128, longitude: -74.006 });
  });

  it('parses "33.8688S, 151.2093E" (southern/eastern hemisphere)', () => {
    const result = parseCoordinates('33.8688S, 151.2093E');
    expect(result).toEqual({ latitude: -33.8688, longitude: 151.2093 });
  });

  // --- DMS format ---

  it('parses DMS with degree symbol "40\u00b042\'46"N, 74\u00b000\'22"W"', () => {
    const result = parseCoordinates('40\u00b042\'46"N, 74\u00b000\'22"W');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.latitude).toBeCloseTo(40.7128, 2);
      expect(result.longitude).toBeCloseTo(-74.006, 2);
    }
  });

  // --- Invalid input ---

  it('returns null for empty string', () => {
    expect(parseCoordinates('')).toBeNull();
  });

  it('returns null for whitespace only', () => {
    expect(parseCoordinates('   ')).toBeNull();
  });

  it('returns null for city name (not coordinates)', () => {
    // City names should not be parsed as coordinates
    expect(parseCoordinates('New York')).toBeNull();
  });

  it('returns null for single number', () => {
    expect(parseCoordinates('40.7128')).toBeNull();
  });

  // --- Edge values ---

  it('parses "0, 0" (null island)', () => {
    const result = parseCoordinates('0, 0');
    expect(result).toEqual({ latitude: 0, longitude: 0 });
  });

  it('parses "90, 180" (extreme valid coordinates)', () => {
    const result = parseCoordinates('90, 180');
    expect(result).toEqual({ latitude: 90, longitude: 180 });
  });

  it('parses "-90, -180" (opposite extreme)', () => {
    const result = parseCoordinates('-90, -180');
    expect(result).toEqual({ latitude: -90, longitude: -180 });
  });
});
