import { Metadata } from 'next';
import {
  ComparisonPageTemplate,
  createComparisonMetadata,
} from '@/components/comparison';
import { getComparisonData } from '@/constants/comparison-data';

const data = getComparisonData('lunary-vs-astro-com')!;

export const metadata: Metadata = createComparisonMetadata(data);

export default function LunaryVsAstroComPage() {
  return <ComparisonPageTemplate data={data} />;
}
