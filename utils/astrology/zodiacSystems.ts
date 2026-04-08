/**
 * Zodiac System Conversions
 * Supports tropical, sidereal (Lahiri), and equatorial coordinate systems
 */

export type ZodiacSystem = 'tropical' | 'sidereal' | 'equatorial';

// Ayanamsha offsets (as of 2025)
export const AYANAMSHA_LAHIRI = 24.0; // Lahiri ayanamsha (most common in Vedic astrology)

// Obliquity of ecliptic (angle between ecliptic plane and celestial equator)
// Constant value in degrees (doesn't change significantly over human timescales)
const OBLIQUITY_ECLIPTIC_DEG = 23.4392;

/**
 * Convert body ecliptic longitude to tropical zodiac
 * (Identity function - tropical is the base system)
 */
export function convertToTropical(longitude: number): number {
  return longitude;
}

/**
 * Convert body ecliptic longitude to sidereal zodiac
 * Subtracts ayanamsha offset from tropical longitude
 */
export function convertToSidereal(
  longitude: number,
  ayanamsha: number = AYANAMSHA_LAHIRI,
): number {
  let sidereal = longitude - ayanamsha;
  // Normalize to 0-360 range
  while (sidereal < 0) sidereal += 360;
  while (sidereal >= 360) sidereal -= 360;
  return sidereal;
}

/**
 * Convert ecliptic coordinates to equatorial coordinates
 * Performs coordinate transformation using obliquity of ecliptic
 *
 * Given: ecliptic longitude (λ), ecliptic latitude (β)
 * Returns: right ascension (α) in degrees
 *
 * This is a simplified conversion focusing on RA (similar to zodiacal longitude)
 * Full equatorial coords would also include declination
 */
export function convertToEquatorial(
  eclipticLongitude: number,
  eclipticLatitude: number = 0,
): number {
  // Get obliquity of ecliptic in radians (angle between ecliptic and celestial equator)
  const obliquityRadians = OBLIQUITY_ECLIPTIC_DEG * (Math.PI / 180);

  // Convert input to radians
  const λ = eclipticLongitude * (Math.PI / 180);
  const β = eclipticLatitude * (Math.PI / 180);

  // Convert ecliptic to cartesian coordinates
  const x_ecl = Math.cos(β) * Math.cos(λ);
  const y_ecl = Math.cos(β) * Math.sin(λ);
  const z_ecl = Math.sin(β);

  // Rotate by obliquity of ecliptic to get equatorial coordinates
  const x_eq = x_ecl;
  const y_eq =
    y_ecl * Math.cos(obliquityRadians) - z_ecl * Math.sin(obliquityRadians);
  const z_eq =
    y_ecl * Math.sin(obliquityRadians) + z_ecl * Math.cos(obliquityRadians);

  // Convert back to spherical coordinates (RA = right ascension)
  let rightAscension = Math.atan2(y_eq, x_eq) * (180 / Math.PI);

  // Normalize to 0-360 range
  if (rightAscension < 0) rightAscension += 360;

  return rightAscension;
}

/**
 * Get sign and degree for a given ecliptic longitude in tropical zodiac
 * Returns object with sign name, sign number (0-11), and degree in sign
 */
export function getLongitudeInTropicalSign(longitude: number): {
  sign: string;
  signNumber: number;
  degreeInSign: number;
} {
  const signs = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];

  // Normalize longitude to 0-360
  let normalized = longitude % 360;
  if (normalized < 0) normalized += 360;

  const signNumber = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;

  return {
    sign: signs[signNumber],
    signNumber,
    degreeInSign,
  };
}

/**
 * Get sign and degree for a given longitude in sidereal zodiac
 */
export function getLongitudeInSiderealSign(
  tropicalLongitude: number,
  ayanamsha: number = AYANAMSHA_LAHIRI,
): {
  sign: string;
  signNumber: number;
  degreeInSign: number;
} {
  const siderealLongitude = convertToSidereal(tropicalLongitude, ayanamsha);
  return getLongitudeInTropicalSign(siderealLongitude);
}

/**
 * Dispatcher function to convert body longitude based on zodiac system
 * Used by BirthChart component to display correct zodiac for selected system
 */
export function convertLongitudeToZodiacSystem(
  tropicalLongitude: number,
  eclipticLatitude: number,
  system: ZodiacSystem,
): number {
  switch (system) {
    case 'tropical':
      return convertToTropical(tropicalLongitude);
    case 'sidereal':
      return convertToSidereal(tropicalLongitude);
    case 'equatorial':
      return convertToEquatorial(tropicalLongitude, eclipticLatitude);
    default:
      return tropicalLongitude;
  }
}

/**
 * Get sign for any zodiac system
 */
export function getSignForZodiacSystem(
  tropicalLongitude: number,
  system: ZodiacSystem,
): {
  sign: string;
  signNumber: number;
  degreeInSign: number;
} {
  switch (system) {
    case 'tropical':
      return getLongitudeInTropicalSign(tropicalLongitude);
    case 'sidereal':
      return getLongitudeInSiderealSign(tropicalLongitude);
    case 'equatorial':
      // Equatorial doesn't use zodiac signs, but return as-is for consistency
      const equatorialLong = convertToEquatorial(tropicalLongitude);
      return getLongitudeInTropicalSign(equatorialLong);
    default:
      return getLongitudeInTropicalSign(tropicalLongitude);
  }
}
