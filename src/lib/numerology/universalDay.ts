import dayjs from 'dayjs';

/**
 * Universal Day Number — shared canonical implementation.
 *
 * Uses DDMMYYYY digit-sum method (matches HoroscopeView / HoroscopeWidget).
 * Reduces to a single digit unless it's a master number (11, 22, 33).
 */

const universalDayMeanings: Record<number, string> = {
  1: 'leadership energy and new beginnings',
  2: 'cooperation, balance, and partnership',
  3: 'creativity, communication, and joy',
  4: 'stability, grounding, and practical focus',
  5: 'change, adventure, and adaptability',
  6: 'nurturing, service, and harmony',
  7: 'reflection, inner work, and intuition',
  8: 'leadership, ambition, and authority',
  9: 'completion, release, and spiritual integration',
  11: 'master intuition and heightened awareness',
  22: 'realization of big-picture dreams through practical action',
  33: 'compassionate service and creative teaching',
};

function reduceToSingleOrMaster(value: number): number {
  while (value > 9 && value !== 11 && value !== 22 && value !== 33) {
    value = value
      .toString()
      .split('')
      .map(Number)
      .reduce((acc, digit) => acc + digit, 0);
  }
  return value;
}

export function getUniversalDayNumber(date: dayjs.Dayjs): {
  number: number;
  meaning: string;
} {
  const dateString = date.format('DDMMYYYY');
  let sum = 0;
  for (let i = 0; i < dateString.length; i++) {
    sum += parseInt(dateString[i]);
  }

  const number = reduceToSingleOrMaster(sum);

  return {
    number,
    meaning: universalDayMeanings[number] || 'transformative energy',
  };
}
