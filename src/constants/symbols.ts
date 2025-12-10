import symbolsData from '@/data/symbols.json';

export const ZODIAC_SIGNS = symbolsData.zodiacSigns;
export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const bodiesSymbols = symbolsData.bodies;
export const planetSymbols = symbolsData.bodies;
export const zodiacSymbol = symbolsData.zodiac;
export const zodiacUnicode = symbolsData.unicode;
export const astroPointSymbols = symbolsData.points;
