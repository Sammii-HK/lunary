import { Metadata } from 'next';
import { ComparisonData } from './ComparisonPageTemplate';

export function createComparisonMetadata(data: ComparisonData): Metadata {
  const { competitorName, competitorSlug } = data;
  const url = `https://lunary.app/comparison/${competitorSlug}`;
  const year = new Date().getFullYear();
  const title = `Lunary vs ${competitorName} (${year}): Which Astrology App is Better?`;
  const description = `Compare Lunary vs ${competitorName} in ${year}. Features, accuracy, pricing & user reviews. Find which astrology app is right for you.`;

  return {
    title,
    description,
    keywords: [
      `lunary vs ${competitorName.toLowerCase()}`,
      `${competitorName.toLowerCase()} alternative`,
      `${competitorName.toLowerCase()} vs lunary`,
      `best astrology app ${year}`,
      'astrology app comparison',
    ],
    openGraph: {
      title,
      description,
      url,
      siteName: 'Lunary',
    },
    alternates: {
      canonical: url,
    },
  };
}
