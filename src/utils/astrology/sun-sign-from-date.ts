/**
 * Deterministic Sun sign lookup from a birthday string or Date.
 *
 * Uses tropical zodiac cusp dates (e.g. Aries: Mar 21 – Apr 19). This is
 * date-only (no birth time, no location) and is intended for the
 * onboarding hook ("You're a Leo. Want to see your Moon and Rising?")
 * where we already have the user's birthday from signup but haven't yet
 * collected birth time / location for a full chart.
 *
 * For the canonical chart-driven Sun sign, use the birth chart data
 * (which is calculated server-side once birth time + location are
 * provided).
 */

const SIGN_CUSPS: Array<{ sign: string; end: [number, number] }> = [
  { sign: 'Capricorn', end: [1, 19] },
  { sign: 'Aquarius', end: [2, 18] },
  { sign: 'Pisces', end: [3, 20] },
  { sign: 'Aries', end: [4, 19] },
  { sign: 'Taurus', end: [5, 20] },
  { sign: 'Gemini', end: [6, 20] },
  { sign: 'Cancer', end: [7, 22] },
  { sign: 'Leo', end: [8, 22] },
  { sign: 'Virgo', end: [9, 22] },
  { sign: 'Libra', end: [10, 22] },
  { sign: 'Scorpio', end: [11, 21] },
  { sign: 'Sagittarius', end: [12, 21] },
  { sign: 'Capricorn', end: [12, 31] },
];

export function getSunSignFromMonthDay(month: number, day: number): string {
  for (const { sign, end } of SIGN_CUSPS) {
    if (month < end[0] || (month === end[0] && day <= end[1])) {
      return sign;
    }
  }
  return 'Capricorn';
}

/**
 * Accepts an ISO birthday string (YYYY-MM-DD) or any Date-parseable
 * string. Returns the Sun sign or null if the input can't be parsed.
 */
export function getSunSignFromBirthday(
  birthday: string | Date | null | undefined,
): string | null {
  if (!birthday) return null;

  let month: number;
  let day: number;

  if (typeof birthday === 'string') {
    // Match YYYY-MM-DD without timezone shifting issues
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthday);
    if (isoMatch) {
      month = Number(isoMatch[2]);
      day = Number(isoMatch[3]);
    } else {
      const parsed = new Date(birthday);
      if (Number.isNaN(parsed.getTime())) return null;
      month = parsed.getMonth() + 1;
      day = parsed.getDate();
    }
  } else {
    if (Number.isNaN(birthday.getTime())) return null;
    month = birthday.getMonth() + 1;
    day = birthday.getDate();
  }

  if (
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return getSunSignFromMonthDay(month, day);
}
