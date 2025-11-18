interface ComparisonPageStructuredDataProps {
  competitorName: string;
  competitorUrl?: string;
  featuresCompared: string[];
  conclusion: string;
  lunaryUrl?: string;
}

export function ComparisonPageStructuredData({
  competitorName,
  competitorUrl,
  featuresCompared,
  conclusion,
  lunaryUrl = 'https://lunary.app',
}: ComparisonPageStructuredDataProps) {
  const comparisonPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ComparisonPage',
    name: `Lunary vs ${competitorName}`,
    description: `Comparison between Lunary and ${competitorName} astrology apps`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'SoftwareApplication',
            name: 'Lunary',
            url: lunaryUrl,
            applicationCategory: 'LifestyleApplication',
            operatingSystem: 'Web',
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'SoftwareApplication',
            name: competitorName,
            ...(competitorUrl && { url: competitorUrl }),
            applicationCategory: 'LifestyleApplication',
          },
        },
      ],
    },
    about: {
      '@type': 'Thing',
      name: featuresCompared.join(', '),
    },
    text: conclusion,
  };

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(comparisonPageSchema),
      }}
    />
  );
}
