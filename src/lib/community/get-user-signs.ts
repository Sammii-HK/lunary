/**
 * Extract rising sign (Ascendant) and Sun sign from a birth chart JSON.
 *
 * Birth chart data is stored as `user_profiles.birth_chart` JSONB column
 * with an array of body entries like:
 *   { body: 'Ascendant', sign: 'Leo', ... }
 *   { body: 'Sun', sign: 'Aries', ... }
 */

interface BirthChartEntry {
  body?: string;
  sign?: string;
  [key: string]: unknown;
}

interface UserSigns {
  risingSign: string | null;
  sunSign: string | null;
  moonSign: string | null;
}

export function getUserSigns(
  birthChart: BirthChartEntry[] | null | undefined,
): UserSigns {
  if (!birthChart || !Array.isArray(birthChart)) {
    return { risingSign: null, sunSign: null, moonSign: null };
  }

  let risingSign: string | null = null;
  let sunSign: string | null = null;
  let moonSign: string | null = null;

  for (const entry of birthChart) {
    if (!entry?.body || !entry?.sign) continue;

    const body = entry.body.toLowerCase();
    if (body === 'ascendant' || body === 'rising') {
      risingSign = entry.sign;
    } else if (body === 'sun') {
      sunSign = entry.sign;
    } else if (body === 'moon') {
      moonSign = entry.sign;
    }

    if (risingSign && sunSign && moonSign) break;
  }

  return { risingSign, sunSign, moonSign };
}

/**
 * Convert a sign name to its slug form for community spaces.
 * e.g. signToSpaceSlug("Aries", "rising") -> "aries-rising"
 */
export function signToSpaceSlug(
  sign: string,
  placement: 'rising' | 'sun' | 'moon' = 'rising',
): string {
  return `${sign.toLowerCase()}-${placement}`;
}
