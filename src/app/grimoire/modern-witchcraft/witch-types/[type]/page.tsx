import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import type { FAQItem } from '@/components/grimoire/SEOContentTemplate';
import { witchTypes } from '@/constants/witch-types.json';
import { getCosmicConnections } from '@/lib/cosmicConnectionsConfig';

const typeKeys = Object.keys(witchTypes);

function getIntroDefinition(intro: string): string {
  const [firstSentence] = intro.split(/(?<=[.!?])\s+/);
  return firstSentence || intro;
}

export async function generateStaticParams() {
  return typeKeys.map((type) => ({
    type: type,
  }));
}

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
  const title = typeData.seo.title;
  const description = typeData.seo.description;

  return {
    title,
    description,
    keywords: typeData.seo.keywords,
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
      answer: introDefinition,
    },
    {
      question: `What are common ${typeData.name.toLowerCase()} traits?`,
      answer: `Common traits include: ${typeData.traits.join(', ')}.`,
    },
    {
      question: `How do you start as a ${typeData.name.toLowerCase()}?`,
      answer: `Start with these beginner steps: ${typeData.beginnerSteps.join(', ')}.`,
    },
    {
      question: `What tools does a ${typeData.name.toLowerCase()} use?`,
      answer: `Typical tools include: ${typeData.tools.join(', ')}.`,
    },
    {
      question: 'Is this witch type beginner friendly?',
      answer:
        'Yes. You do not need to be “advanced” to begin. Start small, repeat what works, and let your practice grow through consistency rather than intensity.',
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
      intro={pageIntro}
      tldr={pageTldr}
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
