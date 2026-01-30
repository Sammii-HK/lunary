import { renderJsonLd } from '@/lib/schema';

export interface FAQ {
  question: string;
  answer: string;
}

interface ComparisonPageStructuredDataProps {
  competitorName: string;
  competitorUrl?: string;
  featuresCompared: string[];
  conclusion: string;
  lunaryUrl?: string;
  faqs?: FAQ[];
  breadcrumbs?: Array<{ label: string; href: string }>;
}

export function ComparisonPageStructuredData({
  competitorName,
  competitorUrl,
  featuresCompared,
  conclusion,
  lunaryUrl = 'https://lunary.app',
  faqs = [],
  breadcrumbs = [],
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

  // FAQ Schema
  const faqSchema =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  // Breadcrumb Schema
  const breadcrumbSchema =
    breadcrumbs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://lunary.app',
            },
            ...breadcrumbs.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 2,
              name: item.label,
              item: `https://lunary.app${item.href}`,
            })),
          ],
        }
      : null;

  return (
    <>
      {renderJsonLd(comparisonPageSchema)}
      {faqSchema && renderJsonLd(faqSchema)}
      {breadcrumbSchema && renderJsonLd(breadcrumbSchema)}
    </>
  );
}
