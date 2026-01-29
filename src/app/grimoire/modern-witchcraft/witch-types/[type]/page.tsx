import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import type { FAQItem } from '@/components/grimoire/SEOContentTemplate';
import witchTypesData from '@/constants/witch-types.json';
import { getCosmicConnections } from '@/lib/cosmicConnectionsConfig';

// 30-day ISR revalidation
export const revalidate = 2592000;
const witchTypes = witchTypesData.witchTypes || {};
const typeKeys = Object.keys(witchTypes);

function getIntroDefinition(intro: string): string {
  const [firstSentence] = intro.split(/(?<=[.!?])\s+/);
  return firstSentence || intro;
}

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const typeData = witchTypes[type as keyof typeof witchTypes];

  if (!typeData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${typeData.name}: Meaning, Traits, Practices and Tools`;
  const description = `Are you a ${typeData.name.toLowerCase()}? Discover the path of ${typeData.name.toLowerCase()} witchcraft: working with ${typeData.focuses[0].toLowerCase()}. Complete guide to ${typeData.name.toLowerCase()} practices, rituals & philosophy.`;

  return {
    title,
    description,
    keywords: [
      ...typeData.seo.keywords,
      `${typeData.name.toLowerCase()} witch`,
      `${typeData.name.toLowerCase()} practices`,
      `how to be a ${typeData.name.toLowerCase()}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/modern-witchcraft/witch-types/${type}`,
      siteName: 'Lunary',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/modern-witchcraft/witch-types/${type}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function WitchTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const typeData = witchTypes[type as keyof typeof witchTypes];

  if (!typeData) {
    notFound();
  }

  const pageTitle = typeData.seo.title;
  const pageH1 = typeData.seo.h1;
  const pageDescription = typeData.seo.description;
  const pageIntro = typeData.seo.intro;
  const pageTldr = typeData.seo.tldr;
  const pageKeywords = typeData.seo.keywords;

  const introDefinition = getIntroDefinition(typeData.seo.intro);
  const pageFaqList: FAQItem[] = [
    {
      question: `What is a ${typeData.name.toLowerCase()}?`,
      answer: `A ${typeData.name.toLowerCase()} is a witch who focuses on ${typeData.focuses[0].toLowerCase()}. This path centers on ${typeData.focuses.slice(0, 2).join(' and ').toLowerCase()}, working with ${typeData.element.toLowerCase()} element energy. ${introDefinition}`,
    },
    {
      question: `What are common ${typeData.name.toLowerCase()} traits?`,
      answer: `Common ${typeData.name.toLowerCase()} traits include ${typeData.traits.slice(0, 3).join(', ').toLowerCase()}. These witches typically resonate with ${typeData.element.toLowerCase()} element and express their practice through ${typeData.practices[0].toLowerCase()}.`,
    },
    {
      question: `How do you become a ${typeData.name.toLowerCase()}?`,
      answer: `To become a ${typeData.name.toLowerCase()}, start by ${typeData.beginnerSteps[0].toLowerCase()}. Then ${typeData.beginnerSteps[1].toLowerCase()}. Focus on ${typeData.focuses[0].toLowerCase()} and work with tools like ${typeData.tools.slice(0, 2).join(' and ')}. Begin small and build consistency.`,
    },
    {
      question: `What tools does a ${typeData.name.toLowerCase()} use?`,
      answer: `${typeData.name} witches commonly use ${typeData.tools.join(', ')}. These tools help work with ${typeData.element.toLowerCase()} element energy and support practices focused on ${typeData.focuses[0].toLowerCase()}.`,
    },
    {
      question: `Is ${typeData.name.toLowerCase()} witchcraft beginner friendly?`,
      answer: `Yes, ${typeData.name.toLowerCase()} witchcraft is beginner friendly. You don't need experience to start. Begin with ${typeData.beginnerSteps[0].toLowerCase()}, then gradually explore ${typeData.practices[0].toLowerCase()}. Consistency matters more than intensity in this path.`,
    },
  ];
  const pageInternalLinks = [
    {
      text: 'Witch Types Hub',
      href: '/grimoire/modern-witchcraft/witch-types',
    },
    { text: 'Modern Witchcraft Guide', href: '/grimoire/modern-witchcraft' },
    {
      text: 'Witchcraft Tools',
      href: '/grimoire/modern-witchcraft/tools-guide',
    },
    { text: 'Spellcraft Fundamentals', href: '/grimoire/spells/fundamentals' },
    { text: 'Grimoire Home', href: '/grimoire' },
  ];
  const internalLinksTitle = 'Explore more in the Grimoire';

  return (
    <SEOContentTemplate
      title={pageTitle}
      h1={pageH1}
      description={pageDescription}
      keywords={pageKeywords}
      canonicalUrl={`https://lunary.app/grimoire/modern-witchcraft/witch-types/${type}`}
      whatIs={{
        question: `What is a ${typeData.name.toLowerCase()}?`,
        answer: `A ${typeData.name.toLowerCase()} is a witch who works primarily with ${typeData.focuses[0].toLowerCase()}. This path focuses on ${typeData.focuses.slice(0, 2).join(' and ').toLowerCase()}, using tools like ${typeData.tools.slice(0, 3).join(', ')}. ${typeData.name} witchcraft embraces ${typeData.element.toLowerCase()} element energy and practices such as ${typeData.practices.slice(0, 2).join(' and ').toLowerCase()}.`,
      }}
      intro={pageIntro}
      tldr={`${typeData.name}: Work with ${typeData.focuses[0].toLowerCase()}. Element: ${typeData.element}. Key practices: ${typeData.practices.slice(0, 2).join(', ').toLowerCase()}. Tools: ${typeData.tools.slice(0, 3).join(', ')}.`}
      meaning={`In modern witchcraft, “witch types” are simply ways to describe what your practice naturally centres on. They are not ranks, rules, or exclusive boxes. Many people blend paths, or shift over time.

${typeData.seo.intro}

## What a ${typeData.name} focuses on
${typeData.focuses.map((f) => `- ${f}`).join('\n')}

## Common ${typeData.name.toLowerCase()} traits
${typeData.traits.map((t) => `- ${t}`).join('\n')}

## Typical practices
${typeData.practices.map((p) => `- ${p}`).join('\n')}

## Tools you might love
${typeData.tools.map((t) => `- ${t}`).join('\n')}

## Strengths of this path
${typeData.strengths.map((s) => `- ${s}`).join('\n')}

## Beginner steps
${typeData.beginnerSteps.map((s) => `- ${s}`).join('\n')}

## Starter ritual
**${typeData.starterRitual.title}**
${typeData.starterRitual.steps.map((s) => `- ${s}`).join('\n')}

## Common misconceptions
${typeData.misconceptions.map((m) => `- ${m}`).join('\n')}

## Safety note
${typeData.safetyNote}

If you feel drawn to this path, start small and repeat what feels good. In witchcraft, consistency is often more powerful than intensity.`}
      emotionalThemes={typeData.focuses}
      howToWorkWith={[
        `Explore ${typeData.focuses[0].toLowerCase()} practices`,
        `Gather ${typeData.name.toLowerCase()} tools`,
        `Study ${typeData.element} element correspondences`,
        'Connect with like-minded practitioners',
        'Trust your intuitive path',
      ]}
      tables={[
        {
          title: `${typeData.name} Overview`,
          headers: ['Aspect', 'Details'],
          rows: [
            ['Focuses', typeData.focuses.join(', ')],
            ['Element', typeData.element],
            ['Tools', typeData.tools.join(', ')],
            ['Strengths', typeData.strengths.join(', ')],
          ],
        },
      ]}
      journalPrompts={[
        `What draws me to the ${typeData.name} path?`,
        `How can I incorporate ${typeData.focuses[0].toLowerCase()} into my practice?`,
        `What ${typeData.name.toLowerCase()} tools do I want to work with?`,
        'How does this path align with my spiritual goals?',
      ]}
      relatedItems={[
        {
          name: 'Modern Witchcraft',
          href: '/grimoire/modern-witchcraft',
          type: 'Guide',
        },
        {
          name: 'Witchcraft Tools',
          href: '/grimoire/modern-witchcraft/tools-guide',
          type: 'Guide',
        },
        {
          name: 'Spellcraft',
          href: '/grimoire/spells/fundamentals',
          type: 'Practice',
        },
      ]}
      cosmicConnections={
        <CosmicConnections
          entityType='witchcraft'
          entityKey={type}
          title='Witchcraft Connections'
          sections={getCosmicConnections('witchcraft', type)}
        />
      }
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
        {
          label: 'Witch Types',
          href: '/grimoire/modern-witchcraft/witch-types',
        },
        {
          label: typeData.name,
          href: `/grimoire/modern-witchcraft/witch-types/${type}`,
        },
      ]}
      internalLinks={pageInternalLinks}
      internalLinksTitle={internalLinksTitle}
      ctaText='Explore your witchcraft path'
      ctaHref='/grimoire/modern-witchcraft'
      faqs={pageFaqList}
    />
  );
}
