import type {
  BirthChartData,
  HouseCusp,
} from '../../utils/astrology/birthChart';
import { ZODIAC_SIGNS } from '@/constants/symbols';

export function buildChartWheelLayout(args: {
  birthChart: BirthChartData[];
  houses?: HouseCusp[];
}) {
  const { birthChart, houses } = args;

  const ascendant = birthChart.find((p) => p.body === 'Ascendant');
  const ascendantAngle = ascendant ? ascendant.eclipticLongitude : 0;

  const chartData = birthChart.map((planet) => {
    const adjustedLong =
      (planet.eclipticLongitude - ascendantAngle + 360) % 360;
    const angle = (180 + adjustedLong) % 360;
    const radian = (angle * Math.PI) / 180;

    const radius = 65;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;

    return { ...planet, adjustedLong, angle, x, y };
  });

  const zodiacSigns = ZODIAC_SIGNS.map((sign, index) => {
    const signStart = index * 30;
    const signMid = signStart + 15;
    const adjustedMid = (signMid - ascendantAngle + 360) % 360;
    const angle = (180 + adjustedMid) % 360;
    const radian = (angle * Math.PI) / 180;

    const radius = 100;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;

    return { sign, angle, x, y };
  });

  const houseData =
    houses && houses.length > 0
      ? houses.map((house) => {
          const adjustedLong =
            (house.eclipticLongitude - ascendantAngle + 360) % 360;
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
            eclipticLongitude: (ascendantAngle + houseStart) % 360,
            adjustedLong,
            angle,
            radian,
          };
        });

  return { ascendantAngle, chartData, zodiacSigns, houseData };
}
