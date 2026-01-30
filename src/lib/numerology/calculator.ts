// Numerology Calculation Functions
// Pure calculation logic - meanings come from /src/data/numerology.json

/**
 * Calculate Life Path number from birth date
 * Reduces birth date to single digit (1-9) or master number (11, 22, 33)
 */
export function calculateLifePathNumber(birthDate: Date): number {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1; // getMonth() is 0-indexed
  const day = birthDate.getDate();

  // Reduce each component
  const reducedYear = reduceToSingleDigit(year, true);
  const reducedMonth = reduceToSingleDigit(month, true);
  const reducedDay = reduceToSingleDigit(day, true);

  // Sum and reduce final
  const sum = reducedYear + reducedMonth + reducedDay;
  return reduceToSingleDigit(sum, true);
}

/**
 * Calculate Personal Year number
 * (Birth Month + Birth Day + Current Year) reduced
 */
export function calculatePersonalYear(
  birthDate: Date,
  currentYear: number,
): number {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  const sum = month + day + currentYear;
  return reduceToSingleDigit(sum, false); // Personal year doesn't use master numbers
}

/**
 * Calculate Personal Month number
 * (Personal Year + Current Month) reduced
 */
export function calculatePersonalMonth(
  personalYear: number,
  currentMonth: number,
): number {
  const sum = personalYear + currentMonth;
  return reduceToSingleDigit(sum, false);
}

/**
 * Calculate Personal Day number
 * (Personal Year + Personal Month + Current Day) reduced
 */
export function calculatePersonalDay(
  personalYear: number,
  currentMonth: number,
  currentDay: number,
): number {
  const personalMonth = calculatePersonalMonth(personalYear, currentMonth);
  const sum = personalMonth + currentDay;
  return reduceToSingleDigit(sum, false);
}

/**
 * Calculate Expression/Destiny Number from full name
 * Each letter has a numerical value (A=1, B=2, ... Z=26, then reduced)
 */
export function calculateExpressionNumber(fullName: string): number {
  const letterValues: { [key: string]: number } = {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: 5,
    f: 6,
    g: 7,
    h: 8,
    i: 9,
    j: 1,
    k: 2,
    l: 3,
    m: 4,
    n: 5,
    o: 6,
    p: 7,
    q: 8,
    r: 9,
    s: 1,
    t: 2,
    u: 3,
    v: 4,
    w: 5,
    x: 6,
    y: 7,
    z: 8,
  };

  const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, '');
  let sum = 0;

  for (const letter of cleanName) {
    sum += letterValues[letter] || 0;
  }

  return reduceToSingleDigit(sum, true);
}

/**
 * Calculate Soul Urge/Heart's Desire Number from vowels in name
 */
export function calculateSoulUrgeNumber(fullName: string): number {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const letterValues: { [key: string]: number } = {
    a: 1,
    e: 5,
    i: 9,
    o: 6,
    u: 3,
  };

  const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, '');
  let sum = 0;

  for (const letter of cleanName) {
    if (vowels.includes(letter)) {
      sum += letterValues[letter] || 0;
    }
  }

  return reduceToSingleDigit(sum, true);
}

/**
 * Calculate Personality Number from consonants in name
 */
export function calculatePersonalityNumber(fullName: string): number {
  const consonantValues: { [key: string]: number } = {
    b: 2,
    c: 3,
    d: 4,
    f: 6,
    g: 7,
    h: 8,
    j: 1,
    k: 2,
    l: 3,
    m: 4,
    n: 5,
    p: 7,
    q: 8,
    r: 9,
    s: 1,
    t: 2,
    v: 4,
    w: 5,
    x: 6,
    y: 7,
    z: 8,
  };

  const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, '');
  let sum = 0;

  for (const letter of cleanName) {
    if (consonantValues[letter]) {
      sum += consonantValues[letter];
    }
  }

  return reduceToSingleDigit(sum, true);
}

/**
 * Helper function to reduce a number to single digit or master number
 * @param num - The number to reduce
 * @param keepMasterNumbers - If true, preserve 11, 22, 33
 */
function reduceToSingleDigit(num: number, keepMasterNumbers: boolean): number {
  while (num > 9) {
    // Check for master numbers
    if (keepMasterNumbers && (num === 11 || num === 22 || num === 33)) {
      return num;
    }

    // Reduce by summing digits
    num = num
      .toString()
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }

  return num;
}

/**
 * Get planetary ruler for a Life Path number
 * Based on traditional numerology-astrology correspondences
 */
export function getPlanetForLifePath(lifePathNumber: number): string {
  const planetMap: { [key: number]: string } = {
    1: 'Sun',
    2: 'Moon',
    3: 'Jupiter',
    4: 'Uranus',
    5: 'Mercury',
    6: 'Venus',
    7: 'Neptune',
    8: 'Saturn',
    9: 'Mars',
    11: 'Uranus', // Master number
    22: 'Saturn', // Master number
    33: 'Neptune', // Master number
  };

  return planetMap[lifePathNumber] || 'Sun';
}

/**
 * Get zodiac sign correspondence for Life Path number
 */
export function getZodiacForLifePath(lifePathNumber: number): string {
  const zodiacMap: { [key: number]: string } = {
    1: 'Aries',
    2: 'Cancer',
    3: 'Sagittarius',
    4: 'Aquarius',
    5: 'Gemini',
    6: 'Taurus',
    7: 'Pisces',
    8: 'Capricorn',
    9: 'Scorpio',
    11: 'Aquarius', // Master number
    22: 'Capricorn', // Master number
    33: 'Pisces', // Master number
  };

  return zodiacMap[lifePathNumber] || 'Aries';
}
