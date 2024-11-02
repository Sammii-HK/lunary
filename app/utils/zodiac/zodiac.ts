export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export type constellationItems = "element" | "quality" | "rulingPlanet" | "symbol";


// U+FE0E unicode as text


export const bodiesSymbols = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
};

export const planetSymbols = {
  ...bodiesSymbols,
  earth: '⊕',
}

export const zodiacSymbol = {
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
};

export const elementUnicode = {
  earth: '🜃',
  fire: '🜂',
  air: '🜁',
  water: '🜄',
};

export const qualityUnicode = {
  cardinal: '🜍',
  fixed: '🜔',
  mutable: '☿',
};
export const getIcon = (type: constellationItems, item: string, constellation: any) => {
  if (type === 'element') {
    return elementUnicode[constellation[type]?.toLowerCase() as keyof typeof elementUnicode];
  }
  if (type === 'rulingPlanet') {
    return planetSymbols[constellation[type]?.toLowerCase() as keyof typeof planetSymbols];
  }
  if (type === 'quality') {
    return qualityUnicode[constellation[type]?.toLowerCase() as keyof typeof qualityUnicode];
  }
  if (type === 'symbol') {
    const constellationName = constellation.name?.toLowerCase();
    return zodiacSymbol[constellationName as keyof typeof zodiacSymbol];
  }
  return item;
};
