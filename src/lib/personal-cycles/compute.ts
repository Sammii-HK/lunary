/**
 * Personal Cycles - pure deterministic compute layer.
 *
 * Five interlocking life cycles, all derived from a birth date + a "now" date
 * (and, for lunation, current Sun/Moon ecliptic longitudes from
 * `getRealPlanetaryPositions`). No LLM. No randomness. No I/O.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TROPICAL_YEAR_DAYS = 365.2425;
const MS_PER_YEAR = TROPICAL_YEAR_DAYS * MS_PER_DAY;

/** Saturn's sidereal orbital period - astronomers use 29.4577 years. */
export const SATURN_PERIOD_YEARS = 29.4577;
/** Jupiter's sidereal orbital period. */
export const JUPITER_PERIOD_YEARS = 11.8618;
/** Synodic month - average new-moon-to-new-moon. */
export const SYNODIC_MONTH_DAYS = 29.5306;

const PROFECTION_HOUSE_THEMES: Record<number, { theme: string; sign: string }> =
  {
    1: { theme: 'self, body, fresh starts', sign: 'Aries' },
    2: { theme: 'money, values, resources', sign: 'Taurus' },
    3: { theme: 'siblings, study, neighbourhood', sign: 'Gemini' },
    4: { theme: 'home, roots, family', sign: 'Cancer' },
    5: { theme: 'creativity, romance, play', sign: 'Leo' },
    6: { theme: 'work, health, daily routines', sign: 'Virgo' },
    7: { theme: 'partnerships and contracts', sign: 'Libra' },
    8: { theme: 'shared resources, deep change', sign: 'Scorpio' },
    9: { theme: 'travel, learning, meaning', sign: 'Sagittarius' },
    10: { theme: 'career, status, public role', sign: 'Capricorn' },
    11: { theme: 'community, friends, hopes', sign: 'Aquarius' },
    12: { theme: 'rest, retreat, hidden work', sign: 'Pisces' },
  };

const SIGN_RULER: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface SaturnReturnResult {
  progressPct: number;
  nextExactDate: string;
  daysUntilNext: number;
  returnNumber: number;
  narrative: string;
}

export interface JupiterReturnResult {
  progressPct: number;
  nextExactDate: string;
  daysUntilNext: number;
  returnNumber: number;
  narrative: string;
}

export interface ProfectionYearResult {
  yearOfLife: number;
  activeHouse: number;
  ruler: string;
  themeOneLiner: string;
}

export interface LunationResult {
  phase: LunationPhase;
  illuminationPct: number;
  daysSinceNew: number;
  daysUntilFull: number;
}

export type LunationPhase =
  | 'new'
  | 'waxing crescent'
  | 'first quarter'
  | 'waxing gibbous'
  | 'full'
  | 'waning gibbous'
  | 'last quarter'
  | 'waning crescent';

export interface SolarReturnResult {
  daysUntilNextBirthday: number;
  ageStarting: number;
  currentReturnDate: string;
}

export interface CycleBundle {
  saturn: SaturnReturnResult;
  jupiter: JupiterReturnResult;
  profection: ProfectionYearResult;
  lunation: LunationResult;
  solar: SolarReturnResult;
}

// ---------------------------------------------------------------------------
// Date helpers (UTC throughout - birthday is a calendar date, not a moment)
// ---------------------------------------------------------------------------

function toDate(d: Date | string): Date {
  if (d instanceof Date) return d;
  // YYYY-MM-DD becomes UTC midnight; full ISO is parsed as-is.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (m) {
    return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  }
  return new Date(d);
}

