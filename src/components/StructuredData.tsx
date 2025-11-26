export function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lunary',
    description:
      'Astrology app based on real astronomical data. Personalized birth chart analysis, daily insights, and cosmic guidance.',
    url: 'https://lunary.app',
    logo: 'https://lunary.app/logo.png',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@lunary.app',
    },
  };

  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Lunary',
    description:
      'Progressive Web App for personalized astrology insights based on real astronomical calculations.',
    url: 'https://lunary.app',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '4.99',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
    },
    featureList: [
      'Birth chart analysis',
      'Personalized daily horoscopes',
      'Tarot readings',
      'Moon phase tracking',
      'Push notifications',
      'Offline support',
    ],
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://lunary.app',
    name: 'Lunary',
    description:
      'Personalized astrology app based on real astronomical data. Birth chart analysis, daily horoscopes, tarot readings, and cosmic guidance.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://lunary.app/grimoire?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteSchema),
        }}
      />
    </>
  );
}
