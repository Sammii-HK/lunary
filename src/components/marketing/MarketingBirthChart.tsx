'use client';

import { BirthChart } from '@/components/BirthChart';
import referenceChartData from '@/lib/reference-chart-data.json';

export function MarketingBirthChart() {
  return (
    <BirthChart
      birthChart={referenceChartData.planets}
      houses={referenceChartData.houses}
      userName={referenceChartData.persona.name}
      birthDate={referenceChartData.persona.birthDate}
    />
  );
}
