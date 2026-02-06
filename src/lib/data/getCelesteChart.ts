import { BirthChartData } from '../../../utils/astrology/birthChart';
import celesteChartData from './celeste-chart.json';

export type CelesteChartResult = {
  birthChart: BirthChartData[];
  name: string;
};

export function getCelesteChart(): CelesteChartResult | null {
  const birthChart = celesteChartData as BirthChartData[];

  if (!birthChart || birthChart.length === 0) {
    return null;
  }

  return {
    birthChart,
    name: 'Celeste',
  };
}
