'use client'
import { useEffect, useMemo, useState } from "react";
import { Body, GeoVector, Observer, AstroTime, Ecliptic, MoonPhase } from "astronomy-engine";

export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

type Bodies = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto";

function getZodiacSign(longitude: number): string {
  const index = Math.floor((longitude < 0 ? longitude + 360 : longitude) / 30) % 12;
  return ZODIAC_SIGNS[index];
}

function formatDegree(longitude: number): FormattedDegree {
  const degreesInSign = longitude % 30;
  const degree = Math.floor(degreesInSign);
  const minute = Math.floor((degreesInSign - degree) * 60);
  return { degree, minute };
}

type FormattedDegree = {
  degree: number;
  minute: number;
}

export function getMoonPhase(date: Date): string {
  const moonPhase = MoonPhase(date);

  const getPhase = (phase: number): string => {
    if (phase >= 0 && phase < 22.5) return "New Moon";
    if (phase >= 22.5 && phase < 67.5) return "Waxing Crescent";
    if (phase >= 67.5 && phase < 112.5) return "First Quarter";
    if (phase >= 112.5 && phase < 157.5) return "Waxing Gibbous";
    if (phase >= 157.5 && phase < 202.5) return "Full Moon";
    if (phase >= 202.5 && phase < 247.5) return "Waning Gibbous";
    if (phase >= 247.5 && phase < 292.5) return "Last Quarter";
    if (phase >= 292.5 && phase < 337.5) return "Waning Crescent";
    return "New Moon"; // for phase >= 337.5 to 360
  };

  const moonPhaseString = getPhase(moonPhase);
  return moonPhaseString;
}

export function planetaryPositions(date: Date, observer: Observer): { [key: string]: { longitude: number, retrograde: boolean } } {
  const astroTime = new AstroTime(date);
  const astroTimePast = new AstroTime(new Date(date.getTime() - 24 * 60 * 60 * 1000));

  const planets = [
    Body.Sun, Body.Moon, Body.Mercury, Body.Venus, Body.Mars,
    Body.Jupiter, Body.Saturn, Body.Uranus, Body.Neptune, Body.Pluto
  ];

  const positions: { [key: string]: { longitude: number, retrograde: boolean } } = {};

  planets.forEach((body) => {
    const vectorNow = GeoVector(body, astroTime, true);
    const vectorPast = GeoVector(body, astroTimePast, true);

    const eclipticLongitudeNow = Ecliptic(vectorNow).elon;
    const eclipticLongitudePast = Ecliptic(vectorPast).elon;

    const retrograde = eclipticLongitudeNow < eclipticLongitudePast;

    // console.log(body, {
    //   astroTime,
    //   eclipticLongitudeNow,
    //   vectorNow,
    //   equatorial: EquatorFromVector(vectorNow),
    //   retrograde
    // });

    positions[Body[body]] = {
      longitude: eclipticLongitudeNow,
      retrograde
    };
  });

  return positions;
}

export type AstroChartInformation = {
  body: Body;
  formattedDegree: FormattedDegree;
  sign: string;
  retrograde: boolean;
}

export function calculateAstrologicalChart(positions: { [key: string]: { longitude: number, retrograde: boolean } }): AstroChartInformation[] {
  return Object.keys(positions).map(body => {
    const eclipticLongitude = positions[body].longitude;
    const retrograde = positions[body].retrograde;
    const sign = getZodiacSign(eclipticLongitude);
    const formattedDegree = formatDegree(eclipticLongitude);
    return { body: body as Body, formattedDegree, sign, retrograde };
  });
}

export function getObserverLocation(callback: (observer: Observer) => void): void {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const observer: Observer = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        height: 0
      };
      callback(observer);
    }, () => {
      const observer: Observer = { latitude: 51.4769, longitude: 0.0005, height: 0 };
      callback(observer);
    });
  } else {
    const observer: Observer = { latitude: 51.4769, longitude: 0.0005, height: 0 };
    callback(observer);
  }
}

export function useAstrologicalPositions(date: Date): AstroChartInformation[] {
  const [chart, setChart] = useState<AstroChartInformation[]>([]);
  const [observer, setObserver] = useState<Observer | null>(null);

  useEffect(() => {
    if (!observer) {
      getObserverLocation((obs) => setObserver(obs));
    }
  }, [observer]);

  useEffect(() => {
    if (observer) {
      const positions = planetaryPositions(date, observer);
      const astrologicalChart = calculateAstrologicalChart(positions);
      setChart(astrologicalChart);
    }
  }, [date, observer]);

  return useMemo(() => chart, [chart]);
}

export function useCurrentAstrologicalChart(): AstroChartInformation[] {
  const date = useMemo(() => new Date(), []);
  return useAstrologicalPositions(date);
}

export function useAstrologicalChart(date: Date): AstroChartInformation[] {
  return useAstrologicalPositions(date);
}
