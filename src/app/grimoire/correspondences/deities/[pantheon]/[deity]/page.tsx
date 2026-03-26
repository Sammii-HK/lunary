import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../../../utils/string';

// 30-day ISR revalidation
export const revalidate = 2592000;
const pantheonKeys = Object.keys(correspondencesData.deities);

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pantheon: string; deity: string }>;
}): Promise<Metadata> {
  const { pantheon, deity } = await params;
  const pantheonKey = pantheonKeys.find(
    (p) => stringToKebabCase(p) === pantheon.toLowerCase(),
  );

  if (!pantheonKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const pantheonData =
    correspondencesData.deities[
      pantheonKey as keyof typeof correspondencesData.deities
    ];
  const deityKey = Object.keys(pantheonData).find(
    (d) => stringToKebabCase(d) === deity.toLowerCase(),
  );

  if (!deityKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const deityData = pantheonData[deityKey as keyof typeof pantheonData] as {
    domain: string[];
  };
  const title = `${deityKey}: ${pantheonKey} Deity Correspondences - Lunary`;
  const description = `Discover the complete magical correspondences for ${deityKey}, the ${pantheonKey.toLowerCase()} deity. Learn about ${deityKey}'s domain, how to honor ${deityKey.toLowerCase()}, and work with ${deityKey.toLowerCase()} energy in your practice.`;

  return {
    title,
    description,
    keywords: [
      `${deityKey}`,
      `${pantheonKey.toLowerCase()} deity`,
      `${deityKey.toLowerCase()} correspondences`,
      `${pantheonKey.toLowerCase()} god`,
      `${deityKey.toLowerCase()} worship`,
    ],
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/correspondences/deities/${pantheon}/${deity}`,
    },
  };
}

export default async function DeityPage({
  params,
}: {
  params: Promise<{ pantheon: string; deity: string }>;
}) {
  const { pantheon, deity } = await params;
  const pantheonKey = pantheonKeys.find(
    (p) => stringToKebabCase(p) === pantheon.toLowerCase(),
  );

  if (!pantheonKey) {
    notFound();
  }

  const pantheonData =
    correspondencesData.deities[
      pantheonKey as keyof typeof correspondencesData.deities
    ];
  const deityKey = Object.keys(pantheonData).find(
    (d) => stringToKebabCase(d) === deity.toLowerCase(),
  );

  if (!deityKey) {
    notFound();
  }

  const deityData = pantheonData[deityKey as keyof typeof pantheonData] as {
    domain: string[];
  };

  const meaning = `${deityKey} is a powerful ${pantheonKey.toLowerCase()} deity associated with ${deityData.domain.join(', ')}. Working with ${deityKey.toLowerCase()} brings divine energy and guidance to your practice, especially in areas related to ${deityData.domain.join(', ')}.

When honoring ${deityKey.toLowerCase()}, consider their domain and correspondences. ${deityKey} can be called upon for ${deityData.domain.join(', ')} work, bringing divine support and ancient wisdom to your rituals and spellwork.

Understanding ${deityKey.toLowerCase()}'s correspondences helps you honor this deity respectfully and effectively. Whether you're working with ${pantheonKey.toLowerCase()} pantheon, seeking guidance, or calling upon divine assistance, ${deityKey.toLowerCase()} brings their unique energy and domain to your practice.`;

  const howToWorkWith = [
    `Honor ${deityKey.toLowerCase()} in ${deityData.domain[0]}-themed rituals`,
    `Create altars dedicated to ${deityKey.toLowerCase()}`,
    `Offer appropriate items based on ${deityKey.toLowerCase()}'s domain`,
    `Call upon ${deityKey.toLowerCase()} for ${deityData.domain.join(' and ')} work`,
    `Study ${pantheonKey.toLowerCase()} mythology and ${deityKey.toLowerCase()}'s stories`,
    `Work with ${deityKey.toLowerCase()} during appropriate times`,
    `Respect ${pantheonKey.toLowerCase()} traditions and practices`,
    `Build relationship with ${deityKey.toLowerCase()} through regular practice`,
  ];

  const faqs = [
    {
      question: `What is ${deityKey}'s domain?`,
      answer: `${deityKey} is associated with ${deityData.domain.join(', ')}. This deity can be called upon for guidance and support in these areas of life and magical work.`,
    },
    {
      question: `How do I honor ${deityKey.toLowerCase()}?`,
      answer: `Honor ${deityKey.toLowerCase()} by creating dedicated altars, offering appropriate items based on their domain, studying ${pantheonKey.toLowerCase()} mythology, and calling upon ${deityKey.toLowerCase()} respectfully in ritual. Always research and respect the traditions associated with ${pantheonKey.toLowerCase()} deities.`,
    },
    {
      question: `Do I need to worship ${deityKey.toLowerCase()}?`,
      answer: `No. You can work with ${deityKey.toLowerCase()} respectfully without full worship. Some practitioners honor deities, others work with them as archetypes or energies. Choose what aligns with your practice and beliefs.`,
    },
  ];

  return (
    <SEOContentTemplate
      title={`${deityKey}: ${pantheonKey} Deity Correspondences - Lunary`}
      h1={`${deityKey}`}
      description={`Discover the complete magical correspondences for ${deityKey}, the ${pantheonKey.toLowerCase()} deity. Learn about ${deityKey}'s domain and how to work with ${deityKey.toLowerCase()} energy.`}
      keywords={[
        `${deityKey}`,
        `${pantheonKey.toLowerCase()} deity`,
        `${deityKey.toLowerCase()} correspondences`,
        `${pantheonKey.toLowerCase()} god`,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/correspondences/deities/${pantheon}/${deity}`}
      intro={`${deityKey} is a powerful ${pantheonKey.toLowerCase()} deity associated with ${deityData.domain.join(', ')}. Understanding ${deityKey.toLowerCase()}'s correspondences helps you honor this deity respectfully and work with their energy effectively.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      faqs={faqs}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        {
          label: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
        {
          label: `${pantheonKey} Deities`,
          href: `/grimoire/correspondences/deities/${pantheon}`,
        },
        {
          label: `${deityKey}`,
          href: `/grimoire/correspondences/deities/${pantheon}/${deity}`,
        },
      ]}
      internalLinks={[
        {
          text: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { text: 'Spells & Rituals', href: '/grimoire/spells' },
        { text: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
      ]}
      tables={[
        {
          title: `${deityKey} Correspondences`,
          headers: ['Category', 'Details'],
          rows: [['Domain', deityData.domain.join(', ')]],
        },
      ]}
    />
  );
}
