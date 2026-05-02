export type SunSign =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

const RANGES: Array<{
  sign: SunSign;
  from: [number, number];
  to: [number, number];
}> = [
  { sign: 'Capricorn', from: [12, 22], to: [1, 19] },
  { sign: 'Aquarius', from: [1, 20], to: [2, 18] },
  { sign: 'Pisces', from: [2, 19], to: [3, 20] },
  { sign: 'Aries', from: [3, 21], to: [4, 19] },
  { sign: 'Taurus', from: [4, 20], to: [5, 20] },
  { sign: 'Gemini', from: [5, 21], to: [6, 20] },
  { sign: 'Cancer', from: [6, 21], to: [7, 22] },
  { sign: 'Leo', from: [7, 23], to: [8, 22] },
  { sign: 'Virgo', from: [8, 23], to: [9, 22] },
  { sign: 'Libra', from: [9, 23], to: [10, 22] },
  { sign: 'Scorpio', from: [10, 23], to: [11, 21] },
  { sign: 'Sagittarius', from: [11, 22], to: [12, 21] },
];

export function sunSignFromDate(input: string | Date): SunSign | null {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return null;
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  for (const { sign, from, to } of RANGES) {
    const [fromM, fromD] = from;
    const [toM, toD] = to;
    if (fromM === toM) {
      if (month === fromM && day >= fromD && day <= toD) return sign;
    } else if (fromM > toM) {
      if ((month === fromM && day >= fromD) || (month === toM && day <= toD)) {
        return sign;
      }
    } else {
      if (
        (month === fromM && day >= fromD) ||
        (month === toM && day <= toD) ||
        (month > fromM && month < toM)
      ) {
        return sign;
      }
    }
  }
  return null;
}
