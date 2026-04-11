import { AstroTime, e_tilt, Observer, SiderealTime } from 'astronomy-engine';
import { getZodiacSign, formatDegree } from './astrology';

export type HouseSystem =
  | 'whole-sign'
  | 'placidus'
  | 'koch'
  | 'porphyry'
  | 'alcabitius';

export type HouseCusp = {
  house: number;
  sign: string;
  degree: number;
  minute: number;
  eclipticLongitude: number;
};

function normalizeDegrees(deg: number): number {
  let normalized = deg % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

function degreesToRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radiansToDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

function sinFromDegrees(deg: number): number {
  return Math.sin(degreesToRadians(deg));
}

function cosFromDegrees(deg: number): number {
  return Math.cos(degreesToRadians(deg));
}

function tanFromDegrees(deg: number): number {
  return Math.tan(degreesToRadians(deg));
}

function arccot(value: number): number {
  return Math.atan(1 / value);
}

function dateFromJulianDay(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

const VERY_SMALL = 1 / 3600;
const VERY_SMALL_PLAC_ITER = 1 / 360000;

function getHouseContext(observer: Observer, jd: number) {
  const astroTime = new AstroTime(dateFromJulianDay(jd));
  const obliquity = e_tilt(astroTime).tobl;
  const rightAscensionMC = normalizeDegrees(
    (SiderealTime(astroTime) + observer.longitude / 15) * 15,
  );

  return {
    rightAscensionMC,
    obliquity,
    latitude: observer.latitude,
  };
}

function lonToRA(lonDeg: number, epsDeg: number): number {
  return normalizeDegrees(
    radiansToDegrees(
      Math.atan2(
        Math.sin(degreesToRadians(lonDeg)) * Math.cos(degreesToRadians(epsDeg)),
        Math.cos(degreesToRadians(lonDeg)),
      ),
    ),
  );
}

function lonToDecl(lonDeg: number, epsDeg: number): number {
  return radiansToDegrees(
    Math.asin(
      Math.sin(degreesToRadians(epsDeg)) * Math.sin(degreesToRadians(lonDeg)),
    ),
  );
}

function asc2(x: number, f: number, sine: number, cose: number): number {
  let ass = -tanFromDegrees(f) * sine + cose * cosFromDegrees(x);

  if (Math.abs(ass) < VERY_SMALL) ass = 0;

  const sinx = Math.abs(sinFromDegrees(x)) < VERY_SMALL ? 0 : sinFromDegrees(x);

  if (sinx === 0) {
    ass = ass < 0 ? -VERY_SMALL : VERY_SMALL;
  } else if (ass === 0) {
    ass = sinx < 0 ? -90 : 90;
  } else {
    ass = radiansToDegrees(Math.atan(sinx / ass));
  }

  if (ass < 0) ass = 180 + ass;
  return ass;
}

function asc1(x1: number, f: number, sine: number, cose: number): number {
  const normalized = normalizeDegrees(x1);
  const quadrant = Math.floor(normalized / 90) + 1;
  if (Math.abs(90 - f) < VERY_SMALL) return 180;
  if (Math.abs(90 + f) < VERY_SMALL) return 0;

  let ass: number;
  if (quadrant === 1) {
    ass = asc2(normalized, f, sine, cose);
  } else if (quadrant === 2) {
    ass = 180 - asc2(180 - normalized, -f, sine, cose);
  } else if (quadrant === 3) {
    ass = 180 + asc2(normalized - 180, -f, sine, cose);
  } else {
    ass = 360 - asc2(360 - normalized, f, sine, cose);
  }

  ass = normalizeDegrees(ass);
  if (Math.abs(ass - 90) < VERY_SMALL) ass = 90;
  if (Math.abs(ass - 180) < VERY_SMALL) ass = 180;
  if (Math.abs(ass - 270) < VERY_SMALL) ass = 270;
  if (Math.abs(ass - 360) < VERY_SMALL) ass = 0;
  return ass;
}

function raToLon(raDeg: number, epsDeg: number): number {
  let lon = radiansToDegrees(
    Math.atan2(
      Math.tan(degreesToRadians(raDeg)),
      Math.cos(degreesToRadians(epsDeg)),
    ),
  );
  if (raDeg > 90 && raDeg <= 270) lon += 180;
  return normalizeDegrees(lon);
}

function shouldMod180(prevCusp: number, currentCusp: number): boolean {
  if (currentCusp < prevCusp) {
    if (Math.abs(currentCusp - prevCusp) >= 180) return false;
    return true;
  }
  if (prevCusp < currentCusp) {
    if (currentCusp - prevCusp < 180) return false;
    return true;
  }
  return false;
}

function buildCuspsFromQuadrants(args: {
  ascendant: number;
  midheaven: number;
  c2: number;
  c3: number;
  c11: number;
  c12: number;
}): HouseCusp[] {
  const c1 = normalizeDegrees(args.ascendant);
  const c4 = normalizeDegrees(args.midheaven + 180);
  const c10 = normalizeDegrees(args.midheaven);
  const c7 = normalizeDegrees(args.ascendant + 180);
  const c5 = normalizeDegrees(args.c11 + 180);
  const c6 = normalizeDegrees(args.c12 + 180);
  const c8 = normalizeDegrees(args.c2 + 180);
  const c9 = normalizeDegrees(args.c3 + 180);

  const firstCusp = c1;
  const secondCusp = shouldMod180(c1, args.c2)
    ? normalizeDegrees(args.c2 + 180)
    : normalizeDegrees(args.c2);
  const thirdCusp = shouldMod180(c1, args.c3)
    ? normalizeDegrees(args.c3 + 180)
    : normalizeDegrees(args.c3);
  const fourthCusp = c4;
  const fifthCusp = shouldMod180(c4, c5) ? normalizeDegrees(c5 + 180) : c5;
  const sixthCusp = shouldMod180(c4, c6) ? normalizeDegrees(c6 + 180) : c6;
  const seventhCusp = c7;
  const eighthCusp = shouldMod180(c7, c8) ? normalizeDegrees(c8 + 180) : c8;
  const ninthCusp = shouldMod180(c7, c9) ? normalizeDegrees(c9 + 180) : c9;
  const tenthCusp = c10;
  const eleventhCusp = shouldMod180(c10, args.c11)
    ? normalizeDegrees(args.c11 + 180)
    : normalizeDegrees(args.c11);
  const twelfthCusp = shouldMod180(c10, args.c12)
    ? normalizeDegrees(args.c12 + 180)
    : normalizeDegrees(args.c12);

  return toHouseCusps([
    firstCusp,
    secondCusp,
    thirdCusp,
    fourthCusp,
    fifthCusp,
    sixthCusp,
    seventhCusp,
    eighthCusp,
    ninthCusp,
    tenthCusp,
    eleventhCusp,
    twelfthCusp,
  ]);
}

function toHouseCusps(houseLongitudes: number[]): HouseCusp[] {
  return houseLongitudes.map((cuspLongitude, index) => {
    const normalized = normalizeDegrees(cuspLongitude);
    const sign = getZodiacSign(normalized);
    const formatted = formatDegree(normalized);

    return {
      house: index + 1,
      sign,
      degree: formatted.degree,
      minute: formatted.minute,
      eclipticLongitude: normalized,
    };
  });
}

/**
 * Whole-sign houses (30° per house starting from Ascendant sign)
 */
export function calculateWholeSigHouses(
  ascendantLongitude: number,
): HouseCusp[] {
  const ascSign = Math.floor(normalizeDegrees(ascendantLongitude) / 30);
  const cusps = Array.from({ length: 12 }, (_, i) => ((ascSign + i) % 12) * 30);
  return toHouseCusps(cusps);
}

/**
 * Placidus houses
 */
export function calculatePlacidusHouses(
  ascendantLong: number,
  mcLong: number,
  observer: Observer,
  jd: number,
): HouseCusp[] {
  const { rightAscensionMC, obliquity, latitude } = getHouseContext(
    observer,
    jd,
  );
  const asc = normalizeDegrees(ascendantLong);
  const mc = normalizeDegrees(mcLong);
  const sine = Math.sin(degreesToRadians(obliquity));
  const cose = Math.cos(degreesToRadians(obliquity));
  const tane = Math.tan(degreesToRadians(obliquity));
  const tanfi = tanFromDegrees(latitude);

  if (Math.abs(latitude) >= 90 - obliquity) {
    return calculatePorphyryHouses(ascendantLong, mcLong, observer, jd);
  }

  const a = radiansToDegrees(Math.asin(tanfi * tane));
  const fh1 = radiansToDegrees(Math.atan(sinFromDegrees(a / 3) / tane));
  const fh2 = radiansToDegrees(Math.atan(sinFromDegrees((a * 2) / 3) / tane));

  const placidusHouse = (
    rectasc: number,
    divisor: number,
    poleHeight: number,
  ): number => {
    let tant = tanFromDegrees(
      radiansToDegrees(
        Math.asin(
          sine *
            Math.sin(degreesToRadians(asc1(rectasc, poleHeight, sine, cose))),
        ),
      ),
    );
    if (Math.abs(tant) < VERY_SMALL) {
      return normalizeDegrees(rectasc);
    }

    let cusp = asc1(
      rectasc,
      radiansToDegrees(
        Math.atan(
          sinFromDegrees(radiansToDegrees(Math.asin(tanfi * tant)) / divisor) /
            tant,
        ),
      ),
      sine,
      cose,
    );

    let prev = 0;
    for (let i = 0; i < 100; i += 1) {
      tant = tanFromDegrees(
        radiansToDegrees(Math.asin(sine * Math.sin(degreesToRadians(cusp)))),
      );
      if (Math.abs(tant) < VERY_SMALL) {
        return normalizeDegrees(rectasc);
      }
      const nextPole = radiansToDegrees(
        Math.atan(
          sinFromDegrees(radiansToDegrees(Math.asin(tanfi * tant)) / divisor) /
            tant,
        ),
      );
      prev = cusp;
      cusp = asc1(rectasc, nextPole, sine, cose);
      if (
        i > 1 &&
        Math.abs(((cusp - prev + 180) % 360) - 180) < VERY_SMALL_PLAC_ITER
      ) {
        break;
      }
    }
    return normalizeDegrees(cusp);
  };

  const h11 = placidusHouse(normalizeDegrees(30 + rightAscensionMC), 3, fh1);
  const h12 = placidusHouse(normalizeDegrees(60 + rightAscensionMC), 1.5, fh2);
  const h2 = placidusHouse(normalizeDegrees(120 + rightAscensionMC), 1.5, fh2);
  const h3 = placidusHouse(normalizeDegrees(150 + rightAscensionMC), 3, fh1);

  return toHouseCusps([
    asc,
    h2,
    h3,
    normalizeDegrees(mc + 180),
    normalizeDegrees(h11 + 180),
    normalizeDegrees(h12 + 180),
    normalizeDegrees(asc + 180),
    normalizeDegrees(h2 + 180),
    normalizeDegrees(h3 + 180),
    mc,
    h11,
    h12,
  ]);
}

/**
 * Koch houses
 */
export function calculateKochHouses(
  ascendantLong: number,
  mcLong: number,
  observer?: Observer,
  jd?: number,
): HouseCusp[] {
  const context = getHouseContext(observer ?? new Observer(0, 0, 0), jd ?? 0);
  const asc = normalizeDegrees(ascendantLong);
  const mc = normalizeDegrees(mcLong);
  const th = context.rightAscensionMC;
  const fi = context.latitude;
  const sine = Math.sin(degreesToRadians(context.obliquity));
  const cose = Math.cos(degreesToRadians(context.obliquity));
  const tanfi = tanFromDegrees(context.latitude);
  if (Math.abs(fi) >= 90 - context.obliquity) {
    return calculatePorphyryHouses(ascendantLong, mcLong, observer, jd);
  }
  let sina =
    (Math.sin(degreesToRadians(mc)) * sine) / Math.cos(degreesToRadians(fi));
  sina = Math.max(-1, Math.min(1, sina));
  const cosa = Math.sqrt(1 - sina * sina);
  const c = radiansToDegrees(Math.atan(tanfi / cosa));
  const ad3 =
    radiansToDegrees(Math.asin(Math.sin(degreesToRadians(c)) * sina)) / 3;

  const h11 = asc1(normalizeDegrees(th + 30 - 2 * ad3), fi, sine, cose);
  const h12 = asc1(normalizeDegrees(th + 60 - ad3), fi, sine, cose);
  const h2 = asc1(normalizeDegrees(th + 120 + ad3), fi, sine, cose);
  const h3 = asc1(normalizeDegrees(th + 150 + 2 * ad3), fi, sine, cose);

  return toHouseCusps([
    asc,
    h2,
    h3,
    normalizeDegrees(mc + 180),
    normalizeDegrees(h11 + 180),
    normalizeDegrees(h12 + 180),
    normalizeDegrees(asc + 180),
    normalizeDegrees(h2 + 180),
    normalizeDegrees(h3 + 180),
    mc,
    h11,
    h12,
  ]);
}

/**
 * Porphyry houses
 */
export function calculatePorphyryHouses(
  ascendantLong: number,
  mcLong: number,
  observer?: Observer,
  jd?: number,
): HouseCusp[] {
  const asc = normalizeDegrees(ascendantLong);
  const mc = normalizeDegrees(mcLong);
  const ic = normalizeDegrees(mc + 180);
  const desc = normalizeDegrees(asc + 180);

  const q1 = (ic - asc + 360) % 360;
  const q2 = (desc - ic + 360) % 360;
  const q3 = (mc - desc + 360) % 360;
  const q4 = (asc - mc + 360) % 360;

  return toHouseCusps([
    asc,
    normalizeDegrees(asc + q1 / 3),
    normalizeDegrees(asc + (q1 * 2) / 3),
    ic,
    normalizeDegrees(ic + q2 / 3),
    normalizeDegrees(ic + (q2 * 2) / 3),
    desc,
    normalizeDegrees(desc + q3 / 3),
    normalizeDegrees(desc + (q3 * 2) / 3),
    mc,
    normalizeDegrees(mc + q4 / 3),
    normalizeDegrees(mc + (q4 * 2) / 3),
  ]);
}

/**
 * Alcabitius houses
 */
export function calculateAlcabitiusHouses(
  ascendantLong: number,
  mcLong: number,
  observer?: Observer,
  jd?: number,
): HouseCusp[] {
  const context = getHouseContext(observer ?? new Observer(0, 0, 0), jd ?? 0);
  const asc = normalizeDegrees(ascendantLong);
  const mc = normalizeDegrees(mcLong);
  const sine = Math.sin(degreesToRadians(context.obliquity));
  const cose = Math.cos(degreesToRadians(context.obliquity));
  const tanfi = tanFromDegrees(context.latitude);
  let ascFix = asc;
  let acmc = normalizeDegrees(ascFix - mc);
  if (acmc > 180) acmc -= 360;
  if (acmc < 0) {
    ascFix = normalizeDegrees(asc + 180);
    acmc = normalizeDegrees(ascFix - mc);
  }
  const dek = radiansToDegrees(
    Math.asin(Math.sin(degreesToRadians(ascFix)) * sine),
  );
  let r = -tanfi * tanFromDegrees(dek);
  r = Math.max(-1, Math.min(1, r));
  const sda = radiansToDegrees(Math.acos(r));
  const sna = 180 - sda;
  const sd3 = sda / 3;
  const sn3 = sna / 3;
  const c11 = asc1(
    normalizeDegrees(context.rightAscensionMC + sd3),
    0,
    sine,
    cose,
  );
  const c12 = asc1(
    normalizeDegrees(context.rightAscensionMC + 2 * sd3),
    0,
    sine,
    cose,
  );
  const c2 = asc1(
    normalizeDegrees(context.rightAscensionMC + 180 - 2 * sn3),
    0,
    sine,
    cose,
  );
  const c3 = asc1(
    normalizeDegrees(context.rightAscensionMC + 180 - sn3),
    0,
    sine,
    cose,
  );

  return toHouseCusps([
    ascFix,
    c2,
    c3,
    normalizeDegrees(mc + 180),
    normalizeDegrees(c11 + 180),
    normalizeDegrees(c12 + 180),
    normalizeDegrees(ascFix + 180),
    normalizeDegrees(c2 + 180),
    normalizeDegrees(c3 + 180),
    mc,
    c11,
    c12,
  ]);
}

export function calculateHouses(
  system: HouseSystem,
  ascendantLong: number,
  mcLong: number,
  observer?: Observer,
  jd?: number,
): HouseCusp[] {
  switch (system) {
    case 'placidus':
      if (observer && typeof jd === 'number') {
        return calculatePlacidusHouses(ascendantLong, mcLong, observer, jd);
      }
      return calculatePlacidusHouses(
        ascendantLong,
        mcLong,
        new Observer(0, 0, 0),
        0,
      );
    case 'koch':
      return calculateKochHouses(ascendantLong, mcLong, observer, jd);
    case 'porphyry':
      return calculatePorphyryHouses(ascendantLong, mcLong, observer, jd);
    case 'alcabitius':
      return calculateAlcabitiusHouses(ascendantLong, mcLong, observer, jd);
    case 'whole-sign':
    default:
      return calculateWholeSigHouses(ascendantLong);
  }
}