function diffDays(a: Date, b: Date): number {
  return (a.getTime() - b.getTime()) / MS_PER_DAY;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Birthday anniversary in a given calendar year, clamping Feb-29. */
function anniversaryInYear(birth: Date, year: number): Date {
  const m = birth.getUTCMonth();
  const day = birth.getUTCDate();
  const cand = new Date(Date.UTC(year, m, day));
  if (cand.getUTCMonth() !== m) {
    return new Date(Date.UTC(year, m + 1, 0));
  }
  return cand;
}

// ---------------------------------------------------------------------------
// Saturn return
// ---------------------------------------------------------------------------

/**
 * Saturn returns to its natal position roughly every 29.46 years.
 * We return % progress through the *current* Saturn cycle plus countdown to
 * the next exact return.
 */
export function computeSaturnReturn({
  birthDate,
  now,
}: {
  birthDate: Date | string;
  now: Date;
}): SaturnReturnResult {
  const birth = toDate(birthDate);
  const ageYears = (now.getTime() - birth.getTime()) / MS_PER_YEAR;
  const cycleLen = SATURN_PERIOD_YEARS;

  // Which Saturn return are we currently approaching? Returns are at
  // ageYears = cycleLen * n for n = 1, 2, 3...
  const cyclesElapsed = ageYears / cycleLen;
  const nextReturnNumber = Math.max(1, Math.ceil(cyclesElapsed));
  const cycleIndex = nextReturnNumber - 1;
  const cycleStartYears = cycleIndex * cycleLen;
  const progressPct = Math.max(
    0,
    Math.min(100, ((ageYears - cycleStartYears) / cycleLen) * 100),
  );

  const nextExact = new Date(
    birth.getTime() + nextReturnNumber * cycleLen * MS_PER_YEAR,
  );
  const daysUntilNext = Math.max(0, Math.round(diffDays(nextExact, now)));

  let narrative: string;
  if (nextReturnNumber === 1) {
    if (progressPct < 30) {
      narrative = 'Building the foundation Saturn will test.';
    } else if (progressPct < 70) {
      narrative = 'Mid-cycle: pressure rising, structure forming.';
    } else if (progressPct < 95) {
      narrative = 'First Saturn return approaches - the rebuild years.';
    } else {
      narrative = 'First Saturn return is happening now. Rebuild on purpose.';
    }
  } else if (nextReturnNumber === 2) {
    if (progressPct < 95) {
      narrative = 'Post-first-return chapter: living what you chose at 29.';
    } else {
      narrative = 'Second Saturn return - legacy and authority crystallise.';
    }
  } else {
    narrative = 'Late-life Saturn return: distillation and elder wisdom.';
  }

  return {
    progressPct: round1(progressPct),
    nextExactDate: isoDate(nextExact),
    daysUntilNext,
    returnNumber: nextReturnNumber,
    narrative,
  };
}

// ---------------------------------------------------------------------------
// Jupiter return
// ---------------------------------------------------------------------------

export function computeJupiterReturn({
  birthDate,
  now,
}: {
  birthDate: Date | string;
  now: Date;
}): JupiterReturnResult {
  const birth = toDate(birthDate);
  const ageYears = (now.getTime() - birth.getTime()) / MS_PER_YEAR;
  const cycleLen = JUPITER_PERIOD_YEARS;

  const cyclesElapsed = ageYears / cycleLen;
  const nextReturnNumber = Math.max(1, Math.ceil(cyclesElapsed));
  const cycleStartYears = (nextReturnNumber - 1) * cycleLen;
  const progressPct = Math.max(
    0,
    Math.min(100, ((ageYears - cycleStartYears) / cycleLen) * 100),
  );

  const nextExact = new Date(
    birth.getTime() + nextReturnNumber * cycleLen * MS_PER_YEAR,
  );
  const daysUntilNext = Math.max(0, Math.round(diffDays(nextExact, now)));

  let narrative: string;
  if (progressPct < 30) {
    narrative = 'Early cycle - plant seeds, the harvest is years away.';
  } else if (progressPct < 70) {
    narrative = 'Mid Jupiter cycle: things you started are bearing fruit.';
  } else if (progressPct < 95) {
    narrative = 'Jupiter return on the horizon - expansion, luck, leap years.';
  } else {
    narrative = 'Jupiter return active: the lucky window is open. Use it.';
  }

  return {
    progressPct: round1(progressPct),
    nextExactDate: isoDate(nextExact),
    daysUntilNext,
    returnNumber: nextReturnNumber,
    narrative,
  };
}

// ---------------------------------------------------------------------------
// Annual profection
// ---------------------------------------------------------------------------

/**
 * Annual profection: each year of life "activates" one of the 12 houses,
 * starting with the 1st house in the year of birth (year-of-life 1).
 *
 *   houseNumber = ((yearOfLife - 1) % 12) + 1
 *
 * The "year of life" turns over on each birthday.
 */
export function computeProfectionYear({
  birthDate,
  now,
}: {
  birthDate: Date | string;
  now: Date;
}): ProfectionYearResult {
  const birth = toDate(birthDate);

  const thisYearAnniv = anniversaryInYear(birth, now.getUTCFullYear());
  const lastBirthdayYear =
    now >= thisYearAnniv ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  const ageInCompletedYears = lastBirthdayYear - birth.getUTCFullYear();
  const yearOfLife = ageInCompletedYears + 1;

  const activeHouse = ((yearOfLife - 1) % 12) + 1;
  const meta = PROFECTION_HOUSE_THEMES[activeHouse];
  const ruler = SIGN_RULER[meta.sign] ?? 'Unknown';
  const themeOneLiner = `Year of ${meta.theme} - ${meta.sign}, ruled by ${ruler}.`;

  return { yearOfLife, activeHouse, ruler, themeOneLiner };
}

// ---------------------------------------------------------------------------
// Lunation
// ---------------------------------------------------------------------------

/**
 * Pure lunation phase from Sun and Moon ecliptic longitudes.
 *
 * Phase angle = (moonLon - sunLon) mod 360.
 *   0 deg     - new
 *   90 deg    - first quarter
 *   180 deg   - full
 *   270 deg   - last quarter
 *
 * Illumination = (1 - cos(phaseAngle)) / 2  (canonical formula).
 */
export function computeLunation({
  now,
  sunLon,
  moonLon,
}: {
  now: Date;
  sunLon: number;
  moonLon: number;
}): LunationResult {
  const phaseAngle = (((moonLon - sunLon) % 360) + 360) % 360;
  const phaseFraction = phaseAngle / 360;

  const phase = phaseFromAngle(phaseAngle);
  const illuminationPct =
    ((1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2) * 100;

  const daysSinceNew = phaseFraction * SYNODIC_MONTH_DAYS;
  const fullFraction = 0.5;
  let daysUntilFull: number;
  if (phaseFraction <= fullFraction) {
    daysUntilFull = (fullFraction - phaseFraction) * SYNODIC_MONTH_DAYS;
  } else {
    daysUntilFull = (1 - phaseFraction + fullFraction) * SYNODIC_MONTH_DAYS;
  }

  // `now` is intentionally part of the API for future tide-style refinements.
  void now;

  return {
    phase,
    illuminationPct: round1(illuminationPct),
    daysSinceNew: round1(daysSinceNew),
    daysUntilFull: round1(daysUntilFull),
  };
}

function phaseFromAngle(angle: number): LunationPhase {
  if (angle < 22.5 || angle >= 337.5) return 'new';
  if (angle < 67.5) return 'waxing crescent';
  if (angle < 112.5) return 'first quarter';
  if (angle < 157.5) return 'waxing gibbous';
  if (angle < 202.5) return 'full';
  if (angle < 247.5) return 'waning gibbous';
  if (angle < 292.5) return 'last quarter';
  return 'waning crescent';
}

// ---------------------------------------------------------------------------
// Solar return
// ---------------------------------------------------------------------------

/**
 * Solar return = your astrological birthday - when the transiting Sun
 * returns to its natal position. Calendar-anchored approximation here
 * (good to within a day for UI countdowns).
 */
export function computeSolarReturn({
  birthDate,
  now,
}: {
  birthDate: Date | string;
  now: Date;
}): SolarReturnResult {
  const birth = toDate(birthDate);

  const thisYear = anniversaryInYear(birth, now.getUTCFullYear());
  const isPastThisYear = now.getTime() > thisYear.getTime() + MS_PER_DAY * 0.5;
  const nextBirthday = isPastThisYear
    ? anniversaryInYear(birth, now.getUTCFullYear() + 1)
    : thisYear;

  const daysUntilNextBirthday = Math.max(
    0,
    Math.ceil(diffDays(nextBirthday, now)),
  );
  const ageStarting = nextBirthday.getUTCFullYear() - birth.getUTCFullYear();

  const currentReturnDate = isPastThisYear
    ? isoDate(thisYear)
    : isoDate(anniversaryInYear(birth, now.getUTCFullYear() - 1));

  return { daysUntilNextBirthday, ageStarting, currentReturnDate };
}

// ---------------------------------------------------------------------------
// Synthesis
// ---------------------------------------------------------------------------

export function summariseCycles(cycles: CycleBundle): string {
  const { saturn, jupiter, profection, lunation, solar } = cycles;

  const saturnLine =
    saturn.daysUntilNext < 365
      ? `Saturn return #${saturn.returnNumber} is ${saturn.daysUntilNext} days away - ${saturn.narrative.toLowerCase()}`
      : `You're ${saturn.progressPct.toFixed(0)}% through Saturn cycle #${saturn.returnNumber}, with ${Math.round(
          saturn.daysUntilNext / 365,
        )} years until the next return.`;

  const jupiterLine =
    jupiter.daysUntilNext < 365
      ? `Jupiter return on ${jupiter.nextExactDate} (${jupiter.daysUntilNext} days) - the lucky-leap window is opening.`
      : `Jupiter is ${jupiter.progressPct.toFixed(0)}% through cycle #${jupiter.returnNumber}.`;

  const profLine = `You're in your ${ordinal(profection.yearOfLife)} year of life: house ${profection.activeHouse} active, ruled by ${profection.ruler}. ${profection.themeOneLiner}`;

  const lunLine =
    lunation.daysUntilFull < 1
      ? `The Moon is full now - illumination peak.`
      : `The Moon is ${lunation.phase} (${lunation.illuminationPct.toFixed(0)}% illuminated), ${lunation.daysUntilFull.toFixed(0)} days from full.`;

  const solarLine =
    solar.daysUntilNextBirthday <= 1
      ? `Your solar return is happening - happy astrological birthday.`
      : `${solar.daysUntilNextBirthday} days until your solar return (you'll be ${solar.ageStarting}).`;

  return `${saturnLine} ${jupiterLine} ${profLine} ${lunLine} ${solarLine}`;
}

// ---------------------------------------------------------------------------
// Tiny utils
// ---------------------------------------------------------------------------

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}
