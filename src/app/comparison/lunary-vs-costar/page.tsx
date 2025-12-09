import { Metadata } from 'next';
import {
  ComparisonPageTemplate,
  createComparisonMetadata,
} from '@/components/comparison';
import { getComparisonData } from '@/constants/comparison-data';

const data = getComparisonData('lunary-vs-costar')!;

export const metadata: Metadata = createComparisonMetadata(data);

export default function LunaryVsCoStarPage() {
  return <ComparisonPageTemplate data={data} />;
}
