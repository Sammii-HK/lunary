// Numerology calculation functions
// Pythagorean numerology system

const PYTHAGOREAN: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  O: 6,
  P: 7,
  Q: 8,
  R: 9,
  S: 1,
  T: 2,
  U: 3,
  V: 4,
  W: 5,
  X: 6,
  Y: 7,
  Z: 8,
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const MASTER_NUMBERS = [11, 22, 33];

export interface CalculationResult {
  result: number;
  steps: string[];
  breakdown: string;
}

export function reduceToDigit(n: number, keepMaster = true): number {
  if (keepMaster && MASTER_NUMBERS.includes(n)) {
    return n;
  }

  while (n > 9 && !(keepMaster && MASTER_NUMBERS.includes(n))) {
    n = String(n)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit), 0);
  }

  return n;
}

export function letterToNumber(letter: string): number {
  return PYTHAGOREAN[letter.toUpperCase()] || 0;
}

export function calculateSoulUrge(fullName: string): CalculationResult {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  const vowels = cleanName.split('').filter((char) => VOWELS.includes(char));

  if (vowels.length === 0) {
    return { result: 0, steps: ['No vowels found in name'], breakdown: '' };
  }

  const vowelValues = vowels.map((v) => ({ letter: v, value: PYTHAGOREAN[v] }));
  const sum = vowelValues.reduce((acc, v) => acc + v.value, 0);
  const result = reduceToDigit(sum);

  const steps: string[] = [
    `Full name: ${fullName}`,
    `Vowels extracted: ${vowels.join(', ')}`,
    `Values: ${vowelValues.map((v) => `${v.letter}=${v.value}`).join(' + ')}`,
    `Sum: ${sum}`,
  ];

  if (sum !== result) {
    let tempSum = sum;
    while (tempSum > 9 && !MASTER_NUMBERS.includes(tempSum)) {
      const digits = String(tempSum).split('');
      const newSum = digits.reduce((acc, d) => acc + parseInt(d), 0);
      steps.push(`Reduce: ${digits.join(' + ')} = ${newSum}`);
      tempSum = newSum;
    }
  }

  steps.push(`Soul Urge Number: ${result}`);

  return {
    result,
    steps,
    breakdown: vowelValues.map((v) => `${v.letter}=${v.value}`).join(', '),
  };
}

export function calculateExpression(fullName: string): CalculationResult {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');

  if (cleanName.length === 0) {
    return { result: 0, steps: ['No letters found in name'], breakdown: '' };
  }

  const letterValues = cleanName
    .split('')
    .map((l) => ({ letter: l, value: PYTHAGOREAN[l] }));
  const sum = letterValues.reduce((acc, l) => acc + l.value, 0);
  const result = reduceToDigit(sum);

  const steps: string[] = [
    `Full name: ${fullName}`,
    `All letters: ${cleanName.split('').join(', ')}`,
    `Values: ${letterValues.map((l) => `${l.letter}=${l.value}`).join(' + ')}`,
    `Sum: ${sum}`,
  ];

  if (sum !== result) {
    let tempSum = sum;
    while (tempSum > 9 && !MASTER_NUMBERS.includes(tempSum)) {
      const digits = String(tempSum).split('');
      const newSum = digits.reduce((acc, d) => acc + parseInt(d), 0);
      steps.push(`Reduce: ${digits.join(' + ')} = ${newSum}`);
      tempSum = newSum;
    }
  }

  steps.push(`Expression Number: ${result}`);

  return {
    result,
    steps,
    breakdown: letterValues.map((l) => `${l.letter}=${l.value}`).join(', '),
  };
}

