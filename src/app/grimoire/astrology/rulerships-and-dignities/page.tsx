import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';
import {
  getPillarContent,
  getPlanetDignityRows,
} from '@/lib/grimoire/pillar-content';

export const revalidate = 2592000;

const content = getPillarContent().rulershipsAndDignities;

export const metadata = createGrimoireMetadata({
  title: `${content.title} | Lunary`,
  description: content.description,
  keywords: [
    'astrological rulerships',
    'planetary dignities',
    'domicile astrology',
    'exaltation astrology',
    'detriment astrology',
    'fall astrology',
  ],
  url: 'https://lunary.app/grimoire/astrology/rulerships-and-dignities',
  ogImagePath: '/api/og/grimoire/astronomy',
  ogImageAlt: 'Rulerships and dignities in astrology',
});

export default function RulershipsAndDignitiesPage() {
  return (
    <SEOContentTemplate
      title={content.title}
      h1={content.h1}
      description={content.description}
      keywords={[
        'astrological rulerships',
        'planetary dignities',
        'domicile',
        'exaltation',
        'detriment',
        'fall',
      ]}
      canonicalUrl='https://lunary.app/grimoire/astrology/rulerships-and-dignities'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Astrology', href: '/grimoire/astrology' },
        { label: 'Rulerships and Dignities' },
      ]}
      whatIs={{
        question: content.whatIsQuestion,
        answer: content.whatIsAnswer,
      }}
      tldr={content.tldr}
      intro={content.intro}
      meaning={content.meaning}
      howToWorkWith={content.howToWorkWith}
      faqs={content.faqs}
      tableOfContents={[
        { label: 'What this doctrine does', href: '#what-is' },
        { label: 'How to judge planetary condition', href: '#meaning' },
        {
          label: 'Planet-by-planet dignity table',
          href: '#practices-overview',
        },
        { label: 'Frequently asked questions', href: '#faq' },
      ]}
      tables={[
        {
          title: 'Planetary Dignities',
          headers: ['Planet', 'Domicile', 'Exaltation', 'Detriment', 'Fall'],
          rows: getPlanetDignityRows(),
        },
      ]}
      internalLinks={[
        { text: 'Planets', href: '/grimoire/astronomy/planets' },
        { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
        {
          text: 'Learn to Read Your Birth Chart',
          href: '/grimoire/guides/learn-birth-chart',
        },
      ]}
      sources={[
        {
          name: 'Lunary chart-reading methodology',
          url: 'https://lunary.app/about/methodology',
        },
        { name: 'Traditional rulership and dignity doctrine' },
      ]}
      ctaText='See these patterns in your chart'
      ctaHref='/birth-chart'
    />
  );
}
