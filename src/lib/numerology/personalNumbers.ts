import dayjs from 'dayjs';
import { parseIsoDateOnly } from '@/lib/date-only';

export type PersonalNumerologyNumber = {
  number: number;
  meaning: string;
};

const reduceNumberWithMasters = (value: number): number => {
  while (value > 9 && value !== 11 && value !== 22 && value !== 33) {
    value = value
      .toString()
      .split('')
      .map(Number)
      .reduce((acc, digit) => acc + digit, 0);
  }
  return value;
};

const personalDayMeanings: Record<number, string> = {
  1: 'new beginnings and fresh momentum',
  2: 'cooperation, balance, and partnership',
  3: 'creativity, communication, and joy',
  4: 'stability, grounding, and practical focus',
  5: 'change, adventure, and adaptability',
  6: 'service-oriented energy and nurturing',
  7: 'reflection, inner work, and intuition',
  8: 'leadership, ambition, and authority',
  9: 'completion, release, and spiritual integration',
  11: 'master intuition and heightened awareness',
  22: 'realization of big-picture dreams through practical action',
  33: 'compassionate service and creative teaching',
};

const personalYearMeanings: Record<number, string> = {
  1: 'new beginnings, independence, and initiative',
  2: 'relationships, patience, and teamwork',
  3: 'creative expression, communication, and joy',
  4: 'discipline, structure, and foundation-building',
  5: 'freedom, exploration, and transformation',
  6: 'family, responsibility, and harmony',
  7: 'spiritual study, introspection, and wisdom',
  8: 'material success, authority, and manifestation',
  9: 'completion, release, and service',
  11: 'inspiration, illumination, and heightened intuition',
  22: 'master builder year with big vision made real',
  33: 'master teacher energy, compassion, and guidance',
};

export function getPersonalDayNumber(
  birthday: string,
  currentDate: dayjs.Dayjs,
): PersonalNumerologyNumber {
  const parsedBirth = parseIsoDateOnly(birthday);
  const birth = parsedBirth ? dayjs(parsedBirth) : dayjs(birthday);
  const currentYear = currentDate.year();
  const currentMonth = currentDate.month() + 1;
  const currentDay = currentDate.date();
  const birthMonth = birth.month() + 1;
  const birthDay = birth.date();

  const sum = birthMonth + birthDay + currentYear + currentMonth + currentDay;
  const number = reduceNumberWithMasters(sum);

  return {
    number,
    meaning:
      personalDayMeanings[number] || 'personal growth and transformation',
  };
}

export function getPersonalYearNumber(
  birthday: string,
  currentDate: dayjs.Dayjs,
): PersonalNumerologyNumber {
  const parsedBirth = parseIsoDateOnly(birthday);
  const birth = parsedBirth ? dayjs(parsedBirth) : dayjs(birthday);
  const currentYear = currentDate.year();
  const birthMonth = birth.month() + 1;
  const birthDay = birth.date();

  const sum = birthMonth + birthDay + currentYear;
  const number = reduceNumberWithMasters(sum);

  return {
    number,
    meaning: personalYearMeanings[number] || 'personal numerology energies',
  };
}
