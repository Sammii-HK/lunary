import { Metadata } from 'next';
import { ComparisonData } from './ComparisonPageTemplate';

export function createComparisonMetadata(data: ComparisonData): Metadata {
  const { competitorName, competitorSlug, tagline } = data;
  const url = `https://lunary.app/comparison/${competitorSlug}`;

  return {
    title: tagline,
    description: `Compare Lunary vs ${competitorName}. ${data.subtitle}`,
    openGraph: {
      title: tagline,
      description: `Compare Lunary vs ${competitorName}. See which app offers better personalized astrological guidance.`,
      url,
      siteName: 'Lunary',
    },
    alternates: {
      canonical: url,
    },
  };
}
