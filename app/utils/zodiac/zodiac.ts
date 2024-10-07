"use client"

import { HelioVector, Body, Vector } from 'astronomy-engine';

export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export type constellationItems = "element" | "quality" | "rulingPlanet" | "symbol";


// U+FE0E unicode as text


export const planetSymbol = {
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

let constellation: any


export const getIcon = (type: constellationItems, item: string, constellation: any) => {
  if (type === 'element') {
    return elementUnicode[constellation[type].toLowerCase() as keyof typeof elementUnicode];
  }
  if (type === 'rulingPlanet') {
    return planetSymbol[constellation[type].toLowerCase() as keyof typeof planetSymbol];
  }
  if (type === 'quality') {
    return qualityUnicode[constellation[type].toLowerCase() as keyof typeof qualityUnicode];
  }
  if (type === 'symbol') {
    const constellationName = constellation.name.toLowerCase();
    return zodiacSymbol[constellationName as keyof typeof zodiacSymbol];
  }
  return item;
};

function getZodiacSign(degree: number) {
  const index = Math.floor(degree / 30) % 12;
  return ZODIAC_SIGNS[index];
}

const todaysDate = new Date();

const planetaryPositions = (date: Date)  => {
  return {
    Sun: HelioVector(Body.Sun, date),
    Moon: HelioVector(Body.Moon, date),
    Mercury: HelioVector(Body.Mercury, date),
    Venus: HelioVector(Body.Venus, date),
    Mars: HelioVector(Body.Mars, date),
    Jupiter: HelioVector(Body.Jupiter, date),
    Saturn: HelioVector(Body.Saturn, date),
    Uranus: HelioVector(Body.Uranus, date),
    Neptune: HelioVector(Body.Neptune, date),
    Pluto: HelioVector(Body.Pluto, date),
  };
};

export const calculateAstrologicalChart = (positions: { [key: string]: Vector}) => {
  const bodies = Object.keys(positions);

  return bodies.map((body) => heliovectorToZodiacDegrees(positions[body], body));
}

export const getCurrentAstrologicalChart = () => {
  return calculateAstrologicalChart(planetaryPositions(todaysDate));
}

function heliovectorToZodiacDegrees(heliovector: Vector, body: string) {
  const { x, y, z } = heliovector;

  // Calculate ecliptic longitude in radians
  let lambda = Math.atan2(y, x);

  if (lambda < 0) {
    lambda += 2 * Math.PI;
  }

  lambda = lambda * (180 / Math.PI);


  const zodiacDegree = lambda % 360;
  const zodiacSign = getZodiacSign(zodiacDegree);

  return {
    degree: zodiacDegree.toFixed(0),
    sign: zodiacSign,
    body,
  };
}

// function getLocation() {
//   navigator.geolocation.getCurrentPosition(function(location) {
//     console.log(location.coords.latitude);
//     console.log(location.coords.longitude);
//     console.log(location.coords.accuracy);
//   });
//   return navigator.geolocation
// }