export function calculateLifePath(birthDate: Date | string): CalculationResult {
  let date: Date;

  if (typeof birthDate === 'string') {
    date = new Date(birthDate);
  } else {
    date = birthDate;
  }

  if (isNaN(date.getTime())) {
    return { result: 0, steps: ['Invalid date provided'], breakdown: '' };
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const monthReduced = reduceToDigit(month, true);
  const dayReduced = reduceToDigit(day, true);
  const yearReduced = reduceToDigit(
    String(year)
      .split('')
      .reduce((acc, d) => acc + parseInt(d), 0),
    true,
  );

  const sum = monthReduced + dayReduced + yearReduced;
  const result = reduceToDigit(sum);

  const steps: string[] = [
    `Birth date: ${month}/${day}/${year}`,
    `Month: ${month} → ${monthReduced}`,
    `Day: ${day} → ${dayReduced}`,
    `Year: ${year} → ${String(year).split('').join(' + ')} = ${String(year)
      .split('')
      .reduce((acc, d) => acc + parseInt(d), 0)} → ${yearReduced}`,
    `Sum: ${monthReduced} + ${dayReduced} + ${yearReduced} = ${sum}`,
  ];

  if (sum !== result) {
    let tempSum = sum;
    while (tempSum > 9 && !MASTER_NUMBERS.includes(tempSum)) {
      const digits = String(tempSum).split('');
      const newSum = digits.reduce((acc, d) => acc + parseInt(d), 0);
      steps.push(`Reduce: ${digits.join(' + ')} = ${newSum}`);
      tempSum = newSum;
    }
  }

  steps.push(`Life Path Number: ${result}`);

  return {
    result,
    steps,
    breakdown: `${monthReduced} + ${dayReduced} + ${yearReduced}`,
  };
}

export function calculatePersonalYear(
  birthDate: Date | string,
  targetYear?: number,
): CalculationResult {
  let date: Date;

  if (typeof birthDate === 'string') {
    date = new Date(birthDate);
  } else {
    date = birthDate;
  }

  if (isNaN(date.getTime())) {
    return { result: 0, steps: ['Invalid date provided'], breakdown: '' };
  }

  const year = targetYear || new Date().getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const monthReduced = reduceToDigit(month, false);
  const dayReduced = reduceToDigit(day, false);
  const yearReduced = reduceToDigit(
    String(year)
      .split('')
      .reduce((acc, d) => acc + parseInt(d), 0),
    false,
  );

  const sum = monthReduced + dayReduced + yearReduced;
  const result = reduceToDigit(sum, false);

  const steps: string[] = [
    `Birth month/day: ${month}/${day}`,
    `Target year: ${year}`,
    `Month: ${month} → ${monthReduced}`,
    `Day: ${day} → ${dayReduced}`,
    `Year: ${year} → ${yearReduced}`,
    `Sum: ${monthReduced} + ${dayReduced} + ${yearReduced} = ${sum}`,
  ];

  if (sum !== result) {
    let tempSum = sum;
    while (tempSum > 9) {
      const digits = String(tempSum).split('');
      const newSum = digits.reduce((acc, d) => acc + parseInt(d), 0);
      steps.push(`Reduce: ${digits.join(' + ')} = ${newSum}`);
      tempSum = newSum;
    }
  }

  steps.push(`Personal Year Number: ${result}`);

  return {
    result,
    steps,
    breakdown: `${monthReduced} + ${dayReduced} + ${yearReduced}`,
  };
}

export function getNumberMeaning(
  type: 'soul-urge' | 'expression' | 'life-path',
  number: number,
): string {
  const meanings: Record<string, Record<number, string>> = {
    'soul-urge': {
      1: 'Independence, leadership, and originality',
      2: 'Harmony, partnership, and emotional connection',
      3: 'Creative expression, joy, and communication',
      4: 'Security, stability, and building foundations',
      5: 'Freedom, adventure, and experiencing life fully',
      6: 'Love, family, nurturing, and responsibility',
      7: 'Wisdom, spirituality, and inner knowledge',
      8: 'Success, power, and material achievement',
      9: 'Humanitarianism, compassion, and service',
      11: 'Spiritual enlightenment and inspiration',
      22: 'Master building and manifesting grand visions',
      33: 'Master healing and universal love',
    },
    expression: {
      1: 'Pioneer, leader, and innovator',
      2: 'Diplomat, mediator, and peacemaker',
      3: 'Communicator, artist, and entertainer',
      4: 'Builder, organizer, and system creator',
      5: 'Freedom seeker, adventurer, and change agent',
      6: 'Nurturer, healer, and responsible caretaker',
      7: 'Seeker, analyst, and spiritual teacher',
      8: 'Achiever, executive, and material master',
      9: 'Humanitarian, visionary, and global thinker',
      11: 'Intuitive messenger and spiritual leader',
      22: 'Master builder and visionary architect',
      33: 'Master teacher and spiritual healer',
    },
    'life-path': {
      1: 'The Leader - independence, innovation, new beginnings',
      2: 'The Diplomat - cooperation, balance, relationships',
      3: 'The Communicator - creativity, self-expression, joy',
      4: 'The Builder - stability, hard work, foundations',
      5: 'The Freedom Seeker - change, adventure, versatility',
      6: 'The Nurturer - responsibility, love, domestic harmony',
      7: 'The Seeker - spirituality, introspection, wisdom',
      8: 'The Powerhouse - ambition, success, material mastery',
      9: 'The Humanitarian - compassion, completion, service',
      11: 'The Intuitive - spiritual insight, inspiration, vision',
      22: 'The Master Builder - turning dreams into reality',
      33: 'The Master Teacher - healing through love and wisdom',
    },
  };

  return meanings[type]?.[number] || 'Explore your unique energy';
}

export const VOWEL_VALUES = {
  A: 1,
  E: 5,
  I: 9,
  O: 6,
  U: 3,
};

export const PYTHAGOREAN_CHART = PYTHAGOREAN;
