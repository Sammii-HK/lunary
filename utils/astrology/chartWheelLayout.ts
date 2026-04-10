import type {
  BirthChartData,
  HouseCusp,
} from '../../utils/astrology/birthChart';
import { ZODIAC_SIGNS } from '@/constants/symbols';
import {
  convertLongitudeToZodiacSystem,
  getLongitudeInTropicalSign,
  type ZodiacSystem,
} from './zodiacSystems';
import type { HouseSystem } from './houseSystems';

export function buildChartWheelLayout(args: {
  birthChart: BirthChartData[];
  houses?: HouseCusp[];
  zodiacSystem?: ZodiacSystem;
  houseSystem?: HouseSystem;
}) {
  const { birthChart, houses, zodiacSystem = 'tropical', houseSystem } = args;

  const ascendant = birthChart.find((p) => p.body === 'Ascendant');
  const tropicalAscendantAngle = ascendant ? ascendant.eclipticLongitude : 0;
  const displayAscendantAngle = ascendant
    ? convertLongitudeToZodiacSystem(
        ascendant.eclipticLongitude,
        0,
        zodiacSystem,
      )
    : 0;

  const chartData = birthChart.map((planet) => {
    const displayLongitude = convertLongitudeToZodiacSystem(
      planet.eclipticLongitude,
      0,
      zodiacSystem,
    );
    const displaySignData = getLongitudeInTropicalSign(displayLongitude);
    const adjustedLong = (displayLongitude - displayAscendantAngle + 360) % 360;
    const angle = (180 + adjustedLong) % 360;
    const radian = (angle * Math.PI) / 180;

    const radius = 65;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;

    return {
      ...planet,
      sign: displaySignData.sign,
      degree: Math.floor(displaySignData.degreeInSign),
      minute: Math.round((displaySignData.degreeInSign % 1) * 60),
      eclipticLongitude: displayLongitude,
      adjustedLong,
      angle,
      x,
      y,
    };
  });

  const zodiacSigns = ZODIAC_SIGNS.map((sign, index) => {
    const signStart = index * 30;
    const signMid = signStart + 15;
    const displayMid = convertLongitudeToZodiacSystem(signMid, 0, zodiacSystem);
    const adjustedMid = (displayMid - displayAscendantAngle + 360) % 360;
    const angle = (180 + adjustedMid) % 360;
    const radian = (angle * Math.PI) / 180;

    const radius = 100;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;

    return { sign, angle, x, y };
  });

  const houseData =
    houseSystem === 'whole-sign'
      ? Array.from({ length: 12 }, (_, i) => {
          const houseLongitude =
            (Math.floor(displayAscendantAngle / 30) * 30 + i * 30) % 360;
          const adjustedLong =
            (houseLongitude - displayAscendantAngle + 360) % 360;
          const angle = (180 + adjustedLong) % 360;
          const radian = (angle * Math.PI) / 180;
          return {
            house: i + 1,
            eclipticLongitude: houseLongitude,
            adjustedLong,
            angle,
            radian,
          };
        })
      : houses && houses.length > 0
        ? houses.map((house) => {
            const adjustedLong =
              (house.eclipticLongitude - tropicalAscendantAngle + 360) % 360;
            const angle = (180 + adjustedLong) % 360;
            const radian = (angle * Math.PI) / 180;
            return { ...house, adjustedLong, angle, radian };
          })
        : Array.from({ length: 12 }, (_, i) => {
            const houseStart = i * 30;
            const adjustedLong = houseStart;
            const angle = (180 + adjustedLong) % 360;
            const radian = (angle * Math.PI) / 180;
            return {
              house: i + 1,
              eclipticLongitude: (tropicalAscendantAngle + houseStart) % 360,
              adjustedLong,
              angle,
              radian,
            };
          });

  return {
    ascendantAngle: displayAscendantAngle,
    chartData,
    zodiacSigns,
    houseData,
  };
}
