import { Metadata } from 'next';
import {
  ComparisonPageTemplate,
  createComparisonMetadata,
} from '@/components/comparison';
import { getComparisonData } from '@/constants/comparison-data';

const data = getComparisonData('lunary-vs-timepassages')!;

export const metadata: Metadata = createComparisonMetadata(data);

export default function LunaryVsTimePassagesPage() {
  return <ComparisonPageTemplate data={data} />;
}
